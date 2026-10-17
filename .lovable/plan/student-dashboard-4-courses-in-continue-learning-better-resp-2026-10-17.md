# Student dashboard: 4 courses in Continue learning + better responsiveness

Only the student dashboard changes; no other pages, roles or course rules.

## What changes
- **Continue learning shows up to 4 courses** (was 2), same order: started courses first, highest progress first.
- **Course cards fit by screen size:**
  - Large desktop: 4 cards in a row, with the achievement panel moved beneath the courses (side-by-side layout) so cards aren't squeezed.
  - Laptop/tablet: 2 per row (2 rows).
  - Phone: 1 per row.
  - Smaller course pictures and tighter text on cards so 4 fit cleanly.
- **Responsiveness fixes for all devices:**
  - Welcome banner: robot picture shrinks/hides on narrow phones, heading scales down, no text overlap.
  - Achievement strip: 4 across on desktop, 2 across on tablet/phone, wrapping long values.
  - Achievement goal + projects box sit side by side on tablet, stacked on phone.
  - "All courses" link stays aligned with the heading on all widths.
  - Badges and class rank section below stacks neatly on phones.

## Technical details
- `DashboardLearningHub.tsx`: `.slice(0, 2)` -> `.slice(0, 4)`; cycle tones across 4 cards.
- `studentDashboard.css`: main grid becomes single column with side panel as a 2-column row beneath; course grid `repeat(auto-fill, minmax(230px,1fr))` capped to 4; add breakpoints at 1280/1024/768/480 for hero, stat strip, side panel, image height; use `clamp()` for heading sizes.
- Verify at 1440, 1024, 768, 390 widths with sample data.
