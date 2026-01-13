-- =============================================
-- COMPLETE RLS POLICIES MIGRATION (FIXED)
-- Generated from Lovable Cloud Database
-- Total: 461 policies across 103 tables
-- FIXED: Replaced 'admin' and 'ceo' with valid enum values
-- Valid app_role values: super_admin, system_admin, management, officer, student
-- =============================================

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
    JOIN public.officers o ON pa.officer_id = o.id
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
    JOIN public.officers o ON pa.officer_id = o.id
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
    JOIN public.officers o ON pa.officer_id = o.id
    WHERE pa.id = appraisal_projects.appraisal_id
    AND o.user_id = auth.uid()
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  EXISTS (
    SELECT 1 FROM public.performance_appraisals pa
    JOIN public.officers o ON pa.officer_id = o.id
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
-- SECTION 8: ASSESSMENTS POLICIES (7)
-- =============================================

CREATE POLICY "Super admin full access to assessments"
ON public.assessments
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Officers can create assessments"
ON public.assessments
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  created_by = auth.uid()
);

CREATE POLICY "Officers can view their own assessments"
ON public.assessments
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  created_by = auth.uid()
);

CREATE POLICY "Officers can update their own assessments"
ON public.assessments
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  created_by = auth.uid()
)
WITH CHECK (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  created_by = auth.uid()
);

CREATE POLICY "Officers can delete their own assessments"
ON public.assessments
FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  created_by = auth.uid()
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
-- SECTION 10: ASSIGNMENT_SUBMISSIONS POLICIES (4)
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

CREATE POLICY "Officers can view and grade institution assignment_submissions"
ON public.assignment_submissions
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

CREATE POLICY "Management can view institution assignment_submissions"
ON public.assignment_submissions
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'management'::public.app_role) AND
  institution_id = public.get_user_institution_id(auth.uid())
);

-- =============================================
-- SECTION 11: ASSIGNMENTS POLICIES (4)
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
-- SECTION 12: ATTENDANCE_CORRECTIONS POLICIES (2)
-- =============================================

CREATE POLICY "Super admin can manage attendance_corrections"
ON public.attendance_corrections
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "System admin can manage attendance_corrections"
ON public.attendance_corrections
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 13: CALENDAR_DAY_TYPES POLICIES (4)
-- =============================================

CREATE POLICY "Authenticated users can view calendar_day_types"
ON public.calendar_day_types
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert calendar_day_types"
ON public.calendar_day_types
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update calendar_day_types"
ON public.calendar_day_types
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete calendar_day_types"
ON public.calendar_day_types
FOR DELETE
TO authenticated
USING (true);

-- =============================================
-- SECTION 14: CANDIDATE_INTERVIEWS POLICIES (2)
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

-- =============================================
-- SECTION 15: CANDIDATE_OFFERS POLICIES (2)
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

-- =============================================
-- SECTION 16: CERTIFICATE_TEMPLATES POLICIES (3)
-- =============================================

CREATE POLICY "Anyone can view active certificate_templates"
ON public.certificate_templates
FOR SELECT
TO authenticated
USING (is_active = true);

CREATE POLICY "Super admin can manage certificate_templates"
ON public.certificate_templates
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "System admin can manage certificate_templates"
ON public.certificate_templates
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 17: CLASS_MODULE_ASSIGNMENTS POLICIES (5)
-- =============================================

CREATE POLICY "Super admin full access to class_module_assignments"
ON public.class_module_assignments
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Officers can view institution class_module_assignments"
ON public.class_module_assignments
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  EXISTS (
    SELECT 1 FROM public.course_class_assignments cca
    WHERE cca.id = class_module_assignments.class_assignment_id
    AND cca.institution_id = public.get_user_institution_id(auth.uid())
  )
);

CREATE POLICY "Management can view institution class_module_assignments"
ON public.class_module_assignments
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'management'::public.app_role) AND
  EXISTS (
    SELECT 1 FROM public.course_class_assignments cca
    WHERE cca.id = class_module_assignments.class_assignment_id
    AND cca.institution_id = public.get_user_institution_id(auth.uid())
  )
);

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

CREATE POLICY "Officers can manage institution class_module_assignments"
ON public.class_module_assignments
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  EXISTS (
    SELECT 1 FROM public.course_class_assignments cca
    WHERE cca.id = class_module_assignments.class_assignment_id
    AND cca.institution_id = public.get_user_institution_id(auth.uid())
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  EXISTS (
    SELECT 1 FROM public.course_class_assignments cca
    WHERE cca.id = class_module_assignments.class_assignment_id
    AND cca.institution_id = public.get_user_institution_id(auth.uid())
  )
);

-- =============================================
-- SECTION 18: CLASS_SESSION_ASSIGNMENTS POLICIES (5)
-- =============================================

CREATE POLICY "Super admin full access to class_session_assignments"
ON public.class_session_assignments
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Officers can view institution class_session_assignments"
ON public.class_session_assignments
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  EXISTS (
    SELECT 1 FROM public.class_module_assignments cma
    JOIN public.course_class_assignments cca ON cca.id = cma.class_assignment_id
    WHERE cma.id = class_session_assignments.class_module_assignment_id
    AND cca.institution_id = public.get_user_institution_id(auth.uid())
  )
);

CREATE POLICY "Management can view institution class_session_assignments"
ON public.class_session_assignments
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'management'::public.app_role) AND
  EXISTS (
    SELECT 1 FROM public.class_module_assignments cma
    JOIN public.course_class_assignments cca ON cca.id = cma.class_assignment_id
    WHERE cma.id = class_session_assignments.class_module_assignment_id
    AND cca.institution_id = public.get_user_institution_id(auth.uid())
  )
);

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

