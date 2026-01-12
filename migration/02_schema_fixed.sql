-- ============================================
-- Meta-INNOVA LMS - Complete Database Schema (FIXED)
-- Generated from actual Lovable Cloud database
-- Run this AFTER 01_enums.sql
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================
-- SECTION 1: CORE TABLES (No Dependencies)
-- =============================================

-- Profiles table (references auth.users) - 40 COLUMNS
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    avatar TEXT,
    institution_id UUID,
    class_id UUID,
    position_id UUID,
    position_name TEXT,
    is_ceo BOOLEAN DEFAULT false,
    hourly_rate NUMERIC,
    overtime_rate_multiplier NUMERIC DEFAULT 1.5,
    normal_working_hours INTEGER DEFAULT 8,
    password_changed BOOLEAN DEFAULT true,
    must_change_password BOOLEAN DEFAULT false,
    password_changed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    join_date DATE,
    annual_salary NUMERIC DEFAULT 0,
    salary_structure JSONB DEFAULT '{}'::jsonb,
    statutory_info JSONB DEFAULT '{}'::jsonb,
    designation TEXT,
    employee_id TEXT,
    department TEXT,
    bank_name TEXT,
    bank_account_number TEXT,
    bank_ifsc TEXT,
    bank_branch TEXT,
    casual_leave_allowance INTEGER DEFAULT 12,
    sick_leave_allowance INTEGER DEFAULT 10,
    annual_leave_allowance INTEGER DEFAULT 22,
    phone TEXT,
    address TEXT,
    date_of_birth DATE,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    profile_photo_url TEXT,
    status TEXT DEFAULT 'active',
    check_in_time TIME DEFAULT '09:00:00',
    check_out_time TIME DEFAULT '17:00:00'
);

-- User roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.app_role NOT NULL,
    institution_id UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, role, institution_id)
);

-- Positions table
CREATE TABLE IF NOT EXISTS public.positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    department TEXT,
    level INTEGER DEFAULT 1,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- System configurations
CREATE TABLE IF NOT EXISTS public.system_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key TEXT NOT NULL UNIQUE,
    config_value JSONB,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- System logs
CREATE TABLE IF NOT EXISTS public.system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level TEXT NOT NULL DEFAULT 'info',
    message TEXT NOT NULL,
    metadata JSONB,
    user_id UUID,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Company profiles (for invoicing)
CREATE TABLE IF NOT EXISTS public.company_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    profile_type TEXT DEFAULT 'primary',
    address TEXT,
    city TEXT,
    state TEXT,
    state_code TEXT,
    country TEXT,
    pincode TEXT,
    email TEXT,
    phone TEXT,
    website TEXT,
    gstin TEXT,
    pan TEXT,
    cin TEXT,
    logo_url TEXT,
    signature_url TEXT,
    bank_details JSONB,
    terms_and_conditions TEXT,
    declaration TEXT,
    default_notes TEXT,
    default_cgst_rate NUMERIC DEFAULT 0,
    default_sgst_rate NUMERIC DEFAULT 0,
    default_igst_rate NUMERIC DEFAULT 0,
    report_logo_url TEXT,
    report_logo_width INTEGER,
    report_logo_height INTEGER,
    report_signatory_name TEXT,
    report_signatory_designation TEXT,
    is_default BOOLEAN DEFAULT false,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Company holidays
CREATE TABLE IF NOT EXISTS public.company_holidays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    date DATE NOT NULL,
    end_date DATE,
    holiday_type TEXT DEFAULT 'public',
    description TEXT,
    is_paid BOOLEAN DEFAULT true,
    year INTEGER NOT NULL,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- AI prompt usage
CREATE TABLE IF NOT EXISTS public.ai_prompt_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role TEXT DEFAULT 'unknown',
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    prompt_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, year, month)
);

-- =============================================
-- SECTION 2: INSTITUTIONS
-- =============================================

CREATE TABLE IF NOT EXISTS public.institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    code TEXT,
    type TEXT,
    status TEXT DEFAULT 'active',
    address JSONB,
    contact_info JSONB,
    settings JSONB,
    admin_user_id UUID,
    license_type TEXT,
    license_expiry DATE,
    max_users INTEGER DEFAULT 100,
    current_users INTEGER DEFAULT 0,
    contract_value NUMERIC,
    contract_expiry_date DATE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Institution holidays
CREATE TABLE IF NOT EXISTS public.institution_holidays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    date DATE NOT NULL,
    end_date DATE,
    holiday_type TEXT DEFAULT 'public',
    description TEXT,
    is_paid BOOLEAN DEFAULT true,
    year INTEGER NOT NULL,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Institution periods (timetable)
