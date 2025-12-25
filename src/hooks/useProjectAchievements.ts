import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AddAchievementInput {
  project_id: string;
  title: string;
  type: 'award' | 'participation' | 'achievement';
  event_name?: string;
  event_date?: string;
  description?: string;
  certificate_url?: string;
  added_by_officer_id?: string;
}

export interface UpdateAchievementInput {
  id: string;
  title?: string;
  type?: 'award' | 'participation' | 'achievement';
  event_name?: string;
  event_date?: string;
  description?: string;
  certificate_url?: string;
}

// Add an achievement to a project
export function useAddProjectAchievement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: AddAchievementInput) => {
      const { data, error } = await supabase
        .from('project_achievements')
        .insert({
          project_id: input.project_id,
          title: input.title,
          type: input.type,
          event_name: input.event_name || null,
          event_date: input.event_date || null,
          description: input.description || null,
          certificate_url: input.certificate_url || null,
          added_by_officer_id: input.added_by_officer_id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Achievement added successfully');
    },
    onError: (error) => {
      console.error('Error adding achievement:', error);
      toast.error('Failed to add achievement');
    },
  });
}

// Update an achievement
export function useUpdateProjectAchievement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: UpdateAchievementInput) => {
      const { id, ...updates } = input;
      
      const { data, error } = await supabase
        .from('project_achievements')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Achievement updated successfully');
    },
    onError: (error) => {
      console.error('Error updating achievement:', error);
      toast.error('Failed to update achievement');
    },
  });
}

// Delete an achievement
export function useDeleteProjectAchievement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (achievementId: string) => {
      const { error } = await supabase
        .from('project_achievements')
        .delete()
        .eq('id', achievementId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Achievement deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting achievement:', error);
      toast.error('Failed to delete achievement');
    },
  });
}

// Upload certificate to storage
export async function uploadCertificate(file: File, projectId: string): Promise<string | null> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${projectId}/${Date.now()}.${fileExt}`;
  
  const { error: uploadError } = await supabase.storage
    .from('project-files')
    .upload(fileName, file);
  
  if (uploadError) {
    console.error('Error uploading certificate:', uploadError);
    toast.error('Failed to upload certificate');
    return null;
  }
  
  const { data } = supabase.storage
    .from('project-files')
    .getPublicUrl(fileName);
  
  return data.publicUrl;
}
