-- =============================================
-- RLS POLICIES PART 2 (Tables 49-103)
-- Continuation from 05_rls_policies_complete.sql
-- =============================================

-- =============================================
-- SECTION 49: INVENTORY_ISSUES POLICIES (6)
-- =============================================

CREATE POLICY "Admin full access to inventory_issues"
ON public.inventory_issues FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "CEO full access to inventory_issues"
ON public.inventory_issues FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'ceo'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'ceo'::public.app_role));

CREATE POLICY "Management can manage institution inventory_issues"
ON public.inventory_issues FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'management'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'management'::public.app_role));

CREATE POLICY "Officers can view inventory_issues"
ON public.inventory_issues FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'officer'::public.app_role));

CREATE POLICY "Officers can create inventory_issues"
ON public.inventory_issues FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'officer'::public.app_role));

CREATE POLICY "Position-based access to inventory_issues"
ON public.inventory_issues FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.officers o JOIN public.positions p ON o.position_id = p.id WHERE o.user_id = auth.uid() AND p.name IN ('Inventory Manager', 'Store Keeper')))
WITH CHECK (EXISTS (SELECT 1 FROM public.officers o JOIN public.positions p ON o.position_id = p.id WHERE o.user_id = auth.uid() AND p.name IN ('Inventory Manager', 'Store Keeper')));

-- SECTION 50-103: Remaining tables follow same pattern
-- Due to size constraints, creating a consolidated version

-- =============================================
-- INVENTORY_ITEMS, INVOICE_LINE_ITEMS, INVOICES
-- =============================================

CREATE POLICY "Admin full access to inventory_items" ON public.inventory_items FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "CEO full access to inventory_items" ON public.inventory_items FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'ceo'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'ceo'::public.app_role));
CREATE POLICY "Management can manage inventory_items" ON public.inventory_items FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'management'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'management'::public.app_role));
CREATE POLICY "Officers can view inventory_items" ON public.inventory_items FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'officer'::public.app_role));

CREATE POLICY "Admin full access to invoice_line_items" ON public.invoice_line_items FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "CEO full access to invoice_line_items" ON public.invoice_line_items FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'ceo'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'ceo'::public.app_role));
CREATE POLICY "Management can view invoice_line_items" ON public.invoice_line_items FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'management'::public.app_role));

CREATE POLICY "Admin full access to invoice_number_sequences" ON public.invoice_number_sequences FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "CEO full access to invoice_number_sequences" ON public.invoice_number_sequences FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'ceo'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'ceo'::public.app_role));

CREATE POLICY "Admin full access to invoices" ON public.invoices FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "CEO full access to invoices" ON public.invoices FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'ceo'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'ceo'::public.app_role));
CREATE POLICY "Management can view invoices" ON public.invoices FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'management'::public.app_role));

-- =============================================
-- JOB_APPLICATIONS, JOB_POSTINGS
-- =============================================

CREATE POLICY "Anyone can apply to open job_postings" ON public.job_applications FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.job_postings jp WHERE jp.id = job_applications.job_id AND jp.status = 'open'));
CREATE POLICY "Applicants can view their own job_applications" ON public.job_applications FOR SELECT TO authenticated USING (applicant_email = (SELECT email FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Admin can manage job_applications" ON public.job_applications FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "CEO can manage job_applications" ON public.job_applications FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'ceo'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'ceo'::public.app_role));

CREATE POLICY "Anyone can view open job_postings" ON public.job_postings FOR SELECT TO authenticated USING (status = 'open');
CREATE POLICY "Admin can manage job_postings" ON public.job_postings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "CEO can manage job_postings" ON public.job_postings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'ceo'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'ceo'::public.app_role));

-- =============================================
-- LEADERBOARD, LEAVE TABLES
-- =============================================

CREATE POLICY "Anyone can view public leaderboard_configs" ON public.leaderboard_configs FOR SELECT TO authenticated USING (is_public = true);
CREATE POLICY "Admin can manage leaderboard_configs" ON public.leaderboard_configs FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Users can manage their own leave_applications" ON public.leave_applications FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admin full access to leave_applications" ON public.leave_applications FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "CEO full access to leave_applications" ON public.leave_applications FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'ceo'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'ceo'::public.app_role));
CREATE POLICY "Management can view institution leave_applications" ON public.leave_applications FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'management'::public.app_role));

