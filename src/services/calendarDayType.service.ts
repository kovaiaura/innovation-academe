import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export type CalendarDayType = 'working' | 'weekend' | 'holiday';
export type CalendarType = 'company' | 'institution';

export interface CalendarDayTypeEntry {
  id: string;
  calendar_type: CalendarType;
  institution_id?: string | null;
  date: string;
  day_type: CalendarDayType;
  description?: string | null;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Get day types for a specific month
export const getDayTypesForMonth = async (
  calendarType: CalendarType,
  year: number,
  month: number,
  institutionId?: string
): Promise<Map<string, CalendarDayType>> => {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = format(new Date(year, month, 0), 'yyyy-MM-dd');
  
  let query = supabase
    .from('calendar_day_types')
    .select('*')
    .eq('calendar_type', calendarType)
    .gte('date', startDate)
    .lte('date', endDate);
  
  if (calendarType === 'institution' && institutionId) {
    query = query.eq('institution_id', institutionId);
  } else if (calendarType === 'company') {
    query = query.is('institution_id', null);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching day types:', error);
    return new Map();
  }
  
  const dayTypesMap = new Map<string, CalendarDayType>();
  (data || []).forEach((entry) => {
    dayTypesMap.set(entry.date, entry.day_type as CalendarDayType);
  });
  
  return dayTypesMap;
};

// Get all day types for a year range (for calendar navigation)
export const getDayTypesForRange = async (
  calendarType: CalendarType,
  startYear: number,
  endYear: number,
  institutionId?: string
): Promise<Map<string, CalendarDayType>> => {
  const startDate = `${startYear}-01-01`;
  const endDate = `${endYear}-12-31`;
  
  let query = supabase
    .from('calendar_day_types')
    .select('*')
    .eq('calendar_type', calendarType)
    .gte('date', startDate)
    .lte('date', endDate);
  
  if (calendarType === 'institution' && institutionId) {
    query = query.eq('institution_id', institutionId);
  } else if (calendarType === 'company') {
    query = query.is('institution_id', null);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching day types:', error);
    return new Map();
  }
  
  const dayTypesMap = new Map<string, CalendarDayType>();
  (data || []).forEach((entry) => {
    dayTypesMap.set(entry.date, entry.day_type as CalendarDayType);
  });
  
  return dayTypesMap;
};

// Set or update a single day type
export const setDayType = async (
  calendarType: CalendarType,
  date: string,
  dayType: CalendarDayType,
  institutionId?: string,
  description?: string
): Promise<void> => {
  const { data: existing } = await supabase
    .from('calendar_day_types')
    .select('id')
    .eq('calendar_type', calendarType)
    .eq('date', date)
    .eq('institution_id', institutionId || null)
    .maybeSingle();
  
  if (existing) {
    const { error } = await supabase
      .from('calendar_day_types')
      .update({ day_type: dayType, description, updated_at: new Date().toISOString() })
      .eq('id', existing.id);
    
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('calendar_day_types')
      .insert({
        calendar_type: calendarType,
        institution_id: institutionId || null,
        date,
        day_type: dayType,
        description
      });
    
    if (error) throw error;
  }
};

// Bulk set day types (for quick setup)
export const bulkSetDayTypes = async (
  calendarType: CalendarType,
  dayTypes: { date: string; day_type: CalendarDayType }[],
  institutionId?: string
): Promise<void> => {
  if (dayTypes.length === 0) return;
  
  // Delete existing entries for these dates
  const dates = dayTypes.map(d => d.date);
  
  let deleteQuery = supabase
    .from('calendar_day_types')
    .delete()
    .eq('calendar_type', calendarType)
    .in('date', dates);
  
  if (calendarType === 'institution' && institutionId) {
    deleteQuery = deleteQuery.eq('institution_id', institutionId);
  } else if (calendarType === 'company') {
    deleteQuery = deleteQuery.is('institution_id', null);
  }
  
  await deleteQuery;
  
  // Insert new entries
  const entries = dayTypes.map(d => ({
    calendar_type: calendarType,
    institution_id: institutionId || null,
    date: d.date,
    day_type: d.day_type
  }));
  
  const { error } = await supabase
    .from('calendar_day_types')
    .insert(entries);
  
  if (error) throw error;
};

// Quick setup: Mark weekends for a month
export const quickSetupMonth = async (
  calendarType: CalendarType,
  year: number,
  month: number,
  institutionId?: string
): Promise<void> => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  const dayTypes: { date: string; day_type: CalendarDayType }[] = [];
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = format(d, 'yyyy-MM-dd');
    const dayOfWeek = d.getDay();
    
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      // Saturday or Sunday
      dayTypes.push({ date: dateStr, day_type: 'weekend' });
    } else {
      dayTypes.push({ date: dateStr, day_type: 'working' });
    }
  }
  
  await bulkSetDayTypes(calendarType, dayTypes, institutionId);
};

// Delete a day type entry
export const deleteDayType = async (
  calendarType: CalendarType,
  date: string,
  institutionId?: string
): Promise<void> => {
  let query = supabase
    .from('calendar_day_types')
    .delete()
    .eq('calendar_type', calendarType)
    .eq('date', date);
  
  if (calendarType === 'institution' && institutionId) {
    query = query.eq('institution_id', institutionId);
  } else if (calendarType === 'company') {
    query = query.is('institution_id', null);
  }
  
  const { error } = await query;
  if (error) throw error;
};

// Get working days for payroll calculation
export const getWorkingDaysFromCalendar = async (
  calendarType: CalendarType,
  year: number,
  month: number,
  institutionId?: string
): Promise<string[]> => {
  const dayTypesMap = await getDayTypesForMonth(calendarType, year, month, institutionId);
  const workingDays: string[] = [];
  
  dayTypesMap.forEach((dayType, date) => {
    if (dayType === 'working') {
      workingDays.push(date);
    }
  });
  
  return workingDays.sort();
};

export const calendarDayTypeService = {
  getDayTypesForMonth,
  getDayTypesForRange,
  setDayType,
  bulkSetDayTypes,
  quickSetupMonth,
  deleteDayType,
  getWorkingDaysFromCalendar
};
