import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ResumeExtras {
  id?: string;
  student_id: string;
  user_id: string;
  about_me: string | null;
  hobbies: string[];
  sports_achievements: string[];
  linkedin_url: string | null;
}

export function useStudentResumeExtras(studentId: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['student-resume-extras', studentId],
    queryFn: async (): Promise<ResumeExtras | null> => {
      if (!studentId || !user?.id) return null;

      const { data, error } = await supabase
        .from('student_resume_extras' as any)
        .select('*')
        .eq('student_id', studentId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching resume extras:', error);
        return null;
      }

      if (!data) return null;

      return {
        id: (data as any).id,
        student_id: (data as any).student_id,
        user_id: (data as any).user_id,
        about_me: (data as any).about_me,
        hobbies: (data as any).hobbies || [],
        sports_achievements: (data as any).sports_achievements || [],
        linkedin_url: (data as any).linkedin_url,
      };
    },
    enabled: !!studentId && !!user?.id,
  });
}

interface UpsertExtrasParams {
  student_id: string;
  user_id: string;
  about_me?: string | null;
  hobbies?: string[];
  sports_achievements?: string[];
  linkedin_url?: string | null;
}

export function useUpdateResumeExtras() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpsertExtrasParams) => {
      const { data, error } = await supabase
        .from('student_resume_extras' as any)
        .upsert(
          {
            student_id: params.student_id,
            user_id: params.user_id,
            about_me: params.about_me ?? null,
            hobbies: params.hobbies ?? [],
            sports_achievements: params.sports_achievements ?? [],
            linkedin_url: params.linkedin_url ?? null,
          } as any,
          { onConflict: 'student_id' }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['student-resume-extras', variables.student_id] });
      queryClient.invalidateQueries({ queryKey: ['student-resume'] });
      toast.success('Resume details saved successfully!');
    },
    onError: (error: any) => {
      console.error('Error saving resume extras:', error);
      toast.error('Failed to save resume details');
    },
  });
}
