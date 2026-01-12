-- ============================================
-- Cleanup Script for pg_dump Export
-- ============================================
-- This script provides cleanup patterns for pg_dump output
-- Run these as search/replace operations on your exported SQL file
-- OR use this as a reference for what to remove/modify

-- ============================================
-- STEP 1: Items to REMOVE from export
-- ============================================
-- Delete any lines containing these patterns:

-- 1. Supabase internal schemas (remove entire statements)
--    - CREATE SCHEMA auth;
--    - CREATE SCHEMA storage;
--    - CREATE SCHEMA supabase_functions;
--    - CREATE SCHEMA realtime;
--    - CREATE SCHEMA vault;

-- 2. Extension statements (target DB should have these)
--    - CREATE EXTENSION IF NOT EXISTS "uuid-ossp"
--    - CREATE EXTENSION IF NOT EXISTS "pg_graphql"
--    - CREATE EXTENSION IF NOT EXISTS "pgjwt"
--    - CREATE EXTENSION IF NOT EXISTS "pgcrypto"

-- 3. Auth schema references in foreign keys
--    - REFERENCES auth.users(id)
--    Replace with: (remove the FK or keep just user_id uuid column)

-- 4. Set statements to remove:
--    - SET default_tablespace = '';
--    - SET default_table_access_method = heap;
--    - SET statement_timeout = 0;
--    - SET lock_timeout = 0;

-- ============================================
-- STEP 2: Modifications to MAKE
-- ============================================

-- 1. Add IF NOT EXISTS to CREATE TABLE statements
--    Find:    CREATE TABLE public.
--    Replace: CREATE TABLE IF NOT EXISTS public.

-- 2. Add IF NOT EXISTS to CREATE INDEX statements
--    Find:    CREATE INDEX 
--    Replace: CREATE INDEX IF NOT EXISTS 

-- 3. Add IF NOT EXISTS to CREATE SEQUENCE statements
--    Find:    CREATE SEQUENCE
--    Replace: CREATE SEQUENCE IF NOT EXISTS

-- 4. Make ALTER TABLE ADD CONSTRAINT safe
--    Wrap constraint additions in DO blocks:
/*
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'constraint_name'
    ) THEN
        ALTER TABLE public.table_name ADD CONSTRAINT constraint_name ...;
    END IF;
END $$;
*/

-- ============================================
-- STEP 3: Verification Queries
-- ============================================
-- Run these after import to verify success:

-- Count tables
-- SELECT COUNT(*) as table_count 
-- FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
-- Expected: 103

-- Check for app_role enum
-- SELECT typname FROM pg_type WHERE typname = 'app_role';
-- Expected: 1 row

-- Check sequences
-- SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public';
-- Expected: inventory_items_sl_no_seq

-- ============================================
-- STEP 4: Common Fix Scripts
-- ============================================

-- Fix: If tables were created without IF NOT EXISTS and some exist
-- You can run this before import to drop everything:
/*
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END $$;
*/

-- Fix: Recreate public schema fresh
/*
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
*/

-- ============================================
-- AUTOMATED CLEANUP (PostgreSQL 14+)
-- ============================================
-- If your exported file is named 'lovable_schema_export.sql',
-- you can use sed/grep to clean it:

-- Linux/Mac:
-- sed -i 's/CREATE TABLE public\./CREATE TABLE IF NOT EXISTS public./g' lovable_schema_export.sql
-- sed -i 's/CREATE INDEX /CREATE INDEX IF NOT EXISTS /g' lovable_schema_export.sql
-- sed -i '/^SET /d' lovable_schema_export.sql
-- grep -v 'auth\.' lovable_schema_export.sql > cleaned_export.sql

-- Windows PowerShell:
-- (Get-Content lovable_schema_export.sql) -replace 'CREATE TABLE public\.', 'CREATE TABLE IF NOT EXISTS public.' | Set-Content cleaned_export.sql