CREATE POLICY "Authenticated can view leave_approval_hierarchy" ON public.leave_approval_hierarchy FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can manage leave_approval_hierarchy" ON public.leave_approval_hierarchy FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "CEO can manage leave_balance_adjustments" ON public.leave_balance_adjustments FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'ceo'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'ceo'::public.app_role));

CREATE POLICY "Users can view their own leave_balances" ON public.leave_balances FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admin can manage leave_balances" ON public.leave_balances FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Authenticated can view leave_settings" ON public.leave_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can manage leave_settings" ON public.leave_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- =============================================
-- NEWSLETTERS, NOTIFICATIONS
-- =============================================

CREATE POLICY "Users can read published newsletters" ON public.newsletters FOR SELECT TO authenticated USING (status = 'published');
CREATE POLICY "Admin can manage newsletters" ON public.newsletters FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admin full access to notifications" ON public.notifications FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);

-- =============================================
-- OFFICER TABLES
-- =============================================

CREATE POLICY "Officers can manage their own officer_attendance" ON public.officer_attendance FOR ALL TO authenticated USING (officer_id IN (SELECT id FROM public.officers WHERE user_id = auth.uid())) WITH CHECK (officer_id IN (SELECT id FROM public.officers WHERE user_id = auth.uid()));
CREATE POLICY "Admin full access to officer_attendance" ON public.officer_attendance FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Management can view institution officer_attendance" ON public.officer_attendance FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'management'::public.app_role));

CREATE POLICY "Officers can manage their grants" ON public.officer_class_access_grants FOR ALL TO authenticated USING (officer_id IN (SELECT id FROM public.officers WHERE user_id = auth.uid())) WITH CHECK (officer_id IN (SELECT id FROM public.officers WHERE user_id = auth.uid()));
CREATE POLICY "Admin full access to officer_class_access_grants" ON public.officer_class_access_grants FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Management can manage officer_class_access_grants" ON public.officer_class_access_grants FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'management'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'management'::public.app_role));

CREATE POLICY "Officers can manage their own documents" ON public.officer_documents FOR ALL TO authenticated USING (officer_id IN (SELECT id FROM public.officers WHERE user_id = auth.uid())) WITH CHECK (officer_id IN (SELECT id FROM public.officers WHERE user_id = auth.uid()));
CREATE POLICY "Admin full access to officer_documents" ON public.officer_documents FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Authenticated full access to officer_institution_assignments" ON public.officer_institution_assignments FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Officers can view their own officer record" ON public.officers FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Officers can view institution officers" ON public.officers FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'officer'::public.app_role) AND institution_id = public.get_user_institution_id(auth.uid()));
CREATE POLICY "Admin full access to officers" ON public.officers FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Management can manage institution officers" ON public.officers FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'management'::public.app_role) AND institution_id = public.get_user_institution_id(auth.uid())) WITH CHECK (public.has_role(auth.uid(), 'management'::public.app_role) AND institution_id = public.get_user_institution_id(auth.uid()));
CREATE POLICY "CEO can view all officers" ON public.officers FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'ceo'::public.app_role));

-- =============================================
-- OVERTIME, PAYROLL, PERFORMANCE
-- =============================================

CREATE POLICY "Users can manage their own overtime_requests" ON public.overtime_requests FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admin full access to overtime_requests" ON public.overtime_requests FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "CEO full access to overtime_requests" ON public.overtime_requests FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'ceo'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'ceo'::public.app_role));

CREATE POLICY "Users can view their own payroll_records" ON public.payroll_records FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admin full access to payroll_records" ON public.payroll_records FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "CEO full access to payroll_records" ON public.payroll_records FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'ceo'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'ceo'::public.app_role));

CREATE POLICY "Officers can view their own performance_appraisals" ON public.performance_appraisals FOR SELECT TO authenticated USING (officer_id IN (SELECT id FROM public.officers WHERE user_id = auth.uid()));
CREATE POLICY "Officers can manage their own performance_appraisals" ON public.performance_appraisals FOR ALL TO authenticated USING (officer_id IN (SELECT id FROM public.officers WHERE user_id = auth.uid())) WITH CHECK (officer_id IN (SELECT id FROM public.officers WHERE user_id = auth.uid()));
CREATE POLICY "Admin full access to performance_appraisals" ON public.performance_appraisals FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "CEO full access to performance_appraisals" ON public.performance_appraisals FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'ceo'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'ceo'::public.app_role));

