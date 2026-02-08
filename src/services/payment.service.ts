import { supabase } from '@/integrations/supabase/client';
import type { Payment, CreatePaymentInput } from '@/types/payment';

// Fetch payments for an invoice
export async function fetchPaymentsForInvoice(invoiceId: string): Promise<Payment[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('invoice_id', invoiceId)
    .order('payment_date', { ascending: false });
  
  if (error) throw error;
  return data as Payment[];
}

// Fetch all payments with optional date range
export async function fetchPayments(startDate?: string, endDate?: string): Promise<Payment[]> {
  let query = supabase
    .from('payments')
    .select('*')
    .order('payment_date', { ascending: false });
  
  if (startDate) {
    query = query.gte('payment_date', startDate);
  }
  if (endDate) {
    query = query.lte('payment_date', endDate);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data as Payment[];
}

// Create a new payment
export async function createPayment(input: CreatePaymentInput): Promise<Payment> {
  const { data: userData } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('payments')
    .insert([{
      ...input,
      tds_deducted: input.tds_deducted ?? false,
      tds_amount: input.tds_amount ?? 0,
      created_by: userData?.user?.id,
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data as Payment;
}

// Delete a payment
export async function deletePayment(id: string): Promise<void> {
  const { error } = await supabase
    .from('payments')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// Get payment summary for a date range
export async function getPaymentSummary(startDate: string, endDate: string): Promise<{
  total_collected: number;
  total_tds: number;
  by_mode: Record<string, number>;
}> {
  const { data, error } = await supabase
    .from('payments')
    .select('amount, tds_amount, payment_mode')
    .gte('payment_date', startDate)
    .lte('payment_date', endDate);
  
  if (error) throw error;
  
  const payments = data as Payment[];
  const total_collected = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const total_tds = payments.reduce((sum, p) => sum + (p.tds_amount || 0), 0);
  
  const by_mode: Record<string, number> = {};
  payments.forEach(p => {
    by_mode[p.payment_mode] = (by_mode[p.payment_mode] || 0) + (p.amount || 0);
  });
  
  return { total_collected, total_tds, by_mode };
}