CREATE POLICY "Officers can manage institution class_session_assignments"
ON public.class_session_assignments
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  EXISTS (
    SELECT 1 FROM public.class_module_assignments cma
    JOIN public.course_class_assignments cca ON cca.id = cma.class_assignment_id
    WHERE cma.id = class_session_assignments.class_module_assignment_id
    AND cca.institution_id = public.get_user_institution_id(auth.uid())
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  EXISTS (
    SELECT 1 FROM public.class_module_assignments cma
    JOIN public.course_class_assignments cca ON cca.id = cma.class_assignment_id
    WHERE cma.id = class_session_assignments.class_module_assignment_id
    AND cca.institution_id = public.get_user_institution_id(auth.uid())
  )
);

-- =============================================
-- SECTION 19: CLASS_SESSION_ATTENDANCE POLICIES (3)
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

CREATE POLICY "Management can view institution class_session_attendance"
ON public.class_session_attendance
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'management'::public.app_role) AND
  institution_id = public.get_user_institution_id(auth.uid())
);

-- =============================================
-- SECTION 20: CLASSES POLICIES (4)
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
  id IN (SELECT class_id FROM public.students WHERE user_id = auth.uid())
);

-- =============================================
-- SECTION 21: COMMUNICATION_LOG_ATTACHMENTS POLICIES (2)
-- =============================================

CREATE POLICY "Super admin full access to communication_log_attachments"
ON public.communication_log_attachments
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "System admin full access to communication_log_attachments"
ON public.communication_log_attachments
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 22: COMMUNICATION_LOGS POLICIES (2)
-- =============================================

CREATE POLICY "Super admin full access to communication_logs"
ON public.communication_logs
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "System admin full access to communication_logs"
ON public.communication_logs
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 23: COMPANY_HOLIDAYS POLICIES (3)
-- =============================================

CREATE POLICY "Authenticated can view company_holidays"
ON public.company_holidays
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Super admin can manage company_holidays"
ON public.company_holidays
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "System admin can manage company_holidays"
ON public.company_holidays
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 24: COMPANY_PROFILES POLICIES (3)
-- =============================================

CREATE POLICY "Authenticated can view company_profiles"
ON public.company_profiles
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Super admin can manage company_profiles"
ON public.company_profiles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "System admin can manage company_profiles"
ON public.company_profiles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 25: COURSE_CLASS_ASSIGNMENTS POLICIES (4)
-- =============================================

CREATE POLICY "Super admin full access to course_class_assignments"
ON public.course_class_assignments
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Officers can manage institution course_class_assignments"
ON public.course_class_assignments
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

CREATE POLICY "Management can view institution course_class_assignments"
ON public.course_class_assignments
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'management'::public.app_role) AND
  institution_id = public.get_user_institution_id(auth.uid())
);

CREATE POLICY "Students can view their class course_class_assignments"
ON public.course_class_assignments
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'student'::public.app_role) AND
  class_id IN (SELECT class_id FROM public.students WHERE user_id = auth.uid())
);

-- =============================================
-- SECTION 26: COURSE_CONTENT POLICIES (5)
-- =============================================

CREATE POLICY "Super admin full access to course_content"
ON public.course_content
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Officers can manage their own course_content"
ON public.course_content
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  EXISTS (
    SELECT 1 FROM public.courses c
    WHERE c.id = course_content.course_id
    AND c.created_by = auth.uid()
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  EXISTS (
    SELECT 1 FROM public.courses c
    WHERE c.id = course_content.course_id
    AND c.created_by = auth.uid()
  )
);

CREATE POLICY "Officers can view institution course_content"
ON public.course_content
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  EXISTS (
    SELECT 1 FROM public.course_institution_assignments cia
    WHERE cia.course_id = course_content.course_id
    AND cia.institution_id = public.get_user_institution_id(auth.uid())
  )
);

CREATE POLICY "Students can view published course_content"
ON public.course_content
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'student'::public.app_role) AND
  EXISTS (
    SELECT 1 FROM public.courses c
    JOIN public.course_class_assignments cca ON c.id = cca.course_id
    JOIN public.students s ON s.class_id = cca.class_id
    WHERE c.id = course_content.course_id
    AND s.user_id = auth.uid()
    AND c.status = 'published'
  )
);

CREATE POLICY "System admin full access to course_content"
ON public.course_content
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 27: COURSE_INSTITUTION_ASSIGNMENTS POLICIES (3)
-- =============================================

CREATE POLICY "Super admin full access to course_institution_assignments"
ON public.course_institution_assignments
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Management can view institution course_institution_assignments"
ON public.course_institution_assignments
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'management'::public.app_role) AND
  institution_id = public.get_user_institution_id(auth.uid())
);

CREATE POLICY "System admin full access to course_institution_assignments"
ON public.course_institution_assignments
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 28: COURSE_MODULES POLICIES (5)
-- =============================================

CREATE POLICY "Super admin full access to course_modules"
ON public.course_modules
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Officers can manage their own course_modules"
ON public.course_modules
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  EXISTS (
    SELECT 1 FROM public.courses c
    WHERE c.id = course_modules.course_id
    AND c.created_by = auth.uid()
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  EXISTS (
    SELECT 1 FROM public.courses c
    WHERE c.id = course_modules.course_id
    AND c.created_by = auth.uid()
  )
);

CREATE POLICY "Officers can view institution course_modules"
ON public.course_modules
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  EXISTS (
    SELECT 1 FROM public.course_institution_assignments cia
    WHERE cia.course_id = course_modules.course_id
    AND cia.institution_id = public.get_user_institution_id(auth.uid())
  )
);

CREATE POLICY "Students can view published course_modules"
ON public.course_modules
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'student'::public.app_role) AND
  EXISTS (
    SELECT 1 FROM public.courses c
    JOIN public.course_class_assignments cca ON c.id = cca.course_id
    JOIN public.students s ON s.class_id = cca.class_id
    WHERE c.id = course_modules.course_id
    AND s.user_id = auth.uid()
    AND c.status = 'published'
  )
);

