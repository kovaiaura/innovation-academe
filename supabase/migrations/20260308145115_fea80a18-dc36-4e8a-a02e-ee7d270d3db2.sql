
-- Add github_url to student_resume_extras
ALTER TABLE public.student_resume_extras ADD COLUMN IF NOT EXISTS github_url text;

-- Create student_internships table
CREATE TABLE public.student_internships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  role_title text NOT NULL,
  duration text NOT NULL,
  responsibilities text,
  start_date date,
  end_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create student_certifications table (user-added, not LMS-earned)
CREATE TABLE public.student_certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  certification_name text NOT NULL,
  issuing_organization text,
  issue_date date,
  expiry_date date,
  credential_id text,
  credential_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS for student_internships
ALTER TABLE public.student_internships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own internships"
  ON public.student_internships FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Students can insert own internships"
  ON public.student_internships FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Students can update own internships"
  ON public.student_internships FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Students can delete own internships"
  ON public.student_internships FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS for student_certifications
ALTER TABLE public.student_certifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own certifications"
  ON public.student_certifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Students can insert own certifications"
  ON public.student_certifications FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Students can update own certifications"
  ON public.student_certifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Students can delete own certifications"
  ON public.student_certifications FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
