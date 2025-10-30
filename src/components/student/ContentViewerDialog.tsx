import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CourseContent } from '@/types/course';
import { CheckCircle, ExternalLink } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface ContentViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: CourseContent | null;
  isCompleted: boolean;
  onMarkComplete: () => void;
}

export function ContentViewerDialog({
  open,
  onOpenChange,
  content,
  isCompleted,
  onMarkComplete
}: ContentViewerDialogProps) {
  const [hasViewed, setHasViewed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const viewStartTime = useRef<number>(Date.now());

  useEffect(() => {
    if (open) {
      viewStartTime.current = Date.now();
      setHasViewed(false);
    }
  }, [open, content?.id]);

  useEffect(() => {
    // Auto-mark as viewed after 10 seconds for non-video content
    if (open && content && content.type !== 'video') {
      const timer = setTimeout(() => {
        setHasViewed(true);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [open, content]);

  // Track video progress
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleProgress = () => {
      if (video.currentTime / video.duration >= 0.8) {
        setHasViewed(true);
      }
    };

    video.addEventListener('timeupdate', handleProgress);
    return () => video.removeEventListener('timeupdate', handleProgress);
  }, []);

  if (!content) return null;

  const handleMarkComplete = () => {
    onMarkComplete();
    setHasViewed(true);
  };

  const extractYouTubeId = (url?: string) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  const getContentUrl = () => {
    switch (content.type) {
      case 'youtube':
        return content.youtube_url;
      case 'link':
      case 'simulation':
        return content.external_url;
      default:
        return content.file_url;
    }
  };

  const contentUrl = getContentUrl();

  const renderContent = () => {
    switch (content.type) {
      case 'video':
        if (!contentUrl) return <p className="text-destructive">Video URL not available</p>;
        return (
          <video
            ref={videoRef}
            controls
            className="w-full rounded-lg"
            src={contentUrl}
          >
            Your browser does not support the video tag.
          </video>
        );
      
      case 'youtube':
        const youtubeId = extractYouTubeId(contentUrl);
        return youtubeId ? (
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}`}
            className="w-full aspect-video rounded-lg"
            allowFullScreen
            title={content.title}
          />
        ) : (
          <p className="text-destructive">Invalid YouTube URL</p>
        );
      
      case 'pdf':
        if (!contentUrl) return <p className="text-destructive">PDF URL not available</p>;
        return (
          <iframe
            src={contentUrl}
            className="w-full h-[70vh] rounded-lg"
            title={content.title}
          />
        );
      
      case 'ppt':
        if (!contentUrl) return <p className="text-destructive">Presentation URL not available</p>;
        return (
          <iframe
            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(contentUrl)}`}
            className="w-full h-[70vh] rounded-lg"
            title={content.title}
          />
        );
      
      case 'link':
      case 'simulation':
        if (!contentUrl) return <p className="text-destructive">URL not available</p>;
        return (
          <div className="space-y-4">
            <p className="text-muted-foreground">External resource</p>
            <Button asChild>
              <a href={contentUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Link
              </a>
            </Button>
          </div>
        );
      
      default:
        return <p>Unsupported content type</p>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{content.title}</span>
            {isCompleted && (
              <CheckCircle className="h-5 w-5 text-green-600" />
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {renderContent()}
          
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {hasViewed ? (
                <span className="text-green-600">✓ Content viewed</span>
              ) : (
                <span>Keep viewing to mark as complete</span>
              )}
            </div>
            
            {!isCompleted && (
              <Button
                onClick={handleMarkComplete}
                disabled={!hasViewed && content.type !== 'link'}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as Complete
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
