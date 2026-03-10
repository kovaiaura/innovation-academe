

# Fix: Webinar Loading Fails After Institution Assignment

## Problem
The management/officer/student webinar pages fail entirely when `getWebinarsForInstitution()` cannot query `webinar_institution_assignments`. The error cascades — if the assignments query fails, no webinars are shown at all. Additionally, the `class_id` column on `webinar_institution_assignments` is `NOT NULL`, which can cause insert failures when an institution has no classes or when institution-level (not class-level) visibility is intended.

## Changes

### 1. Database: Make `class_id` nullable
The `class_id` column should be nullable to support institution-wide assignments (without specifying specific classes), matching how `event_class_assignments` works.

```sql
ALTER TABLE public.webinar_institution_assignments 
ALTER COLUMN class_id DROP NOT NULL;
```

### 2. `src/services/webinar.service.ts` — Add error resilience
Wrap the assignments query in a try-catch inside `getWebinarsForInstitution()`. If assignments fail to load, gracefully fall back to returning all active webinars instead of throwing.

### 3. `src/components/events/InstitutionClassSelector.tsx` — Handle institutions with no classes
When an institution has no classes, selecting it should produce a single assignment with `institution_id` and `class_id: null` (institution-wide visibility) instead of producing nothing.

| File | Change |
|------|--------|
| **Migration** | Make `class_id` nullable |
| `src/services/webinar.service.ts` | Graceful fallback if assignments query fails |
| `src/components/events/InstitutionClassSelector.tsx` | Handle no-classes institutions |

