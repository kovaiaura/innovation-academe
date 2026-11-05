# Student assessment proctoring + copy/paste lock

## What students will experience
1. **Copy/paste disabled for students across the whole platform** — copy, cut, paste, right-click and text selection are blocked on every student page (courses, assessments, assignments, etc.). Typing in normal text boxes (e.g. assignment answers, profile, chat) still works; only paste is blocked there. Other roles (officer, management, CEO) are untouched.
2. **Proctoring while taking an assessment**
   - A short rules screen before starting: "Don't switch tabs, minimise the browser or leave full screen. 3 warnings = auto-submit."
   - Assessment opens in full screen (if the browser allows).
   - Counts a warning when the student: switches tab, minimises/switches app or window, or exits full screen.
   - Warning 1 and 2: a clear red warning popup "Warning 1 of 3 — returning to the test".
   - Warning 3: the assessment is **auto-submitted** with the answers so far, and the student sees "Submitted due to tab switching".
   - A small badge in the test header shows "Warnings: 1/3".
   - Keyboard shortcuts for copy/paste/print/view-source (Ctrl/Cmd+C, V, X, P, U, F12) are blocked during the test.
   - Warning count survives a page refresh (so refreshing doesn't reset it).
3. **Staff visibility** — officers/management see "Tab switches: N" and an "Auto-submitted (proctoring)" tag on the attempt in existing assessment result views.

## What stays the same
Scoring, timer, normal timer-expiry auto-submit, retakes, analytics, certificates and all non-student pages behave exactly as today.

## Technical details
- `src/hooks/useStudentCopyProtection.ts`, mounted once in the student layout only (role check) — listeners for copy/cut/paste/contextmenu/selectstart + CSS `user-select:none` scoped to a student wrapper class; inputs/textareas keep selection but block paste.
- `src/hooks/useAssessmentProctoring.ts` used only in `TakeAssessment.tsx`: `visibilitychange`, window `blur` (debounced ~1s, ignore while our own dialogs open), `fullscreenchange`; keydown blocking; count stored in sessionStorage keyed by attempt id and persisted to DB.
- On 3rd violation call existing `handleSubmit(true)` (existing `submitAttempt(id, true)` path).
- Migration: add `tab_switch_count int default 0` and `proctoring_auto_submitted boolean default false` to `assessment_attempts`; student updates only their own in-progress attempt (existing RLS checked first). SQL also added to `apply-on-your-own-supabase.sql`.
- Show the two fields in the existing attempt results table for staff.
- Note: browsers can't truly detect other apps or AI tools; this is behavioural detection (tab/window/fullscreen), the standard approach.
