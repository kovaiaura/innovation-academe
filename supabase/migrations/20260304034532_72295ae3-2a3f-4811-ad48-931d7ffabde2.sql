
ALTER TABLE public.attendance_corrections ALTER COLUMN attendance_id DROP NOT NULL;

CREATE POLICY "System admins can manage corrections"
ON public.attendance_corrections FOR ALL TO public
USING (public.has_role(auth.uid(), 'system_admin'))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'));

CREATE POLICY "Super admins can manage corrections"
ON public.attendance_corrections FOR ALL TO public
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
