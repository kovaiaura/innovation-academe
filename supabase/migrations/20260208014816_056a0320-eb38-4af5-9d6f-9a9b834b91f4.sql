-- Drop ALL existing policies on both tables first
DO $$
DECLARE
    pol RECORD;
BEGIN
    -- Drop all policies on class_assessment_mapping
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'class_assessment_mapping'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.class_assessment_mapping', pol.policyname);
    END LOOP;
    
    -- Drop all policies on internal_assessment_marks
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'internal_assessment_marks'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.internal_assessment_marks', pol.policyname);
    END LOOP;
END $$;

-- class_assessment_mapping policies
-- Admins (CEO/System Admin) can do everything
CREATE POLICY "Admins can manage all mappings"
ON public.class_assessment_mapping
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
  public.has_role(auth.uid(), 'system_admin'::public.app_role)
)
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
  public.has_role(auth.uid(), 'system_admin'::public.app_role)
);

-- Officers can view mapping for their assigned institutions
CREATE POLICY "Officers can view mapping for assigned institutions"
ON public.class_assessment_mapping
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  institution_id = public.get_user_institution_id(auth.uid())
);

-- Officers can insert mapping for their assigned institutions
CREATE POLICY "Officers can insert mapping for assigned institutions"
ON public.class_assessment_mapping
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  institution_id = public.get_user_institution_id(auth.uid())
);

-- Officers can update mapping for their assigned institutions
CREATE POLICY "Officers can update mapping for assigned institutions"
ON public.class_assessment_mapping
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  institution_id = public.get_user_institution_id(auth.uid())
)
WITH CHECK (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  institution_id = public.get_user_institution_id(auth.uid())
);

-- Management can view/manage mapping for their institution
CREATE POLICY "Management can manage mapping for their institution"
ON public.class_assessment_mapping
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'management'::public.app_role) AND
  institution_id = public.get_user_institution_id(auth.uid())
)
WITH CHECK (
  public.has_role(auth.uid(), 'management'::public.app_role) AND
  institution_id = public.get_user_institution_id(auth.uid())
);

-- internal_assessment_marks policies
-- Admins (CEO/System Admin) can do everything
CREATE POLICY "Admins can manage all internal marks"
ON public.internal_assessment_marks
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
  public.has_role(auth.uid(), 'system_admin'::public.app_role)
)
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin'::public.app_role) OR
  public.has_role(auth.uid(), 'system_admin'::public.app_role)
);

-- Officers can view internal marks for their assigned institutions
CREATE POLICY "Officers can view internal marks for assigned institutions"
ON public.internal_assessment_marks
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  institution_id = public.get_user_institution_id(auth.uid())
);

-- Officers can insert internal marks for their assigned institutions
CREATE POLICY "Officers can insert internal marks for assigned institutions"
ON public.internal_assessment_marks
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  institution_id = public.get_user_institution_id(auth.uid())
);

-- Officers can update internal marks for their assigned institutions
CREATE POLICY "Officers can update internal marks for assigned institutions"
ON public.internal_assessment_marks
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  institution_id = public.get_user_institution_id(auth.uid())
)
WITH CHECK (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  institution_id = public.get_user_institution_id(auth.uid())
);

-- Management can view/manage internal marks for their institution
CREATE POLICY "Management can manage internal marks for their institution"
ON public.internal_assessment_marks
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'management'::public.app_role) AND
  institution_id = public.get_user_institution_id(auth.uid())
)
WITH CHECK (
  public.has_role(auth.uid(), 'management'::public.app_role) AND
  institution_id = public.get_user_institution_id(auth.uid())
);