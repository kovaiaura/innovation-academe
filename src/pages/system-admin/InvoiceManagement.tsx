import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Download, Users } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { InvoiceList } from '@/components/invoice/InvoiceList';
import { GlobalSummaryCards } from '@/components/invoice/GlobalSummaryCards';
import { InvoiceMonthFilter } from '@/components/invoice/InvoiceMonthFilter';
import { CreateInvoiceDialog } from '@/components/invoice/CreateInvoiceDialog';
import { ViewInvoiceDialog } from '@/components/invoice/ViewInvoiceDialog';
import { RecordPaymentDialog } from '@/components/invoice/RecordPaymentDialog';
import { PaymentHistoryDialog } from '@/components/invoice/PaymentHistoryDialog';
import { InvoiceExportDialog } from '@/components/invoice/InvoiceExportDialog';
import { InvoicePartiesManager } from '@/components/invoice/InvoicePartiesManager';
import { useGlobalInvoiceSummary } from '@/hooks/useGlobalInvoiceSummary';
import { usePaymentsForInvoice } from '@/hooks/usePayments';
import { updateInvoiceStatus, deleteInvoice } from '@/services/invoice.service';
import type { Invoice, InvoiceStatus } from '@/types/invoice';
import type { CreatePaymentInput } from '@/types/payment';
import { toast } from 'sonner';

export default function InvoiceManagement() {
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(null);
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [recordPaymentDialogOpen, setRecordPaymentDialogOpen] = useState(false);
  const [paymentHistoryDialogOpen, setPaymentHistoryDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [partiesDialogOpen, setPartiesDialogOpen] = useState(false);
  
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  const { summary, allInvoices, loading, refetch } = useGlobalInvoiceSummary();
  const { addPayment } = usePaymentsForInvoice(selectedInvoice?.id || null);

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    let invoices = allInvoices.filter(inv => 
      inv.invoice_type === 'sales' || inv.invoice_type === 'institution'
    );
    
    if (selectedMonth) {
      invoices = invoices.filter(inv => {
        const invDate = new Date(inv.invoice_date);
        return invDate.getMonth() === selectedMonth.getMonth() && invDate.getFullYear() === selectedMonth.getFullYear();
      });
    }
    
    return invoices;
  }, [allInvoices, selectedMonth]);

  const handleView = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setViewDialogOpen(true);
  };

  const handleDownload = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setViewDialogOpen(true);
  };

  const handleStatusChange = async (id: string, status: InvoiceStatus) => {
    try {
      await updateInvoiceStatus(id, status, status === 'paid' ? new Date().toISOString().split('T')[0] : undefined);
      toast.success(`Invoice marked as ${status}`);
      refetch();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteInvoice(id);
      toast.success('Invoice deleted successfully');
      refetch();
    } catch {
      toast.error('Failed to delete invoice');
    }
  };

  const handleRecordPayment = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setRecordPaymentDialogOpen(true);
  };

  const handleViewPayments = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentHistoryDialogOpen(true);
  };

  const handlePaymentSubmit = async (data: CreatePaymentInput) => {
    await addPayment(data);
    refetch();
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setCreateDialogOpen(true);
  };

  const handleCreateDialogClose = (open: boolean) => {
    setCreateDialogOpen(open);
    if (!open) {
      setEditingInvoice(null);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold">Invoice Management</h1>
            <p className="text-muted-foreground">Create, manage and track invoices</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setPartiesDialogOpen(true)}>
              <Users className="h-4 w-4 mr-2" /> Parties
            </Button>
            <Button variant="outline" onClick={() => setExportDialogOpen(true)}>
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
            <Button onClick={() => { setEditingInvoice(null); setCreateDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" /> Create Invoice
            </Button>
          </div>
        </div>

        <GlobalSummaryCards summary={summary} loading={loading} />

        <div className="flex items-center justify-between flex-wrap gap-4">
          <InvoiceMonthFilter selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} />
          {selectedMonth && (
            <p className="text-sm text-muted-foreground">{filteredInvoices.length} invoices in selected period</p>
          )}
        </div>

        <InvoiceList
          invoices={filteredInvoices}
          loading={loading}
          onView={handleView}
          onDownload={handleDownload}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          onRecordPayment={handleRecordPayment}
          onViewPayments={handleViewPayments}
          onEdit={handleEdit}
        />

        <CreateInvoiceDialog
          open={createDialogOpen}
          onOpenChange={handleCreateDialogClose}
          onSuccess={refetch}
          editInvoice={editingInvoice}
        />

        <ViewInvoiceDialog
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          invoice={selectedInvoice}
          onDownload={handleDownload}
        />

        <RecordPaymentDialog
          open={recordPaymentDialogOpen}
          onOpenChange={setRecordPaymentDialogOpen}
          invoice={selectedInvoice}
          onSubmit={handlePaymentSubmit}
        />

        <PaymentHistoryDialog
          open={paymentHistoryDialogOpen}
          onOpenChange={setPaymentHistoryDialogOpen}
          invoice={selectedInvoice}
        />

        <InvoiceExportDialog
          open={exportDialogOpen}
          onOpenChange={setExportDialogOpen}
          invoices={filteredInvoices}
          invoiceType="sales"
        />

        <InvoicePartiesManager
          open={partiesDialogOpen}
          onOpenChange={setPartiesDialogOpen}
        />
      </div>
    </Layout>
  );
}
