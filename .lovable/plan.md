

# Fix: Edit Button for Leave Days + Half-Day Leave Correction Dialog

## Issues

1. **Edit button doesn't open for leave days**: `openCorrectionDialog()` (line 677) has a guard `if (!record.attendance_id && record.status !== 'unmarked') return;` which blocks leave records since they have no `attendance_id` and status is `'leave'`, not `'unmarked'`.

2. **Half-day leave scenario**: When an employee has a 0.5-day leave but forgot to check in for the remaining half, the system currently marks the entire day as leave. The edit dialog should show "0.5 day leave permission exists" and allow manually adding check-in for the other half.

## Changes (single file: `IndividualAttendanceTab.tsx`)

### 1. Fix `openCorrectionDialog` guard (line 677)
Allow opening for leave status too:
```typescript
if (!record.attendance_id && record.status !== 'unmarked' && record.status !== 'leave') return;
```

### 2. Enhance correction dialog for half-day leave days

When opening the dialog for a day with an existing half-day leave (`record.leave_day_value === 0.5`):
- Show an info banner: "This day has a 0.5-day [leave_type] leave (First/Second Half). The remaining half is unchecked."
- Pre-select attendance type as `'half_day_present'` (new option) which lets the admin add check-in/out for the remaining half while keeping the leave intact
- Add a new `half_day_present` option in the attendance type selector that creates an attendance record without deleting the existing leave

### 3. Add `half_day_present` attendance type handling in save logic

When saving with `half_day_present`:
- Do NOT delete the existing leave record
- Create an attendance record for the date with the provided check-in/out times
- The day will then have both a half-day leave AND an attendance record, triggering the existing hybrid-day logic (line 529) on next reload

### 4. Pre-fill correction data with leave context

In `openCorrectionDialog`, when the record has `leave_day_value === 0.5`:
- Set `attendance_type` to `'half_day_present'`
- Pre-fill check-in/out with institution's afternoon hours (if first-half leave) or morning hours (if second-half leave)

## Files

| Action | File |
|--------|------|
| Modify | `src/components/payroll/IndividualAttendanceTab.tsx` |

