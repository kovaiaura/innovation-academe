

# Add Institution Assignment to MetaINNOVA™ Events

## Problem
The MetaINNOVA events (webinars, seminars, guest lectures) stored in the `webinars` table have no institution-level visibility control. All events are shown to all users regardless of institution. The External Events system already has this via `event_class_assignments`, but the webinar system lacks it entirely.

## Changes

### 1. Database: Create `webinar_institution_assignments` table (migration)
A join table linking webinars to institutions and classes:
- `id`, `webinar_id` (ref webinars), `institution_id` (ref institutions), `class_id` (ref classes), `assigned_by`, `assigned_at`
- RLS: system_admin/super_admin/CEO can manage; officers/students/management can read rows matching their institution
- **No assignments = visible to everyone** (backward compatible with existing webinars)

### 2. Update `WebinarFormDialog.tsx`
Add the `InstitutionClassSelector` component to the create/edit form, below the existing fields. On submit, pass the selected institution/class assignments back to the parent.

### 3. Update `WebinarManagement.tsx` (system admin page)
After creating/updating a webinar, sync the `webinar_institution_assignments` table (delete old, insert new) — same pattern used for external events.

### 4. Update `webinar.service.ts`
- Add `getWebinarAssignments(webinarId)` and `saveWebinarAssignments(webinarId, assignments)` methods
- Update `getWebinars()` to accept an optional `institutionId` filter — if assignments exist for a webinar, only return it when the user's institution matches

### 5. Update consumer pages to filter by institution
- `src/pages/student/Webinars.tsx` — filter webinars by student's institution
- `src/pages/officer/Webinars.tsx` — filter by officer's assigned institution
- `src/pages/management/Webinars.tsx` — filter by management's institution

| File | Change |
|------|--------|
| **Migration** | Create `webinar_institution_assignments` table with RLS |
| `src/services/webinar.service.ts` | Add assignment CRUD + institution-filtered fetch |
| `src/components/webinars/WebinarFormDialog.tsx` | Add `InstitutionClassSelector` to form |
| `src/pages/system-admin/WebinarManagement.tsx` | Save assignments on create/edit |
| `src/pages/student/Webinars.tsx` | Filter by student institution |
| `src/pages/officer/Webinars.tsx` | Filter by officer institution |
| `src/pages/management/Webinars.tsx` | Filter by management institution |

