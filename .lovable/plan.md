

# Remove Attendance Reminder Email Feature

## What Changes
Remove all attendance check-in/check-out reminder email functionality from the platform — UI settings, email template card, edge function, and related leave settings fields.

## Files to Modify

### 1. `src/pages/system-admin/Settings.tsx`
- Remove the `AttendanceReminderTemplateCard` import and usage from the Email tab

### 2. `src/pages/system-admin/GlobalApprovalConfig.tsx`
- Remove the "Attendance Reminder Emails" card (lines ~586–638) with the minutes-before setting

### 3. `src/services/leaveSettings.service.ts`
- Remove `reminder_enabled_officer`, `reminder_enabled_staff`, and `reminder_minutes_before` from the `LeaveSettings` interface, defaults, fetch parsing, and `updateAllSettings`

### 4. `src/components/settings/AttendanceReminderTemplateCard.tsx`
- Delete this file entirely

### 5. `src/components/payroll/LeaveManagementTab.tsx` & `src/components/leave/LeaveOverviewTab.tsx`
- Remove `reminder_enabled_officer`, `reminder_enabled_staff`, `reminder_minutes_before` from any local defaults/state

### 6. `supabase/functions/send-attendance-reminder/index.ts`
- Delete this edge function entirely

### 7. Database cleanup (migration)
- Remove the `attendance_reminder_dispatch_log` table
- Remove related `leave_settings` rows (`reminder_enabled_officer`, `reminder_enabled_staff`, `reminder_minutes_before`)
- Remove the `attendance_reminder_template` row from `system_configurations`
- Unschedule any pg_cron job for `send-attendance-reminder`

