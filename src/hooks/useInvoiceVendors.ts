import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface InvoiceVendor {
  id: string;
  vendor_name: string;
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
  country?: string;
  created_at?: string;
}

export type CreateVendorInput = Omit<InvoiceVendor, 'id' | 'created_at'>;

export function useInvoiceVendors() {
  const queryClient = useQueryClient();

  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ['invoice-vendors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoice_vendors')
        .select('*')
        .order('vendor_name');
      if (error) throw error;
      return data as InvoiceVendor[];
    },
  });

  const addVendor = useMutation({
    mutationFn: async (input: CreateVendorInput) => {
      const { data: user } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('invoice_vendors')
        .insert({ ...input, created_by: user?.user?.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice-vendors'] });
      toast.success('Vendor added successfully');
    },
    onError: () => toast.error('Failed to add vendor'),
  });

  const updateVendor = useMutation({
    mutationFn: async ({ id, ...input }: InvoiceVendor) => {
      const { error } = await supabase
        .from('invoice_vendors')
        .update(input)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice-vendors'] });
      toast.success('Vendor updated');
    },
    onError: () => toast.error('Failed to update vendor'),
  });

  const deleteVendor = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('invoice_vendors')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice-vendors'] });
      toast.success('Vendor deleted');
    },
    onError: () => toast.error('Failed to delete vendor'),
  });

  return { vendors, isLoading, addVendor, updateVendor, deleteVendor };
}
