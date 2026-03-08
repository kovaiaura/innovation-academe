-- Create student_educations table for additional education entries
CREATE TABLE public.student_educations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  institution_name text NOT NULL,
  degree_or_course text NOT NULL,
  field_of_study text,
  start_year text,
  end_year text,
  grade_or_percentage text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create index for performance
CREATE INDEX idx_student_educations_student_id ON public.student_educations(student_id);
CREATE INDEX idx_student_educations_user_id ON public.student_educations(user_id);

-- Enable RLS
ALTER TABLE public.student_educations ENABLE ROW LEVEL SECURITY;

-- RLS policies: students can manage their own education entries
CREATE POLICY "Students can view their own educations"
  ON public.student_educations
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Students can insert their own educations"
  ON public.student_educations
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Students can update their own educations"
  ON public.student_educations
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Students can delete their own educations"
  ON public.student_educations
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_student_educations_updated_at
  BEFORE UPDATE ON public.student_educations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();