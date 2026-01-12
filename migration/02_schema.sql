-- ============================================
-- Meta-INNOVA LMS - Complete Database Schema
-- Run this AFTER 01_enums.sql
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================
-- SECTION 1: CORE TABLES (No Dependencies)
-- =============================================

-- Profiles table (references auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    name TEXT,
    avatar TEXT,
    phone TEXT,
    institution_id UUID,
    class_id UUID,
    position_id UUID,
    is_ceo BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
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
    role TEXT DEFAULT 'student',
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
-- SECTION 4: OFFICERS (Teachers/Staff)
-- =============================================

CREATE TABLE IF NOT EXISTS public.officers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    employee_id TEXT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    department TEXT,
    designation TEXT,
    position_id UUID REFERENCES public.positions(id),
    date_of_joining DATE,
    date_of_birth DATE,
    gender TEXT,
    blood_group TEXT,
    emergency_contact JSONB,
    address JSONB,
    avatar TEXT,
    status TEXT DEFAULT 'active',
    employment_type TEXT DEFAULT 'full_time',
    reporting_to UUID,
    skills TEXT[],
    certifications TEXT[],
    documents JSONB,
    bank_details JSONB,
    salary_details JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
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
    adjusted_by_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Leave approval hierarchy
CREATE TABLE IF NOT EXISTS public.leave_approval_hierarchy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    user_type TEXT DEFAULT 'officer',
    approver_id UUID NOT NULL,
    approver_type TEXT DEFAULT 'management',
    approval_level INTEGER DEFAULT 1,
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
    total_days INTEGER NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'pending',
    approved_by UUID,
    approved_by_name TEXT,
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    attachments JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- SECTION 9: COURSES & LEARNING
-- =============================================

-- Certificate templates
CREATE TABLE IF NOT EXISTS public.certificate_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'course',
    template_image_url TEXT,
    name_position JSONB,
    course_name_position JSONB,
    date_position JSONB,
    level_title_position JSONB,
    default_width INTEGER,
    default_height INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Courses
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general',
    difficulty TEXT DEFAULT 'beginner',
    duration_weeks INTEGER,
    prerequisites TEXT,
    learning_outcomes JSONB,
    sdg_goals JSONB,
    thumbnail_url TEXT,
    certificate_template_id UUID REFERENCES public.certificate_templates(id),
    status TEXT DEFAULT 'draft',
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
    certificate_template_id UUID REFERENCES public.certificate_templates(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Course sessions
CREATE TABLE IF NOT EXISTS public.course_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER,
    learning_objectives JSONB,
    display_order INTEGER DEFAULT 0,
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
    file_path TEXT,
    youtube_url TEXT,
    duration_minutes INTEGER,
    file_size_mb NUMERIC,
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
    unlock_mode TEXT DEFAULT 'manual',
    unlock_order INTEGER,
    is_unlocked BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Class session assignments
CREATE TABLE IF NOT EXISTS public.class_session_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_module_assignment_id UUID NOT NULL REFERENCES public.class_module_assignments(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES public.course_sessions(id) ON DELETE CASCADE,
    unlock_mode TEXT DEFAULT 'manual',
    unlock_order INTEGER,
    is_unlocked BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Student content completions
CREATE TABLE IF NOT EXISTS public.student_content_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    content_id UUID NOT NULL REFERENCES public.course_content(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.course_sessions(id) ON DELETE SET NULL,
    module_id UUID REFERENCES public.course_modules(id) ON DELETE SET NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    completed_at TIMESTAMPTZ DEFAULT now(),
    time_spent_seconds INTEGER DEFAULT 0,
    UNIQUE(student_id, content_id)
);

-- Student certificates
CREATE TABLE IF NOT EXISTS public.student_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    student_name TEXT NOT NULL,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
    institution_name TEXT,
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    class_name TEXT,
    course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    course_name TEXT,
    module_id UUID REFERENCES public.course_modules(id) ON DELETE SET NULL,
    module_name TEXT,
    template_id UUID REFERENCES public.certificate_templates(id) ON DELETE SET NULL,
    certificate_number TEXT UNIQUE,
    certificate_type TEXT DEFAULT 'course',
    issue_date DATE NOT NULL,
    certificate_url TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- SECTION 10: ASSESSMENTS
-- =============================================

CREATE TABLE IF NOT EXISTS public.assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.profiles(id),
    created_by_role TEXT DEFAULT 'super_admin',
    status TEXT DEFAULT 'draft',
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    total_points INTEGER DEFAULT 100,
    pass_percentage INTEGER DEFAULT 40,
    shuffle_questions BOOLEAN DEFAULT false,
    show_results_immediately BOOLEAN DEFAULT true,
    allow_review_after_submission BOOLEAN DEFAULT true,
    auto_submit BOOLEAN DEFAULT true,
    auto_evaluate BOOLEAN DEFAULT true,
    certificate_template_id UUID REFERENCES public.certificate_templates(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Assessment questions
CREATE TABLE IF NOT EXISTS public.assessment_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    question_number INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    question_type TEXT DEFAULT 'multiple_choice',
    options JSONB DEFAULT '[]',
    correct_option_id TEXT NOT NULL,
    points INTEGER DEFAULT 1,
    explanation TEXT,
    image_url TEXT,
    code_snippet TEXT,
    time_limit_seconds INTEGER,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Assessment class assignments
CREATE TABLE IF NOT EXISTS public.assessment_class_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES public.profiles(id),
    assigned_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(assessment_id, class_id)
);

-- Assessment attempts
CREATE TABLE IF NOT EXISTS public.assessment_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'in_progress',
    started_at TIMESTAMPTZ DEFAULT now(),
    submitted_at TIMESTAMPTZ,
    conducted_at TIMESTAMPTZ,
    time_taken_seconds INTEGER,
    score INTEGER DEFAULT 0,
    total_points INTEGER DEFAULT 0,
    percentage NUMERIC DEFAULT 0,
    passed BOOLEAN DEFAULT false,
    question_order JSONB,
    is_manual BOOLEAN DEFAULT false,
    manual_notes TEXT,
    retake_allowed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Assessment answers
CREATE TABLE IF NOT EXISTS public.assessment_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES public.assessment_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.assessment_questions(id) ON DELETE CASCADE,
    selected_option_id TEXT,
    is_correct BOOLEAN DEFAULT false,
    points_earned INTEGER DEFAULT 0,
    time_spent_seconds INTEGER DEFAULT 0,
    answered_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- SECTION 11: ASSIGNMENTS
-- =============================================

CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
    created_by UUID,
    created_by_role TEXT DEFAULT 'super_admin',
    question_doc_url TEXT,
    start_date DATE NOT NULL,
    submission_end_date DATE NOT NULL,
    total_marks INTEGER,
    passing_marks INTEGER,
    allow_resubmit BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Assignment class assignments
CREATE TABLE IF NOT EXISTS public.assignment_class_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    assigned_by UUID,
    assigned_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(assignment_id, class_id)
);

-- Assignment submissions
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    submission_pdf_url TEXT NOT NULL,
    status TEXT DEFAULT 'submitted',
    submitted_at TIMESTAMPTZ DEFAULT now(),
    marks_obtained INTEGER,
    feedback TEXT,
    graded_by UUID,
    graded_at TIMESTAMPTZ
);

-- =============================================
-- SECTION 12: GAMIFICATION
-- =============================================

-- XP rules
CREATE TABLE IF NOT EXISTS public.xp_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_type TEXT NOT NULL UNIQUE,
    xp_amount INTEGER NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Gamification badges
CREATE TABLE IF NOT EXISTS public.gamification_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT '🏆',
    category TEXT DEFAULT 'general',
    unlock_criteria JSONB DEFAULT '{}',
    xp_reward INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Student XP transactions
CREATE TABLE IF NOT EXISTS public.student_xp_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    action_type TEXT NOT NULL,
    xp_amount INTEGER NOT NULL,
    reference_id UUID,
    reference_type TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Student badges
CREATE TABLE IF NOT EXISTS public.student_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    badge_id UUID NOT NULL REFERENCES public.gamification_badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(student_id, badge_id)
);

