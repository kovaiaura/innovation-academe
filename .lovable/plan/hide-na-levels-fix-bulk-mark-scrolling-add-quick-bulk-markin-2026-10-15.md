# Hide "NA" levels, fix Bulk Mark scrolling, add Quick Bulk Marking

## 1. Hide levels named "NA" (students and management)
- Any level/module whose title is just "NA" (case-insensitive, ignoring spaces, also "N/A") is hidden in student and management course views (course list/detail, course viewer sidebar, learning timeline, course outcomes, curriculum).
- Nothing is deleted; officer and CEO screens still show them, so they can be managed.
- A shared helper decides "is NA" so all screens behave the same.

## 2. Bulk Mark: scrolling and layout (officer)
- Levels & Sessions and Students panels get a real scrollable area of fixed height so every level and student can be reached (current scroll box doesn't scroll because it has no fixed height).
- "NA" levels hidden here too, and empty levels (0 sessions) shown dimmed at the bottom.
- Sticky header per panel with counts ("12 sessions selected", "Select all") and the Mark button kept visible at the bottom.
- Works on phone sizes (panels stack).

## 3. Quick Bulk Marking
- New "Quick bulk marking" card at the top of Bulk Mark: choose "Mark complete till Level N" (list of level numbers by order), date, and students (default all).
- Applies to every course assigned to this class: all sessions in levels 1..N (by unlock order, skipping "NA" levels) are marked complete for the chosen students.
- Confirmation dialog shows a preview: courses affected, sessions to mark, sessions already marked (skipped).
- Uses the existing session-completion logic, so progress, dashboards and duplicate-mark protection behave exactly like normal marking. Progress bar while running, summary at the end.

## Technical details
- Helper `isNotApplicableTitle()` in `src/utils/courseHelpers.ts`; filter in management/student course components only.
- `BulkMarkCompleteTab.tsx`: replace `ScrollArea max-h` with `h-[420px]` (or `max-h` + native `overflow-y-auto`), new `QuickBulkMarkCard` component that fetches module/session assignments for all class course assignments and loops `markSessionComplete` with `{ silent: true, date }`, skipping sessions already in `class_session_completions`.
- No database changes.
