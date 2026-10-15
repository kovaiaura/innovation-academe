# Student Projects: compact cards and on-demand details

## Scope
Refresh **My Innovation Projects**, the student page shown in your screenshot. Other roles and pages keep their current appearance and functionality.

## Design
- Replace the long, full-width project summaries with a compact grid: one card per row on phones, two on medium screens, and three where space allows.
- Each card shows the project title, status, a short description, progress, category, team size, and relevant leader/showcase badges. Use restrained accent colors and a project icon rather than invented project photos.
- Keep card actions aligned and ensure long titles and descriptions fit without overflowing.
- Move the full description, member list, mentor information, SDG goals, achievements, certificate links, and update history into the details view.

## Selection and details
- Selecting a card or its **View Details** action opens that project's full details.
- Reuse the existing project details dialog, which already presents team members, achievements, and the progress timeline.
- Make the student details presentation comfortable on phones, with wrapping headings, readable sections, scrolling, and an accessible close action.
- Support keyboard selection and visible focus; closing details returns the student to the project grid.

## Preserve existing behavior
- Keep the academic-year dropdown, project visibility, student membership checks, progress values, certificate access, and project ordering unchanged.
- Match loading placeholders to the new card layout and retain the existing no-project state.
- Do not add editing, new filters, or changes to project progress calculations.

## Technical approach
- Keep the card presentation scoped to the student Projects page and use semantic design tokens and existing controls.
- If the shared details dialog needs student-specific layout adjustments, enable them through an optional presentation prop with its current appearance as the default for other roles.
- Leave the existing project queries and permissions untouched.

## Verification
- Check single and multiple projects, long titles, missing optional information, loading, and empty states.
- Verify card selection, full details, closing, keyboard operation, and certificate actions.
- Check desktop and phone layouts for overflow and confirm other roles retain the default details presentation.
- Attempt real signed-in verification; explicitly report any account-access blocker rather than treating sample checks as live verification.