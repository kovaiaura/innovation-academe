import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { StandaloneAssignment } from '@/types/assignment-management';
import { AlertTriangle } from 'lucide-react';

interface DeleteAssignmentDialogProps {
  assignment: StandaloneAssignment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteAssignmentDialog({
  assignment,
  open,
  onOpenChange,
  onConfirm,
}: DeleteAssignmentDialogProps) {
  if (!assignment) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Assignment
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Are you sure you want to delete <span className="font-semibold">"{assignment.title}"</span>?
            </p>
            <p className="text-destructive">This action cannot be undone.</p>
            {assignment.total_submissions && assignment.total_submissions > 0 && (
              <p className="text-destructive font-medium">
                Warning: This assignment has {assignment.total_submissions} submission(s). All submission data will be lost.
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive hover:bg-destructive/90">
            Delete Assignment
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
