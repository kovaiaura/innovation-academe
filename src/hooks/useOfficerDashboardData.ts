import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth, getDaysInMonth, eachDayOfInterval, isAfter } from 'date-fns';
import { calendarDayTypeService } from '@/services/calendarDayType.service';

interface AttendanceSummary {
  daysPresent: number;
  totalHoursWorked: number;
  approvedOvertimeHours: number;
  paidHolidays: number;
  paidLeaveDays: number;
  weekends: number;
  payableDays: number; // present + paid holidays + paid leave + weekends
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
  upcomingSessions: number;
  activeProjects: number;
  labEquipment: number;
  studentsEnrolled: number;
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
 * Hook to fetch officer's monthly attendance summary with proper payable days calculation
 */
export function useOfficerAttendanceSummary(officerId: string | undefined, institutionId: string | undefined) {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const today = now;
  const endDate = isAfter(monthEnd, today) ? today : monthEnd;

  const startDateStr = format(monthStart, 'yyyy-MM-dd');
  const endDateStr = format(endDate, 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['officer-attendance-summary-v2', officerId, institutionId, startDateStr],
    queryFn: async (): Promise<AttendanceSummary> => {
      if (!officerId) return { daysPresent: 0, totalHoursWorked: 0, approvedOvertimeHours: 0, paidHolidays: 0, paidLeaveDays: 0, weekends: 0, payableDays: 0 };

      // Fetch attendance records
      const { data: attendanceData, error: attError } = await supabase
        .from('officer_attendance')
        .select('date, total_hours_worked, overtime_hours')
        .eq('officer_id', officerId)
        .gte('date', startDateStr)
        .lte('date', endDateStr)
        .in('status', ['checked_out', 'auto_checkout']);

      if (attError) throw attError;

      // Fetch approved overtime only
      const { data: overtimeData } = await supabase
        .from('overtime_requests')
        .select('requested_hours')
        .eq('officer_id', officerId)
        .eq('status', 'approved')
        .gte('date', startDateStr)
        .lte('date', endDateStr);

      // Fetch holidays and weekends from calendar
      const nonWorkingDays = await calendarDayTypeService.getNonWorkingDaysInRange(
        'institution',
        startDateStr,
        endDateStr,
        institutionId || undefined
      );

      // Fetch approved paid leaves
      const { data: leavesData } = await supabase
        .from('leave_applications')
        .select('start_date, end_date, paid_days, is_lop')
        .eq('applicant_id', officerId)
        .eq('status', 'approved')
        .or(`start_date.lte.${endDateStr},end_date.gte.${startDateStr}`);

      // Calculate present days
      const presentDates = new Set(attendanceData?.map(a => a.date) || []);
      const daysPresent = presentDates.size;
      const totalHoursWorked = attendanceData?.reduce((sum, d) => sum + (d.total_hours_worked || 0), 0) || 0;
      
      // Only approved overtime hours
      const approvedOvertimeHours = overtimeData?.reduce((sum, o) => sum + (Number(o.requested_hours) || 0), 0) || 0;

      // Count weekends up to today
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
    enabled: !!officerId,
  });
}

/**
 * Hook to calculate officer's salary based on attendance with correct per-day calculation
 */
export function useOfficerSalaryCalculation(
  officerId: string | undefined,
  annualSalary: number | undefined,
  overtimeMultiplier: number = 1.5,
  normalWorkingHours: number = 8,
  institutionId?: string
) {
  const { data: attendanceSummary, isLoading } = useOfficerAttendanceSummary(officerId, institutionId);

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
 * Hook to fetch tasks assigned to officer
 */
export function useOfficerTasks(userId: string | undefined) {
  return useQuery({
    queryKey: ['officer-tasks', userId],
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
 * Hook to fetch dashboard stats for officer
 */
export function useOfficerDashboardStats(officerId: string | undefined, institutionId: string | undefined) {
  return useQuery({
    queryKey: ['officer-dashboard-stats', officerId, institutionId],
    queryFn: async (): Promise<DashboardStats> => {
      if (!officerId || !institutionId) {
        return { upcomingSessions: 0, activeProjects: 0, labEquipment: 0, studentsEnrolled: 0 };
      }

      const today = format(new Date(), 'EEEE'); // e.g., 'Monday'

      // Get upcoming sessions count from timetable assignments
      const { count: sessionsCount } = await supabase
        .from('institution_timetable_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('institution_id', institutionId)
        .eq('teacher_id', officerId);

      // Get active projects count (use multiple possible status values)
      const { count: projectsCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('institution_id', institutionId)
        .in('status', ['in_progress', 'ongoing', 'submitted']);

      // Get lab equipment count
      const { count: equipmentCount } = await supabase
        .from('inventory_items')
        .select('*', { count: 'exact', head: true })
        .eq('institution_id', institutionId);

      // Get students enrolled count
      const { count: studentsCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('institution_id', institutionId)
        .eq('status', 'active');

      return {
        upcomingSessions: sessionsCount || 0,
        activeProjects: projectsCount || 0,
        labEquipment: equipmentCount || 0,
        studentsEnrolled: studentsCount || 0,
      };
    },
    enabled: !!officerId && !!institutionId,
  });
}
