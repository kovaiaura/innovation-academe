-- ============================================
-- Meta-INNOVA LMS - EXACT Schema (100% from Lovable Cloud)
-- Generated programmatically from database metadata
-- Run AFTER 01_enums.sql
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- SEQUENCES
-- ============================================
CREATE SEQUENCE IF NOT EXISTS public.inventory_items_sl_no_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

-- ============================================
-- ENUMS (if not created by 01_enums.sql)
-- ============================================
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM (
        'super_admin',
        'system_admin',
        'management',
        'officer',
        'teacher',
        'student'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- TABLES (103 tables - exact column definitions)
-- ============================================

-- 1. ai_prompt_usage (8 columns)
CREATE TABLE public.ai_prompt_usage (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    role text NOT NULL DEFAULT 'unknown'::text,
    prompt_count integer NOT NULL DEFAULT 0,
    month integer NOT NULL,
    year integer NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT ai_prompt_usage_pkey PRIMARY KEY (id),
    CONSTRAINT ai_prompt_usage_user_id_month_year_key UNIQUE (user_id, month, year)
);

-- 2. institutions (18 columns) - Create early for FK references
CREATE TABLE public.institutions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text NOT NULL,
    code text,
    address jsonb,
    contact_info jsonb,
    license_type text DEFAULT 'basic'::text,
    license_expiry timestamp with time zone,
    max_users integer DEFAULT 100,
    current_users integer DEFAULT 0,
    settings jsonb,
    status text DEFAULT 'active'::text,
    admin_user_id uuid,
    contract_value numeric DEFAULT 0,
    contract_expiry_date date,
    type text DEFAULT 'school'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT institutions_pkey PRIMARY KEY (id),
    CONSTRAINT institutions_slug_key UNIQUE (slug)
);

-- 3. positions (9 columns) - Create early for FK references
CREATE TABLE public.positions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    level integer DEFAULT 1,
    is_ceo_position boolean DEFAULT false,
    can_see_all_institutions boolean DEFAULT false,
    can_manage_users boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT positions_pkey PRIMARY KEY (id)
);

-- 4. profiles (40 columns)
CREATE TABLE public.profiles (
    id uuid NOT NULL,
    email text,
    name text,
    avatar text,
    role public.app_role DEFAULT 'student'::public.app_role,
    institution_id uuid,
    class_id uuid,
    phone text,
    date_of_birth date,
    gender text,
    address text,
    city text,
    state text,
    country text,
    pincode text,
    bio text,
    website text,
    linkedin text,
    twitter text,
    github text,
    skills jsonb DEFAULT '[]'::jsonb,
    interests jsonb DEFAULT '[]'::jsonb,
    education jsonb DEFAULT '[]'::jsonb,
    experience jsonb DEFAULT '[]'::jsonb,
    certifications jsonb DEFAULT '[]'::jsonb,
    achievements jsonb DEFAULT '[]'::jsonb,
    projects jsonb DEFAULT '[]'::jsonb,
    languages jsonb DEFAULT '[]'::jsonb,
    preferences jsonb DEFAULT '{}'::jsonb,
    notifications_enabled boolean DEFAULT true,
    email_notifications boolean DEFAULT true,
    push_notifications boolean DEFAULT true,
    dark_mode boolean DEFAULT false,
    last_login timestamp with time zone,
    login_count integer DEFAULT 0,
    is_ceo boolean DEFAULT false,
    position_id uuid,
    employee_id text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT profiles_pkey PRIMARY KEY (id)
);

-- 5. classes (12 columns)
CREATE TABLE public.classes (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    institution_id uuid NOT NULL,
    class_name text NOT NULL,
    section text,
    academic_year text,
    class_teacher_id uuid,
    room_number text,
    capacity integer,
    status text DEFAULT 'active'::text,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT classes_pkey PRIMARY KEY (id)
);

-- 6. officers (35 columns)
CREATE TABLE public.officers (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid,
    employee_id text NOT NULL,
    first_name text NOT NULL,
    last_name text,
    email text NOT NULL,
    phone text,
    whatsapp_number text,
    date_of_birth date,
    gender text,
    marital_status text,
    blood_group text,
    emergency_contact_name text,
    emergency_contact_phone text,
    current_address text,
    permanent_address text,
    city text,
    state text,
    country text DEFAULT 'India'::text,
    pincode text,
    profile_photo_url text,
    designation text,
    department text,
    employment_type text DEFAULT 'full_time'::text,
    joining_date date,
    probation_end_date date,
    confirmation_date date,
    status text DEFAULT 'active'::text,
    reporting_manager_id uuid,
    assigned_institutions uuid[],
    skills jsonb DEFAULT '[]'::jsonb,
    certifications jsonb DEFAULT '[]'::jsonb,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT officers_pkey PRIMARY KEY (id),
    CONSTRAINT officers_employee_id_key UNIQUE (employee_id),
    CONSTRAINT officers_email_key UNIQUE (email)
);

-- 7. students (22 columns)
CREATE TABLE public.students (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid,
    institution_id uuid,
    class_id uuid,
    student_id text,
    student_name text NOT NULL,
    email text,
    phone text,
    date_of_birth date,
    gender text,
    blood_group text,
    address text,
    city text,
    state text,
    pincode text,
    parent_name text,
    parent_phone text,
    parent_email text,
    avatar text,
    status text DEFAULT 'active'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT students_pkey PRIMARY KEY (id)
);

-- 8. appraisal_projects (10 columns)
CREATE TABLE public.appraisal_projects (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    appraisal_id uuid NOT NULL,
    project_title text NOT NULL,
    grade_level text,
    domain text,
    contest_name text,
    level text,
    result text,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT appraisal_projects_pkey PRIMARY KEY (id),
    CONSTRAINT appraisal_projects_level_check CHECK ((level = ANY (ARRAY['school'::text, 'district'::text, 'state'::text, 'national'::text, 'international'::text])))
);

-- 9. assessments (20 columns)
CREATE TABLE public.assessments (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text,
    status text NOT NULL DEFAULT 'draft'::text,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    duration_minutes integer NOT NULL DEFAULT 30,
    total_points integer NOT NULL DEFAULT 0,
    pass_percentage integer NOT NULL DEFAULT 70,
    auto_submit boolean NOT NULL DEFAULT true,
    auto_evaluate boolean NOT NULL DEFAULT true,
    shuffle_questions boolean NOT NULL DEFAULT false,
    show_results_immediately boolean NOT NULL DEFAULT true,
    allow_review_after_submission boolean NOT NULL DEFAULT true,
    certificate_template_id text,
    created_by uuid,
    created_by_role text NOT NULL DEFAULT 'system_admin'::text,
    institution_id uuid,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT assessments_pkey PRIMARY KEY (id),
    CONSTRAINT assessments_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'published'::text, 'unpublished'::text]))),
    CONSTRAINT assessments_pass_percentage_check CHECK (((pass_percentage >= 0) AND (pass_percentage <= 100))),
    CONSTRAINT assessments_created_by_role_check CHECK ((created_by_role = ANY (ARRAY['system_admin'::text, 'officer'::text])))
);

-- 10. assessment_questions (14 columns)
CREATE TABLE public.assessment_questions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    assessment_id uuid NOT NULL,
    question_number integer NOT NULL,
    question_text text NOT NULL,
    question_type text NOT NULL DEFAULT 'mcq'::text,
    options jsonb NOT NULL DEFAULT '[]'::jsonb,
    correct_option_id text NOT NULL,
    points integer NOT NULL DEFAULT 1,
    time_limit_seconds integer,
    image_url text,
    code_snippet text,
    explanation text,
    display_order integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT assessment_questions_pkey PRIMARY KEY (id),
    CONSTRAINT assessment_questions_question_type_check CHECK ((question_type = 'mcq'::text))
);

-- 11. assessment_attempts (19 columns)
CREATE TABLE public.assessment_attempts (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    assessment_id uuid NOT NULL,
    student_id uuid NOT NULL,
    institution_id uuid NOT NULL,
    class_id uuid NOT NULL,
    started_at timestamp with time zone NOT NULL DEFAULT now(),
    submitted_at timestamp with time zone,
    time_taken_seconds integer,
    score integer NOT NULL DEFAULT 0,
    total_points integer NOT NULL DEFAULT 0,
    percentage numeric(5,2) NOT NULL DEFAULT 0,
    passed boolean NOT NULL DEFAULT false,
    status text NOT NULL DEFAULT 'in_progress'::text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    is_manual boolean NOT NULL DEFAULT false,
    manual_notes text,
    question_order jsonb,
    conducted_at timestamp with time zone,
    retake_allowed boolean DEFAULT false,
    CONSTRAINT assessment_attempts_pkey PRIMARY KEY (id),
    CONSTRAINT assessment_attempts_status_check CHECK ((status = ANY (ARRAY['in_progress'::text, 'submitted'::text, 'auto_submitted'::text, 'evaluated'::text])))
);

-- 12. assessment_answers (8 columns)
CREATE TABLE public.assessment_answers (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    attempt_id uuid NOT NULL,
    question_id uuid NOT NULL,
    selected_option_id text,
    is_correct boolean NOT NULL DEFAULT false,
    points_earned integer NOT NULL DEFAULT 0,
    time_spent_seconds integer NOT NULL DEFAULT 0,
    answered_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT assessment_answers_pkey PRIMARY KEY (id),
    CONSTRAINT assessment_answers_attempt_id_question_id_key UNIQUE (attempt_id, question_id)
);

-- 13. assessment_class_assignments (6 columns)
CREATE TABLE public.assessment_class_assignments (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    assessment_id uuid NOT NULL,
    institution_id uuid NOT NULL,
    class_id uuid NOT NULL,
    assigned_by uuid,
    assigned_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT assessment_class_assignments_pkey PRIMARY KEY (id),
    CONSTRAINT assessment_class_assignments_assessment_id_class_id_key UNIQUE (assessment_id, class_id)
);

-- 14. assignments (15 columns)
CREATE TABLE public.assignments (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text,
    question_doc_url text,
    start_date timestamp with time zone NOT NULL,
    submission_end_date timestamp with time zone NOT NULL,
    total_marks integer,
    passing_marks integer,
    allow_resubmit boolean DEFAULT false,
    status text NOT NULL DEFAULT 'draft'::text,
    created_by uuid,
    created_by_role text NOT NULL DEFAULT 'system_admin'::text,
    institution_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT assignments_pkey PRIMARY KEY (id),
    CONSTRAINT assignments_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'published'::text, 'unpublished'::text]))),
    CONSTRAINT assignments_created_by_role_check CHECK ((created_by_role = ANY (ARRAY['system_admin'::text, 'officer'::text])))
);

-- 15. assignment_class_assignments (6 columns)
CREATE TABLE public.assignment_class_assignments (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    assignment_id uuid NOT NULL,
    institution_id uuid NOT NULL,
    class_id uuid NOT NULL,
    assigned_by uuid,
    assigned_at timestamp with time zone DEFAULT now(),
    CONSTRAINT assignment_class_assignments_pkey PRIMARY KEY (id),
    CONSTRAINT assignment_class_assignments_assignment_id_class_id_key UNIQUE (assignment_id, class_id)
);

-- 16. assignment_submissions (12 columns)
CREATE TABLE public.assignment_submissions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    assignment_id uuid NOT NULL,
    student_id uuid NOT NULL,
    institution_id uuid NOT NULL,
    class_id uuid NOT NULL,
    submission_pdf_url text NOT NULL,
    status text NOT NULL DEFAULT 'submitted'::text,
    marks_obtained integer,
    feedback text,
    graded_by uuid,
    graded_at timestamp with time zone,
    submitted_at timestamp with time zone DEFAULT now(),
    CONSTRAINT assignment_submissions_pkey PRIMARY KEY (id),
    CONSTRAINT assignment_submissions_assignment_id_student_id_key UNIQUE (assignment_id, student_id),
    CONSTRAINT assignment_submissions_status_check CHECK ((status = ANY (ARRAY['submitted'::text, 'graded'::text, 'returned'::text])))
);

-- 17. attendance_corrections (10 columns)
CREATE TABLE public.attendance_corrections (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    attendance_id uuid NOT NULL,
    attendance_type text NOT NULL,
    field_corrected text NOT NULL,
    original_value text,
    new_value text,
    reason text NOT NULL,
    corrected_by uuid,
    corrected_by_name text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT attendance_corrections_pkey PRIMARY KEY (id),
    CONSTRAINT attendance_corrections_attendance_type_check CHECK ((attendance_type = ANY (ARRAY['officer'::text, 'staff'::text, 'session'::text])))
);

-- 18. calendar_day_types (9 columns)
CREATE TABLE public.calendar_day_types (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    date date NOT NULL,
    day_type text NOT NULL,
    calendar_type text NOT NULL,
    institution_id uuid,
    description text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT calendar_day_types_pkey PRIMARY KEY (id),
    CONSTRAINT calendar_day_types_calendar_type_institution_id_date_key UNIQUE (calendar_type, institution_id, date),
    CONSTRAINT calendar_day_types_day_type_check CHECK ((day_type = ANY (ARRAY['working'::text, 'holiday'::text, 'half_day'::text]))),
    CONSTRAINT calendar_day_types_calendar_type_check CHECK ((calendar_type = ANY (ARRAY['company'::text, 'institution'::text])))
);

-- 19. candidate_interviews (15 columns)
CREATE TABLE public.candidate_interviews (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    application_id uuid,
    stage_id uuid,
    interview_type text NOT NULL DEFAULT 'in_person'::text,
    scheduled_date date,
    scheduled_time text,
    duration_minutes integer DEFAULT 60,
    location text,
    meeting_link text,
    interviewer_ids uuid[],
    interviewer_names text[],
    status text DEFAULT 'scheduled'::text,
    result text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT candidate_interviews_pkey PRIMARY KEY (id),
    CONSTRAINT candidate_interviews_interview_type_check CHECK ((interview_type = ANY (ARRAY['in_person'::text, 'video'::text, 'phone'::text]))),
    CONSTRAINT candidate_interviews_status_check CHECK ((status = ANY (ARRAY['scheduled'::text, 'completed'::text, 'cancelled'::text, 'rescheduled'::text]))),
    CONSTRAINT candidate_interviews_result_check CHECK ((result = ANY (ARRAY['passed'::text, 'failed'::text, 'on_hold'::text])))
);

