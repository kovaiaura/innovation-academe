import { useState } from 'react';
import { TaskComment } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Send } from 'lucide-react';

interface TaskCommentSectionProps {
  comments: TaskComment[];
  onAddComment: (comment: string) => void;
}

export function TaskCommentSection({ comments, onAddComment }: TaskCommentSectionProps) {
  const [newComment, setNewComment] = useState('');

  const handleSubmit = () => {
    if (newComment.trim()) {
      onAddComment(newComment.trim());
      setNewComment('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {comment.user_name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{comment.user_name}</span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(comment.created_at), 'MMM d, yyyy HH:mm')}
                  </span>
                </div>
                <p className="text-sm text-foreground">{comment.comment}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex gap-2">
        <Textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[60px]"
        />
        <Button onClick={handleSubmit} size="icon" disabled={!newComment.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
