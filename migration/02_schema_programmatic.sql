-- ============================================
-- Meta-INNOVA LMS - Complete Schema (Programmatic Export)
-- Generated from Lovable Cloud PostgreSQL Catalogs
-- Total Tables: 103
-- ============================================

-- ============================================
-- PART 1: EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PART 2: ENUM TYPES
-- ============================================
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM (
        'super_admin',
        'system_admin', 
        'management',
        'officer',
        'student'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- PART 3: SEQUENCES
-- ============================================
CREATE SEQUENCE IF NOT EXISTS public.inventory_items_sl_no_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- ============================================
-- PART 4: TABLES (Dependency Order)
-- ============================================

-- ----------------------------------------
-- TIER 1: Base Tables (No Foreign Keys)
-- ----------------------------------------

-- positions
CREATE TABLE IF NOT EXISTS public.positions (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    department TEXT,
    level INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT positions_pkey PRIMARY KEY (id)
);

-- institutions
CREATE TABLE IF NOT EXISTS public.institutions (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    code TEXT,
    address JSONB,
    contact_info JSONB,
    settings JSONB,
    status TEXT DEFAULT 'active',
    license_type TEXT DEFAULT 'basic',
    license_expiry TIMESTAMP WITH TIME ZONE,
    max_users INTEGER DEFAULT 100,
    current_users INTEGER DEFAULT 0,
    contract_value NUMERIC(12,2),
    contract_expiry_date DATE,
    admin_user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT institutions_pkey PRIMARY KEY (id),
    CONSTRAINT institutions_slug_key UNIQUE (slug),
    CONSTRAINT institutions_code_key UNIQUE (code),
    CONSTRAINT valid_license_type CHECK (license_type = ANY (ARRAY['basic', 'standard', 'premium', 'enterprise']))
);

-- profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID NOT NULL,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    avatar_url TEXT,
    institution_id UUID,
    position_id UUID,
    role TEXT DEFAULT 'student',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT profiles_pkey PRIMARY KEY (id)
);

-- user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role public.app_role NOT NULL DEFAULT 'student',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT user_roles_pkey PRIMARY KEY (id),
    CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role)
);

-- courses
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    course_code TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general',
    difficulty TEXT DEFAULT 'beginner',
    duration_weeks INTEGER,
    prerequisites TEXT,
    learning_outcomes JSONB,
    sdg_goals JSONB,
    thumbnail_url TEXT,
    certificate_template_id UUID,
    status TEXT DEFAULT 'draft',
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT courses_pkey PRIMARY KEY (id),
    CONSTRAINT courses_course_code_key UNIQUE (course_code)
);

-- certificate_templates
CREATE TABLE IF NOT EXISTS public.certificate_templates (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'course',
    template_image_url TEXT,
    name_position JSONB,
    date_position JSONB,
    course_name_position JSONB,
    level_title_position JSONB,
    default_width INTEGER DEFAULT 800,
    default_height INTEGER DEFAULT 600,
    is_active BOOLEAN DEFAULT true,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT certificate_templates_pkey PRIMARY KEY (id)
);

-- gamification_badges
CREATE TABLE IF NOT EXISTS public.gamification_badges (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT 'award',
    category TEXT DEFAULT 'general',
    xp_reward INTEGER DEFAULT 0,
    unlock_criteria JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT gamification_badges_pkey PRIMARY KEY (id)
);

-- xp_rules
CREATE TABLE IF NOT EXISTS public.xp_rules (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    rule_name TEXT NOT NULL,
    description TEXT,
    event_type TEXT NOT NULL,
    xp_amount INTEGER DEFAULT 0,
    conditions JSONB,
    is_active BOOLEAN DEFAULT true,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT xp_rules_pkey PRIMARY KEY (id)
);

-- leaderboard_configs
CREATE TABLE IF NOT EXISTS public.leaderboard_configs (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    scope TEXT DEFAULT 'institution',
    time_period TEXT DEFAULT 'all_time',
    is_active BOOLEAN DEFAULT true,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT leaderboard_configs_pkey PRIMARY KEY (id)
);

-- events
CREATE TABLE IF NOT EXISTS public.events (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT NOT NULL,
    event_start TIMESTAMP WITH TIME ZONE NOT NULL,
    event_end TIMESTAMP WITH TIME ZONE,
    venue TEXT,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    registration_start TIMESTAMP WITH TIME ZONE,
    registration_end TIMESTAMP WITH TIME ZONE,
    eligibility_criteria TEXT,
    rules TEXT,
    prizes JSONB,
    attachments JSONB,
    brochure_url TEXT,
    status TEXT DEFAULT 'draft',
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT events_pkey PRIMARY KEY (id)
);

-- surveys
CREATE TABLE IF NOT EXISTS public.surveys (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    survey_type TEXT DEFAULT 'feedback',
    target_audience TEXT DEFAULT 'all',
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    is_anonymous BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'draft',
    created_by UUID,
    institution_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT surveys_pkey PRIMARY KEY (id)
);

-- company_profiles
CREATE TABLE IF NOT EXISTS public.company_profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    profile_type TEXT DEFAULT 'main',
    address TEXT,
    city TEXT,
    state TEXT,
    state_code TEXT,
    country TEXT,
    pincode TEXT,
    phone TEXT,
    email TEXT,
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
    default_cgst_rate NUMERIC(5,2) DEFAULT 9.00,
    default_sgst_rate NUMERIC(5,2) DEFAULT 9.00,
    default_igst_rate NUMERIC(5,2) DEFAULT 18.00,
    report_logo_url TEXT,
    report_logo_width INTEGER,
    report_logo_height INTEGER,
    report_signatory_name TEXT,
    report_signatory_designation TEXT,
    is_default BOOLEAN DEFAULT false,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT company_profiles_pkey PRIMARY KEY (id)
);

-- company_holidays
CREATE TABLE IF NOT EXISTS public.company_holidays (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    date DATE NOT NULL,
    end_date DATE,
    holiday_type TEXT DEFAULT 'public',
    description TEXT,
    year INTEGER NOT NULL,
    is_paid BOOLEAN DEFAULT true,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT company_holidays_pkey PRIMARY KEY (id)
);

-- job_postings
CREATE TABLE IF NOT EXISTS public.job_postings (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    department TEXT,
    location TEXT,
    employment_type TEXT DEFAULT 'full_time',
    experience_required TEXT,
    salary_range_min NUMERIC(12,2),
    salary_range_max NUMERIC(12,2),
    description TEXT,
    requirements TEXT,
    responsibilities TEXT,
    benefits TEXT,
    application_deadline DATE,
    positions_available INTEGER DEFAULT 1,
    status TEXT DEFAULT 'draft',
    is_remote BOOLEAN DEFAULT false,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT job_postings_pkey PRIMARY KEY (id)
);

-- leave_settings
CREATE TABLE IF NOT EXISTS public.leave_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    leave_type TEXT NOT NULL,
    annual_quota INTEGER DEFAULT 0,
    carry_forward_allowed BOOLEAN DEFAULT false,
    max_carry_forward INTEGER DEFAULT 0,
    requires_approval BOOLEAN DEFAULT true,
    min_days_notice INTEGER DEFAULT 1,
    is_paid BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT leave_settings_pkey PRIMARY KEY (id)
);

-- password_reset_tokens
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    token TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id)
);

-- system_configurations
CREATE TABLE IF NOT EXISTS public.system_configurations (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    key TEXT NOT NULL,
    value TEXT,
    description TEXT,
    category TEXT DEFAULT 'general',
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT system_configurations_pkey PRIMARY KEY (id),
    CONSTRAINT system_configurations_key_key UNIQUE (key)
);

-- ai_prompt_usage
CREATE TABLE IF NOT EXISTS public.ai_prompt_usage (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role TEXT NOT NULL DEFAULT 'unknown',
    prompt_count INTEGER NOT NULL DEFAULT 0,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT ai_prompt_usage_pkey PRIMARY KEY (id),
    CONSTRAINT ai_prompt_usage_user_id_month_year_key UNIQUE (user_id, month, year)
);

-- webinars
CREATE TABLE IF NOT EXISTS public.webinars (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    host_name TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    meeting_link TEXT,
    recording_url TEXT,
    status TEXT DEFAULT 'scheduled',
    max_attendees INTEGER,
    current_attendees INTEGER DEFAULT 0,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT webinars_pkey PRIMARY KEY (id)
);

-- newsletters
CREATE TABLE IF NOT EXISTS public.newsletters (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT,
    template_type TEXT DEFAULT 'general',
    recipient_type TEXT DEFAULT 'all',
    sent_at TIMESTAMP WITH TIME ZONE,
    scheduled_for TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'draft',
    recipients_count INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT newsletters_pkey PRIMARY KEY (id)
);

-- attendance_corrections
CREATE TABLE IF NOT EXISTS public.attendance_corrections (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    attendance_id UUID NOT NULL,
    attendance_type TEXT NOT NULL,
    field_corrected TEXT NOT NULL,
    original_value TEXT,
    new_value TEXT,
    reason TEXT NOT NULL,
    corrected_by UUID,
    corrected_by_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT attendance_corrections_pkey PRIMARY KEY (id)
);

-- invoice_number_sequences
CREATE TABLE IF NOT EXISTS public.invoice_number_sequences (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    prefix TEXT NOT NULL,
    current_number INTEGER NOT NULL DEFAULT 1,
    financial_year TEXT NOT NULL,
    invoice_type TEXT DEFAULT 'sales',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT invoice_number_sequences_pkey PRIMARY KEY (id),
    CONSTRAINT invoice_number_sequences_prefix_financial_year_invoice_type_key UNIQUE (prefix, financial_year, invoice_type)
);

-- reserved_invoice_numbers
CREATE TABLE IF NOT EXISTS public.reserved_invoice_numbers (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    invoice_number TEXT NOT NULL,
    financial_year TEXT NOT NULL,
    reserved_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    reason TEXT,
    CONSTRAINT reserved_invoice_numbers_pkey PRIMARY KEY (id),
    CONSTRAINT reserved_invoice_numbers_invoice_number_financial_year_key UNIQUE (invoice_number, financial_year)
);

-- ----------------------------------------
-- TIER 2: Tables with Single FK Dependencies
-- ----------------------------------------

