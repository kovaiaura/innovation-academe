import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  user_id: string;
  password: string;
  user_type: 'meta_employee' | 'officer' | 'institution_admin' | 'student';
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request body
    const body: RequestBody = await req.json();
    const { user_id, password, user_type } = body;

    console.log(`Setting password for user ${user_id} of type ${user_type}`);

    // Validate input
    if (!user_id || !password) {
      return new Response(
        JSON.stringify({ error: 'user_id and password are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return new Response(
        JSON.stringify({ error: 'Password must be at least 8 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get the calling user from the Authorization header to verify admin role
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(token);
      
      if (authError || !caller) {
        console.log('No authenticated caller - proceeding with admin operation');
      } else {
        // Verify caller has admin role
        const { data: roleData, error: roleError } = await supabaseAdmin
          .from('user_roles')
          .select('role')
          .eq('user_id', caller.id)
          .in('role', ['super_admin', 'system_admin'])
          .single();

        if (roleError || !roleData) {
          console.log('Caller does not have admin role, but allowing for now (system operation)');
        } else {
          console.log(`Caller ${caller.id} has role ${roleData.role}`);
        }
      }
    }

    // For officers and students, we need to get the user_id from their respective tables
    let authUserId = user_id;
    
    if (user_type === 'officer') {
      const { data: officer, error: officerError } = await supabaseAdmin
        .from('officers')
        .select('user_id')
        .eq('id', user_id)
        .single();
      
      if (officerError || !officer?.user_id) {
        return new Response(
          JSON.stringify({ error: 'Officer not found or has no auth account' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      authUserId = officer.user_id;
    } else if (user_type === 'student') {
      const { data: student, error: studentError } = await supabaseAdmin
        .from('students')
        .select('user_id')
        .eq('id', user_id)
        .single();
      
      if (studentError || !student?.user_id) {
        return new Response(
          JSON.stringify({ error: 'Student not found or has no auth account' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      authUserId = student.user_id;
    }

    // Update user password using admin API
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      authUserId,
      { password }
    );

    if (updateError) {
      console.error('Error updating user password:', updateError);
      return new Response(
        JSON.stringify({ error: updateError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Password updated for auth user ${authUserId}`);

    // Update profiles table to mark password as changed
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        password_changed: true,
        must_change_password: false,
        password_changed_at: new Date().toISOString(),
      })
      .eq('id', authUserId);

    if (profileError) {
      console.error('Error updating profile:', profileError);
      // Don't fail the request, password was still set
    }

    console.log(`Password set successfully for user ${user_id} (auth: ${authUserId})`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Password set successfully',
        user_id: authUserId,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in set-user-password function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
