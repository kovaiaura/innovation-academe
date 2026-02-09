import { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, ShoppingCart, Package, Download } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { InvoiceList } from '@/components/invoice/InvoiceList';
import { PurchaseInvoiceList } from '@/components/invoice/PurchaseInvoiceList';
import { GlobalSummaryCards } from '@/components/invoice/GlobalSummaryCards';
import { InvoiceMonthFilter } from '@/components/invoice/InvoiceMonthFilter';
import { InvoiceReportSection } from '@/components/invoice/InvoiceReportSection';
import { CreateInvoiceDialog } from '@/components/invoice/CreateInvoiceDialog';
import { CreatePurchaseInvoiceDialog } from '@/components/invoice/CreatePurchaseInvoiceDialog';
import { ViewInvoiceDialog } from '@/components/invoice/ViewInvoiceDialog';
import { ViewPurchaseInvoiceDialog } from '@/components/invoice/ViewPurchaseInvoiceDialog';
import { RecordPaymentDialog } from '@/components/invoice/RecordPaymentDialog';
import { RecordPurchasePaymentDialog } from '@/components/invoice/RecordPurchasePaymentDialog';
import { PaymentHistoryDialog } from '@/components/invoice/PaymentHistoryDialog';
import { InvoiceExportDialog } from '@/components/invoice/InvoiceExportDialog';
import { CreateCreditNoteDialog } from '@/components/invoice/CreateCreditNoteDialog';
import { CreateDebitNoteDialog } from '@/components/invoice/CreateDebitNoteDialog';
import { TDSCertificateUpload } from '@/components/invoice/TDSCertificateUpload';
import { InvoiceAuditLog } from '@/components/invoice/InvoiceAuditLog';
import { useGlobalInvoiceSummary } from '@/hooks/useGlobalInvoiceSummary';
import { usePaymentsForInvoice } from '@/hooks/usePayments';
import { updateInvoiceStatus, deleteInvoice } from '@/services/invoice.service';
import { supabase } from '@/integrations/supabase/client';
import type { Invoice, InvoiceStatus } from '@/types/invoice';
import type { CreatePaymentInput } from '@/types/payment';
import { toast } from 'sonner';

type BillingTab = 'sales' | 'purchase';

