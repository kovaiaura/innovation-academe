ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS uploaded_pdf_path text;

CREATE POLICY "Admins manage activity report files" ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'activity-reports' AND (public.has_role(auth.uid(),'system_admin') OR public.has_role(auth.uid(),'super_admin')))
WITH CHECK (bucket_id = 'activity-reports' AND (public.has_role(auth.uid(),'system_admin') OR public.has_role(auth.uid(),'super_admin')));

CREATE POLICY "Management read own institution report files" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'activity-reports' AND public.has_role(auth.uid(),'management')
  AND (storage.foldername(name))[1] = public.get_user_institution_id(auth.uid())::text);