-- 20. candidate_offers (17 columns)
CREATE TABLE public.candidate_offers (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    application_id uuid,
    job_title text NOT NULL,
    department text,
    offered_salary numeric NOT NULL,
    joining_date date,
    probation_period_months integer DEFAULT 3,
    benefits text,
    offer_letter_url text,
    status text DEFAULT 'draft'::text,
    sent_at timestamp with time zone,
    expiry_date date,
    responded_at timestamp with time zone,
    candidate_response_notes text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT candidate_offers_pkey PRIMARY KEY (id),
    CONSTRAINT candidate_offers_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'sent'::text, 'accepted'::text, 'rejected'::text, 'expired'::text, 'withdrawn'::text])))
);

-- 21. certificate_templates (14 columns)
CREATE TABLE public.certificate_templates (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    template_image_url text,
    category text NOT NULL DEFAULT 'course'::text,
    name_position jsonb,
    course_name_position jsonb,
    level_title_position jsonb,
    date_position jsonb,
    default_width integer,
    default_height integer,
    is_active boolean DEFAULT true,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT certificate_templates_pkey PRIMARY KEY (id),
    CONSTRAINT certificate_templates_category_check CHECK ((category = ANY (ARRAY['course'::text, 'module'::text, 'assessment'::text, 'event'::text, 'achievement'::text])))
);

-- 22. class_module_assignments (8 columns)
CREATE TABLE public.class_module_assignments (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    class_assignment_id uuid NOT NULL,
    module_id uuid NOT NULL,
    unlock_mode text DEFAULT 'sequential'::text,
    unlock_order integer DEFAULT 1,
    is_unlocked boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT class_module_assignments_pkey PRIMARY KEY (id),
    CONSTRAINT class_module_assignments_class_assignment_id_module_id_key UNIQUE (class_assignment_id, module_id),
    CONSTRAINT class_module_assignments_unlock_mode_check CHECK ((unlock_mode = ANY (ARRAY['sequential'::text, 'manual'::text, 'all_unlocked'::text])))
);

-- 23. class_session_assignments (8 columns)
CREATE TABLE public.class_session_assignments (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    class_module_assignment_id uuid NOT NULL,
    session_id uuid NOT NULL,
    unlock_mode text DEFAULT 'sequential'::text,
    unlock_order integer DEFAULT 1,
    is_unlocked boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT class_session_assignments_pkey PRIMARY KEY (id),
    CONSTRAINT class_session_assignments_class_module_assignment_id_sessio_key UNIQUE (class_module_assignment_id, session_id),
    CONSTRAINT class_session_assignments_unlock_mode_check CHECK ((unlock_mode = ANY (ARRAY['sequential'::text, 'manual'::text, 'all_unlocked'::text])))
);

-- 24. class_session_attendance (20 columns)
CREATE TABLE public.class_session_attendance (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    institution_id uuid NOT NULL,
    class_id uuid NOT NULL,
    timetable_assignment_id uuid NOT NULL,
    officer_id uuid,
    date date NOT NULL,
    period_label text,
    period_time text,
    subject text,
    attendance_records jsonb,
    total_students integer NOT NULL DEFAULT 0,
    students_present integer NOT NULL DEFAULT 0,
    students_absent integer NOT NULL DEFAULT 0,
    students_late integer NOT NULL DEFAULT 0,
    is_session_completed boolean DEFAULT false,
    completed_by uuid,
    completed_at timestamp with time zone,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT class_session_attendance_pkey PRIMARY KEY (id),
    CONSTRAINT class_session_attendance_timetable_assignment_id_date_key UNIQUE (timetable_assignment_id, date)
);

-- 25. communication_log_attachments (10 columns)
CREATE TABLE public.communication_log_attachments (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    communication_log_id uuid NOT NULL,
    file_name text NOT NULL,
    file_type text NOT NULL,
    file_size integer NOT NULL,
    storage_path text NOT NULL,
    public_url text NOT NULL,
    uploaded_by_id uuid,
    uploaded_by_name text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT communication_log_attachments_pkey PRIMARY KEY (id)
);

-- 26. communication_logs (17 columns)
CREATE TABLE public.communication_logs (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    institution_id uuid NOT NULL,
    institution_name text NOT NULL,
    type text NOT NULL,
    subject text NOT NULL,
    notes text NOT NULL,
    contact_person text NOT NULL,
    contact_role text NOT NULL,
    status text NOT NULL DEFAULT 'completed'::text,
    priority text NOT NULL DEFAULT 'medium'::text,
    next_action text,
    next_action_date date,
    conducted_by_id uuid,
    conducted_by_name text NOT NULL,
    date date NOT NULL DEFAULT CURRENT_DATE,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT communication_logs_pkey PRIMARY KEY (id),
    CONSTRAINT communication_logs_type_check CHECK ((type = ANY (ARRAY['call'::text, 'email'::text, 'meeting'::text, 'visit'::text, 'whatsapp'::text, 'other'::text]))),
    CONSTRAINT communication_logs_status_check CHECK ((status = ANY (ARRAY['completed'::text, 'pending'::text, 'follow_up'::text]))),
    CONSTRAINT communication_logs_priority_check CHECK ((priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'urgent'::text])))
);

-- 27. company_holidays (11 columns)
CREATE TABLE public.company_holidays (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    date date NOT NULL,
    end_date date,
    year integer NOT NULL,
    holiday_type text NOT NULL DEFAULT 'public'::text,
    description text,
    is_paid boolean DEFAULT true,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT company_holidays_pkey PRIMARY KEY (id),
    CONSTRAINT company_holidays_holiday_type_check CHECK ((holiday_type = ANY (ARRAY['public'::text, 'company'::text, 'optional'::text])))
);

-- 28. company_profiles (33 columns)
CREATE TABLE public.company_profiles (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    company_name text NOT NULL,
    profile_type text NOT NULL DEFAULT 'company'::text,
    is_default boolean DEFAULT false,
    logo_url text,
    signature_url text,
    address text,
    city text,
    state text,
    country text,
    pincode text,
    phone text,
    email text,
    website text,
    gstin text,
    pan text,
    cin text,
    state_code text,
    bank_details jsonb,
    terms_and_conditions text,
    default_notes text,
    declaration text,
    default_cgst_rate numeric(5,2) DEFAULT 9.00,
    default_sgst_rate numeric(5,2) DEFAULT 9.00,
    default_igst_rate numeric(5,2) DEFAULT 18.00,
    report_logo_url text,
    report_logo_width integer,
    report_logo_height integer,
    report_signatory_name text,
    report_signatory_designation text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT company_profiles_pkey PRIMARY KEY (id),
    CONSTRAINT company_profiles_profile_type_check CHECK ((profile_type = ANY (ARRAY['company'::text, 'brand'::text])))
);

-- 29. courses (16 columns)
CREATE TABLE public.courses (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    course_code text NOT NULL,
    title text NOT NULL,
    description text,
    category text NOT NULL DEFAULT 'technology'::text,
    difficulty text NOT NULL DEFAULT 'beginner'::text,
    duration_weeks integer,
    prerequisites text,
    learning_outcomes jsonb,
    sdg_goals jsonb,
    thumbnail_url text,
    certificate_template_id uuid,
    status text NOT NULL DEFAULT 'draft'::text,
    created_by uuid,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT courses_pkey PRIMARY KEY (id),
    CONSTRAINT courses_course_code_key UNIQUE (course_code),
    CONSTRAINT courses_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'published'::text, 'archived'::text]))),
    CONSTRAINT courses_difficulty_check CHECK ((difficulty = ANY (ARRAY['beginner'::text, 'intermediate'::text, 'advanced'::text])))
);

-- 30. course_modules (7 columns)
CREATE TABLE public.course_modules (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    course_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    display_order integer NOT NULL DEFAULT 0,
    certificate_template_id uuid,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT course_modules_pkey PRIMARY KEY (id)
);

-- 31. course_sessions (9 columns)
CREATE TABLE public.course_sessions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    course_id uuid NOT NULL,
    module_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    duration_minutes integer,
    learning_objectives jsonb,
    display_order integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT course_sessions_pkey PRIMARY KEY (id)
);

-- 32. course_content (13 columns)
CREATE TABLE public.course_content (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    course_id uuid NOT NULL,
    module_id uuid NOT NULL,
    session_id uuid NOT NULL,
    title text NOT NULL,
    type text NOT NULL,
    youtube_url text,
    file_path text,
    file_size_mb numeric(10,2),
    duration_minutes integer,
    display_order integer NOT NULL DEFAULT 0,
    views_count integer DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT course_content_pkey PRIMARY KEY (id),
    CONSTRAINT course_content_type_check CHECK ((type = ANY (ARRAY['video'::text, 'youtube'::text, 'pdf'::text, 'document'::text, 'presentation'::text, 'quiz'::text])))
);

-- 33. course_institution_assignments (5 columns)
CREATE TABLE public.course_institution_assignments (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    course_id uuid NOT NULL,
    institution_id uuid NOT NULL,
    assigned_by uuid,
    assigned_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT course_institution_assignments_pkey PRIMARY KEY (id),
    CONSTRAINT course_institution_assignments_course_id_institution_id_key UNIQUE (course_id, institution_id)
);

-- 34. course_class_assignments (6 columns)
CREATE TABLE public.course_class_assignments (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    course_id uuid NOT NULL,
    institution_id uuid NOT NULL,
    class_id uuid NOT NULL,
    assigned_by uuid,
    assigned_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT course_class_assignments_pkey PRIMARY KEY (id),
    CONSTRAINT course_class_assignments_course_id_class_id_key UNIQUE (course_id, class_id)
);

-- 35. crm_contracts (16 columns)
CREATE TABLE public.crm_contracts (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    institution_id uuid NOT NULL,
    institution_name text NOT NULL,
    contract_type text NOT NULL,
    contract_value numeric NOT NULL DEFAULT 0,
    start_date date NOT NULL,
    end_date date NOT NULL,
    renewal_date date NOT NULL,
    payment_terms text NOT NULL DEFAULT 'annual'::text,
    status text NOT NULL DEFAULT 'draft'::text,
    renewal_status text NOT NULL DEFAULT 'pending'::text,
    auto_renew boolean DEFAULT false,
    notes text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT crm_contracts_pkey PRIMARY KEY (id),
    CONSTRAINT crm_contracts_contract_type_check CHECK ((contract_type = ANY (ARRAY['subscription'::text, 'license'::text, 'service'::text, 'partnership'::text]))),
    CONSTRAINT crm_contracts_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'active'::text, 'expired'::text, 'cancelled'::text]))),
    CONSTRAINT crm_contracts_renewal_status_check CHECK ((renewal_status = ANY (ARRAY['pending'::text, 'renewed'::text, 'not_renewing'::text, 'in_discussion'::text])))
);

-- 36. crm_contract_documents (8 columns)
CREATE TABLE public.crm_contract_documents (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    contract_id uuid NOT NULL,
    file_name text NOT NULL,
    storage_path text NOT NULL,
    public_url text NOT NULL,
    file_size integer,
    uploaded_by uuid,
    uploaded_at timestamp with time zone DEFAULT now(),
    CONSTRAINT crm_contract_documents_pkey PRIMARY KEY (id)
);

-- 37. crm_tasks (16 columns)
CREATE TABLE public.crm_tasks (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    institution_id uuid NOT NULL,
    institution_name text NOT NULL,
    task_type text NOT NULL,
    description text NOT NULL,
    due_date date NOT NULL,
    priority text NOT NULL DEFAULT 'medium'::text,
    status text NOT NULL DEFAULT 'pending'::text,
    assigned_to text NOT NULL,
    assigned_to_id uuid,
    related_contract_id uuid,
    notes text,
    completed_at timestamp with time zone,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT crm_tasks_pkey PRIMARY KEY (id),
    CONSTRAINT crm_tasks_task_type_check CHECK ((task_type = ANY (ARRAY['follow_up'::text, 'renewal'::text, 'support'::text, 'onboarding'::text, 'review'::text, 'other'::text]))),
    CONSTRAINT crm_tasks_priority_check CHECK ((priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'urgent'::text]))),
    CONSTRAINT crm_tasks_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'in_progress'::text, 'completed'::text, 'cancelled'::text])))
);

-- 38. daily_work_logs (11 columns)
CREATE TABLE public.daily_work_logs (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    user_type text DEFAULT 'officer'::text,
    officer_id uuid,
    date date NOT NULL,
    hours_logged numeric(4,2) DEFAULT 0,
    tasks_completed text,
    productivity_score integer,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT daily_work_logs_pkey PRIMARY KEY (id),
    CONSTRAINT daily_work_logs_user_id_date_key UNIQUE (user_id, date)
);

-- 39. events (20 columns)
CREATE TABLE public.events (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text,
    event_type text NOT NULL,
    event_start timestamp with time zone NOT NULL,
    event_end timestamp with time zone,
    venue text,
    max_participants integer,
    current_participants integer DEFAULT 0,
    registration_start timestamp with time zone,
    registration_end timestamp with time zone,
    eligibility_criteria text,
    rules text,
    prizes jsonb,
    brochure_url text,
    attachments jsonb,
    status text NOT NULL DEFAULT 'draft'::text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT events_pkey PRIMARY KEY (id),
    CONSTRAINT events_event_type_check CHECK ((event_type = ANY (ARRAY['competition'::text, 'workshop'::text, 'seminar'::text, 'hackathon'::text, 'conference'::text, 'webinar'::text, 'training'::text, 'other'::text]))),
    CONSTRAINT events_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'published'::text, 'cancelled'::text, 'completed'::text])))
);

-- 40. event_class_assignments (6 columns)
CREATE TABLE public.event_class_assignments (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    event_id uuid NOT NULL,
    institution_id uuid NOT NULL,
    class_id uuid NOT NULL,
    assigned_by uuid,
    assigned_at timestamp with time zone DEFAULT now(),
    CONSTRAINT event_class_assignments_pkey PRIMARY KEY (id),
    CONSTRAINT event_class_assignments_event_id_class_id_key UNIQUE (event_id, class_id)
);

-- 41. event_interests (11 columns)
CREATE TABLE public.event_interests (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    event_id uuid NOT NULL,
    student_id uuid NOT NULL,
    institution_id uuid NOT NULL,
    institution_name text,
    class_id uuid,
    class_name text,
    section text,
    student_name text,
    email text,
    registered_at timestamp with time zone DEFAULT now(),
    CONSTRAINT event_interests_pkey PRIMARY KEY (id),
    CONSTRAINT event_interests_event_id_student_id_key UNIQUE (event_id, student_id)
);

