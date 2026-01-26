
## Plan: Fix "Unknown" Team Members Display on Student Projects Page

### Problem Identified
When a student views their projects on the "My Innovation Projects" page, other team members' names display as "Unknown" instead of their actual names.

### Root Cause
The RLS (Row Level Security) policy on the `students` table is too restrictive for this use case:

**Current Policy**: `Students can view own profile` allows only `(user_id = auth.uid())`

This means a student can only see their **own** student record, but when the query tries to fetch other project team members' names via the nested join:
```sql
student:students(id, student_name, class_id)
```
The RLS policy blocks access to other students' records, returning `null` for their data.

### Solution
Add a new RLS policy that allows students to view **limited information** (only `id` and `student_name`) of other students who are members of the same project.

---

### Technical Implementation

#### 1. Create a Helper Function (SECURITY DEFINER)
A helper function to check if two students share a project membership:

```sql
CREATE OR REPLACE FUNCTION public.students_share_project(viewer_user_id uuid, target_student_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM project_members pm1
    JOIN project_members pm2 ON pm1.project_id = pm2.project_id
    JOIN students s ON s.id = pm1.student_id
    WHERE s.user_id = viewer_user_id
    AND pm2.student_id = target_student_id
  )
$$;
```

#### 2. Add New RLS Policy on `students` Table

```sql
CREATE POLICY "Students can view project teammates"
ON public.students
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'student'::app_role) 
  AND students_share_project(auth.uid(), id)
);
```

This policy allows a student to SELECT from the `students` table if the target student is a teammate on any shared project.

---

### What This Fixes
- When AADHETH K views the "AI based rover" project, they can now see the names of all team members (not just their own name)
- The `student:students(id, student_name, class_id)` nested select will return actual data instead of `null`
- "Unknown" will be replaced with actual student names like "AADHETH K", "Student B", etc.

---

### Summary of Database Changes

| Change Type | Object | Description |
|-------------|--------|-------------|
| Create Function | `students_share_project` | Helper function to check if two students share a project |
| Create Policy | `Students can view project teammates` | RLS policy allowing students to see teammate names |

---

### Files Affected
No code changes needed - the existing query in `src/pages/student/Projects.tsx` will automatically work once the RLS policy is added.
