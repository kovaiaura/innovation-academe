

# Course Curriculum Generator

A new "Course Curriculum" page for CEO (System Admin) and Innovation Officers to generate, view, and download a formatted PDF curriculum document -- similar to the uploaded sample PDF.

## What It Does

- Adds a new **"Course Curriculum"** menu item in the sidebar for both CEO and Officer roles
- Provides filter controls to generate curriculum views:
  - **By Level**: e.g., "Level 10" -- shows all courses and their sessions for that level
  - **By Course**: e.g., "Robotics" -- shows all levels and sessions for that course
  - **By Course + Level**: e.g., "Robotics, Level 10" -- shows sessions for that specific combination
  - **All Courses**: Full curriculum across all levels
- Displays the filtered curriculum on-screen in a clean, readable format
- Allows downloading the generated curriculum as a styled PDF (matching the MetaINNOVA Curriculum branding from the uploaded sample)
- Only shows **Course Title, Level (Module) Name, and Session Titles** -- no content files

## Technical Details

### New Files

1. **`src/pages/system-admin/CourseCurriculum.tsx`** -- CEO page with filters and curriculum display
2. **`src/pages/officer/CourseCurriculum.tsx`** -- Officer page (same component, different route wrapper)
3. **`src/components/curriculum/CurriculumFilters.tsx`** -- Filter bar (course dropdown, level dropdown)
4. **`src/components/curriculum/CurriculumDisplay.tsx`** -- On-screen curriculum view grouped by level then course
5. **`src/components/curriculum/pdf/CurriculumPDF.tsx`** -- `@react-pdf/renderer` Document component styled like the uploaded sample (header with "METAINNOVA CURRICULUM", level heading, course titles as section headers, session titles as bullet lists)
6. **`src/components/curriculum/pdf/CurriculumPDFStyles.ts`** -- PDF stylesheet

### Modified Files

1. **`src/components/layout/Sidebar.tsx`** -- Add "Course Curriculum" menu item for `system_admin` and `officer` roles
2. **`src/App.tsx`** -- Add routes for `/system-admin/course-curriculum` and `/tenant/:tenantId/officer/course-curriculum`

### Data Flow

- Fetches from `courses`, `course_modules`, and `course_sessions` tables using Supabase client
- Groups data hierarchically: Level (module) -> Course -> Sessions
- Filters applied client-side based on selected course and/or level
- PDF generated client-side using `@react-pdf/renderer` (already installed) with `pdf()` blob function for download

### PDF Layout (matching uploaded sample)

- Header: "METAINNOVA CURRICULUM" with branding
- Level heading: "LEVEL {n}" in large bold text
- Course sections: Course title as bold heading
- Sessions listed as bullet points: "Session 1: {title}", "Session 2: {title}", etc.
- Page numbers at bottom