-- =============================================
-- POSITIONS, PROFILES
-- =============================================

CREATE POLICY "Authenticated can view positions" ON public.positions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can manage positions" ON public.positions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "CEO can manage positions" ON public.positions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'ceo'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'ceo'::public.app_role));

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "Admin full access to profiles" ON public.profiles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Officers can view institution profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'officer'::public.app_role));
CREATE POLICY "Management can view profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'management'::public.app_role));
CREATE POLICY "CEO can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'ceo'::public.app_role));
CREATE POLICY "Service role full access to profiles" ON public.profiles FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =============================================
-- PROJECT TABLES
-- =============================================

CREATE POLICY "Admin full access to project_achievements" ON public.project_achievements FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Project members can view project_achievements" ON public.project_achievements FOR SELECT TO authenticated USING (public.is_project_member(auth.uid(), project_id));
CREATE POLICY "Officers can manage project_achievements" ON public.project_achievements FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'officer'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'officer'::public.app_role));

CREATE POLICY "Admin full access to project_members" ON public.project_members FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Project members can view project_members" ON public.project_members FOR SELECT TO authenticated USING (public.is_project_member(auth.uid(), project_id));
CREATE POLICY "Officers can manage project_members" ON public.project_members FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'officer'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'officer'::public.app_role));
CREATE POLICY "Students can view their project_members" ON public.project_members FOR SELECT TO authenticated USING (student_id = auth.uid());

CREATE POLICY "Admin full access to project_progress_updates" ON public.project_progress_updates FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Project members can manage project_progress_updates" ON public.project_progress_updates FOR ALL TO authenticated USING (public.is_project_member(auth.uid(), project_id)) WITH CHECK (public.is_project_member(auth.uid(), project_id));

CREATE POLICY "Admin full access to projects" ON public.projects FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Officers can manage projects" ON public.projects FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'officer'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'officer'::public.app_role));
CREATE POLICY "Project members can view projects" ON public.projects FOR SELECT TO authenticated USING (public.is_project_member(auth.uid(), id));
CREATE POLICY "Students can view institution projects" ON public.projects FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'student'::public.app_role) AND institution_id = public.get_user_institution_id(auth.uid()));
CREATE POLICY "Management can view institution projects" ON public.projects FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'management'::public.app_role) AND institution_id = public.get_user_institution_id(auth.uid()));
CREATE POLICY "CEO can view all projects" ON public.projects FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'ceo'::public.app_role));

-- =============================================
-- PURCHASE TABLES
-- =============================================

CREATE POLICY "Authenticated can view purchase_approval_chain" ON public.purchase_approval_chain FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can manage purchase_approval_chain" ON public.purchase_approval_chain FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "CEO can manage purchase_approval_chain" ON public.purchase_approval_chain FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'ceo'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'ceo'::public.app_role));

CREATE POLICY "Users can view their own purchase_requests" ON public.purchase_requests FOR SELECT TO authenticated USING (requested_by = auth.uid());
CREATE POLICY "Users can create purchase_requests" ON public.purchase_requests FOR INSERT TO authenticated WITH CHECK (requested_by = auth.uid());
CREATE POLICY "Admin full access to purchase_requests" ON public.purchase_requests FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "CEO full access to purchase_requests" ON public.purchase_requests FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'ceo'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'ceo'::public.app_role));
CREATE POLICY "Management can manage purchase_requests" ON public.purchase_requests FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'management'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'management'::public.app_role));

-- =============================================
-- REPORTS, RESERVED_INVOICE_NUMBERS
-- =============================================

CREATE POLICY "Management can view published reports" ON public.reports FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'management'::public.app_role) AND status = 'published');
CREATE POLICY "Admin can manage reports" ON public.reports FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "CEO can manage reports" ON public.reports FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'ceo'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'ceo'::public.app_role));

CREATE POLICY "Authenticated can insert reserved_invoice_numbers" ON public.reserved_invoice_numbers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can view reserved_invoice_numbers" ON public.reserved_invoice_numbers FOR SELECT TO authenticated USING (true);

-- =============================================
-- STAFF TABLES
-- =============================================

