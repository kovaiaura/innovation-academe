# Ready-to-run SQL for your own Supabase (uploaded PDF reports)

## Goal
Give the user one idempotent SQL script, committed to the repo, that applies the uploaded-PDF-reports database change to their own (external) Supabase project. The Vercel build needs no changes — the Drizzle files stay in the repo untouched and are never used by `vite build`.

## What to build

1. **New file: `apply-on-your-own-supabase.sql`** (project root, committed with the code so it travels with GitHub). Content, in order:
   - Guard check: a `DO` block that raises a clear error if `public.has_role(uuid, app_role)` or `public.get_user_institution_id(uuid)` do not exist (the storage policies depend on them). Message tells the user the functions must exist first.
   - `ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS uploaded_pdf_path text;`
   - Bucket creation as SQL, safe to re-run:
     `INSERT INTO storage.buckets (id, name, public) VALUES ('activity-reports', 'activity-reports', false) ON CONFLICT (id) DO NOTHING;`
     (Include a comment that the alternative is creating a private bucket named `activity-reports` in the Supabase dashboard.)
   - Storage policies, re-runnable: `DROP POLICY IF EXISTS` for the two policy names, then re-create them exactly as in `drizzle/migrations/0000_uploaded_pdf_reports.sql`:
     - "Admins manage activity report files" — ALL for authenticated on `bucket_id = 'activity-reports'`, limited to system_admin / super_admin via `public.has_role`.
     - "Management read own institution report files" — SELECT for management, scoped to the first folder of the object path matching `public.get_user_institution_id(auth.uid())`.
   - Header comment: what this applies, run once in the Supabase SQL editor, safe to run multiple times.

2. **No other code changes.** No Vercel, build, or app-code edits. Drizzle config/migration files remain as-is.

## Verification
- Confirm the SQL file matches the policy SQL already applied here (diff against `drizzle/migrations/0000_uploaded_pdf_reports.sql`).
- Confirm `vite build` still passes (file is inert to the build).

## User steps after this
- Open their Supabase project → SQL editor → paste and run the file once.
- Redeploy on Vercel; the Upload Report PDF feature then works against their database.
