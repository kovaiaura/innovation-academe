-- ============================================
-- Meta-INNOVA LMS - Drop All Tables Script
-- Run this to remove all tables before recreating schema
-- ============================================

-- Disable triggers temporarily
SET session_replication_role = 'replica';

-- Drop tables in reverse dependency order (children first, then parents)

-- Gamification and XP
DROP TABLE IF EXISTS public.student_xp_transactions CASCADE;
DROP TABLE IF EXISTS public.student_badges CASCADE;
DROP TABLE IF EXISTS public.student_streaks CASCADE;
DROP TABLE IF EXISTS public.xp_rules CASCADE;
DROP TABLE IF EXISTS public.gamification_badges CASCADE;
DROP TABLE IF EXISTS public.leaderboard_configs CASCADE;

-- Student Content & Certificates
DROP TABLE IF EXISTS public.student_content_completions CASCADE;
DROP TABLE IF EXISTS public.student_certificates CASCADE;
DROP TABLE IF EXISTS public.student_feedback CASCADE;

-- Course Related (dependent tables first)
DROP TABLE IF EXISTS public.class_session_assignments CASCADE;
DROP TABLE IF EXISTS public.class_module_assignments CASCADE;
DROP TABLE IF EXISTS public.course_content CASCADE;
DROP TABLE IF EXISTS public.course_sessions CASCADE;
DROP TABLE IF EXISTS public.course_modules CASCADE;
DROP TABLE IF EXISTS public.course_class_assignments CASCADE;
DROP TABLE IF EXISTS public.course_institution_assignments CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;
DROP TABLE IF EXISTS public.certificate_templates CASCADE;

-- Assessments
DROP TABLE IF EXISTS public.assessment_answers CASCADE;
DROP TABLE IF EXISTS public.assessment_attempts CASCADE;
DROP TABLE IF EXISTS public.assessment_class_assignments CASCADE;
DROP TABLE IF EXISTS public.assessment_questions CASCADE;
DROP TABLE IF EXISTS public.assessments CASCADE;

-- Assignments
DROP TABLE IF EXISTS public.assignment_submissions CASCADE;
DROP TABLE IF EXISTS public.assignment_class_assignments CASCADE;
DROP TABLE IF EXISTS public.assignments CASCADE;

-- Events
DROP TABLE IF EXISTS public.event_interests CASCADE;
DROP TABLE IF EXISTS public.event_updates CASCADE;
DROP TABLE IF EXISTS public.event_class_assignments CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;

-- Surveys
DROP TABLE IF EXISTS public.survey_response_answers CASCADE;
DROP TABLE IF EXISTS public.survey_responses CASCADE;
DROP TABLE IF EXISTS public.survey_questions CASCADE;
DROP TABLE IF EXISTS public.surveys CASCADE;

-- Attendance
DROP TABLE IF EXISTS public.class_session_attendance CASCADE;
DROP TABLE IF EXISTS public.officer_attendance CASCADE;
DROP TABLE IF EXISTS public.staff_attendance CASCADE;
DROP TABLE IF EXISTS public.attendance_corrections CASCADE;

-- Leave Management
DROP TABLE IF EXISTS public.leave_applications CASCADE;
DROP TABLE IF EXISTS public.leave_balance_adjustments CASCADE;
DROP TABLE IF EXISTS public.leave_balances CASCADE;
DROP TABLE IF EXISTS public.leave_approval_hierarchy CASCADE;
DROP TABLE IF EXISTS public.leave_settings CASCADE;

-- Payroll
DROP TABLE IF EXISTS public.payroll_records CASCADE;
DROP TABLE IF EXISTS public.overtime_requests CASCADE;

-- Tasks
DROP TABLE IF EXISTS public.task_activity_log CASCADE;
DROP TABLE IF EXISTS public.task_attachments CASCADE;
DROP TABLE IF EXISTS public.task_comments CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;

-- Projects
DROP TABLE IF EXISTS public.project_achievements CASCADE;
DROP TABLE IF EXISTS public.project_progress_updates CASCADE;
DROP TABLE IF EXISTS public.project_members CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;

