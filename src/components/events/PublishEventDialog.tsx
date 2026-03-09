import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { usePublishEvent } from '@/hooks/useEvents';
import { Event } from '@/types/events';
import { toast } from 'sonner';
import { InstitutionClassSelector, ClassSelection } from './InstitutionClassSelector';

interface PublishEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event | null;
}

export function PublishEventDialog({ open, onOpenChange, event }: PublishEventDialogProps) {
  const [selectedClasses, setSelectedClasses] = useState<ClassSelection[]>([]);
  const publishEvent = usePublishEvent();

  const handlePublish = async () => {
    if (!event) return;

    if (selectedClasses.length === 0) {
      toast.error('Please select at least one class');
      return;
    }

    try {
      await publishEvent.mutateAsync({
        event_id: event.id,
        assignments: selectedClasses,
      });
      onOpenChange(false);
      setSelectedClasses([]);
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Publish Event</DialogTitle>
          <DialogDescription>
            Select the schools and classes to publish "{event?.title}" to.
          </DialogDescription>
        </DialogHeader>

        <InstitutionClassSelector
          selectedClasses={selectedClasses}
          onSelectionChange={setSelectedClasses}
          height="400px"
          idPrefix="publish"
        />

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <span className="text-sm text-muted-foreground">
              {selectedClasses.length} class(es) selected
            </span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handlePublish}
                disabled={publishEvent.isPending || selectedClasses.length === 0}
              >
                {publishEvent.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  'Publish Event'
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
