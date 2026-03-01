
-- Add country and shipping address columns to invoice_parties
ALTER TABLE public.invoice_parties 
  ADD COLUMN IF NOT EXISTS country text DEFAULT 'India',
  ADD COLUMN IF NOT EXISTS shipping_address text,
  ADD COLUMN IF NOT EXISTS shipping_city text,
  ADD COLUMN IF NOT EXISTS shipping_state text,
  ADD COLUMN IF NOT EXISTS shipping_state_code text,
  ADD COLUMN IF NOT EXISTS shipping_pincode text,
  ADD COLUMN IF NOT EXISTS shipping_same_as_billing boolean DEFAULT true;

-- Update the payment trigger to account for TDS in balance calculation
CREATE OR REPLACE FUNCTION public.update_invoice_on_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
  
  -- Determine status: paid + tds >= total means fully paid
  IF v_total_paid + v_tds_total >= v_total_amount THEN
    v_new_status := 'paid';
  ELSIF v_total_paid + v_tds_total > 0 THEN
    v_new_status := 'partial';
  ELSE
    v_new_status := 'unpaid';
  END IF;
  
  -- Update invoice with paid amount and TDS totals
  UPDATE public.invoices
  SET 
    amount_paid = v_total_paid,
    tds_amount = v_tds_total,
    payment_status = v_new_status,
    last_payment_date = (
      SELECT MAX(payment_date) FROM public.payments 
      WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)
    ),
    status = CASE 
      WHEN v_new_status = 'paid' THEN 'paid'
      WHEN v_new_status = 'partial' THEN status
      ELSE status
    END,
    updated_at = now()
  WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;
