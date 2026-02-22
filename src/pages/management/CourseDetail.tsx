import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Loader2, ChevronLeft } from 'lucide-react';
import { LMSCourseViewer } from '@/components/student/LMSCourseViewer';
import { Button } from '@/components/ui/button';
import { useCurrentUserInstitution } from '@/hooks/useCurrentUserInstitution';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function ManagementCourseDetail() {
  const { courseId, tenantId } = useParams();
  const navigate = useNavigate();
  const { institutionId } = useCurrentUserInstitution();

  // Fetch the specific course with institution assignment filtering
  const { data: course, isLoading } = useQuery({
    queryKey: ['institution-course-detail', courseId, institutionId],
    queryFn: async () => {
      if (!courseId || !institutionId) return null;

      // Check assignment
      const { data: assignment } = await supabase
        .from('course_institution_assignments')
        .select('selected_module_ids, selected_session_ids')
        .eq('course_id', courseId)
        .eq('institution_id', institutionId)
        .maybeSingle();

      if (!assignment) return null;

      const selectedModuleIds = assignment.selected_module_ids as string[] | null;
      const selectedSessionIds = assignment.selected_session_ids as string[] | null;

      // Fetch course
      const { data: courseData, error } = await supabase
        .from('courses')
        .select('id, title, course_code, description')
        .eq('id', courseId)
        .single();
      if (error) throw error;

      // Fetch modules
      let modulesQuery = supabase
        .from('course_modules')
        .select('id, course_id, title, description, display_order')
        .eq('course_id', courseId)
        .order('display_order');
      const { data: modules } = await modulesQuery;

      const filteredModules = (modules || []).filter(m => !selectedModuleIds || selectedModuleIds.includes(m.id));
      const moduleIds = filteredModules.map(m => m.id);

      // Fetch sessions
      let sessions: any[] = [];
      if (moduleIds.length > 0) {
        const { data } = await supabase
          .from('course_sessions')
          .select('id, module_id, title, description, display_order')
          .in('module_id', moduleIds)
          .order('display_order');
        sessions = (data || []).filter(s => !selectedSessionIds || selectedSessionIds.includes(s.id));
      }

      // Fetch content
      const sessionIds = sessions.map(s => s.id);
      let content: any[] = [];
      if (sessionIds.length > 0) {
        const { data } = await supabase
          .from('course_content')
          .select('id, course_id, module_id, session_id, title, type, file_path, youtube_url, duration_minutes, file_size_mb, display_order, views_count, created_at')
          .in('session_id', sessionIds)
          .order('display_order');
        content = data || [];
      }

      return {
        ...courseData,
        modules: filteredModules.map(m => ({
          id: m.id,
          module: { id: m.id, title: m.title, description: m.description },
          is_unlocked: true,
          sessions: sessions
            .filter(s => s.module_id === m.id)
            .map(s => ({
              id: s.id,
              session: { id: s.id, title: s.title, description: s.description },
              is_unlocked: true,
              content: content.filter(c => c.session_id === s.id),
            })),
        })),
      };
    },
    enabled: !!courseId && !!institutionId,
  });

  if (isLoading) {
    return (
      <Layout hideNav>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!course) {
    return (
      <Layout>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
            <BookOpen className="h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Course Not Found</h3>
            <p className="text-muted-foreground text-center">
              This course is not available or has not been assigned to your institution.
            </p>
            <Button variant="outline" onClick={() => navigate(`/tenant/${tenantId}/management/courses-sessions`)}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Button>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout hideNav>
      <LMSCourseViewer 
        course={{
          id: course.id,
          title: course.title || '',
          course_code: course.course_code || '',
          description: course.description
        }} 
        modules={course.modules || []}
        viewOnly={true}
        backPath={`/tenant/${tenantId}/management/courses-sessions`}
      />
    </Layout>
  );
}
