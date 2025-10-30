import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ContentType } from '@/types/course';
import { toast } from 'sonner';

interface AddContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (content: any) => void;
  sessionName: string;
}

export function AddContentDialog({ open, onOpenChange, onSave, sessionName }: AddContentDialogProps) {
  const [contentType, setContentType] = useState<ContentType>('pdf');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [duration, setDuration] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (['pdf', 'ppt', 'video'].includes(contentType) && !file) {
      toast.error('Please upload a file');
      return;
    }

    if (['youtube', 'link', 'simulation'].includes(contentType) && !url.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    const contentData: any = {
      title: title.trim(),
      type: contentType,
      description: description.trim()
    };

    if (file) {
      contentData.file_url = `/files/${file.name}`;
      contentData.file_size_mb = file.size / (1024 * 1024);
    }

    if (url) {
      if (contentType === 'youtube') {
        contentData.youtube_url = url;
      } else {
        contentData.external_url = url;
      }
    }

    if (duration) {
      contentData.duration_minutes = parseInt(duration);
    }

    onSave(contentData);
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setUrl('');
    setDuration('');
    setFile(null);
    setContentType('pdf');
  };

  const getAcceptedFileTypes = (type: ContentType) => {
    const acceptMap = {
      pdf: '.pdf',
      ppt: '.ppt,.pptx',
      video: '.mp4,.mov,.avi,.mkv',
      youtube: '',
      link: '',
      simulation: ''
    };
    return acceptMap[type];
  };

  const getMaxFileSize = (type: ContentType) => {
    const sizeMap = {
      pdf: '50MB',
      ppt: '50MB',
      video: '500MB',
      youtube: '',
      link: '',
      simulation: ''
    };
    return sizeMap[type];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const maxSizes: Record<string, number> = {
      pdf: 50 * 1024 * 1024,
      ppt: 50 * 1024 * 1024,
      video: 500 * 1024 * 1024
    };

    if (selectedFile.size > maxSizes[contentType]) {
      toast.error(`File size exceeds ${getMaxFileSize(contentType)}`);
      return;
    }

    setFile(selectedFile);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Content to {sessionName}</DialogTitle>
          <DialogDescription>Upload files or add links to session materials</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Content Type *</Label>
            <Select value={contentType} onValueChange={(value) => setContentType(value as ContentType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF Document</SelectItem>
                <SelectItem value="ppt">Presentation (PPT)</SelectItem>
                <SelectItem value="video">Video File</SelectItem>
                <SelectItem value="youtube">YouTube Video</SelectItem>
                <SelectItem value="simulation">Interactive Simulation</SelectItem>
                <SelectItem value="link">External Link</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="content-title">Content Title *</Label>
            <Input
              id="content-title"
              placeholder="e.g., Introduction to AI Concepts"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          {['pdf', 'ppt', 'video'].includes(contentType) && (
            <div>
              <Label htmlFor="content-file">Upload File *</Label>
              <Input
                id="content-file"
                type="file"
                accept={getAcceptedFileTypes(contentType)}
                onChange={handleFileChange}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Max size: {getMaxFileSize(contentType)}
              </p>
            </div>
          )}
          
          {['youtube', 'link', 'simulation'].includes(contentType) && (
            <div>
              <Label htmlFor="content-url">
                {contentType === 'youtube' ? 'YouTube URL' : 'URL'} *
              </Label>
              <Input
                id="content-url"
                type="url"
                placeholder="https://..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>
          )}
          
          {['video', 'youtube'].includes(contentType) && (
            <div>
              <Label htmlFor="content-duration">Duration (minutes)</Label>
              <Input
                id="content-duration"
                type="number"
                min="1"
                placeholder="15"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
          )}
          
          <div>
            <Label htmlFor="content-description">Description (Optional)</Label>
            <Textarea
              id="content-description"
              placeholder="Additional notes about this content"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Content</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
