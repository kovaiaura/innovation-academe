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
