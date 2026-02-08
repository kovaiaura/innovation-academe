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
import { Checkbox } from '@/components/ui/checkbox';
import { PAYMENT_MODES, TDS_QUARTERS, type PaymentMode, type CreatePaymentInput } from '@/types/payment';
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
    bank_name: '',
    cheque_number: '',
    cheque_date: '',
    tds_deducted: false,
    tds_amount: '',
    tds_certificate_number: '',
    tds_quarter: '',
    notes: '',
  });

  const balanceDue = invoice 
    ? (invoice.total_amount || 0) - (invoice.amount_paid || 0)
    : 0;

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
        bank_name: formData.bank_name || undefined,
        cheque_number: formData.cheque_number || undefined,
        cheque_date: formData.cheque_date || undefined,
        tds_deducted: formData.tds_deducted,
        tds_amount: formData.tds_deducted ? parseFloat(formData.tds_amount) || 0 : 0,
        tds_certificate_number: formData.tds_certificate_number || undefined,
        tds_quarter: formData.tds_quarter || undefined,
        notes: formData.notes || undefined,
      });
      onOpenChange(false);
      // Reset form
      setFormData({
        payment_date: format(new Date(), 'yyyy-MM-dd'),
        amount: '',
        payment_mode: '' as PaymentMode,
        reference_number: '',
        bank_name: '',
        cheque_number: '',
        cheque_date: '',
        tds_deducted: false,
        tds_amount: '',
        tds_certificate_number: '',
        tds_quarter: '',
        notes: '',
      });
    } finally {
      setLoading(false);
    }
  };

  const showChequeFields = formData.payment_mode === 'cheque';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>

        {invoice && (
          <div className="bg-muted/50 p-3 rounded-lg space-y-1">
            <p className="text-sm font-medium">{invoice.invoice_number}</p>
            <p className="text-sm text-muted-foreground">{invoice.to_company_name}</p>
            <div className="flex justify-between text-sm">
              <span>Invoice Total:</span>
              <span className="font-medium">₹{invoice.total_amount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Already Paid:</span>
              <span>₹{(invoice.amount_paid || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm font-medium text-primary">
              <span>Balance Due:</span>
              <span>₹{balanceDue.toLocaleString('en-IN')}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Payment Date *</Label>
              <Input
                type="date"
                value={formData.payment_date}
                onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Amount *</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Payment Mode *</Label>
            <Select
              value={formData.payment_mode}
              onValueChange={(v) => setFormData({ ...formData, payment_mode: v as PaymentMode })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment mode" />
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

          <div className="space-y-2">
            <Label>Reference / Transaction Number</Label>
            <Input
              placeholder="Enter reference number"
              value={formData.reference_number}
              onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
            />
          </div>

          {showChequeFields && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cheque Number</Label>
                <Input
                  placeholder="Cheque number"
                  value={formData.cheque_number}
                  onChange={(e) => setFormData({ ...formData, cheque_number: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Cheque Date</Label>
                <Input
                  type="date"
                  value={formData.cheque_date}
                  onChange={(e) => setFormData({ ...formData, cheque_date: e.target.value })}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Bank Name</Label>
                <Input
                  placeholder="Bank name"
                  value={formData.bank_name}
                  onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                />
              </div>
            </div>
          )}

          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="tds_deducted"
                checked={formData.tds_deducted}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, tds_deducted: checked as boolean })
                }
              />
              <Label htmlFor="tds_deducted" className="font-normal cursor-pointer">
                TDS Deducted by Client
              </Label>
            </div>

            {formData.tds_deducted && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>TDS Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.tds_amount}
                    onChange={(e) => setFormData({ ...formData, tds_amount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Quarter</Label>
                  <Select
                    value={formData.tds_quarter}
                    onValueChange={(v) => setFormData({ ...formData, tds_quarter: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select quarter" />
                    </SelectTrigger>
                    <SelectContent>
                      {TDS_QUARTERS.map((q) => (
                        <SelectItem key={q.value} value={q.value}>
                          {q.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>TDS Certificate Number</Label>
                  <Input
                    placeholder="Certificate number (if available)"
                    value={formData.tds_certificate_number}
                    onChange={(e) => setFormData({ ...formData, tds_certificate_number: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
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
