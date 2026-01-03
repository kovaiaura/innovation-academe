import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Eye, Calendar, User, ChevronDown, ChevronUp, Tag } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { NewsFeedPost } from "@/services/newsFeed.service";

interface PostCardProps {
  post: NewsFeedPost;
  onView?: () => void;
}

export function PostCard({ post, onView }: PostCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const priorityColors = {
    low: 'bg-muted text-muted-foreground',
    medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    high: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  };

  const typeColors = {
    news: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    feed: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  };

  const shouldTruncate = post.content.length > 200;
  const displayContent = isExpanded ? post.content : post.content.slice(0, 200);

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      {post.image_url && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge className={typeColors[post.type]}>
              {post.type === 'news' ? '📰 News' : '📢 Feed'}
            </Badge>
            {post.priority === 'high' && (
              <Badge className={priorityColors.high}>High Priority</Badge>
            )}
          </div>
        </div>
      )}

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            {!post.image_url && (
              <div className="flex gap-2 mb-2">
                <Badge className={typeColors[post.type]}>
                  {post.type === 'news' ? '📰 News' : '📢 Feed'}
                </Badge>
                {post.priority === 'high' && (
                  <Badge className={priorityColors.high}>High Priority</Badge>
                )}
              </div>
            )}
            <h3 className="text-lg font-semibold leading-tight">{post.title}</h3>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-muted-foreground whitespace-pre-wrap">
          {displayContent}
          {shouldTruncate && !isExpanded && '...'}
        </p>

        {shouldTruncate && (
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-auto text-primary"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>Show less <ChevronUp className="ml-1 h-4 w-4" /></>
            ) : (
              <>Read more <ChevronDown className="ml-1 h-4 w-4" /></>
            )}
          </Button>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.tags.map((tag, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {post.created_by_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <span>{post.created_by_name}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                {post.published_at
                  ? formatDistanceToNow(new Date(post.published_at), { addSuffix: true })
                  : format(new Date(post.created_at), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{post.views_count || 0}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
