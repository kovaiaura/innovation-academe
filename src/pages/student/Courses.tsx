import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, PlayCircle, Loader2 } from 'lucide-react';
import { useStudentCourses } from '@/hooks/useClassCourseAssignments';
import { useAuth } from '@/contexts/AuthContext';

export default function Courses() {
  const navigate = useNavigate();
  const { tenantId } = useParams();
  const { user } = useAuth();

  // Fetch courses assigned to student's class
  const { data: assignedCourses, isLoading } = useStudentCourses(user?.id, user?.class_id);

  const handleViewCourse = (courseId: string) => {
    navigate(`/tenant/${tenantId}/student/courses/${courseId}`);
  };

  const categoryColors: Record<string, string> = {
    ai_ml: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    web_dev: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    iot: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    robotics: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    data_science: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    general: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
  };

  const difficultyColors: Record<string, string> = {
    beginner: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    advanced: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
          <p className="text-muted-foreground mt-2">Access your assigned courses</p>
        </div>

        {/* Assigned Courses */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {assignedCourses?.map((item) => {
            const course = item.course;
            if (!course) return null;
            
            // Count unlocked modules
            const unlockedModules = item.modules?.length || 0;
            
            return (
              <Card 
                key={item.id} 
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" 
                onClick={() => handleViewCourse(course.id)}
              >
                <div className="relative h-40 overflow-hidden">
                  {course.thumbnail_url ? (
                    <img 
                      src={course.thumbnail_url} 
                      alt={course.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary to-primary/50">
                      <BookOpen className="h-16 w-16 text-white" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge className={difficultyColors[course.difficulty] || ''}>
                      {course.difficulty}
                    </Badge>
                  </div>
                  <div className="absolute top-2 left-2">
                    <Badge className={categoryColors[course.category] || categoryColors.general}>
                      {course.category?.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <CardHeader>
                  <div className="flex-1">
                    <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                    <CardDescription className="mt-1">{course.course_code}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{unlockedModules} Modules Available</span>
                    </div>
                  </div>

                  <Button className="w-full" onClick={(e) => { e.stopPropagation(); handleViewCourse(course.id); }}>
                    <PlayCircle className="mr-2 h-4 w-4" />
                    View Course
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {(!assignedCourses || assignedCourses.length === 0) && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Courses Assigned</h3>
              <p className="text-muted-foreground text-center">
                No courses have been assigned to your class yet. Please check back later.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}