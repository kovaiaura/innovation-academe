import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { OfficerAssignment } from '@/types/institution';

export interface DatabaseOfficer {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  employee_id: string | null;
  profile_photo_url: string | null;
  status: string;
  assigned_institutions: string[] | null;
  created_at: string | null;
}

// Hook to get officers assigned to a specific institution
export function useOfficersByInstitution(institutionId: string | undefined) {
  const [officers, setOfficers] = useState<OfficerAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchOfficers = async () => {
    if (!institutionId) {
      setOfficers([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('officers')
        .select('*')
        .contains('assigned_institutions', [institutionId]);

      if (error) throw error;

      const mappedOfficers: OfficerAssignment[] = (data || []).map((officer: DatabaseOfficer) => ({
        officer_id: officer.id,
        officer_name: officer.full_name,
        employee_id: officer.employee_id || 'N/A',
        email: officer.email,
        phone: officer.phone || '',
        avatar: officer.profile_photo_url || undefined,
        assigned_date: officer.created_at || new Date().toISOString(),
        total_courses: 0,
        total_teaching_hours: 0,
        status: officer.status as 'active' | 'inactive',
      }));

      setOfficers(mappedOfficers);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching assigned officers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficers();
  }, [institutionId]);

  return { officers, isLoading, error, refetch: fetchOfficers };
}

// Hook to get officers NOT assigned to a specific institution (available for assignment)
export function useAvailableOfficers(institutionId: string | undefined) {
  const [officers, setOfficers] = useState<OfficerAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAvailableOfficers = async () => {
    if (!institutionId) {
      setOfficers([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Get all active officers
      const { data: allOfficers, error: fetchError } = await supabase
        .from('officers')
        .select('*')
        .eq('status', 'active');

      if (fetchError) throw fetchError;

      // Filter out officers already assigned to this institution
      const available = (allOfficers || []).filter((officer: DatabaseOfficer) => {
        const assignedInstitutions = officer.assigned_institutions || [];
        return !assignedInstitutions.includes(institutionId);
      });

      const mappedOfficers: OfficerAssignment[] = available.map((officer: DatabaseOfficer) => ({
        officer_id: officer.id,
        officer_name: officer.full_name,
        employee_id: officer.employee_id || 'N/A',
        email: officer.email,
        phone: officer.phone || '',
        avatar: officer.profile_photo_url || undefined,
        assigned_date: new Date().toISOString(),
        total_courses: 0,
        total_teaching_hours: 0,
        status: 'active',
      }));

      setOfficers(mappedOfficers);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching available officers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableOfficers();
  }, [institutionId]);

  return { officers, isLoading, error, refetch: fetchAvailableOfficers };
}

// Hook to manage officer assignments
export function useOfficerAssignment(institutionId: string | undefined) {
  const [isAssigning, setIsAssigning] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const assignOfficer = async (officerId: string) => {
    if (!institutionId) {
      toast.error('Institution ID is required');
      return;
    }

    setIsAssigning(true);
    try {
      // First get the current assigned_institutions
      const { data: officer, error: fetchError } = await supabase
        .from('officers')
        .select('assigned_institutions')
        .eq('id', officerId)
        .single();

      if (fetchError) throw fetchError;

      const currentInstitutions = officer?.assigned_institutions || [];
      
      // Add the new institution if not already present
      if (!currentInstitutions.includes(institutionId)) {
        const updatedInstitutions = [...currentInstitutions, institutionId];
        
        const { error: updateError } = await supabase
          .from('officers')
          .update({ assigned_institutions: updatedInstitutions })
          .eq('id', officerId);

        if (updateError) throw updateError;
      }
    } catch (err) {
      console.error('Error assigning officer:', err);
      throw err;
    } finally {
      setIsAssigning(false);
    }
  };

  const removeOfficer = async (officerId: string) => {
    if (!institutionId) {
      toast.error('Institution ID is required');
      return;
    }

    setIsRemoving(true);
    try {
      // First get the current assigned_institutions
      const { data: officer, error: fetchError } = await supabase
        .from('officers')
        .select('assigned_institutions')
        .eq('id', officerId)
        .single();

      if (fetchError) throw fetchError;

      const currentInstitutions = officer?.assigned_institutions || [];
      
      // Remove the institution
      const updatedInstitutions = currentInstitutions.filter(
        (id: string) => id !== institutionId
      );
      
      const { error: updateError } = await supabase
        .from('officers')
        .update({ assigned_institutions: updatedInstitutions })
        .eq('id', officerId);

      if (updateError) throw updateError;
    } catch (err) {
      console.error('Error removing officer:', err);
      throw err;
    } finally {
      setIsRemoving(false);
    }
  };

  return { assignOfficer, removeOfficer, isAssigning, isRemoving };
}
