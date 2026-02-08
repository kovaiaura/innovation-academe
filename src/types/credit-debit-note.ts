export type NoteType = 'credit' | 'debit';
export type NoteStatus = 'draft' | 'issued' | 'applied' | 'cancelled';

export interface NoteLineItem {
  id?: string;
  description: string;
  hsn_sac_code?: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface CreditDebitNote {
  id: string;
  note_type: NoteType;
  note_number: string;
  note_date: string;
  original_invoice_id?: string;
  institution_id?: string;
  customer_name?: string;
  customer_address?: string;
  customer_gstin?: string;
  reason: string;
  line_items: NoteLineItem[];
  subtotal: number;
  cgst_rate: number;
  cgst_amount: number;
  sgst_rate: number;
  sgst_amount: number;
  igst_rate: number;
  igst_amount: number;
  total_amount: number;
  status: NoteStatus;
  applied_to_invoice_id?: string;
  applied_date?: string;
  notes?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateNoteInput {
  note_type: NoteType;
  original_invoice_id?: string;
  institution_id?: string;
  customer_name?: string;
  customer_address?: string;
  customer_gstin?: string;
  reason: string;
  line_items: Omit<NoteLineItem, 'id'>[];
  is_inter_state?: boolean;
}

export const NOTE_REASONS = {
  credit: [
    'Goods Returned',
    'Discount Given',
    'Billing Error',
    'Price Reduction',
    'Defective Goods',
    'Service Not Rendered',
    'Other',
  ],
  debit: [
    'Additional Charges',
    'Price Increase',
    'Interest on Late Payment',
    'Shortage of Goods',
    'Difference in Tax Rate',
    'Other',
  ],
};