-- classes
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    class_name TEXT NOT NULL,
    section TEXT,
    academic_year TEXT,
    institution_id UUID NOT NULL,
    class_teacher_id UUID,
    room_number TEXT,
    capacity INTEGER,
    display_order INTEGER,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT classes_pkey PRIMARY KEY (id)
);

-- institution_periods
CREATE TABLE IF NOT EXISTS public.institution_periods (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL,
    label TEXT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_break BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT institution_periods_pkey PRIMARY KEY (id)
);

-- institution_holidays
CREATE TABLE IF NOT EXISTS public.institution_holidays (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL,
    name TEXT NOT NULL,
    date DATE NOT NULL,
    end_date DATE,
    holiday_type TEXT DEFAULT 'public',
    description TEXT,
    year INTEGER NOT NULL,
    is_paid BOOLEAN DEFAULT true,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT institution_holidays_pkey PRIMARY KEY (id)
);

-- calendar_day_types
CREATE TABLE IF NOT EXISTS public.calendar_day_types (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    institution_id UUID,
    date DATE NOT NULL,
    day_type TEXT NOT NULL,
    calendar_type TEXT NOT NULL,
    description TEXT,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT calendar_day_types_pkey PRIMARY KEY (id)
);

-- id_counters
CREATE TABLE IF NOT EXISTS public.id_counters (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL,
    entity_type TEXT NOT NULL,
    prefix TEXT,
    year_format TEXT,
    counter_padding INTEGER DEFAULT 4,
    current_counter INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT id_counters_pkey PRIMARY KEY (id),
    CONSTRAINT id_counters_institution_id_entity_type_key UNIQUE (institution_id, entity_type),
    CONSTRAINT id_counters_entity_type_check CHECK (entity_type = ANY (ARRAY['student', 'employee', 'class', 'institution', 'roll_number', 'inventory_item']))
);

-- officers
CREATE TABLE IF NOT EXISTS public.officers (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID,
    employee_id TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    date_of_birth DATE,
    date_of_joining DATE,
    designation TEXT,
    department TEXT,
    employment_type TEXT DEFAULT 'full_time',
    reporting_to UUID,
    address JSONB,
    emergency_contact JSONB,
    bank_details JSONB,
    basic_salary NUMERIC(12,2),
    hra NUMERIC(12,2),
    conveyance_allowance NUMERIC(12,2),
    special_allowance NUMERIC(12,2),
    pf_number TEXT,
    esi_number TEXT,
    pan_number TEXT,
    aadhar_number TEXT,
    status TEXT DEFAULT 'active',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT officers_pkey PRIMARY KEY (id),
    CONSTRAINT officers_email_key UNIQUE (email),
    CONSTRAINT officers_employee_id_key UNIQUE (employee_id)
);

-- course_modules
CREATE TABLE IF NOT EXISTS public.course_modules (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    certificate_template_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT course_modules_pkey PRIMARY KEY (id)
);

-- survey_questions
CREATE TABLE IF NOT EXISTS public.survey_questions (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL,
    question_text TEXT NOT NULL,
    question_type TEXT DEFAULT 'text',
    options JSONB,
    is_required BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT survey_questions_pkey PRIMARY KEY (id)
);

-- interview_stages
CREATE TABLE IF NOT EXISTS public.interview_stages (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL,
    stage_name TEXT NOT NULL,
    stage_order INTEGER DEFAULT 1,
    description TEXT,
    duration_minutes INTEGER DEFAULT 60,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT interview_stages_pkey PRIMARY KEY (id)
);

-- assessments
CREATE TABLE IF NOT EXISTS public.assessments (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    institution_id UUID,
    duration_minutes INTEGER DEFAULT 60,
    total_points INTEGER DEFAULT 100,
    pass_percentage INTEGER DEFAULT 50,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    shuffle_questions BOOLEAN DEFAULT false,
    show_results_immediately BOOLEAN DEFAULT true,
    allow_review_after_submission BOOLEAN DEFAULT true,
    auto_submit BOOLEAN DEFAULT true,
    auto_evaluate BOOLEAN DEFAULT true,
    certificate_template_id UUID,
    status TEXT DEFAULT 'draft',
    created_by UUID,
    created_by_role TEXT DEFAULT 'super_admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT assessments_pkey PRIMARY KEY (id)
);

-- assignments
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    institution_id UUID,
    start_date DATE NOT NULL,
    submission_end_date DATE NOT NULL,
    total_marks INTEGER,
    passing_marks INTEGER,
    question_doc_url TEXT,
    allow_resubmit BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'draft',
    created_by UUID,
    created_by_role TEXT DEFAULT 'super_admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT assignments_pkey PRIMARY KEY (id)
);

-- crm_contracts
CREATE TABLE IF NOT EXISTS public.crm_contracts (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL,
    institution_name TEXT NOT NULL,
    contract_type TEXT NOT NULL,
    contract_value NUMERIC(12,2) DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    renewal_date DATE NOT NULL,
    renewal_status TEXT DEFAULT 'pending',
    payment_terms TEXT DEFAULT 'monthly',
    auto_renew BOOLEAN DEFAULT false,
    notes TEXT,
    status TEXT DEFAULT 'active',
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT crm_contracts_pkey PRIMARY KEY (id)
);

-- communication_logs
CREATE TABLE IF NOT EXISTS public.communication_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL,
    institution_name TEXT NOT NULL,
    type TEXT NOT NULL,
    subject TEXT NOT NULL,
    notes TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    contact_role TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'open',
    next_action TEXT,
    next_action_date DATE,
    conducted_by_id UUID,
    conducted_by_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT communication_logs_pkey PRIMARY KEY (id)
);

-- invoices
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    invoice_number TEXT NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE,
    financial_year TEXT NOT NULL,
    invoice_type TEXT DEFAULT 'sales',
    customer_name TEXT NOT NULL,
    customer_address TEXT,
    customer_gstin TEXT,
    customer_state TEXT,
    customer_state_code TEXT,
    company_profile_id UUID,
    subtotal NUMERIC(12,2) DEFAULT 0,
    cgst_rate NUMERIC(5,2) DEFAULT 0,
    cgst_amount NUMERIC(12,2) DEFAULT 0,
    sgst_rate NUMERIC(5,2) DEFAULT 0,
    sgst_amount NUMERIC(12,2) DEFAULT 0,
    igst_rate NUMERIC(5,2) DEFAULT 0,
    igst_amount NUMERIC(12,2) DEFAULT 0,
    total_amount NUMERIC(12,2) DEFAULT 0,
    amount_in_words TEXT,
    notes TEXT,
    terms_and_conditions TEXT,
    payment_status TEXT DEFAULT 'pending',
    payment_date DATE,
    payment_mode TEXT,
    payment_reference TEXT,
    status TEXT DEFAULT 'draft',
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT invoices_pkey PRIMARY KEY (id),
    CONSTRAINT invoices_invoice_number_financial_year_key UNIQUE (invoice_number, financial_year)
);

-- projects
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    project_type TEXT DEFAULT 'internal',
    status TEXT DEFAULT 'planning',
    priority TEXT DEFAULT 'medium',
    start_date DATE,
    end_date DATE,
    budget NUMERIC(12,2),
    institution_id UUID,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT projects_pkey PRIMARY KEY (id)
);

-- tasks
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    project_id UUID,
    assigned_to UUID,
    assigned_by UUID,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'pending',
    due_date DATE,
    estimated_hours NUMERIC(5,2),
    actual_hours NUMERIC(5,2),
    institution_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT tasks_pkey PRIMARY KEY (id)
);

-- reports
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    report_name TEXT NOT NULL,
    report_type TEXT NOT NULL,
    parameters JSONB,
    generated_by UUID,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    file_url TEXT,
    status TEXT DEFAULT 'pending',
    institution_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT reports_pkey PRIMARY KEY (id)
);

-- system_logs
CREATE TABLE IF NOT EXISTS public.system_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    details JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT system_logs_pkey PRIMARY KEY (id)
);

-- notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    type TEXT DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    action_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT notifications_pkey PRIMARY KEY (id)
);

-- leave_approval_hierarchy
CREATE TABLE IF NOT EXISTS public.leave_approval_hierarchy (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL,
    approver_id UUID NOT NULL,
    approval_level INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT leave_approval_hierarchy_pkey PRIMARY KEY (id)
);

-- leave_balances
CREATE TABLE IF NOT EXISTS public.leave_balances (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL,
    leave_type TEXT NOT NULL,
    year INTEGER NOT NULL,
    total_allowed INTEGER DEFAULT 0,
    used INTEGER DEFAULT 0,
    pending INTEGER DEFAULT 0,
    carried_forward INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT leave_balances_pkey PRIMARY KEY (id),
    CONSTRAINT leave_balances_employee_id_leave_type_year_key UNIQUE (employee_id, leave_type, year)
);

-- staff_documents
CREATE TABLE IF NOT EXISTS public.staff_documents (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL,
    document_type TEXT NOT NULL,
    document_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    uploaded_by UUID,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expiry_date DATE,
    status TEXT DEFAULT 'active',
    CONSTRAINT staff_documents_pkey PRIMARY KEY (id)
);

-- inventory_items
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    sl_no INTEGER NOT NULL DEFAULT nextval('inventory_items_sl_no_seq'),
    item_name TEXT NOT NULL,
    item_code TEXT,
    category TEXT,
    description TEXT,
    unit TEXT DEFAULT 'piece',
    quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0,
    max_stock_level INTEGER,
    unit_price NUMERIC(12,2),
    location TEXT,
    supplier TEXT,
    institution_id UUID,
    status TEXT DEFAULT 'active',
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT inventory_items_pkey PRIMARY KEY (id),
    CONSTRAINT inventory_items_sl_no_key UNIQUE (sl_no)
);

-- purchase_requests
CREATE TABLE IF NOT EXISTS public.purchase_requests (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    request_number TEXT,
    requested_by UUID NOT NULL,
    department TEXT,
    items JSONB NOT NULL,
    total_amount NUMERIC(12,2),
    justification TEXT,
    priority TEXT DEFAULT 'normal',
    status TEXT DEFAULT 'pending',
    approved_by UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    institution_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT purchase_requests_pkey PRIMARY KEY (id)
);

