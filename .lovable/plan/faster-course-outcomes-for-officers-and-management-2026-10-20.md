# Faster Course Outcomes for officers and management

## What changes
- Course Outcomes no longer loads everything when the page opens.
- Step 1: choose a class (required). Step 2: choose a student or "All students". Step 3: press **Get outcome**.
- While results load, a short "Analysing learning and assessments..." animation shows (pulsing icon plus step text such as "Reading sessions", "Checking answers", "Building insights").
- Changing class or student clears the old result, so you press Get outcome again. Results for selections you've already viewed reopen instantly.
- Before the first request, a friendly prompt explains the steps instead of an empty page.
- Student and CEO/admin pages stay unchanged.

## Speed improvements
- Load only the chosen class (and student), not the whole institution.
- Run independent reads at the same time rather than one after another.
- Fetch only the columns the page needs, in batches.
- Remember results for a few minutes so going back is instant.
- Aim: a few seconds for one class. The first step after approval measures the current load time, so changes target the slowest parts.

## Technical details
- Officer and management `CourseOutcomes.tsx`: require a class, track a "submitted" filter state, and enable `useCourseOutcomeAnalytics` only after Get outcome is pressed (and give the button a disabled/loading state).
- Add a shared `OutcomeAnalysing` loader inside `src/components/course-outcomes/`.
- `course-outcomes.service.ts`: scope the student/attempt/answer queries to the class, run them with `Promise.all`, use narrower selects, and keep pagination.
- Hook: `staleTime` 5 min instead of 0; academic-year range stays in the query key.
- No grading, progress or database schema changes. If profiling shows a missing index, propose it separately.
