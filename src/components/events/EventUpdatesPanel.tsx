import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useEventUpdates, useAddEventUpdate, useDeleteEventUpdate } from '@/hooks/useEvents';
import { Event } from '@/types/events';

interface EventUpdatesPanelProps {
  event: Event;
  canEdit?: boolean;
}

export function EventUpdatesPanel({ event, canEdit = false }: EventUpdatesPanelProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newLink, setNewLink] = useState('');

  const { data: updates, isLoading } = useEventUpdates(event.id);
  const addUpdate = useAddEventUpdate();
  const deleteUpdate = useDeleteEventUpdate();

  const handleAddUpdate = async () => {
    if (!newTitle.trim()) return;

    await addUpdate.mutateAsync({
      eventId: event.id,
      update: {
        title: newTitle,
        content: newContent || undefined,
        link_url: newLink || undefined,
      },
    });

    setNewTitle('');
    setNewContent('');
    setNewLink('');
    setShowAddForm(false);
  };

  const handleDeleteUpdate = async (updateId: string) => {
    await deleteUpdate.mutateAsync({ updateId, eventId: event.id });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Event Updates</CardTitle>
        {canEdit && !showAddForm && (
          <Button size="sm" onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Update
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {showAddForm && canEdit && (
          <div className="space-y-4 mb-6 p-4 border rounded-lg bg-muted/50">
            <div className="space-y-2">
              <Label>Update Title *</Label>
              <Input
                placeholder="e.g., Registration deadline extended"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Content (Optional)</Label>
              <Textarea
                placeholder="Additional details..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Link URL (Optional)</Label>
              <Input
                placeholder="https://..."
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleAddUpdate}
                disabled={addUpdate.isPending || !newTitle.trim()}
              >
                {addUpdate.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Save Update
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : updates && updates.length > 0 ? (
          <ScrollArea className="max-h-[300px]">
            <div className="space-y-4">
              {updates.map((update) => (
                <div key={update.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{update.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(update.created_at), 'PPP p')}
                      </p>
                      {update.content && (
                        <p className="text-sm text-muted-foreground mt-2">{update.content}</p>
                      )}
                      {update.link_url && (
                        <a
                          href={update.link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
                        >
                          <ExternalLink className="h-3 w-3" />
                          View Link
                        </a>
                      )}
                    </div>
                    {canEdit && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => handleDeleteUpdate(update.id)}
                        disabled={deleteUpdate.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No updates yet
          </p>
        )}
      </CardContent>
    </Card>
  );
}