-- Student streaks
CREATE TABLE IF NOT EXISTS public.student_streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL UNIQUE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Leaderboard configs
CREATE TABLE IF NOT EXISTS public.leaderboard_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    scope TEXT DEFAULT 'global',
    institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    metric TEXT DEFAULT 'xp',
    time_period TEXT DEFAULT 'all_time',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- SECTION 13: PROJECTS
-- =============================================

CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    project_type TEXT DEFAULT 'individual',
    domain TEXT,
    status TEXT DEFAULT 'active',
    start_date DATE,
    end_date DATE,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    created_by UUID,
    mentor_id UUID REFERENCES public.officers(id) ON DELETE SET NULL,
    mentor_name TEXT,
    competition_level TEXT,
    result TEXT,
    xp_awarded INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Project members
CREATE TABLE IF NOT EXISTS public.project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    student_id UUID NOT NULL,
    role TEXT DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, student_id)
);

-- Project achievements
CREATE TABLE IF NOT EXISTS public.project_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    achievement_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    date_achieved DATE,
    certificate_url TEXT,
    xp_awarded INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Project progress updates
CREATE TABLE IF NOT EXISTS public.project_progress_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    update_text TEXT NOT NULL,
    progress_percentage INTEGER,
    updated_by UUID,
    updated_by_name TEXT,
    attachments JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- SECTION 14: TASKS