export default function InvoiceManagement() {
  const [activeTab, setActiveTab] = useState<BillingTab>('sales');
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(null);
  
  // Dialogs state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createPurchaseDialogOpen, setCreatePurchaseDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewPurchaseDialogOpen, setViewPurchaseDialogOpen] = useState(false);
  const [recordPaymentDialogOpen, setRecordPaymentDialogOpen] = useState(false);
  const [recordPurchasePaymentDialogOpen, setRecordPurchasePaymentDialogOpen] = useState(false);
  const [paymentHistoryDialogOpen, setPaymentHistoryDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [creditNoteDialogOpen, setCreditNoteDialogOpen] = useState(false);
  const [debitNoteDialogOpen, setDebitNoteDialogOpen] = useState(false);
  const [tdsUploadDialogOpen, setTdsUploadDialogOpen] = useState(false);
  const [auditLogDialogOpen, setAuditLogDialogOpen] = useState(false);
  
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [institutions, setInstitutions] = useState<{ id: string; name: string }[]>([]);

  const { summary, allInvoices, allPayments, getAgingBuckets, loading, refetch } = useGlobalInvoiceSummary();
  
  // Payment hook for selected invoice
  const { addPayment } = usePaymentsForInvoice(selectedInvoice?.id || null);

  useEffect(() => {
    loadInstitutions();
  }, []);

  const loadInstitutions = async () => {
    const { data } = await supabase
      .from('institutions')
      .select('id, name')
      .order('name');
    if (data) setInstitutions(data);
  };

  // Filter invoices by type and selected month
  const filteredInvoices = useMemo(() => {
    let invoices = allInvoices;
    
    // Filter by type - Sales tab includes both sales and institution
    if (activeTab === 'sales') {
      invoices = invoices.filter(inv => 
        inv.invoice_type === 'sales' || inv.invoice_type === 'institution'
      );
    } else {
      invoices = invoices.filter(inv => inv.invoice_type === 'purchase');
    }
    
    // Filter by month
    if (selectedMonth) {
      invoices = invoices.filter(inv => {
        const invDate = new Date(inv.invoice_date);
        return (
          invDate.getMonth() === selectedMonth.getMonth() &&
          invDate.getFullYear() === selectedMonth.getFullYear()
        );
      });
    }
    
    return invoices;
  }, [allInvoices, activeTab, selectedMonth]);

  // Get payments for current tab's invoices
  const filteredPayments = useMemo(() => {
    const invoiceIds = new Set(filteredInvoices.map(inv => inv.id));
    return allPayments.filter(p => invoiceIds.has(p.invoice_id));
  }, [filteredInvoices, allPayments]);

  const handleView = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    if (invoice.invoice_type === 'purchase') {
      setViewPurchaseDialogOpen(true);
    } else {
      setViewDialogOpen(true);
    }
  };

  const handleDownload = (invoice: Invoice) => {
    if (invoice.invoice_type === 'purchase' && invoice.attachment_url) {
      const link = document.createElement('a');
      link.href = invoice.attachment_url;
      link.download = invoice.attachment_name || 'vendor-bill';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      setSelectedInvoice(invoice);
      setViewDialogOpen(true);
    }
  };

  const handleCreateClick = () => {
    if (activeTab === 'purchase') {
      setCreatePurchaseDialogOpen(true);
    } else {
      setCreateDialogOpen(true);
    }
  };

  const handleStatusChange = async (id: string, status: InvoiceStatus) => {
    try {
      await updateInvoiceStatus(id, status, status === 'paid' ? new Date().toISOString().split('T')[0] : undefined);
      toast.success(`Invoice marked as ${status}`);
      refetch();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteInvoice(id);
      toast.success('Invoice deleted successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to delete invoice');
    }
  };

  const handleRecordPayment = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    if (invoice.invoice_type === 'purchase') {
      setRecordPurchasePaymentDialogOpen(true);
    } else {
      setRecordPaymentDialogOpen(true);
    }
  };

  const handleViewPayments = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentHistoryDialogOpen(true);
  };

  const handlePaymentSubmit = async (data: CreatePaymentInput) => {
    await addPayment(data);
    refetch();
  };

  const handleIssueCreditNote = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setCreditNoteDialogOpen(true);
  };

  const handleIssueDebitNote = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDebitNoteDialogOpen(true);
  };

  const handleUploadTDS = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setTdsUploadDialogOpen(true);
  };

  const handleViewAuditLog = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setAuditLogDialogOpen(true);
  };

  const getTabLabel = (type: BillingTab) => {
    switch (type) {
      case 'sales':
        return 'Sales Billing';
      case 'purchase':
        return 'Purchase Billing';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold">Invoice Management</h1>
            <p className="text-muted-foreground">
              Create, manage and track invoices with payments
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setExportDialogOpen(true)}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={handleCreateClick}>
              <Plus className="h-4 w-4 mr-2" />
              {activeTab === 'purchase' ? 'Record Purchase' : 'Create Invoice'}
            </Button>
          </div>
        </div>

        {/* Global Summary Cards */}
        <GlobalSummaryCards summary={summary} loading={loading} />

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as BillingTab)}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="sales" className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">{getTabLabel('sales')}</span>
            </TabsTrigger>
            <TabsTrigger value="purchase" className="gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">{getTabLabel('purchase')}</span>
            </TabsTrigger>
          </TabsList>

          {/* Sales Tab (includes Institution invoices) */}
          <TabsContent value="sales" className="mt-6 space-y-6">
            {/* Month Filter */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <InvoiceMonthFilter
                selectedMonth={selectedMonth}
                onMonthChange={setSelectedMonth}
              />
              {selectedMonth && (
                <p className="text-sm text-muted-foreground">
                  {filteredInvoices.length} invoices in selected period
                </p>
              )}
            </div>

            {/* Invoice List */}
            <InvoiceList
              invoices={filteredInvoices}
              loading={loading}
              onView={handleView}
              onDownload={handleDownload}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onRecordPayment={handleRecordPayment}
              onViewPayments={handleViewPayments}
              onIssueCreditNote={handleIssueCreditNote}
              onIssueDebitNote={handleIssueDebitNote}
              onUploadTDS={handleUploadTDS}
              onViewAuditLog={handleViewAuditLog}
            />

            {/* Report Section */}
            <InvoiceReportSection
              invoices={filteredInvoices}
              payments={filteredPayments}
              invoiceType="sales"
              agingBuckets={getAgingBuckets('sales')}
            />
          </TabsContent>

          {/* Purchase Tab */}
          <TabsContent value="purchase" className="mt-6 space-y-6">
            {/* Month Filter */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <InvoiceMonthFilter
                selectedMonth={selectedMonth}
                onMonthChange={setSelectedMonth}
              />
              {selectedMonth && (
                <p className="text-sm text-muted-foreground">
                  {filteredInvoices.length} purchase bills in selected period
                </p>
              )}
            </div>

            {/* Purchase Invoice List */}
            <PurchaseInvoiceList
              invoices={filteredInvoices}
              loading={loading}
              onView={handleView}
              onDelete={handleDelete}
              onRecordPayment={handleRecordPayment}
              onViewPayments={handleViewPayments}
              onViewAuditLog={handleViewAuditLog}
            />

            {/* Report Section */}
            <InvoiceReportSection
              invoices={filteredInvoices}
              payments={filteredPayments}
              invoiceType="purchase"
              agingBuckets={getAgingBuckets('purchase')}
            />
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <CreateInvoiceDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          invoiceType={activeTab === 'sales' ? 'sales' : 'purchase'}
          onSuccess={refetch}
          institutions={institutions}
        />

        <CreatePurchaseInvoiceDialog
          open={createPurchaseDialogOpen}
          onOpenChange={setCreatePurchaseDialogOpen}
          onSuccess={refetch}
        />

        <ViewInvoiceDialog
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          invoice={selectedInvoice}
          onDownload={handleDownload}
        />

        <ViewPurchaseInvoiceDialog
          open={viewPurchaseDialogOpen}
          onOpenChange={setViewPurchaseDialogOpen}
          invoice={selectedInvoice}
        />

        <RecordPaymentDialog
          open={recordPaymentDialogOpen}
          onOpenChange={setRecordPaymentDialogOpen}
          invoice={selectedInvoice}
          onSubmit={handlePaymentSubmit}
        />

        <RecordPurchasePaymentDialog
          open={recordPurchasePaymentDialogOpen}
          onOpenChange={setRecordPurchasePaymentDialogOpen}
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
          invoiceType={activeTab === 'sales' ? 'sales' : 'purchase'}
        />

        <CreateCreditNoteDialog
          open={creditNoteDialogOpen}
          onOpenChange={setCreditNoteDialogOpen}
          invoice={selectedInvoice}
          onSuccess={refetch}
        />

        <CreateDebitNoteDialog
          open={debitNoteDialogOpen}
          onOpenChange={setDebitNoteDialogOpen}
          invoice={selectedInvoice}
          onSuccess={refetch}
        />

        {selectedInvoice && (
          <>
            <TDSCertificateUpload
              open={tdsUploadDialogOpen}
              onOpenChange={setTdsUploadDialogOpen}
              invoiceId={selectedInvoice.id}
              existingCertificate={{
                certificate_number: selectedInvoice.tds_certificate_number,
                quarter: selectedInvoice.tds_quarter,
              }}
              onSuccess={refetch}
            />

            <InvoiceAuditLog
              open={auditLogDialogOpen}
              onOpenChange={setAuditLogDialogOpen}
              invoiceId={selectedInvoice.id}
              invoiceNumber={selectedInvoice.invoice_number}
            />
          </>
        )}
      </div>
    </Layout>
  );
}
