

# Plan: Fix Achievement XP = 0 and Add Recalculation Progress Dialog

## Root Cause Analysis

### Achievement XP showing 0 despite badge being allocated

The database has a **UNIQUE constraint** on `student_xp_transactions(student_id, activity_type, activity_id)`. During recalculation:

1. **Badges work** because `checkAndAwardBadges()` counts from source tables (`project_achievements`) directly — it never depends on XP transactions.
2. **Achievement XP fails** because:
   - The DB trigger (if active) uses `NEW.id` (achievement UUID) as `activity_id`
   - The JS recalculation code uses `${projectId}_${title}` as `activity_id`
   - The `awardXPDirect` method **silently swallows errors** (line 1288: just `console.error`, no throw)
   - If the trigger already inserted rows before recalculation's delete runs, or if there are any FK/constraint issues, the XP insert fails silently

Additionally, the real-time `awardProjectAwardXP` also uses `${projectId}_${awardName}` as activity_id, which is inconsistent with the DB trigger's format.

## Changes

### 1. Fix `gamification-db.service.ts` — Achievement XP

- Change `awardXPDirect` to use `upsert` with `onConflict: 'student_id,activity_type,activity_id'` instead of plain insert, so it never fails silently on duplicates.
- Standardize achievement `activity_id` to use the achievement record `id` from `project_achievements` table (consistent with the DB trigger).
- In the recalculation loop, use `ach.id` instead of `${ach.project_id}_${ach.title}`.
- Update `awardProjectAwardXP` to also accept and use the achievement ID.

### 2. Fix `useProjectAchievements.ts` — Real-time XP award

- Pass the achievement record ID (returned from the insert) to `awardProjectAwardXP` instead of composing `${projectId}_${title}`.

### 3. Add Recalculation Progress Dialog in `GamificationManagement.tsx`

- Replace the inline `recalculateStatus` text with a **Dialog/modal** that opens when recalculation starts.
- Show:
  - Current step name (e.g., "Clearing existing data...", "Processing students...")
  - Progress bar based on student count (parse progress messages for `X/Y` pattern)
  - Summary stats when complete (students processed, XP awarded, badges awarded)
- Dialog closes on user action after completion.

### 4. Update progress callback format in `_recalculate`

- Change progress callback to include structured data: `{ step, current, total, message }` so the UI can render a proper progress bar.

## Files Modified
- `src/services/gamification-db.service.ts` — fix `awardXPDirect`, fix achievement activityId, structured progress callback
- `src/hooks/useProjectAchievements.ts` — pass achievement ID to XP award
- `src/pages/system-admin/GamificationManagement.tsx` — progress dialog with bar

