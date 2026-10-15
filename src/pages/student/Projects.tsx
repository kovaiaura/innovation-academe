import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ProjectWithRelations } from "@/hooks/useProjects";
import { ProjectDetailsDialog } from "@/components/project/ProjectDetailsDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { StudentProjectCard } from '@/components/student/StudentProjectCard';
import { useAcademicYear } from '@/contexts/AcademicYearContext';

export default function StudentProjects() {
  const { user } = useAuth();
  const { selectedYear, selectedRange } = useAcademicYear();
  const [selectedProject, setSelectedProject] = useState<ProjectWithRelations | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  // First get student ID from user_id
  const { data: studentData } = useQuery({
    queryKey: ['student-by-user', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Then get projects assigned to this student
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['student-projects', studentData?.id, selectedYear, selectedRange],
    queryFn: async () => {
      if (!studentData?.id) return [];
      
      // Get project IDs the student is a member of
      const { data: memberData, error: memberError } = await supabase
        .from('project_members')
        .select('project_id')
        .eq('student_id', studentData.id);
      
      if (memberError) throw memberError;
      if (!memberData || memberData.length === 0) return [];
      
      const projectIds = memberData.map(m => m.project_id);
      const yearRange = selectedRange;
      
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_members(
            id,
            student_id,
            role,
            student:students(id, student_name, class_id)
          ),
          project_achievements(
            id,
            title,
            type,
            event_name,
            event_date,
            certificate_url,
            created_at
          ),
          project_progress_updates(
            id,
            notes,
            progress_percentage,
            updated_by_officer_name,
            created_at
          )
        `)
        .in('id', projectIds)
        .eq('is_published', true)
        .gte('created_at', yearRange.start)
        .lt('created_at', yearRange.end)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as unknown as ProjectWithRelations[];
    },
    enabled: !!studentData?.id,
  });

  const getMyRole = (project: ProjectWithRelations) => {
    const myMembership = project.project_members?.find(m => m.student_id === studentData?.id);
    return myMembership?.role || 'member';
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Innovation Projects</h1>
          <p className="text-muted-foreground">
            Track your innovation projects and collaborate with your team
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                You are not part of any innovation project yet. Contact your innovation officer to join a project.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <StudentProjectCard
                key={project.id}
                project={project}
                isLeader={getMyRole(project) === 'leader'}
                onSelect={() => {
                  setSelectedProject(project);
                  setIsDetailsDialogOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      <ProjectDetailsDialog
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        project={selectedProject}
        studentPresentation
      />
    </Layout>
  );
}
