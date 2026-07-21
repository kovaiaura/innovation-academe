# Attendance Enhancements — Multi-Session, Remarks, Reports & PDF Export

## 1. Multi-Level / Multi-Session Picker (Officer → Class Attendance)
File: `src/pages/officer/Attendance.tsx`

- Replace single-select curriculum session dropdown with a **multi-select** (checkbox list inside a Popover).
  - Course dropdown stays single-select.
  - Level/Module dropdown becomes multi-select — picking multiple levels loads their combined sessions.
  - Sessions become a multi-select checkbox list, grouped by module.
- On "Save Attendance & Mark Session(s) Completed":
  - Iterate all selected session IDs and call `markSessionComplete` for each with the same present/late student list.
  - Toast summary: "N sessions marked complete for M students".

## 2. Class Remark / Note (Optional)
File: `src/pages/officer/Attendance.tsx` + `useClassSessionAttendance.ts`

- Add a **Remark** textarea below the picker (e.g. "Exam day — all students in exam hall").
- Persist to existing `class_session_attendance.notes` column (no migration needed).
- Extend `useSaveClassAttendance` payload to include `notes`.
- Load existing note when a saved session is selected.
- Allow saving remark even when all students are marked absent (already possible).

## 3. Weekly / Monthly Attendance Reports for Management
New file: `src/components/attendance/ClassAttendanceReportsTab.tsx`
Wired into `src/pages/management/Attendance.tsx` as a third tab **"Reports"**.

**View controls**
- Range toggle: Weekly (Mon–Sun of picked week) | Monthly (calendar month picker).
- Optional class filter and officer filter.

**Data (from `class_session_attendance` for institution + date range, joined with `officers`, `classes`, `institution_timetable_assignments` → `institution_periods`)**
- Summary cards:
  - Total periods handled (rows count)
  - Total teaching minutes (auto-calculated from `period_time` "HH:MM - HH:MM")
  - Average attendance %
  - Sessions marked completed
  - Unique classes covered / unique officers involved
- Table 1 — **Per Officer**: Officer, Periods handled, Total hours, Classes covered, Avg attendance %, Sessions completed.
- Table 2 — **Per Class**: Class, Periods, Total hours, Avg attendance %, Officers who taught it.
- Table 3 — **Per Day**: Date, Periods, Hours, Attendance %, Completed count.
- Remarks section: any row where `notes` is non-empty (date, class, officer, remark).

## 4. Export to PDF
Same tab.

- Use existing `jspdf` + `jspdf-autotable` (already in project — used by payslip/report services).
- "Export PDF" button generates a branded, multi-section report with the range in the header, all four tables, and summary stats.
- Also keep an "Export CSV" button (flat per-period rows).

## Technical Notes
- Duration calc helper: parse `period_time` → minutes; skip if unparsable.
- All queries scoped by `institution_id` and RLS already permits management SELECT.
- No DB migration required (uses existing columns).
- Multi-session marking reuses `useSessionCompletion.markSessionComplete` in a sequential loop with `{ silent: true }`, single toast at the end.

## Files
| File | Change |
|---|---|
| `src/pages/officer/Attendance.tsx` | Multi-select level/session, remark textarea, loop mark-complete |
| `src/hooks/useClassSessionAttendance.ts` | Add `notes` to save payload |
| `src/pages/management/Attendance.tsx` | Add "Reports" tab |
| `src/components/attendance/ClassAttendanceReportsTab.tsx` | New — weekly/monthly report + PDF/CSV export |