-- performance_appraisals
CREATE TABLE IF NOT EXISTS public.performance_appraisals (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL,
    reviewer_id UUID,
    review_period_start DATE NOT NULL,
    review_period_end DATE NOT NULL,
    overall_rating NUMERIC(3,2),
    goals_achieved TEXT,
    strengths TEXT,
    areas_for_improvement TEXT,
    comments TEXT,
    status TEXT DEFAULT 'draft',
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT performance_appraisals_pkey PRIMARY KEY (id)
);

-- hr_ratings
CREATE TABLE IF NOT EXISTS public.hr_ratings (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    trainer_id UUID NOT NULL,
    trainer_name TEXT NOT NULL,
    employee_id TEXT NOT NULL,
    period TEXT NOT NULL,
    year INTEGER NOT NULL,
    total_stars_quarter INTEGER DEFAULT 0,
    cumulative_stars_year INTEGER DEFAULT 0,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT hr_ratings_pkey PRIMARY KEY (id)
);

-- ----------------------------------------
-- TIER 3: Tables with Multiple FK Dependencies
-- ----------------------------------------

-- students
CREATE TABLE IF NOT EXISTS public.students (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID,
    student_id TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    date_of_birth DATE,
    gender TEXT,
    address JSONB,
    guardian_name TEXT,
    guardian_phone TEXT,
    guardian_email TEXT,
    guardian_relation TEXT,
    institution_id UUID NOT NULL,
    class_id UUID,
    roll_number TEXT,
    admission_date DATE,
    blood_group TEXT,
    medical_conditions TEXT,
    avatar_url TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT students_pkey PRIMARY KEY (id),
    CONSTRAINT students_student_id_key UNIQUE (student_id),
    CONSTRAINT students_user_id_key UNIQUE (user_id)
);

