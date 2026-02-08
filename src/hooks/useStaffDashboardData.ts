import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth, addDays, getDaysInMonth, eachDayOfInterval, isAfter } from 'date-fns';
import { calendarDayTypeService } from '@/services/calendarDayType.service';

interface AttendanceSummary {
  daysPresent: number;
  totalHoursWorked: number;
  approvedOvertimeHours: number;
  paidHolidays: number;
  paidLeaveDays: number;
  weekends: number;
  payableDays: number;
}

interface SalaryCalculation {
  monthlyBase: number;
  daysPresent: number;
  workingDays: number;
  earnedSalary: number;
  overtimeHours: number;
  overtimePay: number;
  totalEarnings: number;
  progressPercentage: number;
  payableDays: number;
  paidHolidays: number;
  paidLeaveDays: number;
  weekends: number;
  perDaySalary: number;
}

interface DashboardStats {
  totalInstitutions: number;
  activeInstitutions: number;
  totalOfficers: number;
  totalStudents: number;
  expiringAgreements: number;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  due_date: string | null;
}

/**
 * Hook to fetch staff's monthly attendance summary with proper payable days calculation
 */
export function useStaffAttendanceSummary(userId: string | undefined) {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const today = now;
  const endDate = isAfter(monthEnd, today) ? today : monthEnd;

  const startDateStr = format(monthStart, 'yyyy-MM-dd');
  const endDateStr = format(endDate, 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['staff-attendance-summary-v2', userId, startDateStr],
    queryFn: async (): Promise<AttendanceSummary> => {
      if (!userId) return { daysPresent: 0, totalHoursWorked: 0, approvedOvertimeHours: 0, paidHolidays: 0, paidLeaveDays: 0, weekends: 0, payableDays: 0 };

      // Fetch attendance records
      const { data: attendanceData, error: attError } = await supabase
        .from('staff_attendance')
        .select('date, total_hours_worked, overtime_hours')
        .eq('user_id', userId)
        .gte('date', startDateStr)
        .lte('date', endDateStr)
        .in('status', ['checked_out', 'auto_checkout']);

      if (attError) throw attError;

      // Fetch approved overtime only
      const { data: overtimeData } = await supabase
        .from('overtime_requests')
        .select('requested_hours')
        .eq('user_id', userId)
        .eq('status', 'approved')
        .gte('date', startDateStr)
        .lte('date', endDateStr);

      // Fetch holidays and weekends from company calendar
      const nonWorkingDays = await calendarDayTypeService.getNonWorkingDaysInRange(
        'company',
        startDateStr,
        endDateStr
      );

      // Fetch approved paid leaves
      const { data: leavesData } = await supabase
        .from('leave_applications')
        .select('start_date, end_date, paid_days, is_lop')
        .eq('applicant_id', userId)
        .eq('status', 'approved')
        .or(`start_date.lte.${endDateStr},end_date.gte.${startDateStr}`);

      // Calculate present days
      const presentDates = new Set(attendanceData?.map(a => a.date) || []);
      const daysPresent = presentDates.size;
      const totalHoursWorked = attendanceData?.reduce((sum, d) => sum + (d.total_hours_worked || 0), 0) || 0;
      
      // Only approved overtime hours
      const approvedOvertimeHours = overtimeData?.reduce((sum, o) => sum + (Number(o.requested_hours) || 0), 0) || 0;

      // Count weekends and holidays up to today
      const allDays = eachDayOfInterval({ start: monthStart, end: endDate });
      const weekendSet = new Set(nonWorkingDays.weekends);
      const holidaySet = new Set(nonWorkingDays.holidays);
      
      let weekends = 0;
      let paidHolidays = 0;
      
      for (const day of allDays) {
        const dateStr = format(day, 'yyyy-MM-dd');
        if (weekendSet.has(dateStr)) {
          weekends++;
        } else if (holidaySet.has(dateStr)) {
          paidHolidays++;
        }
      }

      // Calculate paid leave days
      let paidLeaveDays = 0;
      (leavesData || []).forEach((leave) => {
        if (!leave.is_lop && leave.paid_days) {
          paidLeaveDays += leave.paid_days;
        }
      });

      // Total payable days = present + paid holidays + paid leave + weekends
      const payableDays = daysPresent + paidHolidays + paidLeaveDays + weekends;

      return { 
        daysPresent, 
        totalHoursWorked, 
        approvedOvertimeHours,
        paidHolidays,
        paidLeaveDays,
        weekends,
        payableDays
      };
    },
    enabled: !!userId,
  });
}

