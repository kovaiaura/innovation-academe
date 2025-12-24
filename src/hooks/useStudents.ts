import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface StudentFormData {
  student_name: string;
  email?: string;
  password?: string;
  student_id: string;
  roll_number?: string;
  admission_number?: string;
  date_of_birth?: string;
  gender?: string;
  blood_group?: string;
  admission_date?: string;
  previous_school?: string;
  parent_name?: string;
  parent_phone?: string;
  parent_email?: string;
  address?: string;
  avatar?: string;
  status?: string;
}

export interface DbStudent {
  id: string;
  user_id: string | null;
  institution_id: string;
  class_id: string | null;
  student_id: string;
  roll_number: string | null;
  admission_number: string | null;
  student_name: string;
  email: string | null;
  date_of_birth: string | null;
  gender: string | null;
  blood_group: string | null;
  admission_date: string | null;
  previous_school: string | null;
  parent_name: string | null;
  parent_phone: string | null;
  parent_email: string | null;
  address: string | null;
  avatar: string | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// Helper to verify authentication
async function verifyAuth(): Promise<{ userId: string; isValid: boolean; error?: string }> {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session?.user) {
    console.error('[Students] No active session:', sessionError);
    return { userId: '', isValid: false, error: 'You must be logged in to perform this action' };
  }

  return { userId: session.user.id, isValid: true };
}

