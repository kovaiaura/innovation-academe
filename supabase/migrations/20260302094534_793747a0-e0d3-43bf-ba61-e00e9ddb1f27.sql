
CREATE TABLE public.salary_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  employee_type TEXT NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  amount_paid NUMERIC NOT NULL,
  net_salary NUMERIC NOT NULL,
  payment_type TEXT DEFAULT 'full',
  invoice_id UUID REFERENCES public.invoices(id),
  paid_by UUID,
  paid_by_name TEXT,
  paid_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(employee_id, month, year)
);

ALTER TABLE public.salary_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view salary payments"
  ON public.salary_payments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert salary payments"
  ON public.salary_payments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update salary payments"
  ON public.salary_payments FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete salary payments"
  ON public.salary_payments FOR DELETE
  TO authenticated
  USING (true);
