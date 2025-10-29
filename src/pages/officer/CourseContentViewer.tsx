import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Maximize2, Minimize2 } from 'lucide-react';
import { ModuleNavigationSidebar } from '@/components/officer/ModuleNavigationSidebar';
import { ContentDisplayArea } from '@/components/officer/ContentDisplayArea';
import { StudentEngagementPanel } from '@/components/officer/StudentEngagementPanel';
import { mockCourses, mockModules, mockContent } from '@/data/mockCourseData';
import { toast } from 'sonner';

export default function CourseContentViewer() {
  const { tenantId, courseId } = useParams();
  const navigate = useNavigate();
  
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [showStudentPanel, setShowStudentPanel] = useState(true);

  // Get course data
  const course = mockCourses.find(c => c.id === courseId);
  const courseModules = mockModules.filter(m => m.course_id === courseId);
  const selectedModule = courseModules.find(m => m.id === selectedModuleId);
  const moduleContent = selectedModuleId 
    ? mockContent.filter(c => c.module_id === selectedModuleId)
    : [];
  const selectedContent = moduleContent.find(c => c.id === selectedContentId);

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

  const handleContentSelect = (contentId: string, moduleId: string) => {
    setSelectedModuleId(moduleId);
    setSelectedContentId(contentId);
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    const allContent = courseModules.flatMap(m => 
      mockContent.filter(c => c.module_id === m.id).map(c => ({ ...c, moduleId: m.id }))
    ).sort((a, b) => a.order - b.order);

    const currentIndex = allContent.findIndex(c => c.id === selectedContentId);
    if (currentIndex === -1) return;

    if (direction === 'next' && currentIndex < allContent.length - 1) {
      const next = allContent[currentIndex + 1];
      handleContentSelect(next.id, next.moduleId);
    } else if (direction === 'prev' && currentIndex > 0) {
      const prev = allContent[currentIndex - 1];
      handleContentSelect(prev.id, prev.moduleId);
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
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={togglePresentationMode}
              >
                <Maximize2 className="h-4 w-4 mr-2" />
                Presentation Mode
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
            selectedModuleId={selectedModuleId}
            selectedContentId={selectedContentId}
            onModuleSelect={setSelectedModuleId}
            onContentSelect={handleContentSelect}
          />
        )}

        {/* Center - Content Display */}
        <ContentDisplayArea
          content={selectedContent}
          module={selectedModule}
          isPresentationMode={isPresentationMode}
          onNavigate={handleNavigate}
          onExitPresentation={isPresentationMode ? togglePresentationMode : undefined}
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
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-card border rounded-lg shadow-lg p-2 flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleNavigate('prev')}
          >
            Previous
          </Button>
          <div className="text-sm text-muted-foreground px-4">
            {selectedModule?.title}
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
    </div>
  );
}