CREATE TABLE IF NOT EXISTS public.institution_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_break BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ID counters (for custom ID generation)
CREATE TABLE IF NOT EXISTS public.id_counters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL,
    prefix TEXT,
    year_format TEXT,
    counter_padding INTEGER DEFAULT 4,
    current_counter INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(institution_id, entity_type)
);

-- Calendar day types
CREATE TABLE IF NOT EXISTS public.calendar_day_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    day_type TEXT NOT NULL,
    calendar_type TEXT NOT NULL,
    description TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- SECTION 3: CLASSES
-- =============================================

CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    class_name TEXT NOT NULL,
    section TEXT,
    academic_year TEXT,
    class_teacher_id UUID,
    room_number TEXT,
    capacity INTEGER,
    status TEXT DEFAULT 'active',
    display_order INTEGER,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- SECTION 4: OFFICERS (Teachers/Staff) - 35 COLUMNS
-- =============================================

CREATE TABLE IF NOT EXISTS public.officers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    employee_id TEXT,
    employment_type TEXT NOT NULL DEFAULT 'full_time',
    status TEXT NOT NULL DEFAULT 'active',
    join_date DATE DEFAULT CURRENT_DATE,
    department TEXT DEFAULT 'Innovation & STEM Education',
    annual_salary NUMERIC NOT NULL DEFAULT 0,
    hourly_rate NUMERIC,
    overtime_rate_multiplier NUMERIC DEFAULT 1.5,
    normal_working_hours INTEGER DEFAULT 8,
    annual_leave_allowance INTEGER DEFAULT 15,
    sick_leave_allowance INTEGER DEFAULT 10,
    casual_leave_allowance INTEGER DEFAULT 12,
    date_of_birth DATE,
    address TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    profile_photo_url TEXT,
    bank_account_number TEXT,
    bank_name TEXT,
    bank_ifsc TEXT,
    bank_branch TEXT,
    qualifications JSONB DEFAULT '[]'::jsonb,
    certifications JSONB DEFAULT '[]'::jsonb,
    skills JSONB DEFAULT '[]'::jsonb,
    statutory_info JSONB DEFAULT '{}'::jsonb,
    salary_structure JSONB DEFAULT '{}'::jsonb,
    assigned_institutions UUID[] DEFAULT '{}'::uuid[],
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    designation TEXT
);

-- Officer documents
CREATE TABLE IF NOT EXISTS public.officer_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    officer_id UUID NOT NULL REFERENCES public.officers(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    document_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    uploaded_by UUID,
    uploaded_by_name TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Officer institution assignments
CREATE TABLE IF NOT EXISTS public.officer_institution_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    officer_id UUID NOT NULL REFERENCES public.officers(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'trainer',
    is_primary BOOLEAN DEFAULT false,
    assigned_at TIMESTAMPTZ DEFAULT now(),
    assigned_by UUID,
    UNIQUE(officer_id, institution_id)
);

-- Officer class access grants
CREATE TABLE IF NOT EXISTS public.officer_class_access_grants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    officer_id UUID NOT NULL REFERENCES public.officers(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    granted_at TIMESTAMPTZ DEFAULT now(),
    granted_by UUID,
    UNIQUE(officer_id, class_id)
);

-- Staff documents
CREATE TABLE IF NOT EXISTS public.staff_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    document_type TEXT NOT NULL,
    document_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    uploaded_by UUID,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- SECTION 5: STUDENTS
-- =============================================

CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    student_id TEXT,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    date_of_birth DATE,
    gender TEXT,
    blood_group TEXT,
    address JSONB,
    parent_info JSONB,
    emergency_contact JSONB,
    avatar TEXT,
    admission_date DATE,
    status TEXT DEFAULT 'active',
    roll_number TEXT,
    previous_school TEXT,
    medical_info JSONB,
    notes TEXT,
    xp_points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    streak_days INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- SECTION 6: TIMETABLE
-- =============================================

CREATE TABLE IF NOT EXISTS public.institution_timetable_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    class_name TEXT NOT NULL,
    period_id UUID NOT NULL REFERENCES public.institution_periods(id) ON DELETE CASCADE,
    day TEXT NOT NULL,
    subject TEXT NOT NULL,
    teacher_id UUID REFERENCES public.officers(id) ON DELETE SET NULL,
    teacher_name TEXT,
    secondary_officer_id UUID REFERENCES public.officers(id) ON DELETE SET NULL,
    secondary_officer_name TEXT,
    backup_officer_id UUID REFERENCES public.officers(id) ON DELETE SET NULL,
    backup_officer_name TEXT,
    room TEXT,
    academic_year TEXT DEFAULT '2024-25',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- SECTION 7: ATTENDANCE
-- =============================================

-- Officer attendance
CREATE TABLE IF NOT EXISTS public.officer_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    officer_id UUID NOT NULL REFERENCES public.officers(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    check_in TIMESTAMPTZ,
    check_out TIMESTAMPTZ,
    status TEXT DEFAULT 'present',
    work_hours NUMERIC,
    overtime_hours NUMERIC DEFAULT 0,
    location JSONB,
    notes TEXT,
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(officer_id, date)
);

-- Staff attendance
CREATE TABLE IF NOT EXISTS public.staff_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    user_type TEXT DEFAULT 'management',
    date DATE NOT NULL,
    check_in TIMESTAMPTZ,
    check_out TIMESTAMPTZ,
    status TEXT DEFAULT 'present',
    work_hours NUMERIC,
    overtime_hours NUMERIC DEFAULT 0,
    location JSONB,
    notes TEXT,
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, date)
);

