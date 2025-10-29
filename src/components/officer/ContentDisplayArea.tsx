import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  ExternalLink,
  FileText,
  Video,
  Link as LinkIcon
} from 'lucide-react';
import type { CourseContent, CourseModule } from '@/types/course';

interface ContentDisplayAreaProps {
  content: CourseContent | undefined;
  module: CourseModule | undefined;
  isPresentationMode: boolean;
  onNavigate: (direction: 'prev' | 'next') => void;
  onExitPresentation?: () => void;
}

export function ContentDisplayArea({
  content,
  module,
  isPresentationMode,
  onNavigate,
}: ContentDisplayAreaProps) {
  if (!content) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/20">
        <div className="text-center space-y-4">
          <FileText className="h-16 w-16 mx-auto text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold">No Content Selected</h3>
            <p className="text-sm text-muted-foreground">
              Select a lesson from the sidebar to begin
            </p>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    const contentUrl = content.file_url || content.youtube_url || content.external_url || '';
    
    switch (content.type) {
      case 'pdf':
        return (
          <div className="w-full h-full bg-white rounded-lg">
            <iframe
              src={content.file_url || `https://docs.google.com/viewer?url=${encodeURIComponent(contentUrl)}&embedded=true`}
              className="w-full h-full rounded-lg"
              title={content.title}
            />
          </div>
        );

      case 'video':
        return (
          <div className="w-full aspect-video bg-black rounded-lg">
            <video
              src={content.file_url}
              controls
              className="w-full h-full rounded-lg"
            >
              Your browser does not support video playback.
            </video>
          </div>
        );

      case 'youtube':
        const videoId = extractYouTubeId(content.youtube_url || '');
        return (
          <div className="w-full aspect-video bg-black rounded-lg">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              className="w-full h-full rounded-lg"
              title={content.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        );

      case 'ppt':
        return (
          <div className="w-full h-full bg-white rounded-lg">
            <iframe
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(content.file_url || '')}`}
              className="w-full h-full rounded-lg"
              title={content.title}
            />
          </div>
        );

      case 'link':
      case 'simulation':
        return (
          <div className="w-full h-full bg-white rounded-lg">
            <iframe
              src={content.external_url}
              className="w-full h-full rounded-lg"
              title={content.title}
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        );

      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Content Not Available</CardTitle>
              <CardDescription>
                This content type is not yet supported in the viewer
              </CardDescription>
            </CardHeader>
          </Card>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-muted/10">
      {/* Content Header */}
      {!isPresentationMode && (
        <div className="border-b bg-card p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="capitalize">
                  {content.type}
                </Badge>
              </div>
              <h2 className="text-xl font-semibold mb-1">{content.title}</h2>
              {module && (
                <p className="text-sm text-muted-foreground">
                  Module: {module.title}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {(content.file_url || content.youtube_url || content.external_url) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(content.file_url || content.youtube_url || content.external_url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open
                </Button>
              )}
              {content.file_url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = content.file_url!;
                    link.download = content.title;
                    link.click();
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content Display */}
      <div className={`flex-1 ${isPresentationMode ? 'p-8' : 'p-6'} overflow-auto`}>
        {renderContent()}
      </div>

      {/* Navigation Footer */}
      {!isPresentationMode && (
        <div className="border-t bg-card p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => onNavigate('prev')}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <div className="text-sm text-muted-foreground">
              {content.duration_minutes && `${content.duration_minutes} min`}
            </div>
            <Button
              variant="outline"
              onClick={() => onNavigate('next')}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function extractYouTubeId(url: string): string {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
    /youtube\.com\/embed\/([^&\s]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return url;
}