-- 42. event_updates (7 columns)
CREATE TABLE public.event_updates (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    event_id uuid NOT NULL,
    title text NOT NULL,
    content text,
    link_url text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT event_updates_pkey PRIMARY KEY (id)
);

-- 43. gamification_badges (10 columns)
CREATE TABLE public.gamification_badges (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    icon text NOT NULL DEFAULT 'trophy'::text,
    category text NOT NULL DEFAULT 'achievement'::text,
    xp_reward integer NOT NULL DEFAULT 0,
    unlock_criteria jsonb NOT NULL DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT gamification_badges_pkey PRIMARY KEY (id),
    CONSTRAINT gamification_badges_category_check CHECK ((category = ANY (ARRAY['achievement'::text, 'streak'::text, 'course'::text, 'competition'::text, 'special'::text])))
);

-- 44. hr_ratings (11 columns)
CREATE TABLE public.hr_ratings (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    trainer_id uuid NOT NULL,
    trainer_name text NOT NULL,
    employee_id text NOT NULL,
    period text NOT NULL,
    year integer NOT NULL,
    total_stars_quarter integer DEFAULT 0,
    cumulative_stars_year integer DEFAULT 0,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT hr_ratings_pkey PRIMARY KEY (id),
    CONSTRAINT hr_ratings_trainer_id_period_year_key UNIQUE (trainer_id, period, year),
    CONSTRAINT hr_ratings_period_check CHECK ((period = ANY (ARRAY['Q1'::text, 'Q2'::text, 'Q3'::text, 'Q4'::text])))
);

-- 45. hr_rating_projects (10 columns)
CREATE TABLE public.hr_rating_projects (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    hr_rating_id uuid NOT NULL,
    project_title text NOT NULL,
    competition_level text,
    result text,
    stars_earned integer DEFAULT 0,
    verified_by_hr boolean DEFAULT false,
    verified_by uuid,
    verified_date date,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT hr_rating_projects_pkey PRIMARY KEY (id),
    CONSTRAINT hr_rating_projects_competition_level_check CHECK ((competition_level = ANY (ARRAY['school'::text, 'district'::text, 'state'::text, 'national'::text, 'international'::text])))
);

-- 46. id_counters (9 columns)
CREATE TABLE public.id_counters (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    institution_id uuid NOT NULL,
    entity_type text NOT NULL,
    prefix text,
    year_format text,
    counter_padding integer DEFAULT 4,
    current_counter integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT id_counters_pkey PRIMARY KEY (id),
    CONSTRAINT id_counters_institution_id_entity_type_key UNIQUE (institution_id, entity_type)
);

-- 47. institution_holidays (12 columns)
CREATE TABLE public.institution_holidays (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    institution_id uuid NOT NULL,
    name text NOT NULL,
    date date NOT NULL,
    end_date date,
    year integer NOT NULL,
    holiday_type text NOT NULL DEFAULT 'public'::text,
    description text,
    is_paid boolean DEFAULT true,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT institution_holidays_pkey PRIMARY KEY (id),
    CONSTRAINT institution_holidays_institution_id_date_key UNIQUE (institution_id, date),
    CONSTRAINT institution_holidays_holiday_type_check CHECK ((holiday_type = ANY (ARRAY['public'::text, 'institution'::text, 'optional'::text])))
);

-- 48. institution_periods (9 columns)
CREATE TABLE public.institution_periods (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    institution_id uuid NOT NULL,
    label text NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    is_break boolean NOT NULL DEFAULT false,
    display_order integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT institution_periods_pkey PRIMARY KEY (id)
);

-- 49. institution_timetable_assignments (17 columns)
CREATE TABLE public.institution_timetable_assignments (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    institution_id uuid NOT NULL,
    class_id uuid NOT NULL,
    class_name text NOT NULL,
    period_id uuid NOT NULL,
    day text NOT NULL,
    subject text NOT NULL,
    teacher_id uuid,
    teacher_name text,
    secondary_officer_id uuid,
    secondary_officer_name text,
    backup_officer_id uuid,
    backup_officer_name text,
    room text,
    academic_year text NOT NULL DEFAULT '2024-25'::text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT institution_timetable_assignments_pkey PRIMARY KEY (id),
    CONSTRAINT institution_timetable_assignments_day_check CHECK ((day = ANY (ARRAY['monday'::text, 'tuesday'::text, 'wednesday'::text, 'thursday'::text, 'friday'::text, 'saturday'::text])))
);

-- 50. interview_feedback (14 columns)
CREATE TABLE public.interview_feedback (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    interview_id uuid NOT NULL,
    interviewer_id uuid,
    interviewer_name text,
    overall_rating integer NOT NULL,
    technical_skills integer,
    communication_skills integer,
    problem_solving integer,
    cultural_fit integer,
    strengths text,
    weaknesses text,
    recommendation text,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT interview_feedback_pkey PRIMARY KEY (id),
    CONSTRAINT interview_feedback_overall_rating_check CHECK (((overall_rating >= 1) AND (overall_rating <= 5))),
    CONSTRAINT interview_feedback_technical_skills_check CHECK (((technical_skills >= 1) AND (technical_skills <= 5))),
    CONSTRAINT interview_feedback_communication_skills_check CHECK (((communication_skills >= 1) AND (communication_skills <= 5))),
    CONSTRAINT interview_feedback_problem_solving_check CHECK (((problem_solving >= 1) AND (problem_solving <= 5))),
    CONSTRAINT interview_feedback_cultural_fit_check CHECK (((cultural_fit >= 1) AND (cultural_fit <= 5))),
    CONSTRAINT interview_feedback_recommendation_check CHECK ((recommendation = ANY (ARRAY['strong_hire'::text, 'hire'::text, 'no_hire'::text, 'strong_no_hire'::text])))
);

-- 51. interview_stages (7 columns)
CREATE TABLE public.interview_stages (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    stage_order integer NOT NULL DEFAULT 1,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT interview_stages_pkey PRIMARY KEY (id),
    CONSTRAINT interview_stages_name_key UNIQUE (name)
);

-- 52. inventory_items (13 columns)
CREATE TABLE public.inventory_items (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    sl_no integer NOT NULL DEFAULT nextval('inventory_items_sl_no_seq'::regclass),
    item_name text NOT NULL,
    category text NOT NULL,
    sub_category text,
    unit text NOT NULL DEFAULT 'piece'::text,
    quantity_in_stock integer NOT NULL DEFAULT 0,
    reorder_level integer DEFAULT 10,
    unit_price numeric(10,2) DEFAULT 0,
    location text,
    status text DEFAULT 'active'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT inventory_items_pkey PRIMARY KEY (id),
    CONSTRAINT inventory_items_sl_no_key UNIQUE (sl_no),
    CONSTRAINT inventory_items_status_check CHECK ((status = ANY (ARRAY['active'::text, 'discontinued'::text, 'out_of_stock'::text])))
);

-- Set sequence ownership
ALTER SEQUENCE public.inventory_items_sl_no_seq OWNED BY public.inventory_items.sl_no;

-- 53. inventory_issues (19 columns)
CREATE TABLE public.inventory_issues (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    issue_code text NOT NULL,
    institution_id uuid,
    inventory_item_id uuid NOT NULL,
    item_name text NOT NULL,
    quantity_issued integer NOT NULL,
    issued_to text NOT NULL,
    issued_to_type text NOT NULL DEFAULT 'institution'::text,
    issued_to_officer_id uuid,
    issued_by_id uuid,
    issued_by_name text NOT NULL,
    issue_date date NOT NULL DEFAULT CURRENT_DATE,
    purpose text,
    status text NOT NULL DEFAULT 'issued'::text,
    return_date date,
    returned_quantity integer DEFAULT 0,
    condition_on_return text,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT inventory_issues_pkey PRIMARY KEY (id),
    CONSTRAINT inventory_issues_issue_code_key UNIQUE (issue_code),
    CONSTRAINT inventory_issues_issued_to_type_check CHECK ((issued_to_type = ANY (ARRAY['institution'::text, 'officer'::text, 'department'::text]))),
    CONSTRAINT inventory_issues_status_check CHECK ((status = ANY (ARRAY['issued'::text, 'returned'::text, 'partial_return'::text, 'damaged'::text, 'lost'::text])))
);

-- 54. invoice_number_sequences (7 columns)
CREATE TABLE public.invoice_number_sequences (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    invoice_type text NOT NULL,
    prefix text NOT NULL,
    financial_year text NOT NULL,
    last_number integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT invoice_number_sequences_pkey PRIMARY KEY (id),
    CONSTRAINT invoice_number_sequences_invoice_type_financial_year_key UNIQUE (invoice_type, financial_year)
);

-- 55. invoices (67 columns)
CREATE TABLE public.invoices (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    invoice_number text NOT NULL,
    invoice_type text NOT NULL DEFAULT 'institution'::text,
    company_profile_id uuid,
    institution_id uuid,
    bill_to_name text NOT NULL,
    bill_to_address text,
    bill_to_city text,
    bill_to_state text,
    bill_to_state_code text,
    bill_to_pincode text,
    bill_to_gstin text,
    bill_to_pan text,
    bill_to_email text,
    bill_to_phone text,
    ship_to_name text,
    ship_to_address text,
    ship_to_city text,
    ship_to_state text,
    ship_to_state_code text,
    ship_to_pincode text,
    invoice_date date NOT NULL DEFAULT CURRENT_DATE,
    due_date date,
    po_number text,
    po_date date,
    payment_terms text,
    delivery_note text,
    dispatch_doc_no text,
    dispatch_through text,
    destination text,
    terms_of_delivery text,
    vehicle_number text,
    e_way_bill_number text,
    subtotal numeric(12,2) NOT NULL DEFAULT 0,
    discount_type text,
    discount_value numeric(10,2) DEFAULT 0,
    discount_amount numeric(10,2) DEFAULT 0,
    taxable_amount numeric(12,2) NOT NULL DEFAULT 0,
    cgst_rate numeric(5,2) DEFAULT 0,
    cgst_amount numeric(10,2) DEFAULT 0,
    sgst_rate numeric(5,2) DEFAULT 0,
    sgst_amount numeric(10,2) DEFAULT 0,
    igst_rate numeric(5,2) DEFAULT 0,
    igst_amount numeric(10,2) DEFAULT 0,
    cess_amount numeric(10,2) DEFAULT 0,
    round_off numeric(8,2) DEFAULT 0,
    total_amount numeric(12,2) NOT NULL DEFAULT 0,
    amount_in_words text,
    notes text,
    terms_and_conditions text,
    bank_name text,
    bank_account_number text,
    bank_ifsc text,
    bank_branch text,
    status text NOT NULL DEFAULT 'draft'::text,
    payment_status text NOT NULL DEFAULT 'unpaid'::text,
    payment_method text,
    payment_date date,
    payment_reference text,
    amount_paid numeric(12,2) DEFAULT 0,
    balance_due numeric(12,2) DEFAULT 0,
    cancelled_at timestamp with time zone,
    cancelled_by uuid,
    cancellation_reason text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT invoices_pkey PRIMARY KEY (id),
    CONSTRAINT invoices_invoice_number_key UNIQUE (invoice_number),
    CONSTRAINT invoices_invoice_type_check CHECK ((invoice_type = ANY (ARRAY['institution'::text, 'sales'::text, 'purchase'::text]))),
    CONSTRAINT invoices_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'pending'::text, 'approved'::text, 'sent'::text, 'paid'::text, 'partial'::text, 'overdue'::text, 'cancelled'::text]))),
    CONSTRAINT invoices_payment_status_check CHECK ((payment_status = ANY (ARRAY['unpaid'::text, 'partial'::text, 'paid'::text, 'refunded'::text])))
);

-- 56. invoice_line_items (18 columns)
CREATE TABLE public.invoice_line_items (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    invoice_id uuid NOT NULL,
    sl_no integer NOT NULL,
    description text NOT NULL,
    hsn_code text,
    quantity numeric(10,3) NOT NULL DEFAULT 1,
    unit text DEFAULT 'Nos'::text,
    rate numeric(12,2) NOT NULL DEFAULT 0,
    amount numeric(12,2) NOT NULL DEFAULT 0,
    discount_percent numeric(5,2) DEFAULT 0,
    discount_amount numeric(10,2) DEFAULT 0,
    taxable_value numeric(12,2) NOT NULL DEFAULT 0,
    cgst_rate numeric(5,2) DEFAULT 0,
    cgst_amount numeric(10,2) DEFAULT 0,
    sgst_rate numeric(5,2) DEFAULT 0,
    sgst_amount numeric(10,2) DEFAULT 0,
    igst_rate numeric(5,2) DEFAULT 0,
    igst_amount numeric(10,2) DEFAULT 0,
    CONSTRAINT invoice_line_items_pkey PRIMARY KEY (id)
);

-- 57. job_postings (19 columns)
CREATE TABLE public.job_postings (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    title text NOT NULL,
    department text,
    location text,
    employment_type text NOT NULL DEFAULT 'full_time'::text,
    experience_min integer DEFAULT 0,
    experience_max integer,
    salary_min numeric,
    salary_max numeric,
    description text,
    requirements text,
    responsibilities text,
    benefits text,
    status text DEFAULT 'draft'::text,
    published_at timestamp with time zone,
    closing_date date,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT job_postings_pkey PRIMARY KEY (id),
    CONSTRAINT job_postings_employment_type_check CHECK ((employment_type = ANY (ARRAY['full_time'::text, 'part_time'::text, 'contract'::text, 'internship'::text]))),
    CONSTRAINT job_postings_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'published'::text, 'closed'::text, 'on_hold'::text])))
);

-- 58. job_applications (18 columns)
CREATE TABLE public.job_applications (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    job_id uuid NOT NULL,
    candidate_name text NOT NULL,
    candidate_email text NOT NULL,
    candidate_phone text,
    resume_url text,
    cover_letter text,
    current_company text,
    current_designation text,
    experience_years numeric(4,1),
    current_salary numeric,
    expected_salary numeric,
    notice_period_days integer,
    source text DEFAULT 'direct'::text,
    status text DEFAULT 'new'::text,
    current_stage_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT job_applications_pkey PRIMARY KEY (id),
    CONSTRAINT job_applications_status_check CHECK ((status = ANY (ARRAY['new'::text, 'screening'::text, 'interviewing'::text, 'offer'::text, 'hired'::text, 'rejected'::text, 'withdrawn'::text])))
);

