ALTER TABLE public.leave_applications 
  ALTER COLUMN total_days TYPE numeric USING total_days::numeric,
  ALTER COLUMN lop_days TYPE numeric USING lop_days::numeric,
  ALTER COLUMN paid_days TYPE numeric USING paid_days::numeric;