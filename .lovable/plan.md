

# Fix: Manual Attendance Correction Errors + Institution-Specific Working Hours

## Problems Identified

1. **400 Error on save**: The `attendance_corrections` table has `attendance_id` as `uuid NOT NULL`, but the code passes the string `'new'` when no existing attendance record exists -- Postgres rejects this as invalid UUID.

2. **Missing RLS policies**: The `attendance_corrections` INSERT policy only allows CEO (`is_ceo = true`). System admins and super admins are blocked from inserting correction logs.

3. **Hardcoded working hours**: Default check-in/out times are hardcoded as `09:00`/`18:00` instead of using the institution's configured `check_in_time`/`check_out_time`. Overtime is calculated against a hardcoded `8` hours instead of the institution's `normal_working_hours`.

4. **No 0.5-day support**: Leave corrections hardcode `total_days: 1` with no option for half-day corrections.

## Plan

### 1. Database Migration
- ALTER `attendance_corrections.attendance_id` to be nullable (it may not have a prior record)
- Add RLS policies for system_admin and super_admin on `attendance_corrections`

```sql
ALTER TABLE public.attendance_corrections ALTER COLUMN attendance_id DROP NOT NULL;

CREATE POLICY "System admins can manage corrections"
ON public.attendance_corrections FOR ALL TO public
USING (public.has_role(auth.uid(), 'system_admin'))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'));

CREATE POLICY "Super admins can manage corrections"
ON public.attendance_corrections FOR ALL TO public
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
```

### 2. Fix code in `IndividualAttendanceTab.tsx`

**a) Fix attendance_id for corrections log** (lines 701-702, 790-791):
- Pass `null` instead of `'new'` when no existing attendance record.

**b) Use institution working hours for default times** (lines 621-627):
- Fetch the selected employee's institution `check_in_time`/`check_out_time` and `normal_working_hours` from the `institutions` table.
- Use those values as defaults in the correction dialog instead of hardcoded `09:00`/`18:00`.

**c) Fix overtime calculation** (line 738):
- Use institution's `normal_working_hours` instead of hardcoded `8`.

**d) Add 0.5-day leave correction support** (lines 674-698):
- Add a `leave_duration` selector (full_day / half_day) in the correction dialog for leave types.
- When half_day, set `total_days: 0.5`, `paid_days: 0.5` or `lop_days: 0.5`.

### Files to Modify

| Action | File |
|--------|------|
| Create | Migration SQL (nullable attendance_id + RLS policies) |
| Modify | `src/components/payroll/IndividualAttendanceTab.tsx` |

