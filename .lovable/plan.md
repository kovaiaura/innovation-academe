

# Add Academic Year Setting to CEO's Institution Edit Dialog

## Problem
The management dashboard's Settings page has the academic year config, but the CEO (system-admin) has no way to set it. The CEO manages institutions via the **Edit Institution** dialog (`EditInstitutionDialog.tsx`), which currently has no academic year field.

## Current State
- Academic year is stored in `institutions.settings` JSONB column (key: `academic_year`)
- The `EditInstitutionDialog` doesn't handle the `settings` field at all — it only manages top-level columns like `name`, `code`, `location`, etc.
- The `InstitutionDetail.tsx` page fetches institution data but doesn't pass `settings` to the edit dialog

## Changes

### 1. `src/components/institution/EditInstitutionDialog.tsx`
- Add `settings` (with `academic_year`) to the `Institution` interface
- Add an "Academic Year" input field in the form (next to "Established Year")
- When saving, include the merged `settings` object in the output so the parent persists it

### 2. `src/pages/system-admin/InstitutionDetail.tsx`
- Ensure the institution object passed to `EditInstitutionDialog` includes `settings`
- When `onSave` fires, persist the `settings` field to the database alongside other fields (it currently calls `updateInstitution` which should already handle arbitrary columns)

| File | Change |
|------|--------|
| `EditInstitutionDialog.tsx` | Add `settings` to interface, add Academic Year input, include in save output |
| `InstitutionDetail.tsx` | Pass `settings` to dialog, ensure `updateInstitution` persists it |

No database changes needed.

