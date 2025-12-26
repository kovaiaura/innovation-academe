import { supabase } from '@/integrations/supabase/client';

export interface LeaveSettings {
  leaves_per_year: number;
  leaves_per_month: number;
  max_carry_forward: number;
  max_leaves_per_month: number;
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
        max_leaves_per_month: 2
      };
    }

    const settings: LeaveSettings = {
      leaves_per_year: 12,
      leaves_per_month: 1,
      max_carry_forward: 1,
      max_leaves_per_month: 2
    };

    data?.forEach(row => {
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
      }
    });

    settingsCache = settings;
    lastFetchTime = now;
    
    return settings;
  },

  updateSetting: async (key: string, value: number): Promise<void> => {
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
      { key: 'max_leaves_per_month', value: settings.max_leaves_per_month }
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

  clearCache: () => {
    settingsCache = null;
  }
};
