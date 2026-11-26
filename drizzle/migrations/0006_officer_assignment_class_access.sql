CREATE OR REPLACE FUNCTION public.officer_can_access_assignment_class(_user_id uuid, _class_id uuid, _institution_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
  SELECT public.has_role(_user_id, 'officer'::public.app_role)
    AND _institution_id = public.get_user_institution_id(_user_id)
    AND EXISTS (
      SELECT 1
      FROM public.officers o
      WHERE o.user_id = _user_id
        AND o.status = 'active'
        AND (
          EXISTS (
            SELECT 1
            FROM public.institution_timetable_assignments ita
            WHERE ita.institution_id = _institution_id
              AND ita.class_id = _class_id
              AND (ita.teacher_id = o.id OR ita.secondary_officer_id = o.id OR ita.backup_officer_id = o.id)
          )
          OR EXISTS (
            SELECT 1
            FROM public.officer_class_access_grants g
            WHERE g.receiving_officer_id = o.id
              AND g.institution_id = _institution_id
              AND g.class_id = _class_id
              AND g.is_active = true
              AND g.valid_from <= CURRENT_DATE
              AND (g.valid_until IS NULL OR g.valid_until >= CURRENT_DATE)
          )
        )
    );
$$;

CREATE OR REPLACE FUNCTION public.officer_owns_assignment(_user_id uuid, _assignment_id uuid, _institution_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
  SELECT public.has_role(_user_id, 'officer'::public.app_role)
    AND _institution_id = public.get_user_institution_id(_user_id)
    AND EXISTS (
      SELECT 1
      FROM public.assignments a
      WHERE a.id = _assignment_id
        AND a.institution_id = _institution_id
        AND a.created_by = _user_id
        AND a.created_by_role = 'officer'
    );
$$;

REVOKE ALL ON FUNCTION public.officer_can_access_assignment_class(uuid, uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.officer_can_access_assignment_class(uuid, uuid, uuid) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.officer_owns_assignment(uuid, uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.officer_owns_assignment(uuid, uuid, uuid) TO authenticated, service_role;

DROP POLICY IF EXISTS "Officers can manage own institution assignments" ON public.assignments;
CREATE POLICY "Officers can view assignments for assigned classes"
ON public.assignments FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'officer'::public.app_role)
  AND institution_id = public.get_user_institution_id(auth.uid())
  AND (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.assignment_class_assignments aca
      WHERE aca.assignment_id = assignments.id
        AND aca.institution_id = assignments.institution_id
        AND public.officer_can_access_assignment_class(auth.uid(), aca.class_id, aca.institution_id)
    )
  )
);
CREATE POLICY "Officers can create own institution assignments"
ON public.assignments FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'officer'::public.app_role)
  AND institution_id = public.get_user_institution_id(auth.uid())
  AND created_by = auth.uid()
  AND created_by_role = 'officer'
);
CREATE POLICY "Officers can update own assigned-class assignments"
ON public.assignments FOR UPDATE TO authenticated
USING (
  public.officer_owns_assignment(auth.uid(), id, institution_id)
  AND EXISTS (
    SELECT 1 FROM public.assignment_class_assignments aca
    WHERE aca.assignment_id = assignments.id
      AND public.officer_can_access_assignment_class(auth.uid(), aca.class_id, aca.institution_id)
  )
)
WITH CHECK (
  public.officer_owns_assignment(auth.uid(), id, institution_id)
);
CREATE POLICY "Officers can delete own assigned-class assignments"
ON public.assignments FOR DELETE TO authenticated
USING (
  public.officer_owns_assignment(auth.uid(), id, institution_id)
  AND EXISTS (
    SELECT 1 FROM public.assignment_class_assignments aca
    WHERE aca.assignment_id = assignments.id
      AND public.officer_can_access_assignment_class(auth.uid(), aca.class_id, aca.institution_id)
  )
);

DROP POLICY IF EXISTS "Officers can manage institution assignment class assignments" ON public.assignment_class_assignments;
CREATE POLICY "Officers can view assigned class assignment links"
ON public.assignment_class_assignments FOR SELECT TO authenticated
USING (public.officer_can_access_assignment_class(auth.uid(), class_id, institution_id));
CREATE POLICY "Officers can add own assignment links to assigned classes"
ON public.assignment_class_assignments FOR INSERT TO authenticated
WITH CHECK (
  public.officer_can_access_assignment_class(auth.uid(), class_id, institution_id)
  AND public.officer_owns_assignment(auth.uid(), assignment_id, institution_id)
  AND assigned_by = auth.uid()
);
CREATE POLICY "Officers can remove own assignment links from assigned classes"
ON public.assignment_class_assignments FOR DELETE TO authenticated
USING (
  public.officer_can_access_assignment_class(auth.uid(), class_id, institution_id)
  AND public.officer_owns_assignment(auth.uid(), assignment_id, institution_id)
);

DROP POLICY IF EXISTS "Officers can manage institution submissions" ON public.assignment_submissions;
CREATE POLICY "Officers can view submissions for assigned classes"
ON public.assignment_submissions FOR SELECT TO authenticated
USING (
  public.officer_can_access_assignment_class(auth.uid(), class_id, institution_id)
  AND EXISTS (
    SELECT 1 FROM public.assignment_class_assignments aca
    WHERE aca.assignment_id = assignment_submissions.assignment_id
      AND aca.class_id = assignment_submissions.class_id
      AND aca.institution_id = assignment_submissions.institution_id
  )
);
CREATE POLICY "Officers can grade submissions for assigned classes"
ON public.assignment_submissions FOR UPDATE TO authenticated
USING (
  public.officer_can_access_assignment_class(auth.uid(), class_id, institution_id)
  AND EXISTS (
    SELECT 1 FROM public.assignment_class_assignments aca
    WHERE aca.assignment_id = assignment_submissions.assignment_id
      AND aca.class_id = assignment_submissions.class_id
      AND aca.institution_id = assignment_submissions.institution_id
  )
)
WITH CHECK (
  public.officer_can_access_assignment_class(auth.uid(), class_id, institution_id)
  AND graded_by = auth.uid()
  AND status = 'graded'
  AND marks_obtained IS NOT NULL
  AND marks_obtained >= 0
  AND EXISTS (
    SELECT 1
    FROM public.assignments a
    JOIN public.assignment_class_assignments aca
      ON aca.assignment_id = a.id
      AND aca.class_id = assignment_submissions.class_id
      AND aca.institution_id = assignment_submissions.institution_id
    WHERE a.id = assignment_submissions.assignment_id
      AND (a.total_marks IS NULL OR marks_obtained <= a.total_marks)
  )
);