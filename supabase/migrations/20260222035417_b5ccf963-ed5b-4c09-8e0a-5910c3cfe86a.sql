
-- Add granular selection columns to course_institution_assignments
ALTER TABLE public.course_institution_assignments 
ADD COLUMN IF NOT EXISTS selected_module_ids uuid[] DEFAULT NULL,
ADD COLUMN IF NOT EXISTS selected_session_ids uuid[] DEFAULT NULL;

-- Add comment explaining the columns
COMMENT ON COLUMN public.course_institution_assignments.selected_module_ids IS 'If NULL, all modules are visible. If set, only listed module IDs are visible to the institution.';
COMMENT ON COLUMN public.course_institution_assignments.selected_session_ids IS 'If NULL, all sessions are visible. If set, only listed session IDs are visible to the institution.';
