

# Fix: Auto-Submit Stale Assessment Attempts

## Problem
Assessment auto-submit only works client-side via a JavaScript timer in `TakeAssessment.tsx`. If a student closes their browser/computer mid-assessment, the timer stops and the attempt remains `in_progress` forever — even though the assessment duration has long expired.

## Solution
Two-pronged approach:

### 1. New Edge Function: `auto-submit-expired-assessments`
A server-side function that finds and auto-submits all stale `in_progress` attempts where `started_at + duration_minutes` has passed.

- Query `assessment_attempts` where `status = 'in_progress'`
- Join with `assessments` to get `duration_minutes`
- For each attempt where `now() > started_at + duration_minutes`, update:
  - `status` → `'auto_submitted'`
  - `submitted_at` → `started_at + duration_minutes` (the time it should have been submitted)
  - `time_taken_seconds` → `duration_minutes * 60`
  - `score` → sum of `points_earned` from existing answers (whatever they answered before leaving)
  - `percentage` → calculated from score/total_points
  - `passed` → percentage >= pass_percentage
- Also handle case where `now() > assessment.end_time` (assessment window closed)

### 2. Trigger Cleanup on Page Load (Client-Side Fallback)
In the assessment list/performance pages, call the edge function on load to ensure stale attempts are cleaned up before displaying data. This provides immediate cleanup without needing a cron job.

- Add a call to the cleanup edge function in `assessment.service.ts` (e.g., `cleanupStaleAttempts()`)
- Call it when loading the Student Performance page and the student Assessments page

### 3. Also Handle on Assessment Load
In `TakeAssessment.tsx`, the existing `loadAssessment` function already checks `remainingSeconds <= 0` and calls `handleAutoSubmit`. This handles the case where a student returns to an expired attempt — no changes needed there.

## Files

| File | Change |
|------|--------|
| `supabase/functions/auto-submit-expired-assessments/index.ts` | **New** — server-side cleanup function |
| `src/services/assessment.service.ts` | Add `cleanupStaleAttempts()` method that invokes the edge function |
| `src/pages/system-admin/AssessmentManagement.tsx` | Call cleanup on page load |
| `src/pages/management/Performance.tsx` | Call cleanup on page load |

