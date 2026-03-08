

# Plan: Make Default Institution Education Editable + Add Passed Year

## Problem
The current LMS institution education entry (lines 434-446 of Resume.tsx) is read-only — it shows `resumeData.education.institution` and courses but students cannot edit the course/degree name or add a passed/graduation year. The user wants:
1. Ability to edit the default institution's course/degree info
2. Add duration/passed year to the default institution entry

## Approach
Store editable overrides for the default institution in the existing `student_resume_extras` table (which already holds GitHub, LinkedIn, about me, etc.).

### Database Change
Add two columns to `student_resume_extras`:
- `institution_course` (text, nullable) — editable course/degree override for the default institution
- `institution_passed_year` (text, nullable) — passed year / duration (e.g., "2022-2025" or "2025")

### Code Changes

**1. `src/hooks/useStudentResumeExtras.ts`**
- Add `institution_course` and `institution_passed_year` to the interface and upsert logic.

**2. `src/pages/student/Resume.tsx`**
- Add state for `institutionCourse` and `institutionPassedYear`, synced from extras.
- Replace the read-only default institution block (lines 434-446) with an editable card showing:
  - Institution name (read-only, from LMS)
  - Course/Degree input (editable, defaults to class name from LMS)
  - Passed Year / Duration input (e.g., "2022-2025")
  - Courses list (from LMS, read-only)
- Include these fields in the `handleSaveExtras` call.

**3. `src/components/student/pdf/ResumePDF.tsx`**
- In the Education section, use `extras.institution_course` (if set) as the degree line under the institution name.
- Show `extras.institution_passed_year` as a year range next to the institution.

### Files Modified
- DB migration: add 2 columns to `student_resume_extras`
- `src/hooks/useStudentResumeExtras.ts`
- `src/pages/student/Resume.tsx`
- `src/components/student/pdf/ResumePDF.tsx`

