

# Fix: Half-Day Leave Incorrectly Counted as Full-Day LOP

## Root Cause

In `IndividualAttendanceTab.tsx` lines 432-438, the `isPaid` logic uses integer comparison:

```javascript
dayCount++;  // becomes 1
const isPaid = dayCount <= paidDays;  // 1 <= 0.5 → FALSE → marked LOP!
```

For a half-day leave with `paid_days = 0.5`, `dayCount` is `1`, so `1 <= 0.5` is `false` — the entire day is marked as LOP instead of paid.

Additionally, `calculateStats()` (lines 575-576) counts leave records as whole days using `.length`, ignoring that a half-day leave should only count as 0.5.

## Fix (single file: `IndividualAttendanceTab.tsx`)

### 1. Add `leave_day_value` to `LeaveInfo` and `DayRecord`

- Add `dayValue: number` (0.5 or 1) to `LeaveInfo` interface
- Add `leave_day_value?: number` to `DayRecord` interface

### 2. Fix `isPaid` logic in leaveMap builder (lines 422-440)

Use the leave's `total_days` and `paid_days` to determine paid status. For a leave where `paid_days > 0`, all days of that leave are paid (proportionally). The key insight: compare cumulative fractional days, not integer count.

Simpler approach: if a leave application has `paid_days > 0`, mark its days as paid. If `lop_days > 0`, mark as LOP. For half-day leaves (single day), use `total_days` as the `dayValue`.

```typescript
const totalDays = l.total_days || 1;
const paidDays = l.paid_days || 0;
const isHalfDay = totalDays === 0.5;
const dayValue = isHalfDay ? 0.5 : 1;

// For single-day or half-day leaves: isPaid if paidDays > 0
let cumulativeDays = 0;
for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
  cumulativeDays += dayValue;
  const isPaid = cumulativeDays <= paidDays;
  leaveMap.set(dateStr, { type, id, isPaid, dayValue });
}
```

### 3. Fix `calculateStats()` to sum fractional values (lines 574-576)

Replace `.length` counting with `.reduce()` summing `leave_day_value`:

```typescript
const paidLeaveDays = dayRecords
  .filter(r => r.dayType === 'leave' && r.is_paid_leave)
  .reduce((sum, r) => sum + (r.leave_day_value || 1), 0);
const lopLeaveDays = dayRecords
  .filter(r => r.dayType === 'leave' && !r.is_paid_leave)
  .reduce((sum, r) => sum + (r.leave_day_value || 1), 0);
```

### 4. Handle half-day leave + afternoon attendance

When a day has both a half-day leave AND an attendance record, the day should show as **both** leave and present (not purely leave). Update the day-type resolution (lines 522-524) to check if there's also an attendance record on a half-day leave day — if so, mark as present with leave info preserved.

| Action | File |
|--------|------|
| Modify | `src/components/payroll/IndividualAttendanceTab.tsx` |

