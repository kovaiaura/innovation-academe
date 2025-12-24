import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Types for class module/session assignments
export interface ClassModuleAssignment {
  id: string;
  class_assignment_id: string;
  module_id: string;
  is_unlocked: boolean;
  unlock_order: number;
  created_at: string;
  updated_at: string;
  module?: {
    id: string;
    title: string;
    description: string | null;
    display_order: number;
  };
  session_assignments?: ClassSessionAssignment[];
}

export interface ClassSessionAssignment {
  id: string;
  class_module_assignment_id: string;
  session_id: string;
  is_unlocked: boolean;
  unlock_order: number;
  created_at: string;
  updated_at: string;
  session?: {
    id: string;
    title: string;
    description: string | null;
    display_order: number;
  };
}

export interface ClassCourseAssignmentWithDetails {
  id: string;
  class_id: string;
  course_id: string;
  institution_id: string;
  assigned_at: string;
  assigned_by: string | null;
  course?: {
    id: string;
    title: string;
    course_code: string;
    category: string;
    status: string;
    thumbnail_url: string | null;
  };
  module_assignments?: ClassModuleAssignment[];
}

// Fetch class course assignments with module/session details
export function useClassCourseAssignments(classId?: string) {
  return useQuery({
    queryKey: ['class-course-assignments', classId],
    queryFn: async () => {
      if (!classId) return [];

      // Get course class assignments
      const { data: assignments, error: assignmentError } = await supabase
        .from('course_class_assignments')
        .select(`
          id,
          class_id,
          course_id,
          institution_id,
          assigned_at,
          assigned_by,
          courses (
            id,
            title,
            course_code,
            category,
            status,
            thumbnail_url
          )
        `)
        .eq('class_id', classId);

      if (assignmentError) throw assignmentError;
      if (!assignments || assignments.length === 0) return [];

      // Get module assignments for each course assignment
      const assignmentIds = assignments.map(a => a.id);
      const { data: moduleAssignments, error: moduleError } = await supabase
        .from('class_module_assignments')
        .select(`
          id,
          class_assignment_id,
          module_id,
          is_unlocked,
          unlock_order,
          created_at,
          updated_at,
          course_modules (
            id,
            title,
            description,
            display_order
          )
        `)
        .in('class_assignment_id', assignmentIds)
        .order('unlock_order', { ascending: true });

      if (moduleError) throw moduleError;

      // Get session assignments for each module assignment
      const moduleAssignmentIds = moduleAssignments?.map(m => m.id) || [];
      let sessionAssignments: any[] = [];
      
      if (moduleAssignmentIds.length > 0) {
        const { data: sessions, error: sessionError } = await supabase
          .from('class_session_assignments')
          .select(`
            id,
            class_module_assignment_id,
            session_id,
            is_unlocked,
            unlock_order,
            created_at,
            updated_at,
            course_sessions (
              id,
              title,
              description,
              display_order
            )
          `)
          .in('class_module_assignment_id', moduleAssignmentIds)
          .order('unlock_order', { ascending: true });

        if (sessionError) throw sessionError;
        sessionAssignments = sessions || [];
      }

      // Combine the data
      return assignments.map(assignment => ({
        ...assignment,
        course: assignment.courses,
        module_assignments: (moduleAssignments || [])
          .filter(ma => ma.class_assignment_id === assignment.id)
          .map(ma => ({
            ...ma,
            module: ma.course_modules,
            session_assignments: sessionAssignments
              .filter(sa => sa.class_module_assignment_id === ma.id)
              .map(sa => ({
                ...sa,
                session: sa.course_sessions,
              })),
          })),
      })) as ClassCourseAssignmentWithDetails[];
    },
    enabled: !!classId,
  });
}

// Assign course to class with modules and sessions
export function useAssignCourseToClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      classId,
      courseId,
      institutionId,
      modules,
    }: {
      classId: string;
      courseId: string;
      institutionId: string;
      modules: {
        moduleId: string;
        isUnlocked: boolean;
        unlockOrder: number;
        sessions: {
          sessionId: string;
          isUnlocked: boolean;
          unlockOrder: number;
        }[];
      }[];
    }) => {
      // Create course class assignment
      const { data: assignment, error: assignmentError } = await supabase
        .from('course_class_assignments')
        .insert({
          class_id: classId,
          course_id: courseId,
          institution_id: institutionId,
        })
        .select()
        .single();

      if (assignmentError) throw assignmentError;

      // Create module assignments
      for (const mod of modules) {
        const { data: moduleAssignment, error: moduleError } = await supabase
          .from('class_module_assignments')
          .insert({
            class_assignment_id: assignment.id,
            module_id: mod.moduleId,
            is_unlocked: mod.isUnlocked,
            unlock_order: mod.unlockOrder,
          })
          .select()
          .single();

        if (moduleError) throw moduleError;

        // Create session assignments for this module
        if (mod.sessions.length > 0) {
          const sessionInserts = mod.sessions.map(sess => ({
            class_module_assignment_id: moduleAssignment.id,
            session_id: sess.sessionId,
            is_unlocked: sess.isUnlocked,
            unlock_order: sess.unlockOrder,
          }));

          const { error: sessionError } = await supabase
            .from('class_session_assignments')
            .insert(sessionInserts);

          if (sessionError) throw sessionError;
        }
      }

      return assignment;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['class-course-assignments', variables.classId] });
      toast.success('Course assigned successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to assign course: ${error.message}`);
    },
  });
}

// Remove course assignment from class
export function useRemoveCourseFromClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ assignmentId, classId }: { assignmentId: string; classId: string }) => {
      const { error } = await supabase
        .from('course_class_assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;
      return { assignmentId, classId };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['class-course-assignments', variables.classId] });
      toast.success('Course assignment removed');
    },
    onError: (error: any) => {
      toast.error(`Failed to remove course: ${error.message}`);
    },
  });
}

