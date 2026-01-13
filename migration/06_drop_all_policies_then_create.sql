-- =============================================
-- DROP ALL EXISTING POLICIES THEN CREATE NEW ONES
-- This script ensures clean slate by dropping ALL policies first
-- =============================================

-- =============================================
-- SECTION 0: DROP ALL EXISTING POLICIES
-- =============================================

DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- =============================================
-- SECTION 1: ENABLE RLS ON ALL TABLES
-- =============================================

ALTER TABLE public.ai_prompt_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appraisal_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_class_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_class_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_day_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificate_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_module_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_session_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_session_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_log_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_class_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_institution_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_contract_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_work_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_class_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_rating_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.id_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_timetable_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_number_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_approval_hierarchy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_balance_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.officer_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.officer_class_access_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.officer_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.officer_institution_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.officers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.overtime_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_appraisals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_progress_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_approval_chain ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reserved_invoice_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_content_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_response_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webinars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_rules ENABLE ROW LEVEL SECURITY;

-- =============================================
-- SECTION 2: AI_PROMPT_USAGE POLICIES (2)
-- =============================================

CREATE POLICY "Service role has full access to ai_prompt_usage"
ON public.ai_prompt_usage
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Users can view their own prompt usage"
ON public.ai_prompt_usage
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- =============================================
-- SECTION 3: APPRAISAL_PROJECTS POLICIES (4)
-- =============================================

CREATE POLICY "Super admin full access to appraisal_projects"
ON public.appraisal_projects
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Management can view institution appraisal_projects"
ON public.appraisal_projects
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'management'::public.app_role) AND
  EXISTS (
    SELECT 1 FROM public.performance_appraisals pa
    JOIN public.officers o ON pa.trainer_id = o.id
    WHERE pa.id = appraisal_projects.appraisal_id
    AND o.institution_id = public.get_user_institution_id(auth.uid())
  )
);

CREATE POLICY "Officers can view their own appraisal_projects"
ON public.appraisal_projects
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  EXISTS (
    SELECT 1 FROM public.performance_appraisals pa
    JOIN public.officers o ON pa.trainer_id = o.id
    WHERE pa.id = appraisal_projects.appraisal_id
    AND o.user_id = auth.uid()
  )
);

CREATE POLICY "Officers can manage their own appraisal_projects"
ON public.appraisal_projects
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  EXISTS (
    SELECT 1 FROM public.performance_appraisals pa
    JOIN public.officers o ON pa.trainer_id = o.id
    WHERE pa.id = appraisal_projects.appraisal_id
    AND o.user_id = auth.uid()
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  EXISTS (
    SELECT 1 FROM public.performance_appraisals pa
    JOIN public.officers o ON pa.trainer_id = o.id
    WHERE pa.id = appraisal_projects.appraisal_id
    AND o.user_id = auth.uid()
  )
);

-- =============================================
-- SECTION 4: ASSESSMENT_ANSWERS POLICIES (6)
-- =============================================

CREATE POLICY "Super admin full access to assessment_answers"
ON public.assessment_answers
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Students can insert their own assessment_answers"
ON public.assessment_answers
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'student'::public.app_role) AND
  EXISTS (
    SELECT 1 FROM public.assessment_attempts aa
    WHERE aa.id = assessment_answers.attempt_id
    AND aa.student_id = auth.uid()
  )
);

CREATE POLICY "Students can view their own assessment_answers"
ON public.assessment_answers
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'student'::public.app_role) AND
  EXISTS (
    SELECT 1 FROM public.assessment_attempts aa
    WHERE aa.id = assessment_answers.attempt_id
    AND aa.student_id = auth.uid()
  )
);

CREATE POLICY "Students can update their own assessment_answers"
ON public.assessment_answers
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'student'::public.app_role) AND
  EXISTS (
    SELECT 1 FROM public.assessment_attempts aa
    WHERE aa.id = assessment_answers.attempt_id
    AND aa.student_id = auth.uid()
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'student'::public.app_role) AND
  EXISTS (
    SELECT 1 FROM public.assessment_attempts aa
    WHERE aa.id = assessment_answers.attempt_id
    AND aa.student_id = auth.uid()
  )
);

CREATE POLICY "Officers can view institution assessment_answers"
ON public.assessment_answers
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  EXISTS (
    SELECT 1 FROM public.assessment_attempts aa
    WHERE aa.id = assessment_answers.attempt_id
    AND aa.institution_id = public.get_user_institution_id(auth.uid())
  )
);

