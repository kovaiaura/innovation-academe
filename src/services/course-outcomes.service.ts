import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { getAcademicYearDateRange, getDefaultAcademicYear, getDefaultAcademicYearPeriods, normalizeAcademicYear, type AcademicYearPeriodsConfig, type AcademicYearDateRange } from '@/utils/academicYear';
import { emptyMetric, finishMetric, isOutcomeSessionComplete, isWithinOutcomeYear, type OutcomeMetric } from '@/utils/courseOutcomeMetrics';

type Table = keyof Database['public']['Tables'];
type Row<T extends Table> = Database['public']['Tables'][T]['Row'];
// Every read is stable, paginated, and scoped; ID lists are chunked below.
async function read<T extends Table>(table: T, configure: (query: any) => any = q => q): Promise<Row<T>[]> {
  const rows: Row<T>[] = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await configure(supabase.from(table).select('*')).order('id').range(offset, offset + 499);
    if (error) throw error;
    rows.push(...(data || []));
    if (!data || data.length < 500) break;
  }
  return rows;
}
async function byIds<T extends Table>(table: T, column: string, ids: string[], configure: (q: any) => any = q => q) {
  const rows: Row<T>[] = [];
  const unique = [...new Set(ids)];
  for (let i = 0; i < unique.length; i += 100) rows.push(...await read(table, q => configure(q.in(column, unique.slice(i, i + 100)))));
  return rows;
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
  const students = await read('students', q => {
    if (filters.institutionId) q = q.eq('institution_id', filters.institutionId);
    if (filters.classId) q = q.eq('class_id', filters.classId);
    if (filters.studentId) q = q.eq('user_id', filters.studentId);
    return q;
  });
  if (!students.length) return emptyOutcomes();
  const institutionIds = [...new Set(students.map(s => s.institution_id))];
  const classIds = students.flatMap(s => s.class_id ? [s.class_id] : []);
  const [assignments, institutions, attempts] = await Promise.all([
    byIds('course_class_assignments', 'class_id', classIds, q => filters.institutionId ? q.eq('institution_id', filters.institutionId) : q),
    byIds('institutions', 'id', institutionIds),
    byIds('assessment_attempts', 'student_id', students.flatMap(s => s.user_id ? [s.user_id] : []), q => {
      q = q.in('status', ['submitted', 'auto_submitted', 'evaluated']).in('institution_id', institutionIds);
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
  const yearAttempts = attempts.filter(a => {
    const date = assessmentDates.get(a.assessment_id);
    const range = rangeByInstitution.get(a.institution_id);
    return date && range && isWithinOutcomeYear(date, range);
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
  const addLearning = (metric: OutcomeMetric | undefined, student: string, done: boolean) => {
    if (!metric) return;
    metric.totalSessions++; if (done) metric.completedSessions++;
    const set = learners.get(metric) || new Set<string>(); set.add(student); learners.set(metric, set); metric.studentCount = set.size;
  };
  for (const assignment of assignments) {
    const course = courseMetrics.get(assignment.course_id);
    const allocatedModules = moduleAssignments.filter(m => m.class_assignment_id === assignment.id);
    for (const student of students.filter(s => s.class_id === assignment.class_id && s.institution_id === assignment.institution_id)) {
      for (const mod of allocatedModules) {
        const allocatedSessions = sessionAssignments.filter(s => s.class_module_assignment_id === mod.id);
        const ordered = allocatedSessions.sort((a, b) => (a.unlock_order || 0) - (b.unlock_order || 0));
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
  const courseAccuracies = [...courseMetrics.values()].map(finishMetric);
  const moduleAccuracies = [...moduleMetrics.values()].filter(m => m.totalSessions || m.total_questions).map(finishMetric);
  const sessionAccuracies = [...sessionMetrics.values()].filter(s => s.totalSessions || s.total_questions).map(finishMetric);
  // Prefer the most specific mapped topic to avoid recommending the same evidence at three levels.
  const topics = [...sessionAccuracies.map(s => ({ title: s.session_title, accuracy: s.accuracy, type: 'Session', answers: s.total_questions })), ...moduleAccuracies.filter(m => !sessionAccuracies.some(s => s.module_id === m.module_id && s.total_questions)).map(m => ({ title: m.module_title, accuracy: m.accuracy, type: 'Level', answers: m.total_questions })), ...courseAccuracies.filter(c => !moduleAccuracies.some(m => m.course_id === c.course_id && m.total_questions)).map(c => ({ title: c.course_title, accuracy: c.accuracy, type: 'Course', answers: c.total_questions }))].filter(t => t.answers > 0);
  return { courseAccuracies, moduleAccuracies, sessionAccuracies, strengths: topics.filter(t => t.accuracy >= 70).sort((a, b) => b.accuracy - a.accuracy || b.answers - a.answers).slice(0, 3), weaknesses: topics.filter(t => t.accuracy < 70).sort((a, b) => a.accuracy - b.accuracy).slice(0, 3), studentCount: students.length };
}