-- 59. leaderboard_configs (9 columns)
CREATE TABLE public.leaderboard_configs (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    scope text NOT NULL DEFAULT 'global'::text,
    time_period text NOT NULL DEFAULT 'all_time'::text,
    ranking_metric text NOT NULL DEFAULT 'xp'::text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT leaderboard_configs_pkey PRIMARY KEY (id),
    CONSTRAINT leaderboard_configs_scope_check CHECK ((scope = ANY (ARRAY['global'::text, 'institution'::text, 'class'::text]))),
    CONSTRAINT leaderboard_configs_time_period_check CHECK ((time_period = ANY (ARRAY['weekly'::text, 'monthly'::text, 'quarterly'::text, 'yearly'::text, 'all_time'::text]))),
    CONSTRAINT leaderboard_configs_ranking_metric_check CHECK ((ranking_metric = ANY (ARRAY['xp'::text, 'badges'::text, 'streak'::text, 'courses_completed'::text])))
);

-- 60. leave_applications (30 columns)
CREATE TABLE public.leave_applications (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    applicant_id uuid NOT NULL,
    user_type text NOT NULL DEFAULT 'officer'::text,
    officer_id uuid,
    leave_type text NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    total_days integer NOT NULL,
    reason text NOT NULL,
    emergency_contact text,
    work_handover_to uuid,
    work_handover_to_name text,
    attachment_url text,
    status text NOT NULL DEFAULT 'pending'::text,
    current_approver_id uuid,
    current_approver_name text,
    current_approval_level integer DEFAULT 1,
    approved_by_ids uuid[],
    approved_by_names text[],
    rejection_reason text,
    paid_days integer DEFAULT 0,
    lop_days integer DEFAULT 0,
    final_approved_at timestamp with time zone,
    cancelled_at timestamp with time zone,
    cancellation_reason text,
    applied_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    reporting_officer_id uuid,
    reporting_officer_name text,
    CONSTRAINT leave_applications_pkey PRIMARY KEY (id),
    CONSTRAINT leave_applications_leave_type_check CHECK ((leave_type = ANY (ARRAY['casual'::text, 'sick'::text, 'privilege'::text, 'maternity'::text, 'paternity'::text, 'comp_off'::text, 'lop'::text]))),
    CONSTRAINT leave_applications_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'cancelled'::text, 'partially_approved'::text])))
);

-- 61. leave_approval_hierarchy (9 columns)
CREATE TABLE public.leave_approval_hierarchy (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    user_type text NOT NULL DEFAULT 'officer'::text,
    approval_level integer NOT NULL,
    approver_id uuid NOT NULL,
    approver_name text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT leave_approval_hierarchy_pkey PRIMARY KEY (id),
    CONSTRAINT leave_approval_hierarchy_user_id_approval_level_key UNIQUE (user_id, approval_level)
);

-- 62. leave_balance_adjustments (12 columns)
CREATE TABLE public.leave_balance_adjustments (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    balance_id uuid NOT NULL,
    user_id uuid NOT NULL,
    adjustment_type text NOT NULL,
    leave_type text,
    days_adjusted integer NOT NULL,
    reason text NOT NULL,
    reference_id uuid,
    adjusted_by uuid,
    adjusted_by_name text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT leave_balance_adjustments_pkey PRIMARY KEY (id),
    CONSTRAINT leave_balance_adjustments_adjustment_type_check CHECK ((adjustment_type = ANY (ARRAY['credit'::text, 'debit'::text, 'carry_forward'::text, 'encashment'::text, 'lop_deduction'::text])))
);

-- 63. leave_balances (18 columns)
CREATE TABLE public.leave_balances (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    user_type text NOT NULL DEFAULT 'officer'::text,
    officer_id uuid,
    year integer NOT NULL,
    month integer NOT NULL,
    monthly_credit integer NOT NULL DEFAULT 1,
    carried_forward integer NOT NULL DEFAULT 0,
    sick_leave_used integer NOT NULL DEFAULT 0,
    casual_leave_used integer NOT NULL DEFAULT 0,
    privilege_leave_used integer DEFAULT 0,
    comp_off_earned integer DEFAULT 0,
    comp_off_used integer DEFAULT 0,
    lop_days integer NOT NULL DEFAULT 0,
    balance_remaining integer NOT NULL DEFAULT 1,
    encashed_days integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT leave_balances_pkey PRIMARY KEY (id),
    CONSTRAINT leave_balances_user_id_year_month_key UNIQUE (user_id, year, month)
);

-- 64. leave_settings (6 columns)
CREATE TABLE public.leave_settings (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    setting_key text NOT NULL,
    setting_value jsonb NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT leave_settings_pkey PRIMARY KEY (id),
    CONSTRAINT leave_settings_setting_key_key UNIQUE (setting_key)
);

-- 65. newsletters (15 columns)
CREATE TABLE public.newsletters (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text,
    file_url text NOT NULL,
    thumbnail_url text,
    file_name text NOT NULL,
    file_size integer,
    month integer NOT NULL,
    year integer NOT NULL,
    is_published boolean DEFAULT true,
    published_at timestamp with time zone DEFAULT now(),
    download_count integer DEFAULT 0,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT newsletters_pkey PRIMARY KEY (id),
    CONSTRAINT newsletters_month_year_key UNIQUE (month, year)
);

-- 66. notifications (14 columns)
CREATE TABLE public.notifications (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    data jsonb,
    related_entity_type text,
    related_entity_id uuid,
    is_read boolean DEFAULT false,
    read_at timestamp with time zone,
    action_url text,
    priority text DEFAULT 'normal'::text,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT notifications_pkey PRIMARY KEY (id),
    CONSTRAINT notifications_priority_check CHECK ((priority = ANY (ARRAY['low'::text, 'normal'::text, 'high'::text, 'urgent'::text])))
);

-- 67. officer_attendance (33 columns)
CREATE TABLE public.officer_attendance (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    officer_id uuid NOT NULL,
    employee_id text NOT NULL,
    officer_name text NOT NULL,
    date date NOT NULL,
    check_in_time timestamp with time zone,
    check_out_time timestamp with time zone,
    check_in_latitude numeric(10,7),
    check_in_longitude numeric(10,7),
    check_in_location text,
    check_in_photo_url text,
    check_out_latitude numeric(10,7),
    check_out_longitude numeric(10,7),
    check_out_location text,
    check_out_photo_url text,
    work_type text NOT NULL DEFAULT 'office'::text,
    institution_id uuid,
    institution_name text,
    scheduled_start_time time without time zone,
    scheduled_end_time time without time zone,
    actual_hours_worked numeric(4,2) DEFAULT 0,
    break_duration_minutes integer DEFAULT 0,
    overtime_hours numeric(4,2) DEFAULT 0,
    attendance_status text NOT NULL DEFAULT 'pending'::text,
    is_late boolean DEFAULT false,
    late_reason text,
    is_early_departure boolean DEFAULT false,
    early_departure_reason text,
    approved_by uuid,
    approved_at timestamp with time zone,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT officer_attendance_pkey PRIMARY KEY (id),
    CONSTRAINT officer_attendance_officer_id_date_key UNIQUE (officer_id, date),
    CONSTRAINT officer_attendance_work_type_check CHECK ((work_type = ANY (ARRAY['office'::text, 'field'::text, 'remote'::text, 'hybrid'::text]))),
    CONSTRAINT officer_attendance_attendance_status_check CHECK ((attendance_status = ANY (ARRAY['pending'::text, 'present'::text, 'absent'::text, 'half_day'::text, 'on_leave'::text, 'holiday'::text, 'weekend'::text])))
);

-- 68. officer_class_access_grants (13 columns)
CREATE TABLE public.officer_class_access_grants (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    officer_id uuid NOT NULL,
    institution_id uuid NOT NULL,
    class_id uuid NOT NULL,
    granted_by uuid,
    granted_by_name text,
    grant_type text NOT NULL DEFAULT 'view'::text,
    reason text,
    valid_from date DEFAULT CURRENT_DATE,
    valid_until date,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT officer_class_access_grants_pkey PRIMARY KEY (id),
    CONSTRAINT officer_class_access_grants_officer_id_class_id_grant_type_key UNIQUE (officer_id, class_id, grant_type),
    CONSTRAINT officer_class_access_grants_grant_type_check CHECK ((grant_type = ANY (ARRAY['view'::text, 'edit'::text, 'teach'::text, 'admin'::text])))
);

-- 69. officer_documents (10 columns)
CREATE TABLE public.officer_documents (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    officer_id uuid NOT NULL,
    document_type text NOT NULL,
    document_name text NOT NULL,
    file_path text NOT NULL,
    file_size integer,
    mime_type text,
    uploaded_by uuid,
    uploaded_at timestamp with time zone DEFAULT now(),
    expires_at date,
    CONSTRAINT officer_documents_pkey PRIMARY KEY (id),
    CONSTRAINT officer_documents_document_type_check CHECK ((document_type = ANY (ARRAY['resume'::text, 'id_proof'::text, 'address_proof'::text, 'education'::text, 'experience'::text, 'offer_letter'::text, 'appointment_letter'::text, 'nda'::text, 'contract'::text, 'other'::text])))
);

-- 70. officer_institution_assignments (9 columns)
CREATE TABLE public.officer_institution_assignments (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    officer_id uuid NOT NULL,
    institution_id uuid NOT NULL,
    role_at_institution text DEFAULT 'trainer'::text,
    is_primary boolean DEFAULT false,
    assigned_by uuid,
    assigned_at timestamp with time zone DEFAULT now(),
    valid_from date DEFAULT CURRENT_DATE,
    valid_until date,
    CONSTRAINT officer_institution_assignments_pkey PRIMARY KEY (id),
    CONSTRAINT officer_institution_assignments_officer_id_institution_id_key UNIQUE (officer_id, institution_id)
);

-- 71. overtime_requests (19 columns)
CREATE TABLE public.overtime_requests (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    user_type text NOT NULL DEFAULT 'officer'::text,
    officer_id uuid,
    date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    hours_requested numeric(4,2) NOT NULL,
    reason text NOT NULL,
    project_or_task text,
    status text NOT NULL DEFAULT 'pending'::text,
    approved_by uuid,
    approved_by_name text,
    approved_at timestamp with time zone,
    rejection_reason text,
    hours_approved numeric(4,2),
    compensatory_off_date date,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT overtime_requests_pkey PRIMARY KEY (id),
    CONSTRAINT overtime_requests_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'cancelled'::text])))
);

-- 72. password_reset_tokens (7 columns)
CREATE TABLE public.password_reset_tokens (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    token text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    ip_address text,
    CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id),
    CONSTRAINT password_reset_tokens_token_key UNIQUE (token)
);

-- 73. payroll_records (51 columns)
CREATE TABLE public.payroll_records (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    user_type text NOT NULL DEFAULT 'officer'::text,
    officer_id uuid,
    employee_id text NOT NULL,
    employee_name text NOT NULL,
    department text,
    designation text,
    month integer NOT NULL,
    year integer NOT NULL,
    working_days integer NOT NULL DEFAULT 0,
    days_present integer NOT NULL DEFAULT 0,
    days_absent integer NOT NULL DEFAULT 0,
    half_days integer DEFAULT 0,
    leaves_taken integer DEFAULT 0,
    lop_days integer NOT NULL DEFAULT 0,
    basic_salary numeric(12,2) NOT NULL DEFAULT 0,
    hra numeric(10,2) DEFAULT 0,
    conveyance_allowance numeric(10,2) DEFAULT 0,
    medical_allowance numeric(10,2) DEFAULT 0,
    special_allowance numeric(10,2) DEFAULT 0,
    other_allowances numeric(10,2) DEFAULT 0,
    overtime_hours numeric(6,2) DEFAULT 0,
    overtime_rate numeric(8,2) DEFAULT 0,
    overtime_amount numeric(10,2) DEFAULT 0,
    bonus numeric(10,2) DEFAULT 0,
    incentives numeric(10,2) DEFAULT 0,
    gross_salary numeric(12,2) NOT NULL DEFAULT 0,
    pf_employee numeric(10,2) DEFAULT 0,
    pf_employer numeric(10,2) DEFAULT 0,
    esi_employee numeric(10,2) DEFAULT 0,
    esi_employer numeric(10,2) DEFAULT 0,
    professional_tax numeric(8,2) DEFAULT 0,
    income_tax numeric(10,2) DEFAULT 0,
    other_deductions numeric(10,2) DEFAULT 0,
    loan_recovery numeric(10,2) DEFAULT 0,
    advance_recovery numeric(10,2) DEFAULT 0,
    total_deductions numeric(12,2) NOT NULL DEFAULT 0,
    net_salary numeric(12,2) NOT NULL DEFAULT 0,
    payment_mode text DEFAULT 'bank_transfer'::text,
    bank_name text,
    account_number text,
    ifsc_code text,
    payment_date date,
    payment_reference text,
    status text NOT NULL DEFAULT 'draft'::text,
    remarks text,
    processed_by uuid,
    processed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT payroll_records_pkey PRIMARY KEY (id),
    CONSTRAINT payroll_records_user_id_month_year_key UNIQUE (user_id, month, year),
    CONSTRAINT payroll_records_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'pending'::text, 'processed'::text, 'paid'::text, 'cancelled'::text])))
);

-- 74. performance_appraisals (27 columns)
CREATE TABLE public.performance_appraisals (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    officer_id uuid NOT NULL,
    officer_name text NOT NULL,
    employee_id text NOT NULL,
    department text,
    designation text,
    reporting_manager_id uuid,
    reporting_manager_name text,
    review_period text NOT NULL,
    review_start_date date NOT NULL,
    review_end_date date NOT NULL,
    self_rating integer,
    manager_rating integer,
    final_rating integer,
    goals_achieved text,
    strengths text,
    areas_of_improvement text,
    training_recommendations text,
    promotion_recommendation boolean DEFAULT false,
    salary_increment_percentage numeric(5,2),
    comments text,
    status text NOT NULL DEFAULT 'draft'::text,
    submitted_at timestamp with time zone,
    reviewed_at timestamp with time zone,
    reviewed_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT performance_appraisals_pkey PRIMARY KEY (id),
    CONSTRAINT performance_appraisals_self_rating_check CHECK (((self_rating >= 1) AND (self_rating <= 5))),
    CONSTRAINT performance_appraisals_manager_rating_check CHECK (((manager_rating >= 1) AND (manager_rating <= 5))),
    CONSTRAINT performance_appraisals_final_rating_check CHECK (((final_rating >= 1) AND (final_rating <= 5))),
    CONSTRAINT performance_appraisals_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'self_review'::text, 'manager_review'::text, 'hr_review'::text, 'completed'::text])))
);

