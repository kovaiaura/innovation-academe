

# Fix: Student Email Change Must Update Auth Login Email

## Problem
When editing a student's email in CEO > Institution Management > Classes > Student, only the `students` table `email` column is updated. The **Supabase Auth user email** (used for login) is never changed. So the student can only log in with the old email.

## Solution

### 1. Create new Edge Function: `update-student-email`
A new backend function that:
- Accepts `student_id` and `new_email`
- Looks up the student's `user_id` from the `students` table
- Calls `auth.admin.updateUserById(user_id, { email: new_email })` to change the auth login email
- Updates the `profiles` table email to match
- Updates the `students` table email to match
- All three updates happen together; if auth update fails, nothing changes

### 2. Update `useStudents.ts` → `updateStudentMutation`
- Detect if the email has changed (compare new email vs. existing student email)
- If email changed, call the `update-student-email` edge function **before** the regular student update
- If the edge function fails, abort the update and show an error
- If it succeeds, proceed with the normal student record update (which will also write the new email to the `students` table)

### 3. Files to create/modify

| File | Change |
|------|--------|
| `supabase/functions/update-student-email/index.ts` | **New** — Edge function using service role to update auth email, profiles email, and students email atomically |
| `src/hooks/useStudents.ts` | In `updateStudentMutation`, detect email change and call edge function first |

### Edge Function Logic
```text
Input: { student_id, new_email }

1. Query students table → get user_id, current email
2. If no user_id → error (student has no auth account)
3. If email unchanged → skip, return success
4. auth.admin.updateUserById(user_id, { email: new_email })
5. Update profiles.email where id = user_id
6. Update students.email where id = student_id
7. Return success
```

No password, student data, or other profile information is affected — only the login email changes.

