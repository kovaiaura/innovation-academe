import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Users, Store } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InvoiceList } from '@/components/invoice/InvoiceList';
import { GlobalSummaryCards } from '@/components/invoice/GlobalSummaryCards';
import { PurchasesTab } from '@/components/invoice/PurchasesTab';
import { TopSheetTab } from '@/components/invoice/TopSheetTab';
import { InvoiceDateFilter, type DateRange } from '@/components/invoice/InvoiceDateFilter';
import { CreateInvoiceDialog } from '@/components/invoice/CreateInvoiceDialog';
import { CreatePurchaseInvoiceDialog } from '@/components/invoice/CreatePurchaseInvoiceDialog';
import { ViewInvoiceDialog } from '@/components/invoice/ViewInvoiceDialog';
import { RecordPaymentDialog } from '@/components/invoice/RecordPaymentDialog';
import { PaymentHistoryDialog } from '@/components/invoice/PaymentHistoryDialog';
import { InvoicePartiesManager } from '@/components/invoice/InvoicePartiesManager';
import { InvoiceVendorsManager } from '@/components/invoice/InvoiceVendorsManager';
import { useGlobalInvoiceSummary } from '@/hooks/useGlobalInvoiceSummary';
import { usePaymentsForInvoice } from '@/hooks/usePayments';
import { updateInvoiceStatus, deleteInvoice, updatePurchaseInvoice } from '@/services/invoice.service';
import type { Invoice, InvoiceStatus } from '@/types/invoice';
import type { CreatePaymentInput } from '@/types/payment';
import { toast } from 'sonner';