CREATE POLICY "System admin full access to course_modules"
ON public.course_modules
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 29: COURSE_SESSIONS POLICIES (5)
-- =============================================

CREATE POLICY "Super admin full access to course_sessions"
ON public.course_sessions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Officers can manage their own course_sessions"
ON public.course_sessions
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  EXISTS (
    SELECT 1 FROM public.courses c
    WHERE c.id = course_sessions.course_id
    AND c.created_by = auth.uid()
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  EXISTS (
    SELECT 1 FROM public.courses c
    WHERE c.id = course_sessions.course_id
    AND c.created_by = auth.uid()
  )
);

CREATE POLICY "Officers can view institution course_sessions"
ON public.course_sessions
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  EXISTS (
    SELECT 1 FROM public.course_institution_assignments cia
    WHERE cia.course_id = course_sessions.course_id
    AND cia.institution_id = public.get_user_institution_id(auth.uid())
  )
);

CREATE POLICY "Management can view institution course_sessions"
ON public.course_sessions
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'management'::public.app_role) AND
  EXISTS (
    SELECT 1 FROM public.course_institution_assignments cia
    WHERE cia.course_id = course_sessions.course_id
    AND cia.institution_id = public.get_user_institution_id(auth.uid())
  )
);

CREATE POLICY "Students can view published course_sessions"
ON public.course_sessions
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'student'::public.app_role) AND
  EXISTS (
    SELECT 1 FROM public.courses c
    JOIN public.course_class_assignments cca ON c.id = cca.course_id
    JOIN public.students s ON s.class_id = cca.class_id
    WHERE c.id = course_sessions.course_id
    AND s.user_id = auth.uid()
    AND c.status = 'published'
  )
);

-- =============================================
-- SECTION 30: COURSES POLICIES (5)
-- =============================================

CREATE POLICY "Super admin full access to courses"
ON public.courses
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Officers can manage their own courses"
ON public.courses
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

CREATE POLICY "Officers can view institution courses"
ON public.courses
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  EXISTS (
    SELECT 1 FROM public.course_institution_assignments cia
    WHERE cia.course_id = courses.id
    AND cia.institution_id = public.get_user_institution_id(auth.uid())
  )
);

CREATE POLICY "Management can view institution courses"
ON public.courses
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'management'::public.app_role) AND
  EXISTS (
    SELECT 1 FROM public.course_institution_assignments cia
    WHERE cia.course_id = courses.id
    AND cia.institution_id = public.get_user_institution_id(auth.uid())
  )
);

CREATE POLICY "Students can view published courses assigned to their class"
ON public.courses
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'student'::public.app_role) AND
  status = 'published' AND
  EXISTS (
    SELECT 1 FROM public.course_class_assignments cca
    JOIN public.students s ON s.class_id = cca.class_id
    WHERE cca.course_id = courses.id
    AND s.user_id = auth.uid()
  )
);

-- =============================================
-- SECTION 31: CRM_CONTRACT_DOCUMENTS POLICIES (2)
-- =============================================

CREATE POLICY "Super admin full access to crm_contract_documents"
ON public.crm_contract_documents
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "System admin full access to crm_contract_documents"
ON public.crm_contract_documents
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 32: CRM_CONTRACTS POLICIES (2)
-- =============================================

CREATE POLICY "Super admin full access to crm_contracts"
ON public.crm_contracts
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "System admin full access to crm_contracts"
ON public.crm_contracts
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 33: CRM_TASKS POLICIES (2)
-- =============================================

CREATE POLICY "Super admin full access to crm_tasks"
ON public.crm_tasks
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "System admin full access to crm_tasks"
ON public.crm_tasks
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 34: DAILY_WORK_LOGS POLICIES (3)
-- =============================================

CREATE POLICY "Super admin full access to daily_work_logs"
ON public.daily_work_logs
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Users can manage their own daily_work_logs"
ON public.daily_work_logs
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "System admin can view all daily_work_logs"
ON public.daily_work_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 35: EVENT_CLASS_ASSIGNMENTS POLICIES (4)
-- =============================================

CREATE POLICY "Super admin full access to event_class_assignments"
ON public.event_class_assignments
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Event managers can manage event_class_assignments"
ON public.event_class_assignments
FOR ALL
TO authenticated
USING (public.can_manage_events(auth.uid()))
WITH CHECK (public.can_manage_events(auth.uid()));

CREATE POLICY "Officers can view institution event_class_assignments"
ON public.event_class_assignments
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  institution_id = public.get_user_institution_id(auth.uid())
);

CREATE POLICY "Students can view their class event_class_assignments"
ON public.event_class_assignments
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'student'::public.app_role) AND
  EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.user_id = auth.uid()
    AND s.class_id = event_class_assignments.class_id
  )
);

-- =============================================
-- SECTION 36: EVENT_INTERESTS POLICIES (6)
-- =============================================

CREATE POLICY "Super admin full access to event_interests"
ON public.event_interests
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Students can express interest in events"
ON public.event_interests
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'student'::public.app_role) AND
  student_id = auth.uid()
);

CREATE POLICY "Students can view their own event_interests"
ON public.event_interests
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'student'::public.app_role) AND
  student_id = auth.uid()
);

CREATE POLICY "Students can delete their own event_interests"
ON public.event_interests
FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'student'::public.app_role) AND
  student_id = auth.uid()
);

CREATE POLICY "Event managers can view event_interests"
ON public.event_interests
FOR SELECT
TO authenticated
USING (public.can_manage_events(auth.uid()));

