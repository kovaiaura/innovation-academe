import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AwardAchievement {
  id: string;
  title: string;
  type: string;
  event_name: string | null;
  event_date: string | null;
  description: string | null;
  certificate_url: string | null;
  created_at: string | null;
  project_id: string;
  project_title: string;
  institution_id: string | null;
  institution_name: string | null;
  student_names: string[];
}

export function useAwardsAchievements() {
  const { user } = useAuth();
  const role = user?.role;
  const userId = user?.id;
  const institutionId = user?.institution_id;

  return useQuery({
    queryKey: ['awards-achievements', role, userId, institutionId],
    queryFn: async (): Promise<AwardAchievement[]> => {
      if (!userId) return [];

      // Step 1: Get project_achievements with project info and institution
      let query = supabase
        .from('project_achievements')
        .select(`
          id, title, type, event_name, event_date, description, certificate_url, created_at, project_id,
          projects!inner (
            title,
            institution_id,
            institutions ( name )
          )
        `)
        .order('created_at', { ascending: false });

      // Role-based filtering
      if (role === 'student') {
        // Get student's project IDs first
        const { data: studentData } = await supabase
          .from('students')
          .select('id')
          .eq('user_id', userId)
          .single();

        if (!studentData) return [];

        const { data: memberProjects } = await supabase
          .from('project_members')
          .select('project_id')
          .eq('student_id', studentData.id);

        const projectIds = (memberProjects || []).map(m => m.project_id);
        if (projectIds.length === 0) return [];

        query = query.in('project_id', projectIds);
      } else if (role === 'officer' || role === 'management') {
        if (institutionId) {
          query = query.eq('projects.institution_id', institutionId);
        }
      }
      // super_admin / system_admin: no filter

      const { data: achievements, error } = await query;
      if (error) throw error;
      if (!achievements) return [];

      // Step 2: Get student names for each project
      const projectIds = [...new Set(achievements.map(a => a.project_id))];
      
      let studentsByProject: Record<string, string[]> = {};
      if (projectIds.length > 0) {
        const { data: members } = await supabase
          .from('project_members')
          .select('project_id, students ( student_name )')
          .in('project_id', projectIds);

        if (members) {
          for (const m of members) {
            const pid = m.project_id;
            const name = (m as any).students?.student_name;
            if (!studentsByProject[pid]) studentsByProject[pid] = [];
            if (name && !studentsByProject[pid].includes(name)) {
              studentsByProject[pid].push(name);
            }
          }
        }
      }

      return achievements.map((a: any) => ({
        id: a.id,
        title: a.title,
        type: a.type,
        event_name: a.event_name,
        event_date: a.event_date,
        description: a.description,
        certificate_url: a.certificate_url,
        created_at: a.created_at,
        project_id: a.project_id,
        project_title: a.projects?.title || 'Unknown Project',
        institution_id: a.projects?.institution_id || null,
        institution_name: a.projects?.institutions?.name || null,
        student_names: studentsByProject[a.project_id] || [],
      }));
    },
    enabled: !!userId,
  });
}
