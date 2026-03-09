import { supabase } from '@/integrations/supabase/client';

export interface CredentialMetaEmployee {
  id: string;
  email: string;
  name: string;
  position_name: string | null;
  role: string;
  password_changed: boolean;
  must_change_password: boolean;
  password_changed_at: string | null;
}

export interface CredentialOfficer {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  status: string;
  employee_id: string | null;
  assigned_institutions: string[] | null;
  password_changed: boolean;
  must_change_password: boolean;
}

export interface CredentialInstitution {
  id: string;
  name: string;
  status: string | null;
  admin_user_id: string | null;
  admin_email: string | null;
  admin_name: string | null;
  password_changed: boolean;
  must_change_password: boolean;
}

export interface CredentialStudent {
  id: string;
  user_id: string | null;
  student_id: string;
  roll_number: string;
  student_name: string;
  email: string | null;
  parent_email: string | null;
  class_id: string | null;
  class_name: string | null;
  institution_id: string;
  password_changed: boolean;
  must_change_password: boolean;
}

export const credentialService = {
  /**
   * Fetch Meta Employees (profiles with system_admin or super_admin roles)
   */
  fetchMetaEmployees: async (): Promise<CredentialMetaEmployee[]> => {
    // First get user IDs with admin roles
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('user_id, role')
      .in('role', ['super_admin', 'system_admin']);

    if (roleError) {
      console.error('Error fetching user roles:', roleError);
      return [];
    }

    if (!roleData || roleData.length === 0) {
      return [];
    }

    const userIds = roleData.map(r => r.user_id);
    const roleMap = new Map(roleData.map(r => [r.user_id, r.role]));

    // Fetch profiles for these users
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, name, position_name, password_changed, must_change_password, password_changed_at')
      .in('id', userIds);

    if (profileError) {
      console.error('Error fetching profiles:', profileError);
      return [];
    }

    return (profiles || []).map(profile => ({
      id: profile.id,
      email: profile.email || '',
      name: profile.name || '',
      position_name: profile.position_name,
      role: roleMap.get(profile.id) || 'system_admin',
      password_changed: profile.password_changed || false,
      must_change_password: profile.must_change_password || false,
      password_changed_at: profile.password_changed_at,
    }));
  },

  /**
   * Fetch Innovation Officers with their credential status
   */
  fetchOfficers: async (): Promise<CredentialOfficer[]> => {
    const { data: officers, error: officerError } = await supabase
      .from('officers')
      .select('id, user_id, full_name, email, status, employee_id, assigned_institutions')
      .order('full_name');

    if (officerError) {
      console.error('Error fetching officers:', officerError);
      return [];
    }

    if (!officers || officers.length === 0) {
      return [];
    }

    // Get profile info for officers with user_ids
    const userIds = officers.filter(o => o.user_id).map(o => o.user_id!);
    
    let profileMap = new Map<string, { password_changed: boolean; must_change_password: boolean }>();
    
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, password_changed, must_change_password')
        .in('id', userIds);

      if (profiles) {
        profileMap = new Map(profiles.map(p => [p.id, { 
          password_changed: p.password_changed || false, 
          must_change_password: p.must_change_password || false 
        }]));
      }
    }

    return officers.map(officer => ({
      id: officer.id,
      user_id: officer.user_id,
      full_name: officer.full_name,
      email: officer.email,
      status: officer.status || 'active',
      employee_id: officer.employee_id,
      assigned_institutions: officer.assigned_institutions,
      password_changed: officer.user_id ? (profileMap.get(officer.user_id)?.password_changed || false) : false,
      must_change_password: officer.user_id ? (profileMap.get(officer.user_id)?.must_change_password || false) : false,
    }));
  },

  /**
   * Fetch Institutions with their admin users
   */
  fetchInstitutionsWithAdmins: async (): Promise<CredentialInstitution[]> => {
    const { data: institutions, error: instError } = await supabase
      .from('institutions')
      .select('id, name, status, admin_user_id')
      .order('name');

    if (instError) {
      console.error('Error fetching institutions:', instError);
      return [];
    }

    if (!institutions || institutions.length === 0) {
      return [];
    }

    // Get admin user profiles
    const adminIds = institutions.filter(i => i.admin_user_id).map(i => i.admin_user_id!);
    
    let adminMap = new Map<string, { email: string; name: string; password_changed: boolean; must_change_password: boolean }>();
    
    if (adminIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, name, password_changed, must_change_password')
        .in('id', adminIds);

      if (profiles) {
        adminMap = new Map(profiles.map(p => [p.id, {
          email: p.email || '',
          name: p.name || '',
          password_changed: p.password_changed || false,
          must_change_password: p.must_change_password || false,
        }]));
      }
    }

    return institutions.map(inst => {
      const admin = inst.admin_user_id ? adminMap.get(inst.admin_user_id) : null;
      return {
        id: inst.id,
        name: inst.name,
        status: inst.status,
        admin_user_id: inst.admin_user_id,
        admin_email: admin?.email || null,
        admin_name: admin?.name || null,
        password_changed: admin?.password_changed || false,
        must_change_password: admin?.must_change_password || false,
      };
    });
  },

  /**
   * Fetch Students by institution with their credential status
   */
  fetchStudentsByInstitution: async (institutionId: string): Promise<CredentialStudent[]> => {
    // Use pagination to fetch all students (Supabase default limit is 1000)
    let allStudents: any[] = [];
    let from = 0;
    const pageSize = 1000;
    
    while (true) {
      const { data, error } = await supabase
        .from('students')
        .select(`
          id, user_id, student_id, roll_number, student_name, email, parent_email,
          class_id, institution_id,
          classes:class_id (class_name)
        `)
        .eq('institution_id', institutionId)
        .order('student_name')
        .range(from, from + pageSize - 1);

      if (error) {
        console.error('Error fetching students:', error);
        break;
      }
      
      if (!data || data.length === 0) break;
      allStudents = allStudents.concat(data);
      if (data.length < pageSize) break;
      from += pageSize;
    }

    if (allStudents.length === 0) return [];

    const userIds = allStudents.filter(s => s.user_id).map(s => s.user_id!);
    
    
    let profileMap = new Map<string, { password_changed: boolean; must_change_password: boolean }>();
    
    if (userIds.length > 0) {
      const chunkSize = 200;
      for (let i = 0; i < userIds.length; i += chunkSize) {
        const chunk = userIds.slice(i, i + chunkSize);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, password_changed, must_change_password')
          .in('id', chunk);
        if (profiles) {
          profiles.forEach(p => profileMap.set(p.id, {
            password_changed: p.password_changed || false,
            must_change_password: p.must_change_password || false,
          }));
        }
      }
    }

    return allStudents.map(student => {
      const classInfo = student.classes as any;
      return {
        id: student.id,
        user_id: student.user_id,
        student_id: student.student_id || '',
        roll_number: student.roll_number || '',
        student_name: student.student_name,
        email: student.email,
        parent_email: student.parent_email,
        class_id: student.class_id,
        class_name: classInfo?.class_name || null,
        institution_id: student.institution_id,
        password_changed: student.user_id ? (profileMap.get(student.user_id)?.password_changed || false) : false,
        must_change_password: student.user_id ? (profileMap.get(student.user_id)?.must_change_password || false) : false,
      };
    });
  },

  /**
   * Fetch all institutions for dropdown
   */
  fetchInstitutionsList: async (): Promise<{ id: string; name: string }[]> => {
    const { data, error } = await supabase
      .from('institutions')
      .select('id, name')
      .eq('status', 'active')
      .order('name');

    if (error) {
      console.error('Error fetching institutions list:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Set password for a user via edge function
   */
  setUserPassword: async (
    userId: string, 
    password: string, 
    userType: 'meta_employee' | 'officer' | 'institution_admin' | 'student'
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke('set-user-password', {
        body: { user_id: userId, password, user_type: userType },
      });

      if (error) return { success: false, error: error.message };
      if (data?.error) return { success: false, error: data.error };
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to set password' };
    }
  },

  /**
   * Get students with missing accounts (user_id = null) for a given institution
   */
  fetchStudentsWithMissingAccounts: async (institutionId: string): Promise<CredentialStudent[]> => {
    const { data, error } = await supabase
      .from('students')
      .select(`
        id, user_id, student_id, roll_number, student_name, email, parent_email, 
        class_id, institution_id,
        classes:class_id (class_name)
      `)
      .eq('institution_id', institutionId)
      .is('user_id', null)
      .not('email', 'is', null)
      .order('student_name');

    if (error || !data) return [];

    return data.map(student => {
      const classInfo = student.classes as any;
      return {
        id: student.id,
        user_id: null,
        student_id: student.student_id || '',
        roll_number: student.roll_number || '',
        student_name: student.student_name,
        email: student.email,
        parent_email: student.parent_email,
        class_id: student.class_id,
        class_name: classInfo?.class_name || null,
        institution_id: student.institution_id,
        password_changed: false,
        must_change_password: false,
      };
    });
  },

  /**
   * Repair missing student accounts in batch
   * Creates auth users and links them back to student records
   */
  repairStudentAccounts: async (
    institutionId: string,
    defaultPassword: string,
    onProgress?: (current: number, total: number, successCount: number, failCount: number) => void
  ): Promise<{ success: number; failed: number; errors: Array<{ email: string; error: string; error_code?: string }> }> => {
    // Fetch all students with missing accounts
    const { data: students, error } = await supabase
      .from('students')
      .select('id, student_name, email, class_id, institution_id')
      .eq('institution_id', institutionId)
      .is('user_id', null)
      .not('email', 'is', null);

    if (error || !students || students.length === 0) {
      return { success: 0, failed: 0, errors: [] };
    }

    let successCount = 0;
    let failCount = 0;
    const errors: Array<{ email: string; error: string; error_code?: string }> = [];

    // Process in batches of 10 (small to stay well within limits)
    const batchSize = 10;
    for (let i = 0; i < students.length; i += batchSize) {
      const batch = students.slice(i, i + batchSize);
      
      // Add delay between batches to avoid rate limiting
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      try {
        const response = await supabase.functions.invoke('create-student-users-batch', {
          body: {
            mode: 'repair',
            defaultPassword,
            students: batch.map(s => ({
              student_id: s.id, // Pass DB row ID for backend linking
              email: s.email,
              password: '',
              student_name: s.student_name,
              institution_id: s.institution_id,
              class_id: s.class_id || '',
            })),
          },
        });

        // Check for function-level errors (e.g., 401, 500)
        if (response.error) {
          console.error('[Repair] Function invoke error:', response.error.message);
          failCount += batch.length;
          for (const s of batch) {
            errors.push({ email: s.email || '', error: 'Backend error: ' + response.error.message, error_code: 'invoke_error' });
          }
          onProgress?.(Math.min(i + batch.length, students.length), students.length, successCount, failCount);
          continue;
        }

        if (response.data?.results) {
          for (const result of response.data.results) {
            if (result.success) {
              // Backend already linked user_id to student record
              successCount++;
            } else {
              failCount++;
              errors.push({ 
                email: result.email, 
                error: result.error || 'Unknown error',
                error_code: result.error_code || 'unknown'
              });
            }
          }
        } else if (response.data?.error) {
          // Function returned a top-level error
          console.error('[Repair] Function error:', response.data.error);
          failCount += batch.length;
          for (const s of batch) {
            errors.push({ email: s.email || '', error: response.data.error, error_code: 'function_error' });
          }
        }
      } catch (err: any) {
        console.error('[Repair] Catch error:', err);
        failCount += batch.length;
        for (const s of batch) {
          errors.push({ email: s.email || '', error: err.message || 'Batch request failed', error_code: 'network_error' });
        }
      }

      onProgress?.(Math.min(i + batch.length, students.length), students.length, successCount, failCount);
    }

    return { success: successCount, failed: failCount, errors };
  },
};
