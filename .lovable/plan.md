# Fix Backdated Attendance Marking + Course Progress Showing 0%

## What I verified

- `src/hooks/useSessionCompletion.ts` builds its own attendance row with `today = format(new Date(), ...)`, looks up a timetable slot by *today's* weekday, and when none matches it creates a placeholder timetable assignment and inserts a row with `period_label = session title`, no `period_time`. That is exactly the Aug-8 rows with session titles as period labels seen in the table editor.
- `src/pages/officer/Attendance.tsx` never passes the selected date into `markSessionComplete`, so a session marked on Aug 8 for Aug 4 lands on Aug 8.
- `handleMarkSessionCompleted` reads the saved row from the already-fetched `savedAttendance` list, which is stale right after the first save — so `is_session_completed` often is not set on the row the officer just created.
- `src/hooks/useClassCourseAssignments.ts` (`useStudentCourses`, used by student **My Courses**) computes `completedSessions` only from `student_content_completions`. It never reads `class_session_completions`, so officer-marked sessions show 0/N. The student dashboard and analytics hooks do read the new table via `courseProgressCalculations.ts`.
- The backfill function returns `processed = rows attempted`, not rows written, so "190 sessions marked" is not evidence anything was stored. The database currently holds 1 attendance row and 1 session-completion row.

## Fix

### 1. Mark completions on the date the officer selected

- `markSessionComplete` gains an options field for the attendance context: `date` and an optional existing `attendanceId`.
- When an `attendanceId` is supplied, update that exact row (flag completed, append covered session ids, keep records/remark) — never create a second row.
- When only a date is supplied, look up the attendance row by timetable assignment + that date, and use that date's weekday when resolving a timetable slot.
- Placeholder rows keep `period_label` empty rather than the session title, so no topic is ever fabricated from a period label.

### 2. Officer attendance passes real context

- `handleSaveAttendance` returns the saved attendance row.
- `handleMarkSessionCompleted` uses that returned row id for both "mark completed" and each `markSessionComplete` call, and passes `selectedDate`.

### 3. Student "My Courses" counts officer-marked sessions

`useStudentCourses` also loads `class_session_completions` for the student's record id and treats a session as completed when it has a row there **or** when all of its content is completed. Session counts and the percentage then match what officers marked, immediately.

### 4. Backfill reports real numbers

`recalculate-course-progress` counts rows in `class_session_completions` before and after the upsert and returns `created` and `total`, so the CEO button reports what was actually written rather than what was attempted. It also reports how many attendance rows it could not map to a curriculum session.

## Technical notes

Files: `src/hooks/useSessionCompletion.ts`, `src/pages/officer/Attendance.tsx`, `src/hooks/useClassCourseAssignments.ts`, `src/components/officer/BulkMarkCompleteTab.tsx` (pass date through), `supabase/functions/recalculate-course-progress/index.ts`, `src/pages/system-admin/GamificationManagement.tsx` (status text). No schema change needed.
