import { useState, useEffect, useCallback } from 'react';
import { fetchPaymentsForInvoice, fetchPayments, createPayment, updatePayment, deletePayment } from '@/services/payment.service';
import type { Payment, CreatePaymentInput } from '@/types/payment';
import { toast } from 'sonner';

export function usePaymentsForInvoice(invoiceId: string | null) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadPayments = useCallback(async () => {
    if (!invoiceId) {
      setPayments([]);
      return;
    }
    
    try {
      setLoading(true);
      const data = await fetchPaymentsForInvoice(invoiceId);
      setPayments(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const addPayment = async (input: CreatePaymentInput) => {
    try {
      await createPayment(input);
      toast.success('Payment recorded successfully');
      await loadPayments();
    } catch (err) {
      console.error('Error creating payment:', err);
      toast.error('Failed to record payment');
      throw err;
    }
  };

  const editPayment = async (id: string, input: Partial<CreatePaymentInput>) => {
    try {
      await updatePayment(id, input);
      toast.success('Payment updated successfully');
      await loadPayments();
    } catch (err) {
      console.error('Error updating payment:', err);
      toast.error('Failed to update payment');
      throw err;
    }
  };

  const removePayment = async (id: string) => {
    try {
      await deletePayment(id);
      toast.success('Payment deleted');
      await loadPayments();
    } catch (err) {
      console.error('Error deleting payment:', err);
      toast.error('Failed to delete payment');
      throw err;
    }
  };

  return { payments, loading, error, refetch: loadPayments, addPayment, editPayment, removePayment };
}

export function useAllPayments(startDate?: string, endDate?: string) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadPayments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchPayments(startDate, endDate);
      setPayments(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  return { payments, loading, error, refetch: loadPayments };
}
