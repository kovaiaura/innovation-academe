
-- Add course mapping columns to assessment_questions
ALTER TABLE public.assessment_questions
  ADD COLUMN course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL,
  ADD COLUMN module_id uuid REFERENCES public.course_modules(id) ON DELETE SET NULL,
  ADD COLUMN session_id uuid REFERENCES public.course_sessions(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX idx_assessment_questions_course_id ON public.assessment_questions(course_id);
CREATE INDEX idx_assessment_questions_module_id ON public.assessment_questions(module_id);
CREATE INDEX idx_assessment_questions_session_id ON public.assessment_questions(session_id);
