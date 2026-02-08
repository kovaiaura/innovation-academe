import { supabase } from '@/integrations/supabase/client';
import type { CreditDebitNote, CreateNoteInput, NoteType, NoteStatus, NoteLineItem } from '@/types/credit-debit-note';
import { fetchDefaultCompanyProfile } from './invoice.service';

// Helper to safely parse line items from JSON
function parseLineItems(lineItems: unknown): NoteLineItem[] {
  if (!lineItems) return [];
  if (!Array.isArray(lineItems)) return [];
  return lineItems.map(item => ({
    id: (item as Record<string, unknown>).id as string | undefined,
    description: String((item as Record<string, unknown>).description || ''),
    hsn_sac_code: (item as Record<string, unknown>).hsn_sac_code as string | undefined,
    quantity: Number((item as Record<string, unknown>).quantity) || 0,
    rate: Number((item as Record<string, unknown>).rate) || 0,
    amount: Number((item as Record<string, unknown>).amount) || 0,
  }));
}

// Helper to map database row to CreditDebitNote
function mapToCreditDebitNote(row: Record<string, unknown>): CreditDebitNote {
  return {
    id: row.id as string,
    note_type: row.note_type as NoteType,
    note_number: row.note_number as string,
    note_date: row.note_date as string,
    original_invoice_id: row.original_invoice_id as string | undefined,
    institution_id: row.institution_id as string | undefined,
    customer_name: row.customer_name as string | undefined,
    customer_address: row.customer_address as string | undefined,
    customer_gstin: row.customer_gstin as string | undefined,
    reason: row.reason as string,
    line_items: parseLineItems(row.line_items),
    subtotal: Number(row.subtotal) || 0,
    cgst_rate: Number(row.cgst_rate) || 0,
    cgst_amount: Number(row.cgst_amount) || 0,
    sgst_rate: Number(row.sgst_rate) || 0,
    sgst_amount: Number(row.sgst_amount) || 0,
    igst_rate: Number(row.igst_rate) || 0,
    igst_amount: Number(row.igst_amount) || 0,
    total_amount: Number(row.total_amount) || 0,
    status: row.status as NoteStatus,
    applied_to_invoice_id: row.applied_to_invoice_id as string | undefined,
    applied_date: row.applied_date as string | undefined,
    notes: row.notes as string | undefined,
    created_by: row.created_by as string | undefined,
    created_at: row.created_at as string | undefined,
    updated_at: row.updated_at as string | undefined,
  };
}

// Fetch all credit/debit notes
export async function fetchCreditDebitNotes(
  noteType?: NoteType,
  startDate?: string,
  endDate?: string
): Promise<CreditDebitNote[]> {
  let query = supabase
    .from('credit_debit_notes')
    .select('*')
    .order('note_date', { ascending: false });
  
  if (noteType) {
    query = query.eq('note_type', noteType);
  }
  if (startDate) {
    query = query.gte('note_date', startDate);
  }
  if (endDate) {
    query = query.lte('note_date', endDate);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  
  return (data || []).map(row => mapToCreditDebitNote(row as unknown as Record<string, unknown>));
}

// Fetch notes for a specific invoice
export async function fetchNotesForInvoice(invoiceId: string): Promise<CreditDebitNote[]> {
  const { data, error } = await supabase
    .from('credit_debit_notes')
    .select('*')
    .eq('original_invoice_id', invoiceId)
    .order('note_date', { ascending: false });
  
  if (error) throw error;
  
  return (data || []).map(row => mapToCreditDebitNote(row as unknown as Record<string, unknown>));
}

// Generate note number
async function generateNoteNumber(noteType: NoteType): Promise<string> {
  const { data, error } = await supabase
    .rpc('generate_note_number', { p_note_type: noteType });
  
  if (error) throw error;
  return data as string;
}

// Create credit/debit note
export async function createCreditDebitNote(input: CreateNoteInput): Promise<CreditDebitNote> {
  const { data: userData } = await supabase.auth.getUser();
  
  // Generate note number
  const noteNumber = await generateNoteNumber(input.note_type);
  
  // Fetch company profile for GST rates
  const companyProfile = await fetchDefaultCompanyProfile();
  const cgstRate = companyProfile?.default_cgst_rate ?? 9;
  const sgstRate = companyProfile?.default_sgst_rate ?? 9;
  const igstRate = companyProfile?.default_igst_rate ?? 18;
  
  // Calculate totals
  const subtotal = input.line_items.reduce((sum, item) => sum + item.amount, 0);
  const isInterState = input.is_inter_state ?? false;
  
  let cgst_amount = 0;
  let sgst_amount = 0;
  let igst_amount = 0;
  
  if (isInterState) {
    igst_amount = (subtotal * igstRate) / 100;
  } else {
    cgst_amount = (subtotal * cgstRate) / 100;
    sgst_amount = (subtotal * sgstRate) / 100;
  }
  
  const total_amount = subtotal + cgst_amount + sgst_amount + igst_amount;
  
  const { data, error } = await supabase
    .from('credit_debit_notes')
    .insert([{
      note_type: input.note_type,
      note_number: noteNumber,
      note_date: new Date().toISOString().split('T')[0],
      original_invoice_id: input.original_invoice_id,
      institution_id: input.institution_id,
      customer_name: input.customer_name,
      customer_address: input.customer_address,
      customer_gstin: input.customer_gstin,
      reason: input.reason,
      line_items: JSON.parse(JSON.stringify(input.line_items)),
      subtotal,
      cgst_rate: isInterState ? 0 : cgstRate,
      cgst_amount,
      sgst_rate: isInterState ? 0 : sgstRate,
      sgst_amount,
      igst_rate: isInterState ? igstRate : 0,
      igst_amount,
      total_amount,
      status: 'draft',
      created_by: userData?.user?.id,
    }])
    .select()
    .single();
  
  if (error) throw error;
  
  return mapToCreditDebitNote(data as unknown as Record<string, unknown>);
}

// Update note status
export async function updateNoteStatus(id: string, status: NoteStatus): Promise<void> {
  const { error } = await supabase
    .from('credit_debit_notes')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);
  
  if (error) throw error;
}

// Apply credit note to invoice (reduces balance)
export async function applyCreditNoteToInvoice(
  noteId: string, 
  invoiceId: string
): Promise<void> {
  const { error } = await supabase
    .from('credit_debit_notes')
    .update({
      applied_to_invoice_id: invoiceId,
      applied_date: new Date().toISOString().split('T')[0],
      status: 'applied',
      updated_at: new Date().toISOString(),
    })
    .eq('id', noteId);
  
  if (error) throw error;
}

// Delete note (only drafts)
export async function deleteCreditDebitNote(id: string): Promise<void> {
  const { error } = await supabase
    .from('credit_debit_notes')
    .delete()
    .eq('id', id)
    .eq('status', 'draft');
  
  if (error) throw error;
}