CREATE POLICY "Management can view institution assessment_answers"
ON public.assessment_answers
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'management'::public.app_role) AND
  EXISTS (
    SELECT 1 FROM public.assessment_attempts aa
    WHERE aa.id = assessment_answers.attempt_id
    AND aa.institution_id = public.get_user_institution_id(auth.uid())
  )
);

-- =============================================
-- SECTION 5: ASSESSMENT_ATTEMPTS POLICIES (7)
-- =============================================

CREATE POLICY "Super admin full access to assessment_attempts"
ON public.assessment_attempts
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Students can insert their own assessment_attempts"
ON public.assessment_attempts
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'student'::public.app_role) AND
  student_id = auth.uid()
);

CREATE POLICY "Students can view their own assessment_attempts"
ON public.assessment_attempts
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'student'::public.app_role) AND
  student_id = auth.uid()
);

CREATE POLICY "Students can update their own assessment_attempts"
ON public.assessment_attempts
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'student'::public.app_role) AND
  student_id = auth.uid()
)
WITH CHECK (
  public.has_role(auth.uid(), 'student'::public.app_role) AND
  student_id = auth.uid()
);

CREATE POLICY "Officers can view institution assessment_attempts"
ON public.assessment_attempts
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  institution_id = public.get_user_institution_id(auth.uid())
);

CREATE POLICY "Officers can update institution assessment_attempts"
ON public.assessment_attempts
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

CREATE POLICY "Management can view institution assessment_attempts"
ON public.assessment_attempts
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'management'::public.app_role) AND
  institution_id = public.get_user_institution_id(auth.uid())
);

-- =============================================
-- SECTION 6: ASSESSMENT_CLASS_ASSIGNMENTS POLICIES (4)
-- =============================================

CREATE POLICY "Super admin full access to assessment_class_assignments"
ON public.assessment_class_assignments
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Officers can manage institution assessment_class_assignments"
ON public.assessment_class_assignments
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  institution_id = public.get_user_institution_id(auth.uid())
)
WITH CHECK (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  institution_id = public.get_user_institution_id(auth.uid())
);

CREATE POLICY "Management can view institution assessment_class_assignments"
ON public.assessment_class_assignments
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'management'::public.app_role) AND
  institution_id = public.get_user_institution_id(auth.uid())
);

CREATE POLICY "Students can view their class assessment_class_assignments"
ON public.assessment_class_assignments
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'student'::public.app_role) AND
  EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.user_id = auth.uid()
    AND s.class_id = assessment_class_assignments.class_id
  )
);

-- =============================================
-- SECTION 7: ASSESSMENT_QUESTIONS POLICIES (6)
-- =============================================

CREATE POLICY "Super admin full access to assessment_questions"
ON public.assessment_questions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Officers can manage their own assessment_questions"
ON public.assessment_questions
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  EXISTS (
    SELECT 1 FROM public.assessments a
    WHERE a.id = assessment_questions.assessment_id
    AND a.created_by = auth.uid()
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  EXISTS (
    SELECT 1 FROM public.assessments a
    WHERE a.id = assessment_questions.assessment_id
    AND a.created_by = auth.uid()
  )
);

CREATE POLICY "Officers can view institution assessment_questions"
ON public.assessment_questions
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  EXISTS (
    SELECT 1 FROM public.assessments a
    WHERE a.id = assessment_questions.assessment_id
    AND a.institution_id = public.get_user_institution_id(auth.uid())
  )
);

CREATE POLICY "Management can view institution assessment_questions"
ON public.assessment_questions
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'management'::public.app_role) AND
  EXISTS (
    SELECT 1 FROM public.assessments a
    WHERE a.id = assessment_questions.assessment_id
    AND a.institution_id = public.get_user_institution_id(auth.uid())
  )
);

CREATE POLICY "Students can view published assessment_questions"
ON public.assessment_questions
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'student'::public.app_role) AND
  EXISTS (
    SELECT 1 FROM public.assessments a
    JOIN public.assessment_class_assignments aca ON a.id = aca.assessment_id
    JOIN public.students s ON s.class_id = aca.class_id
    WHERE a.id = assessment_questions.assessment_id
    AND s.user_id = auth.uid()
    AND a.status = 'published'
  )
);

CREATE POLICY "System admin full access to assessment_questions"
ON public.assessment_questions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 8: ASSESSMENTS POLICIES (5)
-- =============================================

CREATE POLICY "Super admin full access to assessments"
ON public.assessments
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Officers can manage their own assessments"
ON public.assessments
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  created_by = auth.uid()
)
WITH CHECK (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  created_by = auth.uid()
);

CREATE POLICY "Officers can view institution assessments"
ON public.assessments
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  institution_id = public.get_user_institution_id(auth.uid())
);