CREATE POLICY "Officers can view institution event_interests"
ON public.event_interests
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  institution_id = public.get_user_institution_id(auth.uid())
);

-- =============================================
-- SECTION 37: EVENT_UPDATES POLICIES (4)
-- =============================================

CREATE POLICY "Super admin full access to event_updates"
ON public.event_updates
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Event managers can manage event_updates"
ON public.event_updates
FOR ALL
TO authenticated
USING (public.can_manage_events(auth.uid()))
WITH CHECK (public.can_manage_events(auth.uid()));

CREATE POLICY "Event owners can manage their event_updates"
ON public.event_updates
FOR ALL
TO authenticated
USING (public.is_event_owner(auth.uid(), event_id))
WITH CHECK (public.is_event_owner(auth.uid(), event_id));

CREATE POLICY "Users can view published event_updates"
ON public.event_updates
FOR SELECT
TO authenticated
USING (public.can_view_event_updates(auth.uid(), event_id));

-- =============================================
-- SECTION 38: EVENTS POLICIES (6)
-- =============================================

CREATE POLICY "Super admin full access to events"
ON public.events
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Event managers can create events"
ON public.events
FOR INSERT
TO authenticated
WITH CHECK (public.can_manage_events(auth.uid()));

CREATE POLICY "Event managers can view all events"
ON public.events
FOR SELECT
TO authenticated
USING (public.can_manage_events(auth.uid()));

CREATE POLICY "Event managers can update events"
ON public.events
FOR UPDATE
TO authenticated
USING (public.can_manage_events(auth.uid()))
WITH CHECK (public.can_manage_events(auth.uid()));

CREATE POLICY "Event managers can delete events"
ON public.events
FOR DELETE
TO authenticated
USING (public.can_manage_events(auth.uid()));

CREATE POLICY "Event owners can manage their own events"
ON public.events
FOR ALL
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- =============================================
-- SECTION 39: GAMIFICATION_BADGES POLICIES (3)
-- =============================================

CREATE POLICY "Anyone can view active gamification_badges"
ON public.gamification_badges
FOR SELECT
TO authenticated
USING (is_active = true);

CREATE POLICY "Super admin can manage gamification_badges"
ON public.gamification_badges
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "System admin can manage gamification_badges"
ON public.gamification_badges
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 40: HR_RATING_PROJECTS POLICIES (3)
-- =============================================

CREATE POLICY "Super admin full access to hr_rating_projects"
ON public.hr_rating_projects
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Officers can view their own hr_rating_projects"
ON public.hr_rating_projects
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  EXISTS (
    SELECT 1 FROM public.hr_ratings hr
    JOIN public.officers o ON hr.trainer_id = o.id
    WHERE hr.id = hr_rating_projects.hr_rating_id
    AND o.user_id = auth.uid()
  )
);

CREATE POLICY "System admin can manage hr_rating_projects"
ON public.hr_rating_projects
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 41: HR_RATINGS POLICIES (3)
-- =============================================

CREATE POLICY "Super admin full access to hr_ratings"
ON public.hr_ratings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Officers can view their own hr_ratings"
ON public.hr_ratings
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  EXISTS (
    SELECT 1 FROM public.officers o
    WHERE o.id = hr_ratings.trainer_id
    AND o.user_id = auth.uid()
  )
);

CREATE POLICY "System admin can manage hr_ratings"
ON public.hr_ratings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 42: ID_COUNTERS POLICIES (3)
-- =============================================

CREATE POLICY "Super admin full access to id_counters"
ON public.id_counters
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Management can manage institution id_counters"
ON public.id_counters
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

CREATE POLICY "System admin can manage all id_counters"
ON public.id_counters
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 43: INSTITUTION_HOLIDAYS POLICIES (4)
-- =============================================

CREATE POLICY "Users can view their institution_holidays"
ON public.institution_holidays
FOR SELECT
TO authenticated
USING (institution_id = public.get_user_institution_id(auth.uid()));

CREATE POLICY "Super admin can manage institution_holidays"
ON public.institution_holidays
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Management can manage institution_holidays"
ON public.institution_holidays
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

CREATE POLICY "System admin can manage all institution_holidays"
ON public.institution_holidays
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 44: INSTITUTION_PERIODS POLICIES (5)
-- =============================================

CREATE POLICY "Super admin full access to institution_periods"
ON public.institution_periods
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Users can view their institution_periods"
ON public.institution_periods
FOR SELECT
TO authenticated
USING (institution_id = public.get_user_institution_id(auth.uid()));

CREATE POLICY "Officers can manage institution_periods"
ON public.institution_periods
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

CREATE POLICY "Management can manage institution_periods"
ON public.institution_periods
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

CREATE POLICY "System admin can manage all institution_periods"
ON public.institution_periods
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 45: INSTITUTION_TIMETABLE_ASSIGNMENTS POLICIES (5)
-- =============================================

CREATE POLICY "Super admin full access to institution_timetable_assignments"
ON public.institution_timetable_assignments
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Users can view their institution_timetable_assignments"
ON public.institution_timetable_assignments
FOR SELECT
TO authenticated
USING (institution_id = public.get_user_institution_id(auth.uid()));

CREATE POLICY "Officers can manage institution_timetable_assignments"
ON public.institution_timetable_assignments
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

CREATE POLICY "Management can manage institution_timetable_assignments"
ON public.institution_timetable_assignments
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

CREATE POLICY "System admin can manage all institution_timetable_assignments"
ON public.institution_timetable_assignments
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 46: INSTITUTIONS POLICIES (5)
-- =============================================

CREATE POLICY "Super admin full access to institutions"
ON public.institutions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Users can view their own institution"
ON public.institutions
FOR SELECT
TO authenticated
USING (id = public.get_user_institution_id(auth.uid()));

