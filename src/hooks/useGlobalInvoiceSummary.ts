import { useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { differenceInDays } from 'date-fns';
import type { Invoice } from '@/types/invoice';
import type { Payment } from '@/types/payment';

export interface GlobalInvoiceSummary {
  sales_total: number;
  purchase_total: number;
  payments_made: number;
  payments_received: number;
  tds_we_deducted: number;
  tds_client_deducted: number;
  sales_count: number;
  purchase_count: number;
}

export interface AgingBucket {
  label: string;
  min_days: number;
  max_days: number | null;
  amount: number;
  count: number;
  invoices: Invoice[];
}

export function useGlobalInvoiceSummary() {
  // Fetch all invoices (both sales+institution and purchase)
  const { data: allInvoices = [], isLoading: invoicesLoading, refetch: refetchInvoices } = useQuery({
    queryKey: ['global-invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Invoice[];
    },
  });

  // Fetch all payments
  const { data: allPayments = [], isLoading: paymentsLoading, refetch: refetchPayments } = useQuery({
    queryKey: ['global-payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('payment_date', { ascending: false });
      
      if (error) throw error;
      return data as Payment[];
    },
  });

  // Calculate global summary across all invoice types
  const summary = useMemo<GlobalInvoiceSummary>(() => {
    // Split invoices by type
    const salesInvoices = allInvoices.filter(
      inv => inv.invoice_type === 'sales' || inv.invoice_type === 'institution'
    );
    const purchaseInvoices = allInvoices.filter(
      inv => inv.invoice_type === 'purchase'
    );

    // Get invoice IDs for filtering payments
    const salesInvoiceIds = new Set(salesInvoices.map(inv => inv.id));
    const purchaseInvoiceIds = new Set(purchaseInvoices.map(inv => inv.id));

    // Split payments by invoice type
    const salesPayments = allPayments.filter(p => salesInvoiceIds.has(p.invoice_id));
    const purchasePayments = allPayments.filter(p => purchaseInvoiceIds.has(p.invoice_id));

    // Calculate totals
    const sales_total = salesInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
    const purchase_total = purchaseInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
    
    // Payments received (from sales/institution invoices)
    const payments_received = salesPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    
    // Payments made (for purchase invoices)
    const payments_made = purchasePayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    
    // TDS we deducted (from purchase payments where is_self_deducted_tds = true)
    const tds_we_deducted = purchasePayments
      .filter(p => p.is_self_deducted_tds)
      .reduce((sum, p) => sum + (p.tds_amount || 0), 0);
    
    // TDS client deducted (from sales/institution invoices where tds_deducted_by = 'client')
    const tds_client_deducted = salesInvoices
      .filter(inv => inv.tds_deducted_by === 'client')
      .reduce((sum, inv) => sum + (inv.tds_amount || 0), 0);

    return {
      sales_total,
      purchase_total,
      payments_made,
      payments_received,
      tds_we_deducted,
      tds_client_deducted,
      sales_count: salesInvoices.length,
      purchase_count: purchaseInvoices.length,
    };
  }, [allInvoices, allPayments]);

  // Calculate aging buckets for a specific invoice type
  const getAgingBuckets = useCallback((invoiceType: 'sales' | 'purchase'): AgingBucket[] => {
    const today = new Date();
    const relevantInvoices = allInvoices.filter(inv => {
      if (invoiceType === 'sales') {
        return (inv.invoice_type === 'sales' || inv.invoice_type === 'institution') &&
               inv.status !== 'paid' && 
               inv.status !== 'cancelled' && 
               inv.due_date;
      }
      return inv.invoice_type === 'purchase' &&
             inv.status !== 'paid' && 
             inv.status !== 'cancelled' && 
             inv.due_date;
    });

    const buckets: AgingBucket[] = [
      { label: 'Current', min_days: -9999, max_days: 0, amount: 0, count: 0, invoices: [] },
      { label: '1-30 Days', min_days: 1, max_days: 30, amount: 0, count: 0, invoices: [] },
      { label: '31-60 Days', min_days: 31, max_days: 60, amount: 0, count: 0, invoices: [] },
      { label: '61-90 Days', min_days: 61, max_days: 90, amount: 0, count: 0, invoices: [] },
      { label: '90+ Days', min_days: 91, max_days: null, amount: 0, count: 0, invoices: [] },
    ];

    relevantInvoices.forEach(inv => {
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
  }, [allInvoices]);

  const refetch = useCallback(async () => {
    await Promise.all([refetchInvoices(), refetchPayments()]);
  }, [refetchInvoices, refetchPayments]);

  return {
    summary,
    allInvoices,
    allPayments,
    getAgingBuckets,
    loading: invoicesLoading || paymentsLoading,
    refetch,
  };
}
