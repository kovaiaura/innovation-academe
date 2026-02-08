import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Plus, Trash2 } from 'lucide-react';
import { NOTE_REASONS, type NoteLineItem } from '@/types/credit-debit-note';
import type { Invoice } from '@/types/invoice';
import { createCreditDebitNote } from '@/services/credit-debit-note.service';
import { toast } from 'sonner';

interface CreateDebitNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: Invoice | null;
  onSuccess?: () => void;
}

export function CreateDebitNoteDialog({
  open,
  onOpenChange,
  invoice,
  onSuccess,
}: CreateDebitNoteDialogProps) {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [notes, setNotes] = useState('');
  const [lineItems, setLineItems] = useState<Omit<NoteLineItem, 'id'>[]>([
    { description: '', hsn_sac_code: '', quantity: 1, rate: 0, amount: 0 },
  ]);

  // For standalone debit note
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerGstin, setCustomerGstin] = useState('');

  const isInterState = invoice
    ? invoice.from_company_state_code !== invoice.to_company_state_code
    : false;

  useEffect(() => {
    if (open) {
      if (invoice) {
        setCustomerName(invoice.to_company_name);
        setCustomerAddress(
          [
            invoice.to_company_address,
            invoice.to_company_city,
            invoice.to_company_state,
            invoice.to_company_pincode,
          ]
            .filter(Boolean)
            .join(', ')
        );
        setCustomerGstin(invoice.to_company_gstin || '');
      } else {
        setCustomerName('');
        setCustomerAddress('');
        setCustomerGstin('');
      }
      setLineItems([
        { description: '', hsn_sac_code: '', quantity: 1, rate: 0, amount: 0 },
      ]);
      setReason('');
      setCustomReason('');
      setNotes('');
    }
  }, [open, invoice]);

  const updateLineItem = (index: number, field: keyof NoteLineItem, value: unknown) => {
    const updated = [...lineItems];
    (updated[index] as Record<string, unknown>)[field] = value;
    
    if (field === 'quantity' || field === 'rate') {
      updated[index].amount = updated[index].quantity * updated[index].rate;
    }
    
    setLineItems(updated);
  };

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { description: '', hsn_sac_code: '', quantity: 1, rate: 0, amount: 0 },
    ]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const cgstRate = isInterState ? 0 : 9;
  const sgstRate = isInterState ? 0 : 9;
  const igstRate = isInterState ? 18 : 0;
  const cgstAmount = (subtotal * cgstRate) / 100;
  const sgstAmount = (subtotal * sgstRate) / 100;
  const igstAmount = (subtotal * igstRate) / 100;
  const totalAmount = subtotal + cgstAmount + sgstAmount + igstAmount;

  const handleSubmit = async () => {
    const finalReason = reason === 'Other' ? customReason : reason;
    
    if (!finalReason) {
      toast.error('Please select a reason');
      return;
    }

    if (!invoice && !customerName) {
      toast.error('Please enter customer name');
      return;
    }
    
    if (lineItems.every(item => !item.description || item.amount === 0)) {
      toast.error('Please add at least one line item');
      return;
    }

    setLoading(true);
    try {
      await createCreditDebitNote({
        note_type: 'debit',
        original_invoice_id: invoice?.id,
        institution_id: invoice?.institution_id,
        customer_name: invoice ? invoice.to_company_name : customerName,
        customer_address: invoice
          ? [
              invoice.to_company_address,
              invoice.to_company_city,
              invoice.to_company_state,
              invoice.to_company_pincode,
            ]
              .filter(Boolean)
              .join(', ')
          : customerAddress,
        customer_gstin: invoice ? invoice.to_company_gstin : customerGstin,
        reason: finalReason,
        line_items: lineItems.filter(item => item.description && item.amount > 0),
        is_inter_state: isInterState,
      });

      toast.success('Debit Note created successfully');
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error creating debit note:', error);
      toast.error('Failed to create debit note');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Debit Note</DialogTitle>
          <DialogDescription>
            {invoice
              ? `Issue debit note against Invoice ${invoice.invoice_number}`
              : 'Create a standalone debit note for additional charges'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Customer Info */}
          {invoice ? (
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="font-medium">{invoice.to_company_name}</p>
              <p className="text-sm text-muted-foreground">
                {invoice.to_company_gstin && `GSTIN: ${invoice.to_company_gstin}`}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              <div>
                <Label>Customer/Vendor Name *</Label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                />
              </div>
              <div>
                <Label>Address</Label>
                <Textarea
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Enter address"
                  rows={2}
                />
              </div>
              <div>
                <Label>GSTIN</Label>
                <Input
                  value={customerGstin}
                  onChange={(e) => setCustomerGstin(e.target.value)}
                  placeholder="Enter GSTIN"
                />
              </div>
            </div>
          )}

          {/* Reason */}
          <div className="grid gap-4">
            <div>
              <Label>Reason for Debit Note</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  {NOTE_REASONS.debit.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {reason === 'Other' && (
              <div>
                <Label>Specify Reason</Label>
                <Input
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Enter custom reason"
                />
              </div>
            )}
          </div>

          {/* Line Items */}
          <div className="space-y-3">
            <Label>Line Items</Label>
            {lineItems.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-4">
                  <Input
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    placeholder="HSN/SAC"
                    value={item.hsn_sac_code || ''}
                    onChange={(e) => updateLineItem(index, 'hsn_sac_code', e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    placeholder="Rate"
                    value={item.rate}
                    onChange={(e) => updateLineItem(index, 'rate', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-1 text-right font-medium">
                  ₹{item.amount.toFixed(2)}
                </div>
                <div className="col-span-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLineItem(index)}
                    disabled={lineItems.length === 1}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </Button>
          </div>

          {/* Totals */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            {!isInterState ? (
              <>
                <div className="flex justify-between text-sm">
                  <span>CGST @{cgstRate}%:</span>
                  <span>₹{cgstAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>SGST @{sgstRate}%:</span>
                  <span>₹{sgstAmount.toFixed(2)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-sm">
                <span>IGST @{igstRate}%:</span>
                <span>₹{igstAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label>Additional Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating...' : 'Create Debit Note'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
