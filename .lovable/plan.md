

# Student Class Transfer Feature

## Problem
There's no way to transfer a student from one class to another within the same institution. Admins need this for promotions, section changes, or corrections — without losing the student's existing XP, projects, assessments, assignments, or achievements.

## Why existing data is safe
All student progress data (XP transactions, project memberships, assessment attempts, assignment submissions, achievements) is linked by `student_id` (user UUID) or `student.id`, **not** by `class_id`. Changing the student's class only affects:
- `students.class_id` — updated directly
- `profiles.class_id` — updated automatically by the existing `sync_profile_from_student` trigger

So a class transfer preserves all historical data by design.

## Changes

### 1. New component: `TransferStudentDialog.tsx`
A dialog that:
- Shows the student's current class
- Provides a dropdown of all other classes in the same institution (fetched via `useClasses`)
- Has an optional "Reason" text field for record-keeping
- On confirm: updates `students.class_id` to the new class, invalidates queries

### 2. Database: `student_transfers` log table (migration)
A simple audit table to track transfer history:
- `id`, `student_id` (ref students), `institution_id`, `from_class_id`, `to_class_id`, `transferred_by`, `reason`, `transferred_at`
- RLS: management and system_admin can read/insert

### 3. Wire transfer action into existing UI
- **Management Students page** (`src/pages/management/Students.tsx`): Add a "Transfer" button/action next to each student row
- **Institution detail** (`ClassStudentTable.tsx` or `StudentEditDialog.tsx`): Add transfer option in the CEO's institution view as well

### 4. Update `useStudents.ts`
Add a `transferStudent` mutation that:
1. Updates `students.class_id` to the new class
2. Inserts a record into `student_transfers`
3. Invalidates both old and new class student queries

| File | Change |
|------|--------|
| **New** `src/components/student/TransferStudentDialog.tsx` | Transfer dialog with class selector and reason field |
| **Migration** | Create `student_transfers` audit table with RLS |
| `src/hooks/useStudents.ts` | Add `transferStudent` mutation |
| `src/pages/management/Students.tsx` | Add Transfer action button per student |
| `src/components/institution/ClassStudentTable.tsx` | Add Transfer action in CEO's class view |

