import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PlayCircle, RotateCcw, CheckCircle, BookOpen, Clock, Lock } from 'lucide-react';
import { mockClassCourseAssignments } from '@/data/mockClassCourseAssignments';
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
  const classAssignments = mockClassCourseAssignments.filter(
    ca => ca.class_id === classId
  );

  const assignedCourseIds = classAssignments.map(ca => ca.course_id);
  const assignedCourses = mockCourses.filter(c => assignedCourseIds.includes(c.id));

  const handleLaunchCourse = (courseId: string, continueFrom?: boolean) => {
    const assignment = classAssignments.find(ca => ca.course_id === courseId);
    const progress = mockClassCourseProgress.find(
      p => p.class_id === classId && p.course_id === courseId
    );

    // Get allowed module IDs for this class (only unlocked modules)
    const allowedModuleIds = assignment?.assigned_modules
      .filter(m => m.is_unlocked)
      .map(m => m.module_id) || [];

    // Build navigation URL with class context AND allowed modules
    let url = `/tenant/${tenantId}/officer/courses/${courseId}/viewer?class_id=${classId}&class_name=${encodeURIComponent(className)}`;
    
    // Pass allowed modules as comma-separated list
    if (allowedModuleIds.length > 0) {
      url += `&allowed_modules=${allowedModuleIds.join(',')}`;
    }
    
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
          const assignment = classAssignments.find(ca => ca.course_id === course.id);
          const progress = mockClassCourseProgress.find(
            p => p.class_id === classId && p.course_id === course.id
          );

          // Get assigned modules for this class
          const assignedModules = assignment?.assigned_modules || [];
          const totalModules = assignedModules.length;
          const unlockedModules = assignedModules.filter(m => m.is_unlocked);
          const lockedModules = assignedModules.filter(m => !m.is_unlocked);
          
          // Calculate completion based on assigned modules only
          const completedModules = progress?.completed_modules.filter(
            moduleId => assignedModules.some(am => am.module_id === moduleId)
          ).length || 0;
          
          const completionPercentage = totalModules > 0 
            ? Math.round((completedModules / totalModules) * 100)
            : 0;
          
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
                      <span className="font-medium">{completionPercentage}%</span>
                    </div>
                    <Progress value={completionPercentage} />
                  </div>

                  {/* Module Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {completedModules}/{totalModules} modules completed
                      </span>
                    </div>
                    
                    {/* Module Availability Info */}
                    <div className="flex items-center gap-2 text-sm">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <span className="text-primary font-medium">
                        {unlockedModules.length} of {totalModules} modules available
                      </span>
                    </div>
                    
                    {/* Locked Modules Warning */}
                    {lockedModules.length > 0 && (
                      <div className="flex items-center gap-2 text-sm p-2 bg-amber-50 dark:bg-amber-950 rounded-md">
                        <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        <span className="text-amber-700 dark:text-amber-300">
                          {lockedModules.length} {lockedModules.length === 1 ? 'module' : 'modules'} locked by admin
                        </span>
                      </div>
                    )}
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
