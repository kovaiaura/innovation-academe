-- Phase 1: Comprehensive Invoice Management Schema Extensions

-- Add new columns to invoices table for payment tracking
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS amount_paid numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS balance_due numeric GENERATED ALWAYS AS (total_amount - COALESCE(amount_paid, 0)) STORED,
ADD COLUMN IF NOT EXISTS tds_deducted_by text DEFAULT 'none' CHECK (tds_deducted_by IN ('self', 'client', 'none')),
ADD COLUMN IF NOT EXISTS tds_certificate_number text,
ADD COLUMN IF NOT EXISTS tds_quarter text,
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid')),
ADD COLUMN IF NOT EXISTS last_payment_date date,
ADD COLUMN IF NOT EXISTS sent_date date,
ADD COLUMN IF NOT EXISTS days_overdue integer DEFAULT 0;

-- Create payments table for tracking all payment transactions
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  amount numeric NOT NULL CHECK (amount > 0),
  payment_mode text NOT NULL CHECK (payment_mode IN ('bank_transfer', 'cheque', 'upi', 'cash', 'credit_card', 'online_gateway', 'neft', 'rtgs', 'imps')),
  reference_number text,
  bank_name text,
  cheque_number text,
  cheque_date date,
  tds_deducted boolean DEFAULT false,
  tds_amount numeric DEFAULT 0,
  tds_certificate_number text,
  tds_quarter text,
  notes text,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create credit_debit_notes table
CREATE TABLE IF NOT EXISTS public.credit_debit_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  note_type text NOT NULL CHECK (note_type IN ('credit', 'debit')),
  note_number text NOT NULL UNIQUE,
  note_date date NOT NULL DEFAULT CURRENT_DATE,
  original_invoice_id uuid REFERENCES public.invoices(id) ON DELETE SET NULL,
  institution_id uuid REFERENCES public.institutions(id),
  customer_name text,
  customer_address text,
  customer_gstin text,
  reason text NOT NULL,
  line_items jsonb DEFAULT '[]'::jsonb,
  subtotal numeric DEFAULT 0,
  cgst_rate numeric DEFAULT 0,
  cgst_amount numeric DEFAULT 0,
  sgst_rate numeric DEFAULT 0,
  sgst_amount numeric DEFAULT 0,
  igst_rate numeric DEFAULT 0,
  igst_amount numeric DEFAULT 0,
  total_amount numeric DEFAULT 0,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'issued', 'applied', 'cancelled')),
  applied_to_invoice_id uuid REFERENCES public.invoices(id) ON DELETE SET NULL,
  applied_date date,
  notes text,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create invoice_audit_log table for complete audit trail
CREATE TABLE IF NOT EXISTS public.invoice_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('created', 'updated', 'deleted', 'status_changed', 'payment_recorded', 'payment_deleted', 'credit_note_applied', 'debit_note_applied', 'sent', 'cancelled')),
  old_values jsonb,
  new_values jsonb,
  performed_by uuid REFERENCES public.profiles(id),
  performed_by_name text,
  performed_at timestamptz DEFAULT now(),
  ip_address text,
  notes text
);

-- Create sequence for credit/debit note numbers
CREATE SEQUENCE IF NOT EXISTS public.credit_note_seq START 1;
CREATE SEQUENCE IF NOT EXISTS public.debit_note_seq START 1;

-- Enable RLS on new tables
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_debit_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payments
CREATE POLICY "System admins can manage all payments"
ON public.payments FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'system_admin'::public.app_role) OR
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
);

-- RLS Policies for credit_debit_notes
CREATE POLICY "System admins can manage all credit_debit_notes"
ON public.credit_debit_notes FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'system_admin'::public.app_role) OR
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
);

-- RLS Policies for invoice_audit_log (read-only for admins)
CREATE POLICY "Admins can view audit logs"
ON public.invoice_audit_log FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'system_admin'::public.app_role) OR
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
);

CREATE POLICY "System can insert audit logs"
ON public.invoice_audit_log FOR INSERT
TO authenticated
WITH CHECK (true);

-- Function to update invoice payment status after payment
CREATE OR REPLACE FUNCTION public.update_invoice_on_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_paid numeric;
  v_total_amount numeric;
  v_tds_total numeric;
  v_new_status text;
