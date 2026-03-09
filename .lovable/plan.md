

# Plan: Fix Bulk Student Account Creation Failures

## Problem Diagnosis

When bulk importing 450-600 students with email+password, many students end up with `user_id = null` in the `students` table. This creates three failure states:

1. **"No Account" in CEO Credential Management** -- students whose edge function call failed/timed out during import, so no auth user was created and `user_id` is null.
2. **Can login but empty portal** -- auth user was created but `students.user_id` was never linked back (edge function succeeded but the subsequent student insert didn't capture the `user_id`), OR the profile's `institution_id` is null.
3. **Mixed results** -- some students work fine because they were processed early before rate limits/timeouts kicked in.

### Root Causes

**A. `create-student-user` uses `listUsers()` (line 92)** -- This fetches ALL auth users and filters client-side. With hundreds of users, this becomes extremely slow and can timeout the edge function (default 60s). This is the primary bottleneck.

**B. Sequential processing** -- Both `useBulkImport.ts` and `useStudents.ts` call the edge function one-by-one in a loop. For 600 students, that's 600 sequential HTTP calls, each with cold start + `listUsers()` overhead.

**C. No batch auth creation** -- The edge function creates one user at a time. There's no batch endpoint.

**D. Silent failures in bulk import** -- `useBulkImport.ts` (line 155-159) catches edge function errors but continues. The student record still gets inserted with `user_id = null`. Later, the CEO sees "No Account".

## Solution

### 1. Fix `create-student-user` Edge Function -- Replace `listUsers()` with targeted lookup

The `listUsers()` call on line 92 is the performance killer. Replace it with a direct email lookup using `listUsers({ filter: email })` or attempt create directly and handle the duplicate error.

**File:** `supabase/functions/create-student-user/index.ts`
- Remove `const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()` and the `.find()` search
- Replace with: attempt `createUser` directly, catch "already registered" error, then try `listUsers({ filter: email })` with the specific email to get the existing user ID

### 2. Create a Batch Edge Function `create-student-users-batch`

A new edge function that accepts an array of students and processes them in one request. This eliminates 600 HTTP round-trips.

**File:** `supabase/functions/create-student-users-batch/index.ts`
- Accepts `{ students: Array<{ email, password, student_name, institution_id, class_id }> }`
- Processes each student sequentially within the function (avoiding 600 separate cold starts)
- Returns `{ results: Array<{ email, user_id, success, error }> }`
- Uses direct `createUser` with error handling instead of `listUsers()`

### 3. Update `useBulkImport.ts` to Use Batch Edge Function

**File:** `src/hooks/useBulkImport.ts`
- Instead of calling `create-student-user` per student in the loop, collect all students needing auth and call `create-student-users-batch` once per batch of 50
- Map returned `user_id`s back to student records before inserting into `students` table

### 4. Add "Bulk Create Accounts" / "Repair Accounts" Feature in CEO Credential Management

For already-imported students with `user_id = null`, add a button to repair them in bulk.

**File:** `src/pages/system-admin/CredentialManagement.tsx`
- Add a "Repair Missing Accounts" button that finds all students with `user_id = null` and email present
- Calls `create-student-users-batch` for those students
- Updates the `students` table with returned `user_id`s
- Shows progress dialog similar to the recalculation dialog

### 5. Fix Profile Data for Students Who Can Login But See Empty Portal

Create a repair function in the batch edge function that:
- Finds auth users whose profiles have `institution_id = null`
- Cross-references with `students` table by email to get the correct `institution_id` and `class_id`
- Updates the profile accordingly

## Files to Create/Modify

| File | Action |
|------|--------|
| `supabase/functions/create-student-user/index.ts` | Fix `listUsers()` bottleneck |
| `supabase/functions/create-student-users-batch/index.ts` | **New** batch endpoint |
| `supabase/config.toml` | Add batch function config |
| `src/hooks/useBulkImport.ts` | Use batch endpoint |
| `src/pages/system-admin/CredentialManagement.tsx` | Add repair/bulk-create button with progress |
| `src/services/credentialService.ts` | Add batch account creation + repair methods |

## Execution Order

1. Fix `create-student-user` edge function (immediate improvement for single creates)
2. Create `create-student-users-batch` edge function
3. Update `useBulkImport.ts` to use batch endpoint
4. Add repair feature in CEO Credential Management
5. Add `credentialService` methods to support repair

