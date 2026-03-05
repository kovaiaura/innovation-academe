

# Plan: Make Assessment Mapping Dialog College-Aware

## Problem
The `ClassAssessmentMappingDialog` always shows the school-style layout (FA1 20%, FA2 20%, Final 40%, Internal 20%) regardless of institution type. For college-type institutions, it should show only Internal Assessment (40%) and Final Assessment (60%).

## Changes

### File 1: `src/components/assessment/ClassAssessmentMappingDialog.tsx`
- Add `institutionType?: string` prop
- When `institutionType === 'college'`:
  - Show 2-column weightage grid (Internal 40%, Final 60%) instead of 4-column (FA1/FA2/Final/Internal)
  - Hide FA1 and FA2 dropdowns entirely
  - Show only Final Assessment (60%) dropdown
  - Change Internal note to say "Internal Assessment (40%) marks are entered separately..."
  - On save, pass `fa1_assessment_id: null` and `fa2_assessment_id: null`

### File 2: `src/components/institution/InstitutionClassesTab.tsx`
- Add `institutionType?: string` prop
- Pass it through to `ClassAssessmentMappingDialog`

### File 3: Parent that renders `InstitutionClassesTab`
- Pass the institution's `type` field down as `institutionType`

### File 4: `src/pages/officer/AssessmentManagement.tsx`
- Fetch the officer's institution type
- Pass it to `ClassAssessmentMappingDialog`

This ensures colleges only see and map Internal (40%) + Final (60%), while schools keep the existing FA1/FA2/Final/Internal layout.