-- HR
DROP TABLE IF EXISTS public.hr_rating_projects CASCADE;
DROP TABLE IF EXISTS public.hr_ratings CASCADE;
DROP TABLE IF EXISTS public.performance_appraisals CASCADE;
DROP TABLE IF EXISTS public.appraisal_projects CASCADE;

-- Invoices
DROP TABLE IF EXISTS public.invoice_line_items CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.invoice_number_sequences CASCADE;
DROP TABLE IF EXISTS public.reserved_invoice_numbers CASCADE;

-- Inventory
DROP TABLE IF EXISTS public.inventory_issues CASCADE;
DROP TABLE IF EXISTS public.inventory_items CASCADE;

-- Purchase
DROP TABLE IF EXISTS public.purchase_approval_chain CASCADE;
DROP TABLE IF EXISTS public.purchase_requests CASCADE;

-- Recruitment
DROP TABLE IF EXISTS public.candidate_offers CASCADE;
DROP TABLE IF EXISTS public.interview_feedback CASCADE;
DROP TABLE IF EXISTS public.candidate_interviews CASCADE;
DROP TABLE IF EXISTS public.interview_stages CASCADE;
DROP TABLE IF EXISTS public.job_applications CASCADE;
DROP TABLE IF EXISTS public.job_postings CASCADE;

-- CRM
DROP TABLE IF EXISTS public.crm_tasks CASCADE;
DROP TABLE IF EXISTS public.crm_contract_documents CASCADE;
DROP TABLE IF EXISTS public.crm_contracts CASCADE;
DROP TABLE IF EXISTS public.communication_log_attachments CASCADE;
DROP TABLE IF EXISTS public.communication_logs CASCADE;

-- Webinars and Newsletters
DROP TABLE IF EXISTS public.webinars CASCADE;
DROP TABLE IF EXISTS public.newsletters CASCADE;

-- Reports
DROP TABLE IF EXISTS public.reports CASCADE;

-- Daily Work Logs
DROP TABLE IF EXISTS public.daily_work_logs CASCADE;

-- Notifications
DROP TABLE IF EXISTS public.notifications CASCADE;

-- Officer Related
DROP TABLE IF EXISTS public.officer_class_access_grants CASCADE;
DROP TABLE IF EXISTS public.officer_institution_assignments CASCADE;
DROP TABLE IF EXISTS public.officer_documents CASCADE;

-- Timetable
DROP TABLE IF EXISTS public.institution_timetable_assignments CASCADE;

-- Students
DROP TABLE IF EXISTS public.students CASCADE;

-- Officers (must be after officer-related tables)
DROP TABLE IF EXISTS public.officers CASCADE;

-- Classes (must be after students, timetable, etc.)
DROP TABLE IF EXISTS public.classes CASCADE;

-- Staff Documents
DROP TABLE IF EXISTS public.staff_documents CASCADE;

-- Institution Related
DROP TABLE IF EXISTS public.institution_periods CASCADE;
DROP TABLE IF EXISTS public.id_counters CASCADE;
DROP TABLE IF EXISTS public.institution_holidays CASCADE;
DROP TABLE IF EXISTS public.calendar_day_types CASCADE;

-- Institutions (must be after all institution-dependent tables)
DROP TABLE IF EXISTS public.institutions CASCADE;

-- User Roles and Profiles
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- System Tables
DROP TABLE IF EXISTS public.system_logs CASCADE;
DROP TABLE IF EXISTS public.system_configurations CASCADE;
DROP TABLE IF EXISTS public.password_reset_tokens CASCADE;
DROP TABLE IF EXISTS public.ai_prompt_usage CASCADE;

-- Company
DROP TABLE IF EXISTS public.company_holidays CASCADE;
DROP TABLE IF EXISTS public.company_profiles CASCADE;

-- Positions
DROP TABLE IF EXISTS public.positions CASCADE;

-- Drop sequences
DROP SEQUENCE IF EXISTS public.inventory_items_sl_no_seq CASCADE;

-- Drop enum types (optional - uncomment if needed)
-- DROP TYPE IF EXISTS public.app_role CASCADE;

-- Re-enable triggers
SET session_replication_role = 'origin';

-- Confirm completion
DO $$ BEGIN RAISE NOTICE 'All tables and sequences dropped successfully!'; END $$;
