

# Bulk Mark Sessions Complete — Officer Teaching

## What You'll Get
A new **"Bulk Mark"** tab inside the officer's class teaching view (alongside Courses, Students, Report). Officers can select multiple sessions across multiple levels of a course, pick students, and mark all selected sessions as completed in one action. Certificate generation triggers automatically just like the normal flow.

## How It Works (User Flow)

1. Officer navigates to **Start Teaching → Select Class**
2. A new **"Bulk Mark"** sub-tab appears next to Courses / Students / Report
3. Officer selects a **course** from a dropdown (courses assigned to this class)
4. The UI shows all **levels and sessions** as a tree of checkboxes — officer ticks whichever sessions to mark complete
5. Below, the **student list** appears with Select All / individual checkboxes
6. Officer clicks **"Mark Selected Sessions Complete"** — all selected sessions are marked done for all selected students
7. Certificate issuance triggers for each completed level (same edge function as today)

## Technical Plan

### 1. New Component: `src/components/officer/BulkMarkCompleteTab.tsx`
- **Course selector**: Dropdown of courses assigned to this class (query `course_class_assignments` + `courses`)
- **Level/Session tree**: For the selected course, fetch `class_module_assignments` → `class_session_assignments` with their content. Render as expandable levels with session checkboxes. Show completion status (already done = disabled + green tick)
- **Student panel**: Fetch students in the class, show checkboxes with Select All
- **Submit handler**: Loop through each selected session and call the existing `markSessionComplete()` from `useSessionCompletion` hook. This ensures:
  - `student_content_completions` records are created
  - `class_session_attendance` records are created
  - Certificate issuance edge function (`issue-completion-certificates`) is triggered per module
- **Progress indicator**: Show a progress bar during bulk operation (e.g., "Completing 3/10 sessions...")

### 2. Modify: `src/pages/officer/CourseManagement.tsx`
- Add a fourth sub-tab `"Bulk Mark"` to the class sub-tabs (next to Courses, Students, Report)
- Render `<BulkMarkCompleteTab classId={...} className={...} />`

### 3. Certificate Flow (No Changes Needed)
The existing `useSessionCompletion.markSessionComplete()` already calls `triggerCertificateIssuance()` which invokes the `issue-completion-certificates` edge function. By reusing this same function per session, certificates will be issued automatically when a level's sessions are all completed — identical to the current single-session flow.

## Files Summary

| File | Change |
|------|--------|
| `src/components/officer/BulkMarkCompleteTab.tsx` | **New** — full bulk mark UI |
| `src/pages/officer/CourseManagement.tsx` | Add "Bulk Mark" sub-tab |

No database changes, no new edge functions — reuses existing completion + certificate infrastructure.

