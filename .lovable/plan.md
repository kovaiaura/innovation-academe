

# Plan: Fix Gamification XP/Badge Distribution and Student Points Detail

## Issues Identified

1. **XP not showing correctly in student breakdown**: `getCategorizedBreakdown()` maps `project_award` to "achievements" category but both project membership and project award XP are sourced correctly. The student with 2 projects (200 XP) + 1 award (200 XP) = 400 XP + 2 daily login = 402 XP. Dashboard shows 200 under "Projects" only — the award XP (200) should show under "Achievements" but likely the award XP transaction wasn't created automatically (only on recalculate). Need to verify the `awardProjectAwardXPToMembers` is only called for `type === 'award'` achievements, but many achievements may be of other types.

2. **Badges only awarded on recalculation**: `awardXP()` calls `checkAndAwardBadges()` which should trigger automatically. But the issue is that `checkAndAwardBadges` queries `gamification_badges` table, which only gets populated during `seedBadgeDefinitions()` in `recalculateAllXPAndBadges`. If badges haven't been seeded yet, no badges exist to check against. Need to auto-seed badges on first check.

3. **Recalculation limited to 1000 students**: `recalculateAllXPAndBadges` fetches students via `supabase.from('students').select(...)` which hits the default 1000-row limit. Need paginated fetch.

4. **Total Students count wrong (484 vs 1611)**: `getGamificationStats()` counts unique students from `student_xp_transactions` (only students with XP), not from the `students` table. Should use actual student count.

5. **Points breakdown lacks detail**: Currently shows category totals only (e.g., "Projects: 200 pts"). User wants to see which specific projects, awards, assessments, assignments contributed.

## Changes

### 1. Fix badge auto-seeding (`gamification-db.service.ts`)
- In `checkAndAwardBadges()`, if `allBadges` is empty, call `seedBadgeDefinitions()` first then re-fetch. This ensures badges are available without manual recalculation.

### 2. Fix XP award for all achievement types (`useProjectAchievements.ts`)
- Currently only awards XP when `input.type === 'award'`. Change to award XP for all achievement types (`award`, `participation`, `achievement`) since they all represent project awards/recognition.

### 3. Fix 1000-row limit in recalculation (`gamification-db.service.ts`)
- Replace single `.select()` for students with paginated fetch using `.range()` loop (same pattern used in `useStudents.ts`).
- Also fix `getGamificationStats()` to count students from the `students` table using `{ count: 'exact', head: true }`.
- Fix `getLeaderboard()` which also fetches all `student_xp_transactions` without pagination.

### 4. Add institution-wise recalculation (`gamification-db.service.ts` + `GamificationManagement.tsx`)
- Add `recalculateForInstitution(institutionId)` method that only processes students from one institution.
- Add institution selector + "Recalculate for Institution" button in the CEO Gamification Overview tab.

### 5. Detailed points breakdown in student Gamification page (`Gamification.tsx`)
- Fetch XP transactions with `activity_id` and `description` fields.
- For each category, show expandable detail: project names, award names, assessment names, assignment names.
- Query `projects`, `assessments`, `assignments` tables to resolve `activity_id` to human-readable names.

### 6. Fix student Dashboard points consistency
- The Dashboard and Gamification page both use `getCategorizedBreakdown()` which is correct. The real issue is that XP transactions aren't being created for awards (issue #2 above fixes this).

## Files Modified
- `src/services/gamification-db.service.ts` — paginated student fetch, auto-seed badges, institution recalculation, fix stats count
- `src/hooks/useProjectAchievements.ts` — award XP for all achievement types, not just 'award'
- `src/pages/system-admin/GamificationManagement.tsx` — institution-wise recalculation UI, fix stats display
- `src/pages/student/Gamification.tsx` — detailed points breakdown with activity names

