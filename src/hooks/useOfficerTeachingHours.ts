import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TeachingHoursMap {
  [officerId: string]: number;
}

export function useOfficerTeachingHours(institutionId?: string) {
  return useQuery({
    queryKey: ['officer-teaching-hours', institutionId],
    queryFn: async (): Promise<TeachingHoursMap> => {
      if (!institutionId) return {};

      // Fetch all completed sessions for the institution
      const { data: completedSessions, error } = await supabase
        .from('class_session_attendance')
        .select('officer_id, period_time, period_label, timetable_assignment_id')
        .eq('institution_id', institutionId)
        .eq('is_session_completed', true);

      if (error) {
        console.error('Error fetching completed sessions:', error);
        return {};
      }

      if (!completedSessions || completedSessions.length === 0) {
        return {};
      }

      // Calculate teaching hours per officer
      const hoursMap: TeachingHoursMap = {};

      for (const session of completedSessions) {
        if (!session.officer_id) continue;

        let durationMinutes = 0;

        // Try to parse period_time if available (e.g., "09:00 - 09:45")
        if (session.period_time) {
          const timeMatch = session.period_time.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
          if (timeMatch) {
            const startHour = parseInt(timeMatch[1]);
            const startMin = parseInt(timeMatch[2]);
            const endHour = parseInt(timeMatch[3]);
            const endMin = parseInt(timeMatch[4]);
            
            durationMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
          }
        }

        // If we couldn't parse period_time, default to 45 minutes per session
        if (durationMinutes <= 0) {
          durationMinutes = 45;
        }

        // Convert to hours and add to officer's total
        const hours = durationMinutes / 60;
        hoursMap[session.officer_id] = (hoursMap[session.officer_id] || 0) + hours;
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
