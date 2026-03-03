ALTER TABLE public.leave_applications 
ADD COLUMN leave_duration text NOT NULL DEFAULT 'full_day';