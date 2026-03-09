
Goal: Fix the “Still same / all failed” repair flow by removing fragile client-side linking and making the batch function return actionable errors.

1) Reproduce and isolate failure path
- Inspect current `repairStudentAccounts` flow in `src/services/credentialService.ts`.
- Confirm that account creation happens in backend but `students.user_id` linking is done on client (RLS-dependent).
- Confirm client currently ignores `response.error` from function invoke, which can hide real backend failures.

2) Make repair atomic in backend (single source of truth)
- File: `supabase/functions/create-student-users-batch/index.ts`
- Extend student input to include `student_id` (DB row id).
- In repair mode:
  - Create or find auth user (by email).
  - Ensure profile + student role.
  - Update `public.students.user_id` directly with service-role client using `student_id`.
- Return per-student result with explicit stages:
  - `auth_created | auth_existing | profile_ok | role_ok | student_linked`
  - `error_code` + `error_message` when failed.
- Keep throttling (delay + small batch cap), but improve observability with structured logs per student.

3) Replace unreliable “existing user by listUsers(filter)” lookup
- Still in `create-student-users-batch`:
  - Use deterministic email lookup (normalized lowercase) against auth users (or supported direct admin email lookup method).
  - Avoid first-page-only behavior that can miss existing users in large user pools.
- This prevents false “User exists but could not be found” failures.

4) Fix frontend error handling and progress accuracy
- File: `src/services/credentialService.ts`
- Send `student_id` in payload for each student.
- Handle all invoke outcomes:
  - If `response.error`, mark batch failed and capture backend error message.
  - If `response.data.results`, process each result status and aggregate by `error_code`.
- Since linking moves to backend, remove client-side `students.update({ user_id })` step.
- Keep inter-batch delay and batch size safeguards.

5) Improve UI feedback for “all failed” cases
- File: `src/pages/system-admin/CredentialManagement.tsx`
- After repair completes, show concise failure summary grouped by reason (e.g., invalid email, already-linked mismatch, permission, auth rate-limit).
- Add optional “View details” modal/table for first N failures so admins can act immediately.
- Keep existing password dialog behavior unchanged.

6) Validation checklist (after implementation)
- Run repair on a small test set (5–10) with mixed cases:
  - brand-new emails
  - emails already existing in auth
  - invalid email row
- Confirm counts: processed = success + failed, and linked students actually move out of “No Account”.
- Re-run repair immediately to ensure idempotency (already-linked users should not be hard failures).

Technical details
- Core design change: move student-link update from client to backend function (service-role execution) to avoid RLS/session-role mismatches.
- Data contract update:
  - Request item: `{ student_id, email, student_name, institution_id, class_id, password? }`
  - Response item: `{ student_id, email, success, user_id, already_existed, stage, error_code, error }`
- This addresses both persistent all-fail loops and missing diagnostics without changing authentication UX.
