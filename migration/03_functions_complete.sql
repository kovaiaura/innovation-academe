-- ============================================
-- Meta-INNOVA LMS - Complete Database Functions
-- Generated from Lovable Cloud Database
-- Run AFTER 02_schema_programmatic.sql
-- ============================================

-- ============================================
-- SECTION 1: Core Utility Functions
-- ============================================

-- Function: update_updated_at_column
-- Purpose: Automatically update updated_at timestamp on row updates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Function: update_survey_updated_at
-- Purpose: Specific updated_at for surveys
CREATE OR REPLACE FUNCTION public.update_survey_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- ============================================
-- SECTION 2: Authentication & Authorization Functions
-- ============================================

-- Function: handle_new_user
-- Purpose: Create profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$function$;

-- Function: has_role
-- Purpose: Check if user has a specific role (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
 SET row_security TO 'off'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$function$;

-- Function: get_user_role
-- Purpose: Get user's role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
 RETURNS app_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT role FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$function$;

-- Function: get_user_institution_id
-- Purpose: Get user's institution ID (from profile or officer assignment)
CREATE OR REPLACE FUNCTION public.get_user_institution_id(_user_id uuid)
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
 SET row_security TO 'off'
AS $function$
  SELECT COALESCE(
    (SELECT institution_id FROM public.profiles WHERE id = _user_id LIMIT 1),
    (SELECT assigned_institutions[1] FROM public.officers WHERE user_id = _user_id LIMIT 1)
  );
$function$;

-- ============================================
-- SECTION 3: Profile Synchronization Functions
-- ============================================

-- Function: sync_profile_from_student
-- Purpose: Sync profile data when student record is updated
CREATE OR REPLACE FUNCTION public.sync_profile_from_student()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only proceed if user_id is set
  IF NEW.user_id IS NOT NULL THEN
    -- Update the profiles table with student's institution and class
    UPDATE public.profiles
    SET 
      institution_id = COALESCE(NEW.institution_id, institution_id),
      class_id = COALESCE(NEW.class_id, class_id),
      name = COALESCE(NEW.student_name, name),
      email = COALESCE(NEW.email, email),
      updated_at = now()
    WHERE id = NEW.user_id;
    
    -- Log for debugging
    RAISE LOG 'sync_profile_from_student: Updated profile % with institution_id=%, class_id=%', 
      NEW.user_id, NEW.institution_id, NEW.class_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Function: sync_profile_avatar
-- Purpose: Sync avatar changes across students and officers tables
CREATE OR REPLACE FUNCTION public.sync_profile_avatar()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only proceed if avatar actually changed
  IF OLD.avatar IS DISTINCT FROM NEW.avatar THEN
    -- Update students table where email matches
    UPDATE students SET avatar = NEW.avatar WHERE email = NEW.email;
    
    -- Update officers table where email matches
    UPDATE officers SET profile_photo_url = NEW.avatar WHERE email = NEW.email;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- ============================================
-- SECTION 4: Event Management Functions
-- ============================================

-- Function: can_manage_events
-- Purpose: Check if user can create/edit events (admins, CEO, CEO position)
CREATE OR REPLACE FUNCTION public.can_manage_events(_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
 SET row_security TO 'off'
AS $function$
  SELECT (
    public.has_role(_user_id, 'super_admin'::public.app_role)
    OR public.has_role(_user_id, 'system_admin'::public.app_role)
    OR EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = _user_id
        AND is_ceo = true
    )
    OR EXISTS (
      SELECT 1
      FROM public.profiles p
      JOIN public.positions pos ON pos.id = p.position_id
      WHERE p.id = _user_id
        AND pos.is_ceo_position = true
    )
  );
$function$;

-- Function: is_event_owner
-- Purpose: Check if user created the event
CREATE OR REPLACE FUNCTION public.is_event_owner(_user_id uuid, _event_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
 SET row_security TO 'off'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.events e
    WHERE e.id = _event_id
      AND e.created_by = _user_id
  );
$function$;

-- Function: is_event_assigned_to_user_institution
-- Purpose: Check if event is assigned to user's institution
CREATE OR REPLACE FUNCTION public.is_event_assigned_to_user_institution(_user_id uuid, _event_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
 SET row_security TO 'off'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.event_class_assignments eca
    WHERE eca.event_id = _event_id
      AND eca.institution_id = public.get_user_institution_id(_user_id)
  );
$function$;

-- Function: can_view_event
-- Purpose: Check if user can view a specific event
CREATE OR REPLACE FUNCTION public.can_view_event(_user_id uuid, _event_id uuid, _status text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
 SET row_security TO 'off'
AS $function$
  SELECT (
    public.can_manage_events(_user_id)
    OR (
      _status = 'published'
      AND public.is_event_assigned_to_user_institution(_user_id, _event_id)
    )
  );
$function$;

-- Function: can_view_event_updates
-- Purpose: Check if user can view event updates
CREATE OR REPLACE FUNCTION public.can_view_event_updates(_user_id uuid, _event_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
 SET row_security TO 'off'
AS $function$
  SELECT (
    public.can_manage_events(_user_id)
    OR EXISTS (
      SELECT 1
      FROM public.events e
      WHERE e.id = _event_id
        AND e.status = 'published'
        AND public.is_event_assigned_to_user_institution(_user_id, _event_id)
    )
  );
$function$;

-- ============================================
-- SECTION 5: Project Management Functions
-- ============================================

-- Function: is_project_member
-- Purpose: Check if user is a member of a project
CREATE OR REPLACE FUNCTION public.is_project_member(_user_id uuid, _project_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM project_members pm
    JOIN students s ON s.id = pm.student_id
    WHERE pm.project_id = _project_id AND s.user_id = _user_id
  )
$function$;

-- Function: get_project_institution_id
-- Purpose: Get institution ID for a project
CREATE OR REPLACE FUNCTION public.get_project_institution_id(_project_id uuid)
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT institution_id FROM projects WHERE id = _project_id LIMIT 1
$function$;

-- ============================================
-- SECTION 6: Invoice & ID Generation Functions
-- ============================================

-- Function: generate_invoice_number
-- Purpose: Generate sequential invoice numbers by type and financial year
CREATE OR REPLACE FUNCTION public.generate_invoice_number(p_invoice_type text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_prefix TEXT;
  v_year TEXT;
  v_next_number INTEGER;
  v_invoice_number TEXT;
BEGIN
  -- Determine prefix based on type
  CASE p_invoice_type
    WHEN 'institution' THEN v_prefix := 'MSA/MSD/';
    WHEN 'sales' THEN v_prefix := 'INV/';
    WHEN 'purchase' THEN v_prefix := 'PUR/';
    ELSE v_prefix := 'INV/';
  END CASE;
  
  -- Get financial year (April to March)
  IF EXTRACT(MONTH FROM CURRENT_DATE) >= 4 THEN
    v_year := TO_CHAR(CURRENT_DATE, 'YY') || '-' || TO_CHAR(CURRENT_DATE + INTERVAL '1 year', 'YY');
  ELSE
    v_year := TO_CHAR(CURRENT_DATE - INTERVAL '1 year', 'YY') || '-' || TO_CHAR(CURRENT_DATE, 'YY');
  END IF;
  
  -- Get and increment the sequence
  INSERT INTO public.invoice_number_sequences (invoice_type, prefix, financial_year, last_number)
  VALUES (p_invoice_type, v_prefix, v_year, 1)
  ON CONFLICT (invoice_type, financial_year)
  DO UPDATE SET last_number = invoice_number_sequences.last_number + 1, updated_at = now()
  RETURNING last_number INTO v_next_number;
  
  -- Format the invoice number
  IF p_invoice_type = 'institution' THEN
    v_invoice_number := v_prefix || LPAD(v_next_number::TEXT, 3, '0');
  ELSE
    v_invoice_number := v_prefix || v_year || '/' || LPAD(v_next_number::TEXT, 4, '0');
  END IF;
  
  RETURN v_invoice_number;
END;
$function$;

-- Function: reserve_deleted_invoice_number
-- Purpose: Reserve invoice numbers when invoices are deleted
CREATE OR REPLACE FUNCTION public.reserve_deleted_invoice_number()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.reserved_invoice_numbers (invoice_number, invoice_type, original_invoice_id, deleted_by)
  VALUES (OLD.invoice_number, OLD.invoice_type, OLD.id, auth.uid());
  RETURN OLD;
END;
$function$;

-- Function: check_invoice_number_available
-- Purpose: Check if an invoice number is available for use
CREATE OR REPLACE FUNCTION public.check_invoice_number_available(p_invoice_number text)
 RETURNS TABLE(available boolean, reason text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if in active invoices
  IF EXISTS (SELECT 1 FROM public.invoices WHERE invoice_number = p_invoice_number) THEN
    RETURN QUERY SELECT FALSE, 'Invoice number already in use'::TEXT;
    RETURN;
  END IF;
  
  -- Check if in reserved (deleted) numbers
  IF EXISTS (SELECT 1 FROM public.reserved_invoice_numbers WHERE invoice_number = p_invoice_number) THEN
    RETURN QUERY SELECT FALSE, 'Invoice number was previously used and cannot be reused'::TEXT;
    RETURN;
  END IF;
  
  RETURN QUERY SELECT TRUE, 'Available'::TEXT;
END;
$function$;

-- Function: get_next_id
-- Purpose: Get next sequential ID for an entity type within an institution
CREATE OR REPLACE FUNCTION public.get_next_id(p_institution_id uuid, p_entity_type text)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_next INTEGER;
BEGIN
  INSERT INTO public.id_counters (institution_id, entity_type, current_counter)
  VALUES (p_institution_id, p_entity_type, 1)
  ON CONFLICT (institution_id, entity_type)
  DO UPDATE SET 
    current_counter = id_counters.current_counter + 1,
    updated_at = now()
  RETURNING current_counter
  INTO v_next;
  
  RETURN v_next;
END;
$function$;

-- Function: reserve_id_range
-- Purpose: Reserve a range of IDs for bulk operations
CREATE OR REPLACE FUNCTION public.reserve_id_range(p_institution_id uuid, p_entity_type text, p_count integer)
 RETURNS TABLE(start_counter integer, end_counter integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_start INTEGER;
  v_end INTEGER;
BEGIN
  -- Insert or update the counter atomically
  INSERT INTO public.id_counters (institution_id, entity_type, current_counter)
  VALUES (p_institution_id, p_entity_type, p_count)
  ON CONFLICT (institution_id, entity_type)
  DO UPDATE SET 
    current_counter = id_counters.current_counter + p_count,
    updated_at = now()
  RETURNING current_counter - p_count + 1, current_counter
  INTO v_start, v_end;
  
  RETURN QUERY SELECT v_start, v_end;
END;
$function$;

-- Function: generate_request_code
-- Purpose: Generate request codes for purchase requests and inventory issues
CREATE OR REPLACE FUNCTION public.generate_request_code(prefix text, table_name text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_year TEXT;
  v_count INTEGER;
  v_code TEXT;
BEGIN
  v_year := to_char(now(), 'YYYY');
  
  IF table_name = 'purchase_requests' THEN
    SELECT COUNT(*) + 1 INTO v_count FROM public.purchase_requests 
    WHERE request_code LIKE prefix || '-' || v_year || '-%';
  ELSIF table_name = 'inventory_issues' THEN
    SELECT COUNT(*) + 1 INTO v_count FROM public.inventory_issues 
    WHERE issue_code LIKE prefix || '-' || v_year || '-%';
  ELSE
    v_count := 1;
  END IF;
  
  v_code := prefix || '-' || v_year || '-' || lpad(v_count::TEXT, 4, '0');
  RETURN v_code;
END;
$function$;

-- ============================================
-- SECTION 7: Leave Management Functions
-- ============================================

-- Function: get_leave_balance
-- Purpose: Get leave balance for a user for a specific month
CREATE OR REPLACE FUNCTION public.get_leave_balance(p_user_id uuid, p_year integer, p_month integer)
 RETURNS TABLE(monthly_credit integer, carried_forward integer, total_available integer, sick_leave_used integer, casual_leave_used integer, total_used integer, lop_days integer, balance_remaining integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_balance RECORD;
  v_prev_remaining integer;
  v_carried integer;
BEGIN
  SELECT * INTO v_balance
  FROM leave_balances lb
  WHERE lb.user_id = p_user_id AND lb.year = p_year AND lb.month = p_month;
  
  IF v_balance IS NULL THEN
    IF p_month = 1 THEN
      SELECT lb.balance_remaining INTO v_prev_remaining
      FROM leave_balances lb
      WHERE lb.user_id = p_user_id AND lb.year = p_year - 1 AND lb.month = 12;
    ELSE
      SELECT lb.balance_remaining INTO v_prev_remaining
      FROM leave_balances lb
      WHERE lb.user_id = p_user_id AND lb.year = p_year AND lb.month = p_month - 1;
    END IF;
    
    v_carried := LEAST(COALESCE(v_prev_remaining, 0), 1);
    
    RETURN QUERY SELECT 
      1::integer,
      v_carried::integer,
      (1 + v_carried)::integer,
      0::integer,
      0::integer,
      0::integer,
      0::integer,
      (1 + v_carried)::integer;
  ELSE
    RETURN QUERY SELECT 
      v_balance.monthly_credit,
      v_balance.carried_forward,
      (v_balance.monthly_credit + v_balance.carried_forward)::integer,
      v_balance.sick_leave_used,
      v_balance.casual_leave_used,
      (v_balance.sick_leave_used + v_balance.casual_leave_used)::integer,
      v_balance.lop_days,
      v_balance.balance_remaining;
  END IF;
END;
$function$;

-- Function: initialize_leave_balance
-- Purpose: Initialize leave balance for a new month
CREATE OR REPLACE FUNCTION public.initialize_leave_balance(p_user_id uuid, p_user_type text, p_officer_id uuid, p_year integer, p_month integer)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_balance_id uuid;
  v_carried_forward integer := 0;
  v_prev_remaining integer;
BEGIN
  IF p_month = 1 THEN
    SELECT balance_remaining INTO v_prev_remaining
    FROM leave_balances
    WHERE user_id = p_user_id AND year = p_year - 1 AND month = 12;
  ELSE
    SELECT balance_remaining INTO v_prev_remaining
    FROM leave_balances
    WHERE user_id = p_user_id AND year = p_year AND month = p_month - 1;
  END IF;
  
  v_carried_forward := LEAST(COALESCE(v_prev_remaining, 0), 1);
  
  INSERT INTO leave_balances (
    user_id, user_type, officer_id, year, month,
    monthly_credit, carried_forward, balance_remaining
  )
  VALUES (
    p_user_id, p_user_type, p_officer_id, p_year, p_month,
    1, v_carried_forward, 1 + v_carried_forward
  )
  ON CONFLICT (user_id, year, month)
  DO UPDATE SET
    carried_forward = EXCLUDED.carried_forward,
    balance_remaining = leave_balances.monthly_credit + EXCLUDED.carried_forward - 
                        leave_balances.sick_leave_used - leave_balances.casual_leave_used,
    updated_at = now()
  RETURNING id INTO v_balance_id;
  
  RETURN v_balance_id;
END;
$function$;

-- Function: apply_leave_application_to_balance
-- Purpose: Apply approved leave to balance
CREATE OR REPLACE FUNCTION public.apply_leave_application_to_balance(p_application_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_app RECORD;
  v_balance_id uuid;
  v_total_available integer;
  v_total_used integer;
BEGIN
  -- Get the leave application
  SELECT * INTO v_app
  FROM leave_applications
  WHERE id = p_application_id;
  
  IF v_app IS NULL THEN
    RAISE EXCEPTION 'Leave application not found: %', p_application_id;
  END IF;
  
  -- Only process finally approved applications
  IF v_app.status != 'approved' OR v_app.final_approved_at IS NULL THEN
    RAISE EXCEPTION 'Leave application is not finally approved: %', p_application_id;
  END IF;
  
  -- Initialize balance for the month if it doesn't exist
  SELECT public.initialize_leave_balance(
    v_app.applicant_id,
    v_app.user_type,
    v_app.officer_id,
    EXTRACT(YEAR FROM v_app.start_date)::integer,
    EXTRACT(MONTH FROM v_app.start_date)::integer
  ) INTO v_balance_id;
  
  -- Update the balance based on leave type
  IF v_app.leave_type = 'sick' THEN
    UPDATE leave_balances
    SET 
      sick_leave_used = sick_leave_used + COALESCE(v_app.paid_days, 0),
      lop_days = lop_days + COALESCE(v_app.lop_days, 0),
      updated_at = now()
    WHERE user_id = v_app.applicant_id
      AND year = EXTRACT(YEAR FROM v_app.start_date)::integer
      AND month = EXTRACT(MONTH FROM v_app.start_date)::integer;
  ELSE
    UPDATE leave_balances
    SET 
      casual_leave_used = casual_leave_used + COALESCE(v_app.paid_days, 0),
      lop_days = lop_days + COALESCE(v_app.lop_days, 0),
      updated_at = now()
    WHERE user_id = v_app.applicant_id
      AND year = EXTRACT(YEAR FROM v_app.start_date)::integer
      AND month = EXTRACT(MONTH FROM v_app.start_date)::integer;
  END IF;
  
  -- Recompute balance_remaining
  UPDATE leave_balances
  SET 
    balance_remaining = GREATEST(0, monthly_credit + carried_forward - sick_leave_used - casual_leave_used),
    updated_at = now()
  WHERE user_id = v_app.applicant_id
    AND year = EXTRACT(YEAR FROM v_app.start_date)::integer
    AND month = EXTRACT(MONTH FROM v_app.start_date)::integer;
END;
$function$;

-- ============================================
-- SECTION 8: Gamification & XP Functions
-- ============================================

-- Function: award_project_membership_xp
-- Purpose: Award XP when student joins a project
CREATE OR REPLACE FUNCTION public.award_project_membership_xp()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid;
  v_institution_id uuid;
  v_project_title text;
  v_xp_points integer;
BEGIN
  SELECT user_id INTO v_user_id FROM students WHERE id = NEW.student_id;
  SELECT title, institution_id INTO v_project_title, v_institution_id FROM projects WHERE id = NEW.project_id;
  SELECT points INTO v_xp_points FROM xp_rules WHERE activity = 'project_membership' AND is_active = true;
  
  IF v_user_id IS NOT NULL AND v_xp_points IS NOT NULL THEN
    INSERT INTO student_xp_transactions (student_id, institution_id, activity_type, activity_id, points_earned, description)
    VALUES (v_user_id, v_institution_id, 'project_membership', NEW.project_id, v_xp_points, 'Joined project: ' || COALESCE(v_project_title, 'Unknown'))
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$function$;

-- Function: award_project_achievement_xp
-- Purpose: Award XP when project receives an achievement
CREATE OR REPLACE FUNCTION public.award_project_achievement_xp()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_institution_id uuid;
  v_xp_points integer;
  v_member RECORD;
BEGIN
  SELECT institution_id INTO v_institution_id FROM projects WHERE id = NEW.project_id;
  SELECT points INTO v_xp_points FROM xp_rules WHERE activity = 'project_award' AND is_active = true;
  
  IF v_xp_points IS NOT NULL THEN
    FOR v_member IN 
      SELECT pm.student_id, s.user_id 
      FROM project_members pm
      JOIN students s ON s.id = pm.student_id
      WHERE pm.project_id = NEW.project_id AND s.user_id IS NOT NULL
    LOOP
      INSERT INTO student_xp_transactions (student_id, institution_id, activity_type, activity_id, points_earned, description)
      VALUES (v_member.user_id, v_institution_id, 'project_award', NEW.id, v_xp_points, 'Project award: ' || COALESCE(NEW.title, 'Achievement'))
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$function$;

-- Function: award_project_completion_xp
-- Purpose: Award XP when project reaches 100% completion
CREATE OR REPLACE FUNCTION public.award_project_completion_xp()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_institution_id uuid;
  v_project_title text;
  v_xp_points integer;
  v_member RECORD;
BEGIN
  IF NEW.progress_percentage < 100 THEN RETURN NEW; END IF;
  
  SELECT title, institution_id INTO v_project_title, v_institution_id FROM projects WHERE id = NEW.project_id;
  SELECT points INTO v_xp_points FROM xp_rules WHERE activity = 'project_completion' AND is_active = true;
  
  IF v_xp_points IS NOT NULL THEN
    FOR v_member IN 
      SELECT pm.student_id, s.user_id 
      FROM project_members pm
      JOIN students s ON s.id = pm.student_id
      WHERE pm.project_id = NEW.project_id AND s.user_id IS NOT NULL
    LOOP
      INSERT INTO student_xp_transactions (student_id, institution_id, activity_type, activity_id, points_earned, description)
      VALUES (v_member.user_id, v_institution_id, 'project_completion', NEW.project_id, v_xp_points, 'Completed project: ' || COALESCE(v_project_title, 'Unknown'))
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$function$;

-- Function: award_assignment_xp
-- Purpose: Award XP when assignment is graded
CREATE OR REPLACE FUNCTION public.award_assignment_xp()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_xp_points integer;
  v_total_marks integer;
  v_percentage numeric;
BEGIN
  -- Only trigger when status changes to 'graded'
  IF NEW.status = 'graded' AND (OLD.status IS NULL OR OLD.status != 'graded') THEN
    -- Get total marks for the assignment
    SELECT total_marks INTO v_total_marks FROM assignments WHERE id = NEW.assignment_id;
    
    -- Calculate percentage
    IF v_total_marks > 0 THEN
      v_percentage := (NEW.marks_obtained::numeric / v_total_marks) * 100;
    ELSE
      v_percentage := 0;
    END IF;
    
    -- Award submission XP
    SELECT points INTO v_xp_points FROM xp_rules WHERE activity = 'assignment_submission' AND is_active = true;
    IF v_xp_points IS NOT NULL THEN
      INSERT INTO student_xp_transactions (student_id, institution_id, activity_type, activity_id, points_earned, description)
      VALUES (NEW.student_id, NEW.institution_id, 'assignment_submission', NEW.id, v_xp_points, 'Assignment submitted and graded')
      ON CONFLICT (student_id, activity_type, activity_id) DO NOTHING;
    END IF;
    
    -- Award pass XP if 50%+
    IF v_percentage >= 50 THEN
      SELECT points INTO v_xp_points FROM xp_rules WHERE activity = 'assignment_pass' AND is_active = true;
      IF v_xp_points IS NOT NULL THEN
        INSERT INTO student_xp_transactions (student_id, institution_id, activity_type, activity_id, points_earned, description)
        VALUES (NEW.student_id, NEW.institution_id, 'assignment_pass', NEW.id, v_xp_points, 'Passed assignment with ' || ROUND(v_percentage) || '%')
        ON CONFLICT (student_id, activity_type, activity_id) DO NOTHING;
      END IF;
    END IF;
    
    -- Award perfect score XP if 100%
    IF v_percentage >= 100 THEN
      SELECT points INTO v_xp_points FROM xp_rules WHERE activity = 'assignment_perfect_score' AND is_active = true;
      IF v_xp_points IS NOT NULL THEN
        INSERT INTO student_xp_transactions (student_id, institution_id, activity_type, activity_id, points_earned, description)
        VALUES (NEW.student_id, NEW.institution_id, 'assignment_perfect_score', NEW.id, v_xp_points, 'Perfect score on assignment!')
        ON CONFLICT (student_id, activity_type, activity_id) DO NOTHING;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- ============================================
-- SECTION 9: Course Content Unlock Functions
-- ============================================

-- Function: apply_sequential_unlocks
-- Purpose: Apply sequential unlock logic for course sessions
CREATE OR REPLACE FUNCTION public.apply_sequential_unlocks(p_class_module_assignment_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_session RECORD;
  v_prev_session_completed BOOLEAN;
  v_class_assignment_id uuid;
  v_prev_unlock_order integer;
BEGIN
  -- Get the class_assignment_id for this module assignment
  SELECT class_assignment_id INTO v_class_assignment_id
  FROM class_module_assignments
  WHERE id = p_class_module_assignment_id;

  -- Loop through all sessions in this module ordered by unlock_order
  v_prev_session_completed := true; -- First session can be unlocked if module is unlocked
  v_prev_unlock_order := 0;
  
  FOR v_session IN 
    SELECT csa.*, cs.id as course_session_id
    FROM class_session_assignments csa
    JOIN course_sessions cs ON cs.id = csa.session_id
    WHERE csa.class_module_assignment_id = p_class_module_assignment_id
    ORDER BY csa.unlock_order ASC
  LOOP
    -- For sequential sessions, check if previous session is completed
    IF v_session.unlock_mode = 'sequential' AND v_session.unlock_order > 1 THEN
      -- Check if all content in the previous session is completed by at least one student
      -- We consider a session "completed" if all its content has been viewed
      SELECT EXISTS (
        SELECT 1
        FROM class_session_assignments prev_csa
        WHERE prev_csa.class_module_assignment_id = p_class_module_assignment_id
          AND prev_csa.unlock_order = v_session.unlock_order - 1
          AND prev_csa.is_unlocked = true
          AND NOT EXISTS (
            -- Check if there's any content in the previous session that hasn't been completed
            SELECT 1
            FROM course_content cc
            WHERE cc.session_id = prev_csa.session_id
            AND NOT EXISTS (
              SELECT 1
              FROM student_content_completions scc
              WHERE scc.content_id = cc.id
                AND scc.class_assignment_id = v_class_assignment_id
            )
          )
      ) INTO v_prev_session_completed;
      
      -- If previous session is completed and this session is locked, unlock it
      IF v_prev_session_completed AND v_session.is_unlocked = false THEN
        UPDATE class_session_assignments
        SET is_unlocked = true, updated_at = now()
        WHERE id = v_session.id;
      END IF;
    ELSIF v_session.unlock_mode = 'manual' THEN
      -- Manual mode - don't auto-unlock, leave as is
      NULL;
    ELSIF v_session.unlock_order = 1 THEN
      -- First session in module should be unlocked if module is unlocked
      IF v_session.is_unlocked = false THEN
        UPDATE class_session_assignments
        SET is_unlocked = true, updated_at = now()
        WHERE id = v_session.id;
      END IF;
    END IF;
  END LOOP;
END;
$function$;

-- Function: trigger_apply_sequential_unlocks
-- Purpose: Trigger wrapper for apply_sequential_unlocks
CREATE OR REPLACE FUNCTION public.trigger_apply_sequential_unlocks()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Apply sequential unlocks for this module
  PERFORM public.apply_sequential_unlocks(NEW.class_module_assignment_id);
  RETURN NEW;
END;
$function$;

-- Function: check_and_unlock_next_content
-- Purpose: Check and unlock next content when student completes content
CREATE OR REPLACE FUNCTION public.check_and_unlock_next_content()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_session_id UUID;
  v_module_assignment_id UUID;
  v_class_assignment_id UUID;
BEGIN
  -- Get content details
  SELECT session_id INTO v_session_id 
  FROM course_content WHERE id = NEW.content_id;
  
  IF v_session_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  v_class_assignment_id := NEW.class_assignment_id;
  
  -- Get the module assignment for this session
  SELECT csa.class_module_assignment_id INTO v_module_assignment_id
  FROM class_session_assignments csa
  WHERE csa.session_id = v_session_id
    AND csa.class_module_assignment_id IN (
      SELECT cma.id FROM class_module_assignments cma
      WHERE cma.class_assignment_id = v_class_assignment_id
    )
  LIMIT 1;
  
  IF v_module_assignment_id IS NOT NULL THEN
    -- Apply sequential unlocks for this module
    PERFORM public.apply_sequential_unlocks(v_module_assignment_id);
  END IF;
  
  RETURN NEW;
END;
$function$;

-- ============================================
-- SECTION 10: Newsletter Functions
-- ============================================

-- Function: increment_newsletter_downloads
-- Purpose: Increment download count for newsletters
CREATE OR REPLACE FUNCTION public.increment_newsletter_downloads(newsletter_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE newsletters 
  SET download_count = COALESCE(download_count, 0) + 1 
  WHERE id = newsletter_id;
END;
$function$;

-- ============================================
-- Grant execute permissions on all functions
-- ============================================
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;