-- Class session attendance
CREATE TABLE IF NOT EXISTS public.class_session_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    timetable_assignment_id UUID NOT NULL REFERENCES public.institution_timetable_assignments(id) ON DELETE CASCADE,
    officer_id UUID REFERENCES public.officers(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    period_label TEXT,
    period_time TEXT,
    subject TEXT,
    total_students INTEGER DEFAULT 0,
    students_present INTEGER DEFAULT 0,
    students_absent INTEGER DEFAULT 0,
    students_late INTEGER DEFAULT 0,
    attendance_records JSONB,
    is_session_completed BOOLEAN DEFAULT false,
    completed_by UUID REFERENCES public.officers(id) ON DELETE SET NULL,
    completed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Attendance corrections
CREATE TABLE IF NOT EXISTS public.attendance_corrections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attendance_id UUID NOT NULL,
    attendance_type TEXT NOT NULL,
    field_corrected TEXT NOT NULL,
    original_value TEXT,
    new_value TEXT,
    reason TEXT NOT NULL,
    corrected_by UUID,
    corrected_by_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- SECTION 8: LEAVE MANAGEMENT
-- =============================================

-- Leave settings
CREATE TABLE IF NOT EXISTS public.leave_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    leave_type TEXT NOT NULL,
    annual_quota INTEGER DEFAULT 0,
    carry_forward_allowed BOOLEAN DEFAULT false,
    max_carry_forward INTEGER DEFAULT 0,
    requires_approval BOOLEAN DEFAULT true,
    min_notice_days INTEGER DEFAULT 1,
    max_consecutive_days INTEGER,
    applicable_to TEXT[] DEFAULT ARRAY['officer', 'management'],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Leave balances
CREATE TABLE IF NOT EXISTS public.leave_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    user_type TEXT DEFAULT 'officer',
    officer_id UUID REFERENCES public.officers(id) ON DELETE CASCADE,
    leave_type TEXT NOT NULL,
    year INTEGER NOT NULL,
    total_allocated INTEGER DEFAULT 0,
    used INTEGER DEFAULT 0,
    pending INTEGER DEFAULT 0,
    carry_forward INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, leave_type, year)
);

-- Leave balance adjustments
CREATE TABLE IF NOT EXISTS public.leave_balance_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    leave_balance_id UUID NOT NULL REFERENCES public.leave_balances(id) ON DELETE CASCADE,
    adjustment_type TEXT NOT NULL,
    amount INTEGER NOT NULL,
    reason TEXT,
    adjusted_by UUID,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Leave approval hierarchy
CREATE TABLE IF NOT EXISTS public.leave_approval_hierarchy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    approver_id UUID NOT NULL,
    level INTEGER DEFAULT 1,
    user_type TEXT DEFAULT 'officer',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Leave applications
CREATE TABLE IF NOT EXISTS public.leave_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    user_type TEXT DEFAULT 'officer',
    officer_id UUID REFERENCES public.officers(id) ON DELETE CASCADE,
    leave_type TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days NUMERIC NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'pending',
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    documents JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- SECTION 9: PAYROLL & OVERTIME
-- =============================================

-- Payroll records
CREATE TABLE IF NOT EXISTS public.payroll_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    user_type TEXT DEFAULT 'officer',
    officer_id UUID REFERENCES public.officers(id) ON DELETE CASCADE,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    basic_salary NUMERIC DEFAULT 0,
    allowances JSONB DEFAULT '[]'::jsonb,
    deductions JSONB DEFAULT '[]'::jsonb,
    overtime_hours NUMERIC DEFAULT 0,
    overtime_amount NUMERIC DEFAULT 0,
    gross_salary NUMERIC DEFAULT 0,
    net_salary NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'draft',
    processed_by UUID,
    processed_at TIMESTAMPTZ,
    payment_date DATE,
    payment_method TEXT,
    payment_reference TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, month, year)
);

