import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Maximize2, Minimize2, Calendar, CheckCircle2, Users as UsersIcon } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ModuleNavigationSidebar } from '@/components/officer/ModuleNavigationSidebar';
import { ContentDisplayArea } from '@/components/officer/ContentDisplayArea';
import { StudentEngagementPanel } from '@/components/officer/StudentEngagementPanel';
import { CompletionTimelineDialog } from '@/components/officer/CompletionTimelineDialog';
import { SessionAttendanceDialog } from '@/components/officer/SessionAttendanceDialog';
import { mockCourses, mockModules, mockContent } from '@/data/mockCourseData';
import { toast } from 'sonner';
import type { ContentCompletion, CompletionTimelineItem, CourseProgress } from '@/types/contentCompletion';
import { getSessionDelivery, updateSessionProgress, getSessionProgressByClass } from '@/utils/sessionHelpers';
import { format } from 'date-fns';

export default function CourseContentViewer() {
  const { tenantId, courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [showStudentPanel, setShowStudentPanel] = useState(true);
  const [showTimelineDialog, setShowTimelineDialog] = useState(false);
  const [showAttendanceDialog, setShowAttendanceDialog] = useState(false);
  const [completions, setCompletions] = useState<ContentCompletion[]>([]);
  
  // Extract session context from URL
  const searchParams = new URLSearchParams(location.search);
  const sessionId = searchParams.get('session_id');
  const className = searchParams.get('class');
  const slotId = searchParams.get('slot_id');
  const classId = searchParams.get('class_id');
  const allowedModulesParam = searchParams.get('allowed_modules');
  const allowedModuleIds = allowedModulesParam ? allowedModulesParam.split(',') : null;

  // Get course data
  const course = mockCourses.find(c => c.id === courseId);
  
  // Get course modules - filter to only allowed modules if teaching a specific class
  let courseModules = mockModules.filter(m => m.course_id === courseId);
  if (allowedModuleIds) {
    courseModules = courseModules.filter(m => allowedModuleIds.includes(m.id));
  }
  // Sort by order
  courseModules = courseModules.sort((a, b) => a.order - b.order);
  
  const selectedModule = courseModules.find(m => m.id === selectedModuleId);
  const moduleContent = selectedModuleId 
    ? mockContent.filter(c => c.module_id === selectedModuleId)
    : [];
  const selectedContent = moduleContent.find(c => c.id === selectedContentId);

  // Load completions - either from session or from localStorage
  useEffect(() => {
    if (sessionId) {
      // Load completions from session
      const session = getSessionDelivery(sessionId);
      if (session) {
        const sessionCompletions: ContentCompletion[] = session.content_completed.map(contentId => ({
          content_id: contentId,
          module_id: session.current_module_id,
          session_id: '', // Session context - no specific session
          course_id: courseId!,
          officer_id: session.officer_id,
          completed: true,
          completed_at: session.created_at,
        }));
        setCompletions(sessionCompletions);
      }
    } else {
      // Fallback to localStorage for backward compatibility
      const officerId = 'officer-1';
      const storageKey = `officer_content_progress_${officerId}_${courseId}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          setCompletions(JSON.parse(stored));
        } catch (e) {
          console.error('Failed to parse completions:', e);
        }
      }
    }
  }, [courseId, sessionId]);

  // Save completions - to session if available, otherwise localStorage
  useEffect(() => {
    if (courseId) {
      if (sessionId) {
        // Session mode - completions are saved via updateSessionProgress
        // No need to save to localStorage
      } else {
        // Fallback mode - save to localStorage
        const officerId = 'officer-1';
        const storageKey = `officer_content_progress_${officerId}_${courseId}`;
        localStorage.setItem(storageKey, JSON.stringify(completions));
      }
    }
  }, [completions, courseId, sessionId]);

  // Auto-select first module and content on load
  useEffect(() => {
    if (courseModules.length > 0 && !selectedModuleId) {
      const firstModule = courseModules[0];
      setSelectedModuleId(firstModule.id);
      const firstContent = mockContent.find(c => c.module_id === firstModule.id);
      if (firstContent) {
        setSelectedContentId(firstContent.id);
      }
    }
  }, [courseModules, selectedModuleId]);

  if (!course) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Course Not Found</h2>
          <Button onClick={() => navigate(`/tenant/${tenantId}/officer/course-management`)}>
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  const handleContentSelect = (contentId: string, moduleId: string, sessionId: string) => {
    setSelectedModuleId(moduleId);
    setSelectedContentId(contentId);
  };

  const handleMarkComplete = (contentId: string, moduleId: string, watchPercentage?: number) => {
    const officerId = 'officer-1';
    const existing = completions.find(c => c.content_id === contentId);
    
    if (existing) {
      // Update existing completion
      setCompletions(prev => prev.map(c => 
        c.content_id === contentId 
          ? { ...c, completed: true, completed_at: new Date().toISOString(), watch_percentage: watchPercentage }
          : c
      ));
    } else {
      // Add new completion
      const newCompletion: ContentCompletion = {
        content_id: contentId,
        module_id: moduleId,
        session_id: '', // Will be updated with actual session when available
        course_id: courseId!,
        officer_id: officerId,
        completed: true,
        completed_at: new Date().toISOString(),
        watch_percentage: watchPercentage,
      };
      setCompletions(prev => [...prev, newCompletion]);
    }
    
    // If in session mode, update session progress
    if (sessionId) {
      updateSessionProgress(sessionId, contentId, moduleId);
    }
    
    toast.success('Content marked as complete!', {
      icon: <CheckCircle2 className="h-4 w-4" />,
    });
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    // Auto-complete current content before navigating in presentation mode
    if (selectedContent && selectedModule && isPresentationMode) {
      const completion = completions.find(c => c.content_id === selectedContent.id);
      if (!completion?.completed) {
        // Always mark as complete when navigating in presentation mode
        handleMarkComplete(selectedContent.id, selectedModule.id);
        toast.success(`${selectedContent.title} marked as complete`, {
          icon: <CheckCircle2 className="h-4 w-4" />,
          duration: 2000,
        });
      }
    }

    const allContent = courseModules.flatMap(m => 
      mockContent.filter(c => c.module_id === m.id).map(c => ({ ...c, moduleId: m.id, sessionId: c.session_id }))
    ).sort((a, b) => a.order - b.order);

    const currentIndex = allContent.findIndex(c => c.id === selectedContentId);
    if (currentIndex === -1) return;

    if (direction === 'next' && currentIndex < allContent.length - 1) {
      const next = allContent[currentIndex + 1];
      handleContentSelect(next.id, next.moduleId, next.sessionId);
    } else if (direction === 'prev' && currentIndex > 0) {
      const prev = allContent[currentIndex - 1];
      handleContentSelect(prev.id, prev.moduleId, prev.sessionId);
    }
  };

  const togglePresentationMode = () => {
    setIsPresentationMode(!isPresentationMode);
    if (!isPresentationMode) {
      setShowStudentPanel(false);
      toast.success('Presentation mode enabled. Press ESC to exit.');
    } else {
      setShowStudentPanel(true);
    }
  };

  // Calculate course progress
  const courseProgress: CourseProgress = useMemo(() => {
    const allCourseContent = courseModules.flatMap(m =>
      mockContent.filter(c => c.module_id === m.id)
    );
    const completedCount = allCourseContent.filter(c =>
      completions.some(comp => comp.content_id === c.id && comp.completed)
    ).length;

    const modules = courseModules.map(m => {
      const moduleContent = mockContent.filter(c => c.module_id === m.id);
      const completed = moduleContent.filter(c =>
        completions.some(comp => comp.content_id === c.id && comp.completed)
      ).length;
      return {
        module_id: m.id,
        total_content: moduleContent.length,
        completed_content: completed,
        percentage: moduleContent.length > 0 ? (completed / moduleContent.length) * 100 : 0,
        sessions: [] // Empty sessions array for now
      };
    });

    return {
      course_id: courseId!,
      total_content: allCourseContent.length,
      completed_content: completedCount,
      percentage: allCourseContent.length > 0 ? (completedCount / allCourseContent.length) * 100 : 0,
      modules,
    };
  }, [courseModules, completions, courseId]);

  // Get timeline items
  const timelineItems: CompletionTimelineItem[] = useMemo(() => {
    return completions
      .filter(c => c.completed)
      .map(c => {
        const content = mockContent.find(mc => mc.id === c.content_id);
        const module = courseModules.find(m => m.id === c.module_id);
        return {
          ...c,
          content_title: content?.title || 'Unknown',
          module_title: module?.title || 'Unknown',
          content_type: content?.type || 'unknown',
        };
      });
  }, [completions, courseModules]);

  // Handle ESC key to exit presentation mode
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPresentationMode) {
        togglePresentationMode();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isPresentationMode]);

  return (
    <div className={`${isPresentationMode ? 'fixed inset-0 z-50 bg-background' : 'min-h-screen'} flex flex-col`}>
      {/* Session Context Banner */}
      {className && !isPresentationMode && (
        <div className="bg-primary/10 border-b px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              <Badge variant="secondary" className="text-base">
                {className}
              </Badge>
              <span className="text-muted-foreground">
                {format(new Date(), 'EEEE, MMM dd, yyyy')}
              </span>
              {allowedModuleIds && (
                <span className="text-muted-foreground">
                  {courseModules.length} modules available for this class
                </span>
              )}
            </div>
            {sessionId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAttendanceDialog(true)}
              >
                <UsersIcon className="h-4 w-4 mr-2" />
                Take Attendance
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      {!isPresentationMode && (
        <header className="border-b bg-card">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(`/tenant/${tenantId}/officer/course-management`)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">{course.title}</h1>
                <p className="text-sm text-muted-foreground">{course.course_code}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Progress:</span>
                <div className="w-32">
                  <Progress value={courseProgress.percentage} className="h-2" />
                </div>
                <span className="text-sm font-medium">
                  {Math.round(courseProgress.percentage)}%
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTimelineDialog(true)}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Timeline ({timelineItems.length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={togglePresentationMode}
              >
                <Maximize2 className="h-4 w-4 mr-2" />
                Presentation
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowStudentPanel(!showStudentPanel)}
              >
                {showStudentPanel ? 'Hide' : 'Show'} Students
              </Button>
            </div>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Module Navigation */}
        {!isPresentationMode && (
        <ModuleNavigationSidebar
          modules={courseModules}
          courseId={courseId || ''}
          selectedModuleId={selectedModuleId}
          selectedContentId={selectedContentId}
          onModuleSelect={setSelectedModuleId}
          onContentSelect={handleContentSelect}
          completions={completions}
          courseProgress={courseProgress}
        />
        )}

        {/* Center - Content Display */}
        <ContentDisplayArea
          content={selectedContent}
          module={selectedModule}
          isPresentationMode={isPresentationMode}
          onNavigate={handleNavigate}
          onExitPresentation={isPresentationMode ? togglePresentationMode : undefined}
          onMarkComplete={handleMarkComplete}
          isCompleted={selectedContent ? completions.some(c => c.content_id === selectedContent.id && c.completed) : false}
          completedAt={selectedContent ? completions.find(c => c.content_id === selectedContent.id)?.completed_at : undefined}
          onCheckAutoComplete={() => true}
        />

        {/* Right Sidebar - Student Engagement */}
        {showStudentPanel && !isPresentationMode && (
          <StudentEngagementPanel
            courseId={courseId || ''}
            contentId={selectedContentId}
          />
        )}
      </div>

      {/* Presentation Mode Controls */}
      {isPresentationMode && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-card border rounded-lg shadow-lg p-3 flex items-center gap-3 z-50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleNavigate('prev')}
          >
            Previous
          </Button>
          
          <div className="text-sm px-4 space-y-1">
            <div className="font-medium flex items-center gap-2">
              {selectedModule?.title}
              {selectedContent && completions.some(c => c.content_id === selectedContent.id && c.completed) && (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              Module: {courseProgress.modules.find(m => m.module_id === selectedModuleId)?.completed_content || 0}/
              {courseProgress.modules.find(m => m.module_id === selectedModuleId)?.total_content || 0} | 
              Course: {Math.round(courseProgress.percentage)}%
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleNavigate('next')}
          >
            Next
          </Button>
          <div className="w-px h-6 bg-border mx-2" />
          <Button
            variant="ghost"
            size="sm"
            onClick={togglePresentationMode}
          >
            <Minimize2 className="h-4 w-4 mr-2" />
            Exit
          </Button>
        </div>
      )}

      {/* Completion Timeline Dialog */}
      <CompletionTimelineDialog
        open={showTimelineDialog}
        onOpenChange={setShowTimelineDialog}
        completions={timelineItems}
        courseTitle={course?.title || ''}
      />

      {/* Attendance Dialog */}
      <SessionAttendanceDialog
        open={showAttendanceDialog}
        onOpenChange={setShowAttendanceDialog}
        sessionId={sessionId}
        className={className || ''}
      />
    </div>
  );
}
