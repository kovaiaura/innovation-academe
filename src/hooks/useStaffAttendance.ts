/**
 * React Query hooks for Staff Attendance
 * Mirrors officer attendance hooks but uses staff_attendance table
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export const staffAttendanceKeys = {
  all: ['staff-attendance'] as const,
  today: (userId: string) => [...staffAttendanceKeys.all, 'today', userId] as const,
};

/**
 * Hook to get staff's today attendance from DB
 */
export const useStaffTodayAttendance = (userId: string) => {
  return useQuery({
    queryKey: staffAttendanceKeys.today(userId),
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('staff_attendance')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    refetchInterval: 30000,
  });
};

/**
 * Hook for staff check-in mutation
 */
export const useStaffCheckIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      user_id: string;
      location: { latitude: number; longitude: number } | null;
      skip_gps?: boolean;
    }) => {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();

      // Get profile info for position_id and institution_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('position_id, institution_id')
        .eq('id', params.user_id)
        .single();

      const { data, error } = await supabase
        .from('staff_attendance')
        .insert({
          user_id: params.user_id,
          date: today,
          check_in_time: now,
          status: 'checked_in',
          position_id: profile?.position_id || null,
          institution_id: profile?.institution_id || null,
          check_in_latitude: (params.location && !params.skip_gps) ? params.location.latitude : null,
          check_in_longitude: (params.location && !params.skip_gps) ? params.location.longitude : null,
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: staffAttendanceKeys.today(variables.user_id),
      });
    },
  });
};

/**
 * Hook for staff check-out mutation
 */
export const useStaffCheckOut = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      attendance_id: string;
      user_id: string;
      location: { latitude: number; longitude: number } | null;
      skip_gps?: boolean;
      normal_working_hours?: number;
    }) => {
      const now = new Date().toISOString();

      // Get the check-in record to calculate hours
      const { data: record } = await supabase
        .from('staff_attendance')
        .select('check_in_time')
        .eq('id', params.attendance_id)
        .single();

      let totalHours = 0;
      let overtimeHours = 0;
      if (record?.check_in_time) {
        const checkIn = new Date(record.check_in_time);
        const checkOut = new Date(now);
        totalHours = Math.round(((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60)) * 100) / 100;
        const normalHours = params.normal_working_hours || 8;
        overtimeHours = Math.max(0, Math.round((totalHours - normalHours) * 100) / 100);
      }

      const { data, error } = await supabase
        .from('staff_attendance')
        .update({
          check_out_time: now,
          status: 'checked_out' as const,
          total_hours_worked: totalHours,
          overtime_hours: overtimeHours,
          check_out_latitude: (params.location && !params.skip_gps) ? params.location.latitude : null,
          check_out_longitude: (params.location && !params.skip_gps) ? params.location.longitude : null,
        })
        .eq('id', params.attendance_id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data, totalHours, overtimeHours };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: staffAttendanceKeys.today(variables.user_id),
      });
    },
  });
};

/**
 * Hook for real-time staff attendance updates
 */
export const useStaffAttendanceRealtime = (userId?: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('staff-attendance-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'staff_attendance',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: staffAttendanceKeys.all,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, userId]);
};
