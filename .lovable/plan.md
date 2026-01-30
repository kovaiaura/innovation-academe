
# Plan: Fix Student SDG Contribution Page Data Loading

## Problem Analysis

The Student SDG Contribution page shows 0 for all metrics because the queries are using incorrect IDs:

### Current Bug in SDGContribution.tsx (Lines 25-28):
```typescript
const { data: memberProjects } = await supabase
  .from('project_members')
  .select('project_id')
  .eq('student_id', user.id);  // WRONG: uses auth user ID
```

**The Issue**: `project_members.student_id` references `students.id` (the students table primary key), NOT the auth user ID (`user.id`). This query returns 0 results because no project_members record has `student_id` matching an auth user ID.

### Correct Pattern (from Projects.tsx Lines 29-55):
```typescript
// Step 1: Get student record by user_id
const { data: studentData } = await supabase
  .from('students')
  .select('id')
  .eq('user_id', user.id)
  .maybeSingle();

// Step 2: Use students.id to query project_members
const { data: memberData } = await supabase
  .from('project_members')
  .select('project_id')
  .eq('student_id', studentData.id);  // CORRECT: uses students.id
```

---

## Solution

Modify `src/pages/student/SDGContribution.tsx` to:
1. First fetch the student record using `user_id`
2. Use the student's `id` (from students table) to query project_members
3. Keep the course query as-is (it correctly uses `profile.class_id`)

---

## Technical Changes

### File: `src/pages/student/SDGContribution.tsx`

**Before** (Lines 23-39):
```typescript
try {
  // Get projects where student is a member
  const { data: memberProjects } = await supabase
    .from('project_members')
    .select('project_id')
    .eq('student_id', user.id);  // BUG: Wrong ID

  const projectIds = memberProjects?.map(m => m.project_id) || [];

  let studentProjects: any[] = [];
  if (projectIds.length > 0) {
    const { data } = await supabase
      .from('projects')
      .select('id, title, sdg_goals, status, progress, category')
      .in('id', projectIds);
    studentProjects = data || [];
  }
```

**After**:
```typescript
try {
  // Step 1: Get student record from students table using auth user_id
  const { data: studentRecord } = await supabase
    .from('students')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  let studentProjects: any[] = [];
  
  if (studentRecord?.id) {
    // Step 2: Get projects where student is a member using students.id
    const { data: memberProjects } = await supabase
      .from('project_members')
      .select('project_id')
      .eq('student_id', studentRecord.id);  // FIXED: Use students.id

    const projectIds = memberProjects?.map(m => m.project_id) || [];

    if (projectIds.length > 0) {
      const { data } = await supabase
        .from('projects')
        .select('id, title, sdg_goals, status, progress, category')
        .in('id', projectIds);
      studentProjects = data || [];
    }
  }
```

---

## Data Flow Diagram

```text
Current (Broken):
user.id (auth) ──────► project_members.student_id ──► No match!
                                   │
                                   │ (expects students.id)
                                   ▼
                             Returns empty []

Fixed:
user.id (auth) ──► students.user_id ──► students.id ──► project_members.student_id ──► Match!
```

---

## Database Verification

| Table | Column | Value Type |
|-------|--------|------------|
| `profiles` | `id` | auth user UUID |
| `students` | `user_id` | auth user UUID (foreign key to profiles.id) |
| `students` | `id` | students table primary key UUID |
| `project_members` | `student_id` | references `students.id` (NOT auth user ID) |

---

## Why Courses Query Works (But Still May Show 0)

The courses query correctly uses `profile.class_id`:
```typescript
const { data: profile } = await supabase
  .from('profiles')
  .select('class_id')
  .eq('id', user.id)
  .single();

// Then queries course_class_assignments using profile.class_id
```

This should work if:
1. The student's profile has a `class_id` set
2. There are course assignments for that class with `sdg_goals` populated

The course query is correct but may return 0 if:
- Student's profile doesn't have `class_id` set
- No courses are assigned to that class
- Assigned courses don't have SDG goals

---

## Summary of Changes

| File | Change |
|------|--------|
| `src/pages/student/SDGContribution.tsx` | Add student record lookup by `user_id` before querying project_members |

---

## Expected Result After Fix

| Metric | Before | After |
|--------|--------|-------|
| Active SDGs | 0 | SDGs from projects + courses |
| My Projects | 0 | Count of projects student is member of |
| My Courses | 0 | Count of courses assigned to student's class |
| Coverage | 0% | Percentage of 17 SDGs covered |

The page will correctly display:
- Projects the student is a member of (via project_members)
- Courses assigned to the student's class (via course_class_assignments)
- Combined SDG goals from both sources
