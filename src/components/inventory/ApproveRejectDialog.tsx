import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PurchaseRequest } from '@/types/inventory';
import { CheckCircle, XCircle } from 'lucide-react';

interface ApproveRejectDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  request: PurchaseRequest | null;
  mode: 'approve' | 'reject';
  onConfirm: (comments: string) => void;
  title?: string;
}

export function ApproveRejectDialog({ 
  isOpen, 
  onOpenChange, 
  request, 
  mode, 
  onConfirm,
  title 
}: ApproveRejectDialogProps) {
  const [comments, setComments] = useState('');

  const handleConfirm = () => {
    if (mode === 'reject' && !comments.trim()) {
      return; // Require reason for rejection
    }
    onConfirm(comments);
    setComments('');
    onOpenChange(false);
  };

  if (!request) return null;

  const isApprove = mode === 'approve';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isApprove ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            {title || (isApprove ? `Approve Request ${request.request_code}` : `Reject Request ${request.request_code}`)}
          </DialogTitle>
          <DialogDescription>
            {isApprove 
              ? 'Add optional comments about this approval'
              : 'Please provide a reason for rejection'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border p-3 bg-muted/50">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Request:</span>
                <span className="font-medium">{request.request_code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Officer:</span>
                <span className="font-medium">{request.officer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Cost:</span>
                <span className="font-bold">₹{request.total_estimated_cost.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comments">
              {isApprove ? 'Comments (Optional)' : 'Rejection Reason *'}
            </Label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder={isApprove 
                ? "Add any comments or instructions..." 
                : "Explain why this request is being rejected..."
              }
              rows={4}
              className="resize-none"
            />
            {!isApprove && (
              <p className="text-xs text-muted-foreground">
                A reason is required for rejection
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            variant={isApprove ? 'default' : 'destructive'} 
            onClick={handleConfirm}
            disabled={!isApprove && !comments.trim()}
          >
            {isApprove ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve Request
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                Reject Request
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
