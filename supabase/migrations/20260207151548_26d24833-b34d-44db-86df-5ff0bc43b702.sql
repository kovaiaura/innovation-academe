-- Drop the existing check constraint and recreate with 'absent' included
ALTER TABLE public.assessment_attempts 
DROP CONSTRAINT IF EXISTS assessment_attempts_status_check;

ALTER TABLE public.assessment_attempts 
ADD CONSTRAINT assessment_attempts_status_check 
CHECK (status = ANY (ARRAY['in_progress'::text, 'submitted'::text, 'auto_submitted'::text, 'evaluated'::text, 'absent'::text]));