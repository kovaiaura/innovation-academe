

# Plan: Include Officers in Individual Controls

## Problem
The `IndividualProfileControls` component queries profiles with `.not('position_id', 'is', null)`, filtering to only users who have a `position_id`. Officers typically don't have a `position_id` set (they're tracked via `officer_assignments`), so they're excluded from the list.

## Fix: `src/components/settings/IndividualProfileControls.tsx`

Change the data fetching strategy:

1. **Remove the `position_id` filter** — instead, fetch profiles that are either staff (have a `position_id`) OR officers (have an `officer` role in `user_roles`).
2. **Two-step approach**:
   - First fetch all user_roles for `system_admin`, `officer`, and `management` roles to get relevant user IDs.
   - Then fetch profiles for those user IDs (no `position_id` filter needed).
   - This ensures officers appear in the list alongside staff.
3. **Display**: Officers will show their role as "Officer" via the role badge. Position column will show their designation or "-" if none.

### Single file change
Only `src/components/settings/IndividualProfileControls.tsx` needs modification — update the `queryFn` to:
- Fetch all roles first (for `system_admin` and `officer` at minimum)
- Use those user IDs to query profiles (removing the `.not('position_id', 'is', null)` filter)
- This captures both staff with positions and officers without positions

