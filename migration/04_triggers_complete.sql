-- ============================================
-- Meta-INNOVA LMS - Complete Database Triggers
-- Generated from Lovable Cloud Database
-- Run AFTER 03_functions_complete.sql
-- ============================================

-- ============================================
-- SECTION 1: Auth Trigger (on auth.users)
-- ============================================

-- Trigger on auth.users to create profile on new user signup
-- Note: This trigger is on auth.users which may require special handling
-- It should be created via Supabase dashboard or using service_role
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- SECTION 2: Timestamp Updated_At Triggers
-- ============================================

-- ai_prompt_usage
CREATE TRIGGER update_ai_prompt_usage_updated_at
  BEFORE UPDATE ON ai_prompt_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- assessments
CREATE TRIGGER update_assessments_updated_at
  BEFORE UPDATE ON assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- assignments
CREATE TRIGGER update_assignments_updated_at
  BEFORE UPDATE ON assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- calendar_day_types
CREATE TRIGGER update_calendar_day_types_updated_at
  BEFORE UPDATE ON calendar_day_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- candidate_interviews
CREATE TRIGGER update_candidate_interviews_updated_at
  BEFORE UPDATE ON candidate_interviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- candidate_offers
CREATE TRIGGER update_candidate_offers_updated_at
  BEFORE UPDATE ON candidate_offers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- class_module_assignments
CREATE TRIGGER update_class_module_assignments_updated_at
  BEFORE UPDATE ON class_module_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- class_session_assignments
CREATE TRIGGER update_class_session_assignments_updated_at
  BEFORE UPDATE ON class_session_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- classes
CREATE TRIGGER update_classes_updated_at
  BEFORE UPDATE ON classes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- company_holidays
CREATE TRIGGER update_company_holidays_updated_at
  BEFORE UPDATE ON company_holidays
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- courses
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- crm_contracts
CREATE TRIGGER update_crm_contracts_updated_at
  BEFORE UPDATE ON crm_contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- crm_tasks
CREATE TRIGGER update_crm_tasks_updated_at
  BEFORE UPDATE ON crm_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- daily_work_logs
CREATE TRIGGER update_daily_work_logs_updated_at
  BEFORE UPDATE ON daily_work_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- events
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- hr_ratings
CREATE TRIGGER update_hr_ratings_updated_at
  BEFORE UPDATE ON hr_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- id_counters
CREATE TRIGGER update_id_counters_updated_at
  BEFORE UPDATE ON id_counters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- institution_holidays
CREATE TRIGGER update_institution_holidays_updated_at
  BEFORE UPDATE ON institution_holidays
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- institution_periods
CREATE TRIGGER update_institution_periods_updated_at
  BEFORE UPDATE ON institution_periods
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- institution_timetable_assignments
CREATE TRIGGER update_institution_timetable_updated_at
  BEFORE UPDATE ON institution_timetable_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- institutions
CREATE TRIGGER update_institutions_updated_at
  BEFORE UPDATE ON institutions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- inventory_issues
CREATE TRIGGER update_inventory_issues_updated_at
  BEFORE UPDATE ON inventory_issues
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- inventory_items
CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- job_applications
CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON job_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- job_postings
CREATE TRIGGER update_job_postings_updated_at
  BEFORE UPDATE ON job_postings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- leaderboard_configs
CREATE TRIGGER update_leaderboard_configs_updated_at
  BEFORE UPDATE ON leaderboard_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- leave_applications
CREATE TRIGGER update_leave_applications_updated_at
  BEFORE UPDATE ON leave_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- leave_approval_hierarchy
CREATE TRIGGER update_leave_approval_hierarchy_updated_at
  BEFORE UPDATE ON leave_approval_hierarchy
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- leave_balances
CREATE TRIGGER update_leave_balances_updated_at
  BEFORE UPDATE ON leave_balances
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- leave_settings
CREATE TRIGGER update_leave_settings_updated_at
  BEFORE UPDATE ON leave_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- notifications
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- officer_attendance
CREATE TRIGGER update_officer_attendance_updated_at
  BEFORE UPDATE ON officer_attendance
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- officer_class_access_grants
CREATE TRIGGER update_officer_class_access_grants_updated_at
  BEFORE UPDATE ON officer_class_access_grants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- officer_institution_assignments
CREATE TRIGGER update_officer_institution_assignments_updated_at
  BEFORE UPDATE ON officer_institution_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- officers
