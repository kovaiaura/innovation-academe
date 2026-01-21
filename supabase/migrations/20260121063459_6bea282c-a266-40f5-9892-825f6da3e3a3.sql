-- Add signature_url column to invoices table for storing digital signatures
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS signature_url TEXT;