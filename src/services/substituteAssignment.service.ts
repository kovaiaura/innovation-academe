import { supabase } from '@/integrations/supabase/client';
import { format, eachDayOfInterval, parseISO } from 'date-fns';

export interface AffectedTimetableSlot {
  id: string;
  day: string;
  date: string;
  period_id: string;
  period_label: string;
  period_time: string;
  class_id: string;
  class_name: string;
  subject: string;
  room: string | null;
  start_time: string;
  end_time: string;
}

export interface AvailableSubstitute {
  officer_id: string;
  officer_name: string;
  user_id: string | null;
  skills: string[];
  is_available: boolean;
}

export interface SubstituteAssignmentData {
  slot_id: string;
  date: string;
  class_id: string;
  class_name: string;
  period_id: string;
  period_label: string;
  period_time: string;
  subject: string;
  original_officer_id: string;
  original_officer_name: string;
  substitute_officer_id: string;
  substitute_officer_name: string;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const substituteAssignmentService = {
  // Get affected timetable slots for an officer during a date range
  getAffectedSlots: async (
    officerId: string,
    institutionId: string,
    startDate: string,
    endDate: string
  ): Promise<AffectedTimetableSlot[]> => {
    // Get all dates in range
    const dates = eachDayOfInterval({
      start: parseISO(startDate),
      end: parseISO(endDate)
    });

    // Get timetable assignments where officer is primary, secondary, or backup
    // Use separate queries and combine results since .or() with foreign key filters can be tricky
    const { data: assignments, error } = await supabase
      .from('institution_timetable_assignments')
      .select(`
        id,
        day,
        class_id,
        class_name,
        subject,
        room,
        period_id,
        teacher_id,
        secondary_officer_id,
        backup_officer_id,
        institution_periods (
          label,
          start_time,
          end_time
        )
      `)
      .eq('institution_id', institutionId);

    if (error || !assignments) {
      console.error('Error fetching timetable assignments:', error);
      return [];
    }

    // Filter assignments where the officer is assigned as primary, secondary, or backup
    const officerAssignments = assignments.filter(a => 
      a.teacher_id === officerId || 
      a.secondary_officer_id === officerId || 
      a.backup_officer_id === officerId
    );

    const affectedSlots: AffectedTimetableSlot[] = [];

    for (const date of dates) {
      const dayName = DAY_NAMES[date.getDay()];
      const dateStr = format(date, 'yyyy-MM-dd');

      // Find assignments for this day (case-insensitive comparison)
      const dayAssignments = officerAssignments.filter(a => 
        a.day.toLowerCase().trim() === dayName.toLowerCase()
      );

      for (const assignment of dayAssignments) {
        const period = assignment.institution_periods as any;
        affectedSlots.push({
          id: assignment.id,
          day: dayName,
          date: dateStr,
          period_id: assignment.period_id,
          period_label: period?.label || 'Unknown Period',
          period_time: period ? `${period.start_time || ''} - ${period.end_time || ''}` : '',
          class_id: assignment.class_id,
          class_name: assignment.class_name,
          subject: assignment.subject,
          room: assignment.room,
          start_time: period?.start_time || '',
          end_time: period?.end_time || ''
        });
      }
    }

    return affectedSlots.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.start_time.localeCompare(b.start_time);
    });
  },

  // Get available substitutes for a specific slot
  getAvailableSubstitutes: async (
    institutionId: string,
    day: string,
    periodId: string,
    excludeOfficerId: string
  ): Promise<AvailableSubstitute[]> => {
    // Get all officers assigned to this institution
    const { data: officers, error } = await supabase
      .from('officers')
      .select('id, full_name, user_id, skills')
      .contains('assigned_institutions', [institutionId])
      .eq('status', 'active')
      .neq('id', excludeOfficerId);

    if (error || !officers) return [];

    // Check which officers have conflicting slots at this time
    // An officer is busy if they are primary, secondary, or backup for any slot at this time
    const { data: conflictingAssignments } = await supabase
      .from('institution_timetable_assignments')
      .select('teacher_id, secondary_officer_id, backup_officer_id')
      .eq('institution_id', institutionId)
      .ilike('day', day)
      .eq('period_id', periodId);

    const busyOfficerIds = new Set<string>();
    
    if (conflictingAssignments) {
      for (const a of conflictingAssignments) {
        if (a.teacher_id) busyOfficerIds.add(a.teacher_id);
        if (a.secondary_officer_id) busyOfficerIds.add(a.secondary_officer_id);
        if (a.backup_officer_id) busyOfficerIds.add(a.backup_officer_id);
      }
    }

    return officers.map(officer => ({
      officer_id: officer.id,
      officer_name: officer.full_name,
      user_id: officer.user_id,
      skills: (officer.skills as string[]) || [],
      is_available: !busyOfficerIds.has(officer.id)
    }));
  },

  // Get all officers from an institution (for substitute selection)
  getAllInstitutionOfficers: async (
    institutionId: string,
    excludeOfficerId: string
  ): Promise<AvailableSubstitute[]> => {
    const { data: officers, error } = await supabase
      .from('officers')
      .select('id, full_name, user_id, skills')
      .contains('assigned_institutions', [institutionId])
      .eq('status', 'active')
      .neq('id', excludeOfficerId);

    if (error || !officers) return [];

    return officers.map(officer => ({
      officer_id: officer.id,
      officer_name: officer.full_name,
      user_id: officer.user_id,
      skills: (officer.skills as string[]) || [],
      is_available: true
    }));
  }
};
