import { supabase } from '@/integrations/supabase/client';

// Constants
export const STANDARD_DAYS_PER_MONTH = 30;

// Types
export interface EmployeePayrollSummary {
  user_id: string;
  user_type: 'officer' | 'staff';
  officer_id?: string;
  position_id?: string;
  name: string;
  email: string;
  position_name?: string;
  department?: string;
  institution_id?: string;
  institution_name?: string;
  join_date?: string;
  monthly_salary: number;
  per_day_salary: number;
  days_present: number;
  days_absent: number;
  days_leave: number;
  days_lop: number;
  uninformed_leave_days: number;
  overtime_hours: number;
  overtime_pending_approval: number;
  total_hours_worked: number;
  gross_salary: number;
  total_deductions: number;
  net_pay: number;
  payroll_status: 'draft' | 'pending' | 'approved' | 'paid';
  is_ceo?: boolean;
}

export interface DailyAttendanceRecord {
  id: string;
  user_id: string;
  user_name: string;
  user_type: 'officer' | 'staff';
  date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  check_in_address: string | null;
  check_out_address: string | null;
  total_hours_worked: number;
  overtime_hours: number;
  status: string;
  is_late: boolean;
  missed_checkout: boolean;
  is_uninformed_absence: boolean;
  leave_status?: string;
  notes?: string;
}

export interface OvertimeRequest {
  id: string;
  user_id: string;
  user_name: string;
  user_type: string;
  position_name?: string;
  date: string;
  requested_hours: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_by_name?: string;
  approved_at?: string;
  rejection_reason?: string;
  calculated_pay: number;
  created_at: string;
}

export interface PayrollDashboardStats {
  total_employees: number;
  total_payroll_cost: number;
  total_overtime_hours: number;
  pending_overtime_requests: number;
  total_lop_deductions: number;
  pending_payroll_count: number;
  uninformed_leave_count: number;
}

// LOP Calculation using standard 30 days
export const calculatePerDaySalary = (monthlySalary: number): number => {
  return monthlySalary / STANDARD_DAYS_PER_MONTH;
};

export const calculateLOPDeduction = (monthlySalary: number, lopDays: number): number => {
  const perDaySalary = calculatePerDaySalary(monthlySalary);
  return perDaySalary * lopDays;
};

// Fetch all employees (officers + staff with positions) - excludes CEO
export const fetchAllEmployees = async (): Promise<EmployeePayrollSummary[]> => {
  const employees: EmployeePayrollSummary[] = [];
  
  try {
    // 1. Fetch all officers with join date
    const { data: officers, error: officerError } = await supabase
      .from('officers')
      .select(`
        id,
        user_id,
        full_name,
        email,
        department,
        annual_salary,
        assigned_institutions,
        status,
        join_date
      `)
      .eq('status', 'active');
    
    if (officerError) {
      console.error('Error fetching officers:', officerError);
    }
    
    if (officers) {
      for (const officer of officers) {
        const monthlySalary = (officer.annual_salary || 0) / 12;
        employees.push({
          user_id: officer.user_id || officer.id,
          user_type: 'officer',
          officer_id: officer.id,
          name: officer.full_name,
          email: officer.email,
          department: officer.department || 'STEM',
          institution_id: officer.assigned_institutions?.[0],
          join_date: officer.join_date || undefined,
          monthly_salary: monthlySalary,
          per_day_salary: calculatePerDaySalary(monthlySalary),
          days_present: 0,
          days_absent: 0,
          days_leave: 0,
          days_lop: 0,
          uninformed_leave_days: 0,
          overtime_hours: 0,
          overtime_pending_approval: 0,
          total_hours_worked: 0,
          gross_salary: monthlySalary,
          total_deductions: 0,
          net_pay: monthlySalary,
          payroll_status: 'draft'
        });
      }
    }
    
    // 2. Fetch ALL staff with positions (from profiles) - includes those without institution_id
    // This ensures Saran and other staff assigned via Position Management are included
    const { data: staffProfiles, error: profileError } = await supabase
      .from('profiles')
      .select(`
        id,
        name,
        email,
        position_id,
        institution_id,
        hourly_rate,
        join_date,
        is_ceo,
        positions:position_id (
          id,
          display_name,
          position_name,
          is_ceo_position
        )
      `)
      .not('position_id', 'is', null);
    
    if (profileError) {
      console.error('Error fetching staff profiles:', profileError);
    }
    
    if (staffProfiles) {
      for (const profile of staffProfiles) {
        // Skip if already added as officer
        if (employees.some(e => e.user_id === profile.id)) continue;
        
        const position = profile.positions as unknown as { display_name: string; position_name: string; is_ceo_position?: boolean } | null;
        
        // Skip CEO - they manage payroll, not their own
        if (profile.is_ceo || position?.is_ceo_position) continue;
        
        const hourlyRate = profile.hourly_rate || 500;
        const monthlySalary = hourlyRate * 8 * 22; // Estimate: hourly rate * 8hrs/day * 22 working days
        
        employees.push({
          user_id: profile.id,
          user_type: 'staff',
          position_id: profile.position_id || undefined,
          name: profile.name,
          email: profile.email,
          position_name: position?.display_name || position?.position_name,
          institution_id: profile.institution_id || undefined,
          join_date: profile.join_date || undefined,
          monthly_salary: monthlySalary,
          per_day_salary: calculatePerDaySalary(monthlySalary),
          days_present: 0,
          days_absent: 0,
          days_leave: 0,
          days_lop: 0,
          uninformed_leave_days: 0,
          overtime_hours: 0,
          overtime_pending_approval: 0,
          total_hours_worked: 0,
          gross_salary: monthlySalary,
          total_deductions: 0,
          net_pay: monthlySalary,
          payroll_status: 'draft',
          is_ceo: false
        });
      }
    }
    
    return employees;
  } catch (error) {
    console.error('Error fetching employees:', error);
    return [];
  }
};

