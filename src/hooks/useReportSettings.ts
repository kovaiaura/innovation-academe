import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useReportSettings() {
  return useQuery({
    queryKey: ['report-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_profiles')
        .select('report_logo_url, report_logo_width, report_logo_height')
        .eq('is_default', true)
        .single();
      if (error) throw error;
      return data;
    },
  });
}