CREATE POLICY "Management can update their institution"
ON public.institutions
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'management'::public.app_role) AND
  id = public.get_user_institution_id(auth.uid())
)
WITH CHECK (
  public.has_role(auth.uid(), 'management'::public.app_role) AND
  id = public.get_user_institution_id(auth.uid())
);

CREATE POLICY "System admin can view all institutions"
ON public.institutions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role));

CREATE POLICY "System admin can manage all institutions"
ON public.institutions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 47: INTERVIEW_FEEDBACK POLICIES (2)
-- =============================================

CREATE POLICY "Super admin full access to interview_feedback"
ON public.interview_feedback
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "System admin full access to interview_feedback"
ON public.interview_feedback
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 48: INTERVIEW_STAGES POLICIES (2)
-- =============================================

CREATE POLICY "Super admin full access to interview_stages"
ON public.interview_stages
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "System admin full access to interview_stages"
ON public.interview_stages
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 49: INVENTORY_ISSUES POLICIES (2)
-- =============================================

CREATE POLICY "Super admin full access to inventory_issues"
ON public.inventory_issues
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "System admin full access to inventory_issues"
ON public.inventory_issues
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 50: INVENTORY_ITEMS POLICIES (2)
-- =============================================

CREATE POLICY "Super admin full access to inventory_items"
ON public.inventory_items
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "System admin full access to inventory_items"
ON public.inventory_items
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 51: INVOICE_LINE_ITEMS POLICIES (2)
-- =============================================

CREATE POLICY "Super admin full access to invoice_line_items"
ON public.invoice_line_items
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "System admin full access to invoice_line_items"
ON public.invoice_line_items
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 52: INVOICE_NUMBER_SEQUENCES POLICIES (2)
-- =============================================

CREATE POLICY "Super admin full access to invoice_number_sequences"
ON public.invoice_number_sequences
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "System admin full access to invoice_number_sequences"
ON public.invoice_number_sequences
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 53: INVOICES POLICIES (2)
-- =============================================

CREATE POLICY "Super admin full access to invoices"
ON public.invoices
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "System admin full access to invoices"
ON public.invoices
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 54: JOB_APPLICATIONS POLICIES (2)
-- =============================================

CREATE POLICY "Super admin full access to job_applications"
ON public.job_applications
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "System admin full access to job_applications"
ON public.job_applications
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 55: JOB_POSTINGS POLICIES (2)
-- =============================================

CREATE POLICY "Super admin full access to job_postings"
ON public.job_postings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "System admin full access to job_postings"
ON public.job_postings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 56: LEADERBOARD_CONFIGS POLICIES (3)
-- =============================================

CREATE POLICY "Anyone can view active leaderboard_configs"
ON public.leaderboard_configs
FOR SELECT
TO authenticated
USING (is_active = true);

CREATE POLICY "Super admin can manage leaderboard_configs"
ON public.leaderboard_configs
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "System admin can manage leaderboard_configs"
ON public.leaderboard_configs
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 57: LEAVE_APPLICATIONS POLICIES (4)
-- =============================================

CREATE POLICY "Users can manage their own leave_applications"
ON public.leave_applications
FOR ALL
TO authenticated
USING (applicant_id = auth.uid())
WITH CHECK (applicant_id = auth.uid());

CREATE POLICY "Super admin full access to leave_applications"
ON public.leave_applications
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "System admin full access to leave_applications"
ON public.leave_applications
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

CREATE POLICY "Management can view institution leave_applications"
ON public.leave_applications
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'management'::public.app_role));

-- =============================================
-- SECTION 58: LEAVE_APPROVAL_HIERARCHY POLICIES (2)
-- =============================================

CREATE POLICY "Authenticated can view leave_approval_hierarchy"
ON public.leave_approval_hierarchy
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Super admin can manage leave_approval_hierarchy"
ON public.leave_approval_hierarchy
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

-- =============================================
-- SECTION 59: LEAVE_BALANCE_ADJUSTMENTS POLICIES (2)
-- =============================================

CREATE POLICY "Super admin can manage leave_balance_adjustments"
ON public.leave_balance_adjustments
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "System admin can manage leave_balance_adjustments"
ON public.leave_balance_adjustments
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 60: LEAVE_BALANCES POLICIES (3)
-- =============================================

CREATE POLICY "Users can view their own leave_balances"
ON public.leave_balances
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Super admin can manage leave_balances"
ON public.leave_balances
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "System admin can manage leave_balances"
ON public.leave_balances
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 61: LEAVE_SETTINGS POLICIES (3)
-- =============================================

CREATE POLICY "Authenticated can view leave_settings"
ON public.leave_settings
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Super admin can manage leave_settings"
ON public.leave_settings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "System admin can manage leave_settings"
ON public.leave_settings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 62: NEWSLETTERS POLICIES (3)
-- =============================================

CREATE POLICY "Users can read published newsletters"
ON public.newsletters
FOR SELECT
TO authenticated
USING (status = 'published');

CREATE POLICY "Super admin can manage newsletters"
ON public.newsletters
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "System admin can manage newsletters"
ON public.newsletters
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 63: NOTIFICATIONS POLICIES (4)
-- =============================================

CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Super admin full access to notifications"
ON public.notifications
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "System can insert notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (true);

-- =============================================
-- SECTION 64: OFFICER_ATTENDANCE POLICIES (3)
-- =============================================

CREATE POLICY "Officers can manage their own officer_attendance"
ON public.officer_attendance
FOR ALL
TO authenticated
USING (
  officer_id IN (SELECT id FROM public.officers WHERE user_id = auth.uid())
)
WITH CHECK (
  officer_id IN (SELECT id FROM public.officers WHERE user_id = auth.uid())
);

CREATE POLICY "Super admin full access to officer_attendance"
ON public.officer_attendance
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Management can view institution officer_attendance"
ON public.officer_attendance
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'management'::public.app_role));

