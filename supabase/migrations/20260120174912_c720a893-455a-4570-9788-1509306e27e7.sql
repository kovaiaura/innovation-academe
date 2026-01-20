-- Allow ALL authenticated users to read site_branding (for sidebar in all roles)
CREATE POLICY "All users can read site branding" 
ON public.system_configurations 
FOR SELECT 
TO authenticated
USING (key = 'site_branding');

-- Allow anonymous/unauthenticated users to read site_branding (for login page)
CREATE POLICY "Public can read site branding" 
ON public.system_configurations 
FOR SELECT 
TO anon
USING (key = 'site_branding');