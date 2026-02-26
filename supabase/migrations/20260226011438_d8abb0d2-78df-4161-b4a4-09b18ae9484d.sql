-- Allow all authenticated users to read about_ims config keys
CREATE POLICY "Authenticated users can read about_ims settings"
ON public.system_configurations
FOR SELECT
USING (key LIKE 'about_ims_%');