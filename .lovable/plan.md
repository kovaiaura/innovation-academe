# Simplify the student dashboard

## Scope
Change only the student dashboard presentation. Keep other student pages, other roles, learning access, academic-year settings, and existing calculations unchanged.

## Changes
- Hide the academic-year dropdown on the student dashboard only; keep it available on other pages. Preserve the existing selected-year filtering rather than changing which records the dashboard uses.
- Keep the personalised welcome, achievement strip, course previews, and existing course actions.
- Remove the lower Recent Assessments, Recent Assignments, Points Breakdown, class leaderboard, streak leaderboard, and full locked-badge list from the dashboard. Their dedicated pages remain unchanged.
- Replace the lower sections with **My badges** and **My class rank**, matching the playful dashboard design.
- Display earned badges with their existing icons, names, and descriptions in a compact, colourful collection. Include a link to the existing achievements page and a friendly empty state.
- Display only the signed-in student's existing class-rank value with a prominent medal-style visual—not other students' rankings. Show an honest unavailable state when there is no rank.
- Keep the existing next-achievement preview beside the courses; do not add rewards or change badge rules.

## Technical details
- Add an optional layout setting to hide the academic-year selector, defaulting to visible, and use it only for the student dashboard, including its loading state.
- Use dashboard-scoped presentation and semantic accent tokens for the new badges and rank section.
- Reuse existing badge and rank data; remove dashboard-only rendering and unused code for discarded sections without changing shared services or calculations.
- No database changes or modifications to assessments, assignments, gamification, or course pages.

## Verification
- Check the signed-in student dashboard for course links, real badges, own rank, and absence of the removed sections and year dropdown.
- Confirm the year dropdown remains on other pages and other roles retain their current layout.
- Check wide and narrow screens for readable badge names and no overlapping content, plus build/runtime signals.
- Explicitly report any authenticated verification limitation.