-- =============================================

CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    task_type TEXT DEFAULT 'general',
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'pending',
    due_date TIMESTAMPTZ,
    due_time TIME,
    assigned_to UUID,
    assigned_to_name TEXT,
    assigned_to_type TEXT DEFAULT 'officer',
    assigned_by UUID,
    assigned_by_name TEXT,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
    institution_name TEXT,
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    class_name TEXT,
    related_entity_type TEXT,
    related_entity_id UUID,
    tags TEXT[],
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Task comments
CREATE TABLE IF NOT EXISTS public.task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    user_name TEXT NOT NULL,
    user_role TEXT,
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Task attachments
CREATE TABLE IF NOT EXISTS public.task_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    file_type TEXT,
    uploaded_by UUID,
    uploaded_by_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Task activity log
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
-- SECTION 15: EVENTS
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
    status TEXT DEFAULT 'upcoming',
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Event class assignments
CREATE TABLE IF NOT EXISTS public.event_class_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    assigned_by UUID,
    assigned_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(event_id, class_id)
);

-- Event interests (registrations)
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
    registered_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(event_id, student_id)
);

-- Event updates
CREATE TABLE IF NOT EXISTS public.event_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    link_url TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT now()
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
-- SECTION 16: HR & RECRUITMENT
-- =============================================

-- Interview stages
CREATE TABLE IF NOT EXISTS public.interview_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    stage_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Job postings
CREATE TABLE IF NOT EXISTS public.job_postings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    department TEXT,
    location TEXT,
    employment_type TEXT DEFAULT 'full_time',
    experience_required TEXT,
    salary_range TEXT,
    description TEXT,
    requirements TEXT,
    responsibilities TEXT,
    benefits TEXT,
    status TEXT DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    closing_date DATE,
    positions_available INTEGER DEFAULT 1,
    applications_count INTEGER DEFAULT 0,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Job applications
CREATE TABLE IF NOT EXISTS public.job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.job_postings(id) ON DELETE CASCADE,
    applicant_name TEXT NOT NULL,
    applicant_email TEXT NOT NULL,
    applicant_phone TEXT,
    resume_url TEXT,
    cover_letter TEXT,
    experience_years INTEGER,
    current_salary NUMERIC,
    expected_salary NUMERIC,
    notice_period TEXT,
    status TEXT DEFAULT 'new',
    current_stage_id UUID REFERENCES public.interview_stages(id),
    rating INTEGER,
    notes TEXT,
    source TEXT,
    applied_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Candidate interviews
CREATE TABLE IF NOT EXISTS public.candidate_interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES public.job_applications(id) ON DELETE CASCADE,
    stage_id UUID REFERENCES public.interview_stages(id),
    interview_type TEXT DEFAULT 'online',
    scheduled_date DATE,
    scheduled_time TIME,
    duration_minutes INTEGER DEFAULT 60,
    interviewer_ids UUID[],
    interviewer_names TEXT[],
    meeting_link TEXT,
    location TEXT,
    status TEXT DEFAULT 'scheduled',
    result TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Interview feedback
CREATE TABLE IF NOT EXISTS public.interview_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID NOT NULL REFERENCES public.candidate_interviews(id) ON DELETE CASCADE,
    interviewer_id UUID,
    interviewer_name TEXT,
    rating INTEGER,
    strengths TEXT,
    weaknesses TEXT,
    recommendation TEXT,
    notes TEXT,
    submitted_at TIMESTAMPTZ DEFAULT now()
);

-- Candidate offers
CREATE TABLE IF NOT EXISTS public.candidate_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES public.job_applications(id) ON DELETE CASCADE,
    job_title TEXT NOT NULL,
    department TEXT,
    offered_salary NUMERIC NOT NULL,
    benefits TEXT,
    joining_date DATE,
    probation_period_months INTEGER DEFAULT 3,
    offer_letter_url TEXT,
    expiry_date DATE,
    status TEXT DEFAULT 'draft',
    sent_at TIMESTAMPTZ,
    responded_at TIMESTAMPTZ,
    candidate_response_notes TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Performance appraisals