-- Overtime requests
CREATE TABLE IF NOT EXISTS public.overtime_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    user_type TEXT DEFAULT 'officer',
    officer_id UUID REFERENCES public.officers(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    hours NUMERIC NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'pending',
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Daily work logs
CREATE TABLE IF NOT EXISTS public.daily_work_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    user_type TEXT,
    officer_id UUID REFERENCES public.officers(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    tasks_completed TEXT,
    hours_logged NUMERIC,
    productivity_score INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- SECTION 10: COURSES
-- =============================================

-- Certificate templates
CREATE TABLE IF NOT EXISTS public.certificate_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    template_image_url TEXT,
    category TEXT DEFAULT 'course',
    name_position JSONB,
    date_position JSONB,
    course_name_position JSONB,
    level_title_position JSONB,
    default_width INTEGER,
    default_height INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Courses
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'technology',
    difficulty TEXT DEFAULT 'beginner',
    duration_weeks INTEGER,
    prerequisites TEXT,
    learning_outcomes JSONB,
    sdg_goals JSONB,
    thumbnail_url TEXT,
    status TEXT DEFAULT 'draft',
    certificate_template_id UUID,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Course modules
CREATE TABLE IF NOT EXISTS public.course_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    certificate_template_id UUID,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Course sessions
CREATE TABLE IF NOT EXISTS public.course_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    duration_minutes INTEGER,
    learning_objectives JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Course content
CREATE TABLE IF NOT EXISTS public.course_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES public.course_sessions(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    youtube_url TEXT,
    file_path TEXT,
    file_size_mb NUMERIC,
    duration_minutes INTEGER,
    display_order INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Course institution assignments
CREATE TABLE IF NOT EXISTS public.course_institution_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    assigned_by UUID,
    assigned_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(course_id, institution_id)
);

-- Course class assignments
CREATE TABLE IF NOT EXISTS public.course_class_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    assigned_by UUID,
    assigned_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(course_id, class_id)
);

-- Class module assignments
CREATE TABLE IF NOT EXISTS public.class_module_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_assignment_id UUID NOT NULL REFERENCES public.course_class_assignments(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
    is_unlocked BOOLEAN DEFAULT false,
    unlock_mode TEXT,
    unlock_order INTEGER,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Class session assignments
CREATE TABLE IF NOT EXISTS public.class_session_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_module_assignment_id UUID NOT NULL REFERENCES public.class_module_assignments(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES public.course_sessions(id) ON DELETE CASCADE,
    is_unlocked BOOLEAN DEFAULT false,
    unlock_mode TEXT,
    unlock_order INTEGER,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Student content completions
CREATE TABLE IF NOT EXISTS public.student_content_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES public.course_content(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
    completed_at TIMESTAMPTZ DEFAULT now(),
    time_spent_minutes INTEGER DEFAULT 0,
    UNIQUE(student_id, content_id)
);

-- Student certificates
CREATE TABLE IF NOT EXISTS public.student_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    certificate_type TEXT NOT NULL,
    reference_id UUID,
    certificate_number TEXT,
    issued_at TIMESTAMPTZ DEFAULT now(),
    course_title TEXT,
    module_title TEXT,
    student_name TEXT,
    institution_name TEXT,
    certificate_url TEXT,
    template_id UUID
);

-- =============================================
-- SECTION 11: ASSESSMENTS
-- =============================================

CREATE TABLE IF NOT EXISTS public.assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    total_points INTEGER NOT NULL DEFAULT 0,
    pass_percentage INTEGER NOT NULL DEFAULT 70,
    auto_submit BOOLEAN NOT NULL DEFAULT true,
    auto_evaluate BOOLEAN NOT NULL DEFAULT true,
    shuffle_questions BOOLEAN NOT NULL DEFAULT false,
    show_results_immediately BOOLEAN NOT NULL DEFAULT true,
    allow_review_after_submission BOOLEAN NOT NULL DEFAULT true,
    certificate_template_id TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_by_role TEXT NOT NULL DEFAULT 'system_admin',
    institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.assessment_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    question_number INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL DEFAULT 'mcq',
    options JSONB NOT NULL DEFAULT '[]'::jsonb,
    correct_option_id TEXT NOT NULL,
    points INTEGER NOT NULL DEFAULT 1,
    time_limit_seconds INTEGER,
    image_url TEXT,
    code_snippet TEXT,
    explanation TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.assessment_class_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.assessment_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    submitted_at TIMESTAMPTZ,
    time_taken_seconds INTEGER,
    score INTEGER NOT NULL DEFAULT 0,
    total_points INTEGER NOT NULL DEFAULT 0,
    percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
    passed BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'in_progress',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_manual BOOLEAN NOT NULL DEFAULT false,
    manual_notes TEXT,
    question_order JSONB,
    conducted_at TIMESTAMPTZ,
    retake_allowed BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.assessment_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES public.assessment_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.assessment_questions(id) ON DELETE CASCADE,
    selected_option_id TEXT,
    is_correct BOOLEAN NOT NULL DEFAULT false,
    points_earned INTEGER NOT NULL DEFAULT 0,
    time_spent_seconds INTEGER NOT NULL DEFAULT 0,
    answered_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- SECTION 12: ASSIGNMENTS
-- =============================================

CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    question_doc_url TEXT,
    start_date DATE NOT NULL,
    submission_end_date DATE NOT NULL,
    total_marks INTEGER,
    passing_marks INTEGER,
    allow_resubmit BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'draft',
    created_by UUID,
    created_by_role TEXT DEFAULT 'system_admin',
    institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.assignment_class_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    assigned_by UUID,
    assigned_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.assignment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    submission_pdf_url TEXT NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT now(),
    status TEXT DEFAULT 'submitted',
    marks_obtained INTEGER,
    feedback TEXT,
    graded_by UUID,
    graded_at TIMESTAMPTZ
);

-- =============================================
-- SECTION 13: EVENTS
-- =============================================

CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT NOT NULL,
    event_start TIMESTAMPTZ NOT NULL,
    event_end TIMESTAMPTZ,
    venue TEXT,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    registration_start TIMESTAMPTZ,
    registration_end TIMESTAMPTZ,
    eligibility_criteria TEXT,
    rules TEXT,
    prizes JSONB,
    brochure_url TEXT,
    attachments JSONB,
    status TEXT DEFAULT 'draft',
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.event_class_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    assigned_by UUID,
    assigned_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.event_interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    student_id UUID NOT NULL,
    student_name TEXT,
    email TEXT,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    institution_name TEXT,
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    class_name TEXT,
    section TEXT,
    registered_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.event_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    link_url TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- SECTION 14: SURVEYS
-- =============================================

CREATE TABLE IF NOT EXISTS public.surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    survey_type TEXT DEFAULT 'feedback',
    target_type TEXT DEFAULT 'students',
    status TEXT DEFAULT 'draft',
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    is_anonymous BOOLEAN DEFAULT false,
    requires_response BOOLEAN DEFAULT false,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
    class_ids UUID[],
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.survey_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL DEFAULT 'rating',
    options JSONB,
    is_required BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.survey_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
    respondent_id UUID,
    respondent_type TEXT,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    submitted_at TIMESTAMPTZ DEFAULT now(),
    is_complete BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.survey_response_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    response_id UUID NOT NULL REFERENCES public.survey_responses(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.survey_questions(id) ON DELETE CASCADE,
    answer_value TEXT,
    answer_rating INTEGER,
    answer_options JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- SECTION 15: GAMIFICATION
-- =============================================

CREATE TABLE IF NOT EXISTS public.gamification_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT 'award',
    category TEXT DEFAULT 'achievement',
    unlock_criteria JSONB DEFAULT '{}'::jsonb,
    xp_reward INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.student_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES public.gamification_badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(student_id, badge_id)
);

CREATE TABLE IF NOT EXISTS public.student_streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(student_id)
);

