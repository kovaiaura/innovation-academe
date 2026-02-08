import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Download, 
  Eye, 
  MoreHorizontal, 
  Trash2, 
  CheckCircle, 
  CreditCard,
  History,
  Send,
  FileText,
  FileMinus,
  FilePlus,
  Upload,
  ClipboardList
} from 'lucide-react';
import { InvoiceStatusBadge } from './InvoiceStatusBadge';
import type { Invoice, InvoiceStatus } from '@/types/invoice';
import { format, differenceInDays } from 'date-fns';

interface InvoiceListProps {
  invoices: Invoice[];
  loading: boolean;
  onView: (invoice: Invoice) => void;
  onDownload: (invoice: Invoice) => void;
  onStatusChange: (id: string, status: InvoiceStatus) => void;
  onDelete: (id: string) => void;
  onRecordPayment?: (invoice: Invoice) => void;
  onViewPayments?: (invoice: Invoice) => void;
  onIssueCreditNote?: (invoice: Invoice) => void;
  onIssueDebitNote?: (invoice: Invoice) => void;
  onUploadTDS?: (invoice: Invoice) => void;
  onViewAuditLog?: (invoice: Invoice) => void;
}

export function InvoiceList({
  invoices,
  loading,
  onView,
  onDownload,
  onStatusChange,
  onDelete,
  onRecordPayment,
  onViewPayments,
  onIssueCreditNote,
  onIssueDebitNote,
  onUploadTDS,
  onViewAuditLog,
}: InvoiceListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      inv.to_company_name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    const matchesPaymentStatus = paymentStatusFilter === 'all' || inv.payment_status === paymentStatusFilter;
    return matchesSearch && matchesStatus && matchesPaymentStatus;
  });

  const getPaymentStatusBadge = (invoice: Invoice) => {
    const status = invoice.payment_status || 'unpaid';
    const configs: Record<string, { label: string; className: string }> = {
      unpaid: { label: 'Unpaid', className: 'bg-muted text-muted-foreground' },
      partial: { label: 'Partial', className: 'bg-secondary text-secondary-foreground' },
      paid: { label: 'Paid', className: 'bg-primary/10 text-primary' },
    };
    const config = configs[status] || configs.unpaid;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getDaysOverdue = (invoice: Invoice) => {
    if (!invoice.due_date || invoice.status === 'paid' || invoice.status === 'cancelled') {
      return null;
    }
    const days = differenceInDays(new Date(), new Date(invoice.due_date));
    if (days <= 0) return null;
    return days;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Loading invoices...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <CardTitle>Invoices ({filteredInvoices.length})</CardTitle>
          <div className="flex gap-2 flex-wrap">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-28">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="issued">Issued</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
              <SelectTrigger className="w-28">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredInvoices.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground">
            No invoices found
          </div>
        ) : (
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => {
                  const daysOverdue = getDaysOverdue(invoice);
                  const balance = (invoice.total_amount || 0) - (invoice.amount_paid || 0);
                  
                  return (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.invoice_number}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {invoice.to_company_name}
                      </TableCell>
                      <TableCell>
                        {format(new Date(invoice.invoice_date), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>
                            {invoice.due_date
                              ? format(new Date(invoice.due_date), 'dd/MM/yyyy')
                              : '-'}
                          </span>
                          {daysOverdue && (
                            <span className="text-xs text-destructive">
                              {daysOverdue}d overdue
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ₹{invoice.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right text-primary">
                        ₹{(invoice.amount_paid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {balance > 0 ? (
                          <span className="text-destructive">
                            ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <InvoiceStatusBadge status={invoice.status} />
                      </TableCell>
                      <TableCell>
                        {getPaymentStatusBadge(invoice)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onView(invoice)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            {invoice.invoice_type !== 'purchase' && (
                              <DropdownMenuItem onClick={() => onDownload(invoice)}>
                                <Download className="h-4 w-4 mr-2" />
                                Download PDF
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuSeparator />
                            
                            {/* Payment actions */}
                            {invoice.status !== 'cancelled' && invoice.status !== 'draft' && (
                              <>
                                {onRecordPayment && balance > 0 && (
                                  <DropdownMenuItem onClick={() => onRecordPayment(invoice)}>
                                    <CreditCard className="h-4 w-4 mr-2" />
                                    Record Payment
                                  </DropdownMenuItem>
                                )}
                                {onViewPayments && (invoice.amount_paid || 0) > 0 && (
                                  <DropdownMenuItem onClick={() => onViewPayments(invoice)}>
                                    <History className="h-4 w-4 mr-2" />
                                    Payment History
                                  </DropdownMenuItem>
                                )}
                              </>
                            )}
                            
                            <DropdownMenuSeparator />
                            
                            {/* Status actions */}
                            {invoice.status === 'draft' && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => onStatusChange(invoice.id, 'sent')}
                                >
                                  <Send className="h-4 w-4 mr-2" />
                                  Mark as Sent
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => onStatusChange(invoice.id, 'issued')}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Mark as Issued
                                </DropdownMenuItem>
                              </>
                            )}
                            {(invoice.status === 'issued' || invoice.status === 'sent') && (
                              <DropdownMenuItem
                                onClick={() => onStatusChange(invoice.id, 'paid')}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark as Paid
                              </DropdownMenuItem>
                            )}

                            {/* Credit/Debit Notes */}
                            {invoice.status !== 'cancelled' && invoice.status !== 'draft' && (
                              <>
                                <DropdownMenuSeparator />
                                {onIssueCreditNote && (
                                  <DropdownMenuItem onClick={() => onIssueCreditNote(invoice)}>
                                    <FileMinus className="h-4 w-4 mr-2" />
                                    Issue Credit Note
                                  </DropdownMenuItem>
                                )}
                                {onIssueDebitNote && (
                                  <DropdownMenuItem onClick={() => onIssueDebitNote(invoice)}>
                                    <FilePlus className="h-4 w-4 mr-2" />
                                    Issue Debit Note
                                  </DropdownMenuItem>
                                )}
                                {onUploadTDS && invoice.tds_deducted_by === 'client' && (
                                  <DropdownMenuItem onClick={() => onUploadTDS(invoice)}>
                                    <Upload className="h-4 w-4 mr-2" />
                                    TDS Certificate
                                  </DropdownMenuItem>
                                )}
                              </>
                            )}

                            {/* Audit Log */}
                            {onViewAuditLog && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => onViewAuditLog(invoice)}>
                                  <ClipboardList className="h-4 w-4 mr-2" />
                                  View Audit Log
                                </DropdownMenuItem>
                              </>
                            )}
                            
                            {invoice.status === 'draft' && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => onDelete(invoice.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
