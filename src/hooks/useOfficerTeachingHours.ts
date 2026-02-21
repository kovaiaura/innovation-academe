import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TeachingHoursMap {
  [officerId: string]: number;
}

export function useOfficerTeachingHours(institutionId?: string) {
  // Get current month boundaries
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  return useQuery({
    queryKey: ['officer-teaching-hours', institutionId, monthStart],
    queryFn: async (): Promise<TeachingHoursMap> => {
      if (!institutionId) return {};

      // Fetch officer attendance records for the current month
      const { data: attendanceRecords, error } = await supabase
        .from('officer_attendance')
        .select('officer_id, total_hours_worked')
        .eq('institution_id', institutionId)
        .eq('status', 'present')
        .gte('date', monthStart)
        .lte('date', monthEnd);

      if (error) {
        console.error('Error fetching officer attendance:', error);
        return {};
      }

      if (!attendanceRecords || attendanceRecords.length === 0) {
        return {};
      }

      // Sum total_hours_worked per officer
      const hoursMap: TeachingHoursMap = {};

      for (const record of attendanceRecords) {
        if (!record.officer_id) continue;
        const hours = record.total_hours_worked || 0;
        hoursMap[record.officer_id] = (hoursMap[record.officer_id] || 0) + hours;
      }

      // Round to 1 decimal place
      Object.keys(hoursMap).forEach(id => {
        hoursMap[id] = Math.round(hoursMap[id] * 10) / 10;
      });

      return hoursMap;
    },
    enabled: !!institutionId,
  });
}
