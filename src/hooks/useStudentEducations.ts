import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface StudentEducation {
  id: string;
  student_id: string;
  user_id: string;
  institution_name: string;
  degree_or_course: string;
  field_of_study: string | null;
  start_year: string | null;
  end_year: string | null;
  grade_or_percentage: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface AddEducationInput {
  student_id: string;
  user_id: string;
  institution_name: string;
  degree_or_course: string;
  field_of_study?: string | null;
  start_year?: string | null;
  end_year?: string | null;
  grade_or_percentage?: string | null;
  description?: string | null;
}

export function useStudentEducations(studentId: string | null) {
  return useQuery({
    queryKey: ['student-educations', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      
      const { data, error } = await supabase
        .from('student_educations')
        .select('*')
        .eq('student_id', studentId)
        .order('end_year', { ascending: false, nullsFirst: true });

      if (error) throw error;
      return data as StudentEducation[];
    },
    enabled: !!studentId,
  });
}

export function useAddEducation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddEducationInput) => {
      const { data, error } = await supabase
        .from('student_educations')
        .insert([input])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student-educations', variables.student_id] });
      toast.success('Education entry added');
    },
    onError: (error) => {
      console.error('Error adding education:', error);
      toast.error('Failed to add education entry');
    },
  });
}

export function useDeleteEducation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, studentId }: { id: string; studentId: string }) => {
      const { error } = await supabase
        .from('student_educations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { id, studentId };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student-educations', variables.studentId] });
      toast.success('Education entry removed');
    },
    onError: (error) => {
      console.error('Error deleting education:', error);
      toast.error('Failed to remove education entry');
    },
  });
}
