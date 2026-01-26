-- Create helper function to check if two students share a project
CREATE OR REPLACE FUNCTION public.students_share_project(viewer_user_id uuid, target_student_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM project_members pm1
    JOIN project_members pm2 ON pm1.project_id = pm2.project_id
    JOIN students s ON s.id = pm1.student_id
    WHERE s.user_id = viewer_user_id
    AND pm2.student_id = target_student_id
  )
$$;

-- Add RLS policy allowing students to view project teammates
CREATE POLICY "Students can view project teammates"
ON public.students
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'student'::public.app_role) 
  AND public.students_share_project(auth.uid(), id)
);