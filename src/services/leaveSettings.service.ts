import { supabase } from '@/integrations/supabase/client';

export interface LeaveSettings {
  leaves_per_year: number;
  leaves_per_month: number;
  max_carry_forward: number;
  max_leaves_per_month: number;
  gps_checkin_enabled: boolean;
  reminder_enabled_officer: boolean;
  reminder_enabled_staff: boolean;
  reminder_minutes_before: number;
}

// Cache for settings
let settingsCache: LeaveSettings | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const leaveSettingsService = {
  getSettings: async (): Promise<LeaveSettings> => {
    const now = Date.now();
    
    // Return cached if still valid
    if (settingsCache && (now - lastFetchTime) < CACHE_TTL) {
      return settingsCache;
    }

    const { data, error } = await supabase
      .from('leave_settings')
      .select('setting_key, setting_value');

    if (error) {
      console.error('Failed to fetch leave settings:', error);
      // Return defaults on error
      return {
        leaves_per_year: 12,
        leaves_per_month: 1,
        max_carry_forward: 1,
        max_leaves_per_month: 2,
        gps_checkin_enabled: true,
        reminder_enabled_officer: false,
        reminder_enabled_staff: false,
        reminder_minutes_before: 5
      };
    }

    const settings: LeaveSettings = {
      leaves_per_year: 12,
      leaves_per_month: 1,
      max_carry_forward: 1,
      max_leaves_per_month: 2,
      gps_checkin_enabled: true,
      reminder_enabled_officer: false,
      reminder_enabled_staff: false,
      reminder_minutes_before: 5
    };

    data?.forEach(row => {
      if (row.setting_key === 'gps_checkin_enabled' || row.setting_key === 'reminder_enabled_officer' || row.setting_key === 'reminder_enabled_staff') {
        const value = row.setting_value;
        const boolValue = value === true || value === 'true';
        if (row.setting_key === 'gps_checkin_enabled') settings.gps_checkin_enabled = boolValue;
        if (row.setting_key === 'reminder_enabled_officer') settings.reminder_enabled_officer = boolValue;
        if (row.setting_key === 'reminder_enabled_staff') settings.reminder_enabled_staff = boolValue;
      } else {
        const value = typeof row.setting_value === 'string' 
          ? parseInt(row.setting_value) 
          : Number(row.setting_value);
        
        switch (row.setting_key) {
          case 'leaves_per_year':
            settings.leaves_per_year = value;
            break;
          case 'leaves_per_month':
            settings.leaves_per_month = value;
            break;
          case 'max_carry_forward':
            settings.max_carry_forward = value;
            break;
          case 'max_leaves_per_month':
            settings.max_leaves_per_month = value;
            break;
          case 'reminder_minutes_before':
            settings.reminder_minutes_before = value || 5;
            break;
        }
      }
    });

    settingsCache = settings;
    lastFetchTime = now;
    
    return settings;
  },

  updateSetting: async (key: string, value: number | boolean): Promise<void> => {
    const { error } = await supabase
      .from('leave_settings')
      .update({ setting_value: value })
      .eq('setting_key', key);

    if (error) throw error;
    
    // Invalidate cache
    settingsCache = null;
  },

  updateAllSettings: async (settings: LeaveSettings): Promise<void> => {
    const updates = [
      { key: 'leaves_per_year', value: settings.leaves_per_year },
      { key: 'leaves_per_month', value: settings.leaves_per_month },
      { key: 'max_carry_forward', value: settings.max_carry_forward },
      { key: 'max_leaves_per_month', value: settings.max_leaves_per_month },
      { key: 'gps_checkin_enabled', value: settings.gps_checkin_enabled },
      { key: 'reminder_enabled_officer', value: settings.reminder_enabled_officer },
      { key: 'reminder_enabled_staff', value: settings.reminder_enabled_staff },
      { key: 'reminder_minutes_before', value: settings.reminder_minutes_before }
    ];

    for (const { key, value } of updates) {
      const { error } = await supabase
        .from('leave_settings')
        .update({ setting_value: value })
        .eq('setting_key', key);

      if (error) throw error;
    }
    
    // Invalidate cache
    settingsCache = null;
  },

  // Quick helper to check if GPS is enabled (with caching)
  isGpsEnabled: async (): Promise<boolean> => {
    const settings = await leaveSettingsService.getSettings();
    return settings.gps_checkin_enabled;
  },

  clearCache: () => {
    settingsCache = null;
  }
};
