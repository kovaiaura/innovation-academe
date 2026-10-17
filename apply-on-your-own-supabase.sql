-- ============================================================================
-- apply-on-your-own-supabase.sql
-- Applies the "Upload Report PDF" feature changes to YOUR OWN Supabase project.
--
-- How to use:
--   1. Open your Supabase project dashboard -> SQL Editor.
--   2. Paste this entire file and run it once.
--   3. Safe to run multiple times — every statement is idempotent.
--
-- What it does:
--   - Adds the uploaded_pdf_path column to the reports table.
--   - Creates a private storage bucket named "activity-reports"
--     (alternative: create it manually under Storage -> New bucket, private).
--   - Adds the storage policies that let system/super admins upload and
--     manage report PDFs, and let management users read their own
--     institution's reports.
--
-- Requirements:
--   The functions public.has_role(uuid, app_role) and
--   public.get_user_institution_id(uuid) must already exist in this database.
--   The script checks for them and stops with a clear message if missing.
-- ============================================================================

-- 1. Guard: the storage policies below depend on these two functions.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'has_role'
  ) THEN
    RAISE EXCEPTION 'Missing required function public.has_role(uuid, app_role). Create it before running this script.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'get_user_institution_id'
  ) THEN
    RAISE EXCEPTION 'Missing required function public.get_user_institution_id(uuid). Create it before running this script.';
  END IF;
END
$$;

-- 2. New column used to store the uploaded PDF's storage path.
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS uploaded_pdf_path text;

-- 3. Private bucket for uploaded report PDFs.
--    (Equivalent manual step: Storage -> New bucket -> name "activity-reports", keep it private.)
INSERT INTO storage.buckets (id, name, public)
VALUES ('activity-reports', 'activity-reports', false)
ON CONFLICT (id) DO NOTHING;

-- 4. Storage policies (dropped and re-created so this file is re-runnable).
DROP POLICY IF EXISTS "Admins manage activity report files" ON storage.objects;
CREATE POLICY "Admins manage activity report files" ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'activity-reports' AND (public.has_role(auth.uid(),'system_admin') OR public.has_role(auth.uid(),'super_admin')))
WITH CHECK (bucket_id = 'activity-reports' AND (public.has_role(auth.uid(),'system_admin') OR public.has_role(auth.uid(),'super_admin')));

DROP POLICY IF EXISTS "Management read own institution report files" ON storage.objects;
CREATE POLICY "Management read own institution report files" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'activity-reports' AND public.has_role(auth.uid(),'management')
  AND (storage.foldername(name))[1] = public.get_user_institution_id(auth.uid())::text);

-- ===================================================================
-- 5. Certificates: one certificate per student per level/course.
--    Removes duplicate certificates (keeps the earliest), then adds the
--    unique rule the automatic certificate issuing relies on. Re-runnable.
-- ===================================================================
DELETE FROM public.student_certificates a
USING public.student_certificates b
WHERE a.student_id = b.student_id
  AND a.activity_type = b.activity_type
  AND a.activity_id = b.activity_id
  AND (a.created_at, a.id) > (b.created_at, b.id);

CREATE UNIQUE INDEX IF NOT EXISTS student_certificates_unique_activity
  ON public.student_certificates (student_id, activity_type, activity_id);

-- ===================================================================
-- 6. Speed indexes for progress and certificate screens. Re-runnable.
--    Fixes "statement timeout" on the Certificates page and slow
--    officer Courses tab.
-- ===================================================================
CREATE INDEX IF NOT EXISTS idx_student_certificates_student ON public.student_certificates (student_id);
CREATE INDEX IF NOT EXISTS idx_csc_assignment ON public.class_session_completions (class_assignment_id);
CREATE INDEX IF NOT EXISTS idx_csc_class ON public.class_session_completions (class_id);
CREATE INDEX IF NOT EXISTS idx_csc_student ON public.class_session_completions (student_id);
CREATE INDEX IF NOT EXISTS idx_scc_assignment_student ON public.student_content_completions (class_assignment_id, student_id);
CREATE INDEX IF NOT EXISTS idx_cma_class_assignment ON public.class_module_assignments (class_assignment_id);
CREATE INDEX IF NOT EXISTS idx_csa_module_assignment ON public.class_session_assignments (class_module_assignment_id);
CREATE INDEX IF NOT EXISTS idx_course_content_session_id ON public.course_content (session_id);
CREATE INDEX IF NOT EXISTS idx_cca_class ON public.course_class_assignments (class_id);
CREATE INDEX IF NOT EXISTS idx_students_class ON public.students (class_id);


-- ===== Student rank snapshots (class & institute ranking) =====
CREATE TABLE IF NOT EXISTS public.student_rank_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL,
  academic_year text NOT NULL,
  student_user_id uuid NOT NULL,
  class_id uuid,
  class_rank integer,
  class_size integer,
  institute_rank integer,
  institute_size integer,
  overall_score numeric NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (institution_id, academic_year, student_user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_rank_snapshots TO authenticated;
GRANT ALL ON public.student_rank_snapshots TO service_role;
ALTER TABLE public.student_rank_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students read own rank" ON public.student_rank_snapshots FOR SELECT TO authenticated
  USING (student_user_id = auth.uid());
CREATE POLICY "Staff manage institution ranks" ON public.student_rank_snapshots FOR ALL TO authenticated
  USING ((has_role(auth.uid(),'management') OR has_role(auth.uid(),'officer')) AND institution_id = get_user_institution_id(auth.uid()))
  WITH CHECK ((has_role(auth.uid(),'management') OR has_role(auth.uid(),'officer')) AND institution_id = get_user_institution_id(auth.uid()));
CREATE POLICY "Admins manage ranks" ON public.student_rank_snapshots FOR ALL TO authenticated
  USING (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'system_admin'))
  WITH CHECK (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'system_admin'));
