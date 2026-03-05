

# Fix: Working Days, Attendance %, Leave Display & Monthly Leave Breakdown

## Issues

### 1. Working Days shows 4.5 instead of 3
Current formula: `Working Days = Present + Checked-In + Paid Leave + LOP`. For Jeevakumar: 2.5 present + 1 checked_in + 0.5 paid leave + 0 LOP = 4. The screenshot shows 4.5 which suggests other counting issues. 

The user wants **Working Days = only days the employee actually worked or is working** (present + checked_in), excluding leave. So Working Days should be 3 (2.5 present + 0.5 checked_in, or just 2 full present + 1 checked_in = 3).

Actually re-reading the user: "WORKING DAYS - 3" — this is Mar 2, Mar 3, Mar 4 (3 working days so far, not counting today Mar 5 since checkout not done... wait they said "CORRECT SINCE FOR WORKING DAY TODAY CAN BE USED"). So working days = 4 (Mar 2, 3, 4, 5). But they say 3. Let me re-read...

The user says "WORKING DAYS - 3". Mar 1 = weekend, Mar 2 = Mon present, Mar 3 = Tue present, Mar 4 = Wed (half-day leave + half-day present), Mar 5 = Thu checked_in. They want working days = 3 — that's the number of full working days completed: Mar 2, Mar 3, and counting Mar 4 as a working day even though half was leave. So working days = days with any work attendance completed (not counting today since no checkout).

Actually looking at reference screenshot: Working Days = 4.5, Present = 3. Let me re-read user message: "WORKING DAYS - 3". Hmm, but that contradicts... Actually the user might mean: Working Days up to yesterday = 3 (Mon, Tue, Wed), excluding today. 

Wait, the user also said "WORKING DAYS - 3 - CORRECT SINCE FOR WORKING DAY TODAY CAN BE USED" — I think they mean working days should NOT count today. Working days = number of non-weekend, non-holiday, non-leave days up to today excluding today until checkout. Mar 2, 3 = 2 full days. Mar 4 = 0.5 working day (other half was leave). So 2.5? But they say 3.

Let me just look at what the reference screenshot shows: Working Days = 4.5, Present = 3. The user wants Working Days = 3, Present = 2.5. 

I think the user's definition is: **Working Days = number of calendar days (past) that were regular working days** (not weekends, not holidays). Mar 2, 3, 4 = 3 working days. Mar 5 is today so could be included but user says 3. So working days = past working days only, today excluded until checkout.

Actually re-reading again: "WORKING DAYS - 3 - CORRECT SINCE FOR WORKING DAY TODAY CAN BE USED". I think they're saying working days COULD be used to include today but currently 3 is fine. So working days = number of weekdays (non-weekend, non-holiday) from day 1 to yesterday = Mar 2, 3, 4 = 3.

### 2. Attendance % formula is wrong
User says: `Attendance % = ((total days present + weekend + holiday) × 100) / total days of that month`

Current: `((totalDaysInMonth - (paidLeaveDays + totalLopDays)) * 100) / totalDaysInMonth`

### 3. Leave/Holiday column for Mar 4 shows "Casual" — should show "First Half - Casual"
Need to include half-day context (which half) in the leave display.

### 4. Monthly Leave Breakdown shows 1 casual instead of 0.5
In `LeaveManagementTab.tsx` line 169, half-day leaves count as `+= 1` per day iteration instead of using `total_days` from the leave record. For a 0.5-day leave, the loop iterates once and adds 1 instead of 0.5.

## Changes

### File 1: `src/components/payroll/IndividualAttendanceTab.tsx`

**A. Fix Working Days calculation (line 619)**
```typescript
// Working Days = number of past weekdays (non-weekend, non-holiday) excluding today if not checked out
const workingDays = dayRecords.filter(r => 
  r.dayType === 'working' && 
  (r.status === 'present' || r.status === 'late' || r.status === 'unmarked' || r.status === 'leave')
).length;
```
This counts only past working days where the employee was expected to work (excludes future days and today if only checked_in).

**B. Fix Attendance % formula (line 622)**
```typescript
// Attendance % = ((present + weekends + holidays) × 100) / total days in month
const attendancePercentage = totalDaysInMonth > 0 
  ? parseFloat((((presentDays + weekendDays + holidays) * 100) / totalDaysInMonth).toFixed(2))
  : 100;
```

**C. Show half-day context in Leave/Holiday column (line 1518-1520)**
Change from just showing leave type to showing "First Half - Casual" or "Second Half - Casual" when `leave_day_value === 0.5`. Need to store the leave session info. Check if we have that data from the leave application.

Need to also store the half-day session (first_half/second_half) in the leaveMap. Let me check what data is available.

**D. Store leave session info in leaveMap**
The leave application likely has a `duration` or `half_day_session` field. Need to check and pass it through.

### File 2: `src/components/payroll/LeaveManagementTab.tsx`

**Fix half-day leave counting (line 169)**
When iterating through leave days, use `total_days` from the leave record to determine the increment. For a 0.5-day leave (start_date == end_date), add 0.5 instead of 1.

```typescript
// Determine day value: if total_days is 0.5, each iteration adds 0.5
const isHalfDay = leave.total_days === 0.5;
const dayValue = isHalfDay ? 0.5 : 1;
// ...
existing.casual += dayValue;
```

| Action | File |
|--------|------|
| Modify | `src/components/payroll/IndividualAttendanceTab.tsx` |
| Modify | `src/components/payroll/LeaveManagementTab.tsx` |

