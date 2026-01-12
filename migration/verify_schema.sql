-- ============================================
-- Schema Verification Script
-- Run this on BOTH source and target databases
-- to compare and verify migration success
-- ============================================

-- ============================================
-- SECTION 1: Table Count
-- ============================================
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE';
    
    RAISE NOTICE '=== TABLE COUNT ===';
    RAISE NOTICE 'Total tables in public schema: %', v_count;
    
    IF v_count = 103 THEN
        RAISE NOTICE 'Status: PASSED (expected 103)';
    ELSE
        RAISE WARNING 'Status: MISMATCH (expected 103, got %)', v_count;
    END IF;
END $$;

-- ============================================
-- SECTION 2: List All Tables
-- ============================================
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns c 
     WHERE c.table_name = t.table_name AND c.table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ============================================
-- SECTION 3: Enum Types
-- ============================================
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count 
    FROM pg_type t
    JOIN pg_namespace n ON t.typnamespace = n.oid
    WHERE n.nspname = 'public' AND t.typtype = 'e';
    
    RAISE NOTICE '';
    RAISE NOTICE '=== ENUM TYPES ===';
    RAISE NOTICE 'Total enum types: %', v_count;
END $$;

SELECT 
    t.typname as enum_name,
    string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) as enum_values
FROM pg_type t
JOIN pg_namespace n ON t.typnamespace = n.oid
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE n.nspname = 'public' AND t.typtype = 'e'
GROUP BY t.typname;

-- ============================================
-- SECTION 4: Sequences
-- ============================================
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count 
    FROM information_schema.sequences 
    WHERE sequence_schema = 'public';
    
    RAISE NOTICE '';
    RAISE NOTICE '=== SEQUENCES ===';
    RAISE NOTICE 'Total sequences: %', v_count;
END $$;

SELECT sequence_name, data_type, start_value
FROM information_schema.sequences 
WHERE sequence_schema = 'public';

-- ============================================
-- SECTION 5: Functions
-- ============================================
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count 
    FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_type = 'FUNCTION';
    
    RAISE NOTICE '';
    RAISE NOTICE '=== FUNCTIONS ===';
    RAISE NOTICE 'Total functions: %', v_count;
END $$;

SELECT 
    routine_name,
    data_type as return_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- ============================================
-- SECTION 6: Foreign Key Constraints
-- ============================================
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count 
    FROM information_schema.table_constraints 
    WHERE constraint_schema = 'public' 
    AND constraint_type = 'FOREIGN KEY';
    
    RAISE NOTICE '';
    RAISE NOTICE '=== FOREIGN KEYS ===';
    RAISE NOTICE 'Total foreign keys: %', v_count;
END $$;

-- ============================================
-- SECTION 7: Indexes
-- ============================================
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count 
    FROM pg_indexes 
    WHERE schemaname = 'public';
    
    RAISE NOTICE '';
    RAISE NOTICE '=== INDEXES ===';
    RAISE NOTICE 'Total indexes: %', v_count;
END $$;

-- ============================================
-- SECTION 8: Critical Tables Check
-- ============================================
DO $$
DECLARE
    v_tables TEXT[] := ARRAY[
        'profiles', 'institutions', 'students', 'officers', 'classes',
        'courses', 'assessments', 'assignments', 'events', 'projects',
        'invoices', 'leave_applications', 'attendance_corrections',
        'user_roles', 'job_postings', 'tasks', 'task_comments'
    ];
    v_table TEXT;
    v_exists BOOLEAN;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== CRITICAL TABLES CHECK ===';
    
    FOREACH v_table IN ARRAY v_tables LOOP
        SELECT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = v_table
        ) INTO v_exists;
        
        IF v_exists THEN
            RAISE NOTICE '  % - EXISTS', v_table;
        ELSE
            RAISE WARNING '  % - MISSING!', v_table;
        END IF;
    END LOOP;
END $$;

-- ============================================
-- SECTION 9: RLS Status
-- ============================================
DO $$
DECLARE
    v_enabled INTEGER;
    v_disabled INTEGER;
BEGIN
    SELECT 
        COUNT(*) FILTER (WHERE relrowsecurity = true),
        COUNT(*) FILTER (WHERE relrowsecurity = false)
    INTO v_enabled, v_disabled
    FROM pg_class c
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public' AND c.relkind = 'r';
    
    RAISE NOTICE '';
    RAISE NOTICE '=== ROW LEVEL SECURITY ===';
    RAISE NOTICE 'Tables with RLS enabled: %', v_enabled;
    RAISE NOTICE 'Tables with RLS disabled: %', v_disabled;
END $$;

-- ============================================
-- SECTION 10: Summary
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'SCHEMA VERIFICATION COMPLETE';
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'Review any WARNINGS above for discrepancies.';
    RAISE NOTICE 'Expected counts for Meta-INNOVA LMS:';
    RAISE NOTICE '  - Tables: 103';
    RAISE NOTICE '  - Enum types: 1 (app_role)';
    RAISE NOTICE '  - Sequences: 1 (inventory_items_sl_no_seq)';
END $$;
