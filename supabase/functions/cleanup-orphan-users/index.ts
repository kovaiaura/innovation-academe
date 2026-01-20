import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Verify authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const deletedUsers: { email: string; role: string; reason: string }[] = [];
    const errors: { email: string; error: string }[] = [];

    // Step 1: Find orphan students (have 'student' role but no record in students table)
    console.log('Finding orphan student users...');
    
    const { data: studentRoles, error: studentRolesError } = await adminClient
      .from('user_roles')
      .select('user_id')
      .eq('role', 'student');

    if (studentRolesError) {
      console.error('Error fetching student roles:', studentRolesError);
      throw studentRolesError;
    }

    const studentUserIds = studentRoles?.map(r => r.user_id) || [];
    console.log(`Found ${studentUserIds.length} users with student role`);

    // Get all valid student user_ids from students table
    const { data: validStudents, error: validStudentsError } = await adminClient
      .from('students')
      .select('user_id')
      .not('user_id', 'is', null);

    if (validStudentsError) {
      console.error('Error fetching valid students:', validStudentsError);
      throw validStudentsError;
    }

    const validStudentUserIds = new Set(validStudents?.map(s => s.user_id) || []);
    console.log(`Found ${validStudentUserIds.size} valid students with user_id`);

    // Find orphan student user_ids
    const orphanStudentUserIds = studentUserIds.filter(id => !validStudentUserIds.has(id));
    console.log(`Found ${orphanStudentUserIds.length} orphan student users`);

    // Step 2: Find orphan officers (have 'officer' role but no record in officers table)
    console.log('Finding orphan officer users...');
    
    const { data: officerRoles, error: officerRolesError } = await adminClient
      .from('user_roles')
      .select('user_id')
      .eq('role', 'officer');

    if (officerRolesError) {
      console.error('Error fetching officer roles:', officerRolesError);
      throw officerRolesError;
    }

    const officerUserIds = officerRoles?.map(r => r.user_id) || [];
    console.log(`Found ${officerUserIds.length} users with officer role`);

    // Get all valid officer user_ids from officers table
    const { data: validOfficers, error: validOfficersError } = await adminClient
      .from('officers')
      .select('user_id')
      .not('user_id', 'is', null);

    if (validOfficersError) {
      console.error('Error fetching valid officers:', validOfficersError);
      throw validOfficersError;
    }

    const validOfficerUserIds = new Set(validOfficers?.map(o => o.user_id) || []);
    console.log(`Found ${validOfficerUserIds.size} valid officers with user_id`);

    // Find orphan officer user_ids
    const orphanOfficerUserIds = officerUserIds.filter(id => !validOfficerUserIds.has(id));
    console.log(`Found ${orphanOfficerUserIds.length} orphan officer users`);

    // Step 3: Delete orphan student auth users
    for (const userId of orphanStudentUserIds) {
      try {
        // Get user email for logging
        const { data: { user }, error: getUserError } = await adminClient.auth.admin.getUserById(userId);
        
        if (getUserError) {
          console.error(`Error getting user ${userId}:`, getUserError);
          errors.push({ email: userId, error: getUserError.message });
          continue;
        }

        const email = user?.email || userId;
        
        // Delete the auth user (cascades to profiles and user_roles)
        const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);
        
        if (deleteError) {
          console.error(`Error deleting user ${email}:`, deleteError);
          errors.push({ email, error: deleteError.message });
        } else {
          console.log(`Deleted orphan student user: ${email}`);
          deletedUsers.push({ email, role: 'student', reason: 'No record in students table' });
        }
      } catch (err) {
        console.error(`Error processing user ${userId}:`, err);
        errors.push({ email: userId, error: String(err) });
      }
    }

    // Step 4: Delete orphan officer auth users
    for (const userId of orphanOfficerUserIds) {
      try {
        // Get user email for logging
        const { data: { user }, error: getUserError } = await adminClient.auth.admin.getUserById(userId);
        
        if (getUserError) {
          console.error(`Error getting user ${userId}:`, getUserError);
          errors.push({ email: userId, error: getUserError.message });
          continue;
        }

        const email = user?.email || userId;
        
        // Delete the auth user (cascades to profiles and user_roles)
        const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);
        
        if (deleteError) {
          console.error(`Error deleting user ${email}:`, deleteError);
          errors.push({ email, error: deleteError.message });
        } else {
          console.log(`Deleted orphan officer user: ${email}`);
          deletedUsers.push({ email, role: 'officer', reason: 'No record in officers table' });
        }
      } catch (err) {
        console.error(`Error processing user ${userId}:`, err);
        errors.push({ email: userId, error: String(err) });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          orphanStudentsFound: orphanStudentUserIds.length,
          orphanOfficersFound: orphanOfficerUserIds.length,
          totalDeleted: deletedUsers.length,
          totalErrors: errors.length
        },
        deletedUsers,
        errors: errors.length > 0 ? errors : undefined
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Cleanup orphan users error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
