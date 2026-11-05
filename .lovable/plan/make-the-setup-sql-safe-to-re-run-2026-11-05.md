# Make the setup SQL safe to re-run

## Why the error happens
The rank section was already applied to your database earlier. The file creates its three rank policies without first removing them, so running the whole file again stops at "Students read own rank already exists". Nothing is broken — your rank table is already in place.

## Fix
In `apply-on-your-own-supabase.sql`, add a `DROP POLICY IF EXISTS ... ON public.student_rank_snapshots;` line before each of the three `CREATE POLICY` statements:
- "Students read own rank"
- "Staff manage institution ranks"
- "Admins manage ranks"

Also check the proctoring section below it and make any non-repeatable statement re-runnable the same way (`ADD COLUMN IF NOT EXISTS`, drop-before-create).

## What you do after
Paste the whole updated file into your SQL editor and run it again. It will finish without errors, and the proctoring columns (which never got applied because the error stopped the script) will be added.
