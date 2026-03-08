import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface StudentCertification {
  id: string;
  student_id: string;
  user_id: string;
  certification_name: string;
  issuing_organization: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  credential_id: string | null;
  credential_url: string | null;
}

export function useStudentCertifications(studentId: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['student-certifications', studentId],
    queryFn: async (): Promise<StudentCertification[]> => {
      if (!studentId || !user?.id) return [];

      const { data, error } = await supabase
        .from('student_certifications' as any)
        .select('*')
        .eq('student_id', studentId)
        .order('issue_date', { ascending: false });

      if (error) {
        console.error('Error fetching certifications:', error);
        return [];
      }

      return (data as any[]) || [];
    },
    enabled: !!studentId && !!user?.id,
  });
}

interface AddCertificationParams {
  student_id: string;
  user_id: string;
  certification_name: string;
  issuing_organization?: string | null;
  issue_date?: string | null;
  expiry_date?: string | null;
  credential_id?: string | null;
  credential_url?: string | null;
}

export function useAddCertification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: AddCertificationParams) => {
      const { data, error } = await supabase
        .from('student_certifications' as any)
        .insert({
          student_id: params.student_id,
          user_id: params.user_id,
          certification_name: params.certification_name,
          issuing_organization: params.issuing_organization ?? null,
          issue_date: params.issue_date ?? null,
          expiry_date: params.expiry_date ?? null,
          credential_id: params.credential_id ?? null,
          credential_url: params.credential_url ?? null,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student-certifications', variables.student_id] });
      toast.success('Certification added successfully!');
    },
    onError: (error: any) => {
      console.error('Error adding certification:', error);
      toast.error('Failed to add certification');
    },
  });
}

export function useDeleteCertification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, studentId }: { id: string; studentId: string }) => {
      const { error } = await supabase
        .from('student_certifications' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
      return studentId;
    },
    onSuccess: (studentId) => {
      queryClient.invalidateQueries({ queryKey: ['student-certifications', studentId] });
      toast.success('Certification removed');
    },
    onError: (error: any) => {
      console.error('Error deleting certification:', error);
      toast.error('Failed to remove certification');
    },
  });
}