-- institution_timetable_assignments
CREATE TABLE IF NOT EXISTS public.institution_timetable_assignments (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL,
    class_id UUID NOT NULL,
    class_name TEXT NOT NULL,
    period_id UUID NOT NULL,
    day TEXT NOT NULL,
    subject TEXT NOT NULL,
    teacher_id UUID,
    teacher_name TEXT,
    secondary_officer_id UUID,
    secondary_officer_name TEXT,
    backup_officer_id UUID,
    backup_officer_name TEXT,
    room TEXT,
    academic_year TEXT DEFAULT '2024-25',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT institution_timetable_assignments_pkey PRIMARY KEY (id),
    CONSTRAINT institution_timetable_assignm_institution_id_academic_year__key UNIQUE (institution_id, academic_year, day, period_id),
    CONSTRAINT institution_timetable_assignments_day_check CHECK (day = ANY (ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']))
);

-- course_sessions
CREATE TABLE IF NOT EXISTS public.course_sessions (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL,
    module_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    duration_minutes INTEGER,
    learning_objectives JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT course_sessions_pkey PRIMARY KEY (id)
);

-- course_content
CREATE TABLE IF NOT EXISTS public.course_content (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL,
    module_id UUID NOT NULL,
    session_id UUID NOT NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    file_path TEXT,
    youtube_url TEXT,
    duration_minutes INTEGER,
    file_size_mb NUMERIC(10,2),
    display_order INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT course_content_pkey PRIMARY KEY (id)
);

-- course_institution_assignments
CREATE TABLE IF NOT EXISTS public.course_institution_assignments (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL,
    institution_id UUID NOT NULL,
    assigned_by UUID,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT course_institution_assignments_pkey PRIMARY KEY (id),
    CONSTRAINT course_institution_assignments_course_id_institution_id_key UNIQUE (course_id, institution_id)
);

-- course_class_assignments
CREATE TABLE IF NOT EXISTS public.course_class_assignments (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL,
    class_id UUID NOT NULL,
    institution_id UUID NOT NULL,
    assigned_by UUID,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT course_class_assignments_pkey PRIMARY KEY (id),
    CONSTRAINT course_class_assignments_course_id_class_id_key UNIQUE (course_id, class_id)
);

-- class_module_assignments
CREATE TABLE IF NOT EXISTS public.class_module_assignments (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    class_assignment_id UUID NOT NULL,
    module_id UUID NOT NULL,
    unlock_mode TEXT DEFAULT 'sequential',
    unlock_order INTEGER,
    is_unlocked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT class_module_assignments_pkey PRIMARY KEY (id),
    CONSTRAINT class_module_assignments_class_assignment_id_module_id_key UNIQUE (class_assignment_id, module_id)
);

-- class_session_assignments
CREATE TABLE IF NOT EXISTS public.class_session_assignments (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    class_module_assignment_id UUID NOT NULL,
    session_id UUID NOT NULL,
    unlock_mode TEXT DEFAULT 'sequential',
    unlock_order INTEGER,
    is_unlocked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT class_session_assignments_pkey PRIMARY KEY (id),
    CONSTRAINT class_session_assignments_class_module_assignment_id_sessio_key UNIQUE (class_module_assignment_id, session_id)
);

-- officer_documents
CREATE TABLE IF NOT EXISTS public.officer_documents (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    officer_id UUID NOT NULL,
    document_type TEXT NOT NULL,
    document_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    uploaded_by UUID,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expiry_date DATE,
    status TEXT DEFAULT 'active',
    CONSTRAINT officer_documents_pkey PRIMARY KEY (id)
);

-- officer_institution_assignments
CREATE TABLE IF NOT EXISTS public.officer_institution_assignments (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    officer_id UUID NOT NULL,
    institution_id UUID NOT NULL,
    role_at_institution TEXT DEFAULT 'teacher',
    is_primary BOOLEAN DEFAULT false,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT officer_institution_assignments_pkey PRIMARY KEY (id),
    CONSTRAINT officer_institution_assignments_officer_id_institution_id_key UNIQUE (officer_id, institution_id)
);

-- officer_class_access_grants
CREATE TABLE IF NOT EXISTS public.officer_class_access_grants (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    officer_id UUID NOT NULL,
    class_id UUID NOT NULL,
    institution_id UUID NOT NULL,
    access_type TEXT DEFAULT 'view',
    granted_by UUID,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT officer_class_access_grants_pkey PRIMARY KEY (id),
    CONSTRAINT officer_class_access_grants_officer_id_class_id_key UNIQUE (officer_id, class_id)
);

-- assessment_questions
CREATE TABLE IF NOT EXISTS public.assessment_questions (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL,
    question_number INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    question_type TEXT DEFAULT 'multiple_choice',
    options JSONB DEFAULT '[]',
    correct_option_id TEXT NOT NULL,
    explanation TEXT,
    points INTEGER DEFAULT 1,
    image_url TEXT,
    code_snippet TEXT,
    time_limit_seconds INTEGER,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT assessment_questions_pkey PRIMARY KEY (id)
);

-- assessment_class_assignments
CREATE TABLE IF NOT EXISTS public.assessment_class_assignments (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL,
    class_id UUID NOT NULL,
    institution_id UUID NOT NULL,
    assigned_by UUID,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT assessment_class_assignments_pkey PRIMARY KEY (id),
    CONSTRAINT assessment_class_assignments_assessment_id_class_id_key UNIQUE (assessment_id, class_id)
);

-- assignment_class_assignments
CREATE TABLE IF NOT EXISTS public.assignment_class_assignments (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL,
    class_id UUID NOT NULL,
    institution_id UUID NOT NULL,
    assigned_by UUID,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT assignment_class_assignments_pkey PRIMARY KEY (id),
    CONSTRAINT assignment_class_assignments_assignment_id_class_id_key UNIQUE (assignment_id, class_id)
);

-- event_class_assignments
CREATE TABLE IF NOT EXISTS public.event_class_assignments (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL,
    class_id UUID NOT NULL,
    institution_id UUID NOT NULL,
    assigned_by UUID,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT event_class_assignments_pkey PRIMARY KEY (id)
);

-- event_updates
CREATE TABLE IF NOT EXISTS public.event_updates (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    link_url TEXT,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT event_updates_pkey PRIMARY KEY (id)
);

-- job_applications
CREATE TABLE IF NOT EXISTS public.job_applications (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL,
    applicant_name TEXT NOT NULL,
    applicant_email TEXT NOT NULL,
    applicant_phone TEXT,
    resume_url TEXT,
    cover_letter TEXT,
    experience_years INTEGER,
    current_salary NUMERIC(12,2),
    expected_salary NUMERIC(12,2),
    notice_period_days INTEGER,
    current_company TEXT,
    current_designation TEXT,
    skills TEXT[],
    source TEXT DEFAULT 'direct',
    status TEXT DEFAULT 'new',
    rating INTEGER,
    notes TEXT,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT job_applications_pkey PRIMARY KEY (id),
    CONSTRAINT job_applications_rating_check CHECK ((rating >= 1) AND (rating <= 5))
);

-- crm_tasks
CREATE TABLE IF NOT EXISTS public.crm_tasks (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL,
    institution_name TEXT NOT NULL,
    task_type TEXT NOT NULL,
    description TEXT NOT NULL,
    due_date DATE NOT NULL,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'pending',
    assigned_to TEXT NOT NULL,
    assigned_to_id UUID,
    related_contract_id UUID,
    notes TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT crm_tasks_pkey PRIMARY KEY (id)
);

-- crm_contract_documents
CREATE TABLE IF NOT EXISTS public.crm_contract_documents (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL,
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    public_url TEXT NOT NULL,
    file_size INTEGER,
    uploaded_by UUID,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT crm_contract_documents_pkey PRIMARY KEY (id)
);

-- communication_log_attachments
CREATE TABLE IF NOT EXISTS public.communication_log_attachments (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    communication_log_id UUID NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    storage_path TEXT NOT NULL,
    public_url TEXT NOT NULL,
    uploaded_by_id UUID,
    uploaded_by_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT communication_log_attachments_pkey PRIMARY KEY (id)
);

-- invoice_line_items
CREATE TABLE IF NOT EXISTS public.invoice_line_items (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL,
    description TEXT NOT NULL,
    hsn_sac_code TEXT,
    quantity NUMERIC(10,2) DEFAULT 1,
    unit TEXT DEFAULT 'nos',
    rate NUMERIC(12,2) NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT invoice_line_items_pkey PRIMARY KEY (id)
);

-- project_members
CREATE TABLE IF NOT EXISTS public.project_members (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role TEXT DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT project_members_pkey PRIMARY KEY (id),
    CONSTRAINT project_members_project_id_user_id_key UNIQUE (project_id, user_id)
);

-- project_progress_updates
CREATE TABLE IF NOT EXISTS public.project_progress_updates (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    update_text TEXT NOT NULL,
    progress_percentage INTEGER,
    updated_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT project_progress_updates_pkey PRIMARY KEY (id)
);

-- project_achievements
CREATE TABLE IF NOT EXISTS public.project_achievements (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    achieved_at DATE,
    xp_reward INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT project_achievements_pkey PRIMARY KEY (id)
);

-- task_comments
CREATE TABLE IF NOT EXISTS public.task_comments (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL,
    user_id UUID NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT task_comments_pkey PRIMARY KEY (id)
);

-- task_attachments
CREATE TABLE IF NOT EXISTS public.task_attachments (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    uploaded_by UUID,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT task_attachments_pkey PRIMARY KEY (id)
);

-- task_activity_log
CREATE TABLE IF NOT EXISTS public.task_activity_log (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL,
    user_id UUID,
    action TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT task_activity_log_pkey PRIMARY KEY (id)
);

-- daily_work_logs
CREATE TABLE IF NOT EXISTS public.daily_work_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    user_type TEXT DEFAULT 'officer',
    officer_id UUID,
    date DATE NOT NULL,
    tasks_completed TEXT,
    hours_logged NUMERIC(4,2),
    notes TEXT,
    productivity_score INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT daily_work_logs_pkey PRIMARY KEY (id)
);

-- officer_attendance
CREATE TABLE IF NOT EXISTS public.officer_attendance (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    officer_id UUID NOT NULL,
    date DATE NOT NULL,
    check_in_time TIMESTAMP WITH TIME ZONE,
    check_out_time TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'present',
    work_from TEXT DEFAULT 'office',
    notes TEXT,
    approved_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT officer_attendance_pkey PRIMARY KEY (id),
    CONSTRAINT officer_attendance_officer_id_date_key UNIQUE (officer_id, date)
);

-- staff_attendance
CREATE TABLE IF NOT EXISTS public.staff_attendance (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL,
    date DATE NOT NULL,
    check_in_time TIMESTAMP WITH TIME ZONE,
    check_out_time TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'present',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT staff_attendance_pkey PRIMARY KEY (id),
    CONSTRAINT staff_attendance_staff_id_date_key UNIQUE (staff_id, date)
);

-- class_session_attendance
CREATE TABLE IF NOT EXISTS public.class_session_attendance (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL,
    class_id UUID NOT NULL,
    timetable_assignment_id UUID NOT NULL,
    officer_id UUID,
    date DATE NOT NULL,
    period_label TEXT,
    period_time TEXT,
    subject TEXT,
    total_students INTEGER DEFAULT 0,
    students_present INTEGER DEFAULT 0,
    students_absent INTEGER DEFAULT 0,
    students_late INTEGER DEFAULT 0,
    attendance_records JSONB,
    notes TEXT,
    is_session_completed BOOLEAN DEFAULT false,
    completed_by UUID,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT class_session_attendance_pkey PRIMARY KEY (id)
);

-- leave_applications
CREATE TABLE IF NOT EXISTS public.leave_applications (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL,
    leave_type TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_count INTEGER NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'pending',
    approved_by UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT leave_applications_pkey PRIMARY KEY (id)
);

-- leave_balance_adjustments
CREATE TABLE IF NOT EXISTS public.leave_balance_adjustments (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    leave_balance_id UUID NOT NULL,
    adjustment_type TEXT NOT NULL,
    days INTEGER NOT NULL,
    reason TEXT,
    adjusted_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT leave_balance_adjustments_pkey PRIMARY KEY (id)
);

-- overtime_requests
CREATE TABLE IF NOT EXISTS public.overtime_requests (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL,
    date DATE NOT NULL,
    hours NUMERIC(4,2) NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'pending',
    approved_by UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT overtime_requests_pkey PRIMARY KEY (id)
);

-- payroll_records
CREATE TABLE IF NOT EXISTS public.payroll_records (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    basic_salary NUMERIC(12,2),
    hra NUMERIC(12,2),
    conveyance NUMERIC(12,2),
    special_allowance NUMERIC(12,2),
    other_allowances NUMERIC(12,2),
    gross_salary NUMERIC(12,2),
    pf_deduction NUMERIC(12,2),
    esi_deduction NUMERIC(12,2),
    tax_deduction NUMERIC(12,2),
    other_deductions NUMERIC(12,2),
    total_deductions NUMERIC(12,2),
    net_salary NUMERIC(12,2),
    working_days INTEGER,
    present_days INTEGER,
    leave_days INTEGER,
    status TEXT DEFAULT 'draft',
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT payroll_records_pkey PRIMARY KEY (id),
    CONSTRAINT payroll_records_employee_id_month_year_key UNIQUE (employee_id, month, year)
);

-- inventory_issues
CREATE TABLE IF NOT EXISTS public.inventory_issues (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL,
    quantity_issued INTEGER NOT NULL,
    issued_to TEXT NOT NULL,
    issued_by UUID,
    purpose TEXT,
    issue_date DATE DEFAULT CURRENT_DATE,
    return_date DATE,
    status TEXT DEFAULT 'issued',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT inventory_issues_pkey PRIMARY KEY (id)
);

-- purchase_approval_chain
CREATE TABLE IF NOT EXISTS public.purchase_approval_chain (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL,
    approver_id UUID NOT NULL,
    approval_level INTEGER DEFAULT 1,
    status TEXT DEFAULT 'pending',
    comments TEXT,
    acted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT purchase_approval_chain_pkey PRIMARY KEY (id)
);

-- appraisal_projects
CREATE TABLE IF NOT EXISTS public.appraisal_projects (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    appraisal_id UUID NOT NULL,
    project_title TEXT NOT NULL,
    grade_level TEXT,
    domain TEXT,
    contest_name TEXT,
    level TEXT,
    result TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT appraisal_projects_pkey PRIMARY KEY (id)
);

-- hr_rating_projects
CREATE TABLE IF NOT EXISTS public.hr_rating_projects (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    hr_rating_id UUID NOT NULL,
    project_title TEXT NOT NULL,
    competition_level TEXT,
    result TEXT,
    stars_earned INTEGER,
    verified_by_hr BOOLEAN DEFAULT false,
    verified_by UUID,
    verified_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT hr_rating_projects_pkey PRIMARY KEY (id)
);

-- candidate_interviews
CREATE TABLE IF NOT EXISTS public.candidate_interviews (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    application_id UUID,
    stage_id UUID,
    interview_type TEXT DEFAULT 'in_person',
    scheduled_date DATE,
    scheduled_time TIME,
    duration_minutes INTEGER DEFAULT 60,
    interviewer_ids TEXT[],
    interviewer_names TEXT[],
    meeting_link TEXT,
    location TEXT,
    status TEXT DEFAULT 'scheduled',
    result TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT candidate_interviews_pkey PRIMARY KEY (id)
);

-- interview_feedback
CREATE TABLE IF NOT EXISTS public.interview_feedback (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    interview_id UUID NOT NULL,
    interviewer_id UUID,
    overall_rating INTEGER,
    technical_rating INTEGER,
    communication_rating INTEGER,
    cultural_fit_rating INTEGER,
    strengths TEXT,
    weaknesses TEXT,
    recommendation TEXT,
    detailed_feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT interview_feedback_pkey PRIMARY KEY (id),
    CONSTRAINT interview_feedback_overall_rating_check CHECK ((overall_rating >= 1) AND (overall_rating <= 5)),
    CONSTRAINT interview_feedback_technical_rating_check CHECK ((technical_rating >= 1) AND (technical_rating <= 5)),
    CONSTRAINT interview_feedback_communication_rating_check CHECK ((communication_rating >= 1) AND (communication_rating <= 5)),
    CONSTRAINT interview_feedback_cultural_fit_rating_check CHECK ((cultural_fit_rating >= 1) AND (cultural_fit_rating <= 5))
);

-- candidate_offers
CREATE TABLE IF NOT EXISTS public.candidate_offers (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    application_id UUID,
    job_title TEXT NOT NULL,
    department TEXT,
    offered_salary NUMERIC(12,2) NOT NULL,
    joining_date DATE,
    probation_period_months INTEGER DEFAULT 3,
    benefits TEXT,
    offer_letter_url TEXT,
    status TEXT DEFAULT 'draft',
    sent_at TIMESTAMP WITH TIME ZONE,
    expiry_date DATE,
    responded_at TIMESTAMP WITH TIME ZONE,
    candidate_response_notes TEXT,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT candidate_offers_pkey PRIMARY KEY (id)
);

-- survey_responses
CREATE TABLE IF NOT EXISTS public.survey_responses (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL,
    respondent_id UUID,
    respondent_type TEXT DEFAULT 'student',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    is_complete BOOLEAN DEFAULT false,
    CONSTRAINT survey_responses_pkey PRIMARY KEY (id)
);

-- survey_response_answers
CREATE TABLE IF NOT EXISTS public.survey_response_answers (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    response_id UUID NOT NULL,
    question_id UUID NOT NULL,
    answer_text TEXT,
    answer_options JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT survey_response_answers_pkey PRIMARY KEY (id)
);

-- ----------------------------------------
-- TIER 4: Student/Assessment Related Tables
-- ----------------------------------------

-- assessment_attempts
CREATE TABLE IF NOT EXISTS public.assessment_attempts (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL,
    student_id UUID NOT NULL,
    class_id UUID NOT NULL,
    institution_id UUID NOT NULL,
    status TEXT DEFAULT 'in_progress',
    score INTEGER DEFAULT 0,
    total_points INTEGER DEFAULT 0,
    percentage NUMERIC(5,2) DEFAULT 0,
    passed BOOLEAN DEFAULT false,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    submitted_at TIMESTAMP WITH TIME ZONE,
    time_taken_seconds INTEGER,
    question_order JSONB,
    is_manual BOOLEAN DEFAULT false,
    manual_notes TEXT,
    conducted_at TIMESTAMP WITH TIME ZONE,
    retake_allowed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT assessment_attempts_pkey PRIMARY KEY (id)
);

-- assessment_answers
CREATE TABLE IF NOT EXISTS public.assessment_answers (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL,
    question_id UUID NOT NULL,
    selected_option_id TEXT,
    is_correct BOOLEAN DEFAULT false,
    points_earned INTEGER DEFAULT 0,
    time_spent_seconds INTEGER DEFAULT 0,
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT assessment_answers_pkey PRIMARY KEY (id),
    CONSTRAINT assessment_answers_attempt_id_question_id_key UNIQUE (attempt_id, question_id)
);

-- assignment_submissions
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL,
    student_id UUID NOT NULL,
    class_id UUID NOT NULL,
    institution_id UUID NOT NULL,
    submission_pdf_url TEXT NOT NULL,
    status TEXT DEFAULT 'submitted',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    marks_obtained INTEGER,
    feedback TEXT,
    graded_by UUID,
    graded_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT assignment_submissions_pkey PRIMARY KEY (id),
    CONSTRAINT assignment_submissions_assignment_id_student_id_key UNIQUE (assignment_id, student_id)
);

