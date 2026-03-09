import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateStudentUserRequest {
  email: string;
  password: string;
  student_name: string;
  institution_id: string;
  class_id: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user: callingUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !callingUser) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: callerRoles } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', callingUser.id);

    const roles = callerRoles?.map(r => r.role) || [];
    const allowedRoles = ['super_admin', 'system_admin', 'management', 'officer'];
    if (!roles.some(role => allowedRoles.includes(role))) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions to create students.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { email, password, student_name, institution_id, class_id }: CreateStudentUserRequest = await req.json();

    if (!email || !password || !student_name || !institution_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, password, student_name, institution_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[CreateStudentUser] Creating student user:', email, 'for institution:', institution_id);

    let studentUserId: string;

    // Try to create user directly - much faster than listing all users first
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        name: student_name,
        institution_id: institution_id,
        class_id: class_id || null,
        must_change_password: true,
      },
    });

    if (createError) {
      // Check if it's a "user already exists" error
      if (createError.message?.includes('already been registered') || createError.message?.includes('already exists')) {
        console.log('[CreateStudentUser] User already exists:', email);
        return new Response(
          JSON.stringify({ 
            error: 'This email is already registered in the system. Please use a different email address.',
            code: 'USER_EXISTS'
          }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.error('[CreateStudentUser] User creation error:', createError);
      return new Response(
        JSON.stringify({ error: `Failed to create user: ${createError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    studentUserId = newUser.user.id;
    console.log('[CreateStudentUser] Created new user:', studentUserId);

    // Upsert profile with retry
    const profileData = {
      id: studentUserId,
      email: email,
      name: student_name,
      institution_id: institution_id,
      class_id: class_id || null,
      must_change_password: true,
    };

    let profileSuccess = false;
    for (let retryCount = 0; retryCount < 3; retryCount++) {
      await new Promise(resolve => setTimeout(resolve, 200 * (retryCount + 1)));
      
      const { error: upsertError } = await supabaseAdmin
        .from('profiles')
        .upsert(profileData, { onConflict: 'id', ignoreDuplicates: false });

      if (!upsertError) {
        profileSuccess = true;
        break;
      }
      console.error('[CreateStudentUser] Profile upsert error attempt', retryCount + 1, ':', upsertError);
    }

    // Verify and force-fix profile
    const { data: verifyProfile } = await supabaseAdmin
      .from('profiles')
      .select('id, institution_id')
      .eq('id', studentUserId)
      .single();

    if (verifyProfile && !verifyProfile.institution_id) {
      const { error: forceError } = await supabaseAdmin
        .from('profiles')
        .update({ institution_id, class_id: class_id || null, name: student_name, must_change_password: true })
        .eq('id', studentUserId);

      if (forceError) {
        console.error('[CreateStudentUser] Force update failed, rolling back');
        await supabaseAdmin.auth.admin.deleteUser(studentUserId);
        return new Response(
          JSON.stringify({ error: 'Failed to assign institution to student. Please try again.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Assign student role
    const { error: roleInsertError } = await supabaseAdmin
      .from('user_roles')
      .upsert({ user_id: studentUserId, role: 'student' }, { onConflict: 'user_id,role' });

    if (roleInsertError) {
      return new Response(
        JSON.stringify({ error: `Failed to assign student role: ${roleInsertError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[CreateStudentUser] Successfully created student user:', studentUserId);

    return new Response(
      JSON.stringify({ success: true, user_id: studentUserId, message: 'Student user created successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('[CreateStudentUser] Unexpected error:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
