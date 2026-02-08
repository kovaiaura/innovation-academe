import { useState, useEffect, useCallback, useMemo } from 'react';
import { useInvoices } from './useInvoices';
import { useAllPayments } from './usePayments';
import { 
  calculateInvoiceSummary, 
  calculateAgingBuckets,
  generateMonthlyReport,
  type InvoiceSummary,
  type AgingBucket,
  type MonthlyReport,
} from '@/services/invoice-export.service';
import type { InvoiceType } from '@/types/invoice';
import { startOfMonth, endOfMonth, format } from 'date-fns';

export function useInvoiceSummary(
  invoiceType: InvoiceType,
  selectedMonth?: Date
) {
  const monthStart = selectedMonth 
    ? format(startOfMonth(selectedMonth), 'yyyy-MM-dd')
    : undefined;
  const monthEnd = selectedMonth 
    ? format(endOfMonth(selectedMonth), 'yyyy-MM-dd')
    : undefined;

  const { invoices, loading: invoicesLoading, refetch: refetchInvoices } = useInvoices({
    invoice_type: invoiceType,
    start_date: monthStart,
    end_date: monthEnd,
  });

  const { payments, loading: paymentsLoading, refetch: refetchPayments } = useAllPayments(
    monthStart,
    monthEnd
  );

  const summary = useMemo<InvoiceSummary>(() => {
    return calculateInvoiceSummary(invoices, payments);
  }, [invoices, payments]);

  const agingBuckets = useMemo<AgingBucket[]>(() => {
    return calculateAgingBuckets(invoices);
  }, [invoices]);

  const monthlyReport = useMemo<MonthlyReport | null>(() => {
    if (!selectedMonth) return null;
    return generateMonthlyReport(
      invoices,
      payments,
      selectedMonth.getFullYear(),
      selectedMonth.getMonth() + 1
    );
  }, [invoices, payments, selectedMonth]);

  const refetch = useCallback(async () => {
    await Promise.all([refetchInvoices(), refetchPayments()]);
  }, [refetchInvoices, refetchPayments]);

  return {
    invoices,
    payments,
    summary,
    agingBuckets,
    monthlyReport,
    loading: invoicesLoading || paymentsLoading,
    refetch,
  };
}

// Hook for getting all invoices summary (without date filter)
export function useAllInvoicesSummary(invoiceType: InvoiceType) {
  const { invoices, loading: invoicesLoading, refetch: refetchInvoices } = useInvoices({
    invoice_type: invoiceType,
  });

  const { payments, loading: paymentsLoading, refetch: refetchPayments } = useAllPayments();

  const summary = useMemo<InvoiceSummary>(() => {
    return calculateInvoiceSummary(invoices, payments);
  }, [invoices, payments]);

  const agingBuckets = useMemo<AgingBucket[]>(() => {
    return calculateAgingBuckets(invoices);
  }, [invoices]);

  const refetch = useCallback(async () => {
    await Promise.all([refetchInvoices(), refetchPayments()]);
  }, [refetchInvoices, refetchPayments]);

  return {
    invoices,
    payments,
    summary,
    agingBuckets,
    loading: invoicesLoading || paymentsLoading,
    refetch,
  };
}