/**
 * Hook to calculate staff's salary based on attendance with correct per-day calculation
 */
export function useStaffSalaryCalculation(
  userId: string | undefined,
  annualSalary: number | undefined,
  overtimeMultiplier: number = 1.5,
  normalWorkingHours: number = 8
) {
  const { data: attendanceSummary, isLoading } = useStaffAttendanceSummary(userId);

  const now = new Date();
  // Use actual days in the month for per-day calculation
  const daysInMonth = getDaysInMonth(now);

  const monthlyBase = (annualSalary || 0) / 12;
  // Per day salary = monthly salary / actual days in month (28, 29, 30, or 31)
  const perDaySalary = monthlyBase / daysInMonth;
  const perHourRate = perDaySalary / normalWorkingHours;

  const daysPresent = attendanceSummary?.daysPresent || 0;
  const payableDays = attendanceSummary?.payableDays || 0;
  const paidHolidays = attendanceSummary?.paidHolidays || 0;
  const paidLeaveDays = attendanceSummary?.paidLeaveDays || 0;
  const weekends = attendanceSummary?.weekends || 0;
  const approvedOvertimeHours = attendanceSummary?.approvedOvertimeHours || 0;

  // Earned salary = payable days × per day salary
  const earnedSalary = payableDays * perDaySalary;
  // Overtime pay uses only approved overtime
  const overtimePay = approvedOvertimeHours * perHourRate * overtimeMultiplier;
  const totalEarnings = earnedSalary + overtimePay;

  // Calculate progress based on days elapsed vs payable days
  const dayOfMonth = now.getDate();
  const progressPercentage = dayOfMonth > 0 ? (payableDays / dayOfMonth) * 100 : 0;

  return {
    isLoading,
    data: {
      monthlyBase,
      daysPresent,
      workingDays: daysInMonth,
      earnedSalary,
      overtimeHours: approvedOvertimeHours,
      overtimePay,
      totalEarnings,
      progressPercentage: Math.min(progressPercentage, 100),
      payableDays,
      paidHolidays,
      paidLeaveDays,
      weekends,
      perDaySalary,
    } as SalaryCalculation,
  };
}

/**
 * Hook to fetch tasks assigned to staff
 */
export function useStaffTasks(userId: string | undefined) {
  return useQuery({
    queryKey: ['staff-tasks', userId],
    queryFn: async (): Promise<Task[]> => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('tasks')
        .select('id, title, description, priority, status, due_date')
        .eq('assigned_to_id', userId)
        .neq('status', 'completed')
        .neq('status', 'approved')
        .order('priority', { ascending: false })
        .order('due_date', { ascending: true })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });
}

/**
 * Hook to fetch dashboard stats for system admin
 */
export function useStaffDashboardStats() {
  return useQuery({
    queryKey: ['staff-dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      // Get total institutions
      const { count: totalInstitutions } = await supabase
        .from('institutions')
        .select('*', { count: 'exact', head: true });

      // Get active institutions
      const { count: activeInstitutions } = await supabase
        .from('institutions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Get total officers
      const { count: totalOfficers } = await supabase
        .from('officers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Get total students (active only)
      const { count: totalStudents } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Get expiring agreements (within 30 days)
      const thirtyDaysFromNow = format(addDays(new Date(), 30), 'yyyy-MM-dd');
      const { count: expiringAgreements } = await supabase
        .from('institutions')
        .select('*', { count: 'exact', head: true })
        .lte('mou_end_date', thirtyDaysFromNow)
        .gte('mou_end_date', format(new Date(), 'yyyy-MM-dd'));

      return {
        totalInstitutions: totalInstitutions || 0,
        activeInstitutions: activeInstitutions || 0,
        totalOfficers: totalOfficers || 0,
        totalStudents: totalStudents || 0,
        expiringAgreements: expiringAgreements || 0,
      };
    },
  });
}

/**
 * Hook to fetch user's profile with designation
 */
export function useUserProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['user-profile', userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, designation, department, position_name, annual_salary, employee_id')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}
