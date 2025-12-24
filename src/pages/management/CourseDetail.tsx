import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useInstitutionCourseAssignments } from '@/hooks/useClassCourseAssignments';
import { LMSCourseViewer } from '@/components/student/LMSCourseViewer';

export default function ManagementCourseDetail() {
  const { courseId, tenantId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const institutionId = user?.institution_id;

  // Fetch institution courses
  const { data: institutionCourses, isLoading } = useInstitutionCourseAssignments(institutionId || '');
  
  // Find the specific course
  const course = institutionCourses?.find(c => c.id === courseId);

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
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Course Not Found</h3>
            <p className="text-muted-foreground text-center">
              This course is not available or has not been assigned to your institution.
            </p>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  // Use the modules from the course data (already structured from hook)
  const modules = (course.modules || []).map((mod: any) => ({
    id: mod.id,
    module: mod.module || mod.course_modules,
    sessions: (mod.sessions || mod.session_assignments || []).map((sess: any) => ({
      id: sess.id,
      session: sess.session || sess.course_sessions,
      content: sess.content || [],
      is_unlocked: true
    })),
    is_unlocked: true
  }));

  return (
    <Layout hideNav>
      <LMSCourseViewer 
        course={{
          id: course.id,
          title: course.title || '',
          course_code: course.course_code || '',
          description: course.description
        }} 
        modules={modules}
        viewOnly={true}
        backPath={`/tenant/${tenantId}/management/courses-sessions`}
      />
    </Layout>
  );
}
