import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, ArrowUpDown, TrendingUp, TrendingDown, IndianRupee, AlertTriangle, CheckCircle, BarChart3, ChevronUp, ChevronDown, ArrowUpDownIcon } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import type { Invoice } from '@/types/invoice';
import type { Payment } from '@/types/payment';
import { exportTopSheetCSV } from '@/services/invoice-export.service';

interface TopSheetTabProps {
  salesInvoices: Invoice[];
  purchaseInvoices: Invoice[];
  payments: Payment[];
  loading: boolean;
}

type SortField = 'date' | 'name' | 'credit' | 'debit';
type SortDir = 'asc' | 'desc';

interface LedgerEntry {
  id: string;
  date: string;
  invoiceNo: string;
  name: string;
  type: 'sales' | 'purchase';
  status: string;
  credit: number;
  debit: number;
  gst: number;
  sgst: number;
  cgst: number;
  tds: number;
  handledBy: string;
  remark: string;
}

export function TopSheetTab({ salesInvoices, purchaseInvoices, payments, loading }: TopSheetTabProps) {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [isReordering, setIsReordering] = useState(false);
  const [manualOrder, setManualOrder] = useState<string[]>([]);

  // Summary calculations
  const summary = useMemo(() => {
    const totalSales = salesInvoices.reduce((s, inv) => s + (inv.total_amount || 0), 0);
    const totalReceived = payments.reduce((s, p) => s + (p.amount || 0), 0);
    const overdue = salesInvoices
      .filter(inv => inv.status === 'overdue' || (inv.due_date && new Date(inv.due_date) < new Date() && inv.status !== 'paid' && inv.status !== 'cancelled'))
      .reduce((s, inv) => s + ((inv.total_amount || 0) - (inv.amount_paid || 0)), 0);
    const totalPurchases = purchaseInvoices.reduce((s, inv) => s + (inv.total_amount || 0), 0);
    const settledAmount = purchaseInvoices
      .filter(inv => inv.status === 'paid')
      .reduce((s, inv) => s + (inv.total_amount || 0), 0);
    const profit = totalReceived - settledAmount;

    return { totalSales, totalReceived, overdue, totalPurchases, settledAmount, profit };
  }, [salesInvoices, purchaseInvoices, payments]);

  // Combined ledger entries (sorted)
  const sortedEntries = useMemo(() => {
    const entries: LedgerEntry[] = [];

    salesInvoices.forEach(inv => {
      const isPaid = inv.status === 'paid';
      entries.push({
        id: inv.id,
        date: inv.invoice_date,
        invoiceNo: inv.invoice_number,
        name: inv.to_company_name,
        type: 'sales',
        status: inv.status,
        credit: isPaid ? (inv.total_amount || 0) : 0,
        debit: 0,
        gst: (inv.cgst_amount || 0) + (inv.sgst_amount || 0) + (inv.igst_amount || 0),
        sgst: inv.sgst_amount || 0,
        cgst: inv.cgst_amount || 0,
        tds: inv.tds_amount || 0,
        handledBy: inv.handled_by || '',
        remark: inv.remark || inv.notes || '',
      });
    });

    purchaseInvoices.forEach(inv => {
      const isSettled = inv.status === 'paid';
      entries.push({
        id: inv.id,
        date: inv.invoice_date,
        invoiceNo: inv.invoice_number,
        name: inv.from_company_name || inv.to_company_name,
        type: 'purchase',
        status: inv.status,
        credit: 0,
        debit: isSettled ? (inv.total_amount || 0) : 0,
        gst: (inv.cgst_amount || 0) + (inv.sgst_amount || 0) + (inv.igst_amount || 0),
        sgst: inv.sgst_amount || 0,
        cgst: inv.cgst_amount || 0,
        tds: inv.tds_amount || 0,
        handledBy: inv.handled_by || '',
        remark: inv.remark || inv.notes || '',
      });
    });

    // Sort
    entries.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'date': cmp = new Date(a.date).getTime() - new Date(b.date).getTime(); break;
        case 'name': cmp = a.name.localeCompare(b.name); break;
        case 'credit': cmp = a.credit - b.credit; break;
        case 'debit': cmp = a.debit - b.debit; break;
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });

    return entries;
  }, [salesInvoices, purchaseInvoices, sortField, sortDir]);

  // Initialize manual order when sorted entries change (or when toggling reorder mode)
  useEffect(() => {
    if (!isReordering) {
      setManualOrder(sortedEntries.map(e => e.id));
    }
  }, [sortedEntries, isReordering]);

  // The actual displayed entries
  const ledgerEntries = useMemo(() => {
    if (!isReordering || manualOrder.length === 0) return sortedEntries;
    const entryMap = new Map(sortedEntries.map(e => [e.id, e]));
    return manualOrder
      .map(id => entryMap.get(id))
      .filter((e): e is LedgerEntry => !!e);
  }, [isReordering, manualOrder, sortedEntries]);

  const moveRow = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= manualOrder.length) return;
    const newOrder = [...manualOrder];
    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
    setManualOrder(newOrder);
  };

  const toggleSort = (field: SortField) => {
    if (isReordering) return; // Disable sort when reordering
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const handleExport = () => {
    exportTopSheetCSV(salesInvoices, purchaseInvoices);
  };

  const fmt = (n: number) => new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

  const displayInvoiceNo = (invoiceNo: string) => {
    if (!invoiceNo || invoiceNo.trim() === '' || invoiceNo.startsWith('SAL/')) return '--';
    return invoiceNo;
  };

  const summaryCards = [
    { label: 'Total Sales', value: summary.totalSales, icon: TrendingUp, color: 'text-blue-600' },
    { label: 'Total Received', value: summary.totalReceived, icon: CheckCircle, color: 'text-green-600' },
    { label: 'Overdue', value: summary.overdue, icon: AlertTriangle, color: 'text-red-600' },
    { label: 'Total Purchases', value: summary.totalPurchases, icon: TrendingDown, color: 'text-orange-600' },
    { label: 'Settled Amount', value: summary.settledAmount, icon: IndianRupee, color: 'text-emerald-600' },
    { label: 'Profit', value: summary.profit, icon: BarChart3, color: summary.profit >= 0 ? 'text-green-600' : 'text-red-600' },
  ];

  if (loading) {
    return <div className="text-center py-10 text-muted-foreground">Loading top sheet...</div>;
  }

  const totalCredit = ledgerEntries.reduce((s, e) => s + e.credit, 0);
  const totalDebit = ledgerEntries.reduce((s, e) => s + e.debit, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {summaryCards.map(card => (
          <Card key={card.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <card.icon className={`h-4 w-4 ${card.color}`} />
                <p className="text-xs text-muted-foreground">{card.label}</p>
              </div>
              <p className="text-lg font-bold">₹{fmt(card.value)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{ledgerEntries.length} entries</p>
        <div className="flex items-center gap-2">
          <Button
            variant={isReordering ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsReordering(!isReordering)}
          >
            <ArrowUpDownIcon className="h-4 w-4 mr-2" />
            {isReordering ? 'Done Reordering' : 'Reorder'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Combined Ledger Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Sl.No</TableHead>
              <TableHead className="cursor-pointer" onClick={() => toggleSort('date')}>
                <span className="flex items-center gap-1">Date <ArrowUpDown className="h-3 w-3" /></span>
              </TableHead>
              <TableHead>Invoice No</TableHead>
              <TableHead className="cursor-pointer" onClick={() => toggleSort('name')}>
                <span className="flex items-center gap-1">Supplier/Customer <ArrowUpDown className="h-3 w-3" /></span>
              </TableHead>
              <TableHead className="text-right cursor-pointer" onClick={() => toggleSort('credit')}>
                <span className="flex items-center justify-end gap-1">Credit <ArrowUpDown className="h-3 w-3" /></span>
              </TableHead>
              <TableHead className="text-right cursor-pointer" onClick={() => toggleSort('debit')}>
                <span className="flex items-center justify-end gap-1">Debit <ArrowUpDown className="h-3 w-3" /></span>
              </TableHead>
              <TableHead className="text-right">GST</TableHead>
              <TableHead className="text-right">SGST</TableHead>
              <TableHead className="text-right">CGST</TableHead>
              <TableHead className="text-right">TDS Deducted</TableHead>
              <TableHead>Handled By</TableHead>
              <TableHead>Remark</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ledgerEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">
                  No entries found for the selected period
                </TableCell>
              </TableRow>
            ) : (
              <>
                {ledgerEntries.map((entry, idx) => (
                  <TableRow key={entry.id} className={entry.type === 'sales' ? 'bg-green-50/30' : 'bg-orange-50/30'}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-1">
                        {isReordering && (
                          <div className="flex flex-col">
                            <button
                              className="p-0.5 hover:bg-muted rounded disabled:opacity-30"
                              disabled={idx === 0}
                              onClick={() => moveRow(idx, 'up')}
                            >
                              <ChevronUp className="h-3 w-3" />
                            </button>
                            <button
                              className="p-0.5 hover:bg-muted rounded disabled:opacity-30"
                              disabled={idx === ledgerEntries.length - 1}
                              onClick={() => moveRow(idx, 'down')}
                            >
                              <ChevronDown className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                        {idx + 1}
                      </div>
                    </TableCell>
                    <TableCell>{format(new Date(entry.date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell className="font-mono text-xs">{displayInvoiceNo(entry.invoiceNo)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`inline-block w-2 h-2 rounded-full ${entry.type === 'sales' ? 'bg-green-500' : 'bg-orange-500'}`} />
                        {entry.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {entry.type === 'sales' ? (
                        entry.credit > 0 ? (
                          <span className="text-green-700">₹{fmt(entry.credit)}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">
                            {entry.status === 'overdue' ? 'Overdue' : 'Invoice Sent'}
                          </span>
                        )
                      ) : '--'}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {entry.type === 'purchase' ? (
                        entry.debit > 0 ? (
                          <span className="text-red-700">₹{fmt(entry.debit)}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Pending</span>
                        )
                      ) : '--'}
                    </TableCell>
                    <TableCell className="text-right">{entry.gst > 0 ? `₹${fmt(entry.gst)}` : '--'}</TableCell>
                    <TableCell className="text-right">{entry.sgst > 0 ? `₹${fmt(entry.sgst)}` : '--'}</TableCell>
                    <TableCell className="text-right">{entry.cgst > 0 ? `₹${fmt(entry.cgst)}` : '--'}</TableCell>
                    <TableCell className="text-right">{entry.tds > 0 ? `₹${fmt(entry.tds)}` : '--'}</TableCell>
                    <TableCell>{entry.handledBy || '--'}</TableCell>
                    <TableCell className="max-w-[150px] truncate">{entry.remark || '--'}</TableCell>
                  </TableRow>
                ))}
                {/* Totals row */}
                <TableRow className="bg-muted/50 font-bold border-t-2">
                  <TableCell colSpan={4} className="text-right">Totals</TableCell>
                  <TableCell className="text-right text-green-700">₹{fmt(totalCredit)}</TableCell>
                  <TableCell className="text-right text-red-700">₹{fmt(totalDebit)}</TableCell>
                  <TableCell className="text-right">₹{fmt(ledgerEntries.reduce((s, e) => s + e.gst, 0))}</TableCell>
                  <TableCell className="text-right">₹{fmt(ledgerEntries.reduce((s, e) => s + e.sgst, 0))}</TableCell>
                  <TableCell className="text-right">₹{fmt(ledgerEntries.reduce((s, e) => s + e.cgst, 0))}</TableCell>
                  <TableCell className="text-right">₹{fmt(ledgerEntries.reduce((s, e) => s + e.tds, 0))}</TableCell>
                  <TableCell colSpan={2}></TableCell>
                </TableRow>
              </>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
