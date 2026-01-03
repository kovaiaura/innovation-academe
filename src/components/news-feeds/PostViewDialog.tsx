import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Eye, Calendar, User, Tag, Users } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { NewsFeedPost } from "@/services/newsFeed.service";

interface PostViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: NewsFeedPost | null;
}

export function PostViewDialog({ open, onOpenChange, post }: PostViewDialogProps) {
  if (!post) return null;

  const priorityColors = {
    low: 'bg-muted text-muted-foreground',
    medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    high: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  };

  const typeColors = {
    news: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    feed: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  };

  const statusColors = {
    draft: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    published: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    archived: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge className={typeColors[post.type]}>
              {post.type === 'news' ? '📰 News' : '📢 Feed'}
            </Badge>
            <Badge className={statusColors[post.status]}>
              {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
            </Badge>
            <Badge className={priorityColors[post.priority]}>
              {post.priority.charAt(0).toUpperCase() + post.priority.slice(1)} Priority
            </Badge>
          </div>
          <DialogTitle className="text-2xl">{post.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Image */}
          {post.image_url && (
            <div className="rounded-lg overflow-hidden">
              <img
                src={post.image_url}
                alt={post.title}
                className="w-full max-h-80 object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap text-foreground">{post.content}</p>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, i) => (
                <Badge key={i} variant="outline">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Target Audience */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Target: {post.target_audience.join(', ')}</span>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg text-sm">
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">Created By</span>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {post.created_by_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{post.created_by_name}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">Created At</span>
              <span className="font-medium">
                {format(new Date(post.created_at), 'MMM d, yyyy h:mm a')}
              </span>
            </div>
            {post.published_at && (
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">Published At</span>
                <span className="font-medium">
                  {format(new Date(post.published_at), 'MMM d, yyyy h:mm a')}
                </span>
              </div>
            )}
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">Views</span>
              <div className="flex items-center gap-1 font-medium">
                <Eye className="h-4 w-4" />
                {post.views_count || 0}
              </div>
            </div>
          </div>

          {post.expires_at && (
            <div className="text-sm text-muted-foreground">
              <span className="text-orange-500">⚠️ Expires: </span>
              {format(new Date(post.expires_at), 'MMM d, yyyy')}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
