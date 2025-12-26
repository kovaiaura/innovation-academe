import { supabase } from '@/integrations/supabase/client';
import { format, parseISO, differenceInMonths, startOfMonth } from 'date-fns';

export interface ProRatedLeaveInfo {
  totalEntitlement: number;
  monthsWorked: number;
  monthlyCredit: number;
  startMonth: number;
  joinDate: string | null;
}

export const leaveCalculationService = {
  /**
   * Calculate pro-rated leave entitlement based on join date
   * Leaves start from the month of joining
   */
  calculateProRatedEntitlement: async (userId: string, year: number): Promise<ProRatedLeaveInfo> => {
    // Get the officer's join date
    const { data: officer, error: officerError } = await supabase
      .from('officers')
      .select('join_date')
      .eq('user_id', userId)
      .single();

    // Default values if no officer record found
    if (officerError || !officer?.join_date) {
      return {
        totalEntitlement: 12,
        monthsWorked: 12,
        monthlyCredit: 1,
        startMonth: 1,
        joinDate: null
      };
    }

    const joinDate = parseISO(officer.join_date);
    const joinYear = joinDate.getFullYear();
    const joinMonth = joinDate.getMonth() + 1; // 1-12

    // If joined before this year, full entitlement
    if (joinYear < year) {
      return {
        totalEntitlement: 12,
        monthsWorked: 12,
        monthlyCredit: 1,
        startMonth: 1,
        joinDate: officer.join_date
      };
    }

    // If joined this year, pro-rate from join month
    if (joinYear === year) {
      const monthsRemaining = 13 - joinMonth; // Include join month
      return {
        totalEntitlement: monthsRemaining,
        monthsWorked: monthsRemaining,
        monthlyCredit: 1,
        startMonth: joinMonth,
        joinDate: officer.join_date
      };
    }

    // If join year is in the future (shouldn't happen but handle it)
    return {
      totalEntitlement: 0,
      monthsWorked: 0,
      monthlyCredit: 0,
      startMonth: 0,
      joinDate: officer.join_date
    };
  },

  /**
   * Get monthly leave data considering join date
   */
  getMonthlyLeaveData: async (userId: string, year: number, month: number) => {
    const proRated = await leaveCalculationService.calculateProRatedEntitlement(userId, year);
    
    // If month is before join month in join year, no leave available
    if (proRated.joinDate) {
      const joinDate = parseISO(proRated.joinDate);
      if (joinDate.getFullYear() === year && month < proRated.startMonth) {
        return {
          eligible: false,
          reason: 'Not yet joined',
          credit: 0,
          balance: 0
        };
      }
    }

    // Get current balance from database
    const { data: balance, error } = await supabase.rpc('get_leave_balance', {
      p_user_id: userId,
      p_year: year,
      p_month: month
    });

    if (error) throw error;

    return {
      eligible: true,
      credit: balance?.[0]?.monthly_credit || 1,
      balance: balance?.[0]?.balance_remaining || 0,
      proRatedInfo: proRated
    };
  },

  /**
   * Get available leave balance considering pro-rated entitlement
   */
  getAvailableBalance: async (userId: string, year: number, month: number): Promise<number> => {
    const proRated = await leaveCalculationService.calculateProRatedEntitlement(userId, year);
    
    // If month is before join month, no balance
    if (proRated.joinDate) {
      const joinDate = parseISO(proRated.joinDate);
      if (joinDate.getFullYear() === year && month < proRated.startMonth) {
        return 0;
      }
    }

    // Get current balance
    const { data: balance, error } = await supabase.rpc('get_leave_balance', {
      p_user_id: userId,
      p_year: year,
      p_month: month
    });

    if (error) throw error;
    return balance?.[0]?.balance_remaining || 0;
  },

  /**
   * Get yearly summary with pro-rated info
   */
  getYearlySummary: async (userId: string, year: number) => {
    const proRated = await leaveCalculationService.calculateProRatedEntitlement(userId, year);
    
    // Get all applications for the year
    const { data: apps, error: appsError } = await supabase
      .from('leave_applications')
      .select('*')
      .eq('applicant_id', userId)
      .gte('start_date', `${year}-01-01`)
      .lte('start_date', `${year}-12-31`);

    if (appsError) throw appsError;

    const approvedApps = (apps || []).filter(a => a.status === 'approved');
    const totalUsed = approvedApps.reduce((sum, a) => sum + (a.paid_days || 0), 0);
    const totalLOP = approvedApps.reduce((sum, a) => sum + (a.lop_days || 0), 0);

    return {
      year,
      proRatedInfo: proRated,
      totalEntitlement: proRated.totalEntitlement,
      totalUsed,
      totalLOP,
      remaining: Math.max(0, proRated.totalEntitlement - totalUsed),
      applications: apps || []
    };
  }
};
