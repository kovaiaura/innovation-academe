

# Fix Level Status Colors, Course Progress Analytics, and Certificate Issuance

## Three Issues to Fix

### Issue 1: Level/Session Status Colors
**Problem**: In `ClassCourseLauncher.tsx` (officer Task page), all unlocked levels and sessions show green CheckCircle regardless of whether they've been completed. Green should mean "completed", not just "unlocked".

**Fix**: Update `ClassCourseLauncher.tsx` to fetch completion data from `student_content_completions` and show three distinct states:
- **Green CheckCircle**: Unlocked AND all sessions/content completed for at least one student
- **Blue Circle** (outline or filled): Unlocked but NOT completed
- **Yellow/Amber Lock**: Locked

**File: `src/components/officer/ClassCourseLauncher.tsx`**
- Add a query to fetch `student_content_completions` for the class's assignment IDs to determine which sessions/modules are actually completed
- Group content by session and check if any student has completed all content in each session
- For modules: check if all unlocked sessions within the module are completed
- Replace the current binary (green CheckCircle / Lock) with three-state icons:
  - `CheckCircle` green for completed
  - `Circle` blue for unlocked-not-completed  
  - `Lock` amber/yellow for locked

### Issue 2: Course Progress Analytics Always 0%
**Problem**: In `useClassAnalytics.ts`, lines 158-164, `course_metrics` is hardcoded to zeros — it never queries actual completion data.

**Fix**: Calculate real course progress from the database.

**File: `src/hooks/useClassAnalytics.ts`**
- After fetching students, also fetch:
  1. `course_class_assignments` for the class
  2. `class_session_assignments` (via `class_module_assignments`) to get total allocated sessions
  3. `student_content_completions` for each assignment to count completed sessions per student
- Calculate `overall_completion_rate` = (sum of completed sessions across all students and courses) / (total sessions × total students) × 100
- Calculate `total_courses_assigned` from actual assignment count
- Calculate `average_modules_completed` from completion data

### Issue 3: Certificate Generation on Officer Mark
**Problem**: The user reports that certificates require students to open the course page after officer marks complete. 

**Current flow**: `useSessionCompletion.markSessionComplete()` already calls `triggerCertificateIssuance()` which invokes the `issue-completion-certificates` edge function. However, the bulk mark path may have a race condition — it marks sessions one at a time, and the certificate check runs per-session. When the last session of a module is marked, the edge function checks if ALL content is completed, which should work.

**Potential issue**: The `triggerCertificateIssuance` function uses `studentRecordIds` (students table IDs) but also needs `student.user_id` for the certificate. Some students might not have `user_id` linked, or there could be timing issues with upserts not being committed when the edge function checks.

**Fix**: 
- In `useSessionCompletion.ts`, add a small delay before calling `triggerCertificateIssuance` to ensure the upserted completions are committed
- Remove the `useLevelCompletionCertificate` dependency from student's `CourseDetail.tsx` as a required step (keep as fallback only)
- Ensure the edge function response is properly awaited

## Files to Modify

| File | Change |
|------|--------|
| `src/components/officer/ClassCourseLauncher.tsx` | Add completion query, three-state color icons (blue/green/amber) |
| `src/hooks/useClassAnalytics.ts` | Calculate real course_metrics from student_content_completions |
| `src/hooks/useSessionCompletion.ts` | Add small delay before certificate trigger to ensure DB consistency |

