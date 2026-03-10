

# Fix: Create Missing `webinar_institution_assignments` Table

## Problem
The `webinar_institution_assignments` table does not exist in the database. The code references it, and a migration to alter it was created, but the original CREATE TABLE migration was never executed. This is the root cause of the "Failed to load webinars" error.

## Solution
Run a single migration that creates the table (with `class_id` already nullable), adds RLS policies, and drops the orphaned ALTER migration.

### Migration SQL
```sql
CREATE TABLE IF NOT EXISTS public.webinar_institution_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  webinar_id uuid NOT NULL REFERENCES public.webinars(id) ON DELETE CASCADE,
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE,  -- nullable by design
  assigned_by uuid,
  assigned_at timestamptz DEFAULT now()
);

ALTER TABLE public.webinar_institution_assignments ENABLE ROW LEVEL SECURITY;

-- System admins and CEO can manage assignments
CREATE POLICY "Admins can manage webinar assignments"
  ON public.webinar_institution_assignments
  FOR ALL
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'system_admin') OR
    public.has_role(auth.uid(), 'super_admin') OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_ceo = true)
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'system_admin') OR
    public.has_role(auth.uid(), 'super_admin') OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_ceo = true)
  );

-- All authenticated users can read assignments (needed for filtering)
CREATE POLICY "Authenticated users can read webinar assignments"
  ON public.webinar_institution_assignments
  FOR SELECT
  TO authenticated
  USING (true);
```

### Also
- Delete the now-unnecessary `20260310043700` migration file (it tried to ALTER a non-existent table).

| File | Change |
|------|--------|
| **New migration** | CREATE TABLE + RLS policies |
| `supabase/migrations/20260310043700_*.sql` | Delete (redundant ALTER) |

