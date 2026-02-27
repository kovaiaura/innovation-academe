
-- Create student_resume_extras table
CREATE TABLE public.student_resume_extras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  about_me text,
  hobbies text[],
  sports_achievements text[],
  linkedin_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(student_id)
);

-- Enable RLS
ALTER TABLE public.student_resume_extras ENABLE ROW LEVEL SECURITY;

-- Students can read their own row
CREATE POLICY "Students can view own resume extras"
ON public.student_resume_extras FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Students can insert their own row
CREATE POLICY "Students can insert own resume extras"
ON public.student_resume_extras FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Students can update their own row
CREATE POLICY "Students can update own resume extras"
ON public.student_resume_extras FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Admins can read all
CREATE POLICY "Admins can view all resume extras"
ON public.student_resume_extras FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR public.has_role(auth.uid(), 'system_admin'::public.app_role)
);

-- Trigger for updated_at
CREATE TRIGGER update_student_resume_extras_updated_at
BEFORE UPDATE ON public.student_resume_extras
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
