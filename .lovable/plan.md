

# Plan: Add Academic Year Setting for Management Portal

## Problem
The Settings page has a static, hardcoded Academic Year input field that doesn't save to the database. The `InstitutionHeader` across all management pages either falls back to "2025-26" or reads from `institution.settings.academic_year` which was never actually written.

## Current State
- `institutions.settings` is a JSON column — already supports `academic_year` key
- Dashboard reads `institution.settings?.academic_year || "2025-26"` — correct read path, but value is never persisted
- Settings page `InstitutionProfileTab` is a fully static component with hardcoded `defaultValue`s and a non-functional Save button
- Several other management pages (Reports, Performance, CoursesAndSessions, etc.) still use `getInstitutionBySlug()` (deprecated mock data) for the header, so they show nothing

## Changes

### 1. Make Settings `InstitutionProfileTab` functional (`src/pages/management/Settings.tsx`)
- Accept `institutionId` and current `settings` as props
- Pre-populate the Academic Year field from `institution.settings.academic_year`
- On Save, update `institutions.settings` JSON in the database (merge with existing settings to preserve other keys like `established_year`)
- Use `useMutation` + `invalidateQueries` so the header updates immediately after save
- Show toast on success/error

### 2. Wire Settings page to real institution data
- Replace the deprecated `getInstitutionBySlug` call with the same `useInstitutionStats` hook used by Dashboard (or a direct query)
- Pass institution data into `InstitutionProfileTab` and `InstitutionHeader`

### 3. Ensure all management pages read from database
- Pages already using `useInstitutionStats` (Dashboard, Officers, InventoryAndPurchase) are fine
- Update pages still using `getInstitutionBySlug` (Settings, Reports, Performance, CoursesAndSessions, Teachers) to use `useInstitutionStats` instead, so their `InstitutionHeader` shows the real `academic_year` from the database

| File | Change |
|------|--------|
| `src/pages/management/Settings.tsx` | Make `InstitutionProfileTab` functional: read/write `academic_year` to `institutions.settings` JSON, wire to real DB data |
| `src/pages/management/Reports.tsx` | Replace `getInstitutionBySlug` with `useInstitutionStats` |
| `src/pages/management/Performance.tsx` | Same |
| `src/pages/management/CoursesAndSessions.tsx` | Same |
| `src/pages/management/Teachers.tsx` | Same |

No database migration needed — `institutions.settings` JSON column already exists and supports arbitrary keys.

