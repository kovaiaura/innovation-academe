-- =============================================
-- COMPLETE RLS POLICIES MIGRATION
-- Generated from Lovable Cloud Database
-- Total: 461 policies across 103 tables
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

CREATE POLICY "Admin full access to appraisal_projects"
ON public.appraisal_projects
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

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
-- SECTION 4: ASSESSMENT_ANSWERS POLICIES (7)
-- =============================================

CREATE POLICY "Admin full access to assessment_answers"
ON public.assessment_answers
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

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

CREATE POLICY "CEO can view all assessment_answers"
ON public.assessment_answers
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'ceo'::public.app_role));

-- =============================================
-- SECTION 5: ASSESSMENT_ATTEMPTS POLICIES (8)
-- =============================================

CREATE POLICY "Admin full access to assessment_attempts"
ON public.assessment_attempts
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

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

CREATE POLICY "CEO can view all assessment_attempts"
ON public.assessment_attempts
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'ceo'::public.app_role));

-- =============================================
-- SECTION 6: ASSESSMENT_CLASS_ASSIGNMENTS POLICIES (5)
-- =============================================

CREATE POLICY "Admin full access to assessment_class_assignments"
ON public.assessment_class_assignments
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

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

CREATE POLICY "CEO can view all assessment_class_assignments"
ON public.assessment_class_assignments
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'ceo'::public.app_role));

-- =============================================
-- SECTION 7: ASSESSMENT_QUESTIONS POLICIES (7)
-- =============================================

CREATE POLICY "Admin full access to assessment_questions"
ON public.assessment_questions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

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

CREATE POLICY "CEO can view all assessment_questions"
ON public.assessment_questions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'ceo'::public.app_role));

CREATE POLICY "CEO can manage all assessment_questions"
ON public.assessment_questions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'ceo'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'ceo'::public.app_role));

-- =============================================
-- SECTION 8: ASSESSMENTS POLICIES (9)
-- =============================================

CREATE POLICY "Admin full access to assessments"
ON public.assessments
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

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

CREATE POLICY "CEO can view all assessments"
ON public.assessments
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'ceo'::public.app_role));

CREATE POLICY "CEO can manage all assessments"
ON public.assessments
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'ceo'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'ceo'::public.app_role));

-- =============================================
-- SECTION 9: ASSIGNMENT_CLASS_ASSIGNMENTS POLICIES (5)
-- =============================================

CREATE POLICY "Admin full access to assignment_class_assignments"
ON public.assignment_class_assignments
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

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

CREATE POLICY "CEO can view all assignment_class_assignments"
ON public.assignment_class_assignments
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'ceo'::public.app_role));

-- =============================================
-- SECTION 10: ASSIGNMENT_SUBMISSIONS POLICIES (5)
-- =============================================

CREATE POLICY "Admin full access to assignment_submissions"
ON public.assignment_submissions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

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

CREATE POLICY "CEO can view all assignment_submissions"
ON public.assignment_submissions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'ceo'::public.app_role));

-- =============================================
-- SECTION 11: ASSIGNMENTS POLICIES (5)
-- =============================================

CREATE POLICY "Admin full access to assignments"
ON public.assignments
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

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

CREATE POLICY "CEO can view all assignments"
ON public.assignments
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'ceo'::public.app_role));

-- =============================================
-- SECTION 12: ATTENDANCE_CORRECTIONS POLICIES (2)
-- =============================================

CREATE POLICY "CEO can create attendance_corrections"
ON public.attendance_corrections
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'ceo'::public.app_role));

CREATE POLICY "CEO can view attendance_corrections"
ON public.attendance_corrections
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'ceo'::public.app_role));

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

CREATE POLICY "Admin full access to candidate_interviews"
ON public.candidate_interviews
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "CEO full access to candidate_interviews"
ON public.candidate_interviews
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'ceo'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'ceo'::public.app_role));

-- =============================================
-- SECTION 15: CANDIDATE_OFFERS POLICIES (2)
-- =============================================

CREATE POLICY "Admin full access to candidate_offers"
ON public.candidate_offers
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "CEO full access to candidate_offers"
ON public.candidate_offers
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'ceo'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'ceo'::public.app_role));

-- =============================================
-- SECTION 16: CERTIFICATE_TEMPLATES POLICIES (3)
-- =============================================

CREATE POLICY "Anyone can view active certificate_templates"
ON public.certificate_templates
FOR SELECT
TO authenticated
USING (is_active = true);

CREATE POLICY "Admin can manage certificate_templates"
ON public.certificate_templates
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "CEO can manage certificate_templates"
ON public.certificate_templates
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'ceo'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'ceo'::public.app_role));

