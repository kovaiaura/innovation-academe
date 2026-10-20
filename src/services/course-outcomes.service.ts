import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { getAcademicYearDateRange, getDefaultAcademicYear, getDefaultAcademicYearPeriods, normalizeAcademicYear, type AcademicYearPeriodsConfig, type AcademicYearDateRange } from '@/utils/academicYear';
import { emptyMetric, finishMetric, isOutcomeSessionComplete, isWithinOutcomeYear, type OutcomeMetric } from '@/utils/courseOutcomeMetrics';

type Table = keyof Database['public']['Tables'];
type Row<T extends Table> = Database['public']['Tables'][T]['Row'];
// Every read is stable, paginated, and scoped; ID lists are chunked below.
export async function readOutcomeRows<T extends Table>(table: T, configure: (query: any) => any = q => q, columns = '*'): Promise<Row<T>[]> {
  const rows: Row<T>[] = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await configure(supabase.from(table).select(columns)).order('id').range(offset, offset + 999);
    if (error) throw error;
    rows.push(...(data || []));
    if (!data || data.length < 1000) break;
  }
  return rows;
}
// Narrow column lists keep payloads small (course content/courses carry large fields).
const COLS: Partial<Record<Table, string>> = {
  students: 'id,user_id,class_id,institution_id',
  institutions: 'id,settings',
  assessment_attempts: 'id,assessment_id,student_id,institution_id,class_id,status',
  assessments: 'id,start_time',
  course_class_assignments: 'id,class_id,course_id,institution_id',
  class_module_assignments: 'id,class_assignment_id,module_id,unlock_order,is_unlocked',
  class_session_assignments: 'id,class_module_assignment_id,session_id,unlock_order,is_unlocked',
  assessment_questions: 'id,assessment_id,course_id,module_id,session_id',
  assessment_answers: 'id,attempt_id,question_id,is_correct',
  courses: 'id,title',
  course_modules: 'id,title,course_id',
  course_sessions: 'id,title,module_id,course_id',
  course_content: 'id,session_id',
  student_content_completions: 'id,student_id,class_assignment_id,content_id',
  class_session_completions: 'id,student_id,class_assignment_id,session_id',
};
async function byIds<T extends Table>(table: T, column: string, ids: string[], configure: (q: any) => any = q => q) {
  const unique = [...new Set(ids)];
  const chunks: string[][] = [];
  for (let i = 0; i < unique.length; i += 100) chunks.push(unique.slice(i, i + 100));
  const results = await Promise.all(chunks.map(chunk => readOutcomeRows(table, q => configure(q.in(column, chunk)), COLS[table] || '*')));
  return results.flat();
}

export interface OutcomeCourse extends OutcomeMetric { course_id: string; course_title: string; nextSession?: string }
export interface OutcomeModule extends OutcomeMetric { module_id: string; module_title: string; course_id: string }
export interface OutcomeSession extends OutcomeMetric { session_id: string; session_title: string; module_id: string; course_id: string }
export interface CourseOutcomeData {
  courseAccuracies: OutcomeCourse[];
  moduleAccuracies: OutcomeModule[];
  sessionAccuracies: OutcomeSession[];
  strengths: { title: string; accuracy: number; type: string; answers: number }[];
  weaknesses: { title: string; accuracy: number; type: string; answers: number }[];
  studentCount: number;
}
export const emptyOutcomes = (): CourseOutcomeData => ({ courseAccuracies: [], moduleAccuracies: [], sessionAccuracies: [], strengths: [], weaknesses: [], studentCount: 0 });
export interface OutcomeFilters { institutionId?: string; classId?: string; studentId?: string; enabled?: boolean; yearMode?: 'current' | 'previous' }

