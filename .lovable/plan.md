
# Plan: Fix New Students Not Appearing in Manual Assessment Edit

## Problem Analysis

When a student is added to a class **after** a manual assessment has been created:
- Opening the assessment's "Edit" dialog shows **only the original students** who had attempts recorded
- The newly added student is **missing** from the edit view
- This prevents entering scores for students who joined the class later

### Technical Root Cause

In `EditManualAssessmentDialog.tsx` (lines 144-183), the logic has a critical flaw:

```text
Current Logic:
IF existing attempts exist (attemptsData.length > 0)
  → Show ONLY students with existing attempts
ELSE
  → Load all students from class
```

The `ELSE` branch only executes when there are **zero** attempts. Once any attempt exists, new students are excluded.

### Required Logic

```text
Corrected Logic:
1. Load ALL current active students from the class
2. Load existing attempts for this assessment
3. MERGE: Students with attempts (show their scores) + Students without attempts (show as new)
```

---

## Solution Overview

Modify the data loading logic in `EditManualAssessmentDialog.tsx` to:
1. Always fetch current students from the class
2. Load existing assessment attempts
3. Merge both lists, preserving existing scores while including new students

---

## Technical Implementation

### File: `src/components/assessment/EditManualAssessmentDialog.tsx`

**Lines 126-183** need to be refactored:

#### Current Code Flow (Problematic)
```typescript
// Line 126-183
const classId = assignmentData?.class_id || selectedClassId;

// Load existing attempts
const { data: attemptsData } = await supabase
  .from('assessment_attempts')
  .select(...)
  .eq('assessment_id', assessment.id);

if (attemptsData && attemptsData.length > 0) {
  // ONLY shows students with attempts - NEW STUDENTS EXCLUDED
  setStudentAttempts(attemptsData.map(...));
} else if (classId) {
  // Only loads class students when NO attempts exist
  const { data: studentsData } = await supabase.from('students')...
  setStudentAttempts(studentsData.map(...));
}
```

#### Updated Code Flow (Fixed)
```typescript
// 1. Always load current students from class
const { data: studentsData } = await supabase
  .from('students')
  .select('id, student_name, user_id')
  .eq('class_id', classId)
  .eq('status', 'active');

// 2. Load existing attempts
const { data: attemptsData } = await supabase
  .from('assessment_attempts')
  .select(...)
  .eq('assessment_id', assessment.id);

// 3. Create a map of existing attempts by student_id
const attemptMap = new Map(
  (attemptsData || []).map(a => [a.student_id, a])
);

// 4. Merge: All students with their attempts (or blank for new students)
const mergedAttempts = (studentsData || []).map(student => {
  const studentUserId = student.user_id || student.id;
  const existingAttempt = attemptMap.get(studentUserId);
  
  if (existingAttempt) {
    return {
      id: existingAttempt.id,
      student_id: studentUserId,
      student_name: student.student_name,
      score: existingAttempt.score,
      passed: existingAttempt.passed,
      notes: existingAttempt.manual_notes || '',
      is_absent: existingAttempt.status === 'absent'
    };
  } else {
    return {
      id: `new-${studentUserId}`,
      student_id: studentUserId,
      student_name: student.student_name,
      score: 0,
      passed: false,
      notes: '',
      is_absent: false
    };
  }
});

setStudentAttempts(mergedAttempts);
```

---

## Related Features Analysis

### Features That Already Work Correctly

| Feature | Access Pattern | Dynamic for New Students? |
|---------|---------------|---------------------------|
| **Courses** | Assigned to class via `course_class_assignments` | Yes - uses `class_id` dynamically |
| **Assignments** | Assigned to class via `assignment_class_assignments` | Yes - uses `class_id` dynamically |
| **Assessments (Student Taking)** | Uses `assessment_class_assignments.class_id` | Yes - new students can take assessments |

### Features Requiring Manual Assignment

| Feature | Access Pattern | Notes |
|---------|---------------|-------|
| **Projects** | Explicit `project_members` table | By design - projects have specific team members |

The core issue is isolated to the **Manual Assessment Edit** dialog only.

---

## Summary of Changes

| File | Change |
|------|--------|
| `src/components/assessment/EditManualAssessmentDialog.tsx` | Refactor `loadData()` to merge current class students with existing attempts |

---

## Expected Outcome

After the fix:
- Opening "Edit" on a manual assessment will show **all current students** in the class
- Students with existing attempts will display their recorded scores
- Newly added students will appear with blank scores (marked as "new")
- Saving will create attempt records for new students and update existing ones
