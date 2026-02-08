import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { usePaymentsForInvoice } from '@/hooks/usePayments';
import { PAYMENT_MODES } from '@/types/payment';
import type { Invoice } from '@/types/invoice';

interface PaymentHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice | null;
}

export function PaymentHistoryDialog({
  open,
  onOpenChange,
  invoice,
}: PaymentHistoryDialogProps) {
  const { payments, loading, removePayment } = usePaymentsForInvoice(
    open && invoice ? invoice.id : null
  );

  const getPaymentModeLabel = (mode: string) => {
    return PAYMENT_MODES.find(m => m.value === mode)?.label || mode;
  };

  const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalTDS = payments.reduce((sum, p) => sum + (p.tds_amount || 0), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Payment History</DialogTitle>
        </DialogHeader>

        {invoice && (
          <div className="bg-muted/50 p-3 rounded-lg space-y-1 mb-4">
            <p className="text-sm font-medium">{invoice.invoice_number}</p>
            <p className="text-sm text-muted-foreground">{invoice.to_company_name}</p>
            <div className="flex gap-4 text-sm">
              <span>Total: ₹{invoice.total_amount.toLocaleString('en-IN')}</span>
              <span className="text-green-600">Paid: ₹{totalPaid.toLocaleString('en-IN')}</span>
              {totalTDS > 0 && (
                <span className="text-purple-600">TDS: ₹{totalTDS.toLocaleString('en-IN')}</span>
              )}
            </div>
          </div>
        )}

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Loading payments...</div>
        ) : payments.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No payments recorded yet
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">TDS</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {format(new Date(payment.payment_date), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getPaymentModeLabel(payment.payment_mode)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {payment.reference_number || '-'}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ₹{payment.amount.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="text-right">
                      {payment.tds_amount > 0 ? (
                        <span className="text-purple-600">
                          ₹{payment.tds_amount.toLocaleString('en-IN')}
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => removePayment(payment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {payments.length > 0 && (
          <div className="flex justify-end gap-4 pt-4 border-t">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Collected</p>
              <p className="text-lg font-bold">₹{totalPaid.toLocaleString('en-IN')}</p>
            </div>
            {totalTDS > 0 && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total TDS</p>
                <p className="text-lg font-bold text-purple-600">
                  ₹{totalTDS.toLocaleString('en-IN')}
                </p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