-- event_interests
CREATE TABLE IF NOT EXISTS public.event_interests (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL,
    student_id UUID NOT NULL,
    institution_id UUID NOT NULL,
    class_id UUID,
    student_name TEXT,
    class_name TEXT,
    section TEXT,
    institution_name TEXT,
    email TEXT,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT event_interests_pkey PRIMARY KEY (id)
);

-- student_content_completions
CREATE TABLE IF NOT EXISTS public.student_content_completions (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    content_id UUID NOT NULL,
    session_id UUID NOT NULL,
    module_id UUID NOT NULL,
    course_id UUID NOT NULL,
    class_id UUID NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    time_spent_seconds INTEGER DEFAULT 0,
    CONSTRAINT student_content_completions_pkey PRIMARY KEY (id),
    CONSTRAINT student_content_completions_student_id_content_id_key UNIQUE (student_id, content_id)
);

-- student_certificates
CREATE TABLE IF NOT EXISTS public.student_certificates (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    template_id UUID NOT NULL,
    course_id UUID,
    module_id UUID,
    assessment_id UUID,
    certificate_number TEXT,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    certificate_url TEXT,
    metadata JSONB,
    CONSTRAINT student_certificates_pkey PRIMARY KEY (id)
);

-- student_feedback
CREATE TABLE IF NOT EXISTS public.student_feedback (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    feedback_type TEXT DEFAULT 'general',
    subject TEXT,
    message TEXT NOT NULL,
    rating INTEGER,
    status TEXT DEFAULT 'pending',
    response TEXT,
    responded_by UUID,
    responded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT student_feedback_pkey PRIMARY KEY (id),
    CONSTRAINT student_feedback_rating_check CHECK ((rating >= 1) AND (rating <= 5))
);

-- student_xp_transactions
CREATE TABLE IF NOT EXISTS public.student_xp_transactions (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    xp_amount INTEGER NOT NULL,
    source_type TEXT NOT NULL,
    source_id UUID,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT student_xp_transactions_pkey PRIMARY KEY (id)
);

-- student_badges
CREATE TABLE IF NOT EXISTS public.student_badges (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    badge_id UUID NOT NULL,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT student_badges_pkey PRIMARY KEY (id),
    CONSTRAINT student_badges_student_id_badge_id_key UNIQUE (student_id, badge_id)
);

-- student_streaks
CREATE TABLE IF NOT EXISTS public.student_streaks (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    streak_start_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT student_streaks_pkey PRIMARY KEY (id),
    CONSTRAINT student_streaks_student_id_key UNIQUE (student_id)
);

-- ============================================
-- PART 5: FOREIGN KEY CONSTRAINTS
-- ============================================

-- Profiles FK
ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey 
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_institution_id_fkey 
    FOREIGN KEY (institution_id) REFERENCES public.institutions(id);
ALTER TABLE public.profiles ADD CONSTRAINT profiles_position_id_fkey 
    FOREIGN KEY (position_id) REFERENCES public.positions(id) ON DELETE SET NULL;

-- User Roles FK
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Institutions FK
ALTER TABLE public.institutions ADD CONSTRAINT institutions_admin_user_id_fkey 
    FOREIGN KEY (admin_user_id) REFERENCES auth.users(id);

-- Classes FK
ALTER TABLE public.classes ADD CONSTRAINT classes_institution_id_fkey 
    FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;

-- Students FK
ALTER TABLE public.students ADD CONSTRAINT students_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.students ADD CONSTRAINT students_institution_id_fkey 
    FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;
ALTER TABLE public.students ADD CONSTRAINT students_class_id_fkey 
    FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE SET NULL;

-- Institution Periods FK
ALTER TABLE public.institution_periods ADD CONSTRAINT institution_periods_institution_id_fkey 
    FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;

-- Institution Holidays FK
ALTER TABLE public.institution_holidays ADD CONSTRAINT institution_holidays_institution_id_fkey 
    FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;

-- Calendar Day Types FK
ALTER TABLE public.calendar_day_types ADD CONSTRAINT calendar_day_types_institution_id_fkey 
    FOREIGN KEY (institution_id) REFERENCES public.institutions(id);

-- ID Counters FK
ALTER TABLE public.id_counters ADD CONSTRAINT id_counters_institution_id_fkey 
    FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;

-- Officers FK
ALTER TABLE public.officers ADD CONSTRAINT officers_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Officer Documents FK
ALTER TABLE public.officer_documents ADD CONSTRAINT officer_documents_officer_id_fkey 
    FOREIGN KEY (officer_id) REFERENCES public.officers(id) ON DELETE CASCADE;
ALTER TABLE public.officer_documents ADD CONSTRAINT officer_documents_uploaded_by_fkey 
    FOREIGN KEY (uploaded_by) REFERENCES auth.users(id);

-- Officer Institution Assignments FK
ALTER TABLE public.officer_institution_assignments ADD CONSTRAINT officer_institution_assignments_officer_id_fkey 
    FOREIGN KEY (officer_id) REFERENCES public.officers(id) ON DELETE CASCADE;
ALTER TABLE public.officer_institution_assignments ADD CONSTRAINT officer_institution_assignments_institution_id_fkey 
    FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;

-- Officer Class Access Grants FK
ALTER TABLE public.officer_class_access_grants ADD CONSTRAINT officer_class_access_grants_officer_id_fkey 
    FOREIGN KEY (officer_id) REFERENCES public.officers(id) ON DELETE CASCADE;
ALTER TABLE public.officer_class_access_grants ADD CONSTRAINT officer_class_access_grants_class_id_fkey 
    FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;
ALTER TABLE public.officer_class_access_grants ADD CONSTRAINT officer_class_access_grants_institution_id_fkey 
    FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;

-- Institution Timetable Assignments FK
ALTER TABLE public.institution_timetable_assignments ADD CONSTRAINT institution_timetable_assignments_institution_id_fkey 
    FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;
ALTER TABLE public.institution_timetable_assignments ADD CONSTRAINT institution_timetable_assignments_class_id_fkey 
    FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;
ALTER TABLE public.institution_timetable_assignments ADD CONSTRAINT institution_timetable_assignments_period_id_fkey 
    FOREIGN KEY (period_id) REFERENCES public.institution_periods(id) ON DELETE CASCADE;

-- Course Modules FK
ALTER TABLE public.course_modules ADD CONSTRAINT course_modules_course_id_fkey 
    FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;

-- Course Sessions FK
ALTER TABLE public.course_sessions ADD CONSTRAINT course_sessions_course_id_fkey 
    FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;
ALTER TABLE public.course_sessions ADD CONSTRAINT course_sessions_module_id_fkey 
    FOREIGN KEY (module_id) REFERENCES public.course_modules(id) ON DELETE CASCADE;

-- Course Content FK
ALTER TABLE public.course_content ADD CONSTRAINT course_content_course_id_fkey 
    FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;
ALTER TABLE public.course_content ADD CONSTRAINT course_content_module_id_fkey 
    FOREIGN KEY (module_id) REFERENCES public.course_modules(id) ON DELETE CASCADE;
ALTER TABLE public.course_content ADD CONSTRAINT course_content_session_id_fkey 
    FOREIGN KEY (session_id) REFERENCES public.course_sessions(id) ON DELETE CASCADE;

-- Course Institution Assignments FK
ALTER TABLE public.course_institution_assignments ADD CONSTRAINT course_institution_assignments_course_id_fkey 
    FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;
ALTER TABLE public.course_institution_assignments ADD CONSTRAINT course_institution_assignments_institution_id_fkey 
    FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;

-- Course Class Assignments FK
ALTER TABLE public.course_class_assignments ADD CONSTRAINT course_class_assignments_course_id_fkey 
    FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;
ALTER TABLE public.course_class_assignments ADD CONSTRAINT course_class_assignments_class_id_fkey 
    FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;
ALTER TABLE public.course_class_assignments ADD CONSTRAINT course_class_assignments_institution_id_fkey 
    FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;

-- Class Module Assignments FK
ALTER TABLE public.class_module_assignments ADD CONSTRAINT class_module_assignments_class_assignment_id_fkey 
    FOREIGN KEY (class_assignment_id) REFERENCES public.course_class_assignments(id) ON DELETE CASCADE;
ALTER TABLE public.class_module_assignments ADD CONSTRAINT class_module_assignments_module_id_fkey 
    FOREIGN KEY (module_id) REFERENCES public.course_modules(id) ON DELETE CASCADE;

-- Class Session Assignments FK
ALTER TABLE public.class_session_assignments ADD CONSTRAINT class_session_assignments_class_module_assignment_id_fkey 
    FOREIGN KEY (class_module_assignment_id) REFERENCES public.class_module_assignments(id) ON DELETE CASCADE;
ALTER TABLE public.class_session_assignments ADD CONSTRAINT class_session_assignments_session_id_fkey 
    FOREIGN KEY (session_id) REFERENCES public.course_sessions(id) ON DELETE CASCADE;

-- Certificate Templates FK
ALTER TABLE public.certificate_templates ADD CONSTRAINT certificate_templates_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES public.profiles(id);

