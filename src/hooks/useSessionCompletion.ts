import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SessionCompletionResult {
  markSessionComplete: (
    sessionId: string,
    studentIds: string[],
    classAssignmentId: string
  ) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to handle marking all content in a session as complete for multiple students
 * This triggers the database trigger that handles unlocking next sessions/modules
 */
export function useSessionCompletion(): SessionCompletionResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const markSessionComplete = async (
    sessionId: string,
    studentIds: string[],
    classAssignmentId: string
  ): Promise<boolean> => {
    if (studentIds.length === 0) {
      toast.error('Please select at least one student');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Fetch all content in this session
      const { data: contentItems, error: contentError } = await supabase
        .from('course_content')
        .select('id')
        .eq('session_id', sessionId);

      if (contentError) throw contentError;
      if (!contentItems || contentItems.length === 0) {
        toast.error('No content found in this session');
        return false;
      }

      // 2. Create completion records for each student + content combination
      const completionRecords = studentIds.flatMap(studentId =>
        contentItems.map(content => ({
          student_id: studentId,
          content_id: content.id,
          class_assignment_id: classAssignmentId,
          watch_percentage: 100,
          completed_at: new Date().toISOString()
        }))
      );

      // 3. Upsert completions (avoid duplicates)
      const { error: insertError } = await supabase
        .from('student_content_completions')
        .upsert(completionRecords, {
          onConflict: 'student_id,content_id,class_assignment_id',
          ignoreDuplicates: false
        });

      if (insertError) throw insertError;

      toast.success(
        `Session marked complete for ${studentIds.length} student${studentIds.length > 1 ? 's' : ''}`
      );
      return true;
    } catch (err: any) {
      console.error('Failed to mark session complete:', err);
      setError(err.message || 'Failed to mark session complete');
      toast.error('Failed to mark session complete');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { markSessionComplete, isLoading, error };
}

/**
 * Hook to fetch student completion status for a session
 */
export function useStudentSessionCompletions(
  sessionId: string | null,
  classAssignmentId: string | null,
  studentIds: string[]
) {
  const [completions, setCompletions] = useState<Map<string, boolean>>(new Map());
  const [isLoading, setIsLoading] = useState(false);

  const fetchCompletions = async () => {
    if (!sessionId || !classAssignmentId || studentIds.length === 0) {
      setCompletions(new Map());
      return;
    }

    setIsLoading(true);
    try {
      // Get all content in the session
      const { data: contentItems } = await supabase
        .from('course_content')
        .select('id')
        .eq('session_id', sessionId);

      if (!contentItems || contentItems.length === 0) {
        setCompletions(new Map());
        return;
      }

      const contentIds = contentItems.map(c => c.id);

      // Get completions for each student
      const { data: completionData } = await supabase
        .from('student_content_completions')
        .select('student_id, content_id')
        .in('student_id', studentIds)
        .in('content_id', contentIds)
        .eq('class_assignment_id', classAssignmentId);

      // Calculate which students have completed ALL content
      const studentCompletions = new Map<string, boolean>();
      for (const studentId of studentIds) {
        const studentCompletedContent = completionData?.filter(
          c => c.student_id === studentId
        ).length || 0;
        studentCompletions.set(studentId, studentCompletedContent >= contentIds.length);
      }

      setCompletions(studentCompletions);
    } catch (err) {
      console.error('Failed to fetch completions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return { completions, isLoading, refetch: fetchCompletions };
}