// Fetch payroll dashboard stats
export const fetchPayrollDashboardStats = async (month: number, year: number): Promise<PayrollDashboardStats> => {
  const employees = await fetchAllEmployees();
  
  // Fetch overtime requests
  const { data: overtimeRequests } = await supabase
    .from('overtime_requests')
    .select('id, requested_hours, status')
    .eq('status', 'pending');
  
  const pendingOvertimeRequests = overtimeRequests?.length || 0;
  const totalOvertimeHours = overtimeRequests?.reduce((sum, r) => sum + (r.requested_hours || 0), 0) || 0;
  
  // Calculate totals
  const totalPayrollCost = employees.reduce((sum, e) => sum + e.monthly_salary, 0);
  const totalLopDeductions = employees.reduce((sum, e) => sum + calculateLOPDeduction(e.monthly_salary, e.days_lop), 0);
  
  return {
    total_employees: employees.length,
    total_payroll_cost: totalPayrollCost,
    total_overtime_hours: totalOvertimeHours,
    pending_overtime_requests: pendingOvertimeRequests,
    total_lop_deductions: totalLopDeductions,
    pending_payroll_count: 0,
    uninformed_leave_count: 0
  };
};

// Fetch daily attendance for a specific date range
export const fetchDailyAttendance = async (
  startDate: string,
  endDate: string
): Promise<DailyAttendanceRecord[]> => {
  const records: DailyAttendanceRecord[] = [];
  
  try {
    // Fetch officer attendance
    const { data: officerAttendance, error: officerError } = await supabase
      .from('officer_attendance')
      .select(`
        id,
        officer_id,
        date,
        check_in_time,
        check_out_time,
        check_in_address,
        check_out_address,
        total_hours_worked,
        overtime_hours,
        status,
        notes,
        officers:officer_id (
          full_name,
          user_id
        )
      `)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });
    
    if (officerError) {
      console.error('Error fetching officer attendance:', officerError);
    }
    
    if (officerAttendance) {
      for (const record of officerAttendance) {
        const officer = record.officers as unknown as { full_name: string; user_id: string } | null;
        
        // Check for late check-in (after 9:30 AM)
        const checkInTime = record.check_in_time ? new Date(record.check_in_time) : null;
        const isLate = checkInTime ? checkInTime.getHours() > 9 || (checkInTime.getHours() === 9 && checkInTime.getMinutes() > 30) : false;
        
        // Check for missed checkout
        const missedCheckout = record.check_in_time && !record.check_out_time && record.status !== 'checked_in';
        
        records.push({
          id: record.id,
          user_id: officer?.user_id || record.officer_id,
          user_name: officer?.full_name || 'Unknown',
          user_type: 'officer',
          date: record.date,
          check_in_time: record.check_in_time,
          check_out_time: record.check_out_time,
          check_in_address: record.check_in_address,
          check_out_address: record.check_out_address,
          total_hours_worked: record.total_hours_worked || 0,
          overtime_hours: record.overtime_hours || 0,
          status: record.status || 'unknown',
          is_late: isLate,
          missed_checkout: missedCheckout || false,
          is_uninformed_absence: false,
          notes: record.notes
        });
      }
    }
    
    // Fetch staff attendance
    const { data: staffAttendance, error: staffError } = await supabase
      .from('staff_attendance')
      .select(`
        id,
        user_id,
        date,
        check_in_time,
        check_out_time,
        check_in_address,
        check_out_address,
        total_hours_worked,
        overtime_hours,
        status,
        notes
      `)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });
    
    if (staffError) {
      console.error('Error fetching staff attendance:', staffError);
    }
    
    if (staffAttendance) {
      // Get user names
      const userIds = staffAttendance.map(s => s.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', userIds);
      
      const profileMap = new Map(profiles?.map(p => [p.id, p.name]) || []);
      
      for (const record of staffAttendance) {
        const checkInTime = record.check_in_time ? new Date(record.check_in_time) : null;
        const isLate = checkInTime ? checkInTime.getHours() > 9 || (checkInTime.getHours() === 9 && checkInTime.getMinutes() > 30) : false;
        const missedCheckout = record.check_in_time && !record.check_out_time && record.status !== 'checked_in';
        
        records.push({
          id: record.id,
          user_id: record.user_id,
          user_name: profileMap.get(record.user_id) || 'Unknown',
          user_type: 'staff',
          date: record.date,
          check_in_time: record.check_in_time,
          check_out_time: record.check_out_time,
          check_in_address: record.check_in_address,
          check_out_address: record.check_out_address,
          total_hours_worked: record.total_hours_worked || 0,
          overtime_hours: record.overtime_hours || 0,
          status: record.status || 'unknown',
          is_late: isLate,
          missed_checkout: missedCheckout || false,
          is_uninformed_absence: false,
          notes: record.notes
        });
      }
    }
    
    return records;
  } catch (error) {
    console.error('Error fetching daily attendance:', error);
    return [];
  }
};