-- Gamification Badges FK
ALTER TABLE public.gamification_badges ADD CONSTRAINT gamification_badges_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES public.profiles(id);

-- Assessments FK
ALTER TABLE public.assessments ADD CONSTRAINT assessments_institution_id_fkey 
    FOREIGN KEY (institution_id) REFERENCES public.institutions(id);
ALTER TABLE public.assessments ADD CONSTRAINT assessments_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES public.profiles(id);

-- Assessment Questions FK
ALTER TABLE public.assessment_questions ADD CONSTRAINT assessment_questions_assessment_id_fkey 
    FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE CASCADE;

-- Assessment Class Assignments FK
ALTER TABLE public.assessment_class_assignments ADD CONSTRAINT assessment_class_assignments_assessment_id_fkey 
    FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE CASCADE;
ALTER TABLE public.assessment_class_assignments ADD CONSTRAINT assessment_class_assignments_class_id_fkey 
    FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;
ALTER TABLE public.assessment_class_assignments ADD CONSTRAINT assessment_class_assignments_institution_id_fkey 
    FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;
ALTER TABLE public.assessment_class_assignments ADD CONSTRAINT assessment_class_assignments_assigned_by_fkey 
    FOREIGN KEY (assigned_by) REFERENCES public.profiles(id);

-- Assessment Attempts FK
ALTER TABLE public.assessment_attempts ADD CONSTRAINT assessment_attempts_assessment_id_fkey 
    FOREIGN KEY (assessment_id) REFERENCES public.assessments(id) ON DELETE CASCADE;
ALTER TABLE public.assessment_attempts ADD CONSTRAINT assessment_attempts_student_id_fkey 
    FOREIGN KEY (student_id) REFERENCES public.profiles(id);
ALTER TABLE public.assessment_attempts ADD CONSTRAINT assessment_attempts_class_id_fkey 
    FOREIGN KEY (class_id) REFERENCES public.classes(id);
ALTER TABLE public.assessment_attempts ADD CONSTRAINT assessment_attempts_institution_id_fkey 
    FOREIGN KEY (institution_id) REFERENCES public.institutions(id);

-- Assessment Answers FK
ALTER TABLE public.assessment_answers ADD CONSTRAINT assessment_answers_attempt_id_fkey 
    FOREIGN KEY (attempt_id) REFERENCES public.assessment_attempts(id) ON DELETE CASCADE;
ALTER TABLE public.assessment_answers ADD CONSTRAINT assessment_answers_question_id_fkey 
    FOREIGN KEY (question_id) REFERENCES public.assessment_questions(id) ON DELETE CASCADE;

-- Assignments FK
ALTER TABLE public.assignments ADD CONSTRAINT assignments_institution_id_fkey 
    FOREIGN KEY (institution_id) REFERENCES public.institutions(id);

-- Assignment Class Assignments FK
ALTER TABLE public.assignment_class_assignments ADD CONSTRAINT assignment_class_assignments_assignment_id_fkey 
    FOREIGN KEY (assignment_id) REFERENCES public.assignments(id) ON DELETE CASCADE;
ALTER TABLE public.assignment_class_assignments ADD CONSTRAINT assignment_class_assignments_class_id_fkey 
    FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;
ALTER TABLE public.assignment_class_assignments ADD CONSTRAINT assignment_class_assignments_institution_id_fkey 
    FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;

-- Assignment Submissions FK
ALTER TABLE public.assignment_submissions ADD CONSTRAINT assignment_submissions_assignment_id_fkey 
    FOREIGN KEY (assignment_id) REFERENCES public.assignments(id) ON DELETE CASCADE;
ALTER TABLE public.assignment_submissions ADD CONSTRAINT assignment_submissions_class_id_fkey 
    FOREIGN KEY (class_id) REFERENCES public.classes(id);
ALTER TABLE public.assignment_submissions ADD CONSTRAINT assignment_submissions_institution_id_fkey 
    FOREIGN KEY (institution_id) REFERENCES public.institutions(id);

-- Events FK
-- (No FK - base table)

-- Event Class Assignments FK
ALTER TABLE public.event_class_assignments ADD CONSTRAINT event_class_assignments_event_id_fkey 
    FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;
ALTER TABLE public.event_class_assignments ADD CONSTRAINT event_class_assignments_class_id_fkey 
    FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;
ALTER TABLE public.event_class_assignments ADD CONSTRAINT event_class_assignments_institution_id_fkey 
    FOREIGN KEY (institution_id) REFERENCES public.institutions(id) ON DELETE CASCADE;

-- Event Updates FK
ALTER TABLE public.event_updates ADD CONSTRAINT event_updates_event_id_fkey 
    FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;

-- Event Interests FK
ALTER TABLE public.event_interests ADD CONSTRAINT event_interests_event_id_fkey 
    FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;
ALTER TABLE public.event_interests ADD CONSTRAINT event_interests_institution_id_fkey 
    FOREIGN KEY (institution_id) REFERENCES public.institutions(id);
ALTER TABLE public.event_interests ADD CONSTRAINT event_interests_class_id_fkey 
    FOREIGN KEY (class_id) REFERENCES public.classes(id);

-- Surveys FK
ALTER TABLE public.surveys ADD CONSTRAINT surveys_institution_id_fkey 
    FOREIGN KEY (institution_id) REFERENCES public.institutions(id);

-- Survey Questions FK
ALTER TABLE public.survey_questions ADD CONSTRAINT survey_questions_survey_id_fkey 
    FOREIGN KEY (survey_id) REFERENCES public.surveys(id) ON DELETE CASCADE;

-- Survey Responses FK
ALTER TABLE public.survey_responses ADD CONSTRAINT survey_responses_survey_id_fkey 
    FOREIGN KEY (survey_id) REFERENCES public.surveys(id) ON DELETE CASCADE;

-- Survey Response Answers FK
ALTER TABLE public.survey_response_answers ADD CONSTRAINT survey_response_answers_response_id_fkey 
    FOREIGN KEY (response_id) REFERENCES public.survey_responses(id) ON DELETE CASCADE;
ALTER TABLE public.survey_response_answers ADD CONSTRAINT survey_response_answers_question_id_fkey 
    FOREIGN KEY (question_id) REFERENCES public.survey_questions(id) ON DELETE CASCADE;

-- Class Session Attendance FK
ALTER TABLE public.class_session_attendance ADD CONSTRAINT class_session_attendance_institution_id_fkey 
    FOREIGN KEY (institution_id) REFERENCES public.institutions(id);
ALTER TABLE public.class_session_attendance ADD CONSTRAINT class_session_attendance_class_id_fkey 
    FOREIGN KEY (class_id) REFERENCES public.classes(id);
ALTER TABLE public.class_session_attendance ADD CONSTRAINT class_session_attendance_timetable_assignment_id_fkey 
    FOREIGN KEY (timetable_assignment_id) REFERENCES public.institution_timetable_assignments(id);
ALTER TABLE public.class_session_attendance ADD CONSTRAINT class_session_attendance_officer_id_fkey 
    FOREIGN KEY (officer_id) REFERENCES public.officers(id);
ALTER TABLE public.class_session_attendance ADD CONSTRAINT class_session_attendance_completed_by_fkey 
    FOREIGN KEY (completed_by) REFERENCES public.officers(id);

-- Officer Attendance FK
ALTER TABLE public.officer_attendance ADD CONSTRAINT officer_attendance_officer_id_fkey 
    FOREIGN KEY (officer_id) REFERENCES public.officers(id) ON DELETE CASCADE;

-- Daily Work Logs FK
ALTER TABLE public.daily_work_logs ADD CONSTRAINT daily_work_logs_officer_id_fkey 
    FOREIGN KEY (officer_id) REFERENCES public.officers(id);

-- Leave Applications FK
ALTER TABLE public.leave_applications ADD CONSTRAINT leave_applications_employee_id_fkey 
    FOREIGN KEY (employee_id) REFERENCES public.officers(id) ON DELETE CASCADE;

-- Leave Balances FK
ALTER TABLE public.leave_balances ADD CONSTRAINT leave_balances_employee_id_fkey 
    FOREIGN KEY (employee_id) REFERENCES public.officers(id) ON DELETE CASCADE;

-- Leave Balance Adjustments FK
ALTER TABLE public.leave_balance_adjustments ADD CONSTRAINT leave_balance_adjustments_leave_balance_id_fkey 
    FOREIGN KEY (leave_balance_id) REFERENCES public.leave_balances(id) ON DELETE CASCADE;

-- Leave Approval Hierarchy FK
ALTER TABLE public.leave_approval_hierarchy ADD CONSTRAINT leave_approval_hierarchy_employee_id_fkey 
    FOREIGN KEY (employee_id) REFERENCES public.officers(id) ON DELETE CASCADE;
ALTER TABLE public.leave_approval_hierarchy ADD CONSTRAINT leave_approval_hierarchy_approver_id_fkey 
    FOREIGN KEY (approver_id) REFERENCES public.officers(id) ON DELETE CASCADE;

-- Overtime Requests FK
ALTER TABLE public.overtime_requests ADD CONSTRAINT overtime_requests_employee_id_fkey 
    FOREIGN KEY (employee_id) REFERENCES public.officers(id) ON DELETE CASCADE;

-- Payroll Records FK
ALTER TABLE public.payroll_records ADD CONSTRAINT payroll_records_employee_id_fkey 
    FOREIGN KEY (employee_id) REFERENCES public.officers(id) ON DELETE CASCADE;

-- Tasks FK
ALTER TABLE public.tasks ADD CONSTRAINT tasks_project_id_fkey 
    FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_institution_id_fkey 
    FOREIGN KEY (institution_id) REFERENCES public.institutions(id);

-- Task Comments FK
ALTER TABLE public.task_comments ADD CONSTRAINT task_comments_task_id_fkey 
    FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;

-- Task Attachments FK
ALTER TABLE public.task_attachments ADD CONSTRAINT task_attachments_task_id_fkey 
    FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;

-- Task Activity Log FK
ALTER TABLE public.task_activity_log ADD CONSTRAINT task_activity_log_task_id_fkey 
    FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;

