CREATE TABLE public.student_rank_snapshots (
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