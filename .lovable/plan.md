# Show previous-year assessments in Mapping and Analytics

## Goal
When the top-right Academic year is set to Previous, the CEO Mapping dialog (FA1, FA2, Final, Internal) and the Officer/Management Analytics pages should show that year's assessments and marks. When set to Current, they show the current year's.

## What the code does today
- **Mapping dialog:** the assessment dropdowns only list assessments linked to the class that's open now (for example "Grade 1A - 2026-27"). They ignore the selected year and the assessment dates. If last year's tests were linked to last year's classes, or to no class, the dropdown comes up empty. Saved mappings are stored under the year label, but the label passed in can differ from the class's own year (your screenshot shows "2026-27" in the title and "2025-26" in the description).
- **Analytics:** it only counts students and classes marked active, matches mappings and internal marks by the exact year label, and filters attempts by the date they were taken. Last year's work done by students who are now in renamed or new classes, or who are no longer active, drops out. Without a saved mapping for last year, the weighted view is empty.

I couldn't check this against your live data, because the live app runs on your own database. Step 1 confirms the cause before any change.

## Steps
1. **Confirm with your data (read-only):** check which classes last year's assessments are linked to, what dates they have, and what year labels the saved mappings and internal marks use. I'll give you a short check query to run on your database.
2. **Mapping dialog follows the selected year:**
   - The year the dialog uses comes from the top-right selector, and the title and description show the same year.
   - The dropdowns list every assessment of the institution that falls inside the selected year's date range and is linked to this class, or to any class with the same grade. They also list assessments linked to students now in this class. Each option shows its date.
   - Saved previous-year mappings load back correctly. Internal marks open for the selected year too.
3. **Analytics follows the selected year:**
   - For the previous year, include students who took part in that year's attempts, submissions or marks, even if they are inactive now or in a different class. Group them under the class recorded on the attempt.
   - Match year labels in both formats ("2025-26" and "2025-2026").
   - If no mapping is saved for that year, still show plain assessment results (average, pass rate) instead of an empty page, with a note: "No FA/Final mapping saved for this year."
4. **Same fix for Officer and Management:** both pages use the same analytics, so one fix covers both. The Officer page's Assessment Management mapping dialog also gets the selected year.
5. **Tests:** add small tests to confirm that only assessments inside the selected year's date range are picked, and that both year label formats match.

## Not changing
- Grading weights, how marks are calculated, ranking rules, and current-year behaviour.
- No data is moved or rewritten.

## Technical details
- `ClassAssessmentMappingDialog`, `InstitutionClassesTab`, and the officer `AssessmentManagement`: pass `selectedYear` from `useAcademicYear`.
- `useClassAssignedAssessments(classId, range, institutionId)`: union of class assignments, same-grade classes, and assessments whose attempts belong to this class's students, filtered by `start_time`/`created_at` within `selectedRange`.
- `useComprehensiveAnalytics`: drop the `status='active'` filter for historical years, derive the student set from in-range attempts, submissions and marks, and use `.in('academic_year', [short, long])`. Add a fallback path without a mapping.
- Helper `academicYearLabelVariants()` in `utils/academicYear.ts`, with tests.
