import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CoursePerformanceData {
  course: {
    id: string;
    title: string;
    course_code: string;
    description: string | null;
    category: string | null;
    difficulty: string | null;
    duration_weeks: number | null;
  };
  total_students: number;
  active_students: number;
  completed_students: number;
  completion_rate: number;
  avg_progress: number;
  at_risk_count: number;
  class_breakdown: Array<{
    class_id: string;
    class_name: string;
    student_count: number;
    avg_progress: number;
    completed_count: number;
  }>;
  student_performance: Array<{
    student_id: string;
    student_name: string;
    class_name: string;
    progress_percentage: number;
    completed_content: number;
    total_content: number;
    status: 'on_track' | 'at_risk' | 'struggling' | 'completed';
  }>;
}

export function useCoursePerformance(courseId: string | null, institutionId: string | null) {
  return useQuery({
    queryKey: ['course-performance', courseId, institutionId],
    enabled: !!courseId && !!institutionId,
    staleTime: 2 * 60 * 1000,
    queryFn: async (): Promise<CoursePerformanceData | null> => {
      if (!courseId || !institutionId) return null;

      const { data: course } = await supabase
        .from('courses')
        .select('id, title, course_code, description, category, difficulty, duration_weeks')
        .eq('id', courseId)
        .maybeSingle();
      if (!course) return null;

      const { data: assignments } = await supabase
        .from('course_class_assignments')
        .select('id, class_id')
        .eq('course_id', courseId)
        .eq('institution_id', institutionId);

      const assignmentIds = (assignments || []).map(a => a.id);
      const classIds = [...new Set((assignments || []).map(a => a.class_id))];

      const { data: classes } = classIds.length
        ? await supabase.from('classes').select('id, class_name').in('id', classIds)
        : { data: [] as any[] };
      const classNameMap = new Map((classes || []).map((c: any) => [c.id, c.class_name]));

      const { data: students } = classIds.length
        ? await supabase
            .from('students')
            .select('id, student_name, class_id, status')
            .in('class_id', classIds)
        : { data: [] as any[] };

      // Total content for each class assignment
      const { data: moduleAssigns } = assignmentIds.length
        ? await supabase
            .from('class_module_assignments')
            .select('id, class_assignment_id')
            .in('class_assignment_id', assignmentIds)
        : { data: [] as any[] };
      const moduleIds = (moduleAssigns || []).map((m: any) => m.id);

      const { data: sessionAssigns } = moduleIds.length
        ? await supabase
            .from('class_session_assignments')
            .select('session_id, class_module_assignment_id')
            .in('class_module_assignment_id', moduleIds)
        : { data: [] as any[] };

      const sessionIds = [...new Set((sessionAssigns || []).map((s: any) => s.session_id))];
      const { data: contentItems } = sessionIds.length
        ? await supabase.from('course_content').select('id, session_id').in('session_id', sessionIds)
        : { data: [] as any[] };

      const sessionContentCount = new Map<string, number>();
      (contentItems || []).forEach((c: any) => {
        sessionContentCount.set(c.session_id, (sessionContentCount.get(c.session_id) || 0) + 1);
      });
      const assignmentModuleMap = new Map<string, string[]>();
      (moduleAssigns || []).forEach((m: any) => {
        const arr = assignmentModuleMap.get(m.class_assignment_id) || [];
        arr.push(m.id);
        assignmentModuleMap.set(m.class_assignment_id, arr);
      });
      const moduleSessionMap = new Map<string, string[]>();
      (sessionAssigns || []).forEach((s: any) => {
        const arr = moduleSessionMap.get(s.class_module_assignment_id) || [];
        arr.push(s.session_id);
        moduleSessionMap.set(s.class_module_assignment_id, arr);
      });

      // class_id -> total content count for this course
      const classContentTotal = new Map<string, number>();
      const classAssignmentMap = new Map<string, string>(); // assignment_id -> class_id
      (assignments || []).forEach(a => {
        classAssignmentMap.set(a.id, a.class_id);
        const modIds = assignmentModuleMap.get(a.id) || [];
        let count = 0;
        modIds.forEach(mid => {
          (moduleSessionMap.get(mid) || []).forEach(sid => {
            count += sessionContentCount.get(sid) || 0;
          });
        });
        classContentTotal.set(a.class_id, count);
      });

      const studentRecordIds = (students || []).map((s: any) => s.id);
      const { data: completions } = (assignmentIds.length && studentRecordIds.length)
        ? await supabase
            .from('student_content_completions')
            .select('student_id, content_id, class_assignment_id')
            .in('class_assignment_id', assignmentIds)
            .in('student_id', studentRecordIds)
        : { data: [] as any[] };

      // Build per-student progress
      const completionsByStudent = new Map<string, Set<string>>();
      (completions || []).forEach((c: any) => {
        const set = completionsByStudent.get(c.student_id) || new Set<string>();
        set.add(c.content_id);
        completionsByStudent.set(c.student_id, set);
      });

      const studentPerformance = (students || []).map((s: any) => {
        const total = classContentTotal.get(s.class_id) || 0;
        const completed = (completionsByStudent.get(s.id) || new Set()).size;
        const pct = total > 0 ? Math.round((completed / total) * 1000) / 10 : 0;
        let status: 'on_track' | 'at_risk' | 'struggling' | 'completed' = 'on_track';
        if (pct >= 100) status = 'completed';
        else if (pct < 25) status = 'struggling';
        else if (pct < 50) status = 'at_risk';
        return {
          student_id: s.id,
          student_name: s.student_name,
          class_name: classNameMap.get(s.class_id) || 'Unknown',
          progress_percentage: pct,
          completed_content: completed,
          total_content: total,
          status,
        };
      });

      const totalStudents = studentPerformance.length;
      const activeStudents = (students || []).filter((s: any) => s.status === 'active').length;
      const completedStudents = studentPerformance.filter(s => s.status === 'completed').length;
      const atRiskCount = studentPerformance.filter(s => s.status === 'at_risk' || s.status === 'struggling').length;
      const avgProgress = totalStudents > 0
        ? Math.round((studentPerformance.reduce((sum, s) => sum + s.progress_percentage, 0) / totalStudents) * 10) / 10
        : 0;
      const completionRate = totalStudents > 0
        ? Math.round((completedStudents / totalStudents) * 1000) / 10
        : 0;

      // Class breakdown
      const classBreakdown = classIds.map(cid => {
        const studs = studentPerformance.filter(s => classNameMap.get(cid) === s.class_name);
        const avg = studs.length > 0
          ? Math.round((studs.reduce((sum, s) => sum + s.progress_percentage, 0) / studs.length) * 10) / 10
          : 0;
        return {
          class_id: cid,
          class_name: classNameMap.get(cid) || 'Unknown',
          student_count: studs.length,
          avg_progress: avg,
          completed_count: studs.filter(s => s.status === 'completed').length,
        };
      });

      return {
        course: course as any,
        total_students: totalStudents,
        active_students: activeStudents,
        completed_students: completedStudents,
        completion_rate: completionRate,
        avg_progress: avgProgress,
        at_risk_count: atRiskCount,
        class_breakdown: classBreakdown,
        student_performance: studentPerformance,
      };
    },
  });
}
