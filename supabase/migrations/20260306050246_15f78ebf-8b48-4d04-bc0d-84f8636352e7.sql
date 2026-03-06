
-- Create dispatch log table for deduplication
CREATE TABLE public.attendance_reminder_dispatch_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reminder_type TEXT NOT NULL, -- 'check-in' or 'check-out'
  reminder_date DATE NOT NULL,
  scheduled_time TEXT NOT NULL, -- e.g. '10:30'
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Unique constraint for deduplication
CREATE UNIQUE INDEX idx_reminder_dispatch_unique 
ON public.attendance_reminder_dispatch_log (user_id, reminder_type, reminder_date, scheduled_time);

-- Index for cleanup queries
CREATE INDEX idx_reminder_dispatch_date ON public.attendance_reminder_dispatch_log (reminder_date);

-- Enable RLS
ALTER TABLE public.attendance_reminder_dispatch_log ENABLE ROW LEVEL SECURITY;

-- Only service role (edge function) writes to this table
CREATE POLICY "Service role full access on dispatch log"
ON public.attendance_reminder_dispatch_log
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Add unique constraint on leave_settings.setting_key if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'leave_settings_setting_key_key'
  ) THEN
    ALTER TABLE public.leave_settings ADD CONSTRAINT leave_settings_setting_key_key UNIQUE (setting_key);
  END IF;
END $$;
