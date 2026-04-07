import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, CheckCircle, Circle, BookOpen, Lock, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ThumbnailImage } from '@/components/officer/ThumbnailImage';

interface ClassCourseLauncherProps {
  classId: string;
  className: string;
  officerId: string;
}

export function ClassCourseLauncher({ classId, className, officerId }: ClassCourseLauncherProps) {
  const { tenantId } = useParams();
  const navigate = useNavigate();

  // Fetch course class assignments for this class
  const { data: classAssignments, isLoading: loadingAssignments } = useQuery({
    queryKey: ['class-course-assignments', classId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_class_assignments')
        .select(`
          id,
          course_id,
          assigned_at,
          courses (
            id,
            title,
            course_code,
            description,
            thumbnail_url,
            status,
            difficulty
          )
        `)
        .eq('class_id', classId);
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch module assignments for this class
  const { data: moduleAssignments, isLoading: loadingModules } = useQuery({
    queryKey: ['class-module-assignments', classId],
    queryFn: async () => {
      if (!classAssignments?.length) return [];
      
      const assignmentIds = classAssignments.map(ca => ca.id);
      const { data, error } = await supabase
        .from('class_module_assignments')
        .select(`
          id,
          class_assignment_id,
          module_id,
          is_unlocked,
          unlock_order,
          course_modules (
            id,
            title,
            description,
            display_order,
            course_id
          )
        `)
        .in('class_assignment_id', assignmentIds)
        .order('unlock_order', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!classAssignments?.length
  });

  // Fetch session assignments for this class
  const { data: sessionAssignments, isLoading: loadingSessions } = useQuery({
    queryKey: ['class-session-assignments', classId, moduleAssignments],
    queryFn: async () => {
      if (!moduleAssignments?.length) return [];
      
      const moduleAssignmentIds = moduleAssignments.map(ma => ma.id);
      const { data, error } = await supabase
        .from('class_session_assignments')
        .select(`
          id,
          class_module_assignment_id,
          session_id,
          is_unlocked,
          unlock_order,
          course_sessions (
            id,
            title,
            description,
            display_order,
            module_id
          )
        `)
        .in('class_module_assignment_id', moduleAssignmentIds)
        .order('unlock_order', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!moduleAssignments?.length
  });

  // Fetch completion data to determine session/module status
  const { data: completionData } = useQuery({
    queryKey: ['class-completion-status', classId, classAssignments],
    queryFn: async () => {
      if (!classAssignments?.length) return { completedSessions: new Set<string>() };

      const assignmentIds = classAssignments.map(ca => ca.id);

      // Get all content grouped by session for assigned courses
      const courseIds = classAssignments.map(ca => ca.course_id);
      const { data: allContent } = await supabase
        .from('course_content')
        .select('id, session_id')
        .in('course_id', courseIds);

      if (!allContent || allContent.length === 0) return { completedSessions: new Set<string>() };

      // Group content by session
      const contentBySession: Record<string, string[]> = {};
      allContent.forEach(c => {
        if (!contentBySession[c.session_id]) contentBySession[c.session_id] = [];
        contentBySession[c.session_id].push(c.id);
      });

      // Get all completions for these assignments
      const { data: completions } = await supabase
        .from('student_content_completions')
        .select('content_id, class_assignment_id')
        .in('class_assignment_id', assignmentIds);

      const completedContentIds = new Set((completions || []).map(c => c.content_id));

      // A session is "completed" if ALL its content has at least one completion
      const completedSessions = new Set<string>();
      Object.entries(contentBySession).forEach(([sessionId, contentIds]) => {
        if (contentIds.length > 0 && contentIds.every(id => completedContentIds.has(id))) {
          completedSessions.add(sessionId);
        }
      });

      return { completedSessions };
    },
    enabled: !!classAssignments?.length
  });

  const completedSessions = completionData?.completedSessions || new Set<string>();

  const isLoading = loadingAssignments || loadingModules || loadingSessions;

  const handleLaunchCourse = (courseId: string, classAssignmentId: string) => {
    const url = `/tenant/${tenantId}/officer/teaching/${courseId}?class_id=${classId}&class_name=${encodeURIComponent(className)}&assignment_id=${classAssignmentId}`;
    navigate(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const assignedCourses = classAssignments?.map(ca => ({
    assignment: ca,
    course: ca.courses
  })).filter(item => item.course) || [];

  // Helper to determine if a module is completed (all its unlocked sessions are completed)
  const isModuleCompleted = (moduleAssignmentId: string) => {
    const sessions = sessionAssignments?.filter(
      s => s.class_module_assignment_id === moduleAssignmentId
    ) || [];
    if (sessions.length === 0) return false;
    return sessions.every(s => completedSessions.has(s.session_id));
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
        {assignedCourses.map(({ assignment, course }) => {
          const courseModules = moduleAssignments?.filter(
            m => m.class_assignment_id === assignment.id
          ) || [];
          
          const totalModules = courseModules.length;
          const unlockedModules = courseModules.filter(m => m.is_unlocked);
          const lockedModules = courseModules.filter(m => !m.is_unlocked);

          const getModuleSessions = (moduleAssignmentId: string) => {
            return sessionAssignments?.filter(
              s => s.class_module_assignment_id === moduleAssignmentId
            ) || [];
          };

          return (
            <Card key={assignment.id}>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <ThumbnailImage 
                    thumbnailPath={course.thumbnail_url}
                    alt={course.title}
                    className="w-20 h-20 rounded-lg object-cover"
                    fallbackClassName="w-20 h-20 rounded-lg bg-muted flex items-center justify-center"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-lg leading-tight">{course.title}</CardTitle>
                        <CardDescription className="mt-1">{course.course_code}</CardDescription>
                      </div>
                      <Badge variant="default" className="shrink-0">
                        {course.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <span className="font-medium">
                        {unlockedModules.length} of {totalModules} levels available
                      </span>
                    </div>
                    
                    {lockedModules.length > 0 && (
                      <div className="flex items-center gap-2 text-sm p-2 bg-amber-50 dark:bg-amber-950 rounded-md">
                        <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        <span className="text-amber-700 dark:text-amber-300">
                          {lockedModules.length} {lockedModules.length === 1 ? 'level' : 'levels'} locked
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {courseModules.map((moduleAssignment) => {
                      const sessions = getModuleSessions(moduleAssignment.id);
                      const moduleCompleted = moduleAssignment.is_unlocked && isModuleCompleted(moduleAssignment.id);
                      
                      // Module icon: locked (amber) / unlocked-not-completed (blue) / completed (green)
                      const renderModuleIcon = () => {
                        if (!moduleAssignment.is_unlocked) {
                          return <Lock className="h-4 w-4 text-amber-500" />;
                        }
                        if (moduleCompleted) {
                          return <CheckCircle className="h-4 w-4 text-green-600" />;
                        }
                        return <Circle className="h-4 w-4 text-blue-500" />;
                      };

                      return (
                        <div 
                          key={moduleAssignment.id}
                          className={`p-2 rounded-md border ${
                            moduleAssignment.is_unlocked 
                              ? 'bg-background border-border' 
                              : 'bg-muted/50 border-muted'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {renderModuleIcon()}
                            <span className={`text-sm font-medium ${
                              !moduleAssignment.is_unlocked ? 'text-muted-foreground' : ''
                            }`}>
                              {moduleAssignment.course_modules?.title || 'Level'}
                            </span>
                          </div>
                          {moduleAssignment.is_unlocked && sessions.length > 0 && (
                            <div className="ml-6 mt-1 space-y-1">
                              {sessions.map(session => {
                                const sessionCompleted = completedSessions.has(session.session_id);
                                
                                // Session icon: locked (amber) / unlocked-not-completed (blue) / completed (green)
                                const renderSessionIcon = () => {
                                  if (!session.is_unlocked) {
                                    return <Lock className="h-3 w-3 text-amber-500" />;
                                  }
                                  if (sessionCompleted) {
                                    return <CheckCircle className="h-3 w-3 text-green-500" />;
                                  }
                                  return <Circle className="h-3 w-3 text-blue-500" />;
                                };

                                return (
                                  <div 
                                    key={session.id}
                                    className="flex items-center gap-2 text-xs text-muted-foreground"
                                  >
                                    {renderSessionIcon()}
                                    <span>{session.course_sessions?.title || 'Session'}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2">
                    <Button
                      className="w-full"
                      onClick={() => handleLaunchCourse(course.id, assignment.id)}
                      disabled={unlockedModules.length === 0}
                    >
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Start Teaching
                    </Button>
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
