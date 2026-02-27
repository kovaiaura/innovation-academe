

# Revamp Course Outcome Analytics

## Overview

Three key changes to the Course Outcome system:
1. Course mapping in questions should only show courses/levels/sessions that are **allocated to the assessment's target class** and only sessions **marked as completed**
2. Course outcomes should appear **immediately** after a student submits their assessment (not waiting for the assessment window to close)
3. Students who don't attempt the assessment within the time limit should be automatically marked as **absent**

---

## Change 1: Filter Course Mapping by Allocated & Completed Sessions

**Current behavior:** The `CourseMappingSelector` fetches ALL courses, ALL modules, and ALL sessions from the database -- not filtered by institution/class.

**New behavior:** The assessment creation flow needs to know which institution/class the assessment targets. The `CourseMappingSelector` should:
- Accept `institutionId` and `classId` as props
- Fetch only courses assigned to that class (from `course_class_assignments` + `course_institution_assignments` with `selected_module_ids` / `selected_session_ids`)
- Further filter sessions to only those marked as completed (via `student_content_completions` -- sessions where all content has at least one completion record for students in that class)

**Files to modify:**
- `src/components/assessment/CourseMappingSelector.tsx` -- Add `institutionId` and `classId` props, rewrite queries to filter by allocated courses and completed sessions
- `src/components/assessment/QuestionBuilder.tsx` -- Pass `institutionId`/`classId` down to `CourseMappingSelector`
- `src/pages/system-admin/AssessmentManagement.tsx` -- Add institution/class selection in Step 1 (before questions), pass them to `QuestionBuilder`
- Officer assessment page (if exists) -- Same changes for officer flow

**Implementation approach for the selector:**
1. Query `course_class_assignments` WHERE `class_id = classId` to get assigned course IDs
2. Query `course_institution_assignments` WHERE `institution_id = institutionId` to get `selected_module_ids` and `selected_session_ids`
3. Intersect to show only modules/sessions that are both assigned AND selected
4. For completed sessions: query `class_session_assignments` joined with completion data to determine which sessions are completed for the class

**Assessment creation Step 1 changes:**
- Add institution selector (for system_admin role, fetching from `institutions` table)
- Add class selector (filtered by selected institution, from `classes` table)
- These selections become required before proceeding to add questions
- Store institution/class context so QuestionBuilder can pass to CourseMappingSelector

---

## Change 2: Immediate Course Outcome After Submission

**Current behavior:** The `useCourseOutcomeAnalytics` hook fetches all questions and all answers. It works, but it filters attempts without considering individual submission status -- if a student submitted, their data should show immediately.

**New behavior:** When filtering by `studentId`, only include attempts with status `submitted`, `auto_submitted`, or `evaluated` (not `in_progress`). This ensures the student sees their results the moment they submit.

**Files to modify:**
- `src/hooks/useCourseOutcomeAnalytics.ts` -- When filtering attempts for a student, add `.in('status', ['submitted', 'auto_submitted', 'evaluated'])` to ensure only completed attempts are included
- Also set `staleTime: 0` or reduce it significantly (from current 5 minutes) so data refreshes immediately

**Key query change:**
```typescript
const { data: attempts } = await supabase
  .from('assessment_attempts')
  .select('id')
  .match({
    ...(filters.studentId && { student_id: filters.studentId }),
    ...(filters.institutionId && { institution_id: filters.institutionId }),
    ...(filters.classId && { class_id: filters.classId }),
  })
  .in('status', ['submitted', 'auto_submitted', 'evaluated']);
```

Additionally, after assessment submission in `TakeAssessment.tsx`, invalidate the `course-outcome-analytics` query cache so navigating to Course Outcomes shows fresh data.

---

## Change 3: Auto-Mark Absent Students

**Current behavior:** No mechanism to mark students as absent after assessment time expires.

**New behavior:** When an assessment's `end_time` passes, students who never started an attempt should be automatically marked as `absent`.

**Implementation approach -- Backend function (edge function or DB cron):**

Create a database function + periodic trigger (or an edge function called on-demand) that:
1. Finds assessments where `end_time < now()` and status is `published`
2. For each such assessment, gets all assigned class IDs from `assessment_class_assignments`
3. Gets all students in those classes (from `students` table with `user_id` not null)
4. Checks which students already have an attempt record
5. For students without any attempt, inserts an attempt with `status = 'absent'`, `score = 0`, `percentage = 0`, `passed = false`

**Files to create/modify:**
- Create `supabase/functions/mark-absent-students/index.ts` -- Edge function that runs this logic
- Call this function from the frontend when:
  - The officer/admin views assessment results for a completed assessment
  - Or a teacher/admin clicks a "Mark Absent" button on completed assessments
- Alternatively, add a trigger in the assessment analytics/results views to auto-call this when viewing a completed assessment

**Simpler alternative (client-side on-demand):** Add a function in `assessment.service.ts` called `markAbsentStudents(assessmentId)` that:
1. Gets all class assignments for the assessment
2. Gets all students in those classes
3. Checks existing attempts
4. Inserts absent records for missing students

This gets called automatically when viewing results of a completed assessment, or when the assessment's `end_time` has passed.

---

## Technical Details

### Database Changes
- No new tables needed
- The `assessment_attempts` table already supports `status = 'absent'`

### Files Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/components/assessment/CourseMappingSelector.tsx` | Modify | Add class/institution filtering, completed sessions only |
| `src/components/assessment/QuestionBuilder.tsx` | Modify | Pass institution/class to CourseMappingSelector |
| `src/pages/system-admin/AssessmentManagement.tsx` | Modify | Add institution/class selection in create flow |
| `src/hooks/useCourseOutcomeAnalytics.ts` | Modify | Filter by submitted status, reduce staleTime |
| `src/pages/student/TakeAssessment.tsx` | Modify | Invalidate course-outcome cache after submission |
| `src/services/assessment.service.ts` | Modify | Add `markAbsentStudents()` method |
| `src/components/assessment/AssessmentAnalytics.tsx` | Modify | Auto-call markAbsentStudents for completed assessments |

