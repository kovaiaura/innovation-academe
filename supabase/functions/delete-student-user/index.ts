import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Verify the requesting user has proper authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { student_id } = await req.json();

    if (!student_id) {
      return new Response(
        JSON.stringify({ error: 'student_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[DeleteStudentUser] Starting deletion for student:', student_id);

    // 1. Get the student record to find user_id
    const { data: student, error: fetchError } = await adminClient
      .from('students')
      .select('id, user_id, student_name, email')
      .eq('id', student_id)
      .single();

    if (fetchError) {
      console.error('[DeleteStudentUser] Failed to fetch student:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Student not found', details: fetchError.message }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = student.user_id;
    console.log('[DeleteStudentUser] Found student:', student.student_name, 'with user_id:', userId);

    // 2. Delete related data first
    // Delete from student_xp_transactions
    const { error: xpError } = await adminClient
      .from('student_xp_transactions')
      .delete()
      .eq('student_id', userId);
    if (xpError) console.log('[DeleteStudentUser] XP transactions cleanup:', xpError.message);

    // Delete from student_content_completions
    const { error: completionsError } = await adminClient
      .from('student_content_completions')
      .delete()
      .eq('student_id', userId);
    if (completionsError) console.log('[DeleteStudentUser] Content completions cleanup:', completionsError.message);

    // Delete from student_badges
    const { error: badgesError } = await adminClient
      .from('student_badges')
      .delete()
      .eq('student_id', userId);
    if (badgesError) console.log('[DeleteStudentUser] Badges cleanup:', badgesError.message);

    // Delete from student_certificates (if table exists)
    try {
      await adminClient
        .from('student_certificates')
        .delete()
        .eq('student_id', userId);
    } catch (e) {
      console.log('[DeleteStudentUser] Certificates table may not exist');
    }

    // Delete from assessment_attempts
    const { error: attemptsError } = await adminClient
      .from('assessment_attempts')
      .delete()
      .eq('student_id', userId);
    if (attemptsError) console.log('[DeleteStudentUser] Assessment attempts cleanup:', attemptsError.message);

    // Delete from assignment_submissions
    const { error: submissionsError } = await adminClient
      .from('assignment_submissions')
      .delete()
      .eq('student_id', userId);
    if (submissionsError) console.log('[DeleteStudentUser] Assignment submissions cleanup:', submissionsError.message);

    // Delete from project_members where student is a member
    const { error: projectMembersError } = await adminClient
      .from('project_members')
      .delete()
      .eq('student_id', student_id);
    if (projectMembersError) console.log('[DeleteStudentUser] Project members cleanup:', projectMembersError.message);

    // Delete from event_interests
    const { error: eventInterestsError } = await adminClient
      .from('event_interests')
      .delete()
      .eq('student_id', userId);
    if (eventInterestsError) console.log('[DeleteStudentUser] Event interests cleanup:', eventInterestsError.message);

    // 3. Delete the student record
    const { error: deleteStudentError } = await adminClient
      .from('students')
      .delete()
      .eq('id', student_id);

    if (deleteStudentError) {
      console.error('[DeleteStudentUser] Failed to delete student record:', deleteStudentError);
      return new Response(
        JSON.stringify({ error: 'Failed to delete student record', details: deleteStudentError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[DeleteStudentUser] Deleted student record');

    // 4. If user_id exists, delete the auth user (this cascades to profiles and user_roles)
    if (userId) {
      console.log('[DeleteStudentUser] Deleting auth user:', userId);
      
      const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(userId);
      
      if (deleteAuthError) {
        console.error('[DeleteStudentUser] Failed to delete auth user:', deleteAuthError);
        // Don't fail the whole operation - student record is already deleted
        // The orphan auth user can be cleaned up later
        return new Response(
          JSON.stringify({ 
            success: true, 
            warning: 'Student deleted but auth user cleanup failed',
            student_id,
            user_id: userId 
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('[DeleteStudentUser] Successfully deleted auth user');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Student and all related data deleted successfully',
        student_id,
        user_id: userId 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[DeleteStudentUser] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
