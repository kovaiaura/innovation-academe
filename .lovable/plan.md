

## Course Outcome Analytics

This feature links assessment questions to specific course content (Course > Module/Level > Session), enabling performance analysis at every level -- helping students see their strengths/weaknesses and helping staff decide which topics to revisit.

---

### Part 1: Database -- Add Course Mapping to Assessment Questions

Add 3 nullable columns to the `assessment_questions` table:

| Column | Type | Description |
|---|---|---|
| `course_id` | uuid (FK to courses) | Which course this question relates to |
| `module_id` | uuid (FK to course_modules) | Which level/module |
| `session_id` | uuid (FK to course_sessions) | Which session/topic |

All nullable so existing questions remain valid. A single migration adds the columns and foreign keys.

---

### Part 2: Question Builder -- Add Course/Level/Session Selectors

**File:** `src/components/assessment/QuestionBuilder.tsx`

Add a "Course Mapping (Optional)" section with 3 cascading dropdowns:
1. **Course** -- fetches all courses from DB
2. **Level (Module)** -- filters by selected course
3. **Session** -- filters by selected module

When a course is selected, modules load; when a module is selected, sessions load. All optional.

**File:** `src/types/assessment.ts`

Add `course_id?`, `module_id?`, `session_id?` to `AssessmentQuestion` interface.

**File:** `src/services/assessment.service.ts`

Update `addQuestions()` and `updateQuestion()` to include the 3 new fields when inserting/updating.

---

### Part 3: Course Outcome Analytics Pages

Create a shared analytics component and role-specific wrapper pages.

#### 3a. Shared Hook: `src/hooks/useCourseOutcomeAnalytics.ts`

Fetches and computes:
- All questions that have `course_id` set (joined with answers + attempts)
- Grouped accuracy rates by course, module, and session
- Accepts optional filters: `institutionId`, `classId`, `studentId`
- Returns: per-course accuracy, per-module accuracy, per-session accuracy, strongest/weakest topics

#### 3b. Shared Component: `src/components/course-outcomes/CourseOutcomeAnalytics.tsx`

Displays:
- **Overall Course Strength** -- horizontal bar chart showing accuracy % per course
- **Module Breakdown** -- expandable per course, bar chart showing accuracy per module/level
- **Session Detail** -- drill-down per module, showing accuracy per session/topic
- **Strength/Weakness Summary** -- cards highlighting top 3 strong and top 3 weak areas
- Color coding: green (>75%), yellow (50-75%), red (<50%)

#### 3c. Role-Specific Pages

| Role | Page Path | Component | Behavior |
|---|---|---|---|
| Student | `/course-outcomes` | `StudentCourseOutcomes.tsx` | Shows only their own data; "My Strengths" and "Needs Improvement" sections |
| Officer | `/course-outcomes` | `OfficerCourseOutcomes.tsx` | Class-wise and individual student drill-down for their institution |
| Management | `/course-outcomes` | `ManagementCourseOutcomes.tsx` | Institution-wide view with class filter, student drill-down |
| CEO/System Admin | `/course-outcomes` | `AdminCourseOutcomes.tsx` | Cross-institution comparison, drill into any institution > class > student |

---

### Part 4: Sidebar Menu + Routing

**File:** `src/components/layout/Sidebar.tsx`

Add "Course Outcomes" menu item for all 4 roles:
- `system_admin` (feature: `'course_management'` -- reuses existing feature flag)
- `management`
- `officer`
- `student`

**File:** `src/types/permissions.ts`

No new feature flag needed -- reuse `course_management` for system_admin visibility.

**File:** `src/App.tsx` (or routing config)

Add route `/course-outcomes` mapped to the appropriate role-specific page component.

---

### Part 5: Question List Display Update

**File:** `src/components/assessment/QuestionList.tsx`

Show a small badge/tag on each question card indicating the mapped course/session (if any), e.g., "Python Basics > Level 2 > Variables".

---

### Technical Summary

| File | Change |
|---|---|
| **DB Migration** | Add `course_id`, `module_id`, `session_id` columns to `assessment_questions` |
| `src/types/assessment.ts` | Add 3 optional fields to `AssessmentQuestion` |
| `src/components/assessment/QuestionBuilder.tsx` | Add cascading course/module/session dropdowns |
| `src/services/assessment.service.ts` | Include new fields in insert/update/transform |
| `src/hooks/useCourseOutcomeAnalytics.ts` | **New** -- data fetching + accuracy computation |
| `src/components/course-outcomes/CourseOutcomeAnalytics.tsx` | **New** -- shared chart/visualization component |
| `src/pages/student/StudentCourseOutcomes.tsx` | **New** -- student view |
| `src/pages/officer/OfficerCourseOutcomes.tsx` | **New** -- officer view |
| `src/pages/management/ManagementCourseOutcomes.tsx` | **New** -- management view |
| `src/pages/super-admin/AdminCourseOutcomes.tsx` | **New** -- CEO/admin view |
| `src/components/layout/Sidebar.tsx` | Add "Course Outcomes" menu for all roles |
| `src/components/assessment/QuestionList.tsx` | Show course mapping badge |
| `src/App.tsx` | Add `/course-outcomes` route |

