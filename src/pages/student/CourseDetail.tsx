import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Video, FileText, Award } from 'lucide-react';
import { mockCourses, mockModules, mockContent, mockAssignments, mockQuizzes } from '@/data/mockCourseData';

export default function StudentCourseDetail() {
  const { courseId } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  
  const course = mockCourses.find(c => c.id === courseId);
  const modules = mockModules.filter(m => m.course_id === courseId);
  const content = mockContent.filter(c => c.course_id === courseId);
  const assignments = mockAssignments.filter(a => a.course_id === courseId);
  const quizzes = mockQuizzes.filter(q => q.course_id === courseId);

  if (!course) return <Layout><div>Course not found</div></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
          <p className="text-muted-foreground mt-2">{course.course_code}</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-muted-foreground">{course.description}</p>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Difficulty</p>
                    <Badge className="mt-1">{course.difficulty}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium">{course.duration_weeks} weeks</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-medium capitalize">{course.category.replace('_', ' ')}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Learning Outcomes</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {course.learning_outcomes.map((outcome, i) => (
                      <li key={i}>{outcome}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Course Progress</h3>
                  <Progress value={65} className="h-2" />
                  <p className="text-sm text-muted-foreground mt-2">65% Complete</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            {modules.map((module) => {
              const moduleContent = content.filter(c => c.module_id === module.id);
              return (
                <Card key={module.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      {module.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {moduleContent.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {item.type === 'video' && <Video className="h-5 w-5" />}
                            {item.type === 'pdf' && <FileText className="h-5 w-5" />}
                            <span>{item.title}</span>
                          </div>
                          <Button size="sm">View</Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="assignments" className="space-y-4">
            {assignments.map((assignment) => (
              <Card key={assignment.id}>
                <CardHeader>
                  <CardTitle>{assignment.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{assignment.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm">Due: {new Date(assignment.due_date).toLocaleDateString()}</p>
                      <p className="text-sm">Points: {assignment.total_points}</p>
                    </div>
                    <Button>Submit</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="quizzes" className="space-y-4">
            {quizzes.map((quiz) => (
              <Card key={quiz.id}>
                <CardHeader>
                  <CardTitle>{quiz.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-muted-foreground">{quiz.description}</p>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Time Limit</p>
                        <p className="font-medium">{quiz.time_limit_minutes} minutes</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Attempts</p>
                        <p className="font-medium">{quiz.attempts_allowed}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Pass %</p>
                        <p className="font-medium">{quiz.pass_percentage}%</p>
                      </div>
                    </div>
                    <Button>Start Quiz</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Overall Progress</span>
                    <span className="text-sm font-medium">65%</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Assignments</p>
                    <p className="text-2xl font-bold">1/2</p>
                    <p className="text-sm">Completed</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Quizzes</p>
                    <p className="text-2xl font-bold">1/1</p>
                    <p className="text-sm">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
