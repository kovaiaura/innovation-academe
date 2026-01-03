import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X, Upload, Loader2, ImageIcon } from "lucide-react";
import { useNewsFeedMutations } from "@/hooks/useNewsFeeds";
import { useAuth } from "@/contexts/AuthContext";
import { PostType, PostPriority, TargetAudience, NewsFeedPost } from "@/services/newsFeed.service";

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editPost?: NewsFeedPost | null;
}

const AUDIENCES: { value: TargetAudience; label: string }[] = [
  { value: 'all', label: 'All Users' },
  { value: 'management', label: 'Management' },
  { value: 'officer', label: 'Innovation Officers' },
  { value: 'student', label: 'Students' },
  { value: 'teacher', label: 'Teachers' },
];

export function CreatePostDialog({ open, onOpenChange, editPost }: CreatePostDialogProps) {
  const { user } = useAuth();
  const { createPost, updatePost, uploadImage } = useNewsFeedMutations();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    type: (editPost?.type || 'news') as PostType,
    title: editPost?.title || '',
    content: editPost?.content || '',
    priority: (editPost?.priority || 'medium') as PostPriority,
    target_audience: editPost?.target_audience || ['all'] as TargetAudience[],
    tags: editPost?.tags?.join(', ') || '',
    expires_at: editPost?.expires_at ? editPost.expires_at.split('T')[0] : '',
  });
  const [imageUrl, setImageUrl] = useState<string | null>(editPost?.image_url || null);
  const [imagePreview, setImagePreview] = useState<string | null>(editPost?.image_url || null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to storage
    setIsUploading(true);
    try {
      const url = await uploadImage.mutateAsync(file);
      setImageUrl(url);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setImageUrl(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAudienceChange = (audience: TargetAudience, checked: boolean) => {
    if (audience === 'all') {
      setFormData(prev => ({
        ...prev,
        target_audience: checked ? ['all'] : [],
      }));
    } else {
      setFormData(prev => {
        const newAudiences = checked
          ? [...prev.target_audience.filter(a => a !== 'all'), audience]
          : prev.target_audience.filter(a => a !== audience);
        return { ...prev, target_audience: newAudiences };
      });
    }
  };

  const handleSubmit = async (status: 'draft' | 'published') => {
    if (!user) return;

    const tags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);

    const postData = {
      type: formData.type,
      title: formData.title,
      content: formData.content,
      image_url: imageUrl || undefined,
      priority: formData.priority,
      target_audience: formData.target_audience,
      tags,
      expires_at: formData.expires_at || undefined,
      status,
    };

    if (editPost) {
      await updatePost.mutateAsync({ id: editPost.id, data: postData });
    } else {
      await createPost.mutateAsync({
        ...postData,
        created_by: user.id,
        created_by_name: user.name || user.email || 'Unknown',
      });
    }

    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      type: 'news',
      title: '',
      content: '',
      priority: 'medium',
      target_audience: ['all'],
      tags: '',
      expires_at: '',
    });
    setImageUrl(null);
    setImagePreview(null);
  };

  const isLoading = createPost.isPending || updatePost.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editPost ? 'Edit Post' : 'Create New Post'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Type Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Post Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: PostType) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="news">📰 News</SelectItem>
                  <SelectItem value="feed">📢 Feed</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {formData.type === 'news' ? 'Formal announcements, achievements' : 'Quick updates, activities'}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: PostPriority) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter post title..."
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label>Content *</Label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Write your content here..."
              rows={6}
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Image (Optional)</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full h-32 border-dashed"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Click to upload image</span>
                  </div>
                )}
              </Button>
            )}
          </div>

          {/* Target Audience */}
          <div className="space-y-2">
            <Label>Target Audience</Label>
            <div className="flex flex-wrap gap-4">
              {AUDIENCES.map((audience) => (
                <div key={audience.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={audience.value}
                    checked={formData.target_audience.includes(audience.value)}
                    onCheckedChange={(checked) => handleAudienceChange(audience.value, checked as boolean)}
                  />
                  <Label htmlFor={audience.value} className="text-sm font-normal cursor-pointer">
                    {audience.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags (comma separated)</Label>
            <Input
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="STEM, Achievement, Event..."
            />
            {formData.tags && (
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.tags.split(',').map((tag, i) => tag.trim() && (
                  <Badge key={i} variant="secondary">{tag.trim()}</Badge>
                ))}
              </div>
            )}
          </div>

          {/* Expiry Date */}
          <div className="space-y-2">
            <Label>Expiry Date (Optional)</Label>
            <Input
              type="date"
              value={formData.expires_at}
              onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
              min={new Date().toISOString().split('T')[0]}
            />
            <p className="text-xs text-muted-foreground">
              Post will automatically hide after this date
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleSubmit('draft')}
              disabled={isLoading || !formData.title || !formData.content}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save as Draft
            </Button>
            <Button
              onClick={() => handleSubmit('published')}
              disabled={isLoading || !formData.title || !formData.content}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Publish Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
