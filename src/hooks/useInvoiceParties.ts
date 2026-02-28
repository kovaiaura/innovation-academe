import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface InvoiceParty {
  id: string;
  party_name: string;
  address?: string;
  city?: string;
  state?: string;
  state_code?: string;
  pincode?: string;
  gstin?: string;
  pan?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  created_at?: string;
}

export type CreatePartyInput = Omit<InvoiceParty, 'id' | 'created_at'>;

export function useInvoiceParties() {
  const queryClient = useQueryClient();

  const { data: parties = [], isLoading } = useQuery({
    queryKey: ['invoice-parties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoice_parties')
        .select('*')
        .order('party_name');
      if (error) throw error;
      return data as InvoiceParty[];
    },
  });

  const addParty = useMutation({
    mutationFn: async (input: CreatePartyInput) => {
      const { data: user } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('invoice_parties')
        .insert({ ...input, created_by: user?.user?.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice-parties'] });
      toast.success('Party added successfully');
    },
    onError: () => toast.error('Failed to add party'),
  });

  const updateParty = useMutation({
    mutationFn: async ({ id, ...input }: InvoiceParty) => {
      const { error } = await supabase
        .from('invoice_parties')
        .update(input)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice-parties'] });
      toast.success('Party updated');
    },
    onError: () => toast.error('Failed to update party'),
  });

  const deleteParty = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('invoice_parties')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice-parties'] });
      toast.success('Party deleted');
    },
    onError: () => toast.error('Failed to delete party'),
  });

  return { parties, isLoading, addParty, updateParty, deleteParty };
}