-- =============================================
-- SECTION 65: OFFICER_CLASS_ACCESS_GRANTS POLICIES (3)
-- =============================================

CREATE POLICY "Officers can manage their grants"
ON public.officer_class_access_grants
FOR ALL
TO authenticated
USING (
  officer_id IN (SELECT id FROM public.officers WHERE user_id = auth.uid())
)
WITH CHECK (
  officer_id IN (SELECT id FROM public.officers WHERE user_id = auth.uid())
);

CREATE POLICY "Super admin full access to officer_class_access_grants"
ON public.officer_class_access_grants
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Management can manage officer_class_access_grants"
ON public.officer_class_access_grants
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'management'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'management'::public.app_role));

-- =============================================
-- SECTION 66: OFFICER_DOCUMENTS POLICIES (2)
-- =============================================

CREATE POLICY "Officers can manage their own documents"
ON public.officer_documents
FOR ALL
TO authenticated
USING (
  officer_id IN (SELECT id FROM public.officers WHERE user_id = auth.uid())
)
WITH CHECK (
  officer_id IN (SELECT id FROM public.officers WHERE user_id = auth.uid())
);

CREATE POLICY "Super admin full access to officer_documents"
ON public.officer_documents
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

-- =============================================
-- SECTION 67: OFFICER_INSTITUTION_ASSIGNMENTS POLICIES (1)
-- =============================================

CREATE POLICY "Authenticated full access to officer_institution_assignments"
ON public.officer_institution_assignments
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- =============================================
-- SECTION 68: OFFICERS POLICIES (5)
-- =============================================

CREATE POLICY "Officers can view their own officer record"
ON public.officers
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Officers can view institution officers"
ON public.officers
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  institution_id = public.get_user_institution_id(auth.uid())
);

CREATE POLICY "Super admin full access to officers"
ON public.officers
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Management can manage institution officers"
ON public.officers
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

CREATE POLICY "System admin can view all officers"
ON public.officers
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 69: OVERTIME_REQUESTS POLICIES (3)
-- =============================================

CREATE POLICY "Users can manage their own overtime_requests"
ON public.overtime_requests
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Super admin full access to overtime_requests"
ON public.overtime_requests
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "System admin full access to overtime_requests"
ON public.overtime_requests
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 70: PAYROLL_RECORDS POLICIES (3)
-- =============================================

CREATE POLICY "Users can view their own payroll_records"
ON public.payroll_records
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Super admin full access to payroll_records"
ON public.payroll_records
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "System admin full access to payroll_records"
ON public.payroll_records
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 71: PERFORMANCE_APPRAISALS POLICIES (4)
-- =============================================

CREATE POLICY "Officers can view their own performance_appraisals"
ON public.performance_appraisals
FOR SELECT
TO authenticated
USING (
  officer_id IN (SELECT id FROM public.officers WHERE user_id = auth.uid())
);

CREATE POLICY "Officers can manage their own performance_appraisals"
ON public.performance_appraisals
FOR ALL
TO authenticated
USING (
  officer_id IN (SELECT id FROM public.officers WHERE user_id = auth.uid())
)
WITH CHECK (
  officer_id IN (SELECT id FROM public.officers WHERE user_id = auth.uid())
);

CREATE POLICY "Super admin full access to performance_appraisals"
ON public.performance_appraisals
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "System admin full access to performance_appraisals"
ON public.performance_appraisals
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 72: POSITIONS POLICIES (3)
-- =============================================

CREATE POLICY "Authenticated can view positions"
ON public.positions
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Super admin can manage positions"
ON public.positions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "System admin can manage positions"
ON public.positions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 73: PROFILES POLICIES (6)
-- =============================================

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Super admin full access to profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Officers can view institution profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'officer'::public.app_role));

CREATE POLICY "Management can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'management'::public.app_role));

CREATE POLICY "Service role full access to profiles"
ON public.profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =============================================
-- SECTION 74: PROJECT_ACHIEVEMENTS POLICIES (3)
-- =============================================

CREATE POLICY "Super admin full access to project_achievements"
ON public.project_achievements
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Project members can view project_achievements"
ON public.project_achievements
FOR SELECT
TO authenticated
USING (public.is_project_member(auth.uid(), project_id));

CREATE POLICY "Officers can manage project_achievements"
ON public.project_achievements
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'officer'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'officer'::public.app_role));

-- =============================================
-- SECTION 75: PROJECT_MEMBERS POLICIES (4)
-- =============================================

CREATE POLICY "Super admin full access to project_members"
ON public.project_members
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Project members can view project_members"
ON public.project_members
FOR SELECT
TO authenticated
USING (public.is_project_member(auth.uid(), project_id));

CREATE POLICY "Officers can manage project_members"
ON public.project_members
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'officer'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'officer'::public.app_role));

CREATE POLICY "Students can view their project_members"
ON public.project_members
FOR SELECT
TO authenticated
USING (student_id = auth.uid());

-- =============================================
-- SECTION 76: PROJECT_PROGRESS_UPDATES POLICIES (2)
-- =============================================

CREATE POLICY "Super admin full access to project_progress_updates"
ON public.project_progress_updates
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Project members can manage project_progress_updates"
ON public.project_progress_updates
FOR ALL
TO authenticated
USING (public.is_project_member(auth.uid(), project_id))
WITH CHECK (public.is_project_member(auth.uid(), project_id));

-- =============================================
-- SECTION 77: PROJECTS POLICIES (5)
-- =============================================

CREATE POLICY "Super admin full access to projects"
ON public.projects
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Officers can manage projects"
ON public.projects
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'officer'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'officer'::public.app_role));

