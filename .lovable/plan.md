# Make quick-marked sessions count everywhere

## What's wrong
Quick bulk marking saves every session correctly (that's why each course card shows e.g. 28/28 "Completed"). Two other screens read those marks incompletely:

1. **Student dashboard "overall progress" (26.3%)** — it loads all marks for the whole class in one request. The database returns at most 1,000 rows per request, and a class of 26 students × hundreds of sessions has far more, so most marks are silently dropped.
2. **Officer "Start teaching" screen (0/26 students on Level 3, 4 ...)** — it only counts content each student opened/was marked on, never the session marks themselves, and it also hits the same 1,000-row cut-off. So sessions marked complete show as not done.

## Fix
- Read marks in pages (and only for the students/courses involved) so nothing is dropped — student dashboard, course progress, and any shared progress calculation.
- Officer teaching screen: treat a session as completed for a student when it was marked complete (same rule My Courses uses), plus the existing content check; read in pages. Level/session ticks, "x/26 students" and the top "Course Progress" bar will then match.
- No change to how marking, unlocking or certificates work; no database changes.

## Technical details
- `src/utils/courseProgressCalculations.ts`: paginate (`.range()` 1000-row loop) `loadOfficerMarkedSessionsByStudent`, `student_content_completions`, `course_content`, module/session assignment reads; filter officer marks by student ids when given.
- `src/hooks/useSessionCompletionStatus.ts`: also load `class_session_completions` for `classId` + `classAssignmentId` (paginated) and count a student complete if marked OR all content completed; paginate content completions; same for `useStudentCourseProgress`.
- Verify with fixture counts >1000 rows that totals are correct.