-- =============================================
-- SECTION 17: CLASS_MODULE_ASSIGNMENTS POLICIES (6)
-- =============================================

CREATE POLICY "Admin full access to class_module_assignments"
ON public.class_module_assignments
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

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

CREATE POLICY "CEO can view all class_module_assignments"
ON public.class_module_assignments
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'ceo'::public.app_role));

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
-- SECTION 18: CLASS_SESSION_ASSIGNMENTS POLICIES (6)
-- =============================================

CREATE POLICY "Admin full access to class_session_assignments"
ON public.class_session_assignments
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

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

CREATE POLICY "CEO can view all class_session_assignments"
ON public.class_session_assignments
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'ceo'::public.app_role));

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
-- SECTION 19: CLASS_SESSION_ATTENDANCE POLICIES (4)
-- =============================================

CREATE POLICY "Admin full access to class_session_attendance"
ON public.class_session_attendance
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

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

CREATE POLICY "CEO can view all class_session_attendance"
ON public.class_session_attendance
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'ceo'::public.app_role));

-- =============================================
-- SECTION 20: CLASSES POLICIES (7)
-- =============================================

CREATE POLICY "Admin full access to classes"
ON public.classes
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

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

CREATE POLICY "Officers can view institution classes"
ON public.classes
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
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

CREATE POLICY "CEO can view all classes"
ON public.classes
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'ceo'::public.app_role));

CREATE POLICY "CEO can manage all classes"
ON public.classes
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'ceo'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'ceo'::public.app_role));

CREATE POLICY "Students can view institution classes"
ON public.classes
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'student'::public.app_role) AND
  EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.user_id = auth.uid()
    AND s.institution_id = classes.institution_id
  )
);

-- =============================================
-- SECTION 21: COMMUNICATION_LOG_ATTACHMENTS POLICIES (2)
-- =============================================

CREATE POLICY "Admin full access to communication_log_attachments"
ON public.communication_log_attachments
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "CEO full access to communication_log_attachments"
ON public.communication_log_attachments
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'ceo'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'ceo'::public.app_role));

-- =============================================
-- SECTION 22: COMMUNICATION_LOGS POLICIES (2)
-- =============================================

CREATE POLICY "Admin full access to communication_logs"
ON public.communication_logs
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "CEO full access to communication_logs"
ON public.communication_logs
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'ceo'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'ceo'::public.app_role));

-- =============================================
-- SECTION 23: COMPANY_HOLIDAYS POLICIES (3)
-- =============================================

CREATE POLICY "Authenticated users can view company_holidays"
ON public.company_holidays
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admin can manage company_holidays"
ON public.company_holidays
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "CEO can manage company_holidays"
ON public.company_holidays
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'ceo'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'ceo'::public.app_role));

-- =============================================
-- SECTION 24: COMPANY_PROFILES POLICIES (3)
-- =============================================

CREATE POLICY "Authenticated users can view company_profiles"
ON public.company_profiles
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admin can manage company_profiles"
ON public.company_profiles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "CEO can manage company_profiles"
ON public.company_profiles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'ceo'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'ceo'::public.app_role));

-- =============================================
-- SECTION 25: COURSE_CLASS_ASSIGNMENTS POLICIES (5)
-- =============================================

CREATE POLICY "Admin full access to course_class_assignments"
ON public.course_class_assignments
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

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
  EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.user_id = auth.uid()
    AND s.class_id = course_class_assignments.class_id
  )
);

CREATE POLICY "CEO can view all course_class_assignments"
ON public.course_class_assignments
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'ceo'::public.app_role));

-- =============================================
-- SECTION 26: COURSE_CONTENT POLICIES (7)
-- =============================================

CREATE POLICY "Admin full access to course_content"
ON public.course_content
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Officers can manage course_content for their courses"
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

CREATE POLICY "Management can view institution course_content"
ON public.course_content
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'management'::public.app_role) AND
  EXISTS (
    SELECT 1 FROM public.course_institution_assignments cia
    WHERE cia.course_id = course_content.course_id
    AND cia.institution_id = public.get_user_institution_id(auth.uid())
  )
);

CREATE POLICY "Students can view published course_content for their classes"
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

CREATE POLICY "CEO can view all course_content"
ON public.course_content
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'ceo'::public.app_role));

CREATE POLICY "CEO can manage all course_content"
ON public.course_content
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'ceo'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'ceo'::public.app_role));

-- =============================================
-- SECTION 27: COURSE_INSTITUTION_ASSIGNMENTS POLICIES (3)
-- =============================================