export async function fetchCourseOutcomes(filters: OutcomeFilters, selectedRange: AcademicYearDateRange) {
  const students = await readOutcomeRows('students', q => {
    if (filters.institutionId) q = q.eq('institution_id', filters.institutionId);
    if (filters.classId) q = q.eq('class_id', filters.classId);
    if (filters.studentId) q = q.eq('user_id', filters.studentId);
    return q;
  }, COLS.students);
  if (!students.length) return emptyOutcomes();
  const institutionIds = [...new Set(students.map(s => s.institution_id))];
  const classIds = students.flatMap(s => s.class_id ? [s.class_id] : []);
  const [assignments, institutions, attempts] = await Promise.all([
    byIds('course_class_assignments', 'class_id', classIds, q => filters.institutionId ? q.eq('institution_id', filters.institutionId) : q),
    byIds('institutions', 'id', institutionIds),
    byIds('assessment_attempts', 'student_id', students.flatMap(s => s.user_id ? [s.user_id] : []), q => {
      q = q.in('status', ['submitted', 'auto_submitted', 'evaluated']);
      if (filters.institutionId) q = q.eq('institution_id', filters.institutionId);
      if (filters.classId) q = q.eq('class_id', filters.classId);
      return q;
    }),
  ]);
  const rangeByInstitution = new Map(institutions.map(inst => {
    if (!filters.yearMode) return [inst.id, selectedRange] as const;
    const settings = inst.settings as { academic_year?: string; academic_year_periods?: AcademicYearPeriodsConfig } | null;
    const year = normalizeAcademicYear(settings?.academic_year || getDefaultAcademicYear());
    const defaults = getDefaultAcademicYearPeriods(year);
    const periods = { current: settings?.academic_year_periods?.current || defaults.current, previous: settings?.academic_year_periods?.previous || defaults.previous };
    return [inst.id, getAcademicYearDateRange(periods[filters.yearMode].academic_year, periods)] as const;
  }));
  const assessments = await byIds('assessments', 'id', attempts.map(a => a.assessment_id));
  const assessmentDates = new Map(assessments.map(a => [a.id, a.start_time]));
  const studentKeys = new Set(students.map(s => `${s.user_id}:${s.institution_id}`));
  const yearAttempts = attempts.filter(a => {
    const date = assessmentDates.get(a.assessment_id);
    const range = rangeByInstitution.get(a.institution_id);
    return date && range && studentKeys.has(`${a.student_id}:${a.institution_id}`) && isWithinOutcomeYear(date, range);
  });
  const [moduleAssignments, questions, answers] = await Promise.all([
    byIds('class_module_assignments', 'class_assignment_id', assignments.map(a => a.id)),
    byIds('assessment_questions', 'assessment_id', yearAttempts.map(a => a.assessment_id), q => q.not('course_id', 'is', null)),
    byIds('assessment_answers', 'attempt_id', yearAttempts.map(a => a.id)),
  ]);
  const sessionAssignments = await byIds('class_session_assignments', 'class_module_assignment_id', moduleAssignments.map(m => m.id));
  const courseIds = [...new Set([...assignments.map(a => a.course_id), ...questions.flatMap(q => q.course_id ? [q.course_id] : [])])];
  const [courses, modules, sessions, content, completions, marked] = await Promise.all([
    byIds('courses', 'id', courseIds),
    byIds('course_modules', 'course_id', courseIds),
    byIds('course_sessions', 'course_id', courseIds),
    byIds('course_content', 'session_id', sessionAssignments.map(s => s.session_id)),
    byIds('student_content_completions', 'class_assignment_id', assignments.map(a => a.id)),
    byIds('class_session_completions', 'class_assignment_id', assignments.map(a => a.id)),
  ]);
  const courseMetrics = new Map(courses.map(c => [c.id, { ...emptyMetric(), course_id: c.id, course_title: c.title } as OutcomeCourse]));
  const moduleMetrics = new Map(modules.map(m => [m.id, { ...emptyMetric(), module_id: m.id, module_title: m.title, course_id: m.course_id }]));
  const sessionMetrics = new Map(sessions.map(s => [s.id, { ...emptyMetric(), session_id: s.id, session_title: s.title, module_id: s.module_id, course_id: s.course_id }]));
  const required = new Map<string, string[]>();
  content.forEach(c => required.set(c.session_id, [...(required.get(c.session_id) || []), c.id]));
  const completedContent = new Map<string, Set<string>>();
  completions.forEach(c => { const key = `${c.student_id}:${c.class_assignment_id}`; const set = completedContent.get(key) || new Set<string>(); set.add(c.content_id); completedContent.set(key, set); });
  const markedSet = new Set(marked.map(m => `${m.student_id}:${m.class_assignment_id}:${m.session_id}`));
  const learners = new Map<OutcomeMetric, Set<string>>();
  const learnerCounts = new Map<OutcomeMetric, Map<string, { total: number; completed: number }>>();
  const addLearning = (metric: OutcomeMetric | undefined, student: string, done: boolean) => {
    if (!metric) return;
    metric.totalSessions++; if (done) metric.completedSessions++;
    const set = learners.get(metric) || new Set<string>(); set.add(student); learners.set(metric, set); metric.studentCount = set.size;
    const counts = learnerCounts.get(metric) || new Map<string, { total: number; completed: number }>();
    const count = counts.get(student) || { total: 0, completed: 0 }; count.total++; if (done) count.completed++;
    counts.set(student, count); learnerCounts.set(metric, counts);
  };
  const group = <V,>(items: V[], key: (v: V) => string) => { const m = new Map<string, V[]>(); items.forEach(v => { const k = key(v); const list = m.get(k); if (list) list.push(v); else m.set(k, [v]); }); return m; };
  const byOrder = (a: { unlock_order: number | null }, b: { unlock_order: number | null }) => (a.unlock_order || 0) - (b.unlock_order || 0);
  const modulesByAssignment = group(moduleAssignments, m => m.class_assignment_id);
  const sessionsByModule = group(sessionAssignments, s => s.class_module_assignment_id);
  sessionsByModule.forEach(list => list.sort(byOrder));
  const studentsByClass = group(students, s => `${s.class_id}:${s.institution_id}`);
  for (const assignment of assignments) {
    const course = courseMetrics.get(assignment.course_id);
    const allocatedModules = [...(modulesByAssignment.get(assignment.id) || [])].sort(byOrder);
    for (const student of studentsByClass.get(`${assignment.class_id}:${assignment.institution_id}`) || []) {
      for (const mod of allocatedModules) {
        const ordered = sessionsByModule.get(mod.id) || [];
        for (const session of ordered) {
          const done = isOutcomeSessionComplete(required.get(session.session_id) || [], completedContent.get(`${student.id}:${assignment.id}`) || new Set(), markedSet.has(`${student.id}:${assignment.id}:${session.session_id}`));
          addLearning(course, student.id, done); addLearning(moduleMetrics.get(mod.module_id), student.id, done); addLearning(sessionMetrics.get(session.session_id), student.id, done);
          if (filters.studentId && course && !course.nextSession && !done && mod.is_unlocked !== false && session.is_unlocked !== false) course.nextSession = sessionMetrics.get(session.session_id)?.session_title;
        }
      }
    }
  }
  const questionMap = new Map(questions.map(q => [q.id, q]));
  answers.forEach(a => {
    const q = questionMap.get(a.question_id); if (!q) return;
    [q.course_id ? courseMetrics.get(q.course_id) : undefined, q.module_id ? moduleMetrics.get(q.module_id) : undefined, q.session_id ? sessionMetrics.get(q.session_id) : undefined].forEach(metric => {
      if (!metric) return; metric.total_questions++; if (a.is_correct) metric.correct_answers++;
    });
  });
  const finish = <T extends OutcomeMetric>(metric: T): T => {
    const result = finishMetric(metric);
    const counts = [...(learnerCounts.get(metric)?.values() || [])];
    if (counts.length) result.progress = Math.round(counts.reduce((sum, c) => sum + c.completed / c.total * 100, 0) / counts.length);
    return result;
  };
  const courseAccuracies = [...courseMetrics.values()].map(finish);
  const moduleAccuracies = [...moduleMetrics.values()].filter(m => m.totalSessions || m.total_questions).map(finish);
  const sessionAccuracies = [...sessionMetrics.values()].filter(s => s.totalSessions || s.total_questions).map(finish);
  // Prefer the most specific mapped topic to avoid recommending the same evidence at three levels.
  const topics = [...sessionAccuracies.map(s => ({ title: s.session_title, accuracy: s.accuracy, type: 'Session', answers: s.total_questions })), ...moduleAccuracies.filter(m => !sessionAccuracies.some(s => s.module_id === m.module_id && s.total_questions)).map(m => ({ title: m.module_title, accuracy: m.accuracy, type: 'Level', answers: m.total_questions })), ...courseAccuracies.filter(c => !moduleAccuracies.some(m => m.course_id === c.course_id && m.total_questions)).map(c => ({ title: c.course_title, accuracy: c.accuracy, type: 'Course', answers: c.total_questions }))].filter(t => t.answers > 0);
  return { courseAccuracies, moduleAccuracies, sessionAccuracies, strengths: topics.filter(t => t.accuracy >= 70).sort((a, b) => b.accuracy - a.accuracy || b.answers - a.answers).slice(0, 3), weaknesses: topics.filter(t => t.accuracy < 70).sort((a, b) => a.accuracy - b.accuracy).slice(0, 3), studentCount: students.length };
}