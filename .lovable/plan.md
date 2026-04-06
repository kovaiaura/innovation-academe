

# Fix: Add Bulk Mark Tab to Officer Tasks Page

## Problem
The "Bulk Mark" tab was added to `src/pages/officer/CourseManagement.tsx`, but the user is actually using the teaching workflow inside `src/pages/officer/Tasks.tsx` — which has its own copy of the class sub-tabs (Courses, Students, Teaching Report) and is missing the Bulk Mark tab.

## Fix

**File: `src/pages/officer/Tasks.tsx`**

1. Import `BulkMarkCompleteTab` from `@/components/officer/BulkMarkCompleteTab`
2. Add a fourth `TabsTrigger` value `"bulk-mark"` labeled "Bulk Mark" to the class sub-tabs (line ~215, alongside Courses, Students, Teaching Report)
3. Add a corresponding `TabsContent` for `"bulk-mark"` rendering `<BulkMarkCompleteTab classId={selectedClassId} className={selectedClassName} />`

This is a 3-line addition to the existing file. The `BulkMarkCompleteTab` component already exists and is fully functional — it just needs to be wired into the Tasks page where officers actually work.

