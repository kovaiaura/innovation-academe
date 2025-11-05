import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PlayCircle, RotateCcw, CheckCircle, BookOpen, Clock } from 'lucide-react';
import { mockCourseAssignments } from '@/data/mockCourseData';
import { mockCourses, mockModules } from '@/data/mockCourseData';
import { mockClassCourseProgress } from '@/data/mockClassTeachingProgress';
import { getTeachingStatusColor, getTeachingStatusText, formatTeachingDuration } from '@/utils/classTeachingHelpers';
import { format } from 'date-fns';

interface ClassCourseLauncherProps {
  classId: string;
  className: string;
  officerId: string;
}

export function ClassCourseLauncher({ classId, className, officerId }: ClassCourseLauncherProps) {
  const { tenantId } = useParams();
  const navigate = useNavigate();

  // Get courses assigned to this class
  const classAssignments = mockCourseAssignments.filter(
    ca => ca.class_level === className || ca.class_level.includes(className.split(' ')[0])
  );

  const assignedCourseIds = classAssignments.map(ca => ca.course_id);
  const assignedCourses = mockCourses.filter(c => assignedCourseIds.includes(c.id));

  const handleLaunchCourse = (courseId: string, continueFrom?: boolean) => {
    const progress = mockClassCourseProgress.find(
      p => p.class_id === classId && p.course_id === courseId
    );

    // Build navigation URL with class context
    let url = `/tenant/${tenantId}/officer/courses/${courseId}/viewer?class_id=${classId}&class_name=${encodeURIComponent(className)}`;
    
    if (continueFrom && progress?.current_module_id) {
      url += `&module_id=${progress.current_module_id}&content_index=${progress.current_content_index || 0}`;
    }

    navigate(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Courses for {className}</h2>
        <p className="text-muted-foreground mt-1">
          Select a course to start teaching or continue from where you left off
        </p>
      </div>

      {assignedCourses.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No courses assigned to this class yet
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Contact the system administrator to assign courses
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {assignedCourses.map((course) => {
          const progress = mockClassCourseProgress.find(
            p => p.class_id === classId && p.course_id === course.id
          );

          const courseModules = mockModules.filter(m => m.course_id === course.id);
          const totalModules = courseModules.length;
          const completedModules = progress?.completed_modules.length || 0;
          const status = progress?.status || 'not_started';
          const canContinue = status === 'in_progress' && progress?.current_module_id;

          return (
            <Card key={course.id}>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-lg leading-tight">{course.title}</CardTitle>
                        <CardDescription className="mt-1">{course.course_code}</CardDescription>
                      </div>
                      <Badge variant={getTeachingStatusColor(status) as any} className="shrink-0">
                        {getTeachingStatusText(status)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{progress?.completion_percentage || 0}%</span>
                    </div>
                    <Progress value={progress?.completion_percentage || 0} />
                  </div>

                  {/* Module Progress */}
                  <div className="flex items-center gap-2 text-sm">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {completedModules}/{totalModules} modules completed
                    </span>
                  </div>

                  {/* Teaching Stats */}
                  {progress && progress.total_sessions > 0 && (
                    <>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {progress.total_sessions} sessions • {progress.total_hours.toFixed(1)}h taught
                        </span>
                      </div>
                      
                      {progress.last_session_date && (
                        <div className="text-sm text-muted-foreground">
                          Last session: {format(new Date(progress.last_session_date), 'MMM dd, yyyy')}
                        </div>
                      )}

                      {canContinue && progress.last_module_title && (
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-sm font-medium">Continue from:</p>
                          <p className="text-sm text-muted-foreground">{progress.last_module_title}</p>
                        </div>
                      )}
                    </>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    {canContinue ? (
                      <>
                        <Button
                          className="flex-1"
                          onClick={() => handleLaunchCourse(course.id, true)}
                        >
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Continue Teaching
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleLaunchCourse(course.id, false)}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </>
                    ) : status === 'completed' ? (
                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={() => handleLaunchCourse(course.id, false)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Review Course
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={() => handleLaunchCourse(course.id, false)}
                      >
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Start Teaching
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