CREATE TABLE IF NOT EXISTS public.student_xp_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    xp_amount INTEGER NOT NULL,
    transaction_type TEXT NOT NULL,
    source TEXT NOT NULL,
    source_id UUID,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.xp_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_type TEXT NOT NULL UNIQUE,
    xp_value INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.leaderboard_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    scope TEXT NOT NULL DEFAULT 'global',
    institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    time_period TEXT DEFAULT 'all_time',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- SECTION 16: PROJECTS
-- =============================================

CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    status TEXT DEFAULT 'draft',
    start_date DATE,
    end_date DATE,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    mentor_id UUID,
    mentor_name TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, student_id)
);

CREATE TABLE IF NOT EXISTS public.project_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    achievement_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    achieved_at DATE,
    certificate_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.project_progress_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    update_text TEXT NOT NULL,
    attachments JSONB,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- SECTION 17: INVOICES (67 COLUMNS)
-- =============================================

CREATE TABLE IF NOT EXISTS public.invoice_number_sequences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sequence_type TEXT NOT NULL,
    prefix TEXT,
    current_number INTEGER DEFAULT 0,
    financial_year TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(sequence_type, financial_year)
);

CREATE TABLE IF NOT EXISTS public.reserved_invoice_numbers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT NOT NULL UNIQUE,
    invoice_type TEXT NOT NULL,
    reserved_at TIMESTAMPTZ DEFAULT now(),
    reserved_by UUID,
    original_invoice_id UUID,
    reason TEXT
);

CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT NOT NULL UNIQUE,
    invoice_type TEXT NOT NULL,
    from_company_name TEXT NOT NULL,
    from_company_address TEXT,
    from_company_city TEXT,
    from_company_state TEXT,
    from_company_state_code TEXT,
    from_company_pincode TEXT,
    from_company_gstin TEXT,
    from_company_pan TEXT,
    from_company_cin TEXT,
    from_company_phone TEXT,
    from_company_email TEXT,
    from_company_website TEXT,
    to_company_name TEXT NOT NULL,
    to_company_address TEXT,
    to_company_city TEXT,
    to_company_state TEXT,
    to_company_state_code TEXT,
    to_company_pincode TEXT,
    to_company_gstin TEXT,
    to_company_contact_person TEXT,
    to_company_phone TEXT,
    ship_to_name TEXT,
    ship_to_address TEXT,
    ship_to_city TEXT,
    ship_to_state TEXT,
    ship_to_state_code TEXT,
    ship_to_pincode TEXT,
    ship_to_gstin TEXT,
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    terms TEXT,
    place_of_supply TEXT,
    reference_number TEXT,
    delivery_note TEXT,
    sub_total NUMERIC NOT NULL DEFAULT 0,
    discount_amount NUMERIC DEFAULT 0,
    cgst_rate NUMERIC DEFAULT 9,
    cgst_amount NUMERIC DEFAULT 0,
    sgst_rate NUMERIC DEFAULT 9,
    sgst_amount NUMERIC DEFAULT 0,
    igst_rate NUMERIC DEFAULT 18,
    igst_amount NUMERIC DEFAULT 0,
    tds_rate NUMERIC DEFAULT 0,
    tds_amount NUMERIC DEFAULT 0,
    total_amount NUMERIC NOT NULL DEFAULT 0,
    balance_due NUMERIC NOT NULL DEFAULT 0,
    total_in_words TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    paid_date DATE,
    payment_method TEXT,
    bank_details JSONB DEFAULT '{}'::jsonb,
    notes TEXT,
    terms_and_conditions TEXT,
    declaration TEXT,
    irn TEXT,
    ack_number TEXT,
    ack_date TIMESTAMPTZ,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    attachment_url TEXT,
    attachment_name TEXT,
    attachment_type TEXT
);

CREATE TABLE IF NOT EXISTS public.invoice_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    hsn_sac TEXT,
    quantity NUMERIC NOT NULL DEFAULT 1,
    unit TEXT DEFAULT 'Nos',
    rate NUMERIC NOT NULL DEFAULT 0,
    discount_percent NUMERIC DEFAULT 0,
    discount_amount NUMERIC DEFAULT 0,
    taxable_value NUMERIC NOT NULL DEFAULT 0,
    gst_rate NUMERIC DEFAULT 18,
    cgst_amount NUMERIC DEFAULT 0,
    sgst_amount NUMERIC DEFAULT 0,
    igst_amount NUMERIC DEFAULT 0,
    total NUMERIC NOT NULL DEFAULT 0,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- SECTION 18: INVENTORY
-- =============================================

CREATE TABLE IF NOT EXISTS public.inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    sku TEXT UNIQUE,
    quantity INTEGER DEFAULT 0,
    unit TEXT DEFAULT 'pcs',
    minimum_stock INTEGER DEFAULT 0,
    location TEXT,
    cost_price NUMERIC DEFAULT 0,
    selling_price NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.inventory_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    issued_to UUID,
    issued_to_name TEXT,
    issued_to_type TEXT,
    purpose TEXT,
    issue_date DATE DEFAULT CURRENT_DATE,
    return_date DATE,
    status TEXT DEFAULT 'issued',
    notes TEXT,
    issued_by UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- SECTION 19: PURCHASE REQUESTS
-- =============================================

