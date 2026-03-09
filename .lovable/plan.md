

# Add Institution Selection to MetaINNOVA Events

## Problem
MetaINNOVA events (webinars, seminars, guest lectures) stored in the `webinars` table have no institution-level visibility control. All events are shown to all users regardless of institution.

## Changes

### 1. Database migration: `webinar_institution_assignments` table
Create an assignment table similar to `event_class_assignments`:
- `id`, `webinar_id` (ref webinars), `institution_id` (ref institutions), `class_id` (nullable, ref classes), `assigned_by`, `created_at`
- RLS: system_admin and CEO can read/insert/delete

### 2. Update `WebinarFormDialog.tsx`
Add the existing `InstitutionClassSelector` component to the form dialog, used for both create and edit flows. On submit, save assignments using delete-and-reinsert strategy.

### 3. Update `webinar.service.ts`
- Add methods to load/save webinar institution assignments
- Update `createWebinar` and `updateWebinar` to accept and persist assignments

### 4. Filter webinars for non-admin users
Update `getWebinars()` (used by student/officer/management pages) to filter by the user's institution — show only webinars assigned to their institution or webinars with no assignments (global).

| File | Change |
|------|--------|
| **Migration** | Create `webinar_institution_assignments` table with RLS |
| `src/components/webinars/WebinarFormDialog.tsx` | Add `InstitutionClassSelector` for institution/class targeting |
| `src/services/webinar.service.ts` | Add assignment CRUD, filter by institution for non-admins |
| `src/pages/system-admin/WebinarManagement.tsx` | Pass assignment data through create/edit flow |

