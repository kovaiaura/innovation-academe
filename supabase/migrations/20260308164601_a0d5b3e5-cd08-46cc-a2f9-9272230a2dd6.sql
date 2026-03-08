ALTER TABLE public.student_resume_extras
  ADD COLUMN IF NOT EXISTS institution_course text,
  ADD COLUMN IF NOT EXISTS institution_passed_year text;