import { Layout } from '@/components/layout/Layout';
import { CourseOutcomeAnalytics } from '@/components/course-outcomes/CourseOutcomeAnalytics';
import { useCourseOutcomeAnalytics } from '@/hooks/useCourseOutcomeAnalytics';
import { useAuth } from '@/contexts/AuthContext';

const StudentCourseOutcomes = () => {
  const { user } = useAuth();
  const { data, isLoading } = useCourseOutcomeAnalytics({ studentId: user?.id });

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Course Outcomes</h1>
          <p className="text-muted-foreground">See your strengths and areas that need improvement</p>
        </div>
        <CourseOutcomeAnalytics data={data || { courseAccuracies: [], moduleAccuracies: [], sessionAccuracies: [], strengths: [], weaknesses: [] }} isLoading={isLoading} />
      </div>
    </Layout>
  );
};

export default StudentCourseOutcomes;
