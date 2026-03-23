
-- Drop the attendance reminder dispatch log table
DROP TABLE IF EXISTS public.attendance_reminder_dispatch_log;

-- Remove reminder-related leave_settings rows
DELETE FROM public.leave_settings WHERE setting_key IN ('reminder_enabled_officer', 'reminder_enabled_staff', 'reminder_minutes_before');

-- Remove attendance reminder template from system_configurations
DELETE FROM public.system_configurations WHERE key = 'attendance_reminder_template';

-- Unschedule the cron job for send-attendance-reminder (if exists)
SELECT cron.unschedule(jobname) FROM cron.job WHERE jobname LIKE '%attendance-reminder%' OR jobname LIKE '%send-attendance%';
