

# Plan: Add GitHub Link, Internships, and Certifications to Student Resume

## Summary
Add three new features to the student resume: GitHub URL field, internship details (structured entries), and achievements/certifications (structured entries). This requires a database schema change, hook updates, UI additions in the Resume page, and PDF export updates.

## Database Changes

### 1. Add `github_url` column to `student_resume_extras`
```sql
ALTER TABLE student_resume_extras ADD COLUMN github_url text;
```

### 2. Create `student_internships` table
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | default gen_random_uuid() |
| student_id | uuid FK → students(id) | NOT NULL, ON DELETE CASCADE |
| user_id | uuid FK → auth.users(id) | NOT NULL |
| company_name | text | NOT NULL |
| role_title | text | NOT NULL |
| duration | text | NOT NULL (e.g. "3 months", "Jun-Aug 2025") |
| responsibilities | text | Description of roles & responsibilities |
| start_date | date | nullable |
| end_date | date | nullable |
| created_at / updated_at | timestamptz | defaults |

RLS: Students can CRUD their own rows (`user_id = auth.uid()`).

### 3. Create `student_certifications` table
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | default gen_random_uuid() |
| student_id | uuid FK → students(id) | NOT NULL, ON DELETE CASCADE |
| user_id | uuid FK → auth.users(id) | NOT NULL |
| certification_name | text | NOT NULL |
| issuing_organization | text | nullable |
| issue_date | date | nullable |
| expiry_date | date | nullable |
| credential_id | text | nullable |
| credential_url | text | nullable |
| created_at / updated_at | timestamptz | defaults |

RLS: Students can CRUD their own rows (`user_id = auth.uid()`).

## Code Changes

### 4. Update `useStudentResumeExtras.ts`
- Add `github_url` to the `ResumeExtras` interface and upsert logic.

### 5. Create `useStudentInternships.ts` hook
- `useStudentInternships(studentId)` — fetch all internships for a student
- `useAddInternship()` — insert mutation
- `useDeleteInternship()` — delete mutation

### 6. Create `useStudentCertifications.ts` hook
- `useStudentCertifications(studentId)` — fetch all certifications
- `useAddCertification()` — insert mutation
- `useDeleteCertification()` — delete mutation

### 7. Update `src/pages/student/Resume.tsx`
- Add GitHub URL input next to LinkedIn URL in Personal Information card
- Add **Internships** card with form to add/remove internship entries (company, role, duration, responsibilities)
- Add **Achievements & Certifications** card with form to add/remove entries (name, organization, dates, credential info)
- Update sidebar preview to show internships and certifications sections

### 8. Update `src/components/student/pdf/ResumePDF.tsx`
- Add GitHub URL in header contact info (next to LinkedIn)
- Add **Internship Experience** section rendering each entry with company, role, duration, responsibilities
- Add **Certifications** section rendering each entry with name, organization, dates

## Files Modified
- `src/hooks/useStudentResumeExtras.ts` — add `github_url`
- `src/hooks/useStudentInternships.ts` — new file
- `src/hooks/useStudentCertifications.ts` — new file
- `src/pages/student/Resume.tsx` — add GitHub input, Internships card, Certifications card, sidebar preview updates
- `src/components/student/pdf/ResumePDF.tsx` — add GitHub, Internships, Certifications sections
- Database migration: alter `student_resume_extras`, create 2 new tables with RLS

