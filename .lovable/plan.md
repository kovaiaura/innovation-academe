

# Plan: Fix Attendance Reminders on External Supabase + Vercel

## Root Cause Analysis

I found **two critical issues** preventing reminders from working on your external Supabase setup:

### Issue 1: No cron scheduler configured
The `send-attendance-reminder` function works on Lovable Cloud because Lovable has its own internal scheduler. But in your external Supabase project, **there are no `cron.schedule` jobs** anywhere in the migrations. The function exists but nothing invokes it automatically.

### Issue 2: Missing JWT config
The `send-attendance-reminder` function is **not listed** in `supabase/config.toml` with `verify_jwt = false`. Without this, the cron job's HTTP call will be rejected with a JWT error.

Your forgot-password emails work because that function (`send-password-reset`) has a different invocation path. The reminder function needs to be called automatically by pg_cron every minute — and that setup is completely missing.

---

## Changes

### 1. Add `verify_jwt = false` for the reminder function
**File: `supabase/config.toml`**
- Add `[functions.send-attendance-reminder]` with `verify_jwt = false`

### 2. Set up pg_cron jobs to invoke the function automatically
**Database (via insert tool, NOT migration — contains project-specific URLs/keys):**

Two cron jobs:
- **Every minute (realtime mode)**: Calls `send-attendance-reminder` with empty body
- **Every 10 minutes (catch-up mode)**: Calls `send-attendance-reminder` with `{"mode": "catchup", "catchup_window": 30}`

```sql
-- Realtime: every minute
select cron.schedule(
  'attendance-reminder-realtime',
  '* * * * *',
  $$
  select net.http_post(
    url:='https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co/functions/v1/send-attendance-reminder',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer <YOUR_ANON_KEY>"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);

-- Catch-up: every 10 minutes
select cron.schedule(
  'attendance-reminder-catchup',
  '*/10 * * * *',
  $$
  select net.http_post(
    url:='https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co/functions/v1/send-attendance-reminder',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer <YOUR_ANON_KEY>"}'::jsonb,
    body:='{"mode": "catchup", "catchup_window": 30}'::jsonb
  ) as request_id;
  $$
);
```

### 3. Verify external Supabase secrets
You need these secrets set in your external Supabase project (Edge Functions → Manage Secrets):
- `RESEND_API_KEY` — your valid Resend API key
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` — should already be there

### 4. Verify pg_cron and pg_net extensions
The migration `20260305065246` enables `pg_cron` and `pg_net`. You need to ensure these extensions are also enabled in your **external** Supabase project. Run this in the SQL Editor:
```sql
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
```

---

## What I'll Do (in Lovable)
1. Add `[functions.send-attendance-reminder]` with `verify_jwt = false` to `config.toml`
2. Set up the two cron jobs using the insert tool (with your Lovable Cloud project credentials so it works here too)

## What You Need to Do (in your external Supabase)
1. Enable `pg_cron` and `pg_net` extensions (if not already)
2. Run the cron schedule SQL above with **your external project's** URL and anon key
3. Ensure `RESEND_API_KEY` is set in Edge Function secrets
4. Deploy the updated edge function via Supabase CLI

