# Delete Duplicate Assessment Attempts

## Problem
Sometimes a student ends up with two attempts for the same assessment — often a 0/50 auto-submitted (no answers) row plus a real attempt. Admins need a way to remove the unwanted attempt so only the valid/high-scoring one remains.

## Scope
- Affects the "Student Performance" table inside the Assessment Analytics dialog (`src/components/assessment/AssessmentAnalytics.tsx`) used across CEO / Management / System Admin assessment views.
- Per-attempt delete only — no automated dedup; the user decides which row to remove.

## UX
- Add a trash icon button in the existing Actions column, next to View and Allow Retake.
- Clicking it opens an AlertDialog: "Delete this attempt? This will permanently remove Student X's submission (score/percentage). This cannot be undone."
- On confirm: delete the row, toast success, reload the attempts list.
- Visible to roles that already see this dialog (system_admin, management/CEO, officer). No new permission gating beyond existing access.

## Technical changes

1. **`src/services/assessment.service.ts`**
   - Add `async deleteAttempt(attemptId: string): Promise<boolean>` that:
     - Deletes child rows in `assessment_answers` where `attempt_id = attemptId`.
     - Deletes the row in `assessment_attempts` by `id`.
     - Returns true/false based on error.

2. **`src/components/assessment/AssessmentAnalytics.tsx`**
   - Import `Trash2` from lucide-react and `AlertDialog` primitives.
   - Add local state `attemptToDelete: AssessmentAttempt | null`.
   - Add handler `handleDeleteAttempt` that calls the service, toasts, and `loadData()`.
   - Render a destructive ghost trash button in the Actions cell for every non-in-progress attempt.
   - Render a single AlertDialog at the bottom of the component driven by `attemptToDelete`.

## Out of scope
- No DB migration (existing RLS on `assessment_attempts` / `assessment_answers` already allows admin deletes; if RLS blocks, we'll add a policy in a follow-up).
- No auto-dedup logic, no changes to submission/auto-submit flow.
- No changes to analytics aggregation — stats will naturally recompute from remaining attempts after reload.
