import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  ChevronLeft,
  ChevronRight,
  Layers,
  PlayCircle,
  FileText,
  Video,
  Link as LinkIcon,
  Youtube,
  Presentation,
  BookOpen,
  ExternalLink,
} from 'lucide-react';
import { CourseWithStructure, DbCourseModule, DbCourseSession, DbCourseContent } from '@/hooks/useCourses';
import { PDFViewer } from '@/components/content-viewer/PDFViewer';
import { FullscreenWrapper } from '@/components/content-viewer/FullscreenWrapper';
import { getContentSignedUrl } from '@/services/courseStorage.service';

interface CoursePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: CourseWithStructure | null;
}

export function CoursePreviewDialog({ open, onOpenChange, course }: CoursePreviewDialogProps) {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [currentSessionIndex, setCurrentSessionIndex] = useState(0);
  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'outline' | 'content'>('outline');

  if (!course) return null;

  const levels = course.modules || [];
  const currentLevel = levels[currentLevelIndex];
  const sessions = currentLevel?.sessions || [];
  const currentSession = sessions[currentSessionIndex];
  const contentItems = currentSession?.content || [];
  const currentContent = contentItems[currentContentIndex];

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-5 w-5" />;
      case 'ppt':
        return <Presentation className="h-5 w-5" />;
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'youtube':
        return <Youtube className="h-5 w-5" />;
      case 'link':
      case 'simulation':
        return <LinkIcon className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const handleNext = () => {
    if (currentContentIndex < contentItems.length - 1) {
      setCurrentContentIndex(currentContentIndex + 1);
    } else if (currentSessionIndex < sessions.length - 1) {
      setCurrentSessionIndex(currentSessionIndex + 1);
      setCurrentContentIndex(0);
    } else if (currentLevelIndex < levels.length - 1) {
      setCurrentLevelIndex(currentLevelIndex + 1);
      setCurrentSessionIndex(0);
      setCurrentContentIndex(0);
    }
  };

  const handlePrev = () => {
    if (currentContentIndex > 0) {
      setCurrentContentIndex(currentContentIndex - 1);
    } else if (currentSessionIndex > 0) {
      setCurrentSessionIndex(currentSessionIndex - 1);
      const prevSession = sessions[currentSessionIndex - 1];
      const prevContent = prevSession?.content || [];
      setCurrentContentIndex(Math.max(0, prevContent.length - 1));
    } else if (currentLevelIndex > 0) {
      setCurrentLevelIndex(currentLevelIndex - 1);
      const prevLevel = levels[currentLevelIndex - 1];
      const prevSessions = prevLevel?.sessions || [];
      setCurrentSessionIndex(Math.max(0, prevSessions.length - 1));
      const lastSession = prevSessions[prevSessions.length - 1];
      const lastContent = lastSession?.content || [];
      setCurrentContentIndex(Math.max(0, lastContent.length - 1));
    }
  };

  const totalContent = levels.reduce((acc, level) => {
    return acc + (level.sessions || []).reduce((sAcc, session) => {
      return sAcc + (session.content || []).length;
    }, 0);
  }, 0);

  const currentPosition = (() => {
    let pos = 0;
    for (let li = 0; li < currentLevelIndex; li++) {
      const levelSessions = levels[li]?.sessions || [];
      for (const session of levelSessions) {
        pos += (session.content || []).length;
      }
    }
    for (let si = 0; si < currentSessionIndex; si++) {
      pos += (sessions[si]?.content || []).length;
    }
    pos += currentContentIndex + 1;
    return pos;
  })();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0">
        {/* Header */}
        <div className="p-4 border-b bg-card">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">{course.title}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {course.course_code} • {levels.length} Modules • {totalContent} Content Items
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'outline' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('outline')}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Outline
              </Button>
              <Button
                variant={viewMode === 'content' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('content')}
              >
                <PlayCircle className="h-4 w-4 mr-2" />
                Content View
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {viewMode === 'outline' ? (
            // Outline View
            <ScrollArea className="h-full">
              <div className="p-6 space-y-6">
                {/* Course Info */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground">{course.description}</p>
                  </div>
                  <div className="flex gap-4">
                    <Badge variant="secondary">{course.difficulty}</Badge>
                    <Badge variant="outline">{course.category?.replace('_', ' ')}</Badge>
                  </div>
                  {course.learning_outcomes && course.learning_outcomes.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Learning Outcomes</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        {course.learning_outcomes.map((outcome, i) => (
                          <li key={i}>{outcome}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Course Structure */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Course Structure</h3>
                  {levels.map((level, levelIdx) => {
                    const levelSessions = level.sessions || [];
                    return (
                      <div key={level.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-3">
                          <Layers className="h-5 w-5 text-primary" />
                          <div>
                            <h4 className="font-medium">
                              Module {levelIdx + 1}: {level.title}
                            </h4>
                            <p className="text-sm text-muted-foreground">{level.description}</p>
                          </div>
                          <Badge variant="secondary" className="ml-auto">
                            {levelSessions.length} sessions
                          </Badge>
                        </div>

                        {levelSessions.map((session, sessionIdx) => {
                          const sessionContent = session.content || [];
                          return (
                            <div key={session.id} className="ml-8 border-l-2 pl-4 py-2">
                              <div className="flex items-center gap-2">
                                <PlayCircle className="h-4 w-4 text-blue-500" />
                                <span className="font-medium text-sm">
                                  Session {sessionIdx + 1}: {session.title}
                                </span>
                              </div>
                              {sessionContent.length > 0 && (
                                <div className="mt-2 ml-6 space-y-1">
                                  {sessionContent.map((content) => (
                                    <div
                                      key={content.id}
                                      className="flex items-center gap-2 text-sm text-muted-foreground"
                                    >
                                      {getContentIcon(content.type)}
                                      <span>{content.title}</span>
                                      <Badge variant="outline" className="text-xs">
                                        {content.type}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </ScrollArea>
          ) : (
            // Content View (Presentation Mode)
            <div className="h-full flex flex-col">
              {/* Navigation Bar */}
              <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">
                    Module {currentLevelIndex + 1}: {currentLevel?.title}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Session {currentSessionIndex + 1}: {currentSession?.title}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {currentPosition} / {totalContent}
                </span>
              </div>

              {/* Content Display */}
              <div className="flex-1 flex items-center justify-center p-8 bg-background">
                {currentContent ? (
                  <div className="text-center space-y-4">
                    <div className="flex justify-center">
                      {getContentIcon(currentContent.type)}
                    </div>
                    <h2 className="text-2xl font-bold">{currentContent.title}</h2>
                    <Badge variant="secondary">{currentContent.type.toUpperCase()}</Badge>
                    
                    {/* YouTube Content */}
                    {currentContent.type === 'youtube' && currentContent.youtube_url && (
                      <FullscreenWrapper className="mt-4 aspect-video w-full max-w-3xl mx-auto">
                        <iframe
                          width="100%"
                          height="100%"
                          src={`https://www.youtube.com/embed/${extractYouTubeId(currentContent.youtube_url)}`}
                          title={currentContent.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="rounded-lg"
                        />
                      </FullscreenWrapper>
                    )}
                    
                    {/* PDF Content */}
                    {currentContent.type === 'pdf' && currentContent.file_path && (
                      <div className="mt-4 w-full max-w-4xl mx-auto h-[50vh]">
                        <PDFViewer filePath={currentContent.file_path} title={currentContent.title} />
                      </div>
                    )}
                    
                    {/* PPT Content */}
                    {currentContent.type === 'ppt' && currentContent.file_path && (
                      <div className="mt-4">
                        <p className="text-muted-foreground mb-4">
                          PowerPoint presentations can be downloaded or opened externally.
                        </p>
                        <Button 
                          onClick={async () => {
                            const url = await getContentSignedUrl(currentContent.file_path!, 3600);
                            if (url) window.open(url, '_blank');
                          }}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open Presentation
                        </Button>
                      </div>
                    )}
                    
                    {/* Video Content */}
                    {currentContent.type === 'video' && currentContent.file_path && (
                      <FullscreenWrapper className="mt-4 aspect-video w-full max-w-3xl mx-auto">
                        <video
                          controls
                          className="w-full h-full rounded-lg bg-black"
                          src={currentContent.file_path}
                        >
                          Your browser does not support the video tag.
                        </video>
                      </FullscreenWrapper>
                    )}
                    
                    {/* Other content types - show file path */}
                    {currentContent.file_path && 
                     !['pdf', 'ppt', 'youtube', 'video'].includes(currentContent.type) && (
                      <p className="text-muted-foreground mt-4">
                        File: {currentContent.file_path}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4" />
                    <p>No content available for this session</p>
                  </div>
                )}
              </div>

              {/* Navigation Controls */}
              <div className="p-4 border-t bg-card flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={currentLevelIndex === 0 && currentSessionIndex === 0 && currentContentIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={handleNext}
                  disabled={
                    currentLevelIndex === levels.length - 1 &&
                    currentSessionIndex === sessions.length - 1 &&
                    currentContentIndex === contentItems.length - 1
                  }
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function extractYouTubeId(url: string): string {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : "";
}
