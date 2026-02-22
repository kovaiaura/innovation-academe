-- Allow management users to view course assignments for their institution
CREATE POLICY "Management can view own institution course assignments"
ON public.course_institution_assignments
FOR SELECT
USING (
  has_role(auth.uid(), 'management'::app_role) 
  AND institution_id = get_user_institution_id(auth.uid())
);