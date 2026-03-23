

# Fix: Reorder Sessions Dialog Shows Empty

## Root Cause
In `ReorderSessionsDialog.tsx`, `orderedSessions` starts as `[]`. The component tries to populate it inside `handleOpenChange`, but that callback only fires when the Dialog *itself* triggers a change (e.g., closing). When the parent sets `open=true`, the Dialog renders but `handleOpenChange` is never called, so sessions remain empty.

## Fix
**File: `src/components/course/ReorderSessionsDialog.tsx`**

Replace the `handleOpenChange` approach with a `useEffect` that watches the `open` prop. When `open` becomes `true`, copy and sort the `sessions` prop into local state.

```tsx
useEffect(() => {
  if (open) {
    setOrderedSessions(
      [...sessions].sort((a, b) => a.display_order - b.display_order)
    );
  }
}, [open, sessions]);
```

Remove the custom `handleOpenChange` wrapper and pass `onOpenChange` directly to the Dialog.

Single file change, ~5 lines modified.

