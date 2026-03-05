

# Fix: Present Days Counting Half-Day Present as Full Day

## Problem

Line 608 calculates present days using `.length`, which counts each record as 1. On March 4, the employee has a 0.5-day leave + 0.5-day present, but it's counted as 1 full present day instead of 0.5.

**Current**: `presentDays = dayRecords.filter(r => r.status === 'present' || r.status === 'late').length` → gives 3 (Mar 2, 3, 4)

**Expected**: 2.5 (Mar 2 = 1, Mar 3 = 1, Mar 4 = 0.5)

## Fix

Replace `.length` with `.reduce()` that accounts for `leave_day_value`:

```typescript
const presentDays = dayRecords
  .filter((r) => r.status === 'present' || r.status === 'late')
  .reduce((sum, r) => sum + (r.leave_day_value === 0.5 ? 0.5 : 1), 0);
```

When a day has `leave_day_value === 0.5` and status is `'present'`, it means the employee was only present for half the day — so count 0.5 instead of 1.

**Also fix `salaryPayableDays`** which currently shows 4.5 but should be 4 (2.5 present + 1 weekend + 0.5 paid leave = 4).

## File

| Action | File |
|--------|------|
| Modify | `src/components/payroll/IndividualAttendanceTab.tsx` (line 608) |