-- 75. projects (23 columns)
CREATE TABLE public.projects (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    institution_id uuid,
    class_id uuid,
    title text NOT NULL,
    description text,
    category text NOT NULL DEFAULT 'technology'::text,
    domain text,
    sdg_goals jsonb,
    start_date date,
    end_date date,
    status text NOT NULL DEFAULT 'ongoing'::text,
    progress_percentage integer DEFAULT 0,
    mentor_id uuid,
    mentor_name text,
    guide_id uuid,
    guide_name text,
    documentation_url text,
    presentation_url text,
    video_url text,
    github_url text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT projects_pkey PRIMARY KEY (id),
    CONSTRAINT projects_status_check CHECK ((status = ANY (ARRAY['planned'::text, 'ongoing'::text, 'completed'::text, 'on_hold'::text, 'cancelled'::text]))),
    CONSTRAINT projects_progress_percentage_check CHECK (((progress_percentage >= 0) AND (progress_percentage <= 100)))
);

-- 76. project_members (6 columns)
CREATE TABLE public.project_members (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL,
    student_id uuid NOT NULL,
    role text DEFAULT 'member'::text,
    joined_at timestamp with time zone DEFAULT now(),
    is_leader boolean DEFAULT false,
    CONSTRAINT project_members_pkey PRIMARY KEY (id),
    CONSTRAINT project_members_project_id_student_id_key UNIQUE (project_id, student_id)
);

-- 77. project_progress_updates (8 columns)
CREATE TABLE public.project_progress_updates (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL,
    update_text text NOT NULL,
    progress_percentage integer NOT NULL,
    milestone text,
    created_by uuid,
    created_by_name text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT project_progress_updates_pkey PRIMARY KEY (id),
    CONSTRAINT project_progress_updates_progress_percentage_check CHECK (((progress_percentage >= 0) AND (progress_percentage <= 100)))
);

-- 78. project_achievements (10 columns)
CREATE TABLE public.project_achievements (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL,
    title text NOT NULL,
    achievement_type text NOT NULL DEFAULT 'award'::text,
    competition_name text,
    competition_level text,
    position text,
    award_date date,
    certificate_url text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT project_achievements_pkey PRIMARY KEY (id),
    CONSTRAINT project_achievements_achievement_type_check CHECK ((achievement_type = ANY (ARRAY['award'::text, 'recognition'::text, 'publication'::text, 'patent'::text, 'other'::text]))),
    CONSTRAINT project_achievements_competition_level_check CHECK ((competition_level = ANY (ARRAY['school'::text, 'district'::text, 'state'::text, 'national'::text, 'international'::text])))
);

-- 79. purchase_requests (21 columns)
CREATE TABLE public.purchase_requests (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    request_code text NOT NULL,
    requested_by_id uuid NOT NULL,
    requested_by_name text NOT NULL,
    department text,
    request_date date NOT NULL DEFAULT CURRENT_DATE,
    required_by_date date,
    priority text NOT NULL DEFAULT 'medium'::text,
    category text NOT NULL,
    items jsonb NOT NULL,
    estimated_cost numeric(12,2),
    justification text NOT NULL,
    status text NOT NULL DEFAULT 'draft'::text,
    current_approver_id uuid,
    current_approver_name text,
    current_approval_level integer DEFAULT 1,
    approved_at timestamp with time zone,
    rejected_at timestamp with time zone,
    rejection_reason text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT purchase_requests_pkey PRIMARY KEY (id),
    CONSTRAINT purchase_requests_request_code_key UNIQUE (request_code),
    CONSTRAINT purchase_requests_priority_check CHECK ((priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'urgent'::text]))),
    CONSTRAINT purchase_requests_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'pending'::text, 'approved'::text, 'rejected'::text, 'ordered'::text, 'received'::text, 'cancelled'::text])))
);

-- 80. purchase_approval_chain (8 columns)
CREATE TABLE public.purchase_approval_chain (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    request_id uuid NOT NULL,
    approval_level integer NOT NULL,
    approver_id uuid NOT NULL,
    approver_name text NOT NULL,
    status text NOT NULL DEFAULT 'pending'::text,
    acted_at timestamp with time zone,
    comments text,
    CONSTRAINT purchase_approval_chain_pkey PRIMARY KEY (id),
    CONSTRAINT purchase_approval_chain_request_id_approval_level_key UNIQUE (request_id, approval_level),
    CONSTRAINT purchase_approval_chain_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])))
);

-- 81. reports (24 columns)
CREATE TABLE public.reports (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    title text NOT NULL,
    report_type text NOT NULL,
    report_category text NOT NULL DEFAULT 'operational'::text,
    format text NOT NULL DEFAULT 'pdf'::text,
    description text,
    parameters jsonb,
    institution_id uuid,
    class_id uuid,
    start_date date,
    end_date date,
    file_url text,
    file_size integer,
    status text NOT NULL DEFAULT 'pending'::text,
    generated_at timestamp with time zone,
    error_message text,
    row_count integer,
    generated_by uuid,
    generated_by_name text,
    schedule_cron text,
    last_scheduled_run timestamp with time zone,
    next_scheduled_run timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT reports_pkey PRIMARY KEY (id),
    CONSTRAINT reports_format_check CHECK ((format = ANY (ARRAY['pdf'::text, 'excel'::text, 'csv'::text]))),
    CONSTRAINT reports_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'generating'::text, 'completed'::text, 'failed'::text])))
);

-- 82. reserved_invoice_numbers (7 columns)
CREATE TABLE public.reserved_invoice_numbers (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    invoice_number text NOT NULL,
    invoice_type text NOT NULL,
    original_invoice_id uuid,
    reserved_at timestamp with time zone DEFAULT now(),
    deleted_by uuid,
    reason text DEFAULT 'Invoice deleted'::text,
    CONSTRAINT reserved_invoice_numbers_pkey PRIMARY KEY (id),
    CONSTRAINT reserved_invoice_numbers_invoice_number_key UNIQUE (invoice_number)
);

-- 83. staff_attendance (33 columns)
CREATE TABLE public.staff_attendance (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    institution_id uuid NOT NULL,
    officer_id uuid NOT NULL,
    employee_id text NOT NULL,
    officer_name text NOT NULL,
    date date NOT NULL,
    check_in_time timestamp with time zone,
    check_out_time timestamp with time zone,
    check_in_latitude numeric(10,7),
    check_in_longitude numeric(10,7),
    check_in_location text,
    check_in_photo_url text,
    check_out_latitude numeric(10,7),
    check_out_longitude numeric(10,7),
    check_out_location text,
    check_out_photo_url text,
    work_type text NOT NULL DEFAULT 'on_site'::text,
    scheduled_start_time time without time zone,
    scheduled_end_time time without time zone,
    actual_hours_worked numeric(4,2) DEFAULT 0,
    break_duration_minutes integer DEFAULT 0,
    overtime_hours numeric(4,2) DEFAULT 0,
    attendance_status text NOT NULL DEFAULT 'pending'::text,
    is_late boolean DEFAULT false,
    late_reason text,
    is_early_departure boolean DEFAULT false,
    early_departure_reason text,
    approved_by uuid,
    approved_at timestamp with time zone,
    notes text,
    source text DEFAULT 'manual'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT staff_attendance_pkey PRIMARY KEY (id),
    CONSTRAINT staff_attendance_institution_id_officer_id_date_key UNIQUE (institution_id, officer_id, date),
    CONSTRAINT staff_attendance_work_type_check CHECK ((work_type = ANY (ARRAY['on_site'::text, 'remote'::text, 'hybrid'::text]))),
    CONSTRAINT staff_attendance_attendance_status_check CHECK ((attendance_status = ANY (ARRAY['pending'::text, 'present'::text, 'absent'::text, 'half_day'::text, 'on_leave'::text, 'holiday'::text, 'weekend'::text])))
);

-- 84. staff_documents (11 columns)
CREATE TABLE public.staff_documents (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    institution_id uuid NOT NULL,
    officer_id uuid NOT NULL,
    document_type text NOT NULL,
    document_name text NOT NULL,
    file_path text NOT NULL,
    file_size integer,
    mime_type text,
    uploaded_by uuid,
    uploaded_at timestamp with time zone DEFAULT now(),
    expires_at date,
    CONSTRAINT staff_documents_pkey PRIMARY KEY (id),
    CONSTRAINT staff_documents_document_type_check CHECK ((document_type = ANY (ARRAY['id_card'::text, 'contract'::text, 'certificate'::text, 'training'::text, 'evaluation'::text, 'other'::text])))
);

-- 85. student_badges (5 columns)
CREATE TABLE public.student_badges (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    student_id uuid NOT NULL,
    badge_id uuid NOT NULL,
    awarded_at timestamp with time zone DEFAULT now(),
    awarded_for text,
    CONSTRAINT student_badges_pkey PRIMARY KEY (id),
    CONSTRAINT student_badges_student_id_badge_id_key UNIQUE (student_id, badge_id)
);

-- 86. student_certificates (12 columns)
CREATE TABLE public.student_certificates (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    student_id uuid NOT NULL,
    certificate_type text NOT NULL,
    certificate_name text NOT NULL,
    issued_for text NOT NULL,
    reference_id uuid,
    reference_type text,
    certificate_url text,
    certificate_number text,
    issued_at timestamp with time zone DEFAULT now(),
    template_id uuid,
    metadata jsonb,
    CONSTRAINT student_certificates_pkey PRIMARY KEY (id),
    CONSTRAINT student_certificates_certificate_type_check CHECK ((certificate_type = ANY (ARRAY['course_completion'::text, 'module_completion'::text, 'assessment_pass'::text, 'event_participation'::text, 'achievement'::text])))
);

-- 87. student_content_completions (6 columns)
CREATE TABLE public.student_content_completions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    student_id uuid NOT NULL,
    content_id uuid NOT NULL,
    class_assignment_id uuid NOT NULL,
    completed_at timestamp with time zone DEFAULT now(),
    time_spent_minutes integer DEFAULT 0,
    CONSTRAINT student_content_completions_pkey PRIMARY KEY (id),
    CONSTRAINT student_content_completions_student_id_content_id_class_ass_key UNIQUE (student_id, content_id, class_assignment_id)
);

-- 88. student_feedback (20 columns)
CREATE TABLE public.student_feedback (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    student_id uuid NOT NULL,
    student_name text,
    institution_id uuid NOT NULL,
    institution_name text,
    class_id uuid,
    class_name text,
    feedback_type text NOT NULL,
    subject text NOT NULL,
    message text NOT NULL,
    rating integer,
    related_entity_type text,
    related_entity_id uuid,
    related_entity_name text,
    status text DEFAULT 'pending'::text,
    response text,
    responded_by uuid,
    responded_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT student_feedback_pkey PRIMARY KEY (id),
    CONSTRAINT student_feedback_rating_check CHECK (((rating >= 1) AND (rating <= 5))),
    CONSTRAINT student_feedback_feedback_type_check CHECK ((feedback_type = ANY (ARRAY['general'::text, 'course'::text, 'instructor'::text, 'facility'::text, 'suggestion'::text, 'complaint'::text]))),
    CONSTRAINT student_feedback_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'acknowledged'::text, 'in_progress'::text, 'resolved'::text, 'closed'::text])))
);

-- 89. student_streaks (7 columns)
CREATE TABLE public.student_streaks (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    student_id uuid NOT NULL,
    current_streak integer NOT NULL DEFAULT 0,
    longest_streak integer NOT NULL DEFAULT 0,
    last_activity_date date,
    streak_start_date date,
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT student_streaks_pkey PRIMARY KEY (id),
    CONSTRAINT student_streaks_student_id_key UNIQUE (student_id)
);

-- 90. student_xp_transactions (8 columns)
CREATE TABLE public.student_xp_transactions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    student_id uuid NOT NULL,
    institution_id uuid,
    activity_type text NOT NULL,
    activity_id uuid,
    points_earned integer NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT student_xp_transactions_pkey PRIMARY KEY (id),
    CONSTRAINT student_xp_transactions_student_id_activity_type_activity_i_key UNIQUE (student_id, activity_type, activity_id)
);

-- 91. surveys (12 columns)
CREATE TABLE public.surveys (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text,
    survey_type text NOT NULL DEFAULT 'feedback'::text,
    target_audience text NOT NULL DEFAULT 'students'::text,
    status text NOT NULL DEFAULT 'draft'::text,
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    is_anonymous boolean DEFAULT false,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT surveys_pkey PRIMARY KEY (id),
    CONSTRAINT surveys_survey_type_check CHECK ((survey_type = ANY (ARRAY['feedback'::text, 'evaluation'::text, 'poll'::text, 'quiz'::text]))),
    CONSTRAINT surveys_target_audience_check CHECK ((target_audience = ANY (ARRAY['students'::text, 'officers'::text, 'parents'::text, 'all'::text]))),
    CONSTRAINT surveys_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'active'::text, 'closed'::text, 'archived'::text])))
);

-- 92. survey_questions (10 columns)
CREATE TABLE public.survey_questions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    survey_id uuid NOT NULL,
    question_text text NOT NULL,
    question_type text NOT NULL DEFAULT 'text'::text,
    options jsonb,
    is_required boolean DEFAULT true,
    display_order integer NOT NULL DEFAULT 0,
    max_length integer,
    min_value integer,
    max_value integer,
    CONSTRAINT survey_questions_pkey PRIMARY KEY (id),
    CONSTRAINT survey_questions_question_type_check CHECK ((question_type = ANY (ARRAY['text'::text, 'number'::text, 'rating'::text, 'single_choice'::text, 'multiple_choice'::text, 'date'::text, 'scale'::text])))
);

-- 93. survey_responses (9 columns)
CREATE TABLE public.survey_responses (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    survey_id uuid NOT NULL,
    respondent_id uuid,
    respondent_type text,
    institution_id uuid,
    class_id uuid,
    is_complete boolean DEFAULT false,
    submitted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT survey_responses_pkey PRIMARY KEY (id)
);

-- 94. survey_response_answers (7 columns)
CREATE TABLE public.survey_response_answers (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    response_id uuid NOT NULL,
    question_id uuid NOT NULL,
    answer_text text,
    answer_number numeric,
    answer_options jsonb,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT survey_response_answers_pkey PRIMARY KEY (id),
    CONSTRAINT survey_response_answers_response_id_question_id_key UNIQUE (response_id, question_id)
);

