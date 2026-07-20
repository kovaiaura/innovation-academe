# Link Class Attendance to Course Curriculum Progress

Today the officer's **Class Attendance** page only marks students present/absent for a timetable slot and toggles `is_session_completed` on `class_session_attendance`. It does not tell the system *which* curriculum session was actually taught, so course progress for that class stays untouched unless the officer separately goes into Bulk Mark Complete.

We'll add a Course → Level (Module) → Session picker into the same page, and when the officer clicks **Mark Session Completed**, we'll also mark that specific curriculum session complete for the students who are Present/Late — reusing the exact same `markSessionComplete` flow that Bulk Mark Complete uses.

## UX

Inside the existing "Select Date & Class Session" card (after a timetable session is chosen), show three cascading dropdowns:

1. **Course** — populated from `course_class_assignments` for the selected class.
2. **Level (Module)** — populated from `class_module_assignments` for that course, ordered by `unlock_order`.
3. **Session** — populated from `class_session_assignments` for that module, ordered by `unlock_order`. Sessions already completed for the whole class are shown with a "✓ Completed" tag.

Selections are optional. If nothing is selected, the page behaves exactly as today (attendance-only). If a session is selected, the primary button changes from "Mark Session Completed" to **"Save Attendance & Mark Session Completed"** and does both actions in one click.

Persist the last selection per timetable slot in local component state so switching between periods keeps context.

## Behavior on "Save Attendance & Mark Session Completed"

1. Save the attendance rows (unchanged).
2. Mark the `class_session_attendance` row as completed (unchanged).
3. **New:** If a curriculum Session is selected, call `markSessionComplete(sessionId, presentStudentIds, courseAssignmentId, classId, timetableAssignmentId, moduleId, courseId)` from `useSessionCompletion`, where `presentStudentIds` = students whose status is `present` or `late`. Absent students are excluded so their progress is not falsely credited.
4. Show one consolidated toast: "Attendance saved. Session '<title>' marked complete for N students."

If the session was already fully complete for the class, still call the hook (it's idempotent) but suppress the duplicate toast via `{ silent: true }` and surface a lighter "Session already up to date" message.

## Guardrails

- Course/Level/Session selectors are cleared whenever the timetable session or date changes.
- If `course_class_assignments` returns zero rows for the class, hide the picker and show a small hint: "No course assigned to this class yet."
- Only sessions whose module `is_unlocked = true` are enabled in the dropdown; locked ones are shown greyed-out with a "Locked" tag so officers know why they can't pick them.
- Only officers who have access to that timetable slot (primary / secondary / backup / delegated — already computed) can mark completion; no change to permissions.

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/officer/Attendance.tsx` | Add Course/Level/Session state + three `Select`s inside the existing selector card. Extend `handleMarkSessionCompleted` to call `markSessionComplete` for present+late students when a session is selected. Update button label + toast copy. |

## Technical Details

- Data sources are the same tables Bulk Mark Complete already uses: `course_class_assignments`, `class_module_assignments` (+ `course_modules`), `class_session_assignments` (+ `course_sessions`).
- Queries are gated by `enabled: !!classId` / `!!courseAssignmentId` / `!!moduleAssignmentId` so they don't fire until each parent selection is made.
- Reuse the shared `useSessionCompletion` hook — no new completion logic. This ensures the fix flows into every analytics view (student dashboard, class, institution, CEO) that we already wired to session-based progress.
- No schema changes, no new migrations, no changes to the CEO / management "Class Session Attendance" monitor tab.
