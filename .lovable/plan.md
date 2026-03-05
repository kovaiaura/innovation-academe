

# Fix: Present Count & Salary Payable Should Exclude "Checked-In Only" (No Checkout) Days

## Problem

The code treats `checked_in` and `checked_out` identically — both map to `status = 'present'`. So today (March 5), where Jeevakumar has checked in but NOT checked out, is counted as a full present day in stats and salary payable.

**Current (wrong) for March 1-5:**
- Present: 4 (Mar 2 + Mar 3 + Mar 4 half-day + Mar 5 checked-in-only)
- Salary Payable: 5.5

**Expected:**
- Present: 2.5 (Mar 2 + Mar 3 + Mar 4 half-day) — today excluded until checkout
- Salary Payable: 4 (2.5 present + 1 weekend + 0.5 paid leave)

## Root Cause

Lines 533/543: `attendance.status === 'checked_in'` is treated same as `'checked_out'`, both become `status = 'present'`.

## Fix (single file: `IndividualAttendanceTab.tsx`)

### 1. Add a new status: `'checked_in'`

When `attendance.status === 'checked_in'` (no checkout yet), set record status to `'checked_in'` instead of `'present'`. This distinguishes "completed work day" from "currently at work".

Update lines 533 and 543:
```typescript
} else if (attendance.status === 'checked_in') {
  status = 'checked_in';  // Not yet checked out
} else if (attendance.status === 'checked_out') {
  status = 'present';
}
```

### 2. Update `calculateStats()` 

- **Present days**: Only count `'present'` and `'late'` (not `'checked_in'`)
- **Working days**: Include `checked_in` days in working days count (they're expected to work)
- **Salary Payable**: Exclude `'checked_in'` days — salary is only payable after checkout

```typescript
const presentDays = dayRecords.filter(r => r.status === 'present' || r.status === 'late').length;
const checkedInDays = dayRecords.filter(r => r.status === 'checked_in').length;
// Working days includes checked_in (for tracking), but salary payable does not
const workingDays = presentDays + checkedInDays + paidLeaveDays + totalLopDays;
const salaryPayableDays = presentDays + holidays + weekendDays + paidLeaveDays;
```

### 3. Update UI to show `'checked_in'` status

In the daily records table, show a distinct badge for `checked_in` (e.g., orange "Checked In" badge) so it's visually clear the day is incomplete. The edit (pencil) icon should still appear for these records.

### 4. Handle half-day leave + checked_in combo

Line 533: When there's a half-day leave AND attendance is `checked_in` (not checked out), keep the half-day as `checked_in` rather than `present`, so the 0.5 working half isn't counted until checkout.

| Action | File |
|--------|------|
| Modify | `src/components/payroll/IndividualAttendanceTab.tsx` |

