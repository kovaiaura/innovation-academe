

# Fix: Staff Check-in Not Reflecting + Officer Status Bug + Email Reminders Not Sending + Individual Profile Controls

## Root Cause Analysis

### 1. Staff check-in/out NOT reflecting in CEO dashboard
**Root cause**: `StaffAttendanceCard` uses `staffAttendanceService` which stores data in **localStorage** (mock data), NOT the database. The `recordStaffCheckIn` and `getTodayCheckInStatus` methods all use `localStorage.setItem/getItem`. The CEO dashboard also renders this same `StaffAttendanceCard` component — but it reads from the *CEO's browser localStorage*, not the staff member's. Even the staff member's own data is ephemeral and not persisted to the `staff_attendance` table.

**Fix**: Rewrite `StaffAttendanceCard` to use the real `staff_attendance` database table for check-in/check-out (same pattern as `OfficerCheckInCard` which uses Supabase). Create proper hooks (`useStaffTodayAttendance`, `useStaffCheckIn`, `useStaffCheckOut`) mirroring the officer attendance hooks.

### 2. Officer showing "Checked In" even after checkout
**Root cause**: The `OfficerCheckInCard` uses `useOfficerTodayAttendance` which refetches every 30 seconds. The checkout mutation invalidates the query, but if the CEO dashboard renders a different view of officer status (e.g., management attendance page), it may show stale data. Also, on the CEO's `StaffAttendanceCard` — the CEO is a "staff" user, so their attendance card reads from localStorage for their own check-in status. If the CEO checks out, localStorage is updated, but the badge logic may not refresh.

Need to verify: The officer status bug is likely in the management attendance page or CEO's payroll view showing `checked_in` instead of `checked_out` — the `OfficerCheckInCard` itself handles status correctly. Will check where the CEO views officer status.

### 3. Reminder emails NOT sending
**Root cause** (from edge function logs): The function boots every minute (cron works) but the logs show NO output — no "Reminders disabled" or "emails_sent" messages. This means:
- Reminders are currently **disabled** in DB (`reminder_enabled_officer: false`, `reminder_enabled_staff: false`)
- Even if enabled, the time matching is too strict — it compares `HH:MM` exactly, so the function window is 1 minute. If cron fires at `:01` but target time is `:00`, it misses.
- Staff profiles may not have `check_in_time`/`check_out_time` set at all.

**Fix**: 
- The function logic itself is correct but needs a wider matching window (compare within a minute range)
- Add logging so issues are diagnosable
- The real fix is enabling the toggles + ensuring profile times are populated

### 4. Individual profile controls for notifications and GPS
**Current state**: GPS and reminder toggles are global (in `leave_settings`). No per-user override exists.

**Fix**: Add `enable_notifications` and `enable_gps_tracking` columns to `profiles` table. Update `GlobalApprovalConfig` to show a per-user table with individual toggles. Update the edge function and `StaffAttendanceCard`/`OfficerCheckInCard` to check individual settings.

---

## Implementation Plan

### Migration: Add individual control columns to profiles
```sql
ALTER TABLE profiles ADD COLUMN enable_notifications BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN enable_gps_tracking BOOLEAN DEFAULT true;
```

### File 1: `src/services/staff-attendance.service.ts`
Replace localStorage mock with real Supabase queries for:
- `recordStaffCheckIn` → `INSERT INTO staff_attendance`
- `recordStaffCheckOut` → `UPDATE staff_attendance SET check_out_time, status='checked_out'`
- `getTodayCheckInStatus` → `SELECT FROM staff_attendance WHERE date = today`

### File 2: `src/components/attendance/StaffAttendanceCard.tsx`
Rewrite to use React Query hooks (like `OfficerCheckInCard`):
- Query `staff_attendance` for today's record
- Read `enable_gps_tracking` from the user's profile (individual override)
- Add real-time subscription for status updates

### File 3: New `src/hooks/useStaffAttendance.ts`
Create hooks mirroring officer attendance:
- `useStaffTodayAttendance(userId)` — query today's `staff_attendance` record
- `useStaffCheckIn()` — mutation to insert attendance record
- `useStaffCheckOut()` — mutation to update with checkout time
- Real-time subscription on `staff_attendance` table

### File 4: `src/pages/system-admin/GlobalApprovalConfig.tsx`
Add a new section "Individual Profile Controls" with a table listing all staff and officers:
- Name | Role | Notifications (toggle) | GPS Tracking (toggle)
- Each toggle updates the individual `profiles.enable_notifications` / `profiles.enable_gps_tracking`

### File 5: `supabase/functions/send-attendance-reminder/index.ts`
- Add console logging throughout for debugging
- Filter out users where `enable_notifications = false` (individual override)
- Widen time matching window to account for cron timing jitter (compare minute ranges)

### File 6: `src/components/officer/OfficerCheckInCard.tsx`
- Read `enable_gps_tracking` from individual profile instead of only global setting
- Ensure checkout status is correctly reflected after mutation

---

## Summary

| # | Issue | Root Cause | Fix |
|---|-------|-----------|-----|
| 1 | Staff check-in not in CEO dashboard | Uses localStorage (mock), not DB | Rewrite to use `staff_attendance` table |
| 2 | Officer shows "Checked In" after checkout | Likely stale query or page-specific view | Verify and fix status display |
| 3 | Reminder emails not sent | Toggles disabled in DB + strict time matching | Better matching + logging |
| 4 | No individual controls | Only global toggles exist | Add per-profile `enable_notifications` / `enable_gps_tracking` columns |

| Action | File |
|--------|------|
| Migration | Add `enable_notifications`, `enable_gps_tracking` to `profiles` |
| Rewrite | `src/services/staff-attendance.service.ts` — use Supabase instead of localStorage |
| Rewrite | `src/components/attendance/StaffAttendanceCard.tsx` — use DB-backed hooks |
| Create | `src/hooks/useStaffAttendance.ts` — React Query hooks for staff attendance |
| Modify | `src/pages/system-admin/GlobalApprovalConfig.tsx` — add individual profile controls table |
| Modify | `supabase/functions/send-attendance-reminder/index.ts` — add individual filtering + logging |
| Modify | `src/components/officer/OfficerCheckInCard.tsx` — individual GPS toggle |