-- Projects FK
ALTER TABLE public.projects ADD CONSTRAINT projects_institution_id_fkey 
    FOREIGN KEY (institution_id) REFERENCES public.institutions(id);

-- Project Members FK
ALTER TABLE public.project_members ADD CONSTRAINT project_members_project_id_fkey 
    FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

-- Project Progress Updates FK
ALTER TABLE public.project_progress_updates ADD CONSTRAINT project_progress_updates_project_id_fkey 
    FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

-- Project Achievements FK
ALTER TABLE public.project_achievements ADD CONSTRAINT project_achievements_project_id_fkey 
    FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

-- HR Ratings FK
ALTER TABLE public.hr_ratings ADD CONSTRAINT hr_ratings_trainer_id_fkey 
    FOREIGN KEY (trainer_id) REFERENCES public.officers(id);
ALTER TABLE public.hr_ratings ADD CONSTRAINT hr_ratings_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES public.profiles(id);

-- HR Rating Projects FK
ALTER TABLE public.hr_rating_projects ADD CONSTRAINT hr_rating_projects_hr_rating_id_fkey 
    FOREIGN KEY (hr_rating_id) REFERENCES public.hr_ratings(id) ON DELETE CASCADE;
ALTER TABLE public.hr_rating_projects ADD CONSTRAINT hr_rating_projects_verified_by_fkey 
    FOREIGN KEY (verified_by) REFERENCES public.profiles(id);

-- Performance Appraisals FK
ALTER TABLE public.performance_appraisals ADD CONSTRAINT performance_appraisals_employee_id_fkey 
    FOREIGN KEY (employee_id) REFERENCES public.officers(id) ON DELETE CASCADE;

-- Appraisal Projects FK
ALTER TABLE public.appraisal_projects ADD CONSTRAINT appraisal_projects_appraisal_id_fkey 
    FOREIGN KEY (appraisal_id) REFERENCES public.performance_appraisals(id) ON DELETE CASCADE;

-- Invoices FK
ALTER TABLE public.invoices ADD CONSTRAINT invoices_company_profile_id_fkey 
    FOREIGN KEY (company_profile_id) REFERENCES public.company_profiles(id);

-- Invoice Line Items FK
ALTER TABLE public.invoice_line_items ADD CONSTRAINT invoice_line_items_invoice_id_fkey 
    FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE;

-- Inventory Items FK
ALTER TABLE public.inventory_items ADD CONSTRAINT inventory_items_institution_id_fkey 
    FOREIGN KEY (institution_id) REFERENCES public.institutions(id);

-- Inventory Issues FK
ALTER TABLE public.inventory_issues ADD CONSTRAINT inventory_issues_item_id_fkey 
    FOREIGN KEY (item_id) REFERENCES public.inventory_items(id) ON DELETE CASCADE;

-- Purchase Requests FK
ALTER TABLE public.purchase_requests ADD CONSTRAINT purchase_requests_institution_id_fkey 
    FOREIGN KEY (institution_id) REFERENCES public.institutions(id);

-- Purchase Approval Chain FK
ALTER TABLE public.purchase_approval_chain ADD CONSTRAINT purchase_approval_chain_request_id_fkey 
    FOREIGN KEY (request_id) REFERENCES public.purchase_requests(id) ON DELETE CASCADE;

-- Job Postings FK
-- (No FK - base table)

-- Interview Stages FK
ALTER TABLE public.interview_stages ADD CONSTRAINT interview_stages_job_id_fkey 
    FOREIGN KEY (job_id) REFERENCES public.job_postings(id) ON DELETE CASCADE;

-- Job Applications FK
ALTER TABLE public.job_applications ADD CONSTRAINT job_applications_job_id_fkey 
    FOREIGN KEY (job_id) REFERENCES public.job_postings(id) ON DELETE CASCADE;

-- Candidate Interviews FK
ALTER TABLE public.candidate_interviews ADD CONSTRAINT candidate_interviews_application_id_fkey 
    FOREIGN KEY (application_id) REFERENCES public.job_applications(id) ON DELETE CASCADE;
ALTER TABLE public.candidate_interviews ADD CONSTRAINT candidate_interviews_stage_id_fkey 
    FOREIGN KEY (stage_id) REFERENCES public.interview_stages(id);

-- Interview Feedback FK
ALTER TABLE public.interview_feedback ADD CONSTRAINT interview_feedback_interview_id_fkey 
    FOREIGN KEY (interview_id) REFERENCES public.candidate_interviews(id) ON DELETE CASCADE;

-- Candidate Offers FK
ALTER TABLE public.candidate_offers ADD CONSTRAINT candidate_offers_application_id_fkey 
    FOREIGN KEY (application_id) REFERENCES public.job_applications(id) ON DELETE CASCADE;

-- CRM Contracts FK
ALTER TABLE public.crm_contracts ADD CONSTRAINT crm_contracts_institution_id_fkey 
    FOREIGN KEY (institution_id) REFERENCES public.institutions(id);
ALTER TABLE public.crm_contracts ADD CONSTRAINT crm_contracts_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES public.profiles(id);

-- CRM Contract Documents FK
ALTER TABLE public.crm_contract_documents ADD CONSTRAINT crm_contract_documents_contract_id_fkey 
    FOREIGN KEY (contract_id) REFERENCES public.crm_contracts(id) ON DELETE CASCADE;
ALTER TABLE public.crm_contract_documents ADD CONSTRAINT crm_contract_documents_uploaded_by_fkey 
    FOREIGN KEY (uploaded_by) REFERENCES public.profiles(id);

-- CRM Tasks FK
ALTER TABLE public.crm_tasks ADD CONSTRAINT crm_tasks_institution_id_fkey 
    FOREIGN KEY (institution_id) REFERENCES public.institutions(id);
ALTER TABLE public.crm_tasks ADD CONSTRAINT crm_tasks_related_contract_id_fkey 
    FOREIGN KEY (related_contract_id) REFERENCES public.crm_contracts(id);
ALTER TABLE public.crm_tasks ADD CONSTRAINT crm_tasks_assigned_to_id_fkey 
    FOREIGN KEY (assigned_to_id) REFERENCES public.profiles(id);
ALTER TABLE public.crm_tasks ADD CONSTRAINT crm_tasks_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES public.profiles(id);

-- Communication Logs FK
ALTER TABLE public.communication_logs ADD CONSTRAINT communication_logs_institution_id_fkey 
    FOREIGN KEY (institution_id) REFERENCES public.institutions(id);

-- Communication Log Attachments FK
ALTER TABLE public.communication_log_attachments ADD CONSTRAINT communication_log_attachments_communication_log_id_fkey 
    FOREIGN KEY (communication_log_id) REFERENCES public.communication_logs(id) ON DELETE CASCADE;

-- Student Content Completions FK
ALTER TABLE public.student_content_completions ADD CONSTRAINT student_content_completions_content_id_fkey 
    FOREIGN KEY (content_id) REFERENCES public.course_content(id) ON DELETE CASCADE;
ALTER TABLE public.student_content_completions ADD CONSTRAINT student_content_completions_session_id_fkey 
    FOREIGN KEY (session_id) REFERENCES public.course_sessions(id) ON DELETE CASCADE;
ALTER TABLE public.student_content_completions ADD CONSTRAINT student_content_completions_module_id_fkey 
    FOREIGN KEY (module_id) REFERENCES public.course_modules(id) ON DELETE CASCADE;
ALTER TABLE public.student_content_completions ADD CONSTRAINT student_content_completions_course_id_fkey 
    FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;
ALTER TABLE public.student_content_completions ADD CONSTRAINT student_content_completions_class_id_fkey 
    FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;

-- Student Certificates FK
ALTER TABLE public.student_certificates ADD CONSTRAINT student_certificates_template_id_fkey 
    FOREIGN KEY (template_id) REFERENCES public.certificate_templates(id);
ALTER TABLE public.student_certificates ADD CONSTRAINT student_certificates_course_id_fkey 
    FOREIGN KEY (course_id) REFERENCES public.courses(id);
ALTER TABLE public.student_certificates ADD CONSTRAINT student_certificates_module_id_fkey 
    FOREIGN KEY (module_id) REFERENCES public.course_modules(id);
ALTER TABLE public.student_certificates ADD CONSTRAINT student_certificates_assessment_id_fkey 
    FOREIGN KEY (assessment_id) REFERENCES public.assessments(id);

-- Student Badges FK
ALTER TABLE public.student_badges ADD CONSTRAINT student_badges_badge_id_fkey 
    FOREIGN KEY (badge_id) REFERENCES public.gamification_badges(id) ON DELETE CASCADE;

-- ============================================
-- PART 6: INDEXES (Performance Optimization)
-- ============================================

-- AI Prompt Usage
CREATE INDEX IF NOT EXISTS idx_ai_prompt_usage_user_month_year ON public.ai_prompt_usage(user_id, month, year);

-- Appraisal Projects
CREATE INDEX IF NOT EXISTS idx_appraisal_projects_appraisal ON public.appraisal_projects(appraisal_id);

-- Assessment Answers
CREATE INDEX IF NOT EXISTS idx_assessment_answers_attempt_id ON public.assessment_answers(attempt_id);

