# Institute-wide academic year selection

## Goal
Make the academic year consistent across every institute page. Each institute’s saved Settings value is the current academic year; users can switch between that current year and the immediately previous year for viewing and managing historical records.

## User-visible changes
- Add one shared academic-year selector to the authenticated institute experience, defaulting to the institute’s saved current year.
- Show the same selected year on dashboard, analytics, assessments, assignments, marks, reports, student views, events, projects, awards/achievements, and related pages.
- Offer clear options such as `2026-27 (Current)` and `2025-26 (Previous)` based on the institute’s configured year, not fixed calendar values.
- Keep the selection scoped to the active institute and preserve it while navigating; changing institute or changing the configured current year resets the selection safely.
- Keep Settings as the only place that changes the institute’s current year. Saving Settings refreshes the shared selector everywhere.
- Make historical-year screens read-only where an existing workflow would otherwise create or edit records tied to the previous year, while retaining full viewing, filtering, analytics, and reporting access.

## Implementation
1. Create a shared academic-year context/hook that:
   - reads `institutions.settings.academic_year` for the active institute;
   - normalizes formats such as `2025-2026` and `2025-26` to one display/query format;
   - derives the previous year from the configured current year;
   - exposes current year, selected year, available years, and a setter;
   - invalidates/refetches year-sensitive queries when the selected year changes.
2. Place the selector in the shared authenticated layout/header so all relevant pages use the same control rather than page-local defaults.
3. Remove hardcoded `2024-25`/`2025-26` defaults from marks, assessment mapping, timetable, student, and management flows; pass the shared selected year into hooks, forms, and services.
4. Add year-aware filtering to assessments, assessment attempts, assignments, assignment submissions, internal marks, weighted analytics, performance metrics, course/session reporting, and student dashboards. Where a table has no explicit year field, use its institute/class assignment or date relationship consistently and document the fallback in code.
5. Extend event, project, award, achievement, and related analytics queries to use the selected year without changing their existing permissions or tenant isolation.
6. Update create/edit controls to write the selected year where the underlying record supports it, and prevent accidental edits/creation in previous-year mode with a clear disabled state or message.
7. Update cache keys and empty/loading states so switching years never displays stale current-year data.
8. Update institute Settings validation and save behavior so the configured current year is the single source of truth and all pages refresh immediately after saving.

## Verification
- Test an institute configured for `2026-27`: every listed page shows `2026-27` initially and offers `2025-26`.
- Switch to the previous year and confirm assessments, assignments, marks, performance, events, projects, awards, dashboards, and reports change together without stale data.
- Save a new current year in Settings and confirm the selector and all dependent pages update consistently.
- Confirm tenant isolation, previous-year read-only behavior, loading/empty states, and no remaining hardcoded academic-year defaults.
- Run the project build and browser checks for selector navigation, query refreshes, and console errors.

## Technical details
- Use the existing institution `settings.academic_year` JSON value; no new database table is required.
- Keep all data access scoped by institute and authenticated user permissions.
- Reuse existing Select/design-system controls and query caching patterns.
