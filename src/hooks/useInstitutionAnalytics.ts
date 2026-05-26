import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { InstitutionAnalytics } from '@/types/institution';
import {
  buildSessionCompletionContexts,
  computeStudentSessionProgress,
} from '@/utils/courseProgressCalculations';


export function useInstitutionAnalytics(institutionId: string | undefined) {
  return useQuery({
    queryKey: ['institution-analytics', institutionId],
    queryFn: async (): Promise<InstitutionAnalytics | null> => {
      if (!institutionId) return null;

      // Fetch students data
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id, status, gender, created_at, class_id')
        .eq('institution_id', institutionId);

      if (studentsError) throw studentsError;

      // Fetch classes data
      const { data: classes, error: classesError } = await supabase
        .from('classes')
        .select('id, class_name, status')
        .eq('institution_id', institutionId);

      if (classesError) throw classesError;

      // Fetch assigned officers count
      const { count: officerCount, error: officersError } = await supabase
        .from('officer_institution_assignments')
        .select('id', { count: 'exact', head: true })
        .eq('institution_id', institutionId)
        .eq('status', 'active');

      if (officersError) throw officersError;

      // Fetch attendance records for this institution
      const { data: attendance, error: attendanceError } = await supabase
        .from('class_session_attendance')
        .select('students_present, students_absent, students_late, total_students')
        .eq('institution_id', institutionId);

      if (attendanceError) throw attendanceError;

      // Fetch assessment attempts for academic metrics
      const { data: assessmentAttempts, error: assessmentError } = await supabase
        .from('assessment_attempts')
        .select('percentage, passed')
        .eq('institution_id', institutionId)
        .eq('status', 'submitted');

      if (assessmentError) throw assessmentError;

      // ===== Course completion metrics =====
      // Top-student-per-class, then institution = max across classes.
      const { data: courseAssignments } = await supabase
        .from('course_class_assignments')
        .select('id, course_id, class_id')
        .eq('institution_id', institutionId);

      const assignmentIds = (courseAssignments || []).map(ca => ca.id);
      const totalCoursesAssigned = courseAssignments?.length || 0;

      // Group assignments by class
      const assignmentsByClass = new Map<string, string[]>();
      (courseAssignments || []).forEach(ca => {
        const arr = assignmentsByClass.get(ca.class_id) || [];
        arr.push(ca.id);
        assignmentsByClass.set(ca.class_id, arr);
      });

      // Group active students by class
      const studentsByClass = new Map<string, string[]>();
      (students || [])
        .filter((s: any) => s.status === 'active')
        .forEach((s: any) => {
          if (!s.class_id) return;
          const arr = studentsByClass.get(s.class_id) || [];
          arr.push(s.id);
          studentsByClass.set(s.class_id, arr);
        });

      let overallCompletionRate = 0;
      let totalCompletions = 0;
      let totalContentExpected = 0;

      if (assignmentIds.length > 0) {
        const ctxMap = await buildSessionCompletionContexts(assignmentIds);

        // Sum completions / expected (kept for backwards-compatible counters)
        const { count: completionCount } = await supabase
          .from('student_content_completions')
          .select('id', { count: 'exact', head: true })
          .in('class_assignment_id', assignmentIds);
        totalCompletions = completionCount || 0;
        ctxMap.forEach(ctx => {
          const studentsInClass = (studentsByClass.get(ctx.classId) || []).length;
          let contentCount = 0;
          ctx.contentBySession.forEach(arr => { contentCount += arr.length; });
          totalContentExpected += contentCount * studentsInClass;
        });

        // Per-class top student %
        const classTopPcts: number[] = [];
        for (const [cid, sids] of studentsByClass.entries()) {
          const aids = assignmentsByClass.get(cid) || [];
          if (aids.length === 0 || sids.length === 0) continue;
          const ctxArr = aids
            .map(aid => ctxMap.get(aid))
            .filter(Boolean) as any[];
          const progress = await computeStudentSessionProgress(sids, ctxArr);
          const pcts = Array.from(progress.values()).map(p => p.progressPercentage);
          if (pcts.length > 0) classTopPcts.push(Math.max(...pcts));
        }
        if (classTopPcts.length > 0) {
          overallCompletionRate = Math.round(Math.max(...classTopPcts) * 10) / 10;
        }
      }

      // Calculate student metrics
      const totalStudents = students?.length || 0;
      const activeStudents = students?.filter(s => s.status === 'active').length || 0;
      
      // New enrollments (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const newEnrollments = students?.filter(s => 
        new Date(s.created_at) > thirtyDaysAgo
      ).length || 0;

      // Gender distribution
      const genderDistribution = {
        male: students?.filter(s => s.gender === 'male').length || 0,
        female: students?.filter(s => s.gender === 'female').length || 0,
        other: students?.filter(s => s.gender === 'other' || !s.gender).length || 0,
      };

      // Calculate attendance rate
      let attendanceRate = 0;
      if (attendance && attendance.length > 0) {
        const totalPresent = attendance.reduce((sum, a) => sum + (a.students_present || 0), 0);
        const totalStudentsAttendance = attendance.reduce((sum, a) => sum + (a.total_students || 0), 0);
        attendanceRate = totalStudentsAttendance > 0 
          ? Math.round((totalPresent / totalStudentsAttendance) * 1000) / 10 
          : 0;
      }

      // Calculate dropout rate
      const inactiveStudents = students?.filter(s => s.status === 'inactive').length || 0;
      const dropoutRate = totalStudents > 0 
        ? Math.round((inactiveStudents / totalStudents) * 1000) / 10 
        : 0;

      // Calculate academic metrics
      let averageGrade = 0;
      let studentsNeedingAttention = 0;
      if (assessmentAttempts && assessmentAttempts.length > 0) {
        const totalPercentage = assessmentAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0);
        averageGrade = Math.round((totalPercentage / assessmentAttempts.length) * 10) / 10;
        studentsNeedingAttention = assessmentAttempts.filter(a => (a.percentage || 0) < 50).length;
      }

      // Find top performing class (class with highest average grade)
      let topPerformingClass = 'N/A';
      const activeClasses = classes?.filter(c => c.status === 'active') || [];

      // Calculate operational metrics
      const totalClasses = classes?.length || 0;

      const analytics: InstitutionAnalytics = {
        institution_id: institutionId,
        period: `${new Date().getFullYear()}-${(new Date().getFullYear() + 1).toString().slice(-2)}`,
        student_metrics: {
          total_students: totalStudents,
          active_students: activeStudents,
          new_enrollments: newEnrollments,
          attendance_rate: attendanceRate,
          dropout_rate: dropoutRate,
          gender_distribution: genderDistribution,
        },
        academic_metrics: {
          average_grade: averageGrade,
          top_performing_class: topPerformingClass,
          students_needing_attention: studentsNeedingAttention,
          subject_performance: [],
        },
        staff_metrics: {
          total_officers: officerCount || 0,
          officer_utilization_rate: 0,
          staff_attendance_rate: 0,
          teacher_student_ratio: totalStudents > 0 && (officerCount || 0) > 0 
            ? `1:${Math.round(totalStudents / (officerCount || 1))}` 
            : 'N/A',
        },
        operational_metrics: {
          total_classes: totalClasses,
          lab_utilization: 0,
          event_participation_rate: 0,
          project_completion_rate: 0,
        },
        course_metrics: {
          total_courses_assigned: totalCoursesAssigned,
          overall_completion_rate: overallCompletionRate,
          total_completions: totalCompletions,
          total_content_expected: totalContentExpected,
        },
      };

      return analytics;
    },
    enabled: !!institutionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
