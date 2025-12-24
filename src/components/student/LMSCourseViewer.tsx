import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Video, 
  FileText, 
  Link as LinkIcon, 
  PlayCircle, 
  CheckCircle2,
  Lock,
  Menu,
  X,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { getContentSignedUrl } from '@/services/courseStorage.service';

interface ContentItem {
  id: string;
  title: string;
  type: string;
  youtube_url?: string;
  file_path?: string;
  duration_minutes?: number;
  isCompleted?: boolean;
}

interface Session {
  id: string;
  session?: {
    id: string;
    title: string;
    description?: string;
  };
  content?: ContentItem[];
  is_unlocked?: boolean;
}

interface Module {
  id: string;
  module?: {
    id: string;
    title: string;
    description?: string;
  };
  sessions?: Session[];
  is_unlocked?: boolean;
}

interface LMSCourseViewerProps {
  course: {
    id: string;
    title: string;
    course_code: string;
    description?: string;
  };
  modules: Module[];
  viewOnly?: boolean;
  backPath?: string;
}

export function LMSCourseViewer({ course, modules, viewOnly = false, backPath }: LMSCourseViewerProps) {
  const navigate = useNavigate();
  const { tenantId } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [contentUrl, setContentUrl] = useState<string | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());

  // Flatten content for navigation
  const allContent = modules.flatMap(m => 
    (m.sessions || []).flatMap(s => 
      (s.content || []).map(c => ({
        ...c,
        moduleId: m.id,
        sessionId: s.id,
        moduleTitle: m.module?.title,
        sessionTitle: s.session?.title
      }))
    )
  );

  const currentIndex = allContent.findIndex(c => c.id === selectedContent?.id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < allContent.length - 1;

  // Auto-expand first module and session, select first content
  useEffect(() => {
    if (modules.length > 0 && !selectedContent) {
      const firstModule = modules[0];
      if (firstModule) {
        setExpandedModules(new Set([firstModule.id]));
        if (firstModule.sessions && firstModule.sessions.length > 0) {
          const firstSession = firstModule.sessions[0];
          setExpandedSessions(new Set([firstSession.id]));
          if (firstSession.content && firstSession.content.length > 0) {
            handleSelectContent(firstSession.content[0]);
          }
        }
      }
    }
  }, [modules]);

  // Load content URL when content changes
  useEffect(() => {
    const loadContentUrl = async () => {
      if (!selectedContent) {
        setContentUrl(null);
        return;
      }

      setIsLoadingContent(true);

      if (selectedContent.type === 'youtube') {
        setContentUrl(selectedContent.youtube_url || null);
        setIsLoadingContent(false);
        return;
      }

      if (selectedContent.file_path) {
        // Check if it's already a URL
        if (selectedContent.file_path.startsWith('http')) {
          setContentUrl(selectedContent.file_path);
          setIsLoadingContent(false);
          return;
        }
        
        // Get signed URL from storage
        try {
          const signedUrl = await getContentSignedUrl(selectedContent.file_path, 3600);
          setContentUrl(signedUrl);
        } catch (error) {
          console.error('Failed to get signed URL:', error);
          setContentUrl(null);
        }
      }

      setIsLoadingContent(false);
    };

    loadContentUrl();
  }, [selectedContent]);

  const handleSelectContent = (content: ContentItem) => {
    setSelectedContent(content);
  };

  const handlePrevious = () => {
    if (hasPrevious) {
      handleSelectContent(allContent[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      handleSelectContent(allContent[currentIndex + 1]);
    }
  };

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const toggleSession = (sessionId: string) => {
    const newExpanded = new Set(expandedSessions);
    if (newExpanded.has(sessionId)) {
      newExpanded.delete(sessionId);
    } else {
      newExpanded.add(sessionId);
    }
    setExpandedSessions(newExpanded);
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video':
      case 'youtube':
        return <Video className="h-4 w-4" />;
      case 'pdf':
      case 'ppt':
        return <FileText className="h-4 w-4" />;
      case 'link':
      case 'simulation':
        return <LinkIcon className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const extractYouTubeId = (url?: string) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  const renderContentViewer = () => {
    if (!selectedContent) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <BookOpen className="h-16 w-16 mb-4" />
          <p className="text-lg">Select content from the sidebar to start learning</p>
        </div>
      );
    }

    if (isLoadingContent) {
      return (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    switch (selectedContent.type) {
      case 'youtube':
        const youtubeId = extractYouTubeId(contentUrl);
        return youtubeId ? (
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
            className="w-full h-full rounded-lg"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            title={selectedContent.title}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-destructive">
            Invalid YouTube URL
          </div>
        );

      case 'video':
        return contentUrl ? (
          <video
            controls
            className="w-full h-full rounded-lg bg-black"
            src={contentUrl}
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="flex items-center justify-center h-full text-destructive">
            Video not available
          </div>
        );

      case 'pdf':
        return contentUrl ? (
          <iframe
            src={contentUrl}
            className="w-full h-full rounded-lg bg-white"
            title={selectedContent.title}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-destructive">
            PDF not available
          </div>
        );

      case 'ppt':
        return contentUrl ? (
          <iframe
            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(contentUrl)}`}
            className="w-full h-full rounded-lg"
            title={selectedContent.title}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-destructive">
            Presentation not available
          </div>
        );

      case 'link':
      case 'simulation':
        return (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <ExternalLink className="h-16 w-16 text-muted-foreground" />
            <p className="text-lg">External Resource</p>
            <Button asChild>
              <a href={contentUrl || '#'} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Link
              </a>
            </Button>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Unsupported content type
          </div>
        );
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      {/* Sidebar */}
      <div 
        className={cn(
          "border-r bg-card transition-all duration-300 flex flex-col",
          sidebarOpen ? "w-80" : "w-0 overflow-hidden"
        )}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-lg truncate">{course.title}</h2>
            <p className="text-sm text-muted-foreground">{course.course_code}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="shrink-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {modules.map((moduleAssignment) => {
              const module = moduleAssignment.module;
              const sessions = moduleAssignment.sessions || [];
              const isModuleExpanded = expandedModules.has(moduleAssignment.id);

              return (
                <div key={moduleAssignment.id} className="mb-2">
                  <button
                    onClick={() => toggleModule(moduleAssignment.id)}
                    className="w-full flex items-center gap-2 p-3 rounded-lg hover:bg-accent text-left"
                  >
                    <BookOpen className="h-4 w-4 shrink-0 text-primary" />
                    <span className="flex-1 font-medium text-sm truncate">
                      {module?.title || 'Module'}
                    </span>
                    <ChevronRight 
                      className={cn(
                        "h-4 w-4 shrink-0 transition-transform",
                        isModuleExpanded && "rotate-90"
                      )} 
                    />
                  </button>

                  {isModuleExpanded && (
                    <div className="ml-4 border-l pl-2">
                      {sessions.map((sessionAssignment) => {
                        const session = sessionAssignment.session;
                        const contentItems = sessionAssignment.content || [];
                        const isSessionExpanded = expandedSessions.has(sessionAssignment.id);

                        return (
                          <div key={sessionAssignment.id} className="mb-1">
                            <button
                              onClick={() => toggleSession(sessionAssignment.id)}
                              className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-accent text-left"
                            >
                              <PlayCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
                              <span className="flex-1 text-sm truncate">
                                {session?.title || 'Session'}
                              </span>
                              <ChevronRight 
                                className={cn(
                                  "h-4 w-4 shrink-0 transition-transform",
                                  isSessionExpanded && "rotate-90"
                                )} 
                              />
                            </button>

                            {isSessionExpanded && (
                              <div className="ml-4 space-y-1">
                                {contentItems.map((content) => (
                                  <button
                                    key={content.id}
                                    onClick={() => handleSelectContent(content)}
                                    className={cn(
                                      "w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm",
                                      selectedContent?.id === content.id 
                                        ? "bg-primary text-primary-foreground" 
                                        : "hover:bg-accent"
                                    )}
                                  >
                                    {getContentIcon(content.type)}
                                    <span className="flex-1 truncate">{content.title}</span>
                                    {content.isCompleted && (
                                      <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                                    )}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => navigate(backPath || `/tenant/${tenantId}/student/courses`)}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Content Header */}
        <div className="p-4 border-b flex items-center gap-4">
          {!sidebarOpen && (
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">
              {selectedContent?.title || 'Select Content'}
            </h3>
            {selectedContent && currentIndex >= 0 && (
              <p className="text-sm text-muted-foreground">
                {currentIndex + 1} of {allContent.length}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handlePrevious}
              disabled={!hasPrevious}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleNext}
              disabled={!hasNext}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 p-4 bg-muted/30">
          <div className="h-full rounded-lg overflow-hidden bg-background shadow-lg">
            {renderContentViewer()}
          </div>
        </div>
      </div>
    </div>
  );
}
