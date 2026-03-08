

# Plan: Enhance Education Section in Resume

## Problem
The Education section currently shows the institution name and class name from LMS records. The class name often shows "Not assigned" (as seen in the screenshot). The user wants:
1. Show courses completed under the current institution
2. Allow students to add **additional education entries** (e.g., school, previous college, etc.)

## Database Changes

### Create `student_educations` table
For additional education entries students can manually add.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | default gen_random_uuid() |
| student_id | uuid FK → students(id) | NOT NULL, ON DELETE CASCADE |
| user_id | uuid FK → auth.users(id) | NOT NULL |
| institution_name | text | NOT NULL |
| degree_or_course | text | NOT NULL (e.g. "B.E. Computer Science") |
| field_of_study | text | nullable (e.g. "Computer Engineering") |
| start_year | text | nullable |
| end_year | text | nullable |
| grade_or_percentage | text | nullable |
| description | text | nullable |
| created_at / updated_at | timestamptz | defaults |

RLS: Students can CRUD their own rows (`user_id = auth.uid()`).

## Code Changes

### 1. Create `useStudentEducations.ts` hook
- `useStudentEducations(studentId)` — fetch all education entries
- `useAddEducation()` — insert
- `useDeleteEducation()` — delete

### 2. Update Resume.tsx — Education Card
- Keep auto-filled institution/class from LMS at the top
- Show **courses completed** (from `resumeData.skills` which are course titles) as a sub-list under the current institution
- Add form below to add/remove additional education entries (institution, degree, field, years, grade)
- List saved education entries with delete option

### 3. Update ResumePDF.tsx — Education Section
- Render current institution with course names listed below it
- Render each additional education entry (institution, degree, field, year range, grade)

### 4. Update sidebar preview in Resume.tsx
- Show additional education entries in the preview panel

## Files
- **New**: `src/hooks/useStudentEducations.ts`
- **Edit**: `src/pages/student/Resume.tsx` — education card + sidebar
- **Edit**: `src/components/student/pdf/ResumePDF.tsx` — education section
- **DB migration**: create `student_educations` table with RLS