// Detect uninformed leave (days without check-in and no approved leave)
export const detectUninformedLeave = async (
  userId: string,
  month: number,
  year: number,
  userType: 'officer' | 'staff'
): Promise<string[]> => {
  const uninformedDays: string[] = [];
  
  try {
    // Get all working days in the month (excluding weekends)
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const workingDays: string[] = [];
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday or Saturday
        workingDays.push(d.toISOString().split('T')[0]);
      }
    }
    
    // Get days with attendance
    let attendanceDays = new Set<string>();
    
    if (userType === 'officer') {
      const { data: attendanceRecords } = await supabase
        .from('officer_attendance')
        .select('date')
        .eq('officer_id', userId)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0]);
      attendanceDays = new Set(attendanceRecords?.map(r => r.date) || []);
    } else {
      const { data: attendanceRecords } = await supabase
        .from('staff_attendance')
        .select('date')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0]);
      attendanceDays = new Set(attendanceRecords?.map(r => r.date) || []);
    }
    
    // Get days with approved leave
    const { data: leaveRecords } = await supabase
      .from('leave_applications')
      .select('start_date, end_date')
      .eq('applicant_id', userId)
      .eq('status', 'approved')
      .gte('start_date', startDate.toISOString().split('T')[0])
      .lte('end_date', endDate.toISOString().split('T')[0]);
    
    const leaveDays = new Set<string>();
    if (leaveRecords) {
      for (const leave of leaveRecords) {
        const start = new Date(leave.start_date);
        const end = new Date(leave.end_date);
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          leaveDays.add(d.toISOString().split('T')[0]);
        }
      }
    }
    
    // Get company holidays
    const { data: holidays } = await supabase
      .from('company_holidays')
      .select('date')
      .eq('year', year);
    
    const holidayDays = new Set(holidays?.map(h => h.date) || []);
    
    // Find uninformed days
    const today = new Date().toISOString().split('T')[0];
    for (const day of workingDays) {
      if (day >= today) continue; // Skip future dates
      if (attendanceDays.has(day)) continue;
      if (leaveDays.has(day)) continue;
      if (holidayDays.has(day)) continue;
      uninformedDays.push(day);
    }
    
    return uninformedDays;
  } catch (error) {
    console.error('Error detecting uninformed leave:', error);
    return [];
  }
};

