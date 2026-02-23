import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Webinar, EVENT_TYPE_LABELS } from '@/services/webinar.service';
import { YouTubePlayer } from './YouTubePlayer';
import { Calendar, User, X } from 'lucide-react';
import { format } from 'date-fns';

interface WebinarViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  webinar: Webinar | null;
}

export function WebinarViewDialog({ open, onOpenChange, webinar }: WebinarViewDialogProps) {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  if (!webinar) return null;

  const isUpcoming = new Date(webinar.webinar_date) > new Date();
  const isWebinar = webinar.event_type === 'webinar';

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 flex-wrap">
              <DialogTitle className="text-xl">{webinar.title}</DialogTitle>
              <Badge variant="outline">{EVENT_TYPE_LABELS[webinar.event_type] || webinar.event_type}</Badge>
              {isUpcoming && <Badge variant="secondary">Upcoming</Badge>}
            </div>
          </DialogHeader>
          
          <div className="space-y-4">
            {isWebinar && webinar.youtube_url ? (
              <YouTubePlayer url={webinar.youtube_url} title={webinar.title} />
            ) : webinar.thumbnail_url ? (
              <div className="aspect-video rounded-lg overflow-hidden">
                <img 
                  src={webinar.thumbnail_url} 
                  alt={webinar.title} 
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setLightboxImage(webinar.thumbnail_url)}
                />
              </div>
            ) : null}
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(webinar.webinar_date), 'PPP')}</span>
                </div>
                
                {webinar.guest_name && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-medium">
                      <User className="h-4 w-4" />
                      <span>Guest / Speaker</span>
                    </div>
                    <p className="text-sm ml-6">{webinar.guest_name}</p>
                    {webinar.guest_details && (
                      <p className="text-sm text-muted-foreground ml-6">{webinar.guest_details}</p>
                    )}
                  </div>
                )}
              </div>
              
              {webinar.description && (
                <div className="space-y-1">
                  <p className="font-medium">Description</p>
                  <p className="text-sm text-muted-foreground">{webinar.description}</p>
                </div>
              )}
            </div>

            {/* Gallery */}
            {!isWebinar && webinar.gallery_urls && webinar.gallery_urls.length > 0 && (
              <div className="space-y-2">
                <p className="font-medium">Gallery ({webinar.gallery_urls.length} images)</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {webinar.gallery_urls.map((url, idx) => (
                    <div 
                      key={idx} 
                      className="aspect-square rounded-lg overflow-hidden border cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => setLightboxImage(url)}
                    >
                      <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Lightbox */}
      {lightboxImage && (
        <Dialog open={!!lightboxImage} onOpenChange={() => setLightboxImage(null)}>
          <DialogContent className="max-w-5xl p-1">
            <div className="relative">
              <img src={lightboxImage} alt="Full view" className="w-full h-auto max-h-[85vh] object-contain rounded" />
              <button
                onClick={() => setLightboxImage(null)}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
