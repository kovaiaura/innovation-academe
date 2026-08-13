# Make Course Progress Update Automatically + Simplify Attendance Reports

## Problems

1. When an officer marks attendance and picks Course / Level / Session as covered, that fact is only recoverable from the attendance report. Progress calculations try to re-derive which curriculum session was covered by **matching the attendance row's `subject` text against session titles** — a fragile text match that fails whenever the subject holds a timetable subject or trainer name. Result: 0% progress everywhere.
2. Nothing on the dashboards (officer, management, CEO, student) shows what was covered in a given period.
3. Progress is only recalculated when a student opens content; there is no backfill for everything already marked.
4. Weekly/monthly report shows too many tables and columns.

## Fix

### 1. Store session completions explicitly (root fix)

New table `class_session_completions`:

```text
id, institution_id, class_id, class_assignment_id, course_id,
module_id, session_id, student_id, attendance_id (nullable),
source ('officer_marked' | 'content_completed' | 'backfill'),
completed_at, completed_by
unique (student_id, session_id, class_assignment_id)
```

Written whenever an officer marks a curriculum session complete (attendance flow, bulk mark tab, teaching panel), for every present/late student. No more title matching.

Also add `covered_session_ids jsonb` + `covered_course_id` to `class_session_attendance` so each period records exactly what was covered (used by dashboards and reports).

### 2. Progress reads the new table

`src/utils/courseProgressCalculations.ts`: a session counts as completed for a student if there is a `class_session_completions` row **or** all its content is completed. Remove the subject/title-matching path. Every consumer (student dashboard, class analytics, institution analytics, comprehensive analytics, CEO/management/officer dashboards) then reflects marks immediately, without the student opening content.

### 3. "Recalculate Progress" button (CEO gamification)

New button in Gamification Management → Overview. It runs a backfill edge function that:
- creates `class_session_completions` rows for every historic `class_session_attendance` row that is session-completed (matching by covered_session_ids, then by title as a legacy fallback), for present/late students;
- creates rows for sessions whose content is already fully completed;
- reports how many rows were created, then invalidates all analytics caches.

### 4. Show what was covered on dashboards

Add a compact "Sessions covered today / recently" list (date, period, class, course → level → session, trainer, attendance) to:
- Officer dashboard
- Management and CEO dashboards (institution-wide)
- Student dashboard ("Recently covered in class" with the course/level/session names)

### 5. Simplify weekly/monthly attendance report

Replace the Per Officer / Per Class / Per Day tables with a single flat table:

```text
Date | Day | Period | Class | Trainer | Attendance | Topic / Remark
```

Keep the weekly/monthly toggle and the summary cards; PDF and CSV export the same seven columns. Topic column shows the covered session titles, or the remark when no session was covered (never the trainer name).

## Technical notes

- Migration creates the table with GRANTs for `authenticated` / `service_role`, RLS enabled, policies: institution members read, officers/management/CEO insert-update for their institution.
- Backfill runs as an edge function with service role so it can process all institutions in one pass.
- Files touched: `src/utils/courseProgressCalculations.ts`, `src/hooks/useSessionCompletion.ts`, `src/hooks/useClassSessionAttendance.ts`, `src/pages/officer/Attendance.tsx`, `src/components/officer/BulkMarkCompleteTab.tsx`, `src/components/attendance/ClassAttendanceReportsTab.tsx`, `src/pages/system-admin/GamificationManagement.tsx`, officer/management/CEO/student dashboards, plus a new `recalculate-course-progress` edge function.
