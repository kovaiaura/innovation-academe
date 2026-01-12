-- ============================================
-- Meta-INNOVA LMS - Schema Verification Script
-- Run this AFTER applying all migrations to verify schema matches
-- ============================================

-- This script will report any discrepancies between expected and actual schema

-- 1. Check table count
DO $$
DECLARE
    v_table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_table_count
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    
    IF v_table_count = 103 THEN
        RAISE NOTICE '✓ Table count: 103 tables (PASSED)';
    ELSE
        RAISE WARNING '✗ Table count mismatch: Expected 103, Found %', v_table_count;
    END IF;
END $$;

-- 2. Check column counts for key tables
DO $$
DECLARE
    v_record RECORD;
    v_expected_columns INTEGER;
    v_actual_columns INTEGER;
BEGIN
    -- Define expected column counts for critical tables
    FOR v_record IN 
        SELECT * FROM (VALUES
            ('ai_prompt_usage', 8),
            ('appraisal_projects', 10),
            ('assessment_answers', 8),
            ('assessment_attempts', 19),
            ('assessment_class_assignments', 6),
            ('assessment_questions', 14),
            ('assessments', 20),
            ('assignment_class_assignments', 6),
            ('assignment_submissions', 12),
            ('assignments', 15),
            ('attendance_corrections', 10),
            ('calendar_day_types', 9),
            ('candidate_interviews', 15),
            ('candidate_offers', 17),
            ('certificate_templates', 14),
            ('class_module_assignments', 8),
            ('class_session_assignments', 8),
            ('class_session_attendance', 20),
            ('classes', 12),
            ('communication_log_attachments', 10),
            ('communication_logs', 17),
            ('company_holidays', 11),
            ('company_profiles', 33),
            ('course_class_assignments', 6),
            ('course_content', 13),
            ('course_institution_assignments', 5),
            ('course_modules', 7),
            ('course_sessions', 9),
            ('courses', 16),
            ('crm_contract_documents', 8),
            ('crm_contracts', 16),
            ('crm_tasks', 16),
            ('daily_work_logs', 11),
            ('event_class_assignments', 6),
            ('event_interests', 11),
            ('event_updates', 7),
            ('events', 20),
            ('gamification_badges', 10),
            ('hr_rating_projects', 10),
            ('hr_ratings', 11),
            ('id_counters', 9),
            ('institution_holidays', 12),
            ('institution_periods', 9),
            ('institution_timetable_assignments', 17),
            ('institutions', 18),
            ('interview_feedback', 14),
            ('interview_stages', 7),
            ('inventory_issues', 19),
            ('inventory_items', 13),
            ('invoice_line_items', 18),
            ('invoice_number_sequences', 7),
            ('invoices', 67),
            ('job_applications', 18),
            ('job_postings', 19),
            ('leaderboard_configs', 9),
            ('leave_applications', 30),
            ('leave_approval_hierarchy', 9),
            ('leave_balance_adjustments', 12),
            ('leave_balances', 18),
            ('leave_settings', 6),
            ('newsletters', 15),
            ('news_feeds', 12),
            ('notifications', 14),
            ('officer_attendance', 33),
            ('officer_class_access_grants', 13),
            ('officer_documents', 10),
            ('officer_institution_assignments', 9),
            ('officers', 35),
            ('overtime_requests', 19),
            ('password_reset_tokens', 7),
            ('payroll_records', 51),
            ('performance_appraisals', 27),
            ('positions', 9),
            ('profiles', 40),
            ('project_achievements', 10),
            ('project_members', 6),
            ('project_progress_updates', 8),
            ('projects', 23),
            ('purchase_approval_chain', 8),
            ('purchase_requests', 21),
            ('reports', 24),
            ('reserved_invoice_numbers', 7),
            ('staff_attendance', 33),
            ('staff_documents', 11),
            ('student_badges', 5),
            ('student_certificates', 12),
            ('student_content_completions', 6),
            ('student_feedback', 20),
            ('student_streaks', 7),
            ('student_xp_transactions', 8),
            ('students', 22),
            ('survey_questions', 10),
            ('survey_response_answers', 7),
            ('survey_responses', 9),
            ('surveys', 12),
            ('system_configurations', 8),
            ('system_logs', 15),
            ('task_activity_log', 9),
            ('task_attachments', 10),
            ('tasks', 20),
            ('user_roles', 5),
            ('user_sessions', 8),
            ('xp_rules', 8)
        ) AS t(table_name, expected_count)
    LOOP
        SELECT COUNT(*) INTO v_actual_columns
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = v_record.table_name;
        
        IF v_actual_columns = v_record.expected_count THEN
            RAISE NOTICE '✓ % : % columns (PASSED)', v_record.table_name, v_actual_columns;
        ELSIF v_actual_columns = 0 THEN
            RAISE WARNING '✗ % : Table NOT FOUND!', v_record.table_name;
        ELSE
            RAISE WARNING '✗ % : Expected % columns, Found %', v_record.table_name, v_record.expected_count, v_actual_columns;
        END IF;
    END LOOP;
END $$;

-- 3. Check for required enum types
DO $$
DECLARE
    v_enum_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE t.typname = 'app_role' AND n.nspname = 'public'
    ) INTO v_enum_exists;
    
    IF v_enum_exists THEN
        RAISE NOTICE '✓ Enum type app_role exists (PASSED)';
    ELSE
        RAISE WARNING '✗ Enum type app_role NOT FOUND!';
    END IF;
END $$;

-- 4. Check for required sequences
DO $$
DECLARE
    v_seq_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.sequences
        WHERE sequence_schema = 'public' AND sequence_name = 'inventory_items_sl_no_seq'
    ) INTO v_seq_exists;
    
    IF v_seq_exists THEN
        RAISE NOTICE '✓ Sequence inventory_items_sl_no_seq exists (PASSED)';
    ELSE
        RAISE WARNING '✗ Sequence inventory_items_sl_no_seq NOT FOUND!';
    END IF;
END $$;

-- 5. Summary
DO $$ BEGIN 
    RAISE NOTICE '';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Schema Verification Complete';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'If you see any warnings (✗) above, the schema does not match exactly.';
    RAISE NOTICE 'Please review and fix any discrepancies before proceeding.';
END $$;
