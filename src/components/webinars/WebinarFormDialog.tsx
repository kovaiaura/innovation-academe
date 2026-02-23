import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Webinar, WebinarFormData, MetaEventType, EVENT_TYPE_LABELS, webinarService } from '@/services/webinar.service';
import { toast } from 'sonner';
import { Upload, X, ImageIcon } from 'lucide-react';

interface WebinarFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  webinar?: Webinar | null;
  onSubmit: (data: WebinarFormData) => Promise<void>;
}

export function WebinarFormDialog({ open, onOpenChange, webinar, onSubmit }: WebinarFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const thumbnailRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<WebinarFormData>({
    title: '',
    description: '',
    youtube_url: '',
    guest_name: '',
    guest_details: '',
    webinar_date: new Date().toISOString().split('T')[0],
    event_type: 'webinar',
    thumbnail_url: '',
    gallery_urls: [],
  });

  useEffect(() => {
    if (webinar) {
      setFormData({
        title: webinar.title,
        description: webinar.description || '',
        youtube_url: webinar.youtube_url || '',
        guest_name: webinar.guest_name || '',
        guest_details: webinar.guest_details || '',
        webinar_date: webinar.webinar_date.split('T')[0],
        event_type: webinar.event_type || 'webinar',
        thumbnail_url: webinar.thumbnail_url || '',
        gallery_urls: webinar.gallery_urls || [],
      });
    } else {
      setFormData({
        title: '',
        description: '',
        youtube_url: '',
        guest_name: '',
        guest_details: '',
        webinar_date: new Date().toISOString().split('T')[0],
        event_type: 'webinar',
        thumbnail_url: '',
        gallery_urls: [],
      });
    }
  }, [webinar, open]);

  const isWebinar = formData.event_type === 'webinar';

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingThumbnail(true);
    try {
      const url = await webinarService.uploadImage(file, 'thumbnails');
      setFormData(prev => ({ ...prev, thumbnail_url: url }));
      toast.success('Thumbnail uploaded');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload thumbnail');
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingGallery(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const url = await webinarService.uploadImage(file, 'gallery');
        urls.push(url);
      }
      setFormData(prev => ({ ...prev, gallery_urls: [...(prev.gallery_urls || []), ...urls] }));
      toast.success(`${urls.length} image(s) uploaded`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploadingGallery(false);
    }
  };

  const removeGalleryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      gallery_urls: (prev.gallery_urls || []).filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    
    if (isWebinar && !formData.youtube_url?.trim()) {
      toast.error('YouTube URL is required for webinars');
      return;
    }

    if (isWebinar && formData.youtube_url) {
      const youtubePattern = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|^[a-zA-Z0-9_-]{11}$)/;
      if (!youtubePattern.test(formData.youtube_url)) {
        toast.error('Please enter a valid YouTube URL');
        return;
      }
    }

    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        youtube_url: isWebinar ? formData.youtube_url : undefined,
        webinar_date: new Date(formData.webinar_date).toISOString()
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{webinar ? 'Edit' : 'Create'} MetaINNOVA™ Event</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Event Type *</Label>
            <Select
              value={formData.event_type}
              onValueChange={(val) => setFormData({ ...formData, event_type: val as MetaEventType })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(EVENT_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter event title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter event description"
              rows={3}
            />
          </div>

          {isWebinar ? (
            <div className="space-y-2">
              <Label htmlFor="youtube_url">YouTube URL *</Label>
              <Input
                id="youtube_url"
                value={formData.youtube_url}
                onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
                required
              />
            </div>
          ) : (
            <>
              {/* Thumbnail Upload */}
              <div className="space-y-2">
                <Label>Thumbnail Image</Label>
                <input ref={thumbnailRef} type="file" accept="image/*" onChange={handleThumbnailUpload} className="hidden" />
                {formData.thumbnail_url ? (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                    <img src={formData.thumbnail_url} alt="Thumbnail" className="w-full h-full object-cover" />
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={() => setFormData(prev => ({ ...prev, thumbnail_url: '' }))}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-24 border-dashed"
                    onClick={() => thumbnailRef.current?.click()}
                    disabled={uploadingThumbnail}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Upload className="h-5 w-5" />
                      <span className="text-xs">{uploadingThumbnail ? 'Uploading...' : 'Upload Thumbnail'}</span>
                    </div>
                  </Button>
                )}
              </div>

              {/* Gallery Upload */}
              <div className="space-y-2">
                <Label>Gallery Images</Label>
                <input ref={galleryRef} type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="hidden" />
                {(formData.gallery_urls || []).length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {(formData.gallery_urls || []).map((url, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border">
                        <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          className="absolute top-1 right-1 h-5 w-5"
                          onClick={() => removeGalleryImage(idx)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-dashed"
                  onClick={() => galleryRef.current?.click()}
                  disabled={uploadingGallery}
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  {uploadingGallery ? 'Uploading...' : 'Add Gallery Images'}
                </Button>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="guest_name">Guest / Speaker Name</Label>
            <Input
              id="guest_name"
              value={formData.guest_name}
              onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
              placeholder="Enter guest speaker name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="guest_details">Guest / Speaker Details</Label>
            <Textarea
              id="guest_details"
              value={formData.guest_details}
              onChange={(e) => setFormData({ ...formData, guest_details: e.target.value })}
              placeholder="Enter guest speaker bio/details"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="webinar_date">Event Date *</Label>
            <Input
              id="webinar_date"
              type="date"
              value={formData.webinar_date}
              onChange={(e) => setFormData({ ...formData, webinar_date: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || uploadingThumbnail || uploadingGallery}>
              {loading ? 'Saving...' : webinar ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
