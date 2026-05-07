# Fix Course Progress Reporting + Bulk Mark Toast

## Issues

### Issue 1: Misleading "0/N sessions completed successfully" toast
In `BulkMarkCompleteTab.tsx`, the per-session toast inside `useSessionCompletion.markSessionComplete` fires its own success/error toast for every session, AND the bulk handler shows another summary. When the per-session call succeeds, the warning summary path can still fire (and "0 sessions marked" appears) due to early-return error paths in `markSessionComplete` returning `false` even though completions were inserted (e.g. when `contentItems` query path hits the "No content found" error toast for a session with no content).

**Fix**:
- Suppress per-session toast inside `useSessionCompletion` when used in bulk mode (add an optional `silent` flag, or have bulk caller handle messaging only).
- In `BulkMarkCompleteTab.handleBulkMark`, when `successCount === 0` show error, when `< total` show warning, otherwise success — and invalidate React Query caches for analytics/dashboards on completion.

### Issue 2: Course progress not updating across dashboards
Several analytics paths compute progress incorrectly or use mock data. After bulk-marking, queries are not invalidated so UIs keep showing stale 0%.

Locations using **inconsistent / wrong / mock** progress logic:

| File | Problem |
|---|---|
| `src/hooks/useClassAnalytics.ts` (line 72) | `totalContentEntries = contentItems.length * students.length` — but only counts completions across `class_assignment_id`. The denominator multiplies by *all* students even if some never had assignments. Acceptable, but the issue is no cache invalidation after bulk mark. |
| `src/hooks/useInstitutionAnalytics.ts` | Has **no** `course_metrics` / completion calculation at all. Returns nothing for course progress. |
| `src/hooks/useAllInstitutionsAnalytics.ts` (line 142) | `average_completion_rate: courseUsageRate` — this is `coursesInUse/totalCourses`, NOT actual session completion. Wrong metric. |
| `src/components/management/CoursePerformanceDialog.tsx` | Uses `mockCourses`, `mockEnrollments`, `mockSubmissions` — entirely mock data. |
| `src/pages/student/Dashboard.tsx` | No course progress shown; the student dashboard should show overall course completion. |

### Issue 3: No query invalidation after bulk mark
After `markSessionComplete` upserts completions, none of these query keys are invalidated:
- `['class-analytics', classId]`
- `['institution-analytics', institutionId]`
- `['all-institutions-analytics']`
- `['comprehensive-analytics', institutionId]`
- `['class-course-assignments', ...]` (student dashboard)
- `['student-course-progress', ...]`

So all dashboards keep showing stale 0%.

## Fix Plan

### A. `src/hooks/useSessionCompletion.ts`
1. Add optional `silent?: boolean` param to `markSessionComplete`. Skip the per-session toast.
2. Accept a `QueryClient` invalidation by importing `useQueryClient` and invalidating these keys at the end of every successful call:
   - `class-analytics`, `institution-analytics`, `all-institutions-analytics`, `comprehensive-analytics`, `class-course-assignments`, `student-course-progress`, `class-session-attendance`.

### B. `src/components/officer/BulkMarkCompleteTab.tsx`
1. Pass `silent: true` to suppress per-session toasts.
2. Fix summary logic: only show one toast at end based on `successCount`. Default state should never show "0 session marked" — verify the path.
3. After completion, invalidate the same query keys (rely on hook).

### C. `src/hooks/useInstitutionAnalytics.ts`
Add real `course_metrics` block computed the same way as `useClassAnalytics`:
- Fetch `course_class_assignments` for institution.
- Fetch derived total content count (sessions × content per session).
- Fetch `student_content_completions` filtered by those `class_assignment_id`s.
- `overall_completion_rate = completions / (totalContent × totalStudents)`.

### D. `src/hooks/useAllInstitutionsAnalytics.ts`
Replace `average_completion_rate: courseUsageRate` with a real calculation:
- Fetch `course_content` count per course (or per assignment).
- Fetch `student_content_completions` per institution (via `class_assignment_id` mapping).
- `average_completion_rate = totalCompletions / (totalContentExpected) × 100`.

### E. `src/components/management/CoursePerformanceDialog.tsx`
Replace mock data usage with a new database-backed hook `useCoursePerformance(courseId, institutionId)` that returns: total students enrolled, completion rate, average progress, per-class breakdown — all computed from `course_class_assignments` + `student_content_completions` + `course_content`.

### F. `src/pages/student/Dashboard.tsx` (optional add)
Add a small "Course Progress" card that uses `useClassCourseAssignments` (already returns `progressPercentage`) to show overall % across enrolled courses.

## Files Changed

| File | Change |
|---|---|
| `src/hooks/useSessionCompletion.ts` | Add `silent` flag, invalidate analytics queries on success |
| `src/components/officer/BulkMarkCompleteTab.tsx` | Use silent mode, fix summary toast |
| `src/hooks/useInstitutionAnalytics.ts` | Add real `course_metrics` |
| `src/hooks/useAllInstitutionsAnalytics.ts` | Compute real `average_completion_rate` from `student_content_completions` |
| `src/components/management/CoursePerformanceDialog.tsx` | Replace mock data with DB-backed hook |
| `src/hooks/useCoursePerformance.ts` (NEW) | Real per-course completion metrics |
| `src/pages/student/Dashboard.tsx` | Add course progress card |