CREATE POLICY "Users can manage their own staff_attendance" ON public.staff_attendance FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admin full access to staff_attendance" ON public.staff_attendance FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "CEO full access to staff_attendance" ON public.staff_attendance FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'ceo'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'ceo'::public.app_role));

CREATE POLICY "Authenticated full access to staff_documents" ON public.staff_documents FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =============================================
-- STUDENT TABLES
-- =============================================

CREATE POLICY "Students can view their own student_badges" ON public.student_badges FOR SELECT TO authenticated USING (student_id = auth.uid());
CREATE POLICY "Admin full access to student_badges" ON public.student_badges FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Officers can view institution student_badges" ON public.student_badges FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'officer'::public.app_role));
CREATE POLICY "System can award student_badges" ON public.student_badges FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Students can view their own student_certificates" ON public.student_certificates FOR SELECT TO authenticated USING (student_id = auth.uid());
CREATE POLICY "Admin full access to student_certificates" ON public.student_certificates FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Officers can manage student_certificates" ON public.student_certificates FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'officer'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'officer'::public.app_role));

CREATE POLICY "Students can manage their own student_content_completions" ON public.student_content_completions FOR ALL TO authenticated USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());
CREATE POLICY "Admin full access to student_content_completions" ON public.student_content_completions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Officers can view institution student_content_completions" ON public.student_content_completions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'officer'::public.app_role));

CREATE POLICY "Students can manage their own student_feedback" ON public.student_feedback FOR ALL TO authenticated USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());
CREATE POLICY "Admin full access to student_feedback" ON public.student_feedback FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Officers can respond to student_feedback" ON public.student_feedback FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'officer'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'officer'::public.app_role));
CREATE POLICY "Officers can view institution student_feedback" ON public.student_feedback FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'officer'::public.app_role));

CREATE POLICY "Students can manage their own student_streaks" ON public.student_streaks FOR ALL TO authenticated USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());
CREATE POLICY "Admin full access to student_streaks" ON public.student_streaks FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Students can view their own student_xp_transactions" ON public.student_xp_transactions FOR SELECT TO authenticated USING (student_id = auth.uid());
CREATE POLICY "Students can insert their own student_xp_transactions" ON public.student_xp_transactions FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid());
CREATE POLICY "Admin full access to student_xp_transactions" ON public.student_xp_transactions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Officers can view institution student_xp_transactions" ON public.student_xp_transactions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'officer'::public.app_role));

CREATE POLICY "Students can view their own student record" ON public.students FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Students can update their own student record" ON public.students FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admin full access to students" ON public.students FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Officers can view institution students" ON public.students FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'officer'::public.app_role) AND institution_id = public.get_user_institution_id(auth.uid()));
CREATE POLICY "Management can manage institution students" ON public.students FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'management'::public.app_role) AND institution_id = public.get_user_institution_id(auth.uid())) WITH CHECK (public.has_role(auth.uid(), 'management'::public.app_role) AND institution_id = public.get_user_institution_id(auth.uid()));
CREATE POLICY "CEO can view all students" ON public.students FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'ceo'::public.app_role));

-- =============================================
-- SURVEY TABLES
-- =============================================

CREATE POLICY "Anyone can view questions for visible surveys" ON public.survey_questions FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.surveys s WHERE s.id = survey_questions.survey_id AND s.status = 'active'));
CREATE POLICY "Admin can manage survey_questions" ON public.survey_questions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "CEO can manage survey_questions" ON public.survey_questions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'ceo'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'ceo'::public.app_role));

CREATE POLICY "Students can insert their own survey_response_answers" ON public.survey_response_answers FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.survey_responses sr WHERE sr.id = survey_response_answers.response_id AND sr.respondent_id = auth.uid()));
CREATE POLICY "Admin can manage survey_response_answers" ON public.survey_response_answers FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "CEO can view survey_response_answers" ON public.survey_response_answers FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'ceo'::public.app_role));

CREATE POLICY "Students can manage their own survey_responses" ON public.survey_responses FOR ALL TO authenticated USING (respondent_id = auth.uid()) WITH CHECK (respondent_id = auth.uid());
CREATE POLICY "Admin can manage survey_responses" ON public.survey_responses FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Officers can view institution survey_responses" ON public.survey_responses FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'officer'::public.app_role));
CREATE POLICY "CEO can view all survey_responses" ON public.survey_responses FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'ceo'::public.app_role));

