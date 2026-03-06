

# Plan: Update Resend API Key from CEO Settings

## Problem
The "Update API Key" button in CEO Settings currently shows a toast telling users to go to the "Lovable dashboard" to update secrets — which is inaccessible and mentions "Lovable" (forbidden). The CEO needs to update the Resend API key directly from the settings page.

## Approach
Store the Resend API key in `system_configurations` table (like other CEO settings), and update the edge functions to read from there first, falling back to the env secret.

## Changes

### 1. `src/components/settings/ResendApiKeyDialog.tsx`
- Replace the toast-only `handleSave` with actual logic that upserts the key into `system_configurations` with key `resend_api_key`
- Store as `{ api_key: "re_xxx..." }` in the `value` JSONB column
- Show success toast on save
- Remove all mentions of "Lovable"

### 2. `src/components/settings/ResendSettingsCard.tsx`
- Fetch from `system_configurations` to show whether a custom API key is configured (badge: "Configured" vs "Using Default")
- Remove any "Lovable" references if present

### 3. `supabase/functions/send-password-reset/index.ts`
- Before reading `Deno.env.get("RESEND_API_KEY")`, first check `system_configurations` table for key `resend_api_key`
- Use DB value if present, fall back to env secret

### 4. `supabase/functions/send-attendance-reminder/index.ts`
- Same change: check `system_configurations` first, then env fallback

This lets the CEO update the key from settings without any external dashboard, and removes all "Lovable" references.

