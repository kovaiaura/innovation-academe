
-- Create student_transfers audit table
CREATE TABLE public.student_transfers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  from_class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  to_class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE SET NULL,
  transferred_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason TEXT,
  transferred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.student_transfers ENABLE ROW LEVEL SECURITY;

-- RLS: system_admin and management can read
CREATE POLICY "system_admin_and_management_can_read_transfers"
ON public.student_transfers FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'system_admin'::public.app_role)
  OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR (
    public.get_user_institution_id(auth.uid()) = institution_id
  )
);

-- RLS: system_admin and management can insert
CREATE POLICY "system_admin_and_management_can_insert_transfers"
ON public.student_transfers FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'system_admin'::public.app_role)
  OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
  OR (
    public.get_user_institution_id(auth.uid()) = institution_id
  )
);
