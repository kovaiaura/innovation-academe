-- Add INSERT policy for Officers to create manual assessment attempts
-- This allows officers to create manual assessment results for students in their institution

CREATE POLICY "Officers can create institution attempts"
ON public.assessment_attempts
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'officer'::app_role) AND 
  institution_id = get_user_institution_id(auth.uid())
);