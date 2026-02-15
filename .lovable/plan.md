

## Add "Awards & Achievements" Sidebar Menu (All Roles)

### Overview
Create a new dedicated "Awards & Achievements" page accessible from every role's sidebar. This page displays project achievements/awards from the existing `project_achievements` table, filtered by role:

- **Student**: Only achievements from projects the student is a member of
- **Officer**: Achievements from projects under their assigned institution
- **Management**: Achievements from projects under their institution
- **System Admin / CEO**: All achievements across all institutions

No database changes are needed -- the `project_achievements` table already has all required data (`title`, `type`, `event_name`, `event_date`, `description`, `certificate_url`, `project_id`), and projects have `institution_id`.

---

### Changes

#### 1. New Sidebar Menu Item (`src/components/layout/Sidebar.tsx`)

Add an "Awards & Achievements" entry with the `Award` icon (already imported) for all relevant roles:

| Role | Position in sidebar | Notes |
|---|---|---|
| `student` | After "My Projects" | Shows only their own project awards |
| `officer` | After "Projects" | Shows their institution's project awards |
| `management` | After "Projects & Awards" | Shows their institution's project awards |
| `system_admin` | After "Project Management" | Feature-gated: `awards_achievements` |
| `super_admin` | After "System Logs" | All institutions |

Path: `/awards` for all roles.

#### 2. New Page: `src/pages/shared/AwardsAchievements.tsx`

A single shared page component used by all roles. It will:
- Detect the current user's role via `useAuth()`
- Query `project_achievements` joined with `projects` (for project title, institution_id) and `project_members` joined with `students` (for student names)
- **Filtering logic by role:**
  - **Student**: Join `project_members` to filter where `students.user_id = currentUser.id`
  - **Officer / Management**: Filter `projects.institution_id = user.institutionId`
  - **CEO / Super Admin**: No filter (all institutions)
- Display a clean card/table layout with:
  - Achievement title and type badge (Award / Participation / Achievement)
  - Project name (linked/referenced)
  - Student members who earned it
  - Event name and date
  - Certificate download link (if available)
  - Institution name (for CEO view)
- Search/filter by type, project name, or student name
- Responsive card grid on mobile, table on desktop

#### 3. New Hook: `src/hooks/useAwardsAchievements.ts`

A React Query hook that:
- Accepts the user's role and institutionId
- Builds the appropriate Supabase query with joins:
  ```
  project_achievements → projects (title, institution_id) → institutions (name)
  project_achievements → projects → project_members → students (student_name)
  ```
- Returns achievements sorted by `created_at` descending (newest first)

#### 4. Routes in `src/App.tsx`

Add routes for each role's tenant path:

| Route | Role |
|---|---|
| `/super-admin/awards` | super_admin |
| `/system-admin/awards` | system_admin |
| `/tenant/:tenantId/management/awards` | management |
| `/tenant/:tenantId/officer/awards` | officer |
| `/tenant/:tenantId/student/awards` | student |

All pointing to the same shared `AwardsAchievements` component wrapped in `ProtectedRoute`.

---

### Technical Details

- **No database migration required** -- uses existing `project_achievements`, `projects`, `project_members`, `students`, and `institutions` tables
- **RLS**: Existing RLS policies on `project_achievements` and `projects` already enforce access control; the client-side role filtering is an additional UI-level filter
- **Feature gate**: For `system_admin`, gated behind a new feature key `awards_achievements` in the position's `visible_features` array (CEO gets it automatically since they have all features)
- **Imports**: Reuse existing `Award` icon from lucide-react, existing UI components (Card, Badge, Table, Input)

### Files Summary

| File | Action |
|---|---|
| `src/components/layout/Sidebar.tsx` | Add menu items for all roles |
| `src/hooks/useAwardsAchievements.ts` | New hook for fetching filtered achievements |
| `src/pages/shared/AwardsAchievements.tsx` | New shared page component |
| `src/App.tsx` | Add 5 new routes |

