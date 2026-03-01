import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { PAYMENT_MODES, type PaymentMode, type CreatePaymentInput } from '@/types/payment';
import type { Invoice } from '@/types/invoice';
import { format } from 'date-fns';

interface RecordPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice | null;
  onSubmit: (data: CreatePaymentInput) => Promise<void>;
}

export function RecordPaymentDialog({
  open,
  onOpenChange,
  invoice,
  onSubmit,
}: RecordPaymentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    payment_date: format(new Date(), 'yyyy-MM-dd'),
    amount: '',
    payment_mode: '' as PaymentMode,
    reference_number: '',
    tds_amount: '',
    notes: '',
  });

  const totalAmount = invoice?.total_amount || 0;
  const alreadyPaid = invoice?.amount_paid || 0;
  const alreadyTds = invoice?.tds_amount || 0;
  const balanceDue = totalAmount - alreadyPaid - alreadyTds;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;

    setLoading(true);
    try {
      await onSubmit({
        invoice_id: invoice.id,
        payment_date: formData.payment_date,
        amount: parseFloat(formData.amount) || 0,
        payment_mode: formData.payment_mode,
        reference_number: formData.reference_number || undefined,
        tds_deducted: parseFloat(formData.tds_amount) > 0,
        tds_amount: parseFloat(formData.tds_amount) || 0,
        notes: formData.notes || undefined,
      });
      onOpenChange(false);
      setFormData({
        payment_date: format(new Date(), 'yyyy-MM-dd'),
        amount: '',
        payment_mode: '' as PaymentMode,
        reference_number: '',
        tds_amount: '',
        notes: '',
      });
    } finally {
      setLoading(false);
    }
  };

  const enteredAmount = parseFloat(formData.amount) || 0;
  const enteredTds = parseFloat(formData.tds_amount) || 0;
  const newBalance = balanceDue - enteredAmount - enteredTds;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>

        {invoice && (
          <div className="bg-muted/50 p-3 rounded-lg space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">{invoice.invoice_number}</span>
              <span className="text-muted-foreground">{invoice.to_company_name}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between">
              <span>Invoice Total:</span>
              <span className="font-medium">₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
            {alreadyPaid > 0 && (
              <div className="flex justify-between">
                <span>Already Paid:</span>
                <span>₹{alreadyPaid.toLocaleString('en-IN')}</span>
              </div>
            )}
            {alreadyTds > 0 && (
              <div className="flex justify-between">
                <span>TDS Already Deducted:</span>
                <span>₹{alreadyTds.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between font-medium text-primary">
              <span>Balance Due:</span>
              <span>₹{balanceDue.toLocaleString('en-IN')}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Primary: Amount Received & TDS */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Amount Received *</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>TDS Deducted</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.tds_amount}
                onChange={(e) => setFormData({ ...formData, tds_amount: e.target.value })}
              />
            </div>
          </div>

          {/* Live balance preview */}
          {(enteredAmount > 0 || enteredTds > 0) && (
            <div className="bg-muted/30 p-2 rounded text-sm flex justify-between">
              <span>Remaining after this payment:</span>
              <span className={newBalance <= 0 ? 'text-green-600 font-medium' : 'text-destructive font-medium'}>
                {newBalance <= 0 ? 'Fully Paid ✓' : `₹${newBalance.toLocaleString('en-IN')}`}
              </span>
            </div>
          )}

          {/* Secondary fields */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Payment Date *</Label>
              <Input
                type="date"
                value={formData.payment_date}
                onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Payment Mode *</Label>
              <Select
                value={formData.payment_mode}
                onValueChange={(v) => setFormData({ ...formData, payment_mode: v as PaymentMode })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_MODES.map((mode) => (
                    <SelectItem key={mode.value} value={mode.value}>
                      {mode.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Reference / Transaction Number</Label>
            <Input
              placeholder="Enter reference number"
              value={formData.reference_number}
              onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea
              placeholder="Any additional notes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.payment_mode || !formData.amount}>
              {loading ? 'Recording...' : 'Record Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
