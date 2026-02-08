import type { Invoice, InvoiceType } from '@/types/invoice';
import type { Payment } from '@/types/payment';
import type { CreditDebitNote } from '@/types/credit-debit-note';
import { format, startOfMonth, endOfMonth, differenceInDays } from 'date-fns';

export interface InvoiceSummary {
  total_invoiced: number;
  total_outstanding: number;
  total_collected: number;
  total_overdue: number;
  tds_receivable: number;
  tds_deducted: number;
  invoice_count: number;
  paid_count: number;
  overdue_count: number;
}

export interface AgingBucket {
  label: string;
  min_days: number;
  max_days: number | null;
  amount: number;
  count: number;
  invoices: Invoice[];
}

export interface MonthlyReport {
  month: string;
  year: number;
  invoiced: number;
  collected: number;
  outstanding: number;
  invoice_count: number;
  payment_count: number;
}

// Calculate invoice summary
export function calculateInvoiceSummary(
  invoices: Invoice[],
  payments: Payment[]
): InvoiceSummary {
  const total_invoiced = invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  const total_collected = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const tds_deducted = payments.reduce((sum, p) => sum + (p.tds_amount || 0), 0);
  
  const outstandingInvoices = invoices.filter(inv => 
    inv.status !== 'paid' && inv.status !== 'cancelled'
  );
  const total_outstanding = outstandingInvoices.reduce(
    (sum, inv) => sum + ((inv.total_amount || 0) - (inv.amount_paid || 0)), 
    0
  );
  
  const overdueInvoices = invoices.filter(inv => inv.status === 'overdue');
  const total_overdue = overdueInvoices.reduce(
    (sum, inv) => sum + ((inv.total_amount || 0) - (inv.amount_paid || 0)), 
    0
  );
  
  const tds_receivable = invoices
    .filter(inv => inv.tds_deducted_by === 'client')
    .reduce((sum, inv) => sum + (inv.tds_amount || 0), 0);
  
  return {
    total_invoiced,
    total_outstanding,
    total_collected,
    total_overdue,
    tds_receivable,
    tds_deducted,
    invoice_count: invoices.length,
    paid_count: invoices.filter(inv => inv.status === 'paid').length,
    overdue_count: overdueInvoices.length,
  };
}

// Calculate aging buckets
export function calculateAgingBuckets(invoices: Invoice[]): AgingBucket[] {
  const today = new Date();
  const unpaidInvoices = invoices.filter(inv => 
    inv.status !== 'paid' && 
    inv.status !== 'cancelled' && 
    inv.due_date
  );
  
  const buckets: AgingBucket[] = [
    { label: 'Current', min_days: -9999, max_days: 0, amount: 0, count: 0, invoices: [] },
    { label: '1-30 Days', min_days: 1, max_days: 30, amount: 0, count: 0, invoices: [] },
    { label: '31-60 Days', min_days: 31, max_days: 60, amount: 0, count: 0, invoices: [] },
    { label: '61-90 Days', min_days: 61, max_days: 90, amount: 0, count: 0, invoices: [] },
    { label: '90+ Days', min_days: 91, max_days: null, amount: 0, count: 0, invoices: [] },
  ];
  
  unpaidInvoices.forEach(inv => {
    const dueDate = new Date(inv.due_date!);
    const daysOverdue = differenceInDays(today, dueDate);
    const balance = (inv.total_amount || 0) - (inv.amount_paid || 0);
    
    for (const bucket of buckets) {
      if (
        daysOverdue >= bucket.min_days && 
        (bucket.max_days === null || daysOverdue <= bucket.max_days)
      ) {
        bucket.amount += balance;
        bucket.count++;
        bucket.invoices.push(inv);
        break;
      }
    }
  });
  
  return buckets;
}

// Generate monthly report data
export function generateMonthlyReport(
  invoices: Invoice[],
  payments: Payment[],
  year: number,
  month: number
): MonthlyReport {
  const monthStart = startOfMonth(new Date(year, month - 1));
  const monthEnd = endOfMonth(new Date(year, month - 1));
  
  const monthInvoices = invoices.filter(inv => {
    const invDate = new Date(inv.invoice_date);
    return invDate >= monthStart && invDate <= monthEnd;
  });
  
  const monthPayments = payments.filter(p => {
    const payDate = new Date(p.payment_date);
    return payDate >= monthStart && payDate <= monthEnd;
  });
  
  const invoiced = monthInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  const collected = monthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  
  // Outstanding as of month end
  const outstanding = invoices
    .filter(inv => {
      const invDate = new Date(inv.invoice_date);
      return invDate <= monthEnd && inv.status !== 'paid' && inv.status !== 'cancelled';
    })
    .reduce((sum, inv) => sum + ((inv.total_amount || 0) - (inv.amount_paid || 0)), 0);
  
  return {
    month: format(monthStart, 'MMMM'),
    year,
    invoiced,
    collected,
    outstanding,
    invoice_count: monthInvoices.length,
    payment_count: monthPayments.length,
  };
}

// Export to CSV format
export function exportToCSV(
  invoices: Invoice[],
  type: 'register' | 'outstanding' | 'collection'
): string {
  const headers: string[] = [];
  const rows: string[][] = [];
  
  if (type === 'register') {
    headers.push(
      'Invoice No',
      'Date',
      'Customer',
      'GSTIN',
      'Subtotal',
      'CGST',
      'SGST',
      'IGST',
      'Total',
      'Status',
      'Payment Status',
      'Amount Paid',
      'Balance Due'
    );
    
    invoices.forEach(inv => {
      rows.push([
        inv.invoice_number,
        format(new Date(inv.invoice_date), 'dd/MM/yyyy'),
        inv.to_company_name,
        inv.to_company_gstin || '',
        (inv.sub_total || 0).toFixed(2),
        (inv.cgst_amount || 0).toFixed(2),
        (inv.sgst_amount || 0).toFixed(2),
        (inv.igst_amount || 0).toFixed(2),
        (inv.total_amount || 0).toFixed(2),
        inv.status,
        inv.payment_status || 'unpaid',
        (inv.amount_paid || 0).toFixed(2),
        ((inv.total_amount || 0) - (inv.amount_paid || 0)).toFixed(2),
      ]);
    });
  } else if (type === 'outstanding') {
    headers.push(
      'Invoice No',
      'Date',
      'Due Date',
      'Customer',
      'Total Amount',
      'Amount Paid',
      'Balance Due',
      'Days Overdue',
      'Status'
    );
    
    const outstandingInvoices = invoices.filter(
      inv => inv.status !== 'paid' && inv.status !== 'cancelled'
    );
    
    outstandingInvoices.forEach(inv => {
      const daysOverdue = inv.due_date 
        ? Math.max(0, differenceInDays(new Date(), new Date(inv.due_date)))
        : 0;
      
      rows.push([
        inv.invoice_number,
        format(new Date(inv.invoice_date), 'dd/MM/yyyy'),
        inv.due_date ? format(new Date(inv.due_date), 'dd/MM/yyyy') : '-',
        inv.to_company_name,
        (inv.total_amount || 0).toFixed(2),
        (inv.amount_paid || 0).toFixed(2),
        ((inv.total_amount || 0) - (inv.amount_paid || 0)).toFixed(2),
        daysOverdue.toString(),
        inv.status,
      ]);
    });
  }
  
  // Convert to CSV
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');
  
  return csvContent;
}

// Download CSV file
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