-- Assessment Attempts
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_assessment_id ON public.assessment_attempts(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_student_id ON public.assessment_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_status ON public.assessment_attempts(status);

-- Assessment Class Assignments
CREATE INDEX IF NOT EXISTS idx_assessment_class_assignments_assessment_id ON public.assessment_class_assignments(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_class_assignments_class_id ON public.assessment_class_assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_assessment_class_assignments_institution_id ON public.assessment_class_assignments(institution_id);

-- Assessment Questions
CREATE INDEX IF NOT EXISTS idx_assessment_questions_assessment_id ON public.assessment_questions(assessment_id);

-- Assessments
CREATE INDEX IF NOT EXISTS idx_assessments_institution_id ON public.assessments(institution_id);
CREATE INDEX IF NOT EXISTS idx_assessments_created_by ON public.assessments(created_by);
CREATE INDEX IF NOT EXISTS idx_assessments_status ON public.assessments(status);

-- Assignment Class Assignments
CREATE INDEX IF NOT EXISTS idx_assignment_class_assignments_assignment_id ON public.assignment_class_assignments(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_class_assignments_class_id ON public.assignment_class_assignments(class_id);

-- Assignment Submissions
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment_id ON public.assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_student_id ON public.assignment_submissions(student_id);

-- Assignments
CREATE INDEX IF NOT EXISTS idx_assignments_institution_id ON public.assignments(institution_id);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON public.assignments(status);

-- Calendar Day Types
CREATE INDEX IF NOT EXISTS idx_calendar_day_types_date ON public.calendar_day_types(date);
CREATE INDEX IF NOT EXISTS idx_calendar_day_types_institution ON public.calendar_day_types(institution_id);

-- Class Session Attendance
CREATE INDEX IF NOT EXISTS idx_class_session_attendance_class_date ON public.class_session_attendance(class_id, date);
CREATE INDEX IF NOT EXISTS idx_class_session_attendance_institution ON public.class_session_attendance(institution_id);

-- Classes
CREATE INDEX IF NOT EXISTS idx_classes_institution_id ON public.classes(institution_id);

-- Communication Logs
CREATE INDEX IF NOT EXISTS idx_communication_logs_institution ON public.communication_logs(institution_id);
CREATE INDEX IF NOT EXISTS idx_communication_logs_date ON public.communication_logs(date);

-- Course Class Assignments
CREATE INDEX IF NOT EXISTS idx_course_class_assignments_course_id ON public.course_class_assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_class_assignments_class_id ON public.course_class_assignments(class_id);

-- Course Content
CREATE INDEX IF NOT EXISTS idx_course_content_session_id ON public.course_content(session_id);

-- Course Institution Assignments
CREATE INDEX IF NOT EXISTS idx_course_institution_assignments_course_id ON public.course_institution_assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_institution_assignments_institution_id ON public.course_institution_assignments(institution_id);

-- Course Modules
CREATE INDEX IF NOT EXISTS idx_course_modules_course_id ON public.course_modules(course_id);

-- Course Sessions
CREATE INDEX IF NOT EXISTS idx_course_sessions_module_id ON public.course_sessions(module_id);

-- Courses
CREATE INDEX IF NOT EXISTS idx_courses_status ON public.courses(status);

-- CRM Contracts
CREATE INDEX IF NOT EXISTS idx_crm_contracts_institution ON public.crm_contracts(institution_id);
CREATE INDEX IF NOT EXISTS idx_crm_contracts_status ON public.crm_contracts(status);

-- CRM Tasks
CREATE INDEX IF NOT EXISTS idx_crm_tasks_institution ON public.crm_tasks(institution_id);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_status ON public.crm_tasks(status);
CREATE INDEX IF NOT EXISTS idx_crm_tasks_due_date ON public.crm_tasks(due_date);

-- Daily Work Logs
CREATE INDEX IF NOT EXISTS idx_daily_work_logs_user_date ON public.daily_work_logs(user_id, date);

-- Event Class Assignments
CREATE INDEX IF NOT EXISTS idx_event_class_assignments_event_id ON public.event_class_assignments(event_id);

-- Event Interests
CREATE INDEX IF NOT EXISTS idx_event_interests_event_id ON public.event_interests(event_id);
CREATE INDEX IF NOT EXISTS idx_event_interests_student_id ON public.event_interests(student_id);

-- Events
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_event_start ON public.events(event_start);

-- HR Ratings
CREATE INDEX IF NOT EXISTS idx_hr_ratings_trainer ON public.hr_ratings(trainer_id);
CREATE INDEX IF NOT EXISTS idx_hr_ratings_period_year ON public.hr_ratings(period, year);

-- Institution Holidays
CREATE INDEX IF NOT EXISTS idx_institution_holidays_institution ON public.institution_holidays(institution_id);
CREATE INDEX IF NOT EXISTS idx_institution_holidays_year ON public.institution_holidays(year);

-- Institution Periods
CREATE INDEX IF NOT EXISTS idx_institution_periods_institution ON public.institution_periods(institution_id);

-- Institution Timetable Assignments
CREATE INDEX IF NOT EXISTS idx_institution_timetable_assignments_class ON public.institution_timetable_assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_institution_timetable_assignments_day ON public.institution_timetable_assignments(day);

-- Inventory Issues
CREATE INDEX IF NOT EXISTS idx_inventory_issues_item ON public.inventory_issues(item_id);

-- Inventory Items
CREATE INDEX IF NOT EXISTS idx_inventory_items_institution ON public.inventory_items(institution_id);

-- Invoice Line Items
CREATE INDEX IF NOT EXISTS idx_invoice_line_items_invoice ON public.invoice_line_items(invoice_id);

-- Invoices
CREATE INDEX IF NOT EXISTS idx_invoices_financial_year ON public.invoices(financial_year);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);

-- Job Applications
CREATE INDEX IF NOT EXISTS idx_job_applications_job ON public.job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON public.job_applications(status);

-- Job Postings
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON public.job_postings(status);

-- Leave Applications
CREATE INDEX IF NOT EXISTS idx_leave_applications_employee ON public.leave_applications(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_applications_status ON public.leave_applications(status);

-- Leave Balances
CREATE INDEX IF NOT EXISTS idx_leave_balances_employee ON public.leave_balances(employee_id);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- Officer Attendance
CREATE INDEX IF NOT EXISTS idx_officer_attendance_officer ON public.officer_attendance(officer_id);
CREATE INDEX IF NOT EXISTS idx_officer_attendance_date ON public.officer_attendance(date);

-- Officer Class Access Grants
CREATE INDEX IF NOT EXISTS idx_officer_class_access_grants_officer ON public.officer_class_access_grants(officer_id);

-- Officer Documents
CREATE INDEX IF NOT EXISTS idx_officer_documents_officer ON public.officer_documents(officer_id);

-- Officer Institution Assignments
CREATE INDEX IF NOT EXISTS idx_officer_institution_assignments_officer ON public.officer_institution_assignments(officer_id);
CREATE INDEX IF NOT EXISTS idx_officer_institution_assignments_institution ON public.officer_institution_assignments(institution_id);

-- Officers
CREATE INDEX IF NOT EXISTS idx_officers_status ON public.officers(status);

-- Payroll Records
CREATE INDEX IF NOT EXISTS idx_payroll_records_employee ON public.payroll_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_records_month_year ON public.payroll_records(month, year);

-- Performance Appraisals
CREATE INDEX IF NOT EXISTS idx_performance_appraisals_employee ON public.performance_appraisals(employee_id);

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_institution ON public.profiles(institution_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Project Members
CREATE INDEX IF NOT EXISTS idx_project_members_project ON public.project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user ON public.project_members(user_id);

-- Projects
CREATE INDEX IF NOT EXISTS idx_projects_institution ON public.projects(institution_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);

-- Purchase Requests
CREATE INDEX IF NOT EXISTS idx_purchase_requests_institution ON public.purchase_requests(institution_id);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_status ON public.purchase_requests(status);

-- Reports
CREATE INDEX IF NOT EXISTS idx_reports_institution ON public.reports(institution_id);

-- Staff Attendance
CREATE INDEX IF NOT EXISTS idx_staff_attendance_staff ON public.staff_attendance(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_attendance_date ON public.staff_attendance(date);

-- Staff Documents
CREATE INDEX IF NOT EXISTS idx_staff_documents_staff ON public.staff_documents(staff_id);

-- Student Badges
CREATE INDEX IF NOT EXISTS idx_student_badges_student ON public.student_badges(student_id);

-- Student Certificates
CREATE INDEX IF NOT EXISTS idx_student_certificates_student ON public.student_certificates(student_id);

-- Student Content Completions
CREATE INDEX IF NOT EXISTS idx_student_content_completions_student ON public.student_content_completions(student_id);
CREATE INDEX IF NOT EXISTS idx_student_content_completions_course ON public.student_content_completions(course_id);

-- Student Feedback
CREATE INDEX IF NOT EXISTS idx_student_feedback_student ON public.student_feedback(student_id);

-- Student Streaks
CREATE INDEX IF NOT EXISTS idx_student_streaks_student ON public.student_streaks(student_id);

-- Student XP Transactions
CREATE INDEX IF NOT EXISTS idx_student_xp_transactions_student ON public.student_xp_transactions(student_id);

-- Students
CREATE INDEX IF NOT EXISTS idx_students_institution ON public.students(institution_id);
CREATE INDEX IF NOT EXISTS idx_students_class ON public.students(class_id);
CREATE INDEX IF NOT EXISTS idx_students_email ON public.students(email);

-- Survey Questions
CREATE INDEX IF NOT EXISTS idx_survey_questions_survey ON public.survey_questions(survey_id);

-- Survey Response Answers
CREATE INDEX IF NOT EXISTS idx_survey_response_answers_response ON public.survey_response_answers(response_id);

-- Survey Responses
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey ON public.survey_responses(survey_id);

-- Surveys
CREATE INDEX IF NOT EXISTS idx_surveys_institution ON public.surveys(institution_id);
CREATE INDEX IF NOT EXISTS idx_surveys_status ON public.surveys(status);

-- System Logs
CREATE INDEX IF NOT EXISTS idx_system_logs_user ON public.system_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON public.system_logs(created_at);

-- Task Activity Log
CREATE INDEX IF NOT EXISTS idx_task_activity_log_task ON public.task_activity_log(task_id);

-- Task Attachments
CREATE INDEX IF NOT EXISTS idx_task_attachments_task ON public.task_attachments(task_id);

-- Task Comments
CREATE INDEX IF NOT EXISTS idx_task_comments_task ON public.task_comments(task_id);

-- Tasks
CREATE INDEX IF NOT EXISTS idx_tasks_project ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);

-- User Roles
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- ============================================
-- PART 7: SET SEQUENCE OWNERSHIP
-- ============================================
ALTER SEQUENCE public.inventory_items_sl_no_seq OWNED BY public.inventory_items.sl_no;

-- ============================================
-- SCHEMA CREATION COMPLETE
-- Total Tables: 103
-- Total Sequences: 1
-- Total Enum Types: 1
-- ============================================

DO $$ BEGIN 
    RAISE NOTICE 'Schema creation completed successfully!';
    RAISE NOTICE 'Tables: 103, Sequences: 1, Enum Types: 1';
END $$;
