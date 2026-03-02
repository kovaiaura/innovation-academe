
-- Drop and recreate get_leave_balance with NUMERIC return types
DROP FUNCTION IF EXISTS public.get_leave_balance(uuid, integer, integer);

CREATE OR REPLACE FUNCTION public.get_leave_balance(p_user_id uuid, p_year integer, p_month integer)
 RETURNS TABLE(monthly_credit numeric, carried_forward numeric, total_available numeric, sick_leave_used numeric, casual_leave_used numeric, total_used numeric, lop_days numeric, balance_remaining numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_balance RECORD;
  v_prev_remaining numeric;
  v_carried numeric;
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
      1::numeric,
      v_carried::numeric,
      (1 + v_carried)::numeric,
      0::numeric,
      0::numeric,
      0::numeric,
      0::numeric,
      (1 + v_carried)::numeric;
  ELSE
    RETURN QUERY SELECT 
      v_balance.monthly_credit,
      v_balance.carried_forward,
      (v_balance.monthly_credit + v_balance.carried_forward)::numeric,
      v_balance.sick_leave_used,
      v_balance.casual_leave_used,
      (v_balance.sick_leave_used + v_balance.casual_leave_used)::numeric,
      v_balance.lop_days,
      v_balance.balance_remaining;
  END IF;
END;
$function$;
