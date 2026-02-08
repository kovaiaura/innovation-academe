export type PaymentMode = 
  | 'bank_transfer' 
  | 'cheque' 
  | 'upi' 
  | 'cash' 
  | 'credit_card' 
  | 'online_gateway'
  | 'neft'
  | 'rtgs'
  | 'imps';

export type TDSDeductedBy = 'self' | 'client' | 'none';

export interface Payment {
  id: string;
  invoice_id: string;
  payment_date: string;
  amount: number;
  payment_mode: PaymentMode;
  reference_number?: string;
  bank_name?: string;
  cheque_number?: string;
  cheque_date?: string;
  tds_deducted: boolean;
  tds_amount: number;
  tds_certificate_number?: string;
  tds_quarter?: string;
  notes?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  // Purchase-specific fields
  tds_section?: string;
  our_tan?: string;
  is_self_deducted_tds?: boolean;
  tds_rate?: number;
}

export interface CreatePaymentInput {
  invoice_id: string;
  payment_date: string;
  amount: number;
  payment_mode: PaymentMode;
  reference_number?: string;
  bank_name?: string;
  cheque_number?: string;
  cheque_date?: string;
  tds_deducted?: boolean;
  tds_amount?: number;
  tds_certificate_number?: string;
  tds_quarter?: string;
  notes?: string;
  // Purchase-specific fields
  tds_section?: string;
  our_tan?: string;
  is_self_deducted_tds?: boolean;
  tds_rate?: number;
}

export const PAYMENT_MODES: { value: PaymentMode; label: string }[] = [
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'neft', label: 'NEFT' },
  { value: 'rtgs', label: 'RTGS' },
  { value: 'imps', label: 'IMPS' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'upi', label: 'UPI' },
  { value: 'cash', label: 'Cash' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'online_gateway', label: 'Online Payment Gateway' },
];

export const TDS_QUARTERS = [
  { value: 'Q1', label: 'Q1 (Apr-Jun)' },
  { value: 'Q2', label: 'Q2 (Jul-Sep)' },
  { value: 'Q3', label: 'Q3 (Oct-Dec)' },
  { value: 'Q4', label: 'Q4 (Jan-Mar)' },
];

export const TDS_SECTIONS = [
  { value: '194C', label: '194C - Contractor (1%/2%)' },
  { value: '194J', label: '194J - Professional/Technical (10%)' },
  { value: '194H', label: '194H - Commission (5%)' },
  { value: '194I', label: '194I - Rent (10%)' },
  { value: '194A', label: '194A - Interest (10%)' },
  { value: '194O', label: '194O - E-commerce (1%)' },
  { value: 'other', label: 'Other Section' },
];

export const EXPENSE_CATEGORIES = [
  { value: 'operations', label: 'Operations' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'technology', label: 'Technology' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'hr', label: 'HR / Staff' },
  { value: 'travel', label: 'Travel' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'professional_services', label: 'Professional Services' },
  { value: 'equipment', label: 'Equipment & Supplies' },
  { value: 'other', label: 'Other' },
];