export function useStudents(institutionId?: string, classId?: string) {
  const queryClient = useQueryClient();

  // Fetch students for an institution (optionally filtered by class)
  const {
    data: students = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['students', institutionId, classId],
    queryFn: async () => {
      if (!institutionId) return [];
      
      console.log('[Students] Fetching students for institution:', institutionId, classId ? `class: ${classId}` : '');
      
      let query = supabase
        .from('students')
        .select('*')
        .eq('institution_id', institutionId)
        .order('student_name', { ascending: true });

      if (classId) {
        query = query.eq('class_id', classId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[Students] Fetch error:', error);
        throw error;
      }
      
      console.log('[Students] Fetched:', data?.length || 0, 'students');
      return data as DbStudent[];
    },
    enabled: !!institutionId,
    staleTime: 30000,
  });

  // Create student mutation (without auth user creation to avoid session issues)
  const createStudentMutation = useMutation({
    mutationFn: async (formData: StudentFormData & { 
      institution_id: string; 
      class_id: string;
    }) => {
      console.log('[Students] Creating student:', formData.student_name);
      
      // Verify authentication
      const authCheck = await verifyAuth();
      if (!authCheck.isValid) {
        throw new Error(authCheck.error);
      }

      // Create student record (without auth user - that should be done separately)
      const { data, error } = await supabase
        .from('students')
        .insert({
          institution_id: formData.institution_id,
          class_id: formData.class_id,
          student_id: formData.student_id,
          student_name: formData.student_name,
          email: formData.email,
          roll_number: formData.roll_number,
          admission_number: formData.admission_number,
          date_of_birth: formData.date_of_birth,
          gender: formData.gender || 'male',
          blood_group: formData.blood_group,
          admission_date: formData.admission_date,
          previous_school: formData.previous_school,
          parent_name: formData.parent_name,
          parent_phone: formData.parent_phone,
          parent_email: formData.parent_email,
          address: formData.address,
          avatar: formData.avatar,
          status: formData.status || 'active',
        })
        .select()
        .single();

      if (error) {
        console.error('[Students] Create error:', error);
        throw new Error(`Failed to create student: ${error.message}`);
      }
      
      console.log('[Students] Created successfully:', data.id);
      return data;
    },
    onMutate: async (newStudent) => {
      await queryClient.cancelQueries({ queryKey: ['students', newStudent.institution_id, newStudent.class_id] });
      const previousStudents = queryClient.getQueryData<DbStudent[]>(['students', newStudent.institution_id, newStudent.class_id]);
      
      const optimisticStudent: DbStudent = {
        id: `temp-${Date.now()}`,
        user_id: null,
        institution_id: newStudent.institution_id,
        class_id: newStudent.class_id,
        student_id: newStudent.student_id,
        student_name: newStudent.student_name,
        email: newStudent.email || null,
        roll_number: newStudent.roll_number || null,
        admission_number: newStudent.admission_number || null,
        date_of_birth: newStudent.date_of_birth || null,
        gender: newStudent.gender || 'male',
        blood_group: newStudent.blood_group || null,
        admission_date: newStudent.admission_date || null,
        previous_school: newStudent.previous_school || null,
        parent_name: newStudent.parent_name || null,
        parent_phone: newStudent.parent_phone || null,
        parent_email: newStudent.parent_email || null,
        address: newStudent.address || null,
        avatar: newStudent.avatar || null,
        status: newStudent.status || 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      queryClient.setQueryData<DbStudent[]>(
        ['students', newStudent.institution_id, newStudent.class_id],
        (old = []) => [...old, optimisticStudent]
      );

      return { previousStudents };
    },
    onError: (err: Error, newStudent, context) => {
      console.error('[Students] Create mutation error:', err);
      if (context?.previousStudents) {
        queryClient.setQueryData(['students', newStudent.institution_id, newStudent.class_id], context.previousStudents);
      }
      toast.error(err.message || 'Failed to create student');
    },
    onSuccess: (data) => {
      toast.success(`Student "${data.student_name}" added successfully`);
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ['students', variables.institution_id] });
      queryClient.invalidateQueries({ queryKey: ['classes-with-counts', variables.institution_id] });
    },
  });

  // Update student mutation
  const updateStudentMutation = useMutation({
    mutationFn: async ({ id, ...formData }: StudentFormData & { id: string; institution_id: string; class_id: string }) => {
      console.log('[Students] Updating student:', id);
      
      // Verify authentication
      const authCheck = await verifyAuth();
      if (!authCheck.isValid) {
        throw new Error(authCheck.error);
      }

      const { data, error } = await supabase
        .from('students')
        .update({
          student_name: formData.student_name,
          email: formData.email,
          roll_number: formData.roll_number,
          admission_number: formData.admission_number,
          date_of_birth: formData.date_of_birth,
          gender: formData.gender,
          blood_group: formData.blood_group,
          admission_date: formData.admission_date,
          previous_school: formData.previous_school,
          parent_name: formData.parent_name,
          parent_phone: formData.parent_phone,
          parent_email: formData.parent_email,
          address: formData.address,
          avatar: formData.avatar,
          status: formData.status,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('[Students] Update error:', error);
        throw new Error(`Failed to update student: ${error.message}`);
      }
      
      console.log('[Students] Updated successfully:', data.id);
      return data;
    },
    onError: (err: Error) => {
      console.error('[Students] Update mutation error:', err);
      toast.error(err.message || 'Failed to update student');
    },
    onSuccess: (data) => {
      toast.success(`Student "${data.student_name}" updated successfully`);
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ['students', variables.institution_id] });
    },
  });

  // Delete student mutation
  const deleteStudentMutation = useMutation({
    mutationFn: async ({ id, institution_id, class_id }: { id: string; institution_id: string; class_id?: string }) => {
      console.log('[Students] Deleting student:', id);
      
      // Verify authentication
      const authCheck = await verifyAuth();
      if (!authCheck.isValid) {
        throw new Error(authCheck.error);
      }

      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('[Students] Delete error:', error);
        throw new Error(`Failed to delete student: ${error.message}`);
      }
      
      console.log('[Students] Deleted successfully');
      return id;
    },
    onMutate: async ({ id, institution_id, class_id }) => {
      await queryClient.cancelQueries({ queryKey: ['students', institution_id, class_id] });
      const previousStudents = queryClient.getQueryData<DbStudent[]>(['students', institution_id, class_id]);
      
      queryClient.setQueryData<DbStudent[]>(
        ['students', institution_id, class_id],
        (old = []) => old.filter(s => s.id !== id)
      );

      return { previousStudents };
    },
    onError: (err: Error, variables, context) => {
      console.error('[Students] Delete mutation error:', err);
      if (context?.previousStudents) {
        queryClient.setQueryData(['students', variables.institution_id, variables.class_id], context.previousStudents);
      }
      toast.error(err.message || 'Failed to delete student');
    },
    onSuccess: () => {
      toast.success('Student deleted successfully');
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ['students', variables.institution_id] });
      queryClient.invalidateQueries({ queryKey: ['classes-with-counts', variables.institution_id] });
    },
  });

  // Bulk create students
  const bulkCreateStudentsMutation = useMutation({
    mutationFn: async (students: Array<StudentFormData & { institution_id: string; class_id: string }>) => {
      console.log('[Students] Bulk creating:', students.length, 'students');
      
      // Verify authentication
      const authCheck = await verifyAuth();
      if (!authCheck.isValid) {
        throw new Error(authCheck.error);
      }

      const { data, error } = await supabase
        .from('students')
        .insert(students.map(s => ({
          institution_id: s.institution_id,
          class_id: s.class_id,
          student_id: s.student_id,
          student_name: s.student_name,
          email: s.email,
          roll_number: s.roll_number,
          admission_number: s.admission_number,
          date_of_birth: s.date_of_birth,
          gender: s.gender || 'male',
          blood_group: s.blood_group,
          admission_date: s.admission_date,
          previous_school: s.previous_school,
          parent_name: s.parent_name,
          parent_phone: s.parent_phone,
          parent_email: s.parent_email,
          address: s.address,
          avatar: s.avatar,
          status: s.status || 'active',
        })))
        .select();

      if (error) {
        console.error('[Students] Bulk create error:', error);
        throw new Error(`Failed to import students: ${error.message}`);
      }
      
      console.log('[Students] Bulk created successfully:', data?.length || 0, 'students');
      return data;
    },
    onError: (err: Error) => {
      console.error('[Students] Bulk create mutation error:', err);
      toast.error(err.message || 'Failed to import students');
    },
    onSuccess: (data) => {
      toast.success(`${data?.length || 0} students imported successfully`);
    },
    onSettled: (_, __, variables) => {
      if (variables.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['students', variables[0].institution_id] });
        queryClient.invalidateQueries({ queryKey: ['classes-with-counts', variables[0].institution_id] });
      }
    },
  });

  // Get student count for institution
  const getStudentCount = async (instId: string): Promise<number> => {
    console.log('[Students] Getting count for institution:', instId);
    
    const { count, error } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('institution_id', instId);

    if (error) {
      console.error('[Students] Count error:', error);
      throw error;
    }
    
    console.log('[Students] Count:', count);
    return count || 0;
  };

  return {
    students,
    isLoading,
    error,
    refetch,
    createStudent: createStudentMutation.mutateAsync,
    updateStudent: updateStudentMutation.mutateAsync,
    deleteStudent: deleteStudentMutation.mutateAsync,
    bulkCreateStudents: bulkCreateStudentsMutation.mutateAsync,
    getStudentCount,
    isCreating: createStudentMutation.isPending,
    isUpdating: updateStudentMutation.isPending,
    isDeleting: deleteStudentMutation.isPending,
    isBulkCreating: bulkCreateStudentsMutation.isPending,
  };
}