CREATE TRIGGER update_officers_updated_at
  BEFORE UPDATE ON officers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- overtime_requests
CREATE TRIGGER update_overtime_requests_updated_at
  BEFORE UPDATE ON overtime_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- payroll_records
CREATE TRIGGER update_payroll_records_updated_at
  BEFORE UPDATE ON payroll_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- performance_appraisals
CREATE TRIGGER update_performance_appraisals_updated_at
  BEFORE UPDATE ON performance_appraisals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- positions
CREATE TRIGGER update_positions_updated_at
  BEFORE UPDATE ON positions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- projects
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- purchase_requests
CREATE TRIGGER update_purchase_requests_updated_at
  BEFORE UPDATE ON purchase_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- reports
CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- staff_attendance
CREATE TRIGGER update_staff_attendance_updated_at
  BEFORE UPDATE ON staff_attendance
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- student_streaks
CREATE TRIGGER update_student_streaks_updated_at
  BEFORE UPDATE ON student_streaks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- students
CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- system_configurations
CREATE TRIGGER update_system_configurations_updated_at
  BEFORE UPDATE ON system_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- webinars
CREATE TRIGGER update_webinars_updated_at
  BEFORE UPDATE ON webinars
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SECTION 3: Survey Updated_At Triggers
-- ============================================

-- surveys
CREATE TRIGGER update_surveys_updated_at
  BEFORE UPDATE ON surveys
  FOR EACH ROW
  EXECUTE FUNCTION update_survey_updated_at();

-- survey_responses
CREATE TRIGGER update_survey_responses_updated_at
  BEFORE UPDATE ON survey_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_survey_updated_at();

-- student_feedback
CREATE TRIGGER update_student_feedback_updated_at
  BEFORE UPDATE ON student_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_survey_updated_at();

-- ============================================
-- SECTION 4: Profile Sync Triggers
-- ============================================

-- Sync profile from student when user_id, institution_id, class_id, student_name, or email changes
CREATE TRIGGER trigger_sync_profile_from_student
  AFTER INSERT OR UPDATE OF user_id, institution_id, class_id, student_name, email
  ON students
  FOR EACH ROW
  EXECUTE FUNCTION sync_profile_from_student();

-- Sync avatar across students and officers when profile avatar changes
CREATE TRIGGER on_profile_avatar_update
  AFTER UPDATE OF avatar
  ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_profile_avatar();

-- ============================================
-- SECTION 5: Invoice Number Reservation Trigger
-- ============================================

-- Reserve invoice number before deletion to prevent reuse
CREATE TRIGGER trigger_reserve_invoice_number_on_delete
  BEFORE DELETE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION reserve_deleted_invoice_number();

-- ============================================
-- SECTION 6: Gamification XP Award Triggers
-- ============================================

-- Award XP when student joins a project
CREATE TRIGGER trigger_award_project_membership_xp
  AFTER INSERT ON project_members
  FOR EACH ROW
  EXECUTE FUNCTION award_project_membership_xp();

-- Award XP when project gets an achievement
CREATE TRIGGER trigger_award_project_achievement_xp
  AFTER INSERT ON project_achievements
  FOR EACH ROW
  EXECUTE FUNCTION award_project_achievement_xp();

-- Award XP when project progress reaches 100%
CREATE TRIGGER trigger_award_project_completion_xp
  AFTER INSERT ON project_progress_updates
  FOR EACH ROW
  EXECUTE FUNCTION award_project_completion_xp();

-- Award XP when assignment is graded
CREATE TRIGGER trigger_award_assignment_xp
  AFTER UPDATE ON assignment_submissions
  FOR EACH ROW
  EXECUTE FUNCTION award_assignment_xp();

-- ============================================
-- SECTION 7: Course Content Unlock Triggers
-- ============================================

-- Apply sequential unlocks when session assignment changes
CREATE TRIGGER trigger_session_unlock_on_change
  AFTER INSERT OR UPDATE OF unlock_mode, unlock_order, is_unlocked
  ON class_session_assignments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_apply_sequential_unlocks();

-- Check and unlock next content when student completes content
CREATE TRIGGER trigger_check_unlock_on_completion
  AFTER INSERT OR UPDATE ON student_content_completions
  FOR EACH ROW
  EXECUTE FUNCTION check_and_unlock_next_content();
