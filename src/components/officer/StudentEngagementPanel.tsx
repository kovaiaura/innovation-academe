import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Users, Eye, CheckCircle, Clock } from 'lucide-react';
import { mockEnrollments } from '@/data/mockCourseData';

interface StudentEngagementPanelProps {
  courseId: string;
  contentId: string | null;
}

export function StudentEngagementPanel({
  courseId,
  contentId,
}: StudentEngagementPanelProps) {
  // Get enrolled students for this course
  const enrolledStudents = mockEnrollments.filter(e => e.course_id === courseId);
  
  // Simulate active viewers (students currently viewing content)
  const activeViewers = enrolledStudents.slice(0, Math.floor(enrolledStudents.length * 0.6));
  const completedStudents = enrolledStudents.filter(e => e.progress_percentage >= 90);

  return (
    <div className="w-80 border-l bg-muted/30 flex flex-col">
      <div className="p-4 border-b bg-card">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <Users className="h-5 w-5" />
          Student Activity
        </h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Stats Cards */}
          <Card>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    Enrolled
                  </div>
                  <p className="text-2xl font-bold">{enrolledStudents.length}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Eye className="h-4 w-4" />
                    Active Now
                  </div>
                  <p className="text-2xl font-bold">{activeViewers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Average Progress */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Average Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Progress 
                  value={
                    enrolledStudents.reduce((sum, e) => sum + e.progress_percentage, 0) / 
                    enrolledStudents.length
                  } 
                />
                <p className="text-xs text-muted-foreground">
                  {completedStudents.length} students completed
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Currently Viewing */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Eye className="h-4 w-4 text-green-500" />
                Currently Viewing
              </CardTitle>
              <CardDescription>
                {activeViewers.length} students active
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {activeViewers.slice(0, 5).map((student) => (
                  <div key={student.id} className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={student.student_id} />
                        <AvatarFallback>
                          {student.student_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-card rounded-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {student.student_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {student.progress_percentage}% complete
                      </p>
                    </div>
                  </div>
                ))}
                {activeViewers.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    +{activeViewers.length - 5} more students
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* All Students */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                All Students
              </CardTitle>
              <CardDescription>
                Enrollment overview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {enrolledStudents.map((student) => {
                  const isActive = activeViewers.some(v => v.id === student.id);
                  return (
                    <div key={student.id} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={student.student_id} />
                        <AvatarFallback>
                          {student.student_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">
                            {student.student_name}
                          </p>
                          {isActive && (
                            <Badge variant="outline" className="text-xs">
                              Active
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress 
                            value={student.progress_percentage} 
                            className="h-1 flex-1"
                          />
                          <span className="text-xs text-muted-foreground">
                            {student.progress_percentage}%
                          </span>
                        </div>
                      </div>
                      {student.progress_percentage >= 90 && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-xs text-muted-foreground">
                <div>
                  <span className="font-medium text-foreground">John Smith</span> completed Module 1
                  <div className="text-xs">2 minutes ago</div>
                </div>
                <div>
                  <span className="font-medium text-foreground">Sarah Johnson</span> started watching video
                  <div className="text-xs">5 minutes ago</div>
                </div>
                <div>
                  <span className="font-medium text-foreground">Mike Chen</span> submitted assignment
                  <div className="text-xs">15 minutes ago</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