-- 95. system_configurations (8 columns)
CREATE TABLE public.system_configurations (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    config_key text NOT NULL,
    config_value jsonb NOT NULL,
    description text,
    category text DEFAULT 'general'::text,
    is_sensitive boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT system_configurations_pkey PRIMARY KEY (id),
    CONSTRAINT system_configurations_config_key_key UNIQUE (config_key)
);

-- 96. system_logs (15 columns)
CREATE TABLE public.system_logs (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    log_level text NOT NULL DEFAULT 'info'::text,
    log_type text NOT NULL,
    message text NOT NULL,
    details jsonb,
    user_id uuid,
    user_email text,
    user_role text,
    ip_address text,
    user_agent text,
    request_path text,
    request_method text,
    response_status integer,
    execution_time_ms integer,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT system_logs_pkey PRIMARY KEY (id),
    CONSTRAINT system_logs_log_level_check CHECK ((log_level = ANY (ARRAY['debug'::text, 'info'::text, 'warn'::text, 'error'::text, 'fatal'::text])))
);

-- 97. task_attachments (10 columns)
CREATE TABLE public.task_attachments (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    task_id uuid NOT NULL,
    file_name text NOT NULL,
    file_type text NOT NULL,
    file_size integer NOT NULL,
    storage_path text NOT NULL,
    public_url text NOT NULL,
    uploaded_by uuid,
    uploaded_by_name text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT task_attachments_pkey PRIMARY KEY (id)
);

-- 98. tasks (20 columns)
CREATE TABLE public.tasks (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text,
    task_type text NOT NULL DEFAULT 'general'::text,
    priority text NOT NULL DEFAULT 'medium'::text,
    status text NOT NULL DEFAULT 'pending'::text,
    assigned_to uuid,
    assigned_to_name text,
    assigned_by uuid,
    assigned_by_name text,
    due_date date,
    due_time time without time zone,
    completed_at timestamp with time zone,
    institution_id uuid,
    institution_name text,
    related_entity_type text,
    related_entity_id uuid,
    tags text[],
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT tasks_pkey PRIMARY KEY (id),
    CONSTRAINT tasks_task_type_check CHECK ((task_type = ANY (ARRAY['general'::text, 'follow_up'::text, 'visit'::text, 'call'::text, 'email'::text, 'meeting'::text, 'training'::text, 'support'::text, 'review'::text, 'documentation'::text]))),
    CONSTRAINT tasks_priority_check CHECK ((priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'urgent'::text]))),
    CONSTRAINT tasks_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'in_progress'::text, 'completed'::text, 'cancelled'::text, 'on_hold'::text])))
);

-- 99. task_activity_log (9 columns)
CREATE TABLE public.task_activity_log (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    task_id uuid NOT NULL,
    activity_type text NOT NULL,
    description text NOT NULL,
    old_value text,
    new_value text,
    performed_by uuid,
    performed_by_name text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT task_activity_log_pkey PRIMARY KEY (id)
);

-- 100. user_roles (5 columns)
CREATE TABLE public.user_roles (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    assigned_at timestamp with time zone DEFAULT now(),
    assigned_by uuid,
    CONSTRAINT user_roles_pkey PRIMARY KEY (id),
    CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role)
);

-- 101. user_sessions (8 columns)
CREATE TABLE public.user_sessions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    session_token text NOT NULL,
    ip_address text,
    user_agent text,
    last_activity timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT user_sessions_pkey PRIMARY KEY (id),
    CONSTRAINT user_sessions_session_token_key UNIQUE (session_token)
);

-- 102. xp_rules (8 columns)
CREATE TABLE public.xp_rules (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    activity text NOT NULL,
    points integer NOT NULL,
    description text,
    category text DEFAULT 'general'::text,
    max_per_day integer,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT xp_rules_pkey PRIMARY KEY (id),
    CONSTRAINT xp_rules_activity_key UNIQUE (activity)
);

-- 103. news_feeds (12 columns)
CREATE TABLE public.news_feeds (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    title text NOT NULL,
    content text NOT NULL,
    image_url text,
    category text NOT NULL DEFAULT 'general'::text,
    author_id uuid,
    author_name text,
    is_featured boolean DEFAULT false,
    is_published boolean DEFAULT true,
    published_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT news_feeds_pkey PRIMARY KEY (id),
    CONSTRAINT news_feeds_category_check CHECK ((category = ANY (ARRAY['general'::text, 'announcement'::text, 'event'::text, 'achievement'::text, 'update'::text])))
);

-- ============================================
-- FOREIGN KEY CONSTRAINTS
-- ============================================

-- profiles foreign keys
ALTER TABLE public.profiles ADD CONSTRAINT profiles_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE SET NULL;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE SET NULL;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_position_id_fkey FOREIGN KEY (position_id) REFERENCES public.positions(id) ON DELETE SET NULL;

-- classes foreign keys
ALTER TABLE public.classes ADD CONSTRAINT classes_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;

-- officers foreign keys
ALTER TABLE public.officers ADD CONSTRAINT officers_reporting_manager_id_fkey FOREIGN KEY (reporting_manager_id) REFERENCES public.officers(id) ON DELETE SET NULL;

-- students foreign keys
ALTER TABLE public.students ADD CONSTRAINT students_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE SET NULL;
ALTER TABLE public.students ADD CONSTRAINT students_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE SET NULL;

-- appraisal_projects foreign keys
ALTER TABLE public.appraisal_projects ADD CONSTRAINT appraisal_projects_appraisal_id_fkey FOREIGN KEY (appraisal_id) REFERENCES public.performance_appraisals(id) ON DELETE CASCADE;

-- assessments foreign keys
ALTER TABLE public.assessments ADD CONSTRAINT assessments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.assessments ADD CONSTRAINT assessments_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE SET NULL;

-- assessment_questions foreign keys
ALTER TABLE public.assessment_questions ADD CONSTRAINT assessment_questions_assessment_id_fkey FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE CASCADE;

-- assessment_attempts foreign keys
ALTER TABLE public.assessment_attempts ADD CONSTRAINT assessment_attempts_assessment_id_fkey FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE CASCADE;
ALTER TABLE public.assessment_attempts ADD CONSTRAINT assessment_attempts_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.assessment_attempts ADD CONSTRAINT assessment_attempts_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;
ALTER TABLE public.assessment_attempts ADD CONSTRAINT assessment_attempts_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;

-- assessment_answers foreign keys
ALTER TABLE public.assessment_answers ADD CONSTRAINT assessment_answers_attempt_id_fkey FOREIGN KEY (attempt_id) REFERENCES public.assessment_attempts(id) ON DELETE CASCADE;
ALTER TABLE public.assessment_answers ADD CONSTRAINT assessment_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.assessment_questions(id) ON DELETE CASCADE;

-- assessment_class_assignments foreign keys
ALTER TABLE public.assessment_class_assignments ADD CONSTRAINT assessment_class_assignments_assessment_id_fkey FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE CASCADE;
ALTER TABLE public.assessment_class_assignments ADD CONSTRAINT assessment_class_assignments_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;
ALTER TABLE public.assessment_class_assignments ADD CONSTRAINT assessment_class_assignments_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;
ALTER TABLE public.assessment_class_assignments ADD CONSTRAINT assessment_class_assignments_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- assignments foreign keys
ALTER TABLE public.assignments ADD CONSTRAINT assignments_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE SET NULL;

-- assignment_class_assignments foreign keys
ALTER TABLE public.assignment_class_assignments ADD CONSTRAINT assignment_class_assignments_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.assignments(id) ON DELETE CASCADE;
ALTER TABLE public.assignment_class_assignments ADD CONSTRAINT assignment_class_assignments_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;
ALTER TABLE public.assignment_class_assignments ADD CONSTRAINT assignment_class_assignments_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;

-- assignment_submissions foreign keys
ALTER TABLE public.assignment_submissions ADD CONSTRAINT assignment_submissions_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.assignments(id) ON DELETE CASCADE;
ALTER TABLE public.assignment_submissions ADD CONSTRAINT assignment_submissions_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;
ALTER TABLE public.assignment_submissions ADD CONSTRAINT assignment_submissions_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;

-- calendar_day_types foreign keys
ALTER TABLE public.calendar_day_types ADD CONSTRAINT calendar_day_types_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;

-- candidate_interviews foreign keys
ALTER TABLE public.candidate_interviews ADD CONSTRAINT candidate_interviews_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.job_applications(id) ON DELETE CASCADE;
ALTER TABLE public.candidate_interviews ADD CONSTRAINT candidate_interviews_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES public.interview_stages(id) ON DELETE SET NULL;

-- candidate_offers foreign keys
ALTER TABLE public.candidate_offers ADD CONSTRAINT candidate_offers_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.job_applications(id) ON DELETE CASCADE;

-- certificate_templates foreign keys
ALTER TABLE public.certificate_templates ADD CONSTRAINT certificate_templates_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- class_module_assignments foreign keys
ALTER TABLE public.class_module_assignments ADD CONSTRAINT class_module_assignments_class_assignment_id_fkey FOREIGN KEY (class_assignment_id) REFERENCES public.course_class_assignments(id) ON DELETE CASCADE;
ALTER TABLE public.class_module_assignments ADD CONSTRAINT class_module_assignments_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.course_modules(id) ON DELETE CASCADE;

-- class_session_assignments foreign keys
ALTER TABLE public.class_session_assignments ADD CONSTRAINT class_session_assignments_class_module_assignment_id_fkey FOREIGN KEY (class_module_assignment_id) REFERENCES public.class_module_assignments(id) ON DELETE CASCADE;
ALTER TABLE public.class_session_assignments ADD CONSTRAINT class_session_assignments_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.course_sessions(id) ON DELETE CASCADE;

-- class_session_attendance foreign keys
ALTER TABLE public.class_session_attendance ADD CONSTRAINT class_session_attendance_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;
ALTER TABLE public.class_session_attendance ADD CONSTRAINT class_session_attendance_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;
ALTER TABLE public.class_session_attendance ADD CONSTRAINT class_session_attendance_timetable_assignment_id_fkey FOREIGN KEY (timetable_assignment_id) REFERENCES public.institution_timetable_assignments(id) ON DELETE CASCADE;
ALTER TABLE public.class_session_attendance ADD CONSTRAINT class_session_attendance_officer_id_fkey FOREIGN KEY (officer_id) REFERENCES public.officers(id) ON DELETE SET NULL;
ALTER TABLE public.class_session_attendance ADD CONSTRAINT class_session_attendance_completed_by_fkey FOREIGN KEY (completed_by) REFERENCES public.officers(id) ON DELETE SET NULL;

-- communication_log_attachments foreign keys
ALTER TABLE public.communication_log_attachments ADD CONSTRAINT communication_log_attachments_communication_log_id_fkey FOREIGN KEY (communication_log_id) REFERENCES public.communication_logs(id) ON DELETE CASCADE;

-- communication_logs foreign keys
ALTER TABLE public.communication_logs ADD CONSTRAINT communication_logs_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;

-- courses foreign keys
ALTER TABLE public.courses ADD CONSTRAINT courses_certificate_template_id_fkey FOREIGN KEY (certificate_template_id) REFERENCES public.certificate_templates(id) ON DELETE SET NULL;

-- course_modules foreign keys
ALTER TABLE public.course_modules ADD CONSTRAINT course_modules_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;

-- course_sessions foreign keys
ALTER TABLE public.course_sessions ADD CONSTRAINT course_sessions_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;
ALTER TABLE public.course_sessions ADD CONSTRAINT course_sessions_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.course_modules(id) ON DELETE CASCADE;

-- course_content foreign keys
ALTER TABLE public.course_content ADD CONSTRAINT course_content_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;
ALTER TABLE public.course_content ADD CONSTRAINT course_content_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.course_modules(id) ON DELETE CASCADE;
ALTER TABLE public.course_content ADD CONSTRAINT course_content_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.course_sessions(id) ON DELETE CASCADE;

-- course_institution_assignments foreign keys
ALTER TABLE public.course_institution_assignments ADD CONSTRAINT course_institution_assignments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;
ALTER TABLE public.course_institution_assignments ADD CONSTRAINT course_institution_assignments_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;

-- course_class_assignments foreign keys
ALTER TABLE public.course_class_assignments ADD CONSTRAINT course_class_assignments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;
ALTER TABLE public.course_class_assignments ADD CONSTRAINT course_class_assignments_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;
ALTER TABLE public.course_class_assignments ADD CONSTRAINT course_class_assignments_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;

