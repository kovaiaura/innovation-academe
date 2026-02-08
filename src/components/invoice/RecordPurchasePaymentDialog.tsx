import { useState, useEffect } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Calendar, IndianRupee } from 'lucide-react';
import { PAYMENT_MODES, TDS_SECTIONS, TDS_QUARTERS, type PaymentMode, type CreatePaymentInput } from '@/types/payment';
import type { Invoice } from '@/types/invoice';
import { format, differenceInDays } from 'date-fns';

interface RecordPurchasePaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice | null;
  onSubmit: (data: CreatePaymentInput) => Promise<void>;
}

export function RecordPurchasePaymentDialog({
  open,
  onOpenChange,
  invoice,
  onSubmit,
}: RecordPurchasePaymentDialogProps) {
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
    tds_rate: '',
    tds_section: '',
    tds_quarter: '',
    our_tan: '',
    notes: '',
  });

  const balanceDue = invoice 
    ? (invoice.total_amount || 0) - (invoice.amount_paid || 0)
    : 0;

  const daysUntilDue = invoice?.due_date 
    ? differenceInDays(new Date(invoice.due_date), new Date())
    : null;

  // Calculate TDS amount from rate when rate changes
  useEffect(() => {
    if (formData.tds_rate && formData.amount) {
      const rate = parseFloat(formData.tds_rate);
      const amount = parseFloat(formData.amount);
      if (!isNaN(rate) && !isNaN(amount)) {
        const tdsAmount = (amount * rate) / 100;
        setFormData(prev => ({ ...prev, tds_amount: tdsAmount.toFixed(2) }));
      }
    }
  }, [formData.tds_rate, formData.amount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;

    const paymentAmount = parseFloat(formData.amount) || 0;
    const tdsAmount = formData.tds_deducted ? (parseFloat(formData.tds_amount) || 0) : 0;
    
    // For purchase, amount paid = net amount (after TDS deduction)
    // Total settled = paymentAmount + tdsAmount

    setLoading(true);
    try {
      await onSubmit({
        invoice_id: invoice.id,
        payment_date: formData.payment_date,
        amount: paymentAmount,
        payment_mode: formData.payment_mode,
        reference_number: formData.reference_number || undefined,
        bank_name: formData.bank_name || undefined,
        cheque_number: formData.cheque_number || undefined,
        cheque_date: formData.cheque_date || undefined,
        tds_deducted: formData.tds_deducted,
        tds_amount: tdsAmount,
        tds_rate: formData.tds_rate ? parseFloat(formData.tds_rate) : undefined,
        tds_section: formData.tds_section || undefined,
        tds_quarter: formData.tds_quarter || undefined,
        our_tan: formData.our_tan || undefined,
        is_self_deducted_tds: formData.tds_deducted, // For purchase, TDS is always self-deducted
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
        tds_rate: '',
        tds_section: '',
        tds_quarter: '',
        our_tan: '',
        notes: '',
      });
    } finally {
      setLoading(false);
    }
  };

  const showChequeFields = formData.payment_mode === 'cheque';
  const netPayable = formData.tds_deducted 
    ? (parseFloat(formData.amount) || 0) - (parseFloat(formData.tds_amount) || 0)
    : (parseFloat(formData.amount) || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Make Payment to Vendor</DialogTitle>
        </DialogHeader>

        {invoice && (
          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium">{invoice.invoice_number}</p>
                <p className="text-sm text-muted-foreground">{invoice.from_company_name || invoice.to_company_name}</p>
              </div>
              {daysUntilDue !== null && (
                <Badge 
                  variant={daysUntilDue < 0 ? 'destructive' : daysUntilDue <= 7 ? 'secondary' : 'outline'}
                  className="shrink-0"
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  {daysUntilDue < 0 
                    ? `${Math.abs(daysUntilDue)}d overdue`
                    : daysUntilDue === 0 
                      ? 'Due today'
                      : `${daysUntilDue}d left`
                  }
                </Badge>
              )}
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bill Amount:</span>
                <span className="font-medium">₹{invoice.total_amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Already Paid:</span>
                <span>₹{(invoice.amount_paid || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between col-span-2 pt-1 border-t">
                <span className="font-medium text-destructive">Balance to Pay:</span>
                <span className="font-bold text-destructive">₹{balanceDue.toLocaleString('en-IN')}</span>
              </div>
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
              <Label>Gross Amount *</Label>
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
            <Label>Reference / UTR Number</Label>
            <Input
              placeholder="Enter transaction reference"
              value={formData.reference_number}
              onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
            />
          </div>

          {showChequeFields && (
            <div className="grid grid-cols-2 gap-4 p-3 bg-muted/30 rounded-lg">
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

          {/* TDS Section - Self Deducted for Purchase */}
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="tds_deducted"
                checked={formData.tds_deducted}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, tds_deducted: checked as boolean })
                }
              />
              <Label htmlFor="tds_deducted" className="font-medium cursor-pointer">
                We Deducted TDS
              </Label>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Check this if you have withheld TDS before paying the vendor
            </p>

            {formData.tds_deducted && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>TDS Section</Label>
                    <Select
                      value={formData.tds_section}
                      onValueChange={(v) => setFormData({ ...formData, tds_section: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select section" />
                      </SelectTrigger>
                      <SelectContent>
                        {TDS_SECTIONS.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>TDS Rate (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="e.g., 10"
                      value={formData.tds_rate}
                      onChange={(e) => setFormData({ ...formData, tds_rate: e.target.value })}
                    />
                  </div>
                </div>
                
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
                </div>

                <div className="space-y-2">
                  <Label>Our TAN Number</Label>
                  <Input
                    placeholder="e.g., DELC12345D"
                    value={formData.our_tan}
                    onChange={(e) => setFormData({ ...formData, our_tan: e.target.value })}
                  />
                </div>

                {/* Net Payable Calculation */}
                <div className="bg-primary/5 p-3 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2 text-sm">
                    <IndianRupee className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">Net Amount to Pay:</span>
                    <span className="font-bold text-primary ml-auto">
                      ₹{netPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Gross ₹{(parseFloat(formData.amount) || 0).toLocaleString('en-IN')} − TDS ₹{(parseFloat(formData.tds_amount) || 0).toLocaleString('en-IN')}
                  </p>
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