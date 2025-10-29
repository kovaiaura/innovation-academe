import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, ClipboardCheck, Award, Search, PlayCircle, TrendingUp } from 'lucide-react';
import { mockCourses, mockEnrollments, mockSubmissions } from '@/data/mockCourseData';
import { CourseContentTab } from '@/components/officer/CourseContentTab';
import { AssignmentsAndQuizzesTab } from '@/components/officer/AssignmentsAndQuizzesTab';
import { SessionSelectionDialog } from '@/components/officer/SessionSelectionDialog';
import { getAllSessionProgressForCourse } from '@/utils/sessionHelpers';
import { Course } from '@/types/course';
import { format } from 'date-fns';

export default function OfficerCourseManagement() {
  const { tenantId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('my-courses');
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const assignedCourses = mockCourses.slice(0, 2);
  const pendingGrades = mockSubmissions.filter(s => s.status === 'pending').length;
  const officerId = 'off-001'; // In real app, get from auth context

  const handleLaunchCourse = (course: Course) => {
    setSelectedCourse(course);
    setSessionDialogOpen(true);
  };

  const handleSessionStart = (sessionId: string, className: string, slotId?: string) => {
    navigate(`/tenant/${tenantId}/officer/courses/${selectedCourse?.id}/viewer?session_id=${sessionId}&class=${encodeURIComponent(className)}${slotId ? `&slot_id=${slotId}` : ''}`);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Course Management</h1>
          <p className="text-muted-foreground mt-2">Manage your assigned courses and student progress</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="my-courses">My Courses</TabsTrigger>
            <TabsTrigger value="content">Course Content</TabsTrigger>
            <TabsTrigger value="enrollments">Student Enrollment</TabsTrigger>
            <TabsTrigger value="grading">Grading</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          {/* Course Content Tab - Enhanced View */}
          <TabsContent value="content" className="space-y-6">
            <CourseContentTab />
          </TabsContent>

          <TabsContent value="my-courses" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Assigned Courses</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{assignedCourses.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockEnrollments.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Grades</CardTitle>
                  <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingGrades}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(mockEnrollments.reduce((sum, e) => sum + e.progress_percentage, 0) / mockEnrollments.length).toFixed(0)}%
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {assignedCourses.map((course) => {
                const sessionProgress = getAllSessionProgressForCourse(course.id);
                
                return (
                  <Card key={course.id}>
                    <CardHeader>
                      <CardTitle>{course.title}</CardTitle>
                      <CardDescription>{course.course_code}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Per-Class Progress */}
                        {sessionProgress.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm flex items-center gap-2">
                              <TrendingUp className="h-4 w-4" />
                              Class Progress
                            </h4>
                            <div className="space-y-2">
                              {sessionProgress.map(progress => (
                                <div 
                                  key={progress.class_name}
                                  className="flex justify-between items-center p-2 border rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">{progress.class_name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      Module {progress.completed_modules}/{progress.total_modules} • 
                                      Last: {format(new Date(progress.last_session_date), 'MMM dd')}
                                    </p>
                                  </div>
                                  <Badge variant="secondary" className="text-xs">
                                    {progress.total_sessions} sessions
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex justify-between text-sm pt-2 border-t">
                          <span className="text-muted-foreground">Total Enrollments</span>
                          <span className="font-medium">
                            {mockEnrollments.filter(e => e.course_id === course.id).length}
                          </span>
                        </div>
                        
                        <Button 
                          className="w-full"
                          onClick={() => handleLaunchCourse(course)}
                        >
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Start New Session
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="grading" className="space-y-6">
            <AssignmentsAndQuizzesTab />
          </TabsContent>

          <TabsContent value="enrollments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Enrolled Students</CardTitle>
                <CardDescription>Track student progress and engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Activity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockEnrollments.map((enrollment) => (
                      <TableRow key={enrollment.id}>
                        <TableCell>{enrollment.student_name}</TableCell>
                        <TableCell>{enrollment.course_code}</TableCell>
                        <TableCell>{enrollment.progress_percentage}%</TableCell>
                        <TableCell>
                          <Badge variant={enrollment.status === 'active' ? 'default' : 'secondary'}>
                            {enrollment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(enrollment.last_activity_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Session Selection Dialog */}
        <SessionSelectionDialog
          open={sessionDialogOpen}
          onOpenChange={setSessionDialogOpen}
          course={selectedCourse}
          officerId={officerId}
          onSessionStart={handleSessionStart}
        />
      </div>
    </Layout>
  );
}
