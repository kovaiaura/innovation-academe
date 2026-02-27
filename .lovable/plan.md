

# Scope Student Data + Institution Filtering + Real-Time Career Advice

## Problem Summary

The student context in Ask Metova currently fetches **global data** instead of the student's own scoped data. Events, courses, assessments, assignments, and content completion are not filtered to the student's institution or class. Career advice is also based on static mappings rather than current market context.

---

## Changes (Single File: `supabase/functions/ask-metova/index.ts`)

### 1. Scope Courses to Student's Assigned Courses Only

**Current**: Fetches all published courses globally (line ~1797)
**Fix**: Query `course_class_assignments` for the student's `class_id` and `institution_id`, then fetch only those courses

```text
course_class_assignments WHERE class_id = student's class_id AND institution_id = student's institution_id
  -> get course_ids
  -> fetch courses WHERE id IN (assigned course_ids)
```

### 2. Scope Events to Student's Institution Only

**Current**: Fetches all published upcoming events (line ~1934)
**Fix**: Join with `event_class_assignments` to filter events assigned to the student's institution

```text
event_class_assignments WHERE institution_id = student's institution_id
  -> get event_ids
  -> fetch events WHERE id IN (assigned_event_ids) AND status = 'published'
```

### 3. Scope Content Completion to Student's Assigned Courses

**Current**: Fetches ALL course content globally (line ~1910)
**Fix**: Only fetch content from courses assigned to the student's class

```text
course_content WHERE course_id IN (student's assigned course_ids)
  -> compare with student_content_completions
```

### 4. Add Student's Own Assignment Data

**Current**: No assignment data shown for students
**Fix**: Fetch the student's assignment submissions and pending assignments scoped to their institution

```text
assignment_submissions WHERE student_id = userId
  -> show submitted, graded, pending counts
  -> show marks obtained for graded ones
assignments WHERE institution_id = student's institution_id (via assignment_class_assignments)
  -> show pending assignments with due dates
```

### 5. Scope SWOT Upcoming Deadlines to Student's Institution

**Current**: Fetches ALL upcoming assessments/assignments globally (line ~2058-2072)
**Fix**: Filter by student's institution_id

```text
assessments WHERE institution_id = student's institution_id AND upcoming
assignments WHERE institution_id = student's institution_id AND upcoming
```

### 6. Add Student's Own Attendance Data

**Current**: No attendance data shown for students
**Fix**: Query attendance records for the student's class sessions

### 7. Update Career Guidance to Use Current Market Context

**Current**: Static career mapping in the prompt
**Fix**: Update the `studentPrompt` career guidance section to:
- Reference current 2025-2026 industry trends (AI/ML boom, green tech, cybersecurity demand, etc.)
- Include current salary ranges and demand indicators
- Mention emerging fields (Quantum Computing, Space Tech, Climate Tech)
- Instruct the AI to provide advice based on "current market scenarios" rather than generic historical data
- Add instruction: "Always frame career advice in the context of current industry demand and emerging opportunities as of 2025-2026"

---

## Technical Implementation

The key change is passing `institutionId` and `classId` (already fetched at line 1682-1684) down through all sub-queries in `fetchStudentContext()`. Currently these values are only used for class ranking -- they need to be used everywhere.

### Scoping Pattern (applied to each section):
```text
// Already fetched at top of fetchStudentContext:
const institutionId = profile?.institution_id;
const classId = profile?.class_id;

// Then for each query, add filters:
.eq('institution_id', institutionId)
// or join through assignment tables
```

### New Data Sections Added to Student Context:
| Section | Data Source | Scope |
|---------|-----------|-------|
| Your Assignments | `assignment_submissions` + `assignments` | Student's own submissions + institution assignments |
| Your Attendance | `class_session_attendance` | Student's class sessions |
| Your Events | `events` + `event_class_assignments` | Institution-assigned events only |

### Updated Sections (scoped down):
| Section | Before | After |
|---------|--------|-------|
| Courses | All published courses | Only class-assigned courses |
| Content Completion | All content globally | Only assigned course content |
| Upcoming Assessments (SWOT) | All upcoming | Institution-scoped upcoming |
| Upcoming Assignments (SWOT) | All upcoming | Institution-scoped upcoming |
| Events | All published | Institution-assigned only |

### Career Prompt Update:
The `studentPrompt` career guidance section will be updated to include current market context instructions like:
- "Frame all career advice in the context of 2025-2026 industry trends"
- "Reference current high-demand fields: AI/ML Engineering, Cybersecurity, Climate Tech, Quantum Computing, Full-Stack Development, Data Engineering"
- "Mention emerging career paths and certifications relevant to current market"
- "Provide realistic salary expectations and growth trajectories based on current industry data"

