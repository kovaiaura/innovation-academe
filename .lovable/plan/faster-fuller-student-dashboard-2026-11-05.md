# Faster, fuller student dashboard

Scope: student dashboard only. No other pages, roles, or learning/ranking rules change.

## 1. Load quickly
- Show the page right away instead of one full-page spinner: the welcome area and course cards appear first, and each section below shows its own small loading placeholder until its data arrives.
- Fetch everything in one parallel round instead of the current chain of waits (profile, then badges/XP, then weekly points, then rank, then activity counts, then course progress).
- Remove duplicate lookups (profile and student record are each read 2-3 times; a class leaderboard is fetched but never used).
- Course progress loads in the background so it never delays the rest of the page.
- Cache results for a few minutes so returning to the dashboard is instant.

## 2. Balanced layout below the courses
Replace the uneven area (large achievement box beside a near-empty projects strip, badges with a lone rank card) with an even grid:

```text
[ Continue learning: up to 4 course cards                      ]
[ Next achievement ] [ My projects        ] [ Class & institute rank ]
[ This week: XP, streak, sessions ] [ Upcoming: assessments / assignments due ]
[ My badges (earned + next to unlock, full width)              ]
```
- **My projects**: active/completed counts with a link, styled as a full card matching its neighbours.
- **Rank**: compact card with class rank and institute rank, same height as neighbours.
- **This week** (new): XP earned in last 7 days, current streak, small progress hint.
- **Upcoming** (new): next 3 assessments/assignments due for the student's class, with links; friendly empty state.
- **Badges**: earned badges plus locked ones with progress, so the row never looks empty.
- Responsive: 3 columns desktop, 2 tablet, 1 phone; equal card heights.

## Technical details
- Files: `src/pages/student/Dashboard.tsx`, `DashboardLearningHub.tsx`, `DashboardAchievements.tsx`, `studentDashboard.css`, plus new widget components under `src/components/student/dashboard/`.
- Use React Query (per-section queries keyed by user + academic year, `staleTime` ~5 min) and skeleton loaders.
- Upcoming widget reads existing assessments/assignments class assignments, read-only, filtered by the selected academic year range.
- Verify with Playwright at desktop/tablet/phone widths and check build log.
