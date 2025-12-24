import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface InstitutionFormData {
  name: string;
  slug: string;
  type: 'school' | 'college' | 'university' | 'institute';
  location: string;
  established_year: number;
  contact_email: string;
  contact_phone: string;
  admin_name: string;
  admin_email: string;
  admin_password: string;
  license_type: 'basic' | 'standard' | 'premium' | 'enterprise';
  max_users: number;
  subscription_plan: 'basic' | 'premium' | 'enterprise';
  student_id_prefix: string;
  student_id_suffix: string;
  pricing_model: {
    per_student_cost: number;
    lms_cost: number;
    lap_setup_cost: number;
    monthly_recurring_cost: number;
    trainer_monthly_fee: number;
  };
  gps_location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  attendance_radius_meters: number;
  normal_working_hours: number;
  check_in_time: string;
  check_out_time: string;
}

export interface DbInstitution {
  id: string;
  name: string;
  slug: string;
  code: string | null;
  type: string | null;
  status: string | null;
  address: Record<string, any> | null;
  contact_info: Record<string, any> | null;
  settings: Record<string, any> | null;
  created_at: string | null;
  updated_at: string | null;
}

// Transform DB institution to app format
export function transformDbToApp(db: DbInstitution) {
  const address = (db.address || {}) as Record<string, any>;
  const contact = (db.contact_info || {}) as Record<string, any>;
  const settings = (db.settings || {}) as Record<string, any>;
  
  return {
    id: db.id,
    name: db.name,
    slug: db.slug,
    code: db.code || db.slug.toUpperCase(),
    type: (db.type || 'school') as 'school' | 'college' | 'university' | 'institute',
    location: address.location || '',
    established_year: settings.established_year || new Date().getFullYear(),
    contact_email: contact.email || '',
    contact_phone: contact.phone || '',
    admin_name: contact.admin_name || '',
    admin_email: contact.admin_email || '',
    subscription_status: (db.status || 'active') as 'active' | 'inactive' | 'suspended',
    license_type: (settings.license_type || 'basic') as 'basic' | 'standard' | 'premium' | 'enterprise',
    license_expiry: settings.license_expiry || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    max_users: settings.max_users || 500,
    current_users: settings.current_users || 0,
    subscription_plan: (settings.subscription_plan || 'basic') as 'basic' | 'premium' | 'enterprise',
    student_id_prefix: settings.student_id_prefix || '',
    student_id_suffix: settings.student_id_suffix || '',
    pricing_model: settings.pricing_model || {
      per_student_cost: 0,
      lms_cost: 0,
      lap_setup_cost: 0,
      monthly_recurring_cost: 0,
      trainer_monthly_fee: 0,
    },
    gps_location: address.gps_location || { latitude: 0, longitude: 0, address: '' },
    attendance_radius_meters: settings.attendance_radius_meters || 1500,
    normal_working_hours: settings.normal_working_hours || 8,
    check_in_time: settings.check_in_time || '09:00',
    check_out_time: settings.check_out_time || '17:00',
    total_students: settings.total_students || 0,
    total_faculty: settings.total_faculty || 0,
    total_users: settings.total_users || 0,
    storage_used_gb: settings.storage_used_gb || 0,
    features: settings.features || ['Basic Features'],
    contract_type: settings.contract_type || 'Annual Contract',
    contract_start_date: settings.contract_start_date || new Date().toISOString().split('T')[0],
    contract_expiry_date: settings.contract_expiry_date || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    contract_value: settings.contract_value || 150000,
    created_at: db.created_at || new Date().toISOString(),
  };
}

// Transform form data to DB format
export function transformFormToDb(form: InstitutionFormData, existingCount: number) {
  const code = `${form.type.toUpperCase()}-${form.slug.toUpperCase()}-${String(existingCount + 1).padStart(3, '0')}`;
  
  return {
    name: form.name,
    slug: form.slug,
    code,
    type: form.type,
    status: 'active',
    address: {
      location: form.location,
      gps_location: form.gps_location,
    },
    contact_info: {
      email: form.contact_email,
      phone: form.contact_phone,
      admin_name: form.admin_name,
      admin_email: form.admin_email,
      // Note: password should be hashed server-side in production
    },
    settings: {
      established_year: form.established_year,
      license_type: form.license_type,
      max_users: form.max_users,
      current_users: 0,
      subscription_plan: form.subscription_plan,
      student_id_prefix: form.student_id_prefix,
      student_id_suffix: form.student_id_suffix,
      pricing_model: form.pricing_model,
      attendance_radius_meters: form.attendance_radius_meters,
      normal_working_hours: form.normal_working_hours,
      check_in_time: form.check_in_time,
      check_out_time: form.check_out_time,
      total_students: 0,
      total_faculty: 0,
      total_users: 0,
      storage_used_gb: 0,
      features: form.license_type === 'enterprise' ? ['All Features'] : 
                form.license_type === 'premium' ? ['Innovation Lab', 'Analytics'] : 
                ['Basic Features'],
      contract_type: 'Annual Contract',
      contract_start_date: new Date().toISOString().split('T')[0],
      contract_expiry_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      contract_value: form.license_type === 'enterprise' ? 1000000 : 
                      form.license_type === 'premium' ? 500000 : 150000,
      license_expiry: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    },
  };
}