CREATE POLICY "Management can view institution assessments"
ON public.assessments
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'management'::public.app_role) AND
  institution_id = public.get_user_institution_id(auth.uid())
);

CREATE POLICY "Students can view published assessments assigned to their class"
ON public.assessments
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'student'::public.app_role) AND
  status = 'published' AND
  EXISTS (
    SELECT 1 FROM public.assessment_class_assignments aca
    JOIN public.students s ON s.class_id = aca.class_id
    WHERE aca.assessment_id = assessments.id
    AND s.user_id = auth.uid()
  )
);

-- =============================================
-- SECTION 9: ASSIGNMENT_CLASS_ASSIGNMENTS POLICIES (4)
-- =============================================

CREATE POLICY "Super admin full access to assignment_class_assignments"
ON public.assignment_class_assignments
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Officers can manage institution assignment_class_assignments"
ON public.assignment_class_assignments
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  institution_id = public.get_user_institution_id(auth.uid())
)
WITH CHECK (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  institution_id = public.get_user_institution_id(auth.uid())
);

CREATE POLICY "Management can view institution assignment_class_assignments"
ON public.assignment_class_assignments
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'management'::public.app_role) AND
  institution_id = public.get_user_institution_id(auth.uid())
);

CREATE POLICY "Students can view their class assignment_class_assignments"
ON public.assignment_class_assignments
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'student'::public.app_role) AND
  EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.user_id = auth.uid()
    AND s.class_id = assignment_class_assignments.class_id
  )
);

-- =============================================
-- SECTION 10: ASSIGNMENT_SUBMISSIONS POLICIES (6)
-- =============================================

CREATE POLICY "Super admin full access to assignment_submissions"
ON public.assignment_submissions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Students can manage their own assignment_submissions"
ON public.assignment_submissions
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'student'::public.app_role) AND
  student_id = auth.uid()
)
WITH CHECK (
  public.has_role(auth.uid(), 'student'::public.app_role) AND
  student_id = auth.uid()
);

CREATE POLICY "Officers can view institution assignment_submissions"
ON public.assignment_submissions
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  institution_id = public.get_user_institution_id(auth.uid())
);

CREATE POLICY "Officers can update institution assignment_submissions"
ON public.assignment_submissions
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

CREATE POLICY "Management can view institution assignment_submissions"
ON public.assignment_submissions
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'management'::public.app_role) AND
  institution_id = public.get_user_institution_id(auth.uid())
);

CREATE POLICY "System admin full access to assignment_submissions"
ON public.assignment_submissions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 11: ASSIGNMENTS POLICIES (5)
-- =============================================

CREATE POLICY "Super admin full access to assignments"
ON public.assignments
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Officers can manage their own assignments"
ON public.assignments
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  created_by = auth.uid()
)
WITH CHECK (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  created_by = auth.uid()
);

CREATE POLICY "Officers can view institution assignments"
ON public.assignments
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  institution_id = public.get_user_institution_id(auth.uid())
);

CREATE POLICY "Management can view institution assignments"
ON public.assignments
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'management'::public.app_role) AND
  institution_id = public.get_user_institution_id(auth.uid())
);

CREATE POLICY "Students can view published assignments assigned to their class"
ON public.assignments
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'student'::public.app_role) AND
  status = 'published' AND
  EXISTS (
    SELECT 1 FROM public.assignment_class_assignments aca
    JOIN public.students s ON s.class_id = aca.class_id
    WHERE aca.assignment_id = assignments.id
    AND s.user_id = auth.uid()
  )
);

-- =============================================
-- SECTION 12: ATTENDANCE_CORRECTIONS POLICIES (4)
-- =============================================

CREATE POLICY "Super admin full access to attendance_corrections"
ON public.attendance_corrections
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "System admin full access to attendance_corrections"
ON public.attendance_corrections
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

CREATE POLICY "Officers can view attendance_corrections"
ON public.attendance_corrections
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'officer'::public.app_role));

CREATE POLICY "Officers can create attendance_corrections"
ON public.attendance_corrections
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'officer'::public.app_role));

-- =============================================
-- SECTION 13: CALENDAR_DAY_TYPES POLICIES (4)
-- =============================================

CREATE POLICY "Super admin full access to calendar_day_types"
ON public.calendar_day_types
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "System admin full access to calendar_day_types"
ON public.calendar_day_types
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

CREATE POLICY "Authenticated can view calendar_day_types"
ON public.calendar_day_types
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Management can manage institution calendar_day_types"
ON public.calendar_day_types
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

-- =============================================
-- SECTION 14: CANDIDATE_INTERVIEWS POLICIES (3)
-- =============================================

