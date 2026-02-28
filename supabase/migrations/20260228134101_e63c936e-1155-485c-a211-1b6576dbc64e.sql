
-- Create invoice_parties table
CREATE TABLE public.invoice_parties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  party_name text NOT NULL,
  address text,
  city text,
  state text,
  state_code text,
  pincode text,
  gstin text,
  pan text,
  contact_person text,
  phone text,
  email text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.invoice_parties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage invoice parties" ON public.invoice_parties
  FOR ALL USING (
    public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
    public.has_role(auth.uid(), 'system_admin'::public.app_role)
  );

CREATE TRIGGER update_invoice_parties_updated_at
  BEFORE UPDATE ON public.invoice_parties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create invoice_settings table (single-row design)
CREATE TABLE public.invoice_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prefix text DEFAULT '',
  suffix text DEFAULT '',
  current_number integer NOT NULL DEFAULT 0,
  number_padding integer NOT NULL DEFAULT 3,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.invoice_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage invoice settings" ON public.invoice_settings
  FOR ALL USING (
    public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
    public.has_role(auth.uid(), 'system_admin'::public.app_role)
  );

CREATE TRIGGER update_invoice_settings_updated_at
  BEFORE UPDATE ON public.invoice_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to atomically get next invoice number
CREATE OR REPLACE FUNCTION public.get_next_invoice_number_v2()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_prefix text;
  v_suffix text;
  v_current integer;
  v_padding integer;
  v_result text;
BEGIN
  -- Get or create settings row
  INSERT INTO public.invoice_settings (prefix, suffix, current_number, number_padding)
  VALUES ('', '', 0, 3)
  ON CONFLICT DO NOTHING;

  -- Atomically increment and return
  UPDATE public.invoice_settings
  SET current_number = current_number + 1, updated_at = now()
  WHERE id = (SELECT id FROM public.invoice_settings LIMIT 1)
  RETURNING prefix, suffix, current_number, number_padding
  INTO v_prefix, v_suffix, v_current, v_padding;

  v_result := COALESCE(v_prefix, '') || LPAD(v_current::text, v_padding, '0') || COALESCE(v_suffix, '');
  RETURN v_result;
END;
$$;
