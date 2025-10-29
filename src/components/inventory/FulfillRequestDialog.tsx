import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { PurchaseRequest } from '@/types/inventory';
import { Package, Loader2 } from 'lucide-react';

interface FulfillRequestDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  request: PurchaseRequest | null;
  mode: 'in_progress' | 'fulfilled';
  onConfirm: (data: { comments: string; deliveryDate?: string; updateInventory?: boolean }) => void;
}

export function FulfillRequestDialog({ 
  isOpen, 
  onOpenChange, 
  request, 
  mode, 
  onConfirm 
}: FulfillRequestDialogProps) {
  const [comments, setComments] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [updateInventory, setUpdateInventory] = useState(true);

  const handleConfirm = () => {
    if (!comments.trim()) {
      return;
    }
    
    if (mode === 'fulfilled' && !deliveryDate) {
      return;
    }

    onConfirm({ 
      comments, 
      deliveryDate: mode === 'fulfilled' ? deliveryDate : undefined,
      updateInventory: mode === 'fulfilled' ? updateInventory : undefined
    });
    
    setComments('');
    setDeliveryDate('');
    setUpdateInventory(true);
    onOpenChange(false);
  };

  if (!request) return null;

  const isInProgress = mode === 'in_progress';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isInProgress ? (
              <>
                <Loader2 className="h-5 w-5 text-purple-500 animate-spin" />
                Mark as In Progress
              </>
            ) : (
              <>
                <Package className="h-5 w-5 text-green-500" />
                Mark as Fulfilled
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            Update the status of request {request.request_code}
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
                <span className="text-muted-foreground">Institution:</span>
                <span className="font-medium">{request.institution_name}</span>
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
              {isInProgress ? 'Status Update *' : 'Fulfillment Details *'}
            </Label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder={isInProgress 
                ? "e.g., Order placed with supplier. Expected delivery in 7-10 days." 
                : "e.g., Items delivered on schedule. Added to institution inventory."
              }
              rows={3}
              className="resize-none"
            />
          </div>

          {!isInProgress && (
            <>
              <div className="space-y-2">
                <Label htmlFor="deliveryDate">Delivery Date *</Label>
                <Input
                  id="deliveryDate"
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="updateInventory" 
                  checked={updateInventory}
                  onCheckedChange={(checked) => setUpdateInventory(checked as boolean)}
                />
                <label
                  htmlFor="updateInventory"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Update institution inventory automatically
                </label>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!comments.trim() || (!isInProgress && !deliveryDate)}
          >
            {isInProgress ? (
              <>
                <Loader2 className="h-4 w-4 mr-2" />
                Mark In Progress
              </>
            ) : (
              <>
                <Package className="h-4 w-4 mr-2" />
                Mark Fulfilled
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
