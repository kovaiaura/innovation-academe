

# Plan: Attendance Reminder Improvements

## 3 Changes

### 1. Remove Officer/Staff toggle switches from Global Approval Config UI
**File: `src/pages/system-admin/GlobalApprovalConfig.tsx`**
- Remove the "Remind Officers" and "Remind Staff" toggle sections (lines 602-664)
- Keep only the "Minutes Before" input with its Save button
- Add an info note: "Individual notification controls are managed in the Individual Controls tab"

**File: `supabase/functions/send-attendance-reminder/index.ts`**
- Remove the check for `reminder_enabled_officer` / `reminder_enabled_staff` global toggles (lines 132-148)
- Instead, rely solely on each user's `enable_notifications` profile setting (already checked per-user)

### 2. Fix "Minutes Before" not saving
**File: `src/services/leaveSettings.service.ts`** — `updateSetting` method
- The issue: `.update().eq()` silently fails if no row matches or RLS blocks. Change to **upsert** pattern:
  ```
  .upsert({ setting_key: key, setting_value: value }, { onConflict: 'setting_key' })
  ```
- This ensures the row is created if missing, or updated if it exists

**Database**: Add unique constraint on `leave_settings.setting_key` if not already present (needed for upsert `onConflict`)

### 3. Skip reminders on leave days, weekends, and holidays
**File: `supabase/functions/send-attendance-reminder/index.ts`**

Before sending any reminder, check three conditions for the current day:

**a) Weekend check**: Skip if today is Saturday or Sunday (IST)

**b) Company holidays** (applies to both staff and officers):
- Query `company_holidays` where today falls between `date` and `end_date`
- If a match exists, skip the reminder

**c) Institution holidays** (officers only):
- For each officer, query `institution_holidays` where `institution_id` matches their assigned institution and today falls in the date range
- If a match exists, skip that officer's reminder

**d) Approved leave check** (both staff and officers):
- Query `leave_applications` where `applicant_id` matches, `status = 'approved'`, and today falls between `start_date` and `end_date`
- Covers all leave types: casual, paid, LOP
- For half-day leaves (`leave_duration = 'half_day'`): still send reminders (they work half the day)

### Flow in edge function:
```
1. Check if weekend → skip all
2. Fetch company_holidays for today → skip all if match
3. For each staff member:
   - Check leave_applications for approved full-day leave → skip if on leave
   - Check enable_notifications → skip if disabled
   - Send reminder
4. For each officer per institution:
   - Check institution_holidays for today + institution → skip if match
   - Check leave_applications for approved full-day leave → skip if on leave
   - Check enable_notifications → skip if disabled
   - Send reminder
```

### Files Modified
- `src/pages/system-admin/GlobalApprovalConfig.tsx` — remove toggles, keep minutes input
- `src/services/leaveSettings.service.ts` — fix upsert for minutes save
- `supabase/functions/send-attendance-reminder/index.ts` — skip weekends/holidays/leaves
- Possible DB migration: unique constraint on `leave_settings.setting_key`

