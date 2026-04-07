

# Fix: Bulk Mark Session Selection Not Working

## Root Cause

Two issues in `BulkMarkCompleteTab.tsx` prevent session selection:

1. **Invalid `indeterminate` prop**: The module-level `Checkbox` uses `indeterminate={...}` with `@ts-ignore`. Radix UI Checkbox doesn't accept `indeterminate` as a prop — the correct API is `checked="indeterminate"`. The invalid prop gets spread into the DOM element and may interfere with state handling.

2. **`onClick stopPropagation`**: The `onClick={(e) => e.stopPropagation()}` on the Checkbox can interfere with Radix's internal pointer/click event chain, preventing `onCheckedChange` from firing reliably.

## Fix

**File: `src/components/officer/BulkMarkCompleteTab.tsx`**

Replace the module-level Checkbox (around line 289-294):

```tsx
// Before (broken)
<Checkbox
  checked={allSelected}
  // @ts-ignore
  indeterminate={someSelected && !allSelected}
  onCheckedChange={() => toggleAllSessionsInModule(mod.id, sessionAssignments)}
  onClick={(e) => e.stopPropagation()}
/>

// After (fixed)
<Checkbox
  checked={allSelected ? true : (someSelected ? "indeterminate" : false)}
  onCheckedChange={() => toggleAllSessionsInModule(mod.id, sessionAssignments)}
/>
```

Key changes:
- Use `checked="indeterminate"` (the correct Radix API) instead of an invalid `indeterminate` prop
- Remove `onClick stopPropagation` — it's not needed since the Checkbox is outside `CollapsibleTrigger`, and it interferes with `onCheckedChange`

Single line change, single file.

