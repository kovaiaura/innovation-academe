import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Building2, ShoppingCart, Package, Download, BarChart3 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { InvoiceList } from '@/components/invoice/InvoiceList';
import { InvoiceSummaryCards } from '@/components/invoice/InvoiceSummaryCards';
import { InvoiceMonthFilter } from '@/components/invoice/InvoiceMonthFilter';
import { AgingReportChart } from '@/components/invoice/AgingReportChart';
import { CreateInvoiceDialog } from '@/components/invoice/CreateInvoiceDialog';
import { CreatePurchaseInvoiceDialog } from '@/components/invoice/CreatePurchaseInvoiceDialog';
import { ViewInvoiceDialog } from '@/components/invoice/ViewInvoiceDialog';
import { ViewPurchaseInvoiceDialog } from '@/components/invoice/ViewPurchaseInvoiceDialog';
import { RecordPaymentDialog } from '@/components/invoice/RecordPaymentDialog';
import { PaymentHistoryDialog } from '@/components/invoice/PaymentHistoryDialog';
import { InvoiceExportDialog } from '@/components/invoice/InvoiceExportDialog';
import { useAllInvoicesSummary } from '@/hooks/useInvoiceSummary';
import { usePaymentsForInvoice } from '@/hooks/usePayments';
import { updateInvoiceStatus, deleteInvoice } from '@/services/invoice.service';
import { supabase } from '@/integrations/supabase/client';
import type { Invoice, InvoiceType, InvoiceStatus } from '@/types/invoice';
import type { CreatePaymentInput } from '@/types/payment';
import { toast } from 'sonner';

export default function InvoiceManagement() {
  const [activeTab, setActiveTab] = useState<InvoiceType>('institution');
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(null);
  const [showAgingChart, setShowAgingChart] = useState(false);
  
  // Dialogs state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createPurchaseDialogOpen, setCreatePurchaseDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewPurchaseDialogOpen, setViewPurchaseDialogOpen] = useState(false);
  const [recordPaymentDialogOpen, setRecordPaymentDialogOpen] = useState(false);
  const [paymentHistoryDialogOpen, setPaymentHistoryDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [institutions, setInstitutions] = useState<{ id: string; name: string }[]>([]);

  const { invoices, summary, agingBuckets, loading, refetch } = useAllInvoicesSummary(activeTab);
  
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

  // Filter invoices by selected month
  const filteredInvoices = selectedMonth
    ? invoices.filter(inv => {
        const invDate = new Date(inv.invoice_date);
        return (
          invDate.getMonth() === selectedMonth.getMonth() &&
          invDate.getFullYear() === selectedMonth.getFullYear()
        );
      })
    : invoices;

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
      toast.success('Invoice deleted');
      refetch();
    } catch (error) {
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

  const getTabIcon = (type: InvoiceType) => {
    switch (type) {
      case 'institution':
        return <Building2 className="h-4 w-4" />;
      case 'sales':
        return <ShoppingCart className="h-4 w-4" />;
      case 'purchase':
        return <Package className="h-4 w-4" />;
    }
  };

  const getTabLabel = (type: InvoiceType) => {
    switch (type) {
      case 'institution':
        return 'Institution Billing';
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
            <Button variant="outline" onClick={() => setShowAgingChart(!showAgingChart)}>
              <BarChart3 className="h-4 w-4 mr-2" />
              {showAgingChart ? 'Hide' : 'Show'} Aging
            </Button>
            <Button onClick={handleCreateClick}>
              <Plus className="h-4 w-4 mr-2" />
              {activeTab === 'purchase' ? 'Record Purchase' : 'Create Invoice'}
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as InvoiceType)}>
          <TabsList className="grid w-full max-w-lg grid-cols-3">
            {(['institution', 'sales', 'purchase'] as InvoiceType[]).map((type) => (
              <TabsTrigger key={type} value={type} className="gap-2">
                {getTabIcon(type)}
                <span className="hidden sm:inline">{getTabLabel(type)}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {(['institution', 'sales', 'purchase'] as InvoiceType[]).map((type) => (
            <TabsContent key={type} value={type} className="mt-6 space-y-6">
              {/* Summary Cards */}
              <InvoiceSummaryCards summary={summary} loading={loading} />

              {/* Aging Chart */}
              {showAgingChart && (
                <AgingReportChart buckets={agingBuckets} loading={loading} />
              )}

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
              />
            </TabsContent>
          ))}
        </Tabs>

        {/* Dialogs */}
        <CreateInvoiceDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          invoiceType={activeTab}
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

        <PaymentHistoryDialog
          open={paymentHistoryDialogOpen}
          onOpenChange={setPaymentHistoryDialogOpen}
          invoice={selectedInvoice}
        />

        <InvoiceExportDialog
          open={exportDialogOpen}
          onOpenChange={setExportDialogOpen}
          invoices={filteredInvoices}
          invoiceType={activeTab}
        />
      </div>
    </Layout>
  );
}
