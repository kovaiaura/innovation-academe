# Fix Course Progress Showing 0%

## Root Cause
Course completion is being calculated differently in different places, and some analytics are still content-count based instead of session-count based. The UI where sessions/levels show completed is based on session completion, but dashboards compare raw `student_content_completions` against broad course content totals. That can stay at `0%` when:

- progress rows are stored under student record IDs in one place but read with user/profile IDs elsewhere,
- locked/unassigned content is included in the denominator,
- dashboards average student percentages instead of using the class/institution maximum completion capacity,
- student dashboard only shows course count, not actual completion percentage.

## Correct Formula
Use session-based progress everywhere, matching the way officers mark sessions complete:

```text
Individual student progress = completed allocated sessions / total allocated sessions

Class progress = total completed student-sessions / (allocated sessions × active students)

Institution progress = sum completed student-sessions across classes / sum max student-sessions across classes
```

A session counts as completed for a student only when all content in that allocated session has a completion row for that student.

## Implementation Plan

### 1. Add one shared progress calculator
Create a reusable helper, for example `src/utils/courseProgressCalculations.ts`, that:

- loads course-class assignments for an institution/class/student context,
- loads allocated module/session assignments,
- loads active students for each class,
- loads course content only for allocated sessions,
- loads completions using both `students.id` and legacy `students.user_id` matching where needed,
- returns per-student, per-class, and institution-level percentages using the formulas above.

This prevents every dashboard from having its own slightly different logic.

### 2. Fix comprehensive analytics
Update `src/hooks/useComprehensiveAnalytics.ts` so:

- individual student `course_completion` uses that student’s completed allocated sessions,
- class `course_completion` uses the max completion count: `sessions × active students`,
- institution `course_completion` uses the total max completion count across all classes,
- the Course Progress card in class/student analytics stops showing `0%` when sessions are actually completed.

### 3. Fix institution-wide analytics
Update:

- `src/hooks/useInstitutionAnalytics.ts`
- `src/hooks/useAllInstitutionsAnalytics.ts`

so CEO/system-level institution analytics use the same session-based calculation instead of raw content totals or course usage.

### 4. Fix course performance dialog
Update `src/hooks/useCoursePerformance.ts` so each course’s progress is based on allocated course sessions and student-session completions, not broad content totals.

### 5. Fix student dashboard visibility
Update `src/pages/student/Dashboard.tsx` to calculate and show actual course progress for the logged-in student, not just number of enrolled courses.

### 6. Ensure refresh after marking complete
Confirm and extend query invalidation after bulk/session marking so these keys refresh immediately:

- `comprehensive-analytics`
- `institution-analytics`
- `all-institutions-analytics`
- `course-performance`
- `student-courses`
- `student-course-progress`
- `session-completion-status`

## Expected Result
- Student progress shows their own completed sessions out of allocated sessions.
- Class progress shows completed student-session count out of the maximum possible for available active students.
- Institution/CEO analytics aggregate the same real completion data.
- Bulk-marked sessions update dashboards without requiring manual recalculation.