// Toggle module unlock status
export function useToggleModuleUnlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      moduleAssignmentId,
      isUnlocked,
      classId,
    }: {
      moduleAssignmentId: string;
      isUnlocked: boolean;
      classId: string;
    }) => {
      const { error } = await supabase
        .from('class_module_assignments')
        .update({ is_unlocked: isUnlocked })
        .eq('id', moduleAssignmentId);

      if (error) throw error;
      return { moduleAssignmentId, isUnlocked, classId };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['class-course-assignments', variables.classId] });
      toast.success(variables.isUnlocked ? 'Module unlocked' : 'Module locked');
    },
    onError: (error: any) => {
      toast.error(`Failed to update module: ${error.message}`);
    },
  });
}

// Toggle session unlock status
export function useToggleSessionUnlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionAssignmentId,
      isUnlocked,
      classId,
    }: {
      sessionAssignmentId: string;
      isUnlocked: boolean;
      classId: string;
    }) => {
      const { error } = await supabase
        .from('class_session_assignments')
        .update({ is_unlocked: isUnlocked })
        .eq('id', sessionAssignmentId);

      if (error) throw error;
      return { sessionAssignmentId, isUnlocked, classId };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['class-course-assignments', variables.classId] });
      toast.success(variables.isUnlocked ? 'Session unlocked' : 'Session locked');
    },
    onError: (error: any) => {
      toast.error(`Failed to update session: ${error.message}`);
    },
  });
}

// Fetch student courses (for student view - only unlocked modules/sessions)
export function useStudentCourses(studentId?: string, classId?: string) {
  return useQuery({
    queryKey: ['student-courses', studentId, classId],
    queryFn: async () => {
      if (!classId) return [];

      // Get course class assignments for this class
      const { data: assignments, error: assignmentError } = await supabase
        .from('course_class_assignments')
        .select(`
          id,
          class_id,
          course_id,
          courses (
            id,
            title,
            course_code,
            description,
            category,
            status,
            thumbnail_url
          )
        `)
        .eq('class_id', classId);

      if (assignmentError) throw assignmentError;
      if (!assignments || assignments.length === 0) return [];

      // Get only unlocked module assignments
      const assignmentIds = assignments.map(a => a.id);
      const { data: moduleAssignments, error: moduleError } = await supabase
        .from('class_module_assignments')
        .select(`
          id,
          class_assignment_id,
          module_id,
          is_unlocked,
          unlock_order,
          course_modules (
            id,
            title,
            description,
            display_order
          )
        `)
        .in('class_assignment_id', assignmentIds)
        .eq('is_unlocked', true)
        .order('unlock_order', { ascending: true });

      if (moduleError) throw moduleError;

      // Get only unlocked session assignments
      const moduleAssignmentIds = moduleAssignments?.map(m => m.id) || [];
      let sessionAssignments: any[] = [];

      if (moduleAssignmentIds.length > 0) {
        const { data: sessions, error: sessionError } = await supabase
          .from('class_session_assignments')
          .select(`
            id,
            class_module_assignment_id,
            session_id,
            is_unlocked,
            unlock_order,
            course_sessions (
              id,
              title,
              description,
              display_order
            )
          `)
          .in('class_module_assignment_id', moduleAssignmentIds)
          .eq('is_unlocked', true)
          .order('unlock_order', { ascending: true });

        if (sessionError) throw sessionError;
        sessionAssignments = sessions || [];
      }

      // Get content for unlocked sessions
      const sessionIds = sessionAssignments.map(s => s.session_id);
      let contentItems: any[] = [];

      if (sessionIds.length > 0) {
        const { data: content, error: contentError } = await supabase
          .from('course_content')
          .select('*')
          .in('session_id', sessionIds)
          .order('display_order', { ascending: true });

        if (contentError) throw contentError;
        contentItems = content || [];
      }

      // Get student completions if studentId is provided
      let completions: any[] = [];
      if (studentId && assignmentIds.length > 0) {
        const { data: studentCompletions, error: completionError } = await supabase
          .from('student_content_completions')
          .select('*')
          .eq('student_id', studentId)
          .in('class_assignment_id', assignmentIds);

        if (completionError) throw completionError;
        completions = studentCompletions || [];
      }

      // Combine the data
      return assignments.map(assignment => ({
        ...assignment,
        course: assignment.courses,
        modules: (moduleAssignments || [])
          .filter(ma => ma.class_assignment_id === assignment.id)
          .map(ma => ({
            ...ma,
            module: ma.course_modules,
            sessions: sessionAssignments
              .filter(sa => sa.class_module_assignment_id === ma.id)
              .map(sa => ({
                ...sa,
                session: sa.course_sessions,
                content: contentItems
                  .filter(c => c.session_id === sa.session_id)
                  .map(c => ({
                    ...c,
                    isCompleted: completions.some(comp => comp.content_id === c.id),
                  })),
              })),
          })),
      }));
    },
    enabled: !!classId,
  });
}

// Mark content as completed
export function useMarkContentComplete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      studentId,
      contentId,
      classAssignmentId,
      watchPercentage = 100,
    }: {
      studentId: string;
      contentId: string;
      classAssignmentId: string;
      watchPercentage?: number;
    }) => {
      const { error } = await supabase
        .from('student_content_completions')
        .upsert({
          student_id: studentId,
          content_id: contentId,
          class_assignment_id: classAssignmentId,
          watch_percentage: watchPercentage,
          completed_at: new Date().toISOString(),
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-courses'] });
      toast.success('Progress saved');
    },
    onError: (error: any) => {
      toast.error(`Failed to save progress: ${error.message}`);
    },
  });
}
