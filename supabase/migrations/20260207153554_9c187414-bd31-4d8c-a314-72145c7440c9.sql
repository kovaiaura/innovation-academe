-- Create class_assessment_mapping table
CREATE TABLE public.class_assessment_mapping (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  academic_year text NOT NULL DEFAULT '2024-25',
  fa1_assessment_id uuid REFERENCES assessments(id) ON DELETE SET NULL,
  fa2_assessment_id uuid REFERENCES assessments(id) ON DELETE SET NULL,
  final_assessment_id uuid REFERENCES assessments(id) ON DELETE SET NULL,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(class_id, academic_year)
);

-- Create internal_assessment_marks table
CREATE TABLE public.internal_assessment_marks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  marks_obtained numeric(5,2) NOT NULL DEFAULT 0 CHECK (marks_obtained >= 0),
  total_marks numeric(5,2) NOT NULL DEFAULT 100 CHECK (total_marks > 0),
  academic_year text NOT NULL DEFAULT '2024-25',
  entered_by uuid REFERENCES profiles(id),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(class_id, student_id, academic_year)
);

-- Enable RLS
ALTER TABLE public.class_assessment_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_assessment_marks ENABLE ROW LEVEL SECURITY;

-- RLS for class_assessment_mapping
CREATE POLICY "System admins can manage all assessment mappings"
ON public.class_assessment_mapping FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Officers can manage assessment mappings for assigned institutions"
ON public.class_assessment_mapping FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.officer_institution_assignments oia
    WHERE oia.officer_id = auth.uid() AND oia.institution_id = class_assessment_mapping.institution_id
  )
);

CREATE POLICY "Management can manage assessment mappings for their institution"
ON public.class_assessment_mapping FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'management') 
  AND public.get_user_institution_id(auth.uid()) = institution_id
);

-- RLS for internal_assessment_marks
CREATE POLICY "System admins can manage all internal marks"
ON public.internal_assessment_marks FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Officers can manage internal marks for assigned institutions"
ON public.internal_assessment_marks FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.officer_institution_assignments oia
    WHERE oia.officer_id = auth.uid() AND oia.institution_id = internal_assessment_marks.institution_id
  )
);

CREATE POLICY "Management can manage internal marks for their institution"
ON public.internal_assessment_marks FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'management') 
  AND public.get_user_institution_id(auth.uid()) = institution_id
);

CREATE POLICY "Students can view their own internal marks"
ON public.internal_assessment_marks FOR SELECT
TO authenticated
USING (student_id = auth.uid());

-- Add updated_at triggers
CREATE TRIGGER update_class_assessment_mapping_updated_at
  BEFORE UPDATE ON public.class_assessment_mapping
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_internal_assessment_marks_updated_at
  BEFORE UPDATE ON public.internal_assessment_marks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();