export function useInstitutions() {
  const queryClient = useQueryClient();

  // Fetch all institutions
  const { data: institutions = [], isLoading, error } = useQuery({
    queryKey: ['institutions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('institutions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(transformDbToApp);
    },
    staleTime: 30000, // Cache for 30 seconds
  });

  // Create institution mutation with optimistic update
  const createMutation = useMutation({
    mutationFn: async (formData: InstitutionFormData) => {
      const dbData = transformFormToDb(formData, institutions.length);
      
      const { data, error } = await supabase
        .from('institutions')
        .insert(dbData)
        .select()
        .single();
      
      if (error) throw error;
      return { data, formData };
    },
    onMutate: async (formData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['institutions'] });
      
      // Snapshot previous value
      const previousInstitutions = queryClient.getQueryData(['institutions']);
      
      // Optimistically add new institution
      const optimisticInstitution = {
        id: `temp-${Date.now()}`,
        ...formData,
        code: `${formData.type.toUpperCase()}-${formData.slug.toUpperCase()}-${String(institutions.length + 1).padStart(3, '0')}`,
        total_students: 0,
        total_faculty: 0,
        total_users: 0,
        storage_used_gb: 0,
        subscription_status: 'active' as const,
        license_expiry: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        current_users: 0,
        features: formData.license_type === 'enterprise' ? ['All Features'] : 
                  formData.license_type === 'premium' ? ['Innovation Lab', 'Analytics'] : 
                  ['Basic Features'],
        contract_type: 'Annual Contract',
        contract_start_date: new Date().toISOString().split('T')[0],
        contract_expiry_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        contract_value: formData.license_type === 'enterprise' ? 1000000 : 
                        formData.license_type === 'premium' ? 500000 : 150000,
        created_at: new Date().toISOString(),
      };
      
      queryClient.setQueryData(['institutions'], (old: any) => [optimisticInstitution, ...(old || [])]);
      
      return { previousInstitutions };
    },
    onError: (err, formData, context) => {
      // Rollback on error
      if (context?.previousInstitutions) {
        queryClient.setQueryData(['institutions'], context.previousInstitutions);
      }
      toast.error('Failed to create institution');
      console.error('Create error:', err);
    },
    onSuccess: () => {
      // Refetch to get actual data
      queryClient.invalidateQueries({ queryKey: ['institutions'] });
    },
  });

  // Update institution mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<any> }) => {
      // Map updates to DB format
      const dbUpdates: Record<string, any> = {};
      
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.name) dbUpdates.name = updates.name;
      
      // Handle settings updates
      if (updates.license_expiry || updates.current_users || updates.subscription_status) {
        // Need to fetch current settings first
        const { data: current } = await supabase
          .from('institutions')
          .select('settings')
          .eq('id', id)
          .single();
        
        const currentSettings = (current?.settings || {}) as Record<string, any>;
        dbUpdates.settings = {
          ...currentSettings,
          ...(updates.license_expiry && { license_expiry: updates.license_expiry }),
          ...(updates.current_users !== undefined && { current_users: updates.current_users }),
        };
        
        if (updates.subscription_status) {
          dbUpdates.status = updates.subscription_status;
        }
      }
      
      const { error } = await supabase
        .from('institutions')
        .update(dbUpdates)
        .eq('id', id);
      
      if (error) throw error;
      return { id, updates };
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['institutions'] });
      const previousInstitutions = queryClient.getQueryData(['institutions']);
      
      queryClient.setQueryData(['institutions'], (old: any[]) => 
        old?.map(inst => inst.id === id ? { ...inst, ...updates } : inst) || []
      );
      
      return { previousInstitutions };
    },
    onError: (err, vars, context) => {
      if (context?.previousInstitutions) {
        queryClient.setQueryData(['institutions'], context.previousInstitutions);
      }
      toast.error('Failed to update institution');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institutions'] });
    },
  });

  // Delete institution mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('institutions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['institutions'] });
      const previousInstitutions = queryClient.getQueryData(['institutions']);
      
      queryClient.setQueryData(['institutions'], (old: any[]) => 
        old?.filter(inst => inst.id !== id) || []
      );
      
      return { previousInstitutions };
    },
    onError: (err, id, context) => {
      if (context?.previousInstitutions) {
        queryClient.setQueryData(['institutions'], context.previousInstitutions);
      }
      toast.error('Failed to delete institution');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institutions'] });
    },
  });

  return {
    institutions,
    isLoading,
    error,
    createInstitution: createMutation.mutateAsync,
    updateInstitution: updateMutation.mutateAsync,
    deleteInstitution: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
