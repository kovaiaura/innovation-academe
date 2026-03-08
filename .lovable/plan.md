

# Plan: Auto-sync Project Status ↔ Progress + Fix Active Projects Count

## Problem Summary

1. **No auto-sync between status and progress**: When an officer creates a project or updates progress, status and progress are independent — they should be linked.
2. **Active Projects always shows 0** in Management Dashboard: The query filters by `status = 'active'` but valid statuses are `yet_to_start`, `ongoing`, `completed`. There is no `active` status.

## Changes

### 1. Auto-sync on project creation (`useCreateProject` in `src/hooks/useProjects.ts`)

When creating a project, auto-set progress and initial remark based on status:
- **`yet_to_start`** → `progress: 0` (default, no change needed)
- **`ongoing`** → `progress: 1`, auto-insert a progress update with remark "Started"
- **`completed`** → `progress: 100`, auto-insert a progress update with remark "Completed"

### 2. Auto-sync on progress update (`useAddProgressUpdate` in `src/hooks/useProjectProgress.ts`)

When progress is updated:
- If `0 < progress < 100` → auto-update project `status` to `ongoing`
- If `progress === 100` → auto-update project `status` to `completed`
- If `progress === 0` → auto-update project `status` to `yet_to_start`

This means after the existing `.update({ progress })` call, also update `status`.

### 3. Fix Active Projects count in Management Dashboard (`src/hooks/useInstitutionStats.ts`, line 150)

Change:
```ts
.eq('status', 'active')
```
To:
```ts
.eq('status', 'ongoing')
```

### 4. Fix Officer Dashboard active projects (`src/hooks/useOfficerDashboardData.ts`, line 261)

Already queries `in('status', ['in_progress', 'ongoing', 'submitted'])` — this includes `ongoing` so it should work. But `in_progress` and `submitted` aren't real statuses either. Clean up to just `ongoing`.

### Files Modified
- `src/hooks/useProjects.ts` — Add progress/remark auto-set on creation
- `src/hooks/useProjectProgress.ts` — Add status auto-update on progress change
- `src/hooks/useInstitutionStats.ts` — Fix active projects query (`ongoing` not `active`)
- `src/hooks/useOfficerDashboardData.ts` — Clean up status filter

