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
  Eye, 
  MoreHorizontal, 
  Trash2, 
  CreditCard,
  History,
  ClipboardList,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import type { Invoice, InvoiceStatus } from '@/types/invoice';
import { format, differenceInDays } from 'date-fns';

interface PurchaseInvoiceListProps {
  invoices: Invoice[];
  loading: boolean;
  onView: (invoice: Invoice) => void;
  onDelete: (id: string) => void;
  onRecordPayment?: (invoice: Invoice) => void;
  onViewPayments?: (invoice: Invoice) => void;
  onViewAuditLog?: (invoice: Invoice) => void;
}

export function PurchaseInvoiceList({
  invoices,
  loading,
  onView,
  onDelete,
  onRecordPayment,
  onViewPayments,
  onViewAuditLog,
}: PurchaseInvoiceListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');

  const filteredInvoices = invoices.filter((inv) => {
    const vendorName = inv.from_company_name || inv.to_company_name || '';
    const matchesSearch =
      inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      vendorName.toLowerCase().includes(search.toLowerCase()) ||
      (inv.reference_number || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    const matchesPaymentStatus = paymentStatusFilter === 'all' || inv.payment_status === paymentStatusFilter;
    return matchesSearch && matchesStatus && matchesPaymentStatus;
  });

  const getPaymentStatusBadge = (invoice: Invoice) => {
    const status = invoice.payment_status || 'unpaid';
    const balance = (invoice.total_amount || 0) - (invoice.amount_paid || 0);
    
    if (balance <= 0 || status === 'paid') {
      return (
        <Badge className="bg-primary/10 text-primary border-primary/20">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Paid
        </Badge>
      );
    }
    
    if (status === 'partial') {
      return (
        <Badge variant="secondary">
          Partial
        </Badge>
      );
    }
    
    return <Badge variant="outline">Pending</Badge>;
  };

  const getDueDateBadge = (invoice: Invoice) => {
    if (!invoice.due_date) return null;
    
    const balance = (invoice.total_amount || 0) - (invoice.amount_paid || 0);
    if (balance <= 0) return null;
    
    const days = differenceInDays(new Date(invoice.due_date), new Date());
    
    if (days < 0) {
      return (
        <Badge variant="destructive" className="text-xs">
          <AlertTriangle className="h-3 w-3 mr-1" />
          {Math.abs(days)}d overdue
        </Badge>
      );
    }
    
    if (days <= 7) {
      return (
        <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200">
          {days === 0 ? 'Due today' : `${days}d left`}
        </Badge>
      );
    }
    
    return (
      <span className="text-xs text-muted-foreground">{days}d left</span>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Loading purchase records...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <CardTitle>Purchase Bills ({filteredInvoices.length})</CardTitle>
          <div className="flex gap-2 flex-wrap">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vendor, bill #..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
              <SelectTrigger className="w-28">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unpaid">Pending</SelectItem>
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
            No purchase records found
          </div>
        ) : (
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Our Ref #</TableHead>
                  <TableHead>Vendor Bill #</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Bill Date</TableHead>
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
                  const vendorName = invoice.from_company_name || invoice.to_company_name;
                  // TDS we deducted - stored in invoice.tds_amount when tds_deducted_by = 'self' or from payments
                  const tdsDeducted = invoice.tds_deducted_by === 'self' ? (invoice.tds_amount || 0) : 0;
                  
                  return (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.invoice_number}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {invoice.reference_number || '-'}
                      </TableCell>
                      <TableCell className="max-w-[180px] truncate">
                        {vendorName}
                      </TableCell>
                      <TableCell>
                        {format(new Date(invoice.invoice_date), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span>
                            {invoice.due_date
                              ? format(new Date(invoice.due_date), 'dd/MM/yyyy')
                              : '-'}
                          </span>
                          {getDueDateBadge(invoice)}
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
                      <TableCell className="text-right">
                        {tdsDeducted > 0 ? (
                          <span className="text-purple-600">
                            ₹{tdsDeducted.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
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
                              View Details
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            {/* Payment actions */}
                            {balance > 0 && onRecordPayment && (
                              <DropdownMenuItem onClick={() => onRecordPayment(invoice)}>
                                <CreditCard className="h-4 w-4 mr-2" />
                                Make Payment
                              </DropdownMenuItem>
                            )}
                            
                            {onViewPayments && (invoice.amount_paid || 0) > 0 && (
                              <DropdownMenuItem onClick={() => onViewPayments(invoice)}>
                                <History className="h-4 w-4 mr-2" />
                                Payment History
                              </DropdownMenuItem>
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
                            
                            {/* Delete - allow for any invoice */}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onDelete(invoice.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
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