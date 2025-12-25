import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { useAddProgressUpdate } from '@/hooks/useProjectProgress';

interface AddProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectTitle: string;
  currentProgress: number;
  officerId: string;
  officerName: string;
}

export function AddProgressDialog({
  open,
  onOpenChange,
  projectId,
  projectTitle,
  currentProgress,
  officerId,
  officerName,
}: AddProgressDialogProps) {
  const [notes, setNotes] = useState('');
  const [progress, setProgress] = useState(currentProgress);

  const addProgressUpdate = useAddProgressUpdate();

  const handleSubmit = async () => {
    if (!notes.trim()) return;

    try {
      await addProgressUpdate.mutateAsync({
        project_id: projectId,
        notes,
        progress_percentage: progress,
        updated_by_officer_id: officerId,
        updated_by_officer_name: officerName,
      });

      setNotes('');
      setProgress(currentProgress);
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding progress update:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Progress</DialogTitle>
          <p className="text-sm text-muted-foreground">{projectTitle}</p>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Progress: {progress}%</Label>
            <Slider
              value={[progress]}
              onValueChange={([value]) => setProgress(value)}
              min={0}
              max={100}
              step={5}
              className="py-2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Update Notes *</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe the progress made, milestones achieved, or any issues faced..."
              rows={4}
            />
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={addProgressUpdate.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!notes.trim() || addProgressUpdate.isPending}>
            {addProgressUpdate.isPending ? 'Saving...' : 'Save Update'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
