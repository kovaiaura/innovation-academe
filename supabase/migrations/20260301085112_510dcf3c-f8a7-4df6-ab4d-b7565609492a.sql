
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS handled_by TEXT;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS remark TEXT;