CREATE TABLE IF NOT EXISTS public.purchase_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_number TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    items JSONB DEFAULT '[]'::jsonb,
    total_amount NUMERIC DEFAULT 0,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'draft',
    requested_by UUID,
    requested_by_name TEXT,
    department TEXT,
    required_by DATE,
    vendor_name TEXT,
    vendor_details JSONB,
    attachments JSONB,
    approval_notes TEXT,
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.purchase_approval_chain (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES public.purchase_requests(id) ON DELETE CASCADE,
    approver_id UUID NOT NULL,
    approver_name TEXT,
    level INTEGER DEFAULT 1,
    status TEXT DEFAULT 'pending',
    comments TEXT,
    acted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- SECTION 20: TASKS
-- =============================================

CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'todo',
    due_date DATE,
    assigned_to UUID,
    assigned_to_name TEXT,
    assigned_by UUID,
    category TEXT,
    tags TEXT[],
    institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
    related_entity_type TEXT,
    related_entity_id UUID,
    completion_percentage INTEGER DEFAULT 0,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID,
    user_name TEXT,
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.task_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    uploaded_by UUID,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.task_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID,
    user_name TEXT,
    action TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- SECTION 21: HR & RECRUITMENT
-- =============================================

CREATE TABLE IF NOT EXISTS public.job_postings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    department TEXT,
    location TEXT,
    employment_type TEXT DEFAULT 'full_time',
    experience_level TEXT,
    salary_range_min NUMERIC,
    salary_range_max NUMERIC,
    description TEXT,
    requirements TEXT,
    responsibilities TEXT,
    benefits TEXT,
    status TEXT DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    closes_at DATE,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.job_postings(id) ON DELETE CASCADE,
    applicant_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    resume_url TEXT,
    cover_letter TEXT,
    experience_years NUMERIC,
    current_salary NUMERIC,
    expected_salary NUMERIC,
    notice_period TEXT,
    source TEXT,
    status TEXT DEFAULT 'new',
    notes TEXT,
    rating INTEGER,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.interview_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.job_postings(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    stage_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.candidate_interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES public.job_applications(id) ON DELETE CASCADE,
    stage_id UUID REFERENCES public.interview_stages(id) ON DELETE SET NULL,
    interview_type TEXT DEFAULT 'technical',
    scheduled_date DATE,
    scheduled_time TIME,
    duration_minutes INTEGER,
    interviewer_ids UUID[],
    interviewer_names TEXT[],
    location TEXT,
    meeting_link TEXT,
    status TEXT DEFAULT 'scheduled',
    result TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.interview_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID NOT NULL REFERENCES public.candidate_interviews(id) ON DELETE CASCADE,
    interviewer_id UUID,
    interviewer_name TEXT,
    overall_rating INTEGER,
    technical_rating INTEGER,
    communication_rating INTEGER,
    culture_fit_rating INTEGER,
    strengths TEXT,
    weaknesses TEXT,
    recommendation TEXT,
    detailed_feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.candidate_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES public.job_applications(id) ON DELETE CASCADE,
    job_title TEXT NOT NULL,
    department TEXT,
    offered_salary NUMERIC NOT NULL,
    joining_date DATE,
    probation_period_months INTEGER,
    benefits TEXT,
    offer_letter_url TEXT,
    status TEXT DEFAULT 'draft',
    sent_at TIMESTAMPTZ,
    expiry_date DATE,
    responded_at TIMESTAMPTZ,
    candidate_response_notes TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Performance Appraisals
CREATE TABLE IF NOT EXISTS public.performance_appraisals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    officer_id UUID REFERENCES public.officers(id) ON DELETE CASCADE,
    user_id UUID,
    user_type TEXT DEFAULT 'officer',
    appraisal_period TEXT NOT NULL,
    year INTEGER NOT NULL,
    self_rating INTEGER,
    manager_rating INTEGER,
    final_rating INTEGER,
    goals_achieved TEXT,
    areas_of_improvement TEXT,
    training_needs TEXT,
    comments TEXT,
    status TEXT DEFAULT 'draft',
    submitted_at TIMESTAMPTZ,
    reviewed_by UUID,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.appraisal_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appraisal_id UUID NOT NULL REFERENCES public.performance_appraisals(id) ON DELETE CASCADE,
    project_title TEXT NOT NULL,
    grade_level TEXT,
    domain TEXT,
    contest_name TEXT,
    level TEXT,
    result TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- HR Ratings
CREATE TABLE IF NOT EXISTS public.hr_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id UUID NOT NULL REFERENCES public.officers(id) ON DELETE CASCADE,
    trainer_name TEXT NOT NULL,
    employee_id TEXT NOT NULL,
    period TEXT NOT NULL,
    year INTEGER NOT NULL,
    total_stars_quarter INTEGER DEFAULT 0,
    cumulative_stars_year INTEGER DEFAULT 0,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.hr_rating_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hr_rating_id UUID NOT NULL REFERENCES public.hr_ratings(id) ON DELETE CASCADE,
    project_title TEXT NOT NULL,
    competition_level TEXT,
    result TEXT,
    stars_earned INTEGER DEFAULT 0,
    verified_by_hr BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    verified_date DATE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- SECTION 22: CRM
-- =============================================

CREATE TABLE IF NOT EXISTS public.communication_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    institution_name TEXT NOT NULL,
    type TEXT NOT NULL,
    subject TEXT NOT NULL,
    notes TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    contact_person TEXT NOT NULL,
    contact_role TEXT NOT NULL,
    conducted_by_id UUID,
    conducted_by_name TEXT NOT NULL,
    status TEXT DEFAULT 'completed',
    priority TEXT DEFAULT 'medium',
    next_action TEXT,
    next_action_date DATE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.communication_log_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    communication_log_id UUID NOT NULL REFERENCES public.communication_logs(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    storage_path TEXT NOT NULL,
    public_url TEXT NOT NULL,
    uploaded_by_id UUID,
    uploaded_by_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.crm_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    institution_name TEXT NOT NULL,
    contract_type TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    renewal_date DATE NOT NULL,
    contract_value NUMERIC DEFAULT 0,
    payment_terms TEXT DEFAULT 'annually',
    status TEXT DEFAULT 'active',
    renewal_status TEXT DEFAULT 'pending',
    auto_renew BOOLEAN DEFAULT false,
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.crm_contract_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES public.crm_contracts(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_size INTEGER,
    storage_path TEXT NOT NULL,
    public_url TEXT NOT NULL,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.crm_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    institution_name TEXT NOT NULL,
    task_type TEXT NOT NULL,
    description TEXT NOT NULL,
    due_date DATE NOT NULL,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'pending',
    assigned_to TEXT NOT NULL,
    assigned_to_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    related_contract_id UUID REFERENCES public.crm_contracts(id) ON DELETE SET NULL,
    completed_at TIMESTAMPTZ,
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- SECTION 23: NOTIFICATIONS & COMMUNICATION
-- =============================================

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    category TEXT,
    is_read BOOLEAN DEFAULT false,
    action_url TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.newsletters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    thumbnail_url TEXT,
    status TEXT DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    target_audience TEXT DEFAULT 'all',
    target_institutions UUID[],
    target_classes UUID[],
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.webinars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    presenter_name TEXT,
    presenter_bio TEXT,
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER,
    meeting_url TEXT,
    recording_url TEXT,
    thumbnail_url TEXT,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    status TEXT DEFAULT 'scheduled',
    target_audience TEXT DEFAULT 'all',
    target_institutions UUID[],
    target_classes UUID[],
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- SECTION 24: REPORTS & STUDENT FEEDBACK
-- =============================================

CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    parameters JSONB,
    generated_by UUID,
    generated_at TIMESTAMPTZ DEFAULT now(),
    file_url TEXT,
    status TEXT DEFAULT 'pending',
    institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.student_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    feedback_type TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    rating INTEGER,
    status TEXT DEFAULT 'pending',
    response TEXT,
    responded_by UUID,
    responded_at TIMESTAMPTZ,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- CREATE INDEXES FOR PERFORMANCE
-- =============================================

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_institution ON public.profiles(institution_id);
CREATE INDEX IF NOT EXISTS idx_profiles_class ON public.profiles(class_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- User Roles
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- Institutions
CREATE INDEX IF NOT EXISTS idx_institutions_slug ON public.institutions(slug);
CREATE INDEX IF NOT EXISTS idx_institutions_status ON public.institutions(status);

-- Classes
CREATE INDEX IF NOT EXISTS idx_classes_institution ON public.classes(institution_id);
CREATE INDEX IF NOT EXISTS idx_classes_status ON public.classes(status);

-- Officers
CREATE INDEX IF NOT EXISTS idx_officers_user_id ON public.officers(user_id);
CREATE INDEX IF NOT EXISTS idx_officers_email ON public.officers(email);
CREATE INDEX IF NOT EXISTS idx_officers_status ON public.officers(status);
CREATE INDEX IF NOT EXISTS idx_officers_assigned_institutions ON public.officers USING GIN(assigned_institutions);

-- Students
CREATE INDEX IF NOT EXISTS idx_students_user_id ON public.students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_institution ON public.students(institution_id);
CREATE INDEX IF NOT EXISTS idx_students_class ON public.students(class_id);
CREATE INDEX IF NOT EXISTS idx_students_email ON public.students(email);

-- Attendance
CREATE INDEX IF NOT EXISTS idx_officer_attendance_date ON public.officer_attendance(date);
CREATE INDEX IF NOT EXISTS idx_staff_attendance_date ON public.staff_attendance(date);
CREATE INDEX IF NOT EXISTS idx_class_session_attendance_date ON public.class_session_attendance(date);

-- Courses
CREATE INDEX IF NOT EXISTS idx_courses_status ON public.courses(status);
CREATE INDEX IF NOT EXISTS idx_course_content_session ON public.course_content(session_id);

-- Assessments
CREATE INDEX IF NOT EXISTS idx_assessments_status ON public.assessments(status);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_student ON public.assessment_attempts(student_id);

-- Invoices
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON public.invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoices_institution ON public.invoices(institution_id);

-- Tasks
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- =============================================
-- COMPLETION MESSAGE
-- =============================================

DO $$ BEGIN RAISE NOTICE 'Schema created successfully! Total: 103 tables'; END $$;
