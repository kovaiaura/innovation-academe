

# Fix 406 and 400 Errors in Ask Metova

## Root Cause

The `ask_metova_settings` row does not exist in the `system_configurations` table. All queries use `.single()`, which returns a **406 error** when zero rows are found. This cascading failure causes the edge function to return a **400 error** on the second prompt.

## Fix

Replace `.single()` with `.maybeSingle()` in all places that query `ask_metova_settings`. This returns `null` instead of throwing an error when no row exists.

### Files to Modify

| File | Lines | Change |
|------|-------|--------|
| `supabase/functions/ask-metova/index.ts` | ~34 | `.single()` to `.maybeSingle()` |
| `src/hooks/useAskMetova.ts` | ~62 | `.single()` to `.maybeSingle()` |
| `src/components/settings/AISettingsTab.tsx` | ~46 | `.single()` to `.maybeSingle()` |
| `src/pages/super-admin/SystemConfig.tsx` | ~277 | `.single()` to `.maybeSingle()` |

### Technical Detail

All four locations follow the same pattern -- they already handle the `null` case gracefully (falling back to defaults or skipping), so the only change needed is swapping `.single()` for `.maybeSingle()` to prevent the 406 HTTP error from being thrown in the first place.

