CREATE TABLE public.class_session_completions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id uuid,
  class_id uuid NOT NULL,
  class_assignment_id uuid NOT NULL,
  course_id uuid,
  module_id uuid,
  session_id uuid NOT NULL,
  student_id uuid NOT NULL,
  attendance_id uuid,
  source text NOT NULL DEFAULT 'officer_marked',
  completed_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT class_session_completions_unique UNIQUE (student_id, session_id, class_assignment_id)
);

CREATE INDEX idx_csc_class ON public.class_session_completions (class_id);
CREATE INDEX idx_csc_student ON public.class_session_completions (student_id);
CREATE INDEX idx_csc_assignment ON public.class_session_completions (class_assignment_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.class_session_completions TO authenticated;
GRANT ALL ON public.class_session_completions TO service_role;

ALTER TABLE public.class_session_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view session completions"
ON public.class_session_completions FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Staff can insert session completions"
ON public.class_session_completions FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin') OR
  public.has_role(auth.uid(), 'system_admin') OR
  public.has_role(auth.uid(), 'management') OR
  public.has_role(auth.uid(), 'officer') OR
  public.has_role(auth.uid(), 'teacher')
);

CREATE POLICY "Staff can update session completions"
ON public.class_session_completions FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin') OR
  public.has_role(auth.uid(), 'system_admin') OR
  public.has_role(auth.uid(), 'management') OR
  public.has_role(auth.uid(), 'officer') OR
  public.has_role(auth.uid(), 'teacher')
);

CREATE POLICY "Admins can delete session completions"
ON public.class_session_completions FOR DELETE TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin') OR
  public.has_role(auth.uid(), 'system_admin')
);

CREATE TRIGGER update_class_session_completions_updated_at
BEFORE UPDATE ON public.class_session_completions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.class_session_attendance
  ADD COLUMN IF NOT EXISTS covered_session_ids jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS covered_course_id uuid;