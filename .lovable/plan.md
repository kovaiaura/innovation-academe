# Playful student dashboard refresh

## Scope
Redesign **only the Student Dashboard** into a more attractive, game-like learning space. Keep the sidebar, academic-year selector, other student pages, other roles, permissions, and existing learning functionality unchanged.

## Design
- Replace the generic introduction with a personalised greeting and a welcoming, playful layout.
- Use bright, balanced accents, course imagery, achievement icons, and subtle motion—not an actual game or new reward system.
- Make learning the main focus, with achievements supporting it rather than seven equally prominent number boxes.
- Keep all existing information available: enrolled courses, overall progress, projects, points, rank, streak, badges, recent results, leaderboards, and points breakdown. Reorganise these into clearer sections without changing their calculations.

## Continue learning
- Show **up to two assigned courses** near the top, with course thumbnail, title, completed/total sessions, progress bar, and a clear action.
- Prioritise unfinished courses with progress; use unstarted courses if fewer than two are underway. Show “Start Learning” for unstarted courses and “Continue Learning” for courses in progress.
- Link directly to the existing course page and include “View all courses”. Do not claim to resume the exact last slide or session.
- Respect existing locked-content access. Handle no courses, all courses completed, missing thumbnails, and loading failures without blank or broken sections.

## Achievement and results layout
- Present streak, earned badges, points, and class rank as a compact achievement strip with stronger visual character.
- Highlight the next existing badge and its real progress; do not invent levels, rewards, deadlines, or XP rules.
- Keep recent assessments and assignments readable, with their current dates, marks, and empty states.
- Place detailed leaderboards and points breakdown lower on the page so courses are visible sooner.

## Technical details
- Reuse `useStudentCourses` and `StorageImage` for course previews, without modifying the shared hook or My Courses page.
- Apply the dashboard’s existing selected academic-year assignment-date range locally to the new previews; retain existing academic-year behaviour for all current metrics.
- Use the existing tenant-aware course links and design-system controls.
- Isolate new presentation in student-dashboard-only components and scoped semantic colour tokens; no global theme or shared layout restyling.
- No database migrations, new gamification logic, progress recalculations, or changes to assessments, certificates, course viewing, or other role dashboards.

## Verification
- Check the student dashboard at wide and narrow widths for readable titles, stable course cards, and no overlapping content.
- Verify with a signed-in student that previews show real assigned courses and progress, course actions open the correct existing page, and the academic-year selector still works.
- Verify existing results, achievement links, and loading/empty states remain usable, and check for build/runtime errors.
- Confirm shared navigation and other role/page styling are unchanged. If authenticated testing is unavailable, explicitly report that limitation rather than claiming it passed.