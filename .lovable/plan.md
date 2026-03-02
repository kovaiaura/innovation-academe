
# Add Half-Day Leave Support

## Overview
Add the ability for officers and staff to apply for half-day leave (morning or afternoon), where each half-day counts as 0.5 leave. Two half-day leaves equal one full day of leave.

---

## 1. Database Migration

Add a `leave_duration` column to the `leave_applications` table:

```text
ALTER TABLE leave_applications 
  ADD COLUMN leave_duration TEXT NOT NULL DEFAULT 'full_day';
-- Values: 'full_day', 'first_half', 'second_half'
```

Also change `total_days`, `paid_days`, and `lop_days` from INTEGER to NUMERIC to support 0.5 values:

```text
ALTER TABLE leave_applications ALTER COLUMN total_days TYPE NUMERIC;
ALTER TABLE leave_applications ALTER COLUMN paid_days TYPE NUMERIC;
ALTER TABLE leave_applications ALTER COLUMN lop_days TYPE NUMERIC;
```

Update `leave_balances` columns similarly (sick_leave_used, casual_leave_used, lop_days, balance_remaining) to NUMERIC to support 0.5 increments.

---

## 2. Type Updates

**File: `src/types/leave.ts`**
- Add `LeaveDuration` type: `'full_day' | 'first_half' | 'second_half'`
- Add `leave_duration` field to `LeaveApplication` interface
- Add `leave_duration` field to `CreateLeaveApplicationInput`
- Add display labels: `{ full_day: 'Full Day', first_half: 'First Half (Morning)', second_half: 'Second Half (Afternoon)' }`
- Change `total_days`, `paid_days`, `lop_days` from `number` (integer) -- they already are `number` in TS so no change needed, but logic must handle 0.5

---

## 3. Service Updates

**File: `src/services/leave.service.ts`**
- In `applyLeave`: 
  - If `leave_duration` is `first_half` or `second_half`, force `start_date === end_date` (half-day is single-day only) and set `totalDays = 0.5`
  - For full-day, keep existing logic
  - Include `leave_duration` in the insert payload
  - LOP calculation: compare 0.5 against available balance
- In `calculateWorkingDays`: no change needed (half-day bypasses this)

**File: `src/services/leave.service.ts` (balance update)**
- `updateBalanceOnApproval`: already accepts `days: number`, will work with 0.5
- The DB function `apply_leave_application_to_balance` uses `paid_days` and `lop_days` from the record -- since we're changing those to NUMERIC, 0.5 values will flow through correctly

---

## 4. UI Form Updates (4 files)

All leave application forms need a "Leave Duration" selector that appears when start_date equals end_date (single day):

**Files to modify:**
- `src/pages/officer/OfficerLeave.tsx` -- Officer leave form (Step 1 of multi-step)
- `src/pages/system-admin/Leave.tsx` -- Staff leave form
- `src/pages/system-admin/MetaStaffLeaveManagement.tsx` -- Meta staff leave form
- `src/pages/system-admin/LeaveApply.tsx` -- Simple leave apply form

**UI behavior:**
- Add a radio group or Select with 3 options: "Full Day", "First Half (Morning)", "Second Half (Afternoon)"
- Default: "Full Day"
- When half-day is selected and date range spans multiple days, show warning: "Half-day leave can only be for a single day"
- When half-day is selected, the "Total Days Requested" shows 0.5 instead of 1
- Include `leave_duration` in the mutation payload

---

## 5. Leave Records Display Updates

**Files:**
- `src/pages/system-admin/LeaveRecords.tsx`
- `src/pages/system-admin/LeaveStatus.tsx`
- Leave approval dialogs

Show the leave duration label next to total days in records tables (e.g., "0.5 day (Morning)" or "2 days (Full Day)").

---

## 6. Balance Function Updates

**DB function: `get_leave_balance`** -- Already returns numeric-compatible fields; changing column types to NUMERIC ensures 0.5 values work.

**DB function: `apply_leave_application_to_balance`** -- Uses `paid_days` and `lop_days` from the application record. With NUMERIC columns, 0.5 will propagate correctly.

**DB function: `initialize_leave_balance`** -- Uses integer arithmetic; update to handle NUMERIC (balance_remaining calculation).

---

## 7. Payroll/Attendance Integration

**File: `src/components/payroll/IndividualAttendanceTab.tsx`**
- When reading leave applications for attendance stats, treat `total_days = 0.5` correctly in paid leave / LOP counts
- The existing code already sums `paid_days` and `lop_days` -- with NUMERIC types, 0.5 values will add up correctly

**File: `src/components/payroll/MonthlyBreakdownTab.tsx`**  
- Already handles `half_day` status in attendance records; leave records with 0.5 will integrate naturally

---

## Files Summary

| Action | File |
|--------|------|
| Create | DB migration -- add `leave_duration` column, change day columns to NUMERIC |
| Modify | `src/types/leave.ts` -- add LeaveDuration type and labels |
| Modify | `src/services/leave.service.ts` -- handle half-day in applyLeave |
| Modify | `src/pages/officer/OfficerLeave.tsx` -- add duration selector |
| Modify | `src/pages/system-admin/Leave.tsx` -- add duration selector |
| Modify | `src/pages/system-admin/MetaStaffLeaveManagement.tsx` -- add duration selector |
| Modify | `src/pages/system-admin/LeaveApply.tsx` -- add duration selector |
| Modify | `src/pages/system-admin/LeaveRecords.tsx` -- display duration in records |
| Modify | `src/pages/system-admin/LeaveStatus.tsx` -- display duration in status view |
