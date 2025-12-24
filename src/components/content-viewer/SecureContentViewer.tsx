import { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { getContentSignedUrl } from '@/services/courseStorage.service';
import { DbCourseContent } from '@/hooks/useCourses';

interface SecureContentViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: DbCourseContent | null;
  isCompleted?: boolean;
  onMarkComplete?: () => void;
}

export function SecureContentViewer({
  open,
  onOpenChange,
  content,
  isCompleted = false,
  onMarkComplete
}: SecureContentViewerProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasViewed, setHasViewed] = useState(false);
  const viewStartTime = useRef<number>(Date.now());
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Fetch signed URL when content changes
  useEffect(() => {
    if (open && content && content.file_path) {
      setLoading(true);
      setError(null);
      getContentSignedUrl(content.file_path)
        .then(url => {
          setSignedUrl(url);
          setLoading(false);
        })
        .catch(err => {
          setError('Failed to load content');
          setLoading(false);
        });
    } else if (content?.youtube_url) {
      setSignedUrl(null);
      setLoading(false);
    }
  }, [open, content?.id, content?.file_path, content?.youtube_url]);

  // Reset viewed state when dialog opens
  useEffect(() => {
    if (open) {
      viewStartTime.current = Date.now();
      setHasViewed(false);
    }
  }, [open, content?.id]);

  // Auto-mark as viewed after 10 seconds for non-video content
  useEffect(() => {
    if (open && content && content.type !== 'youtube') {
      const timer = setTimeout(() => {
        setHasViewed(true);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [open, content]);

  // Prevent right-click context menu
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  }, []);

  // Prevent keyboard shortcuts for printing/saving
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Block Ctrl+P (print), Ctrl+S (save), Ctrl+Shift+S
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 's' || e.key === 'P' || e.key === 'S')) {
        e.preventDefault();
        return false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  if (!content) return null;

  const handleMarkComplete = () => {
    onMarkComplete?.();
    setHasViewed(true);
  };

  const extractYouTubeId = (url?: string | null) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-destructive">{error}</p>
        </div>
      );
    }

    switch (content.type) {
      case 'youtube': {
        const youtubeId = extractYouTubeId(content.youtube_url);
        if (!youtubeId) {
          return <p className="text-destructive">Invalid YouTube URL</p>;
        }
        return (
          <div 
            className="relative aspect-video"
            onContextMenu={handleContextMenu}
          >
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1&disablekb=0`}
              className="w-full h-full rounded-lg"
              allowFullScreen
              title={content.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        );
      }

      case 'pdf':
        if (!signedUrl) {
          return <p className="text-destructive">PDF URL not available</p>;
        }
        // Use PDF.js viewer or Google Docs viewer to prevent download
        // Adding #toolbar=0&navpanes=0 disables toolbar in most PDF viewers
        return (
          <div 
            className="relative select-none"
            onContextMenu={handleContextMenu}
            style={{ userSelect: 'none' }}
          >
            <iframe
              ref={iframeRef}
              src={`${signedUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
              className="w-full h-[70vh] rounded-lg border"
              title={content.title}
              sandbox="allow-same-origin allow-scripts"
            />
            {/* Overlay to prevent right-click on PDF */}
            <div 
              className="absolute inset-0 bg-transparent" 
              style={{ pointerEvents: 'none' }}
            />
          </div>
        );

      case 'ppt':
        if (!signedUrl) {
          return <p className="text-destructive">Presentation URL not available</p>;
        }
        // Use Office Online viewer
        return (
          <div 
            className="relative select-none"
            onContextMenu={handleContextMenu}
            style={{ userSelect: 'none' }}
          >
            <iframe
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(signedUrl)}`}
              className="w-full h-[70vh] rounded-lg border"
              title={content.title}
              sandbox="allow-same-origin allow-scripts allow-popups"
            />
          </div>
        );

      default:
        return <p className="text-muted-foreground">Unsupported content type</p>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-6xl max-h-[95vh] overflow-y-auto"
        onContextMenu={handleContextMenu}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between pr-8">
            <span>{content.title}</span>
            {isCompleted && (
              <CheckCircle className="h-5 w-5 text-green-600" />
            )}
          </DialogTitle>
        </DialogHeader>

        <div 
          className="space-y-4 select-none" 
          style={{ userSelect: 'none' }}
        >
          {renderContent()}

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {hasViewed ? (
                <span className="text-green-600">✓ Content viewed</span>
              ) : (
                <span>Keep viewing to mark as complete</span>
              )}
            </div>

            {!isCompleted && onMarkComplete && (
              <Button
                onClick={handleMarkComplete}
                disabled={!hasViewed}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as Complete
              </Button>
            )}
          </div>
        </div>

        {/* Disable print styles */}
        <style>{`
          @media print {
            body * {
              display: none !important;
            }
            body::before {
              content: "Printing is not allowed for this content.";
              display: block;
              font-size: 24px;
              padding: 50px;
              text-align: center;
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
