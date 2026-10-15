import { Layout } from '@/components/layout/Layout';
import { CourseOutcomeAnalytics } from '@/components/course-outcomes/CourseOutcomeAnalytics';
import { useCourseOutcomeAnalytics } from '@/hooks/useCourseOutcomeAnalytics';
import { useAuth } from '@/contexts/AuthContext';

const StudentCourseOutcomes = () => {
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = useCourseOutcomeAnalytics({ studentId: user?.id, institutionId: user?.institution_id, enabled: !!user?.id && !!user?.institution_id });

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Course Outcomes</h1>
          <p className="text-muted-foreground">See your strengths and areas that need improvement</p>
        </div>
        <CourseOutcomeAnalytics data={data} isLoading={isLoading} isError={isError} onRetry={() => { void refetch(); }} personal />
      </div>
    </Layout>
  );
};

export default StudentCourseOutcomes;
