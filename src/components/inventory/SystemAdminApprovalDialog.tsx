import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle } from 'lucide-react';

interface SystemAdminApprovalDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (comments: string) => void;
  onReject: (reason: string) => void;
  mode: 'approve' | 'reject';
}

export function SystemAdminApprovalDialog({
  isOpen,
  onOpenChange,
  onApprove,
  onReject,
  mode,
}: SystemAdminApprovalDialogProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = () => {
    if (mode === 'approve') {
      onApprove(inputValue);
    } else {
      onReject(inputValue);
    }
    setInputValue('');
    onOpenChange(false);
  };

  const handleClose = () => {
    setInputValue('');
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'approve' ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                Approve & Forward to Institution
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-red-500" />
                Reject Purchase Request
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {mode === 'approve'
              ? 'Add review comments and forward this request to the institution for their approval.'
              : 'Provide a reason for rejecting this purchase request.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="input">
              {mode === 'approve' ? 'Review Comments (Optional)' : 'Rejection Reason *'}
            </Label>
            <Textarea
              id="input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                mode === 'approve'
                  ? 'Add any comments for the institution...'
                  : 'Explain why this request is being rejected...'
              }
              rows={4}
              required={mode === 'reject'}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={mode === 'reject' && !inputValue.trim()}
            variant={mode === 'approve' ? 'default' : 'destructive'}
          >
            {mode === 'approve' ? 'Approve & Forward' : 'Reject Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