CREATE POLICY "Project members can view projects"
ON public.projects
FOR SELECT
TO authenticated
USING (public.is_project_member(auth.uid(), id));

CREATE POLICY "Students can view institution projects"
ON public.projects
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'student'::public.app_role) AND
  institution_id = public.get_user_institution_id(auth.uid())
);

CREATE POLICY "Management can view institution projects"
ON public.projects
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'management'::public.app_role) AND
  institution_id = public.get_user_institution_id(auth.uid())
);

-- =============================================
-- SECTION 78: PURCHASE_APPROVAL_CHAIN POLICIES (3)
-- =============================================

CREATE POLICY "Authenticated can view purchase_approval_chain"
ON public.purchase_approval_chain
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Super admin can manage purchase_approval_chain"
ON public.purchase_approval_chain
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "System admin can manage purchase_approval_chain"
ON public.purchase_approval_chain
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 79: PURCHASE_REQUESTS POLICIES (3)
-- =============================================

CREATE POLICY "Users can manage their own purchase_requests"
ON public.purchase_requests
FOR ALL
TO authenticated
USING (requested_by = auth.uid())
WITH CHECK (requested_by = auth.uid());

CREATE POLICY "Super admin full access to purchase_requests"
ON public.purchase_requests
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "System admin full access to purchase_requests"
ON public.purchase_requests
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 80: REPORTS POLICIES (2)
-- =============================================

CREATE POLICY "Super admin full access to reports"
ON public.reports
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "System admin full access to reports"
ON public.reports
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 81: RESERVED_INVOICE_NUMBERS POLICIES (2)
-- =============================================

CREATE POLICY "Authenticated can insert reserved_invoice_numbers"
ON public.reserved_invoice_numbers
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated can view reserved_invoice_numbers"
ON public.reserved_invoice_numbers
FOR SELECT
TO authenticated
USING (true);

-- =============================================
-- SECTION 82: STAFF_ATTENDANCE POLICIES (3)
-- =============================================

CREATE POLICY "Users can manage their own staff_attendance"
ON public.staff_attendance
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Super admin full access to staff_attendance"
ON public.staff_attendance
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "System admin full access to staff_attendance"
ON public.staff_attendance
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 83: STAFF_DOCUMENTS POLICIES (3)
-- =============================================

CREATE POLICY "Users can manage their own staff_documents"
ON public.staff_documents
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Super admin full access to staff_documents"
ON public.staff_documents
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "System admin full access to staff_documents"
ON public.staff_documents
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 84: STUDENT_BADGES POLICIES (4)
-- =============================================

CREATE POLICY "Students can view their own student_badges"
ON public.student_badges
FOR SELECT
TO authenticated
USING (student_id = auth.uid());

CREATE POLICY "Super admin full access to student_badges"
ON public.student_badges
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Officers can manage institution student_badges"
ON public.student_badges
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

CREATE POLICY "System admin full access to student_badges"
ON public.student_badges
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 85: STUDENT_CERTIFICATES POLICIES (4)
-- =============================================

CREATE POLICY "Students can view their own student_certificates"
ON public.student_certificates
FOR SELECT
TO authenticated
USING (student_id = auth.uid());

CREATE POLICY "Super admin full access to student_certificates"
ON public.student_certificates
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Officers can manage institution student_certificates"
ON public.student_certificates
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

CREATE POLICY "System admin full access to student_certificates"
ON public.student_certificates
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 86: STUDENT_CONTENT_COMPLETIONS POLICIES (4)
-- =============================================

CREATE POLICY "Students can manage their own student_content_completions"
ON public.student_content_completions
FOR ALL
TO authenticated
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Super admin full access to student_content_completions"
ON public.student_content_completions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Officers can view institution student_content_completions"
ON public.student_content_completions
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  institution_id = public.get_user_institution_id(auth.uid())
);

CREATE POLICY "System admin full access to student_content_completions"
ON public.student_content_completions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 87: STUDENT_FEEDBACK POLICIES (4)
-- =============================================

CREATE POLICY "Students can manage their own student_feedback"
ON public.student_feedback
FOR ALL
TO authenticated
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Super admin full access to student_feedback"
ON public.student_feedback
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Officers can view institution student_feedback"
ON public.student_feedback
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  institution_id = public.get_user_institution_id(auth.uid())
);

CREATE POLICY "System admin full access to student_feedback"
ON public.student_feedback
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 88: STUDENT_STREAKS POLICIES (4)
-- =============================================

CREATE POLICY "Students can manage their own student_streaks"
ON public.student_streaks
FOR ALL
TO authenticated
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Super admin full access to student_streaks"
ON public.student_streaks
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Officers can view institution student_streaks"
ON public.student_streaks
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  institution_id = public.get_user_institution_id(auth.uid())
);

CREATE POLICY "System admin full access to student_streaks"
ON public.student_streaks
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 89: STUDENT_XP_TRANSACTIONS POLICIES (4)
-- =============================================

CREATE POLICY "Students can view their own student_xp_transactions"
ON public.student_xp_transactions
FOR SELECT
TO authenticated
USING (student_id = auth.uid());

CREATE POLICY "Super admin full access to student_xp_transactions"
ON public.student_xp_transactions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Officers can view institution student_xp_transactions"
ON public.student_xp_transactions
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  institution_id = public.get_user_institution_id(auth.uid())
);

CREATE POLICY "System admin full access to student_xp_transactions"
ON public.student_xp_transactions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 90: STUDENTS POLICIES (5)
-- =============================================

CREATE POLICY "Students can view their own student record"
ON public.students
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Students can update their own student record"
ON public.students
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Super admin full access to students"
ON public.students
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Officers can manage institution students"
ON public.students
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

CREATE POLICY "Management can manage institution students"
ON public.students
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
-- SECTION 91: SURVEY_QUESTIONS POLICIES (3)
-- =============================================

