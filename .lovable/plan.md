

# Fix: Exclude Students from Attendance Reminder Emails

## Problem
The `send-attendance-reminder` Edge Function queries the `profiles` table for staff reminders but doesn't filter out students. Any profile with a `check_in_time` set (including students) receives check-in/check-out reminder emails.

## Solution
Add a filter to the staff profiles query to exclude users who have a student role. Students have a `user_roles` entry with `role = 'student'`. The simplest approach: join against `user_roles` to only include users with staff-relevant roles (officer, management, system_admin, super_admin), or exclude profiles that are linked to the `students` table.

### File to Modify
`supabase/functions/send-attendance-reminder/index.ts`

### Change (lines ~273-277)
Current query fetches ALL profiles with a `check_in_time`:
```typescript
const { data: staffProfiles } = await supabase
  .from("profiles")
  .select("id, name, email, check_in_time, check_out_time, enable_notifications")
  .not("email", "is", null)
  .not("check_in_time", "is", null);
```

Updated query will exclude students by checking `user_roles`. Since the Supabase JS client can't easily do a NOT EXISTS subquery, we'll:
1. First fetch all student user IDs from `user_roles` where `role = 'student'`
2. Then filter them out of the staff profiles query using `.not('id', 'in', studentIds)`

Alternatively (and more efficiently), we can use an RPC or simply filter in-code: after fetching profiles, check each profile's roles and skip students.

**Chosen approach**: Filter in application code after fetch — query `user_roles` for student role user IDs, then skip those profiles in the loop. This is the least disruptive change.

```typescript
// Fetch student user IDs to exclude
const { data: studentRoles } = await supabase
  .from("user_roles")
  .select("user_id")
  .eq("role", "student");
const studentUserIds = new Set((studentRoles || []).map(r => r.user_id));

// In the staff loop, add:
if (studentUserIds.has(profile.id)) continue;
```

This ensures only actual staff members (not students) receive attendance reminder emails. The officer section (processed per-institution from the `officers` table) is unaffected since it already only queries officers.