CREATE POLICY "Admin full access to course_institution_assignments"
ON public.course_institution_assignments
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Officers can view institution course_institution_assignments"
ON public.course_institution_assignments
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'officer'::public.app_role) AND
  institution_id = public.get_user_institution_id(auth.uid())
);

CREATE POLICY "CEO can manage all course_institution_assignments"
ON public.course_institution_assignments
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'ceo'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'ceo'::public.app_role));

-- =============================================
-- SECTION 28: COURSE_MODULES POLICIES (7)
-- =============================================

CREATE POLICY "Admin full access to course_modules"
ON public.course_modules
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

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

CREATE POLICY "Management can view institution course_modules"
ON public.course_modules
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'management'::public.app_role) AND
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

CREATE POLICY "CEO can view all course_modules"
ON public.course_modules
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'ceo'::public.app_role));

CREATE POLICY "CEO can manage all course_modules"
ON public.course_modules
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'ceo'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'ceo'::public.app_role));

-- =============================================
-- SECTION 29: COURSE_SESSIONS POLICIES (7)
-- =============================================

CREATE POLICY "Admin full access to course_sessions"
ON public.course_sessions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

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

CREATE POLICY "CEO can view all course_sessions"
ON public.course_sessions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'ceo'::public.app_role));

CREATE POLICY "CEO can manage all course_sessions"
ON public.course_sessions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'ceo'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'ceo'::public.app_role));

-- =============================================
-- SECTION 30: COURSES POLICIES (7)
-- =============================================

CREATE POLICY "Admin full access to courses"
ON public.courses
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

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

CREATE POLICY "CEO can view all courses"
ON public.courses
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'ceo'::public.app_role));

CREATE POLICY "CEO can manage all courses"
ON public.courses
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'ceo'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'ceo'::public.app_role));

-- =============================================
-- SECTION 31: CRM_CONTRACT_DOCUMENTS POLICIES (2)
-- =============================================

CREATE POLICY "Admin full access to crm_contract_documents"
ON public.crm_contract_documents
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "CEO full access to crm_contract_documents"
ON public.crm_contract_documents
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'ceo'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'ceo'::public.app_role));

-- =============================================
-- SECTION 32: CRM_CONTRACTS POLICIES (2)
-- =============================================

CREATE POLICY "Admin full access to crm_contracts"
ON public.crm_contracts
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "CEO full access to crm_contracts"
ON public.crm_contracts
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'ceo'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'ceo'::public.app_role));

-- =============================================
-- SECTION 33: CRM_TASKS POLICIES (2)
-- =============================================

CREATE POLICY "Admin full access to crm_tasks"
ON public.crm_tasks
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "CEO full access to crm_tasks"
ON public.crm_tasks
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'ceo'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'ceo'::public.app_role));

-- =============================================
-- SECTION 34: DAILY_WORK_LOGS POLICIES (3)
-- =============================================

CREATE POLICY "Admin full access to daily_work_logs"
ON public.daily_work_logs
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Users can manage their own daily_work_logs"
ON public.daily_work_logs
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "CEO can view all daily_work_logs"
ON public.daily_work_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'ceo'::public.app_role));

-- =============================================
-- SECTION 35: EVENT_CLASS_ASSIGNMENTS POLICIES (4)
-- =============================================

CREATE POLICY "Admin full access to event_class_assignments"
ON public.event_class_assignments
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

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
-- SECTION 36: EVENT_INTERESTS POLICIES (7)
-- =============================================

CREATE POLICY "Admin full access to event_interests"
ON public.event_interests
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

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

CREATE POLICY "Management can view institution event_interests"
ON public.event_interests
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'management'::public.app_role) AND
  institution_id = public.get_user_institution_id(auth.uid())
);

-- =============================================
-- SECTION 37: EVENT_UPDATES POLICIES (4)
-- =============================================

CREATE POLICY "Admin full access to event_updates"
ON public.event_updates
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

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
-- SECTION 38: EVENTS POLICIES (8)
-- =============================================

CREATE POLICY "Admin full access to events"
ON public.events
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

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

CREATE POLICY "Users can view published events"
ON public.events
FOR SELECT
TO authenticated
USING (public.can_view_event(auth.uid(), id, status));

CREATE POLICY "Students can view events assigned to their institution"
ON public.events
FOR SELECT
TO authenticated
USING (public.is_event_assigned_to_user_institution());

-- =============================================
-- SECTION 39: GAMIFICATION_BADGES POLICIES (3)
-- =============================================

CREATE POLICY "Anyone can view active gamification_badges"
ON public.gamification_badges
FOR SELECT
TO authenticated
USING (is_active = true);

