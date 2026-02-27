

# Add Editable Resume Fields for Students

## Overview
Add new editable sections to the student resume: **About Me**, **Hobbies**, **Sports Achievements**, and **LinkedIn URL**. Students can add/edit these themselves, and the data persists in the database and appears in the PDF export.

## Database Change

Create a new `student_resume_extras` table to store student-managed resume data:

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | Default gen_random_uuid() |
| student_id | uuid | References students(id), UNIQUE |
| user_id | uuid | References auth.users, for RLS |
| about_me | text | Short bio/about section |
| hobbies | text[] | Array of hobbies |
| sports_achievements | text[] | Array of sports achievement descriptions |
| linkedin_url | text | LinkedIn profile URL |
| created_at | timestamptz | Default now() |
| updated_at | timestamptz | Default now() |

RLS policies: Students can SELECT/INSERT/UPDATE their own row (where `user_id = auth.uid()`). Admins with super_admin/system_admin roles get full read access.

## Code Changes

### 1. Hook: `src/hooks/useStudentResumeExtras.ts` (new file)
- `useStudentResumeExtras(userId)` -- React Query hook to fetch extras
- `useUpdateResumeExtras()` -- mutation to upsert the row
- Handles insert-on-first-save (upsert by student_id)

### 2. Update `src/hooks/useStudentResume.ts`
- Add `extras` field to `ResumeData` interface (about_me, hobbies, sports_achievements, linkedin_url)
- Fetch from `student_resume_extras` in the query and merge into resume data

### 3. Update `src/pages/student/Resume.tsx`
- Add an **"About Me"** card with an editable textarea
- Add a **"Hobbies"** card with add/remove tag input (similar to custom skills)
- Add a **"Sports Achievements"** card with add/remove list entries
- Add a **"LinkedIn URL"** input field in the Personal Information card
- Each section has a Save button that calls the upsert mutation
- All fields are editable by the student (not disabled like auto-filled fields)

### 4. Update `src/components/student/pdf/ResumePDF.tsx`
- Add "About" section below the header (if provided)
- Add "Hobbies" section
- Add "Sports Achievements" section
- Add LinkedIn URL in the header contact info row

### 5. Update Resume Preview sidebar
- Show about me, hobbies, sports achievements, and LinkedIn in the mini preview card

## Technical Details
- The table uses `ON CONFLICT (student_id) DO UPDATE` for upsert behavior
- RLS ensures students only access their own data
- The `updated_at` column is maintained via the existing `update_updated_at_column()` trigger
- LinkedIn URL validated client-side with a basic URL/pattern check before saving

