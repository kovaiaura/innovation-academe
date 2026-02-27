

# Fix: "Unlock All" State Lost in Review Step

## Problem
When selecting "Unlock All" mode in Step 2 of course assignment, the review step (Step 3) shows all levels and sessions as "Locked" instead of "Unlocked."

## Root Cause
In `AssignCourseToClassDialog.tsx`, the `useEffect` that initializes module configs (lines 83-108) includes `globalUnlockMode` in its dependency array. When the user picks "Unlock All":

1. `applyGlobalUnlockMode('unlock_all')` correctly sets all modules/sessions to `isUnlocked: true`
2. But the `useEffect` re-runs because `globalUnlockMode` changed in its dependency array
3. It **reinitializes** all configs with default logic: only first module/session unlocked, wiping out the unlock state

## Fix

**File:** `src/components/institution/AssignCourseToClassDialog.tsx`

1. **Remove `globalUnlockMode` from the `useEffect` dependency array** (line 108) so changing the unlock mode doesn't reinitialize all configs.

2. **Apply the global unlock mode during initialization** -- inside the `useEffect`, use the current `globalUnlockMode` value to set the initial unlock state:
   - If `globalUnlockMode === 'unlock_all'`, set all modules and sessions to `isUnlocked: true`
   - Otherwise, keep the existing default (first item unlocked)

This is a single-line dependency array fix plus a small conditional inside the existing initialization logic. No new files needed.

## Technical Detail

```text
Before (line 108):
  }, [selectedCourse, globalUnlockMode, existingAssignmentData]);

After:
  }, [selectedCourse, existingAssignmentData]);
```

The `applyGlobalUnlockMode` function already handles updating all module configs when the mode changes -- the `useEffect` should only run when the course selection changes, not when the unlock mode changes.