CREATE TABLE IF NOT EXISTS public.performance_appraisals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    officer_id UUID NOT NULL REFERENCES public.officers(id) ON DELETE CASCADE,
    officer_name TEXT NOT NULL,
    review_period TEXT NOT NULL,
    year INTEGER NOT NULL,
    reviewer_id UUID,
    reviewer_name TEXT,
    overall_rating NUMERIC,
    goals_achieved TEXT,
    areas_of_improvement TEXT,
    training_needs TEXT,
    employee_comments TEXT,
    reviewer_comments TEXT,
    status TEXT DEFAULT 'draft',
    submitted_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Appraisal projects
CREATE TABLE IF NOT EXISTS public.appraisal_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appraisal_id UUID NOT NULL REFERENCES public.performance_appraisals(id) ON DELETE CASCADE,
    project_title TEXT NOT NULL,
    domain TEXT,
    grade_level TEXT,
    contest_name TEXT,
    level TEXT,
    result TEXT,
    display_order INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- HR ratings
CREATE TABLE IF NOT EXISTS public.hr_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL,
    trainer_id UUID NOT NULL REFERENCES public.officers(id) ON DELETE CASCADE,
    trainer_name TEXT NOT NULL,
    period TEXT NOT NULL,
    year INTEGER NOT NULL,
    total_stars_quarter INTEGER DEFAULT 0,
    cumulative_stars_year INTEGER DEFAULT 0,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- HR rating projects
CREATE TABLE IF NOT EXISTS public.hr_rating_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hr_rating_id UUID NOT NULL REFERENCES public.hr_ratings(id) ON DELETE CASCADE,
    project_title TEXT NOT NULL,
    competition_level TEXT,
    result TEXT,
    stars_earned INTEGER DEFAULT 0,
    verified_by_hr BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES public.profiles(id),
    verified_date DATE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Payroll records
CREATE TABLE IF NOT EXISTS public.payroll_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    officer_id UUID NOT NULL REFERENCES public.officers(id) ON DELETE CASCADE,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    basic_salary NUMERIC NOT NULL,
    allowances JSONB,
    deductions JSONB,
    gross_salary NUMERIC,
    net_salary NUMERIC,
    payment_status TEXT DEFAULT 'pending',
    payment_date DATE,
    payment_method TEXT,
    transaction_reference TEXT,
    notes TEXT,
    processed_by UUID,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(officer_id, month, year)
);

-- Overtime requests
CREATE TABLE IF NOT EXISTS public.overtime_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    officer_id UUID NOT NULL REFERENCES public.officers(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    hours NUMERIC NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'pending',
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Daily work logs
CREATE TABLE IF NOT EXISTS public.daily_work_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    user_type TEXT DEFAULT 'officer',
    officer_id UUID REFERENCES public.officers(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    tasks_completed TEXT,
    hours_logged NUMERIC,
    productivity_score INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, date)
);

-- =============================================
-- SECTION 17: CRM
-- =============================================

