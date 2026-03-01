
-- Create invoice_vendors table (mirror of invoice_parties)
CREATE TABLE public.invoice_vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  state_code TEXT,
  pincode TEXT,
  gstin TEXT,
  pan TEXT,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  country TEXT DEFAULT 'India',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invoice_vendors ENABLE ROW LEVEL SECURITY;

-- RLS policies (same as invoice_parties)
CREATE POLICY "Admins can view vendors"
  ON public.invoice_vendors FOR SELECT
  USING (
    public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
    public.has_role(auth.uid(), 'system_admin'::public.app_role)
  );

CREATE POLICY "Admins can insert vendors"
  ON public.invoice_vendors FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
    public.has_role(auth.uid(), 'system_admin'::public.app_role)
  );

CREATE POLICY "Admins can update vendors"
  ON public.invoice_vendors FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
    public.has_role(auth.uid(), 'system_admin'::public.app_role)
  );

CREATE POLICY "Admins can delete vendors"
  ON public.invoice_vendors FOR DELETE
  USING (
    public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
    public.has_role(auth.uid(), 'system_admin'::public.app_role)
  );

-- Add tds_deducted to invoices if not exists
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS tds_deducted BOOLEAN DEFAULT false;