BEGIN
  -- Calculate total payments for this invoice
  SELECT COALESCE(SUM(amount), 0), COALESCE(SUM(tds_amount), 0)
  INTO v_total_paid, v_tds_total
  FROM public.payments
  WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  
  -- Get invoice total
  SELECT total_amount INTO v_total_amount
  FROM public.invoices
  WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  
  -- Determine payment status (considering TDS as partial payment)
  IF v_total_paid + v_tds_total >= v_total_amount THEN
    v_new_status := 'paid';
  ELSIF v_total_paid > 0 THEN
    v_new_status := 'partial';
  ELSE
    v_new_status := 'unpaid';
  END IF;
  
  -- Update invoice
  UPDATE public.invoices
  SET 
    amount_paid = v_total_paid,
    payment_status = v_new_status,
    last_payment_date = (
      SELECT MAX(payment_date) FROM public.payments 
      WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)
    ),
    status = CASE 
      WHEN v_new_status = 'paid' THEN 'paid'
      ELSE status
    END,
    updated_at = now()
  WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Triggers for payment updates
DROP TRIGGER IF EXISTS trigger_update_invoice_on_payment_insert ON public.payments;
CREATE TRIGGER trigger_update_invoice_on_payment_insert
  AFTER INSERT ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_invoice_on_payment();

DROP TRIGGER IF EXISTS trigger_update_invoice_on_payment_delete ON public.payments;
CREATE TRIGGER trigger_update_invoice_on_payment_delete
  AFTER DELETE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_invoice_on_payment();

-- Function to log invoice changes
CREATE OR REPLACE FUNCTION public.log_invoice_audit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_action text;
  v_user_name text;
BEGIN
  -- Get user name
  SELECT name INTO v_user_name FROM public.profiles WHERE id = auth.uid();
  
  IF TG_OP = 'INSERT' THEN
    v_action := 'created';
    INSERT INTO public.invoice_audit_log (invoice_id, action, new_values, performed_by, performed_by_name)
    VALUES (NEW.id, v_action, to_jsonb(NEW), auth.uid(), v_user_name);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != NEW.status THEN
      v_action := 'status_changed';
    ELSE
      v_action := 'updated';
    END IF;
    INSERT INTO public.invoice_audit_log (invoice_id, action, old_values, new_values, performed_by, performed_by_name)
    VALUES (NEW.id, v_action, to_jsonb(OLD), to_jsonb(NEW), auth.uid(), v_user_name);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'deleted';
    INSERT INTO public.invoice_audit_log (invoice_id, action, old_values, performed_by, performed_by_name)
    VALUES (OLD.id, v_action, to_jsonb(OLD), auth.uid(), v_user_name);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Trigger for invoice audit logging
DROP TRIGGER IF EXISTS trigger_invoice_audit_log ON public.invoices;
CREATE TRIGGER trigger_invoice_audit_log
  AFTER INSERT OR UPDATE OR DELETE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.log_invoice_audit();

-- Function to generate credit/debit note numbers
CREATE OR REPLACE FUNCTION public.generate_note_number(p_note_type text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prefix text;
  v_year text;
  v_next_number integer;
BEGIN
  -- Determine prefix
  IF p_note_type = 'credit' THEN
    v_prefix := 'CN/';
    v_next_number := nextval('public.credit_note_seq');
  ELSE
    v_prefix := 'DN/';
    v_next_number := nextval('public.debit_note_seq');
  END IF;
  
  -- Get financial year
  IF EXTRACT(MONTH FROM CURRENT_DATE) >= 4 THEN
    v_year := TO_CHAR(CURRENT_DATE, 'YY') || '-' || TO_CHAR(CURRENT_DATE + INTERVAL '1 year', 'YY');
  ELSE
    v_year := TO_CHAR(CURRENT_DATE - INTERVAL '1 year', 'YY') || '-' || TO_CHAR(CURRENT_DATE, 'YY');
  END IF;
  
  RETURN v_prefix || v_year || '/' || LPAD(v_next_number::TEXT, 4, '0');
END;
$$;

-- Function to calculate days overdue
CREATE OR REPLACE FUNCTION public.calculate_days_overdue()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.invoices
  SET 
    days_overdue = CASE 
      WHEN due_date < CURRENT_DATE AND status NOT IN ('paid', 'cancelled') 
      THEN CURRENT_DATE - due_date
      ELSE 0
    END,
    status = CASE 
      WHEN due_date < CURRENT_DATE AND status = 'issued' THEN 'overdue'
      ELSE status
    END,
    updated_at = now()
  WHERE status NOT IN ('paid', 'cancelled', 'draft');
END;
$$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON public.payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON public.payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_credit_debit_notes_invoice_id ON public.credit_debit_notes(original_invoice_id);
CREATE INDEX IF NOT EXISTS idx_credit_debit_notes_type ON public.credit_debit_notes(note_type);
CREATE INDEX IF NOT EXISTS idx_invoice_audit_invoice_id ON public.invoice_audit_log(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoices_payment_status ON public.invoices(payment_status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON public.invoices(due_date);

-- Add updated_at trigger for new tables
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_credit_debit_notes_updated_at
  BEFORE UPDATE ON public.credit_debit_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();