import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, GripVertical, Loader2 } from 'lucide-react';

interface SessionItem {
  id: string;
  title: string;
  display_order: number;
}

interface ReorderSessionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessions: SessionItem[];
  moduleName: string;
  onSave: (orderedIds: { id: string; display_order: number }[]) => Promise<void>;
}

export function ReorderSessionsDialog({ open, onOpenChange, sessions, moduleName, onSave }: ReorderSessionsDialogProps) {
  const [orderedSessions, setOrderedSessions] = useState<SessionItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setOrderedSessions(
        [...sessions].sort((a, b) => a.display_order - b.display_order)
      );
    }
  }, [open, sessions]);

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= orderedSessions.length) return;

    const newOrder = [...orderedSessions];
    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
    setOrderedSessions(newOrder);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const swaps = orderedSessions.map((s, idx) => ({
        id: s.id,
        display_order: idx,
      }));
      await onSave(swaps);
      onOpenChange(false);
    } catch {
      // error handled by parent
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reorder Sessions — {moduleName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 max-h-[60vh] overflow-y-auto py-2">
          {orderedSessions.map((session, idx) => (
            <div
              key={session.id}
              className="flex items-center gap-2 rounded-md border bg-card p-3"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm font-medium text-muted-foreground w-6">{idx + 1}.</span>
              <span className="flex-1 text-sm truncate">{session.title}</span>
              <div className="flex gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={idx === 0}
                  onClick={() => moveItem(idx, 'up')}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={idx === orderedSessions.length - 1}
                  onClick={() => moveItem(idx, 'down')}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
