

# Add Institution Selection to Event Create, Edit, and Calendar Systems

## Current State

### External Events (EventManagement page)
- **Create**: Already has institution/class selection in `CreateEventForm.tsx` (the "Assign to Institutions & Classes" collapsible section)
- **Publish**: `PublishEventDialog` lets you assign institutions/classes to draft events
- **Edit**: `EditEventDialog.tsx` is **broken** — still uses `mockActivityEvents` (mock data), has no institution/class selection, and the Save button does nothing real
- **No way to re-assign** institutions after an event is already published

### Institutional Calendar (holiday system)
- Already has per-institution selection via a dropdown
- This is a holiday/working-day calendar, not a general events feature — no changes needed here since it already scopes to institutions

## Plan

### 1. Rebuild `EditEventDialog.tsx` to be fully functional
Replace the mock-data-based dialog with a real DB-backed editor that:
- Loads event data from the database (accepts full `Event` object as prop instead of `eventId`)
- Edits all fields: title, description, event type, venue, dates
- Includes the same institution/class assignment UI as `CreateEventForm` (reusing the pattern)
- Pre-loads currently assigned institutions/classes from `event_class_assignments`
- On save: updates the `events` table AND replaces `event_class_assignments` (delete old, insert new)
- Works for both draft and published events

### 2. Add Edit button to `EventsListDB.tsx`
- Add a pencil/edit icon button in the actions column for each event
- Opens the rebuilt `EditEventDialog`

### 3. Create a shared `InstitutionClassSelector` component
Extract the duplicated institution/class checkbox tree (currently copy-pasted in `CreateEventForm` and `PublishEventDialog`) into a reusable component to avoid maintaining 3 copies.

| File | Change |
|------|--------|
| **New** `src/components/events/InstitutionClassSelector.tsx` | Reusable institution/class checkbox tree component |
| `src/components/events/EditEventDialog.tsx` | Full rewrite: DB-backed, includes institution/class assignment |
| `src/components/events/EventsListDB.tsx` | Add Edit action button per event |
| `src/components/events/CreateEventForm.tsx` | Refactor to use `InstitutionClassSelector` |
| `src/components/events/PublishEventDialog.tsx` | Refactor to use `InstitutionClassSelector` |

No database changes needed — `events` and `event_class_assignments` tables already support this.