-- crm_contracts foreign keys
ALTER TABLE public.crm_contracts ADD CONSTRAINT crm_contracts_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;
ALTER TABLE public.crm_contracts ADD CONSTRAINT crm_contracts_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- crm_contract_documents foreign keys
ALTER TABLE public.crm_contract_documents ADD CONSTRAINT crm_contract_documents_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES public.crm_contracts(id) ON DELETE CASCADE;
ALTER TABLE public.crm_contract_documents ADD CONSTRAINT crm_contract_documents_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- crm_tasks foreign keys
ALTER TABLE public.crm_tasks ADD CONSTRAINT crm_tasks_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;
ALTER TABLE public.crm_tasks ADD CONSTRAINT crm_tasks_related_contract_id_fkey FOREIGN KEY (related_contract_id) REFERENCES public.crm_contracts(id) ON DELETE SET NULL;
ALTER TABLE public.crm_tasks ADD CONSTRAINT crm_tasks_assigned_to_id_fkey FOREIGN KEY (assigned_to_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.crm_tasks ADD CONSTRAINT crm_tasks_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- daily_work_logs foreign keys
ALTER TABLE public.daily_work_logs ADD CONSTRAINT daily_work_logs_officer_id_fkey FOREIGN KEY (officer_id) REFERENCES public.officers(id) ON DELETE SET NULL;

-- events foreign keys
-- No foreign keys defined

-- event_class_assignments foreign keys
ALTER TABLE public.event_class_assignments ADD CONSTRAINT event_class_assignments_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;
ALTER TABLE public.event_class_assignments ADD CONSTRAINT event_class_assignments_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;
ALTER TABLE public.event_class_assignments ADD CONSTRAINT event_class_assignments_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;

-- event_interests foreign keys
ALTER TABLE public.event_interests ADD CONSTRAINT event_interests_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;
ALTER TABLE public.event_interests ADD CONSTRAINT event_interests_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;
ALTER TABLE public.event_interests ADD CONSTRAINT event_interests_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE SET NULL;

-- event_updates foreign keys
ALTER TABLE public.event_updates ADD CONSTRAINT event_updates_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;

-- gamification_badges foreign keys
ALTER TABLE public.gamification_badges ADD CONSTRAINT gamification_badges_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- hr_ratings foreign keys
ALTER TABLE public.hr_ratings ADD CONSTRAINT hr_ratings_trainer_id_fkey FOREIGN KEY (trainer_id) REFERENCES public.officers(id) ON DELETE CASCADE;
ALTER TABLE public.hr_ratings ADD CONSTRAINT hr_ratings_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- hr_rating_projects foreign keys
ALTER TABLE public.hr_rating_projects ADD CONSTRAINT hr_rating_projects_hr_rating_id_fkey FOREIGN KEY (hr_rating_id) REFERENCES public.hr_ratings(id) ON DELETE CASCADE;
ALTER TABLE public.hr_rating_projects ADD CONSTRAINT hr_rating_projects_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- id_counters foreign keys
ALTER TABLE public.id_counters ADD CONSTRAINT id_counters_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;

-- institution_holidays foreign keys
ALTER TABLE public.institution_holidays ADD CONSTRAINT institution_holidays_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;

-- institution_periods foreign keys
ALTER TABLE public.institution_periods ADD CONSTRAINT institution_periods_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;

-- institution_timetable_assignments foreign keys
ALTER TABLE public.institution_timetable_assignments ADD CONSTRAINT institution_timetable_assignments_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;
ALTER TABLE public.institution_timetable_assignments ADD CONSTRAINT institution_timetable_assignments_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;
ALTER TABLE public.institution_timetable_assignments ADD CONSTRAINT institution_timetable_assignments_period_id_fkey FOREIGN KEY (period_id) REFERENCES public.institution_periods(id) ON DELETE CASCADE;

-- interview_feedback foreign keys
ALTER TABLE public.interview_feedback ADD CONSTRAINT interview_feedback_interview_id_fkey FOREIGN KEY (interview_id) REFERENCES public.candidate_interviews(id) ON DELETE CASCADE;

-- inventory_issues foreign keys
ALTER TABLE public.inventory_issues ADD CONSTRAINT inventory_issues_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE SET NULL;
ALTER TABLE public.inventory_issues ADD CONSTRAINT inventory_issues_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES public.inventory_items(id) ON DELETE CASCADE;
ALTER TABLE public.inventory_issues ADD CONSTRAINT inventory_issues_issued_to_officer_id_fkey FOREIGN KEY (issued_to_officer_id) REFERENCES public.officers(id) ON DELETE SET NULL;

-- invoices foreign keys
ALTER TABLE public.invoices ADD CONSTRAINT invoices_company_profile_id_fkey FOREIGN KEY (company_profile_id) REFERENCES public.company_profiles(id) ON DELETE SET NULL;
ALTER TABLE public.invoices ADD CONSTRAINT invoices_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE SET NULL;

-- invoice_line_items foreign keys
ALTER TABLE public.invoice_line_items ADD CONSTRAINT invoice_line_items_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE;

-- job_applications foreign keys
ALTER TABLE public.job_applications ADD CONSTRAINT job_applications_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.job_postings(id) ON DELETE CASCADE;
ALTER TABLE public.job_applications ADD CONSTRAINT job_applications_current_stage_id_fkey FOREIGN KEY (current_stage_id) REFERENCES public.interview_stages(id) ON DELETE SET NULL;

-- leave_applications foreign keys
ALTER TABLE public.leave_applications ADD CONSTRAINT leave_applications_officer_id_fkey FOREIGN KEY (officer_id) REFERENCES public.officers(id) ON DELETE SET NULL;

-- leave_approval_hierarchy foreign keys
ALTER TABLE public.leave_approval_hierarchy ADD CONSTRAINT leave_approval_hierarchy_approver_id_fkey FOREIGN KEY (approver_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- leave_balance_adjustments foreign keys
ALTER TABLE public.leave_balance_adjustments ADD CONSTRAINT leave_balance_adjustments_balance_id_fkey FOREIGN KEY (balance_id) REFERENCES public.leave_balances(id) ON DELETE CASCADE;

-- leave_balances foreign keys
ALTER TABLE public.leave_balances ADD CONSTRAINT leave_balances_officer_id_fkey FOREIGN KEY (officer_id) REFERENCES public.officers(id) ON DELETE SET NULL;

-- newsletters foreign keys
ALTER TABLE public.newsletters ADD CONSTRAINT newsletters_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- officer_attendance foreign keys
ALTER TABLE public.officer_attendance ADD CONSTRAINT officer_attendance_officer_id_fkey FOREIGN KEY (officer_id) REFERENCES public.officers(id) ON DELETE CASCADE;
ALTER TABLE public.officer_attendance ADD CONSTRAINT officer_attendance_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE SET NULL;

-- officer_class_access_grants foreign keys
ALTER TABLE public.officer_class_access_grants ADD CONSTRAINT officer_class_access_grants_officer_id_fkey FOREIGN KEY (officer_id) REFERENCES public.officers(id) ON DELETE CASCADE;
ALTER TABLE public.officer_class_access_grants ADD CONSTRAINT officer_class_access_grants_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;
ALTER TABLE public.officer_class_access_grants ADD CONSTRAINT officer_class_access_grants_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;

-- officer_documents foreign keys
ALTER TABLE public.officer_documents ADD CONSTRAINT officer_documents_officer_id_fkey FOREIGN KEY (officer_id) REFERENCES public.officers(id) ON DELETE CASCADE;

-- officer_institution_assignments foreign keys
ALTER TABLE public.officer_institution_assignments ADD CONSTRAINT officer_institution_assignments_officer_id_fkey FOREIGN KEY (officer_id) REFERENCES public.officers(id) ON DELETE CASCADE;
ALTER TABLE public.officer_institution_assignments ADD CONSTRAINT officer_institution_assignments_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;

-- overtime_requests foreign keys
ALTER TABLE public.overtime_requests ADD CONSTRAINT overtime_requests_officer_id_fkey FOREIGN KEY (officer_id) REFERENCES public.officers(id) ON DELETE SET NULL;

-- payroll_records foreign keys
ALTER TABLE public.payroll_records ADD CONSTRAINT payroll_records_officer_id_fkey FOREIGN KEY (officer_id) REFERENCES public.officers(id) ON DELETE SET NULL;

-- performance_appraisals foreign keys
ALTER TABLE public.performance_appraisals ADD CONSTRAINT performance_appraisals_officer_id_fkey FOREIGN KEY (officer_id) REFERENCES public.officers(id) ON DELETE CASCADE;
ALTER TABLE public.performance_appraisals ADD CONSTRAINT performance_appraisals_reporting_manager_id_fkey FOREIGN KEY (reporting_manager_id) REFERENCES public.officers(id) ON DELETE SET NULL;

-- projects foreign keys
ALTER TABLE public.projects ADD CONSTRAINT projects_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE SET NULL;
ALTER TABLE public.projects ADD CONSTRAINT projects_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE SET NULL;
ALTER TABLE public.projects ADD CONSTRAINT projects_mentor_id_fkey FOREIGN KEY (mentor_id) REFERENCES public.officers(id) ON DELETE SET NULL;
ALTER TABLE public.projects ADD CONSTRAINT projects_guide_id_fkey FOREIGN KEY (guide_id) REFERENCES public.officers(id) ON DELETE SET NULL;

-- project_members foreign keys
ALTER TABLE public.project_members ADD CONSTRAINT project_members_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;
ALTER TABLE public.project_members ADD CONSTRAINT project_members_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;

-- project_progress_updates foreign keys
ALTER TABLE public.project_progress_updates ADD CONSTRAINT project_progress_updates_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

-- project_achievements foreign keys
ALTER TABLE public.project_achievements ADD CONSTRAINT project_achievements_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

-- purchase_approval_chain foreign keys
ALTER TABLE public.purchase_approval_chain ADD CONSTRAINT purchase_approval_chain_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.purchase_requests(id) ON DELETE CASCADE;

-- reports foreign keys
ALTER TABLE public.reports ADD CONSTRAINT reports_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE SET NULL;
ALTER TABLE public.reports ADD CONSTRAINT reports_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE SET NULL;

-- staff_attendance foreign keys
ALTER TABLE public.staff_attendance ADD CONSTRAINT staff_attendance_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;
ALTER TABLE public.staff_attendance ADD CONSTRAINT staff_attendance_officer_id_fkey FOREIGN KEY (officer_id) REFERENCES public.officers(id) ON DELETE CASCADE;

-- staff_documents foreign keys
ALTER TABLE public.staff_documents ADD CONSTRAINT staff_documents_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;
ALTER TABLE public.staff_documents ADD CONSTRAINT staff_documents_officer_id_fkey FOREIGN KEY (officer_id) REFERENCES public.officers(id) ON DELETE CASCADE;

-- student_badges foreign keys
ALTER TABLE public.student_badges ADD CONSTRAINT student_badges_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.student_badges ADD CONSTRAINT student_badges_badge_id_fkey FOREIGN KEY (badge_id) REFERENCES public.gamification_badges(id) ON DELETE CASCADE;

-- student_certificates foreign keys
ALTER TABLE public.student_certificates ADD CONSTRAINT student_certificates_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.student_certificates ADD CONSTRAINT student_certificates_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.certificate_templates(id) ON DELETE SET NULL;

-- student_content_completions foreign keys
ALTER TABLE public.student_content_completions ADD CONSTRAINT student_content_completions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.student_content_completions ADD CONSTRAINT student_content_completions_content_id_fkey FOREIGN KEY (content_id) REFERENCES public.course_content(id) ON DELETE CASCADE;
ALTER TABLE public.student_content_completions ADD CONSTRAINT student_content_completions_class_assignment_id_fkey FOREIGN KEY (class_assignment_id) REFERENCES public.course_class_assignments(id) ON DELETE CASCADE;

-- student_feedback foreign keys
ALTER TABLE public.student_feedback ADD CONSTRAINT student_feedback_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.student_feedback ADD CONSTRAINT student_feedback_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;
ALTER TABLE public.student_feedback ADD CONSTRAINT student_feedback_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE SET NULL;

-- student_streaks foreign keys
ALTER TABLE public.student_streaks ADD CONSTRAINT student_streaks_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- student_xp_transactions foreign keys
ALTER TABLE public.student_xp_transactions ADD CONSTRAINT student_xp_transactions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.student_xp_transactions ADD CONSTRAINT student_xp_transactions_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE SET NULL;

-- surveys foreign keys
ALTER TABLE public.surveys ADD CONSTRAINT surveys_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- survey_questions foreign keys
ALTER TABLE public.survey_questions ADD CONSTRAINT survey_questions_survey_id_fkey FOREIGN KEY (survey_id) REFERENCES public.surveys(id) ON DELETE CASCADE;

-- survey_responses foreign keys
ALTER TABLE public.survey_responses ADD CONSTRAINT survey_responses_survey_id_fkey FOREIGN KEY (survey_id) REFERENCES public.surveys(id) ON DELETE CASCADE;
ALTER TABLE public.survey_responses ADD CONSTRAINT survey_responses_institution_id_fkey FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE SET NULL;
ALTER TABLE public.survey_responses ADD CONSTRAINT survey_responses_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE SET NULL;

-- survey_response_answers foreign keys
ALTER TABLE public.survey_response_answers ADD CONSTRAINT survey_response_answers_response_id_fkey FOREIGN KEY (response_id) REFERENCES public.survey_responses(id) ON DELETE CASCADE;
ALTER TABLE public.survey_response_answers ADD CONSTRAINT survey_response_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.survey_questions(id) ON DELETE CASCADE;

-- task_attachments foreign keys
ALTER TABLE public.task_attachments ADD CONSTRAINT task_attachments_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;

-- task_activity_log foreign keys
ALTER TABLE public.task_activity_log ADD CONSTRAINT task_activity_log_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;

-- news_feeds foreign keys
ALTER TABLE public.news_feeds ADD CONSTRAINT news_feeds_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- ============================================
-- INDEXES
-- ============================================

-- ai_prompt_usage indexes
CREATE INDEX IF NOT EXISTS idx_ai_prompt_usage_user_month_year ON public.ai_prompt_usage USING btree (user_id, month, year);

-- appraisal_projects indexes
CREATE INDEX IF NOT EXISTS idx_appraisal_projects_appraisal ON public.appraisal_projects USING btree (appraisal_id);

-- assessment_answers indexes
CREATE INDEX IF NOT EXISTS idx_assessment_answers_attempt_id ON public.assessment_answers USING btree (attempt_id);
CREATE UNIQUE INDEX IF NOT EXISTS assessment_answers_attempt_question_unique ON public.assessment_answers USING btree (attempt_id, question_id);

-- assessment_attempts indexes
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_assessment_id ON public.assessment_attempts USING btree (assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_student_id ON public.assessment_attempts USING btree (student_id);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_status ON public.assessment_attempts USING btree (status);

-- assessment_class_assignments indexes
CREATE INDEX IF NOT EXISTS idx_assessment_class_assignments_assessment_id ON public.assessment_class_assignments USING btree (assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_class_assignments_class_id ON public.assessment_class_assignments USING btree (class_id);
CREATE INDEX IF NOT EXISTS idx_assessment_class_assignments_institution_id ON public.assessment_class_assignments USING btree (institution_id);

-- assessment_questions indexes
CREATE INDEX IF NOT EXISTS idx_assessment_questions_assessment_id ON public.assessment_questions USING btree (assessment_id);

-- assessments indexes
CREATE INDEX IF NOT EXISTS idx_assessments_created_by ON public.assessments USING btree (created_by);
CREATE INDEX IF NOT EXISTS idx_assessments_institution_id ON public.assessments USING btree (institution_id);
CREATE INDEX IF NOT EXISTS idx_assessments_status ON public.assessments USING btree (status);

-- calendar_day_types indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_calendar_day_types_unique ON public.calendar_day_types USING btree (date, calendar_type, COALESCE((institution_id)::text, ''::text));

-- candidate_interviews indexes
CREATE INDEX IF NOT EXISTS idx_candidate_interviews_application_id ON public.candidate_interviews USING btree (application_id);
CREATE INDEX IF NOT EXISTS idx_candidate_interviews_stage_id ON public.candidate_interviews USING btree (stage_id);

-- candidate_offers indexes
CREATE INDEX IF NOT EXISTS idx_candidate_offers_application_id ON public.candidate_offers USING btree (application_id);

-- class_session_attendance indexes
CREATE INDEX IF NOT EXISTS idx_class_session_attendance_class_date ON public.class_session_attendance USING btree (class_id, date);
CREATE INDEX IF NOT EXISTS idx_class_session_attendance_institution_date ON public.class_session_attendance USING btree (institution_id, date);
CREATE INDEX IF NOT EXISTS idx_class_session_attendance_officer_date ON public.class_session_attendance USING btree (officer_id, date);

-- classes indexes
CREATE INDEX IF NOT EXISTS idx_classes_institution_id ON public.classes USING btree (institution_id);

-- communication_logs indexes
CREATE INDEX IF NOT EXISTS idx_communication_logs_institution ON public.communication_logs USING btree (institution_id);
CREATE INDEX IF NOT EXISTS idx_communication_logs_conducted_by ON public.communication_logs USING btree (conducted_by_id);
CREATE INDEX IF NOT EXISTS idx_communication_logs_date ON public.communication_logs USING btree (date DESC);

-- company_holidays indexes
CREATE INDEX IF NOT EXISTS idx_company_holidays_date ON public.company_holidays USING btree (date);
CREATE INDEX IF NOT EXISTS idx_company_holidays_year ON public.company_holidays USING btree (year);

-- course_class_assignments indexes
CREATE INDEX IF NOT EXISTS idx_course_class_assignments_course_id ON public.course_class_assignments USING btree (course_id);
CREATE INDEX IF NOT EXISTS idx_course_class_assignments_class_id ON public.course_class_assignments USING btree (class_id);

-- course_content indexes
CREATE INDEX IF NOT EXISTS idx_course_content_course_id ON public.course_content USING btree (course_id);
CREATE INDEX IF NOT EXISTS idx_course_content_module_id ON public.course_content USING btree (module_id);
CREATE INDEX IF NOT EXISTS idx_course_content_session_id ON public.course_content USING btree (session_id);

-- course_institution_assignments indexes
CREATE INDEX IF NOT EXISTS idx_course_institution_assignments_course_id ON public.course_institution_assignments USING btree (course_id);
CREATE INDEX IF NOT EXISTS idx_course_institution_assignments_institution_id ON public.course_institution_assignments USING btree (institution_id);

-- course_modules indexes
CREATE INDEX IF NOT EXISTS idx_course_modules_course_id ON public.course_modules USING btree (course_id);

-- course_sessions indexes
CREATE INDEX IF NOT EXISTS idx_course_sessions_course_id ON public.course_sessions USING btree (course_id);
CREATE INDEX IF NOT EXISTS idx_course_sessions_module_id ON public.course_sessions USING btree (module_id);

-- crm_contract_documents indexes
CREATE INDEX IF NOT EXISTS idx_crm_contract_documents_contract_id ON public.crm_contract_documents USING btree (contract_id);

-- crm_contracts indexes
CREATE INDEX IF NOT EXISTS idx_crm_contracts_institution_id ON public.crm_contracts USING btree (institution_id);
CREATE INDEX IF NOT EXISTS idx_crm_contracts_status ON public.crm_contracts USING btree (status);
CREATE INDEX IF NOT EXISTS idx_crm_contracts_renewal_date ON public.crm_contracts USING btree (renewal_date);

-- daily_work_logs indexes
CREATE INDEX IF NOT EXISTS idx_daily_work_logs_user_date ON public.daily_work_logs USING btree (user_id, date);

-- hr_ratings indexes
CREATE INDEX IF NOT EXISTS idx_hr_ratings_trainer_id ON public.hr_ratings USING btree (trainer_id);
CREATE INDEX IF NOT EXISTS idx_hr_ratings_year ON public.hr_ratings USING btree (year);

-- institution_holidays indexes
CREATE INDEX IF NOT EXISTS idx_institution_holidays_institution_id ON public.institution_holidays USING btree (institution_id);
CREATE INDEX IF NOT EXISTS idx_institution_holidays_date ON public.institution_holidays USING btree (date);
CREATE INDEX IF NOT EXISTS idx_institution_holidays_year ON public.institution_holidays USING btree (year);

-- institution_periods indexes
CREATE INDEX IF NOT EXISTS idx_institution_periods_institution_id ON public.institution_periods USING btree (institution_id);

-- institution_timetable_assignments indexes
CREATE INDEX IF NOT EXISTS idx_institution_timetable_assignments_institution ON public.institution_timetable_assignments USING btree (institution_id);
CREATE INDEX IF NOT EXISTS idx_institution_timetable_assignments_class ON public.institution_timetable_assignments USING btree (class_id);
CREATE INDEX IF NOT EXISTS idx_institution_timetable_assignments_day ON public.institution_timetable_assignments USING btree (day);

-- institutions indexes
CREATE INDEX IF NOT EXISTS idx_institutions_status ON public.institutions USING btree (status);

-- interview_feedback indexes
CREATE INDEX IF NOT EXISTS idx_interview_feedback_interview_id ON public.interview_feedback USING btree (interview_id);

-- inventory_issues indexes
CREATE INDEX IF NOT EXISTS idx_inventory_issues_institution_id ON public.inventory_issues USING btree (institution_id);
CREATE INDEX IF NOT EXISTS idx_inventory_issues_inventory_item_id ON public.inventory_issues USING btree (inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_issues_issue_date ON public.inventory_issues USING btree (issue_date);
CREATE INDEX IF NOT EXISTS idx_inventory_issues_status ON public.inventory_issues USING btree (status);

-- inventory_items indexes
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON public.inventory_items USING btree (category);
CREATE INDEX IF NOT EXISTS idx_inventory_items_status ON public.inventory_items USING btree (status);

-- invoices indexes
CREATE INDEX IF NOT EXISTS idx_invoices_institution_id ON public.invoices USING btree (institution_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_date ON public.invoices USING btree (invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices USING btree (status);

-- job_applications indexes
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON public.job_applications USING btree (job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON public.job_applications USING btree (status);

-- job_postings indexes
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON public.job_postings USING btree (status);

-- leave_applications indexes
CREATE INDEX IF NOT EXISTS idx_leave_applications_applicant ON public.leave_applications USING btree (applicant_id);
CREATE INDEX IF NOT EXISTS idx_leave_applications_officer ON public.leave_applications USING btree (officer_id);
CREATE INDEX IF NOT EXISTS idx_leave_applications_status ON public.leave_applications USING btree (status);
CREATE INDEX IF NOT EXISTS idx_leave_applications_dates ON public.leave_applications USING btree (start_date, end_date);

-- leave_balances indexes
CREATE INDEX IF NOT EXISTS idx_leave_balances_user_year ON public.leave_balances USING btree (user_id, year);
CREATE INDEX IF NOT EXISTS idx_leave_balances_officer ON public.leave_balances USING btree (officer_id);

-- newsletters indexes
CREATE INDEX IF NOT EXISTS idx_newsletters_year_month ON public.newsletters USING btree (year, month);
CREATE INDEX IF NOT EXISTS idx_newsletters_published ON public.newsletters USING btree (is_published);

-- notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications USING btree (is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications USING btree (created_at DESC);

-- officer_attendance indexes
CREATE INDEX IF NOT EXISTS idx_officer_attendance_date ON public.officer_attendance USING btree (date);
CREATE INDEX IF NOT EXISTS idx_officer_attendance_status ON public.officer_attendance USING btree (attendance_status);
CREATE INDEX IF NOT EXISTS idx_officer_attendance_institution ON public.officer_attendance USING btree (institution_id);

-- officer_class_access_grants indexes
CREATE INDEX IF NOT EXISTS idx_officer_class_access_grants_officer ON public.officer_class_access_grants USING btree (officer_id);
CREATE INDEX IF NOT EXISTS idx_officer_class_access_grants_class ON public.officer_class_access_grants USING btree (class_id);

-- officer_documents indexes
CREATE INDEX IF NOT EXISTS idx_officer_documents_officer_id ON public.officer_documents USING btree (officer_id);

-- officers indexes
CREATE INDEX IF NOT EXISTS idx_officers_user_id ON public.officers USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_officers_status ON public.officers USING btree (status);

-- overtime_requests indexes
CREATE INDEX IF NOT EXISTS idx_overtime_requests_user ON public.overtime_requests USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_overtime_requests_officer ON public.overtime_requests USING btree (officer_id);
CREATE INDEX IF NOT EXISTS idx_overtime_requests_status ON public.overtime_requests USING btree (status);
CREATE INDEX IF NOT EXISTS idx_overtime_requests_date ON public.overtime_requests USING btree (date);

-- payroll_records indexes
CREATE INDEX IF NOT EXISTS idx_payroll_records_user ON public.payroll_records USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_payroll_records_officer ON public.payroll_records USING btree (officer_id);
CREATE INDEX IF NOT EXISTS idx_payroll_records_month_year ON public.payroll_records USING btree (month, year);
CREATE INDEX IF NOT EXISTS idx_payroll_records_status ON public.payroll_records USING btree (status);

-- performance_appraisals indexes
CREATE INDEX IF NOT EXISTS idx_performance_appraisals_officer ON public.performance_appraisals USING btree (officer_id);
CREATE INDEX IF NOT EXISTS idx_performance_appraisals_status ON public.performance_appraisals USING btree (status);

-- profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_institution_id ON public.profiles USING btree (institution_id);
CREATE INDEX IF NOT EXISTS idx_profiles_class_id ON public.profiles USING btree (class_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles USING btree (role);

-- project_achievements indexes
CREATE INDEX IF NOT EXISTS idx_project_achievements_project_id ON public.project_achievements USING btree (project_id);

-- project_members indexes
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON public.project_members USING btree (project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_student_id ON public.project_members USING btree (student_id);

-- project_progress_updates indexes
CREATE INDEX IF NOT EXISTS idx_project_progress_updates_project_id ON public.project_progress_updates USING btree (project_id);

-- projects indexes
CREATE INDEX IF NOT EXISTS idx_projects_institution_id ON public.projects USING btree (institution_id);
CREATE INDEX IF NOT EXISTS idx_projects_class_id ON public.projects USING btree (class_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects USING btree (status);

-- purchase_requests indexes
CREATE INDEX IF NOT EXISTS idx_purchase_requests_requested_by ON public.purchase_requests USING btree (requested_by_id);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_status ON public.purchase_requests USING btree (status);

-- reports indexes
CREATE INDEX IF NOT EXISTS idx_reports_institution ON public.reports USING btree (institution_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports USING btree (status);
CREATE INDEX IF NOT EXISTS idx_reports_generated_by ON public.reports USING btree (generated_by);

-- staff_attendance indexes
CREATE INDEX IF NOT EXISTS idx_staff_attendance_institution_date ON public.staff_attendance USING btree (institution_id, date);
CREATE INDEX IF NOT EXISTS idx_staff_attendance_officer_date ON public.staff_attendance USING btree (officer_id, date);
CREATE INDEX IF NOT EXISTS idx_staff_attendance_status ON public.staff_attendance USING btree (attendance_status);

-- staff_documents indexes
CREATE INDEX IF NOT EXISTS idx_staff_documents_institution_id ON public.staff_documents USING btree (institution_id);
CREATE INDEX IF NOT EXISTS idx_staff_documents_officer_id ON public.staff_documents USING btree (officer_id);

-- student_badges indexes
CREATE INDEX IF NOT EXISTS idx_student_badges_student_id ON public.student_badges USING btree (student_id);

-- student_certificates indexes
CREATE INDEX IF NOT EXISTS idx_student_certificates_student_id ON public.student_certificates USING btree (student_id);

-- student_content_completions indexes
CREATE INDEX IF NOT EXISTS idx_student_content_completions_student_id ON public.student_content_completions USING btree (student_id);
CREATE INDEX IF NOT EXISTS idx_student_content_completions_content_id ON public.student_content_completions USING btree (content_id);

-- student_feedback indexes
CREATE INDEX IF NOT EXISTS idx_student_feedback_student_id ON public.student_feedback USING btree (student_id);
CREATE INDEX IF NOT EXISTS idx_student_feedback_institution_id ON public.student_feedback USING btree (institution_id);
CREATE INDEX IF NOT EXISTS idx_student_feedback_status ON public.student_feedback USING btree (status);

-- student_xp_transactions indexes
CREATE INDEX IF NOT EXISTS idx_student_xp_transactions_student_id ON public.student_xp_transactions USING btree (student_id);
CREATE INDEX IF NOT EXISTS idx_student_xp_transactions_institution_id ON public.student_xp_transactions USING btree (institution_id);

-- students indexes
CREATE INDEX IF NOT EXISTS idx_students_institution_id ON public.students USING btree (institution_id);
CREATE INDEX IF NOT EXISTS idx_students_class_id ON public.students USING btree (class_id);
CREATE INDEX IF NOT EXISTS idx_students_user_id ON public.students USING btree (user_id);

-- surveys indexes
CREATE INDEX IF NOT EXISTS idx_surveys_status ON public.surveys USING btree (status);
CREATE INDEX IF NOT EXISTS idx_surveys_created_by ON public.surveys USING btree (created_by);

-- survey_questions indexes
CREATE INDEX IF NOT EXISTS idx_survey_questions_survey_id ON public.survey_questions USING btree (survey_id);

-- survey_responses indexes
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey_id ON public.survey_responses USING btree (survey_id);

-- system_logs indexes
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON public.system_logs USING btree (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_log_level ON public.system_logs USING btree (log_level);
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON public.system_logs USING btree (user_id);

-- tasks indexes
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks USING btree (assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks USING btree (status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks USING btree (due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_institution_id ON public.tasks USING btree (institution_id);

-- task_activity_log indexes
CREATE INDEX IF NOT EXISTS idx_task_activity_log_task_id ON public.task_activity_log USING btree (task_id);

-- task_attachments indexes
CREATE INDEX IF NOT EXISTS idx_task_attachments_task_id ON public.task_attachments USING btree (task_id);

-- user_roles indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles USING btree (role);

-- user_sessions indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON public.user_sessions USING btree (expires_at);

-- news_feeds indexes
CREATE INDEX IF NOT EXISTS idx_news_feeds_category ON public.news_feeds USING btree (category);
CREATE INDEX IF NOT EXISTS idx_news_feeds_is_published ON public.news_feeds USING btree (is_published);
CREATE INDEX IF NOT EXISTS idx_news_feeds_published_at ON public.news_feeds USING btree (published_at DESC);

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
GRANT USAGE ON TYPE public.app_role TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON SEQUENCE public.inventory_items_sl_no_seq TO anon, authenticated, service_role;

-- Grant table permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- ============================================
-- COMPLETION NOTICE
-- ============================================
DO $$ BEGIN RAISE NOTICE 'Schema creation completed! 103 tables created with exact column definitions.'; END $$;
