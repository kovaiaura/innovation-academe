

# Plan: College Internal Assessment as Mapped Assessment (Not Manual Marks)

## Problem
For colleges, the Internal Assessment (40%) should be a **selectable assessment** (picked from a dropdown, like Final Assessment), not manually entered marks as it is for schools. Currently, the `class_assessment_mapping` table has no `internal_assessment_id` column — schools use the `internal_assessment_marks` table for manual entry, but colleges need an actual assessment mapped.

## Changes

### 1. Database Migration
Add `internal_assessment_id` column to `class_assessment_mapping`:
```sql
ALTER TABLE class_assessment_mapping 
ADD COLUMN internal_assessment_id UUID REFERENCES assessments(id) ON DELETE SET NULL;
```

### 2. `src/components/assessment/ClassAssessmentMappingDialog.tsx`
- Add state for `internalId` (new assessment dropdown)
- For colleges: replace the "Internal marks entered separately" note with a **dropdown to select an Internal Assessment** (same style as Final Assessment dropdown)
- On save: include `internal_assessment_id: isCollege ? internalId : null`
- For schools: keep the existing manual marks note unchanged

### 3. `src/hooks/useComprehensiveAnalytics.ts`
- For colleges: instead of reading from `internal_assessment_marks`, look up `mapping.internal_assessment_id` and find the student's attempt for that assessment
- Convert that attempt's score into the 40% weighted internal score using `calculateCollegeWeightedScore`
- Update `calculateCollegeWeightedScore` call to accept an `AssessmentAttempt` for internal instead of manual marks

### 4. `src/utils/assessmentWeightageCalculator.ts`
- Update `calculateCollegeWeightedScore` to accept `internalAttempt: AssessmentAttempt | null` instead of `internalMarks: { obtained, total }` — using the same attempt-based calculation as final

### 5. `src/components/analytics/WeightedAssessmentView.tsx`
- For colleges: fetch `internal_assessment_id` from the mapping and look up student attempts for it (instead of `internal_assessment_marks`)

### 6. `src/hooks/useClassAssessmentMapping.ts`
- Include `internal_assessment_id` in the mapping query/save/upsert logic