-- CRM contracts
CREATE TABLE IF NOT EXISTS public.crm_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    institution_name TEXT NOT NULL,
    contract_type TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    renewal_date DATE NOT NULL,
    contract_value NUMERIC DEFAULT 0,
    payment_terms TEXT DEFAULT 'monthly',
    status TEXT DEFAULT 'active',
    renewal_status TEXT DEFAULT 'pending',
    auto_renew BOOLEAN DEFAULT false,
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- CRM contract documents
CREATE TABLE IF NOT EXISTS public.crm_contract_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES public.crm_contracts(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    public_url TEXT NOT NULL,
    file_size INTEGER,
    uploaded_by UUID REFERENCES public.profiles(id),
    uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- CRM tasks
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
    assigned_to_id UUID REFERENCES public.profiles(id),
    related_contract_id UUID REFERENCES public.crm_contracts(id) ON DELETE SET NULL,
    notes TEXT,
    completed_at TIMESTAMPTZ,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Communication logs
CREATE TABLE IF NOT EXISTS public.communication_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    institution_name TEXT NOT NULL,
    type TEXT NOT NULL,
    subject TEXT NOT NULL,
    notes TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    contact_role TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'completed',
    next_action TEXT,
    next_action_date DATE,
    conducted_by_id UUID,
    conducted_by_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Communication log attachments
CREATE TABLE IF NOT EXISTS public.communication_log_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    communication_log_id UUID NOT NULL REFERENCES public.communication_logs(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    storage_path TEXT NOT NULL,
    public_url TEXT NOT NULL,
    uploaded_by_id UUID,
    uploaded_by_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- SECTION 18: INVENTORY & PURCHASES
-- =============================================

-- Inventory items
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT,
    description TEXT,
    sku TEXT UNIQUE,
    unit TEXT DEFAULT 'piece',
    quantity INTEGER DEFAULT 0,
    min_quantity INTEGER DEFAULT 0,
    max_quantity INTEGER,
    unit_price NUMERIC,
    location TEXT,
    status TEXT DEFAULT 'active',
    last_restocked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Inventory issues
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
    returned_quantity INTEGER DEFAULT 0,
    status TEXT DEFAULT 'issued',
    notes TEXT,
    issued_by UUID,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Purchase requests
CREATE TABLE IF NOT EXISTS public.purchase_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_number TEXT UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    items JSONB NOT NULL,
    total_amount NUMERIC,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'draft',
    requested_by UUID,
    requested_by_name TEXT,
    department TEXT,
    required_by_date DATE,
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    vendor_id UUID,
    vendor_name TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Purchase approval chain
CREATE TABLE IF NOT EXISTS public.purchase_approval_chain (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES public.purchase_requests(id) ON DELETE CASCADE,
    approver_id UUID NOT NULL,
    approver_name TEXT NOT NULL,
    approval_level INTEGER DEFAULT 1,
    status TEXT DEFAULT 'pending',
    comments TEXT,
    acted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- SECTION 19: FINANCE
-- =============================================

-- Invoice number sequences
CREATE TABLE IF NOT EXISTS public.invoice_number_sequences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
    prefix TEXT NOT NULL,
    current_number INTEGER DEFAULT 0,
    fiscal_year TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(institution_id, prefix, fiscal_year)
);

-- Reserved invoice numbers
CREATE TABLE IF NOT EXISTS public.reserved_invoice_numbers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT NOT NULL UNIQUE,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
    reserved_at TIMESTAMPTZ DEFAULT now(),
    used BOOLEAN DEFAULT false
);

-- Invoices
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT NOT NULL UNIQUE,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
    institution_name TEXT,
    company_profile_id UUID REFERENCES public.company_profiles(id),
    billing_address JSONB,
    invoice_date DATE NOT NULL,
    due_date DATE,
    po_number TEXT,
    subject TEXT,
    subtotal NUMERIC DEFAULT 0,
    cgst_amount NUMERIC DEFAULT 0,
    sgst_amount NUMERIC DEFAULT 0,
    igst_amount NUMERIC DEFAULT 0,
    total_amount NUMERIC DEFAULT 0,
    amount_in_words TEXT,
    notes TEXT,
    terms_and_conditions TEXT,
    status TEXT DEFAULT 'draft',
    paid_amount NUMERIC DEFAULT 0,
    payment_date DATE,
    payment_method TEXT,
    payment_reference TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Invoice line items
CREATE TABLE IF NOT EXISTS public.invoice_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    hsn_code TEXT,
    quantity NUMERIC DEFAULT 1,
    unit TEXT DEFAULT 'nos',
    rate NUMERIC NOT NULL,
    amount NUMERIC NOT NULL,
    cgst_rate NUMERIC DEFAULT 0,
    sgst_rate NUMERIC DEFAULT 0,
    igst_rate NUMERIC DEFAULT 0,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- SECTION 20: SURVEYS
-- =============================================

CREATE TABLE IF NOT EXISTS public.surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    survey_type TEXT DEFAULT 'general',
    status TEXT DEFAULT 'draft',
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    is_anonymous BOOLEAN DEFAULT false,
    created_by UUID,
    created_by_role TEXT,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
    target_audience TEXT DEFAULT 'all',
    response_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Survey questions
CREATE TABLE IF NOT EXISTS public.survey_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT DEFAULT 'text',
    options JSONB,
    is_required BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Survey responses
CREATE TABLE IF NOT EXISTS public.survey_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
    respondent_id UUID,
    respondent_type TEXT,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    submitted_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(survey_id, respondent_id)
);

