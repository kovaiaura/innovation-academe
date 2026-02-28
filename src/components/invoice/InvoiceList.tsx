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
} from 'lucide-react';
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
}: InvoiceListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      inv.to_company_name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || getSimplifiedStatus(inv) === statusFilter;
    return matchesSearch && matchesStatus;
  });

  function getSimplifiedStatus(invoice: Invoice): string {
    if (invoice.status === 'draft') return 'draft';
    if (invoice.status === 'sent') return 'sent';
    if (invoice.status === 'cancelled') return 'cancelled';
    const balance = (invoice.total_amount || 0) - (invoice.amount_paid || 0);
    if (balance <= 0 || invoice.status === 'paid') return 'fully_paid';
    if ((invoice.amount_paid || 0) > 0) return 'partially_paid';
    return 'sent';
  }

  function getStatusBadge(invoice: Invoice) {
    const status = getSimplifiedStatus(invoice);
    const configs: Record<string, { label: string; className: string }> = {
      draft: { label: 'Draft', className: 'bg-muted text-muted-foreground' },
      sent: { label: 'Sent', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
      partially_paid: { label: 'Partially Paid', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
      fully_paid: { label: 'Fully Paid', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
      cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    };
    const config = configs[status] || configs.draft;
    return <Badge className={config.className}>{config.label}</Badge>;
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">Loading invoices...</CardContent>
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
              <Input placeholder="Search invoices..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="partially_paid">Partially Paid</SelectItem>
                <SelectItem value="fully_paid">Fully Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredInvoices.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground">No invoices found</div>
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
                  <TableHead className="text-right">TDS</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => {
                  const balance = (invoice.total_amount || 0) - (invoice.amount_paid || 0);
                  const tdsAmount = invoice.tds_deducted_by === 'client' ? (invoice.tds_amount || 0) : 0;
                  const daysOverdue = invoice.due_date && invoice.status !== 'paid' && invoice.status !== 'cancelled'
                    ? Math.max(0, differenceInDays(new Date(), new Date(invoice.due_date)))
                    : 0;
                  
                  return (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{invoice.to_company_name}</TableCell>
                      <TableCell>{format(new Date(invoice.invoice_date), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{invoice.due_date ? format(new Date(invoice.due_date), 'dd/MM/yyyy') : '-'}</span>
                          {daysOverdue > 0 && <span className="text-xs text-destructive">{daysOverdue}d overdue</span>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">₹{invoice.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell className="text-right text-primary">₹{(invoice.amount_paid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell className="text-right font-medium">
                        {balance > 0 ? <span className="text-destructive">₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span> : <span className="text-muted-foreground">-</span>}
                      </TableCell>
                      <TableCell className="text-right">
                        {tdsAmount > 0 ? <span className="text-purple-600">₹{tdsAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span> : <span className="text-muted-foreground">-</span>}
                      </TableCell>
                      <TableCell>{getStatusBadge(invoice)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onView(invoice)}>
                              <Eye className="h-4 w-4 mr-2" /> View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDownload(invoice)}>
                              <Download className="h-4 w-4 mr-2" /> Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {invoice.status !== 'cancelled' && invoice.status !== 'paid' && balance > 0 && onRecordPayment && (
                              <DropdownMenuItem onClick={() => onRecordPayment(invoice)}>
                                <CreditCard className="h-4 w-4 mr-2" /> Record Payment
                              </DropdownMenuItem>
                            )}
                            {onViewPayments && (invoice.amount_paid || 0) > 0 && (
                              <DropdownMenuItem onClick={() => onViewPayments(invoice)}>
                                <History className="h-4 w-4 mr-2" /> Payment History
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {invoice.status === 'draft' && (
                              <DropdownMenuItem onClick={() => onStatusChange(invoice.id, 'sent')}>
                                <Send className="h-4 w-4 mr-2" /> Mark as Sent
                              </DropdownMenuItem>
                            )}
                            {(invoice.status === 'issued' || invoice.status === 'sent') && (
                              <DropdownMenuItem onClick={() => onStatusChange(invoice.id, 'paid')}>
                                <CheckCircle className="h-4 w-4 mr-2" /> Mark as Fully Paid
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onDelete(invoice.id)} className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
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
