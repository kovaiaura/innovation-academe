import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PurchaseRequest } from '@/types/inventory';
import { PurchaseRequestStatusBadge } from './PurchaseRequestStatusBadge';
import { PurchaseRequestTimeline } from './PurchaseRequestTimeline';
import { Calendar, User, Building2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface PurchaseRequestDetailDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  request: PurchaseRequest | null;
}

export function PurchaseRequestDetailDialog({ isOpen, onOpenChange, request }: PurchaseRequestDetailDialogProps) {
  if (!request) return null;

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, any> = {
      urgent: <Badge variant="destructive">URGENT</Badge>,
      normal: <Badge variant="secondary">NORMAL</Badge>,
      low: <Badge variant="outline">LOW</Badge>,
    };
    return variants[priority] || variants.normal;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Purchase Request #{request.request_code}</DialogTitle>
            <PurchaseRequestStatusBadge status={request.status} />
          </div>
          <DialogDescription>
            Detailed information about this purchase request
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Request Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Request Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Requested by</p>
                    <p className="font-medium">{request.officer_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Institution</p>
                    <p className="font-medium">{request.institution_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="font-medium">{format(new Date(request.created_at), 'MMM dd, yyyy')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Priority</p>
                    <div className="mt-1">{getPriorityBadge(request.priority)}</div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground mb-2">Justification</p>
                <p className="text-sm">{request.justification}</p>
              </div>
            </CardContent>
          </Card>

          {/* Items Requested */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Items Requested</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {request.items.map((item, index) => (
                <div key={index} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.item_name}</h4>
                      <Badge variant="outline" className="mt-1">{item.category}</Badge>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₹{item.estimated_total.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Quantity</p>
                      <p className="font-medium">{item.quantity} {item.unit}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Unit Price</p>
                      <p className="font-medium">₹{item.estimated_unit_price.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total</p>
                      <p className="font-medium">₹{item.estimated_total.toLocaleString()}</p>
                    </div>
                  </div>
                  {item.justification && (
                    <p className="text-sm text-muted-foreground italic">{item.justification}</p>
                  )}
                </div>
              ))}

              <Separator />

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="font-semibold">Total Estimated Cost</span>
                <span className="text-2xl font-bold">₹{request.total_estimated_cost.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Request Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <PurchaseRequestTimeline request={request} />
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
