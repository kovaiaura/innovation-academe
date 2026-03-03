
# Show Proper Day Types (Weekend, Holiday, Leave, LOP) in Daily Attendance

## Problem
Currently, any day without an attendance record is shown as "Not Marked" -- even weekends, holidays, and approved leave days. The screenshot shows Sundays and Saturdays all labeled "Not Marked" which is incorrect.

## Solution
Enhance `OfficerDailyAttendanceDetails` to fetch two additional data sources and cross-reference them when determining each day's status:

1. **Calendar day types** (weekends and holidays) from `calendar_day_types` table using the existing `getDayTypesForMonth` service
2. **Approved leaves** from `leave_applications` table for the officer in that month

## Changes

### File: `src/components/officer/OfficerDailyAttendanceDetails.tsx`

**Data fetching additions:**
- Import and call `getDayTypesForMonth('institution', year, month, institutionId)` to get a Map of dates to day types (weekend/holiday/working)
- Query `leave_applications` for the officer where status is 'approved' and date range overlaps the selected month, selecting `start_date`, `end_date`, `leave_type`, `is_lop`
- Accept a new optional prop `institutionId` (string) to fetch institution-specific calendar

**Status determination logic update (priority order):**
1. If date is in the future -> "Future"
2. If attendance record exists (checked_in/checked_out) -> "Present"
3. If attendance record exists (not_checked_in) -> "Absent"
4. If calendar_day_types has the date as "weekend" -> "Weekend"
5. If calendar_day_types has the date as "holiday" -> "Holiday" (show holiday name from description)
6. If date falls within an approved leave application with `is_lop = true` -> "LOP"
7. If date falls within an approved leave application -> "Leave" (show leave type)
8. Otherwise -> "Not Marked"

**Badge styling additions:**
- Weekend: purple/indigo badge
- Holiday: orange badge (show holiday name if available)
- Leave: yellow badge
- LOP: red-orange badge

**Summary badges update:**
- Add counts for: Weekend, Holiday, Leave, LOP alongside existing Present, Absent, Not Marked

### File: `src/pages/officer/Profile.tsx`

- Pass the officer's first `assigned_institutions[0]` as `institutionId` prop to `OfficerDailyAttendanceDetails`

## Technical Details

```text
// Calendar day types query (existing service)
const dayTypesMap = await getDayTypesForMonth('institution', year, monthNum, institutionId);
// Returns Map<string, 'working' | 'weekend' | 'holiday'>

// Approved leaves query
const { data: leaves } = await supabase
  .from('leave_applications')
  .select('start_date, end_date, leave_type, is_lop')
  .eq('applicant_id', officerId)
  .eq('status', 'approved')
  .lte('start_date', lastDayOfMonth)
  .gte('end_date', firstDayOfMonth);

// Helper to check if a date falls within any leave
const getLeaveForDate = (dateStr) => 
  leaves?.find(l => dateStr >= l.start_date && dateStr <= l.end_date);
```

## Files Summary

| Action | File |
|--------|------|
| Modify | `src/components/officer/OfficerDailyAttendanceDetails.tsx` |
| Modify | `src/pages/officer/Profile.tsx` (pass institutionId prop) |
