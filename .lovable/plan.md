## Why progress shows 0% in CEO / Management dashboards

Two real bugs combined:

1. **Officer's "Mark session complete" silently fails for sessions with no `course_content` rows.**
   In `useSessionCompletion.ts` we early-return when `course_content` for the session is empty, so neither `student_content_completions` nor `class_session_attendance` gets written. Most allocated sessions in the project currently have zero content rows, so officer clicks produce no progress signal at all.

2. **Class and institution progress are computed as the AVERAGE across all students.**
   Even when one student completes a few sessions, the class average rounds to ~0%. The user wants class-wise/institution-wise progress to reflect the **top student's completion**, and individual to stay as their own %.

3. **Progress calc ignores session-level completions.**
   `courseProgressCalculations.ts` only counts a session done when every `course_content` row has a `student_content_completions` row. A session marked complete by an officer (or a level/module marked complete previously) without per-content rows is never counted.

## Fix

### A. Always record officer "mark session complete" (even with zero content)

`src/hooks/useSessionCompletion.ts`
- Remove the early-return when `course_content` for the session is empty.
- Still upsert per-content `student_content_completions` when content exists.
- ALWAYS call `createAttendanceRecord(...)` so `class_session_attendance.is_session_completed = true` is written with the per-student `present/absent` status in `attendance_records`. This becomes the session-level "officer marked complete" source.

### B. Treat session-level marks as completion

`src/utils/courseProgressCalculations.ts`
- Add a second source: load `class_session_attendance` rows where `is_session_completed = true` for the relevant class(es) and parse `attendance_records` JSON to build a map of `studentRecordId -> Set<session_id>` completed-by-officer.
- A session counts as completed for a student if **either**:
  - it has content AND all `course_content` rows have matching `student_content_completions` (existing rule), **or**
  - the student is marked `present` in a `class_session_attendance` row for that session with `is_session_completed = true` (new rule).
- This makes empty sessions countable and back-fills previously marked sessions/levels.

### C. Aggregate class & institution as the TOP student's progress

`src/hooks/useComprehensiveAnalytics.ts`
- `classPerformance[].course_completion` = `Math.max(...classStudents.map(s => s.course_completion))` (instead of average).
- `InstitutionPerformance.course_completion` = `Math.max(...classPerformance.map(c => c.course_completion))`.

`src/hooks/useInstitutionAnalytics.ts`, `src/hooks/useAllInstitutionsAnalytics.ts`, `src/hooks/useClassAnalytics.ts`
- Switch their `course_completion` aggregates from average → max across students (class) and max across classes (institution), using the same shared `computeStudentSessionProgress` utility for the per-student %.

### D. No DB schema change

No migration required. Existing `class_session_attendance.attendance_records` JSON already stores per-student presence; we just start reading it as a completion source.

### Out of scope (intentionally not changed)

- Assessment weightages, assignment averages, XP/badges/projects aggregates.
- Per-student calculation rule (stays sessions-completed / sessions-allocated).
- Student dashboard's own % (already uses the same shared util — will automatically benefit from B).