CREATE POLICY "Students can view targeted surveys" ON public.surveys FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'student'::public.app_role) AND status = 'active');
CREATE POLICY "Admin can manage surveys" ON public.surveys FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Officers can view institution surveys" ON public.surveys FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'officer'::public.app_role));
CREATE POLICY "CEO can manage surveys" ON public.surveys FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'ceo'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'ceo'::public.app_role));

-- =============================================
-- SYSTEM TABLES
-- =============================================

CREATE POLICY "Authenticated can read platform system_configurations" ON public.system_configurations FOR SELECT TO authenticated USING (config_key LIKE 'platform%');
CREATE POLICY "Admin can manage system_configurations" ON public.system_configurations FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "CEO can manage system_configurations" ON public.system_configurations FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'ceo'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'ceo'::public.app_role));

CREATE POLICY "Authenticated can insert system_logs" ON public.system_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin can view system_logs" ON public.system_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "CEO can view system_logs" ON public.system_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'ceo'::public.app_role));

-- =============================================
-- TASK TABLES
-- =============================================

CREATE POLICY "Users can view activity for accessible tasks" ON public.task_activity_log FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.tasks t WHERE t.id = task_activity_log.task_id AND (t.created_by = auth.uid() OR t.assigned_to = auth.uid())));
CREATE POLICY "Admin full access to task_activity_log" ON public.task_activity_log FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "System can insert task_activity_log" ON public.task_activity_log FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can upload attachments to accessible tasks" ON public.task_attachments FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.tasks t WHERE t.id = task_attachments.task_id AND (t.created_by = auth.uid() OR t.assigned_to = auth.uid())));
CREATE POLICY "Users can view attachments for accessible tasks" ON public.task_attachments FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.tasks t WHERE t.id = task_attachments.task_id AND (t.created_by = auth.uid() OR t.assigned_to = auth.uid())));
CREATE POLICY "Admin full access to task_attachments" ON public.task_attachments FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Officers can comment on their tasks" ON public.task_comments FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'officer'::public.app_role) AND EXISTS (SELECT 1 FROM public.tasks t WHERE t.id = task_comments.task_id AND (t.created_by = auth.uid() OR t.assigned_to = auth.uid()))) WITH CHECK (public.has_role(auth.uid(), 'officer'::public.app_role) AND EXISTS (SELECT 1 FROM public.tasks t WHERE t.id = task_comments.task_id AND (t.created_by = auth.uid() OR t.assigned_to = auth.uid())));
CREATE POLICY "Admin full access to task_comments" ON public.task_comments FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "CEO can view all task_comments" ON public.task_comments FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'ceo'::public.app_role));

CREATE POLICY "Users can view their own tasks" ON public.tasks FOR SELECT TO authenticated USING (created_by = auth.uid() OR assigned_to = auth.uid());
CREATE POLICY "Users can create tasks" ON public.tasks FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can update their own tasks" ON public.tasks FOR UPDATE TO authenticated USING (created_by = auth.uid() OR assigned_to = auth.uid()) WITH CHECK (created_by = auth.uid() OR assigned_to = auth.uid());
CREATE POLICY "Admin full access to tasks" ON public.tasks FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "CEO can view all tasks" ON public.tasks FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'ceo'::public.app_role));

-- =============================================
-- USER_ROLES TABLE
-- =============================================

CREATE POLICY "Users can view their own user_roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admin can manage user_roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "CEO can manage user_roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'ceo'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'ceo'::public.app_role));
CREATE POLICY "Service role full access to user_roles" ON public.user_roles FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =============================================
-- WEBINARS, XP_RULES
-- =============================================

CREATE POLICY "Users can view published webinars" ON public.webinars FOR SELECT TO authenticated USING (status = 'published' OR status = 'live');
CREATE POLICY "Admin can manage webinars" ON public.webinars FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "CEO can manage webinars" ON public.webinars FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'ceo'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'ceo'::public.app_role));

CREATE POLICY "Anyone can view active xp_rules" ON public.xp_rules FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Admin can manage xp_rules" ON public.xp_rules FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "CEO can manage xp_rules" ON public.xp_rules FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'ceo'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'ceo'::public.app_role));

-- =============================================
-- END OF RLS POLICIES PART 2
-- =============================================
