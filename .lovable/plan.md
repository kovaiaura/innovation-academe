

# Plan: Add College Assessment Weightage System

## What's Needed

1. **New "College Assessment Weightage" tab** in About IMS showing the college formula: Internal Assessment (40%) + Final Assessment (60%) — per semester, 2 assessments only.
2. **Rename existing tab** to "School Assessment Weightage" for clarity.
3. **Institution-type-aware calculation logic** — when an institution's `type` is `'college'`, use college weightage (40/60) instead of school weightage (20/20/40/20).
4. **Update the assessment mapping** — colleges don't use FA1/FA2, only Internal + Final.

## Changes

### File 1: New `src/components/about-ims/CollegeAssessmentWeightageTab.tsx`
Create a new tab component (same visual style as `AssessmentWeightageTab`) showing:
- Two cards: Internal Assessment (40%) and Final Assessment (60%)
- Visual bar: 40% orange + 60% purple
- Formula: `Total = (Internal% × 0.40) + (Final% × 0.60)`
- Example calculation table with 2 rows
- Notes about per-semester structure (2 assessments per semester)

### File 2: `src/pages/AboutIMS.tsx`
- Add a 4th tab: "College Assessment Weightage" with a `GraduationCap` icon
- Rename existing "Assessment Weightage" to "School Assessment Weightage" (with `School` icon)

### File 3: `src/utils/assessmentWeightageCalculator.ts`
- Add `COLLEGE_WEIGHTAGE = { INTERNAL: 0.40, FINAL: 0.60 }`
- Add `calculateCollegeWeightedScore(finalAttempt, internalMarks)` function
- Add college label helpers
- Keep existing school functions unchanged

### File 4: `src/components/analytics/WeightedAssessmentView.tsx`
- Accept institution `type` prop (pass from parent)
- When `type === 'college'`: use college weightage, hide FA1/FA2 columns, show only Internal + Final columns

### File 5: `src/hooks/useComprehensiveAnalytics.ts`
- Fetch institution `type` alongside other data
- Pass `type` through to ranking calculations
- When college: use `calculateCollegeWeightedScore` instead of `calculateWeightedScore`

### File 6: `src/hooks/useClassAssessmentMapping.ts`
- For college institutions, only `final_assessment_id` is used from the mapping table (FA1/FA2 ignored)
- Internal marks remain from `internal_assessment_marks` table (same as school)

## Summary

| File | Action |
|------|--------|
| `src/components/about-ims/CollegeAssessmentWeightageTab.tsx` | Create — college formula display |
| `src/pages/AboutIMS.tsx` | Modify — add College tab, rename School tab |
| `src/utils/assessmentWeightageCalculator.ts` | Modify — add college weightage constants + calculator |
| `src/components/analytics/WeightedAssessmentView.tsx` | Modify — branch display by institution type |
| `src/hooks/useComprehensiveAnalytics.ts` | Modify — fetch institution type, use correct calculator |
| `src/hooks/useClassAssessmentMapping.ts` | Modify — college-aware mapping logic |

