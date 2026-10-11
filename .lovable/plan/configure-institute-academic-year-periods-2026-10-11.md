# Configure Institute Academic-Year Periods

## User outcome
CEO/system-admins can configure the active and previous academic years independently for each institute, including each displayed label and exact start/end dates. Activities are grouped into whichever configured date interval contains their relevant activity date, and selecting a year updates dashboards and reports consistently.

## Plan
1. Add an Academic Year tab to the institute detail screen, with editable labels and start/end dates for current and previous years; save both periods in the institute's existing settings and retain safe defaults for older institutes.
2. Extend the academic-year context and shared date-range utility to expose the selected institute-specific range, and refresh dependent queries when settings change.
3. Update date-based filters in analytics, assessments, assignments, projects, events, awards, and student views to consume that selected range; pass the configured range through shared service calls.
4. Replace stale hardcoded year defaults in assessment mappings and internal marks with the selected year where those screens support it.
5. Check the preview build log and review the final changes; record any out-of-scope items in the roadmap.

## Technical details
- Keep configuration in `institutions.settings` JSON; no database schema changes.
- Store explicit start/end calendar dates per year label; treat the end date as exclusive in filters (the UI will make the chosen end date inclusive by storing the following day's boundary).
- Use each record type's existing activity date, such as assessment start time, assignment start date, submission time, project creation time, or event start time. Records outside both configured periods remain outside these two selected views.
- Leave class/timetable year tags intact; they represent explicit academic-year assignments rather than activity-date filters.
