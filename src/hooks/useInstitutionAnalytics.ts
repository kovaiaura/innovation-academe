import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { InstitutionAnalytics } from '@/types/institution';

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
      const { data: courseAssignments } = await supabase
        .from('course_class_assignments')
        .select('id, course_id, class_id')
        .eq('institution_id', institutionId);

      const assignmentIds = (courseAssignments || []).map(ca => ca.id);
      let totalContentExpected = 0;
      let totalCompletions = 0;
      const totalCoursesAssigned = courseAssignments?.length || 0;

      if (assignmentIds.length > 0 && (students?.length || 0) > 0) {
        const { data: moduleAssigns } = await supabase
          .from('class_module_assignments')
          .select('id, class_assignment_id')
          .in('class_assignment_id', assignmentIds);

        const moduleIds = (moduleAssigns || []).map(m => m.id);
        if (moduleIds.length > 0) {
          const { data: sessionAssigns } = await supabase
            .from('class_session_assignments')
            .select('session_id, class_module_assignment_id')
            .in('class_module_assignment_id', moduleIds);

          const sessionIds = [...new Set((sessionAssigns || []).map(s => s.session_id))];
          if (sessionIds.length > 0) {
            const { data: contentItems } = await supabase
              .from('course_content')
              .select('id, session_id')
              .in('session_id', sessionIds);

            const sessionContentCount = new Map<string, number>();
            (contentItems || []).forEach(c => {
              sessionContentCount.set(c.session_id, (sessionContentCount.get(c.session_id) || 0) + 1);
            });

            const classStudentCount = new Map<string, number>();
            (students || []).forEach((s: any) => {
              if (s.class_id) classStudentCount.set(s.class_id, (classStudentCount.get(s.class_id) || 0) + 1);
            });

            const assignmentModuleMap = new Map<string, string[]>();
            (moduleAssigns || []).forEach(m => {
              const arr = assignmentModuleMap.get(m.class_assignment_id) || [];
              arr.push(m.id);
              assignmentModuleMap.set(m.class_assignment_id, arr);
            });
            const moduleSessionMap = new Map<string, string[]>();
            (sessionAssigns || []).forEach(s => {
              const arr = moduleSessionMap.get(s.class_module_assignment_id) || [];
              arr.push(s.session_id);
              moduleSessionMap.set(s.class_module_assignment_id, arr);
            });

            (courseAssignments || []).forEach(ca => {
              const studentsInClass = classStudentCount.get(ca.class_id) || 0;
              const modIds = assignmentModuleMap.get(ca.id) || [];
              let contentCount = 0;
              modIds.forEach(mid => {
                (moduleSessionMap.get(mid) || []).forEach(sid => {
                  contentCount += sessionContentCount.get(sid) || 0;
                });
              });
              totalContentExpected += contentCount * studentsInClass;
            });

            const { count: completionCount } = await supabase
              .from('student_content_completions')
              .select('id', { count: 'exact', head: true })
              .in('class_assignment_id', assignmentIds);
            totalCompletions = completionCount || 0;
          }
        }
      }

      const overallCompletionRate = totalContentExpected > 0
        ? Math.round((totalCompletions / totalContentExpected) * 1000) / 10
        : 0;

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
