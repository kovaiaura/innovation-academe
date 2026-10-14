# Make session content always load in the course viewer

## What we know
- Some sessions (e.g. "Battery, Bulb & Switch – Introduction", "Conductors and Insulators", "Open & Closed Circuits") show "No content in this session yet", while the admin course page clearly lists PDFs and videos for them.
- The student/officer viewer loads content for every assigned session of every course in one single request, with no paging. Large requests like this can be silently cut off (row limit) or fail on long lists, which would drop content for some sessions only.
- The live site uses a different database than the preview, so the exact cause can't be read directly from here. The first step is to confirm it on a signed-in screen.

## Fix
1. **Load content reliably**
   - Fetch content per course (by course), in small batches, with paging, so no rows are cut off.
   - Match content to sessions by session ID, and fall back to matching by course + level + session title if a session was re-created (covers copies made by bulk assignment).
2. **Repair bulk assignment gaps**
   - When a class has a course but is missing some session links (from bulk assign), auto-add the missing sessions using the class's lock setting, so new sessions/content appear without re-assigning.
   - Also run this repair once for existing classes from the CEO "Recalculate Progress" action.
3. **Apply everywhere** the course is viewed: student My Courses, officer teaching view, management course view.
4. Keep the "No content in this session yet" line only when the session truly has none.

## Verification
- Build check, then sign in as a student of Kikani Global, open Basic Electronics and confirm all Level 1 sessions list their PDF and video.

## Technical details
- `useClassCourseAssignments.ts`: replace the single `.in('session_id', ids)` content query (student ~line 487, officer ~line 782) with a helper `fetchCourseContent(courseIds)` that queries `course_content` by `course_id`, chunked and paginated with `.range()`; then group by `session_id`, with title-based fallback.
- Add `ensureClassSessionAssignments(classModuleAssignmentId)` that inserts missing `class_session_assignments` rows for sessions in `course_sessions`; call from `BulkAssignCoursesToClassDialog` and the recalculate function.