CREATE POLICY "Admin can manage gamification_badges"
ON public.gamification_badges
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "CEO can manage gamification_badges"
ON public.gamification_badges
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'ceo'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'ceo'::public.app_role));

-- =============================================
-- SECTION 40: HR_RATING_PROJECTS POLICIES (3)
-- =============================================

CREATE POLICY "Admin full access to hr_rating_projects"
ON public.hr_rating_projects
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

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

CREATE POLICY "CEO can manage hr_rating_projects"
ON public.hr_rating_projects
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'ceo'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'ceo'::public.app_role));

-- =============================================
-- SECTION 41: HR_RATINGS POLICIES (3)
-- =============================================

CREATE POLICY "Admin full access to hr_ratings"
ON public.hr_ratings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

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

CREATE POLICY "CEO can manage hr_ratings"
ON public.hr_ratings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'ceo'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'ceo'::public.app_role));

-- =============================================
-- SECTION 42: ID_COUNTERS POLICIES (3)
-- =============================================

CREATE POLICY "Admin full access to id_counters"
ON public.id_counters
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

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

CREATE POLICY "CEO can manage all id_counters"
ON public.id_counters
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'ceo'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'ceo'::public.app_role));

-- =============================================
-- SECTION 43: INSTITUTION_HOLIDAYS POLICIES (4)
-- =============================================

CREATE POLICY "Users can view their institution_holidays"
ON public.institution_holidays
FOR SELECT
TO authenticated
USING (institution_id = public.get_user_institution_id(auth.uid()));

CREATE POLICY "Admin can manage institution_holidays"
ON public.institution_holidays
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

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

CREATE POLICY "CEO can manage all institution_holidays"
ON public.institution_holidays
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'ceo'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'ceo'::public.app_role));

-- =============================================
-- SECTION 44: INSTITUTION_PERIODS POLICIES (6)
-- =============================================

CREATE POLICY "Admin full access to institution_periods"
ON public.institution_periods
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Officers can view institution institution_periods"
ON public.institution_periods
FOR SELECT
TO authenticated
USING (
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

CREATE POLICY "Students can view their institution_periods"
ON public.institution_periods
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'student'::public.app_role) AND
  EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.user_id = auth.uid()
    AND s.institution_id = institution_periods.institution_id
  )
);

CREATE POLICY "CEO can view all institution_periods"
ON public.institution_periods
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'ceo'::public.app_role));

CREATE POLICY "CEO can manage all institution_periods"
ON public.institution_periods
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'ceo'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'ceo'::public.app_role));

-- =============================================
-- SECTION 45: INSTITUTION_TIMETABLE_ASSIGNMENTS POLICIES (6)
-- =============================================

CREATE POLICY "Admin full access to institution_timetable_assignments"
ON public.institution_timetable_assignments
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Officers can view institution institution_timetable_assignments"
ON public.institution_timetable_assignments
FOR SELECT
TO authenticated
USING (
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

CREATE POLICY "Students can view their institution_timetable_assignments"
ON public.institution_timetable_assignments
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'student'::public.app_role) AND
  EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.user_id = auth.uid()
    AND s.class_id = institution_timetable_assignments.class_id
  )
);

CREATE POLICY "CEO can view all institution_timetable_assignments"
ON public.institution_timetable_assignments
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'ceo'::public.app_role));

CREATE POLICY "CEO can manage all institution_timetable_assignments"
ON public.institution_timetable_assignments
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'ceo'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'ceo'::public.app_role));

-- =============================================
-- SECTION 46: INSTITUTIONS POLICIES (5)
-- =============================================

CREATE POLICY "Admin full access to institutions"
ON public.institutions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

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

CREATE POLICY "CEO can view all institutions"
ON public.institutions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'ceo'::public.app_role));

CREATE POLICY "CEO can manage all institutions"
ON public.institutions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'ceo'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'ceo'::public.app_role));

-- =============================================
-- SECTION 47: INTERVIEW_FEEDBACK POLICIES (2)
-- =============================================

CREATE POLICY "Admin full access to interview_feedback"
ON public.interview_feedback
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "CEO full access to interview_feedback"
ON public.interview_feedback
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'ceo'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'ceo'::public.app_role));

-- =============================================
-- SECTION 48: INTERVIEW_STAGES POLICIES (3)
-- =============================================

CREATE POLICY "Anyone can view interview_stages for open jobs"
ON public.interview_stages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.job_postings jp
    WHERE jp.id = interview_stages.job_id
    AND jp.status = 'open'
  )
);

CREATE POLICY "Admin can manage interview_stages"
ON public.interview_stages
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "CEO can manage interview_stages"
ON public.interview_stages
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'ceo'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'ceo'::public.app_role));
