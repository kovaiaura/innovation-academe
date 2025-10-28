import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { BookOpen, Clock, User, PlayCircle, Search, Star, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { mockCourses, mockEnrollments } from '@/data/mockCourseData';

export default function Courses() {
  const navigate = useNavigate();
  const { tenantId } = useParams();
  const [activeTab, setActiveTab] = useState('enrolled');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter enrolled courses
  const enrolledCourses = mockEnrollments.map(enrollment => {
    const course = mockCourses.find(c => c.id === enrollment.course_id);
    return course ? { ...course, enrollment } : null;
  }).filter(Boolean);

  // Filter available courses (not enrolled)
  const enrolledIds = mockEnrollments.map(e => e.course_id);
  const availableCourses = mockCourses.filter(c => !enrolledIds.includes(c.id));

  const filteredAvailableCourses = availableCourses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.course_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEnroll = (courseId: string) => {
    toast.success('Enrolled successfully!');
  };

  const handleViewCourse = (courseId: string) => {
    navigate(`/tenant/${tenantId}/student/courses/${courseId}`);
  };

  const categoryColors: Record<string, string> = {
    ai_ml: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    web_dev: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    iot: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    robotics: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    data_science: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  };

  const difficultyColors: Record<string, string> = {
    beginner: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    advanced: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
          <p className="text-muted-foreground mt-2">Access your enrolled courses and discover new ones</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="enrolled">My Enrolled Courses</TabsTrigger>
            <TabsTrigger value="browse">Browse Courses</TabsTrigger>
          </TabsList>

          {/* Enrolled Courses Tab */}
          <TabsContent value="enrolled" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {enrolledCourses.map((item: any) => {
                const course = item;
                const enrollment = item.enrollment;
                return (
                  <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleViewCourse(course.id)}>
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
                        <Badge variant="secondary">
                          {enrollment.progress_percentage}% Complete
                        </Badge>
                      </div>
                    </div>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                          <CardDescription className="mt-1">{course.course_code}</CardDescription>
                        </div>
                        <Badge className={categoryColors[course.category] || ''}>
                          {course.category.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{enrollment.progress_percentage}%</span>
                        </div>
                        <Progress value={enrollment.progress_percentage} className="h-2" />
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Last activity: {new Date(enrollment.last_activity_at).toLocaleDateString()}</span>
                      </div>

                      <Button className="w-full" onClick={(e) => { e.stopPropagation(); handleViewCourse(course.id); }}>
                        <PlayCircle className="mr-2 h-4 w-4" />
                        Continue Learning
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {enrolledCourses.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Enrolled Courses</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Browse available courses and enroll to start learning
                  </p>
                  <Button onClick={() => setActiveTab('browse')}>Browse Courses</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Browse Courses Tab */}
          <TabsContent value="browse" className="space-y-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses by title, code, or category..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredAvailableCourses.map((course) => (
                <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
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
                      <Badge className={difficultyColors[course.difficulty]}>
                        {course.difficulty}
                      </Badge>
                    </div>
                    <div className="absolute top-2 left-2">
                      <Badge className={categoryColors[course.category] || ''}>
                        {course.category.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                    <CardDescription>{course.course_code}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{course.duration_weeks} weeks</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <TrendingUp className="h-4 w-4" />
                        <span>{course.difficulty}</span>
                      </div>
                    </div>

                    {course.learning_outcomes.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        <p className="font-medium mb-1">What you'll learn:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {course.learning_outcomes.slice(0, 2).map((outcome, i) => (
                            <li key={i} className="line-clamp-1">{outcome}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <Button 
                      className="w-full" 
                      onClick={() => handleEnroll(course.id)}
                    >
                      Enroll Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredAvailableCourses.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Search className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Courses Found</h3>
                  <p className="text-muted-foreground text-center">
                    {searchTerm ? 'Try adjusting your search terms' : 'No available courses at the moment'}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
