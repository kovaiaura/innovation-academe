import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface StudentInternship {
  id: string;
  student_id: string;
  user_id: string;
  company_name: string;
  role_title: string;
  duration: string;
  responsibilities: string | null;
  start_date: string | null;
  end_date: string | null;
}

export function useStudentInternships(studentId: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['student-internships', studentId],
    queryFn: async (): Promise<StudentInternship[]> => {
      if (!studentId || !user?.id) return [];

      const { data, error } = await supabase
        .from('student_internships' as any)
        .select('*')
        .eq('student_id', studentId)
        .order('start_date', { ascending: false });

      if (error) {
        console.error('Error fetching internships:', error);
        return [];
      }

      return (data as any[]) || [];
    },
    enabled: !!studentId && !!user?.id,
  });
}

interface AddInternshipParams {
  student_id: string;
  user_id: string;
  company_name: string;
  role_title: string;
  duration: string;
  responsibilities?: string | null;
  start_date?: string | null;
  end_date?: string | null;
}

export function useAddInternship() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: AddInternshipParams) => {
      const { data, error } = await supabase
        .from('student_internships' as any)
        .insert({
          student_id: params.student_id,
          user_id: params.user_id,
          company_name: params.company_name,
          role_title: params.role_title,
          duration: params.duration,
          responsibilities: params.responsibilities ?? null,
          start_date: params.start_date ?? null,
          end_date: params.end_date ?? null,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student-internships', variables.student_id] });
      toast.success('Internship added successfully!');
    },
    onError: (error: any) => {
      console.error('Error adding internship:', error);
      toast.error('Failed to add internship');
    },
  });
}

export function useDeleteInternship() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, studentId }: { id: string; studentId: string }) => {
      const { error } = await supabase
        .from('student_internships' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
      return studentId;
    },
    onSuccess: (studentId) => {
      queryClient.invalidateQueries({ queryKey: ['student-internships', studentId] });
      toast.success('Internship removed');
    },
    onError: (error: any) => {
      console.error('Error deleting internship:', error);
      toast.error('Failed to remove internship');
    },
  });
}
