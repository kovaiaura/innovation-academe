import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchInvoices } from '@/services/invoice.service';
import type { Invoice, InvoiceFilters } from '@/types/invoice';
import { toast } from 'sonner';

export function useInvoices(filters?: InvoiceFilters) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchInvoices(filters);
      setInvoices(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError(err as Error);
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('invoices-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invoices',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newInvoice = payload.new as Invoice;
            // Only add if it matches current filters
            if (!filters?.invoice_type || newInvoice.invoice_type === filters.invoice_type) {
              setInvoices((prev) => [{ ...newInvoice, line_items: [] }, ...prev]);
              toast.success('New invoice created');
            }
          } else if (payload.eventType === 'UPDATE') {
            setInvoices((prev) =>
              prev.map((inv) =>
                inv.id === payload.new.id ? { ...inv, ...payload.new } : inv
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setInvoices((prev) => prev.filter((inv) => inv.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filters?.invoice_type]);

  return { invoices, loading, error, refetch: loadInvoices };
}