export default function InvoiceManagement() {
  const [dateRange, setDateRange] = useState<DateRange>({ from: null, to: null });
  const [activeTab, setActiveTab] = useState('sales');
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [recordPaymentDialogOpen, setRecordPaymentDialogOpen] = useState(false);
  const [paymentHistoryDialogOpen, setPaymentHistoryDialogOpen] = useState(false);
  const [partiesDialogOpen, setPartiesDialogOpen] = useState(false);
  const [vendorsDialogOpen, setVendorsDialogOpen] = useState(false);
  
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [editingPurchase, setEditingPurchase] = useState<Invoice | null>(null);

  const [selectedParty, setSelectedParty] = useState<string | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);

  const { allInvoices = [], allPayments = [], loading, refetch } = useGlobalInvoiceSummary();
  const { addPayment } = usePaymentsForInvoice(selectedInvoice?.id || null);

  // Filter sales invoices by date range
  const filteredInvoices = useMemo(() => {
    let invoices = allInvoices.filter(inv => 
      inv.invoice_type === 'sales' || inv.invoice_type === 'institution'
    );
    
    if (dateRange.from) {
      invoices = invoices.filter(inv => new Date(inv.invoice_date) >= dateRange.from!);
    }
    if (dateRange.to) {
      invoices = invoices.filter(inv => new Date(inv.invoice_date) <= dateRange.to!);
    }
    
    return invoices;
  }, [allInvoices, dateRange]);

  // Filter purchase invoices by date range
  const filteredPurchases = useMemo(() => {
    let purchases = allInvoices.filter(inv => inv.invoice_type === 'purchase');
    
    if (dateRange.from) {
      purchases = purchases.filter(inv => new Date(inv.invoice_date) >= dateRange.from!);
    }
    if (dateRange.to) {
      purchases = purchases.filter(inv => new Date(inv.invoice_date) <= dateRange.to!);
    }
    
    return purchases;
  }, [allInvoices, dateRange]);

  // Filter payments by date range
  const filteredPayments = useMemo(() => {
    let payments = allPayments || [];
    if (dateRange.from) {
      payments = payments.filter(p => new Date(p.payment_date) >= dateRange.from!);
    }
    if (dateRange.to) {
      payments = payments.filter(p => new Date(p.payment_date) <= dateRange.to!);
    }
    return payments;
  }, [allPayments, dateRange]);

  // Extract unique party names for sales filter
  const uniqueParties = useMemo(() => {
    const names = filteredInvoices
      .map(inv => inv.to_company_name)
      .filter((name): name is string => !!name);
    return [...new Set(names)].sort();
  }, [filteredInvoices]);

  // Extract unique vendor names for purchase filter
  const uniqueVendors = useMemo(() => {
    const names = filteredPurchases
      .map(inv => inv.from_company_name || inv.to_company_name)
      .filter((name): name is string => !!name);
    return [...new Set(names)].sort();
  }, [filteredPurchases]);

  // Apply party filter to sales
  const displayInvoices = useMemo(() => {
    if (!selectedParty) return filteredInvoices;
    return filteredInvoices.filter(inv => inv.to_company_name === selectedParty);
  }, [filteredInvoices, selectedParty]);

  // Apply vendor filter to purchases
  const displayPurchases = useMemo(() => {
    if (!selectedVendor) return filteredPurchases;
    return filteredPurchases.filter(inv => (inv.from_company_name || inv.to_company_name) === selectedVendor);
  }, [filteredPurchases, selectedVendor]);

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
            <p className="text-muted-foreground">Create, manage and track invoices & purchases</p>
          </div>
          <div className="flex gap-2">
            {activeTab === 'sales' && (
              <>
                <Button variant="outline" onClick={() => setPartiesDialogOpen(true)}>
                  <Users className="h-4 w-4 mr-2" /> Parties
                </Button>
                <Button onClick={() => { setEditingInvoice(null); setCreateDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" /> Create Invoice
                </Button>
              </>
            )}
            {activeTab === 'purchases' && (
              <>
                <Button variant="outline" onClick={() => setVendorsDialogOpen(true)}>
                  <Store className="h-4 w-4 mr-2" /> Vendors
                </Button>
                <Button onClick={() => { setEditingPurchase(null); setPurchaseDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" /> Add Purchase
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <InvoiceDateFilter dateRange={dateRange} onDateRangeChange={setDateRange} />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="purchases">Purchases</TabsTrigger>
            <TabsTrigger value="topsheet">Top Sheet</TabsTrigger>
          </TabsList>

          <TabsContent value="sales" className="space-y-6">
            <GlobalSummaryCards invoices={filteredInvoices} payments={filteredPayments} loading={loading} />
            
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <p className="text-sm text-muted-foreground">{displayInvoices.length} invoices</p>
                {uniqueParties.length > 0 && (
                  <Select
                    value={selectedParty || 'all'}
                    onValueChange={(val) => setSelectedParty(val === 'all' ? null : val)}
                  >
                    <SelectTrigger className="w-[200px] h-8 text-sm">
                      <SelectValue placeholder="All Parties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Parties</SelectItem>
                      {uniqueParties.map(name => (
                        <SelectItem key={name} value={name}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <InvoiceList
              invoices={displayInvoices}
              loading={loading}
              onView={handleView}
              onDownload={handleDownload}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onRecordPayment={handleRecordPayment}
              onViewPayments={handleViewPayments}
              onEdit={handleEdit}
            />
          </TabsContent>

          <TabsContent value="purchases" className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <p className="text-sm text-muted-foreground">{displayPurchases.length} purchases</p>
              {uniqueVendors.length > 0 && (
                <Select
                  value={selectedVendor || 'all'}
                  onValueChange={(val) => setSelectedVendor(val === 'all' ? null : val)}
                >
                  <SelectTrigger className="w-[200px] h-8 text-sm">
                    <SelectValue placeholder="All Vendors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Vendors</SelectItem>
                    {uniqueVendors.map(name => (
                      <SelectItem key={name} value={name}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <PurchasesTab
              purchases={displayPurchases}
              loading={loading}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
              onEdit={(purchase) => {
                setEditingPurchase(purchase);
                setPurchaseDialogOpen(true);
              }}
            />
          </TabsContent>

          <TabsContent value="topsheet" className="space-y-6">
            <TopSheetTab
              salesInvoices={filteredInvoices}
              purchaseInvoices={filteredPurchases}
              payments={filteredPayments}
              loading={loading}
            />
          </TabsContent>
        </Tabs>

        <CreateInvoiceDialog
          open={createDialogOpen}
          onOpenChange={handleCreateDialogClose}
          onSuccess={refetch}
          editInvoice={editingInvoice}
        />

        <CreatePurchaseInvoiceDialog
          open={purchaseDialogOpen}
          onOpenChange={(open) => {
            setPurchaseDialogOpen(open);
            if (!open) setEditingPurchase(null);
          }}
          onSuccess={refetch}
          editPurchase={editingPurchase}
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

        <InvoicePartiesManager
          open={partiesDialogOpen}
          onOpenChange={setPartiesDialogOpen}
        />

        <InvoiceVendorsManager
          open={vendorsDialogOpen}
          onOpenChange={setVendorsDialogOpen}
        />
      </div>
    </Layout>
  );
}
