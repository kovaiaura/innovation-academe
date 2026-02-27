import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CourseAccuracy {
  course_id: string;
  course_title: string;
  total_questions: number;
  correct_answers: number;
  accuracy: number;
}

interface ModuleAccuracy {
  module_id: string;
  module_title: string;
  course_id: string;
  total_questions: number;
  correct_answers: number;
  accuracy: number;
}

interface SessionAccuracy {
  session_id: string;
  session_title: string;
  module_id: string;
  total_questions: number;
  correct_answers: number;
  accuracy: number;
}

export interface CourseOutcomeData {
  courseAccuracies: CourseAccuracy[];
  moduleAccuracies: ModuleAccuracy[];
  sessionAccuracies: SessionAccuracy[];
  strengths: { title: string; accuracy: number; type: string }[];
  weaknesses: { title: string; accuracy: number; type: string }[];
}

interface Filters {
  institutionId?: string;
  classId?: string;
  studentId?: string;
}

export function useCourseOutcomeAnalytics(filters: Filters) {
  return useQuery({
    queryKey: ['course-outcome-analytics', filters],
    queryFn: async (): Promise<CourseOutcomeData> => {
      // 1. Get all questions with course mapping
      const { data: questions } = await supabase
        .from('assessment_questions')
        .select('id, course_id, module_id, session_id, assessment_id')
        .not('course_id', 'is', null);

      if (!questions || questions.length === 0) {
        return { courseAccuracies: [], moduleAccuracies: [], sessionAccuracies: [], strengths: [], weaknesses: [] };
      }

      const questionIds = questions.map(q => q.id);

      // 2. Get answers for these questions, with attempt filtering
      let answersQuery = supabase
        .from('assessment_answers')
        .select('question_id, is_correct, attempt_id')
        .in('question_id', questionIds);

      // If filtering by student/institution/class, we need attempt info
      if (filters.studentId || filters.institutionId || filters.classId) {
        let attemptQuery = supabase
          .from('assessment_attempts')
          .select('id')
          .in('status', ['submitted', 'auto_submitted', 'evaluated']);

        if (filters.studentId) attemptQuery = attemptQuery.eq('student_id', filters.studentId);
        if (filters.institutionId) attemptQuery = attemptQuery.eq('institution_id', filters.institutionId);
        if (filters.classId) attemptQuery = attemptQuery.eq('class_id', filters.classId);

        const { data: attempts } = await attemptQuery;

        if (!attempts || attempts.length === 0) {
          return { courseAccuracies: [], moduleAccuracies: [], sessionAccuracies: [], strengths: [], weaknesses: [] };
        }
        answersQuery = answersQuery.in('attempt_id', attempts.map(a => a.id));
      }

      const { data: answers } = await answersQuery;
      if (!answers || answers.length === 0) {
        return { courseAccuracies: [], moduleAccuracies: [], sessionAccuracies: [], strengths: [], weaknesses: [] };
      }

      // 3. Build question -> answer mapping
      const questionAnswers = new Map<string, { total: number; correct: number }>();
      answers.forEach(a => {
        const existing = questionAnswers.get(a.question_id) || { total: 0, correct: 0 };
        existing.total++;
        if (a.is_correct) existing.correct++;
        questionAnswers.set(a.question_id, existing);
      });

      // 4. Get course/module/session names
      const courseIds = [...new Set(questions.map(q => q.course_id).filter(Boolean))] as string[];
      const moduleIds = [...new Set(questions.map(q => q.module_id).filter(Boolean))] as string[];
      const sessionIds = [...new Set(questions.map(q => q.session_id).filter(Boolean))] as string[];

      const [coursesRes, modulesRes, sessionsRes] = await Promise.all([
        courseIds.length > 0 ? supabase.from('courses').select('id, title').in('id', courseIds) : { data: [] },
        moduleIds.length > 0 ? supabase.from('course_modules').select('id, title, course_id').in('id', moduleIds) : { data: [] },
        sessionIds.length > 0 ? supabase.from('course_sessions').select('id, title, module_id').in('id', sessionIds) : { data: [] },
      ]);

      const courseMap = new Map((coursesRes.data || []).map(c => [c.id, c.title]));
      const moduleMap = new Map((modulesRes.data || []).map(m => [m.id, { title: m.title, course_id: m.course_id }]));
      const sessionMap = new Map((sessionsRes.data || []).map(s => [s.id, { title: s.title, module_id: s.module_id }]));

      // 5. Aggregate by course
      const courseAgg = new Map<string, { total: number; correct: number }>();
      const moduleAgg = new Map<string, { total: number; correct: number; course_id: string }>();
      const sessionAgg = new Map<string, { total: number; correct: number; module_id: string }>();

      questions.forEach(q => {
        const qa = questionAnswers.get(q.id);
        if (!qa) return;

        if (q.course_id) {
          const existing = courseAgg.get(q.course_id) || { total: 0, correct: 0 };
          existing.total += qa.total;
          existing.correct += qa.correct;
          courseAgg.set(q.course_id, existing);
        }
        if (q.module_id) {
          const existing = moduleAgg.get(q.module_id) || { total: 0, correct: 0, course_id: q.course_id || '' };
          existing.total += qa.total;
          existing.correct += qa.correct;
          moduleAgg.set(q.module_id, existing);
        }
        if (q.session_id) {
          const existing = sessionAgg.get(q.session_id) || { total: 0, correct: 0, module_id: q.module_id || '' };
          existing.total += qa.total;
          existing.correct += qa.correct;
          sessionAgg.set(q.session_id, existing);
        }
      });

      const courseAccuracies: CourseAccuracy[] = Array.from(courseAgg.entries()).map(([id, d]) => ({
        course_id: id,
        course_title: courseMap.get(id) || 'Unknown Course',
        total_questions: d.total,
        correct_answers: d.correct,
        accuracy: d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0,
      }));

      const moduleAccuracies: ModuleAccuracy[] = Array.from(moduleAgg.entries()).map(([id, d]) => ({
        module_id: id,
        module_title: moduleMap.get(id)?.title || 'Unknown Module',
        course_id: d.course_id,
        total_questions: d.total,
        correct_answers: d.correct,
        accuracy: d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0,
      }));

      const sessionAccuracies: SessionAccuracy[] = Array.from(sessionAgg.entries()).map(([id, d]) => ({
        session_id: id,
        session_title: sessionMap.get(id)?.title || 'Unknown Session',
        module_id: d.module_id,
        total_questions: d.total,
        correct_answers: d.correct,
        accuracy: d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0,
      }));

      // 6. Determine strengths and weaknesses from all levels
      const allTopics = [
        ...courseAccuracies.map(c => ({ title: c.course_title, accuracy: c.accuracy, type: 'Course' })),
        ...moduleAccuracies.map(m => ({ title: m.module_title, accuracy: m.accuracy, type: 'Module' })),
        ...sessionAccuracies.map(s => ({ title: s.session_title, accuracy: s.accuracy, type: 'Session' })),
      ].sort((a, b) => b.accuracy - a.accuracy);

      const strengths = allTopics.filter(t => t.accuracy >= 70).slice(0, 3);
      const weaknesses = allTopics.filter(t => t.accuracy < 70).sort((a, b) => a.accuracy - b.accuracy).slice(0, 3);

      return { courseAccuracies, moduleAccuracies, sessionAccuracies, strengths, weaknesses };
    },
    staleTime: 0, // Always refetch for immediate results
  });
}
