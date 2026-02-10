

## Revamp Attendance Management Page - 2 Tabs Only

### Overview
Restructure the management Attendance page from 4 tabs (Innovation Officers, Class Sessions, Students, Analytics) to just 2 focused tabs:

1. **Officer Attendance** - Daily attendance, upcoming approved leaves
2. **Class Sessions** - Date-filtered view of scheduled periods with completion status, handler info, student count, and course/session details

---

### Tab 1: Officer Attendance (Enhanced)

Keep the existing `OfficerAttendanceTab` component but enhance it with an additional section showing **upcoming approved leaves** for the institution's officers.

**New section added below the attendance table:**
- Query `leave_applications` table filtered by `institution_id`, `status = 'approved'`, and `start_date >= today`
- Display a card/table showing: officer name, leave type, start date, end date, total days, reason
- Sorted by nearest upcoming leave first

**Data sources:**
- `officer_attendance` table (existing) - daily check-in/check-out records
- `leave_applications` table - filter by officer_id matching institution officers, status = 'approved', start_date >= today

---

### Tab 2: Class Sessions (Restructured)

Replace the existing `ClassSessionAttendanceTab` with a date-focused view showing:

**Controls:**
- Date picker (defaults to today)
- Class filter dropdown (optional)

**For the selected date, show:**
1. Fetch all scheduled periods from `institution_timetable_assignments` for that day of week + `institution_periods` for time info
2. Cross-reference with `class_session_attendance` records for that date to see which were completed
3. Display a table with columns:
   - Period / Time (from `institution_periods`)
   - Class Name (from timetable assignment)
   - Officer/Handler (from timetable assignment or class_session_attendance)
   - Status: Completed / Pending
   - Students Present / Total (from `class_session_attendance` if completed)
   - Course / Session Covered (from `class_session_attendance.subject` field, populated when officer marks session complete)

**Data sources:**
- `institution_timetable_assignments` - scheduled periods for the day of week
- `institution_periods` - period time slots (start_time, end_time, label)
- `class_session_attendance` - completed session records with student counts and subject info

---

### Technical Changes

#### File: `src/pages/management/Attendance.tsx`
- Remove `StudentAttendanceTab` and `AttendanceStatisticsCharts` imports
- Change tabs from 4 to 2: "Officer Attendance" and "Class Sessions"
- Update tab state type to `'officers' | 'class-sessions'`
- Remove Students and Analytics TabsContent blocks
- Update grid to `grid-cols-2` for TabsList

#### File: `src/components/attendance/OfficerAttendanceTab.tsx`
- Add a new section at the bottom: "Upcoming Approved Leaves"
- Query `leave_applications` where officer_id is in institution's officers, status = 'approved', start_date >= today
- Display as a simple card with a table listing upcoming leaves

#### File: `src/components/attendance/ClassSessionAttendanceTab.tsx`
- Major restructure: change from month/day toggle view to a **date-picker driven** daily view
- For selected date:
  - Get day of week (e.g., "Monday")
  - Fetch timetable assignments for that day + institution
  - Fetch periods for time slots
  - Fetch `class_session_attendance` records for that date
  - Merge: show all scheduled periods, mark completed ones with session data
- Table columns: Period Time, Class, Scheduled Officer, Status (Completed/Pending), Students Present/Total, Course/Session Covered
- Remove monthly summary view and complex filter controls
- Keep class filter and CSV export

---

### Summary of Removed Tabs
- **Students tab** - removed (student-level attendance data is still accessible through the Class Sessions tab's attendance records)
- **Analytics tab** - removed (can be accessed from the main Analytics page)

