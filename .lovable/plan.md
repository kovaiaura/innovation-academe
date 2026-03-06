
Goal: make attendance reminder emails send reliably at the configured lead time (e.g., 10:15 for a 10:30 check-in), even when nobody is logged in, and add a backup mechanism.

What I found in the current system:
- The reminder function is already running every minute via backend scheduler (independent of portal login).
- Runtime logs show it is still using `Minutes Before = 5`.
- Database also currently has `leave_settings.reminder_minutes_before = 5`.
- The reminder engine sends only when current time matches check-in/check-out window; if the saved value is 5, a 10:30 check-in triggers at ~10:25, not 10:15.
- So the immediate blocker is config persistence/data mismatch, not scheduler inactivity.

Implementation plan

1) Fix persistence for “Minutes Before” (source of truth)
- Update leave-settings write path so both single-save and full-save use consistent `upsert` logic.
- After saving, immediately read back `reminder_minutes_before` and update UI from server-confirmed value (not local state only).
- Add clear success/error toast text with actual saved value (e.g., “Saved: 15 minutes”).
- Ensure role policy allows CEO settings users to update `leave_settings` (not only role-table admins).

2) Add durable reminder dispatch tracking (prevents misses + duplicates)
- Create `attendance_reminder_dispatch_log` table with unique key per:
  - user_id
  - reminder_type (check-in/check-out)
  - reminder_date
  - scheduled_time
- Before sending, check this table; if already sent, skip.
- After successful send, insert dispatch record.
- This makes retries/catch-up safe and idempotent.

3) Add backup/catch-up execution mode (works even if a minute run is missed)
- Extend reminder function with two modes:
  - `realtime` (current behavior, minute-by-minute)
  - `catchup` (scan previous N minutes, e.g., 20–30 min)
- Keep existing every-minute scheduler as primary.
- Add secondary scheduler (e.g., every 10–15 min) invoking catch-up mode.
- Catch-up mode uses dispatch-log dedupe to send only missed reminders once.

4) Strengthen eligibility checks and reason logging
- Keep existing skip rules: weekends, company holidays, institution holidays, approved full-day leaves.
- Add structured counters in logs:
  - total users scanned
  - skipped by each reason
  - eligible
  - sent
  - failed
- Add explicit per-user “not in window” debug entries (optional sampled logging) to quickly prove why a person didn’t receive mail.

5) Align check-in time source with actual profile data shown in staff screens
- Verify and standardize that reminder logic uses the same check-in/check-out fields users edit in Meta Staff profile.
- For officers, keep institution calendar/time logic; for staff, keep profile-time logic.
- If any role currently stores time elsewhere, normalize to one authoritative source used by both UI and reminder function.

6) Validation checklist (end-to-end)
- Set a test user check-in time (e.g., 10:30) and `Minutes Before = 15`.
- Confirm DB reflects `reminder_minutes_before = 15`.
- Run/observe logs around 10:15:
  - user appears in eligible set
  - one send recorded in dispatch log
  - no duplicate in next retries/catch-up runs
- Test with:
  - full-day approved leave (should skip)
  - half-day leave (should send)
  - holiday/weekend (should skip)
- Confirm scheduler continues to send when no one is logged in.

Technical delivery scope
- Frontend:
  - `src/pages/system-admin/GlobalApprovalConfig.tsx`
  - `src/services/leaveSettings.service.ts`
- Backend function:
  - `supabase/functions/send-attendance-reminder/index.ts`
- Database updates:
  - RLS policy adjustment for CEO settings access (if needed)
  - new dispatch-log table + unique index
  - secondary scheduler entry for catch-up mode
