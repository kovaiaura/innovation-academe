import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface InvoiceSettings {
  id: string;
  prefix: string;
  suffix: string;
  current_number: number;
  number_padding: number;
}

export function useInvoiceSettings() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['invoice-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoice_settings')
        .select('*')
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as InvoiceSettings | null;
    },
  });

  const saveSettings = useMutation({
    mutationFn: async (input: Omit<InvoiceSettings, 'id'>) => {
      const { data: user } = await supabase.auth.getUser();
      if (settings?.id) {
        const { error } = await supabase
          .from('invoice_settings')
          .update({
            prefix: input.prefix,
            suffix: input.suffix,
            current_number: input.current_number,
            number_padding: input.number_padding,
          })
          .eq('id', settings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('invoice_settings')
          .insert({
            prefix: input.prefix,
            suffix: input.suffix,
            current_number: input.current_number,
            number_padding: input.number_padding,
            created_by: user?.user?.id,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice-settings'] });
      toast.success('Invoice numbering settings saved');
    },
    onError: () => toast.error('Failed to save settings'),
  });

  const getNextNumber = (): string => {
    const prefix = settings?.prefix || '';
    const suffix = settings?.suffix || '';
    const nextNum = (settings?.current_number || 0) + 1;
    const padding = settings?.number_padding || 3;
    return `${prefix}${String(nextNum).padStart(padding, '0')}${suffix}`;
  };

  const incrementAndGetNumber = async (): Promise<string> => {
    const { data, error } = await supabase.rpc('get_next_invoice_number_v2');
    if (error) throw error;
    return data as string;
  };

  return { settings, isLoading, saveSettings, getNextNumber, incrementAndGetNumber };
}
