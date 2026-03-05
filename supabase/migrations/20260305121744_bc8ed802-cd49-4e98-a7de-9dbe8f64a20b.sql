ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS enable_notifications BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS enable_gps_tracking BOOLEAN DEFAULT true;