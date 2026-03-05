

# Plan: Enforce Profile-Based Working Hours for Staff + Attendance Reminder Emails

## Summary

Three changes:
1. **Staff working hours from profile, not institution** — currently `fetchWorkingHours` always reads from `institutions.settings`. For staff, it should read `check_in_time`/`check_out_time` from the `profiles` table instead. Officers continue using institution settings.
2. **Attendance reminder email system** — a cron-triggered edge function that sends reminder emails 5 minutes before check-in and check-out times.
3. **Reminder settings in Global Approval Config** — toggles to enable/disable reminders per user type (officer/staff), plus a customizable reminder email template in CEO Settings.

---

## 1. Staff Working Hours from Profile

**File: `src/components/payroll/IndividualAttendanceTab.tsx`** (lines 660-686)

Currently `fetchWorkingHours` always queries `institutions.settings`. Change to:
- If `selectedEmployee.type === 'staff'` → query `profiles` table for `check_in_time`, `check_out_time`, `normal_working_hours` using the employee's `user_id`
- If `selectedEmployee.type === 'officer'` → keep existing institution settings query

This affects:
- Correction dialog default times
- Overtime calculations
- Any place `institutionWorkingHours` is used

---

## 2. Reminder Email Edge Function

**New file: `supabase/functions/send-attendance-reminder/index.ts`**

Logic:
1. Fetch reminder settings from `leave_settings` (new keys: `reminder_enabled_officer`, `reminder_enabled_staff`, `reminder_minutes_before` defaulting to 5)
2. Get current time (IST)
3. Query all active profiles whose `check_in_time` or `check_out_time` is within the reminder window
4. For officers without profile times, look up their assigned institution's settings
5. Send reminder emails using Resend (same pattern as `send-password-reset`) with the configured template
6. Use email template from `system_configurations` key `attendance_reminder_template`

**Cron schedule**: Run every minute via `pg_cron` + `pg_net` to check if any reminders are due.

**Config in `supabase/config.toml`**:
```toml
[functions.send-attendance-reminder]
verify_jwt = false
```

---

## 3. Database Changes

**New `leave_settings` rows** (via migration):
- `reminder_enabled_officer` (boolean, default `false`)
- `reminder_enabled_staff` (boolean, default `false`)
- `reminder_minutes_before` (number, default `5`)

**New `system_configurations` row**:
- Key: `attendance_reminder_template` with default JSONB containing subject line and body template text

---

## 4. Global Approval Config UI — Reminder Toggles

**File: `src/pages/system-admin/GlobalApprovalConfig.tsx`**

Add a new section in the "Leave Settings" tab (or a new "Reminders" tab):
- Toggle: "Send check-in/check-out reminders to Officers" → updates `reminder_enabled_officer`
- Toggle: "Send check-in/check-out reminders to Staff" → updates `reminder_enabled_staff`
- Input: "Minutes before" (default 5)
- These use `leaveSettingsService.updateSetting()` — same pattern as GPS toggle

---

## 5. Reminder Email Template Settings

**File: `src/pages/system-admin/Settings.tsx`** (CEO Settings > Email tab)

Add a section for "Attendance Reminder Email Template" with:
- Subject line input
- Body textarea with placeholder variables: `{name}`, `{type}` (Check-in/Check-out), `{time}`, `{date}`
- Preview button
- Saved to `system_configurations` key `attendance_reminder_template`

---

## Files to Create/Modify

| Action | File |
|--------|------|
| Modify | `src/components/payroll/IndividualAttendanceTab.tsx` — branch working hours fetch by employee type |
| Modify | `src/pages/system-admin/GlobalApprovalConfig.tsx` — add reminder toggle settings |
| Modify | `src/services/leaveSettings.service.ts` — add reminder setting keys to interface |
| Modify | `src/pages/system-admin/Settings.tsx` — add reminder template editor in Email tab |
| Create | `supabase/functions/send-attendance-reminder/index.ts` — cron-triggered reminder sender |
| Migration | Insert new `leave_settings` rows for reminder config |
| SQL (non-migration) | Create `pg_cron` job to invoke the edge function every minute |