-- Survey response answers
CREATE TABLE IF NOT EXISTS public.survey_response_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    response_id UUID NOT NULL REFERENCES public.survey_responses(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.survey_questions(id) ON DELETE CASCADE,
    answer_text TEXT,
    answer_value JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- SECTION 21: COMMUNICATION
-- =============================================

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    action_url TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Newsletters
CREATE TABLE IF NOT EXISTS public.newsletters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT,
    cover_image_url TEXT,
    pdf_url TEXT,
    publish_date DATE,
    status TEXT DEFAULT 'draft',
    view_count INTEGER DEFAULT 0,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Webinars
CREATE TABLE IF NOT EXISTS public.webinars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    host_name TEXT,
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    meeting_link TEXT,
    recording_url TEXT,
    thumbnail_url TEXT,
    status TEXT DEFAULT 'upcoming',
    max_participants INTEGER,
    registered_count INTEGER DEFAULT 0,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Reports
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    report_type TEXT NOT NULL,
    parameters JSONB,
    generated_by UUID,
    generated_at TIMESTAMPTZ DEFAULT now(),
    file_url TEXT,
    status TEXT DEFAULT 'completed'
);

-- Student feedback
CREATE TABLE IF NOT EXISTS public.student_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    feedback_type TEXT DEFAULT 'general',
    subject TEXT,
    message TEXT NOT NULL,
    rating INTEGER,
    status TEXT DEFAULT 'new',
    responded_by UUID,
    response TEXT,
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- News feeds
CREATE TABLE IF NOT EXISTS public.news_feeds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT,
    image_url TEXT,
    category TEXT DEFAULT 'general',
    is_featured BOOLEAN DEFAULT false,
    published_at TIMESTAMPTZ,
    status TEXT DEFAULT 'draft',
    view_count INTEGER DEFAULT 0,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- SECTION 22: INDEXES
-- =============================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_institution ON public.profiles(institution_id);
CREATE INDEX IF NOT EXISTS idx_profiles_class ON public.profiles(class_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- User roles indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_roles_institution ON public.user_roles(institution_id);

-- Institutions indexes
CREATE INDEX IF NOT EXISTS idx_institutions_slug ON public.institutions(slug);
CREATE INDEX IF NOT EXISTS idx_institutions_status ON public.institutions(status);

-- Classes indexes
CREATE INDEX IF NOT EXISTS idx_classes_institution ON public.classes(institution_id);
CREATE INDEX IF NOT EXISTS idx_classes_status ON public.classes(status);

-- Officers indexes
CREATE INDEX IF NOT EXISTS idx_officers_user ON public.officers(user_id);
CREATE INDEX IF NOT EXISTS idx_officers_status ON public.officers(status);
CREATE INDEX IF NOT EXISTS idx_officers_email ON public.officers(email);

-- Students indexes
CREATE INDEX IF NOT EXISTS idx_students_user ON public.students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_institution ON public.students(institution_id);
CREATE INDEX IF NOT EXISTS idx_students_class ON public.students(class_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON public.students(status);
CREATE INDEX IF NOT EXISTS idx_students_email ON public.students(email);

-- Attendance indexes
CREATE INDEX IF NOT EXISTS idx_officer_attendance_officer ON public.officer_attendance(officer_id);
CREATE INDEX IF NOT EXISTS idx_officer_attendance_date ON public.officer_attendance(date);
CREATE INDEX IF NOT EXISTS idx_class_session_attendance_class ON public.class_session_attendance(class_id);
CREATE INDEX IF NOT EXISTS idx_class_session_attendance_date ON public.class_session_attendance(date);

-- Tasks indexes
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_institution ON public.tasks(institution_id);

-- Assessments indexes
CREATE INDEX IF NOT EXISTS idx_assessments_institution ON public.assessments(institution_id);
CREATE INDEX IF NOT EXISTS idx_assessments_status ON public.assessments(status);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_student ON public.assessment_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_assessment ON public.assessment_attempts(assessment_id);

-- Courses indexes
CREATE INDEX IF NOT EXISTS idx_courses_status ON public.courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_code ON public.courses(course_code);
CREATE INDEX IF NOT EXISTS idx_course_content_session ON public.course_content(session_id);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(is_read);

-- XP transactions indexes
CREATE INDEX IF NOT EXISTS idx_xp_transactions_student ON public.student_xp_transactions(student_id);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_date ON public.student_xp_transactions(created_at);

-- Projects indexes
CREATE INDEX IF NOT EXISTS idx_projects_institution ON public.projects(institution_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_project_members_student ON public.project_members(student_id);

-- Invoices indexes
CREATE INDEX IF NOT EXISTS idx_invoices_institution ON public.invoices(institution_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON public.invoices(invoice_date);

-- =============================================
-- DONE: Schema creation complete
-- =============================================

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;