// Fetch overtime requests
export const fetchOvertimeRequests = async (
  status?: 'pending' | 'approved' | 'rejected'
): Promise<OvertimeRequest[]> => {
  try {
    let query = supabase
      .from('overtime_requests')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching overtime requests:', error);
      return [];
    }
    
    // Get user names
    const userIds = data?.map(r => r.user_id) || [];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, position_id, positions:position_id(display_name)')
      .in('id', userIds);
    
    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
    
    return (data || []).map(request => {
      const profile = profileMap.get(request.user_id);
      const position = profile?.positions as unknown as { display_name: string } | null;
      
      return {
        id: request.id,
        user_id: request.user_id,
        user_name: profile?.name || 'Unknown',
        user_type: request.user_type || 'staff',
        position_name: position?.display_name,
        date: request.date,
        requested_hours: request.requested_hours,
        reason: request.reason,
        status: request.status as 'pending' | 'approved' | 'rejected',
        approved_by: request.approved_by,
        approved_by_name: request.approved_by_name,
        approved_at: request.approved_at,
        rejection_reason: request.rejection_reason,
        calculated_pay: request.calculated_pay || 0,
        created_at: request.created_at
      };
    });
  } catch (error) {
    console.error('Error fetching overtime requests:', error);
    return [];
  }
};

// Approve overtime request
export const approveOvertimeRequest = async (
  requestId: string,
  approverId: string,
  approverName: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('overtime_requests')
      .update({
        status: 'approved',
        approved_by: approverId,
        approved_by_name: approverName,
        approved_at: new Date().toISOString()
      })
      .eq('id', requestId);
    
    if (error) {
      console.error('Error approving overtime request:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error approving overtime request:', error);
    return false;
  }
};

// Reject overtime request
export const rejectOvertimeRequest = async (
  requestId: string,
  approverId: string,
  approverName: string,
  rejectionReason: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('overtime_requests')
      .update({
        status: 'rejected',
        approved_by: approverId,
        approved_by_name: approverName,
        approved_at: new Date().toISOString(),
        rejection_reason: rejectionReason
      })
      .eq('id', requestId);
    
    if (error) {
      console.error('Error rejecting overtime request:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error rejecting overtime request:', error);
    return false;
  }
};

// Generate payroll for a month
export const generateMonthlyPayroll = async (
  userId: string,
  userType: 'officer' | 'staff',
  month: number,
  year: number,
  monthlySalary: number
): Promise<string | null> => {
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    // Calculate working days
    let workingDays = 0;
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) workingDays++;
    }
    
    // Detect uninformed leave
    const uninformedDays = await detectUninformedLeave(userId, month, year, userType);
    const uninformedLeaveDays = uninformedDays.length;
    
    // Calculate LOP deduction
    const lopDeduction = calculateLOPDeduction(monthlySalary, uninformedLeaveDays);
    const netPay = monthlySalary - lopDeduction;
    
    // Insert or update payroll record
    const { data, error } = await supabase
      .from('payroll_records')
      .upsert({
        user_id: userId,
        user_type: userType,
        month,
        year,
        working_days: workingDays,
        days_lop: uninformedLeaveDays,
        uninformed_leave_days: uninformedLeaveDays,
        monthly_salary: monthlySalary,
        lop_deduction: lopDeduction,
        gross_salary: monthlySalary,
        total_deductions: lopDeduction,
        net_pay: netPay,
        status: 'draft'
      }, {
        onConflict: 'user_id,month,year'
      })
      .select('id')
      .single();
    
    if (error) {
      console.error('Error generating payroll:', error);
      return null;
    }
    
    return data?.id || null;
  } catch (error) {
    console.error('Error generating payroll:', error);
    return null;
  }
};

// Fetch payroll records
export const fetchPayrollRecords = async (
  month?: number,
  year?: number,
  status?: string
): Promise<any[]> => {
  try {
    let query = supabase
      .from('payroll_records')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (month) query = query.eq('month', month);
    if (year) query = query.eq('year', year);
    if (status) query = query.eq('status', status);
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching payroll records:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching payroll records:', error);
    return [];
  }
};
