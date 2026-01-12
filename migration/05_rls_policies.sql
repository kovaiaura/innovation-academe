-- ============================================
-- Meta-INNOVA LMS - Row Level Security Policies
-- Run this AFTER all tables are created
-- ============================================

-- =============================================
-- HELPER FUNCTIONS FOR RLS
-- =============================================

-- Check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(check_role public.app_role)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role = check_role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user is super_admin or system_admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role IN ('super_admin', 'system_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user is management for an institution
CREATE OR REPLACE FUNCTION public.is_management_for_institution(inst_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role = 'management'
        AND institution_id = inst_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user is officer for an institution
CREATE OR REPLACE FUNCTION public.is_officer_for_institution(inst_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.officers o
        JOIN public.officer_institution_assignments oia ON o.id = oia.officer_id
        WHERE o.user_id = auth.uid()
        AND oia.institution_id = inst_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user is student for an institution
CREATE OR REPLACE FUNCTION public.is_student_for_institution(inst_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.students
        WHERE user_id = auth.uid()
        AND institution_id = inst_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Get user's institution IDs
CREATE OR REPLACE FUNCTION public.get_user_institution_ids()
RETURNS UUID[] AS $$
DECLARE
    result UUID[];
BEGIN
    -- Get institutions from user_roles
    SELECT ARRAY_AGG(DISTINCT institution_id) INTO result
    FROM public.user_roles
    WHERE user_id = auth.uid()
    AND institution_id IS NOT NULL;
    
    RETURN COALESCE(result, ARRAY[]::UUID[]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =============================================
-- ENABLE RLS ON ALL TABLES
-- =============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_prompt_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.id_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.officers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.officer_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.officer_institution_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.officer_class_access_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_timetable_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.officer_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_session_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_balance_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_approval_hierarchy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificate_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_institution_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_class_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_module_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_session_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_content_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_class_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_class_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_progress_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_class_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_day_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_appraisals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appraisal_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_rating_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.overtime_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_work_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_contract_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_log_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_approval_chain ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_number_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reserved_invoice_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_response_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webinars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_feeds ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PROFILES POLICIES
-- =============================================

CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Admins can update all profiles"
    ON public.profiles FOR UPDATE
    USING (public.is_admin());

CREATE POLICY "Admins can insert profiles"
    ON public.profiles FOR INSERT
    WITH CHECK (public.is_admin() OR auth.uid() = id);

CREATE POLICY "Service role can manage profiles"
    ON public.profiles FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- =============================================
-- USER ROLES POLICIES
-- =============================================

CREATE POLICY "Users can view own roles"
    ON public.user_roles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
    ON public.user_roles FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Admins can manage roles"
    ON public.user_roles FOR ALL
    USING (public.is_admin());

CREATE POLICY "Service role can manage user_roles"
    ON public.user_roles FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- =============================================
-- INSTITUTIONS POLICIES
-- =============================================

CREATE POLICY "Anyone can view institutions"
    ON public.institutions FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage institutions"
    ON public.institutions FOR ALL
    USING (public.is_admin());

CREATE POLICY "Management can update own institution"
    ON public.institutions FOR UPDATE
    USING (public.is_management_for_institution(id));

CREATE POLICY "Service role can manage institutions"
    ON public.institutions FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- =============================================
-- CLASSES POLICIES
-- =============================================

CREATE POLICY "Users can view classes in their institution"
    ON public.classes FOR SELECT
    USING (
        public.is_admin() OR
        public.is_management_for_institution(institution_id) OR
        public.is_officer_for_institution(institution_id) OR
        public.is_student_for_institution(institution_id)
    );

CREATE POLICY "Admins and management can manage classes"
    ON public.classes FOR ALL
    USING (
        public.is_admin() OR
        public.is_management_for_institution(institution_id)
    );

CREATE POLICY "Service role can manage classes"
    ON public.classes FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- =============================================
-- OFFICERS POLICIES
-- =============================================

CREATE POLICY "Users can view officers"
    ON public.officers FOR SELECT
    USING (
        public.is_admin() OR
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.officer_institution_assignments oia
            WHERE oia.officer_id = officers.id
            AND oia.institution_id = ANY(public.get_user_institution_ids())
        )
    );

CREATE POLICY "Officers can update own record"
    ON public.officers FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage officers"
    ON public.officers FOR ALL
    USING (public.is_admin());

CREATE POLICY "Service role can manage officers"
    ON public.officers FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- =============================================
-- STUDENTS POLICIES
-- =============================================

CREATE POLICY "Students can view own record"
    ON public.students FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Staff can view students in their institution"
    ON public.students FOR SELECT
    USING (
        public.is_admin() OR
        public.is_management_for_institution(institution_id) OR
        public.is_officer_for_institution(institution_id)
    );

CREATE POLICY "Students can update own record"
    ON public.students FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Admins and management can manage students"
    ON public.students FOR ALL
    USING (
        public.is_admin() OR
        public.is_management_for_institution(institution_id)
    );

CREATE POLICY "Service role can manage students"
    ON public.students FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- =============================================
-- ATTENDANCE POLICIES
-- =============================================

CREATE POLICY "Officers can view own attendance"
    ON public.officer_attendance FOR SELECT
    USING (
        public.is_admin() OR
        EXISTS (SELECT 1 FROM public.officers WHERE id = officer_attendance.officer_id AND user_id = auth.uid())
    );

CREATE POLICY "Admins can manage officer attendance"
    ON public.officer_attendance FOR ALL
    USING (public.is_admin());

CREATE POLICY "Officers can insert own attendance"
    ON public.officer_attendance FOR INSERT
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.officers WHERE id = officer_attendance.officer_id AND user_id = auth.uid())
    );

CREATE POLICY "Service role can manage officer_attendance"
    ON public.officer_attendance FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Staff can view class attendance"
    ON public.class_session_attendance FOR SELECT
    USING (
        public.is_admin() OR
        public.is_management_for_institution(institution_id) OR
        public.is_officer_for_institution(institution_id)
    );

CREATE POLICY "Officers can manage class attendance"
    ON public.class_session_attendance FOR ALL
    USING (
        public.is_admin() OR
        public.is_management_for_institution(institution_id) OR
        public.is_officer_for_institution(institution_id)
    );

CREATE POLICY "Service role can manage class_session_attendance"
    ON public.class_session_attendance FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- =============================================
-- COURSES POLICIES
-- =============================================

CREATE POLICY "Anyone can view published courses"
    ON public.courses FOR SELECT
    USING (status = 'published' OR public.is_admin());

CREATE POLICY "Admins can manage courses"
    ON public.courses FOR ALL
    USING (public.is_admin());

CREATE POLICY "Service role can manage courses"
    ON public.courses FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Anyone can view course modules"
    ON public.course_modules FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage course modules"
    ON public.course_modules FOR ALL
    USING (public.is_admin());

CREATE POLICY "Anyone can view course sessions"
    ON public.course_sessions FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage course sessions"
    ON public.course_sessions FOR ALL
    USING (public.is_admin());

CREATE POLICY "Anyone can view course content"
    ON public.course_content FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage course content"
    ON public.course_content FOR ALL
    USING (public.is_admin());

-- =============================================
-- ASSESSMENTS POLICIES
-- =============================================

CREATE POLICY "Users can view assessments"
    ON public.assessments FOR SELECT
    USING (
        public.is_admin() OR
        (institution_id IS NULL) OR
        public.is_management_for_institution(institution_id) OR
        public.is_officer_for_institution(institution_id) OR
        public.is_student_for_institution(institution_id)
    );

CREATE POLICY "Admins can manage assessments"
    ON public.assessments FOR ALL
    USING (public.is_admin());

CREATE POLICY "Service role can manage assessments"
    ON public.assessments FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Users can view assessment questions"
    ON public.assessment_questions FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage assessment questions"
    ON public.assessment_questions FOR ALL
    USING (public.is_admin());

CREATE POLICY "Students can view own attempts"
    ON public.assessment_attempts FOR SELECT
    USING (student_id = auth.uid() OR public.is_admin());

CREATE POLICY "Students can insert own attempts"
    ON public.assessment_attempts FOR INSERT
    WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update own attempts"
    ON public.assessment_attempts FOR UPDATE
    USING (student_id = auth.uid());

CREATE POLICY "Service role can manage assessment_attempts"
    ON public.assessment_attempts FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- =============================================
-- ASSIGNMENTS POLICIES
-- =============================================

CREATE POLICY "Users can view assignments"
    ON public.assignments FOR SELECT
    USING (
        public.is_admin() OR
        (institution_id IS NULL) OR
        public.is_management_for_institution(institution_id) OR
        public.is_officer_for_institution(institution_id) OR
        public.is_student_for_institution(institution_id)
    );

CREATE POLICY "Admins can manage assignments"
    ON public.assignments FOR ALL
    USING (public.is_admin());

CREATE POLICY "Service role can manage assignments"
    ON public.assignments FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Students can view own submissions"
    ON public.assignment_submissions FOR SELECT
    USING (student_id = auth.uid() OR public.is_admin());

CREATE POLICY "Students can insert submissions"
    ON public.assignment_submissions FOR INSERT
    WITH CHECK (student_id = auth.uid());

CREATE POLICY "Service role can manage assignment_submissions"
    ON public.assignment_submissions FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- =============================================
-- TASKS POLICIES
-- =============================================

CREATE POLICY "Users can view assigned tasks"
    ON public.tasks FOR SELECT
    USING (
        assigned_to = auth.uid() OR
        assigned_by = auth.uid() OR
        public.is_admin()
    );

CREATE POLICY "Users can insert tasks"
    ON public.tasks FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update assigned tasks"
    ON public.tasks FOR UPDATE
    USING (
        assigned_to = auth.uid() OR
        assigned_by = auth.uid() OR
        public.is_admin()
    );

CREATE POLICY "Admins can delete tasks"
    ON public.tasks FOR DELETE
    USING (public.is_admin() OR assigned_by = auth.uid());

CREATE POLICY "Service role can manage tasks"
    ON public.tasks FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Users can view task comments"
    ON public.task_comments FOR SELECT
    USING (true);

CREATE POLICY "Users can insert task comments"
    ON public.task_comments FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Service role can manage task_comments"
    ON public.task_comments FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- =============================================
-- EVENTS POLICIES
-- =============================================

CREATE POLICY "Anyone can view events"
    ON public.events FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage events"
    ON public.events FOR ALL
    USING (public.is_admin());

CREATE POLICY "Service role can manage events"
    ON public.events FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Users can view event interests"
    ON public.event_interests FOR SELECT
    USING (student_id = auth.uid() OR public.is_admin());

CREATE POLICY "Students can register interest"
    ON public.event_interests FOR INSERT
    WITH CHECK (student_id = auth.uid());

CREATE POLICY "Service role can manage event_interests"
    ON public.event_interests FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- =============================================
-- GAMIFICATION POLICIES
-- =============================================

CREATE POLICY "Anyone can view badges"
    ON public.gamification_badges FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage badges"
    ON public.gamification_badges FOR ALL
    USING (public.is_admin());

CREATE POLICY "Students can view own XP"
    ON public.student_xp_transactions FOR SELECT
    USING (student_id = auth.uid() OR public.is_admin());

CREATE POLICY "Service role can manage student_xp_transactions"
    ON public.student_xp_transactions FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Students can view own badges"
    ON public.student_badges FOR SELECT
    USING (student_id = auth.uid() OR public.is_admin());

CREATE POLICY "Service role can manage student_badges"
    ON public.student_badges FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Students can view own streak"
    ON public.student_streaks FOR SELECT
    USING (student_id = auth.uid() OR public.is_admin());

CREATE POLICY "Service role can manage student_streaks"
    ON public.student_streaks FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Anyone can view XP rules"
    ON public.xp_rules FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage XP rules"
    ON public.xp_rules FOR ALL
    USING (public.is_admin());

-- =============================================
-- PROJECTS POLICIES
-- =============================================

CREATE POLICY "Users can view projects"
    ON public.projects FOR SELECT
    USING (
        public.is_admin() OR
        public.is_management_for_institution(institution_id) OR
        public.is_officer_for_institution(institution_id) OR
        EXISTS (SELECT 1 FROM public.project_members WHERE project_id = projects.id AND student_id = auth.uid())
    );

CREATE POLICY "Admins can manage projects"
    ON public.projects FOR ALL
    USING (public.is_admin());

CREATE POLICY "Service role can manage projects"
    ON public.projects FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Users can view project members"
    ON public.project_members FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage project members"
    ON public.project_members FOR ALL
    USING (public.is_admin());

CREATE POLICY "Service role can manage project_members"
    ON public.project_members FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- =============================================
-- NOTIFICATIONS POLICIES
-- =============================================

CREATE POLICY "Users can view own notifications"
    ON public.notifications FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
    ON public.notifications FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Service role can manage notifications"
    ON public.notifications FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- =============================================
-- LEAVE MANAGEMENT POLICIES
-- =============================================

CREATE POLICY "Users can view leave settings"
    ON public.leave_settings FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage leave settings"
    ON public.leave_settings FOR ALL
    USING (public.is_admin());

CREATE POLICY "Users can view own leave balances"
    ON public.leave_balances FOR SELECT
    USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Service role can manage leave_balances"
    ON public.leave_balances FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Users can view own leave applications"
    ON public.leave_applications FOR SELECT
    USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can insert leave applications"
    ON public.leave_applications FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own pending applications"
    ON public.leave_applications FOR UPDATE
    USING (user_id = auth.uid() AND status = 'pending');

CREATE POLICY "Service role can manage leave_applications"
    ON public.leave_applications FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- =============================================
-- HR POLICIES
-- =============================================

CREATE POLICY "Admins can view job postings"
    ON public.job_postings FOR SELECT
    USING (status = 'published' OR public.is_admin());

CREATE POLICY "Admins can manage job postings"
    ON public.job_postings FOR ALL
    USING (public.is_admin());

CREATE POLICY "Admins can view job applications"
    ON public.job_applications FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Anyone can apply for jobs"
    ON public.job_applications FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins can manage job applications"
    ON public.job_applications FOR ALL
    USING (public.is_admin());

CREATE POLICY "Service role can manage job_applications"
    ON public.job_applications FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Admins can view interviews"
    ON public.candidate_interviews FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Admins can manage interviews"
    ON public.candidate_interviews FOR ALL
    USING (public.is_admin());

CREATE POLICY "Service role can manage candidate_interviews"
    ON public.candidate_interviews FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Admins can view performance appraisals"
    ON public.performance_appraisals FOR SELECT
    USING (public.is_admin() OR EXISTS (SELECT 1 FROM public.officers WHERE id = officer_id AND user_id = auth.uid()));

CREATE POLICY "Admins can manage performance appraisals"
    ON public.performance_appraisals FOR ALL
    USING (public.is_admin());

CREATE POLICY "Service role can manage performance_appraisals"
    ON public.performance_appraisals FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Admins can view payroll"
    ON public.payroll_records FOR SELECT
    USING (public.is_admin() OR EXISTS (SELECT 1 FROM public.officers WHERE id = officer_id AND user_id = auth.uid()));

CREATE POLICY "Admins can manage payroll"
    ON public.payroll_records FOR ALL
    USING (public.is_admin());

CREATE POLICY "Service role can manage payroll_records"
    ON public.payroll_records FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- =============================================
-- CRM POLICIES
-- =============================================

CREATE POLICY "Admins can view CRM contracts"
    ON public.crm_contracts FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Admins can manage CRM contracts"
    ON public.crm_contracts FOR ALL
    USING (public.is_admin());

CREATE POLICY "Service role can manage crm_contracts"
    ON public.crm_contracts FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Admins can view CRM tasks"
    ON public.crm_tasks FOR SELECT
    USING (public.is_admin() OR assigned_to_id = auth.uid());

CREATE POLICY "Admins can manage CRM tasks"
    ON public.crm_tasks FOR ALL
    USING (public.is_admin());

CREATE POLICY "Service role can manage crm_tasks"
    ON public.crm_tasks FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Admins can view communication logs"
    ON public.communication_logs FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Admins can manage communication logs"
    ON public.communication_logs FOR ALL
    USING (public.is_admin());

CREATE POLICY "Service role can manage communication_logs"
    ON public.communication_logs FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- =============================================
-- INVOICES POLICIES
-- =============================================

CREATE POLICY "Admins can view invoices"
    ON public.invoices FOR SELECT
    USING (public.is_admin() OR public.is_management_for_institution(institution_id));

CREATE POLICY "Admins can manage invoices"
    ON public.invoices FOR ALL
    USING (public.is_admin());

CREATE POLICY "Service role can manage invoices"
    ON public.invoices FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Users can view invoice line items"
    ON public.invoice_line_items FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage invoice line items"
    ON public.invoice_line_items FOR ALL
    USING (public.is_admin());

CREATE POLICY "Service role can manage invoice_line_items"
    ON public.invoice_line_items FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- =============================================
-- SURVEYS POLICIES
-- =============================================

CREATE POLICY "Users can view active surveys"
    ON public.surveys FOR SELECT
    USING (status = 'active' OR public.is_admin());

CREATE POLICY "Admins can manage surveys"
    ON public.surveys FOR ALL
    USING (public.is_admin());

CREATE POLICY "Service role can manage surveys"
    ON public.surveys FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Users can view survey questions"
    ON public.survey_questions FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage survey questions"
    ON public.survey_questions FOR ALL
    USING (public.is_admin());

CREATE POLICY "Users can submit survey responses"
    ON public.survey_responses FOR INSERT
    WITH CHECK (respondent_id = auth.uid());

CREATE POLICY "Users can view own responses"
    ON public.survey_responses FOR SELECT
    USING (respondent_id = auth.uid() OR public.is_admin());

CREATE POLICY "Service role can manage survey_responses"
    ON public.survey_responses FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- =============================================
-- CONTENT POLICIES
-- =============================================

CREATE POLICY "Anyone can view newsletters"
    ON public.newsletters FOR SELECT
    USING (status = 'published' OR public.is_admin());

CREATE POLICY "Admins can manage newsletters"
    ON public.newsletters FOR ALL
    USING (public.is_admin());

CREATE POLICY "Anyone can view webinars"
    ON public.webinars FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage webinars"
    ON public.webinars FOR ALL
    USING (public.is_admin());

CREATE POLICY "Anyone can view news feeds"
    ON public.news_feeds FOR SELECT
    USING (status = 'published' OR public.is_admin());

CREATE POLICY "Admins can manage news feeds"
    ON public.news_feeds FOR ALL
    USING (public.is_admin());

-- =============================================
-- CERTIFICATE POLICIES
-- =============================================

CREATE POLICY "Anyone can view certificate templates"
    ON public.certificate_templates FOR SELECT
    USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can manage certificate templates"
    ON public.certificate_templates FOR ALL
    USING (public.is_admin());

CREATE POLICY "Students can view own certificates"
    ON public.student_certificates FOR SELECT
    USING (student_id = auth.uid() OR public.is_admin());

CREATE POLICY "Service role can manage student_certificates"
    ON public.student_certificates FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- =============================================
-- MISC POLICIES
-- =============================================

CREATE POLICY "Admins can view positions"
    ON public.positions FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage positions"
    ON public.positions FOR ALL
    USING (public.is_admin());

CREATE POLICY "Admins can view system configurations"
    ON public.system_configurations FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Admins can manage system configurations"
    ON public.system_configurations FOR ALL
    USING (public.is_admin());

CREATE POLICY "Admins can view system logs"
    ON public.system_logs FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Service role can manage system_logs"
    ON public.system_logs FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Admins can view company profiles"
    ON public.company_profiles FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Admins can manage company profiles"
    ON public.company_profiles FOR ALL
    USING (public.is_admin());

CREATE POLICY "Service role can manage company_profiles"
    ON public.company_profiles FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Users can view company holidays"
    ON public.company_holidays FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage company holidays"
    ON public.company_holidays FOR ALL
    USING (public.is_admin());

CREATE POLICY "Service role can manage password_reset_tokens"
    ON public.password_reset_tokens FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Users can manage own AI usage"
    ON public.ai_prompt_usage FOR ALL
    USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Service role can manage ai_prompt_usage"
    ON public.ai_prompt_usage FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- =============================================
-- DONE: RLS Policies Complete
-- =============================================
