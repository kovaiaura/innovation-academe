# Respect "Show date" off on certificates

## Problem
When "Show date" is turned off in a certificate template, the template saves no date position. Two places then quietly put a default back (centre, ~y 520), so the date still prints.

## Fix
1. `src/components/student/CertificatePreviewDialog.tsx` — only draw the date when the template has a date position; remove the default fallback. Apply the same to name/course/level only where already optional (no change to name).
2. `src/services/gamification-db.service.ts` (create template, ~line 831) — save `null` when date is off instead of a default position.
3. `src/services/certificate.service.ts` already skips when absent — no change.

## Existing templates
Templates created earlier may already have the default date stored. After the fix, open the template in CEO → Gamification → Certificate Templates and save once with "Show date" off; that clears it. Already-issued certificates redraw from the template, so they update automatically.
