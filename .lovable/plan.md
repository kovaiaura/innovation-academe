# Add "Rather not say" gender option

## Scope
Add a fourth gender option `prefer_not_to_say` ("Rather not say") to both individual and bulk student creation in CEO → Institute → Classes → Students, and ensure it renders a neutral profile icon (no gendered emoji/avatar).

## Files to change

### Types
- `src/types/student.ts` — extend `gender` union to `'male' | 'female' | 'other' | 'prefer_not_to_say'`.
- `src/types/institution.ts` — same union where gender is referenced (analytics fields stay unchanged; "prefer_not_to_say" counted under existing `other` bucket).

### Individual add/edit dialogs (CEO institution flow)
- `src/components/institution/AddStudentToClassDialog.tsx` — add `<SelectItem value="prefer_not_to_say">Rather not say</SelectItem>`; widen the `value` cast.
- `src/components/institution/StudentEditDialog.tsx` — same select option + type widen.
- `src/components/student/AddEditStudentDialog.tsx` — same select option (used by Management Students page).

### Bulk upload (CEO institution flow)
- `src/components/institution/BulkUploadStudentsToClassDialog.tsx` — accept `rather_not_say` / `prefer_not_to_say` in parsing/display.
- `src/components/student/BulkUploadDialog.tsx` — same.
- `src/utils/csvParser.ts`:
  - Extend allowed values: `['male','female','other','prefer_not_to_say','rather_not_say']` (normalized to `prefer_not_to_say`).
  - Update error message: "Gender must be male, female, other, or prefer_not_to_say".
  - Update CSV template header comment + sample rows to include the new option.

### Neutral profile icon
- `src/utils/studentHelpers.ts`:
  - `getGenderIcon`: return `'👤'` for both `other` and `prefer_not_to_say` (neutral silhouette), keep 👨/👩 for male/female.
- Wherever an avatar fallback is rendered (e.g. `ClassStudentTable`, `StudentDetailsDialog`), `AvatarFallback` already falls back to initials when no avatar URL is set — no gendered placeholder image is used today, so no avatar image change needed. The neutral icon applies to the emoji helper only.

### Filter UI
- `src/components/institution/ClassStudentTable.tsx` — add "Rather not say" to the gender filter `<Select>`.

## Non-changes
- Database: `students.gender` is a free-text column with no CHECK constraint, so no migration is needed.
- Analytics gender_distribution math is unaffected; `prefer_not_to_say` is grouped with non-male/non-female counts.

## Display label
- UI label: **"Rather not say"**
- Stored value: **`prefer_not_to_say`**
- CSV accepted (case-insensitive): `prefer_not_to_say`, `rather_not_say`
