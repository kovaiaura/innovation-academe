# Course outcomes: learning and understanding

## Goal
Redesign Course Outcomes for students, officers, management, and CEO/admin users with a friendly, phone-ready layout and useful insights combining **learning completion** and **assessment accuracy**. Keep these measures separate and leave other pages and learning rules unchanged.

## New experience
- Replace the oversized bar chart and separate empty summary boxes with an unframed overview, compact summary metrics, and a searchable course collection.
- Each course shows its name, a recognizable topic icon, completed/allocated sessions, assessment accuracy, and correct/answered question counts. Courses without assessment evidence say **Not assessed yet**, not 0%.
- Offer course sorting by name, completion, or assessment accuracy, plus filters for all courses and courses needing attention.
- Open a course to inspect its levels/modules and sessions, with completion and assessment results side by side. Long titles wrap cleanly; phone layouts stack without sideways scrolling.
- Use a cheerful but restrained visual style: clear typography, distinct semantic accents, compact progress indicators, and accessible labels rather than relying on red/green alone.

## Useful, evidence-based insights
- Students see **Strong topics**, **Topics to revisit**, and an actionable next learning session where the existing course access rules allow it.
- Officers and management see the selected group's strong topics, revision priorities, average student completion, and the number of students and answers represented.
- CEO/admin users retain institution and class selection with the same shared presentation and aggregate insights.
- Recommendations come from real mapped assessment results and incomplete allocated sessions—not generated claims. Small answer samples display their counts so 100% from one answer does not imply proven mastery.
- Never call a course weak merely because it is incomplete, and never present completion as understanding. Preserve existing assessment scoring and outcome thresholds; make labels consistent.

## Scope and year selection
- Preserve student-only visibility and institutional isolation, along with existing role-specific institution/class/student filters.
- Keep the academic-year selector on Course Outcomes. Assessment evidence follows the assessment's activity date within the institute's configured year dates.
- Completion remains the existing cumulative progress for courses allocated to the selected scope, clearly labelled as such; selecting a year must not erase earlier completed sessions.
- For CEO/admin views, resolve year dates from the chosen institution. Across all institutions, use each institution's configured current/previous period rather than one unrelated default calendar.

## Technical details
- Rework the shared outcomes presentation into focused summary, course-item, insight, and drill-down components, with role-aware wording and page-scoped semantic tokens.
- Extend the read-only outcomes data model to include allocated courses even when they have no mapped assessment answers, and provide session completion alongside assessment evidence.
- Reuse the shared session-based progress rules, including officer-marked completions; do not use the older content-only performance calculation or change progress/certificate writes.
- The current outcomes hook aggregates mapped answers and does not receive year dates. Add explicit scope/year inputs, completed-attempt filtering, stable cache keys, error handling, paginated reads, and batched identifiers to avoid truncated results.
- Resolve auth student IDs and internal student record IDs explicitly for their respective data sources. Wait for valid student/institution scope before fetching.
- Use local, read-only query composition; no new tables, migrations, AI service, or changes to grading, badges, certificates, attendance, or course unlocking are planned.
- Keep student dashboard styling isolated; record the shared Course Outcomes presentation boundary in the architecture rules.

## Verification
- Test aggregation, no assessment evidence, small samples, officer-marked completion, and current/previous year boundaries.
- Verify course search/sorting, filter resets, course expansion, and permitted learning links.
- Check real signed-in student and staff/admin views where sessions are available, including an assessed course and an officer-completed session; report any access or external-database blockers rather than claiming unverified results.
- Check desktop and narrow phone screens for long titles, loading/empty/error states, keyboard access, and no horizontal overflow.

## Not included
Changes to other dashboards, new ranking formulas, historical trend charts, assessment retake/deletion rules, or corrections to unrelated marks and XP calculations.