CREATE POLICY "Super admin full access to survey_questions"
ON public.survey_questions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Authenticated can view survey_questions"
ON public.survey_questions
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "System admin full access to survey_questions"
ON public.survey_questions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 92: SURVEY_RESPONSE_ANSWERS POLICIES (4)
-- =============================================

CREATE POLICY "Users can insert their own survey_response_answers"
ON public.survey_response_answers
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.survey_responses sr
    WHERE sr.id = survey_response_answers.response_id
    AND sr.respondent_id = auth.uid()
  )
);

CREATE POLICY "Users can view their own survey_response_answers"
ON public.survey_response_answers
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.survey_responses sr
    WHERE sr.id = survey_response_answers.response_id
    AND sr.respondent_id = auth.uid()
  )
);

CREATE POLICY "Super admin full access to survey_response_answers"
ON public.survey_response_answers
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "System admin full access to survey_response_answers"
ON public.survey_response_answers
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 93: SURVEY_RESPONSES POLICIES (4)
-- =============================================

CREATE POLICY "Users can insert their own survey_responses"
ON public.survey_responses
FOR INSERT
TO authenticated
WITH CHECK (respondent_id = auth.uid());

CREATE POLICY "Users can view their own survey_responses"
ON public.survey_responses
FOR SELECT
TO authenticated
USING (respondent_id = auth.uid());

CREATE POLICY "Super admin full access to survey_responses"
ON public.survey_responses
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "System admin full access to survey_responses"
ON public.survey_responses
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 94: SURVEYS POLICIES (3)
-- =============================================

CREATE POLICY "Authenticated can view active surveys"
ON public.surveys
FOR SELECT
TO authenticated
USING (status = 'active');

CREATE POLICY "Super admin full access to surveys"
ON public.surveys
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "System admin full access to surveys"
ON public.surveys
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 95: SYSTEM_CONFIGURATIONS POLICIES (2)
-- =============================================

CREATE POLICY "Super admin full access to system_configurations"
ON public.system_configurations
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "System admin full access to system_configurations"
ON public.system_configurations
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 96: SYSTEM_LOGS POLICIES (2)
-- =============================================

CREATE POLICY "Super admin full access to system_logs"
ON public.system_logs
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "System admin full access to system_logs"
ON public.system_logs
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 97: TASK_ACTIVITY_LOG POLICIES (3)
-- =============================================

CREATE POLICY "Super admin full access to task_activity_log"
ON public.task_activity_log
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Users can view task_activity_log for their tasks"
ON public.task_activity_log
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.tasks t
    WHERE t.id = task_activity_log.task_id
    AND (t.created_by = auth.uid() OR t.assigned_to = auth.uid())
  )
);

CREATE POLICY "Users can insert task_activity_log for their tasks"
ON public.task_activity_log
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tasks t
    WHERE t.id = task_activity_log.task_id
    AND (t.created_by = auth.uid() OR t.assigned_to = auth.uid())
  )
);

-- =============================================
-- SECTION 98: TASK_ATTACHMENTS POLICIES (3)
-- =============================================

CREATE POLICY "Super admin full access to task_attachments"
ON public.task_attachments
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Users can manage task_attachments for their tasks"
ON public.task_attachments
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.tasks t
    WHERE t.id = task_attachments.task_id
    AND (t.created_by = auth.uid() OR t.assigned_to = auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tasks t
    WHERE t.id = task_attachments.task_id
    AND (t.created_by = auth.uid() OR t.assigned_to = auth.uid())
  )
);

CREATE POLICY "System admin full access to task_attachments"
ON public.task_attachments
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 99: TASK_COMMENTS POLICIES (3)
-- =============================================

CREATE POLICY "Super admin full access to task_comments"
ON public.task_comments
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Users can manage task_comments for their tasks"
ON public.task_comments
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.tasks t
    WHERE t.id = task_comments.task_id
    AND (t.created_by = auth.uid() OR t.assigned_to = auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tasks t
    WHERE t.id = task_comments.task_id
    AND (t.created_by = auth.uid() OR t.assigned_to = auth.uid())
  )
);

CREATE POLICY "System admin full access to task_comments"
ON public.task_comments
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 100: TASKS POLICIES (4)
-- =============================================

CREATE POLICY "Users can manage tasks they created or are assigned to"
ON public.tasks
FOR ALL
TO authenticated
USING (created_by = auth.uid() OR assigned_to = auth.uid())
WITH CHECK (created_by = auth.uid() OR assigned_to = auth.uid());

CREATE POLICY "Super admin full access to tasks"
ON public.tasks
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "System admin full access to tasks"
ON public.tasks
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

CREATE POLICY "Officers can view all tasks in their institution"
ON public.tasks
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'officer'::public.app_role));

-- =============================================
-- SECTION 101: USER_ROLES POLICIES (3)
-- =============================================

CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Super admin full access to user_roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "System admin full access to user_roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 102: WEBINARS POLICIES (3)
-- =============================================

CREATE POLICY "Authenticated can view published webinars"
ON public.webinars
FOR SELECT
TO authenticated
USING (status = 'published');

CREATE POLICY "Super admin full access to webinars"
ON public.webinars
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "System admin full access to webinars"
ON public.webinars
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- SECTION 103: XP_RULES POLICIES (3)
-- =============================================

CREATE POLICY "Anyone can view active xp_rules"
ON public.xp_rules
FOR SELECT
TO authenticated
USING (is_active = true);

CREATE POLICY "Super admin can manage xp_rules"
ON public.xp_rules
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "System admin can manage xp_rules"
ON public.xp_rules
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'system_admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'::public.app_role));

-- =============================================
-- END OF RLS POLICIES MIGRATION (FIXED VERSION)
-- =============================================