CREATE POLICY "Super admin full access to candidate_interviews"
ON public.candidate_interviews
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "System admin full access to candidate_interviews"
ON public.candidate_interviews
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

CREATE POLICY "Management can view candidate_interviews"
ON public.candidate_interviews
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'management'::public.app_role));

-- =============================================
-- SECTION 15: CANDIDATE_OFFERS POLICIES (3)
-- =============================================

CREATE POLICY "Super admin full access to candidate_offers"
ON public.candidate_offers
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "System admin full access to candidate_offers"
ON public.candidate_offers
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

CREATE POLICY "Management can view candidate_offers"
ON public.candidate_offers
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'management'::public.app_role));

-- =============================================
-- SECTION 16: CERTIFICATE_TEMPLATES POLICIES (3)
-- =============================================

CREATE POLICY "Super admin full access to certificate_templates"
ON public.certificate_templates
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "System admin full access to certificate_templates"
ON public.certificate_templates
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

CREATE POLICY "Authenticated can view active certificate_templates"
ON public.certificate_templates
FOR SELECT
TO authenticated
USING (is_active = true);

-- =============================================
-- SECTION 17: CLASS_MODULE_ASSIGNMENTS POLICIES (5)
-- =============================================

CREATE POLICY "Super admin full access to class_module_assignments"
ON public.class_module_assignments
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Officers can manage class_module_assignments"
ON public.class_module_assignments
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'officer'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'officer'::public.app_role));

CREATE POLICY "Students can view their class_module_assignments"
ON public.class_module_assignments
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'student'::public.app_role) AND
  EXISTS (
    SELECT 1 FROM public.course_class_assignments cca
    JOIN public.students s ON s.class_id = cca.class_id
    WHERE cca.id = class_module_assignments.class_assignment_id
    AND s.user_id = auth.uid()
  )
);

CREATE POLICY "Management can view class_module_assignments"
ON public.class_module_assignments
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'management'::public.app_role));

CREATE POLICY "System admin full access to class_module_assignments"
ON public.class_module_assignments
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 18: CLASS_SESSION_ASSIGNMENTS POLICIES (5)
-- =============================================

CREATE POLICY "Super admin full access to class_session_assignments"
ON public.class_session_assignments
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Officers can manage class_session_assignments"
ON public.class_session_assignments
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'officer'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'officer'::public.app_role));

CREATE POLICY "Students can view their class_session_assignments"
ON public.class_session_assignments
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'student'::public.app_role) AND
  EXISTS (
    SELECT 1 FROM public.class_module_assignments cma
    JOIN public.course_class_assignments cca ON cca.id = cma.class_assignment_id
    JOIN public.students s ON s.class_id = cca.class_id
    WHERE cma.id = class_session_assignments.class_module_assignment_id
    AND s.user_id = auth.uid()
  )
);

CREATE POLICY "Management can view class_session_assignments"
ON public.class_session_assignments
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'management'::public.app_role));

CREATE POLICY "System admin full access to class_session_assignments"
ON public.class_session_assignments
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 19: CLASS_SESSION_ATTENDANCE POLICIES (5)
-- =============================================

CREATE POLICY "Super admin full access to class_session_attendance"
ON public.class_session_attendance
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Officers can manage institution class_session_attendance"
ON public.class_session_attendance
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  institution_id = public.get_user_institution_id(auth.uid())
)
WITH CHECK (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  institution_id = public.get_user_institution_id(auth.uid())
);

CREATE POLICY "Students can view their class class_session_attendance"
ON public.class_session_attendance
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'student'::public.app_role) AND
  EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.user_id = auth.uid()
    AND s.class_id = class_session_attendance.class_id
  )
);

CREATE POLICY "Management can view institution class_session_attendance"
ON public.class_session_attendance
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'management'::public.app_role) AND
  institution_id = public.get_user_institution_id(auth.uid())
);

CREATE POLICY "System admin full access to class_session_attendance"
ON public.class_session_attendance
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 20: CLASSES POLICIES (5)
-- =============================================

CREATE POLICY "Super admin full access to classes"
ON public.classes
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Officers can view institution classes"
ON public.classes
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  institution_id = public.get_user_institution_id(auth.uid())
);

CREATE POLICY "Management can manage institution classes"
ON public.classes
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

CREATE POLICY "Students can view their own class"
ON public.classes
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'student'::public.app_role) AND
  EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.user_id = auth.uid()
    AND s.class_id = classes.id
  )
);

CREATE POLICY "System admin full access to classes"
ON public.classes
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- Due to file size limits, this file continues with remaining policies
-- See migration/06_drop_all_policies_then_create_part2.sql for the rest
