import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StudentInput {
  email: string;
  password: string;
  student_name: string;
  institution_id: string;
  class_id: string;
}

interface StudentResult {
  email: string;
  user_id: string | null;
  success: boolean;
  error: string | null;
  already_existed: boolean;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user: callingUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !callingUser) {
      return new Response(JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { data: callerRoles } = await supabaseAdmin
      .from('user_roles').select('role').eq('user_id', callingUser.id);
    const roles = callerRoles?.map(r => r.role) || [];
    const allowedRoles = ['super_admin', 'system_admin', 'management', 'officer'];
    if (!roles.some(role => allowedRoles.includes(role))) {
      return new Response(JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { students, mode, defaultPassword } = await req.json() as { students: StudentInput[]; mode?: string; defaultPassword?: string };

    if (!students || !Array.isArray(students) || students.length === 0) {
      return new Response(JSON.stringify({ error: 'No students provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (students.length > 100) {
      return new Response(JSON.stringify({ error: 'Maximum 100 students per batch' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    console.log(`[BatchCreate] Processing ${students.length} students, mode=${mode || 'create'}`);

    const results: StudentResult[] = [];

    for (const student of students) {
      if (!student.email || !student.institution_id) {
        results.push({ email: student.email || 'unknown', user_id: null, success: false, error: 'Missing email or institution_id', already_existed: false });
        continue;
      }

      try {
        // If mode is 'repair', check if auth user already exists by email
        if (mode === 'repair') {
          // Try to create - if exists, we'll get an error and handle it
          const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: student.email,
            password: student.password || crypto.randomUUID().slice(0, 16) + 'Aa1!',
            email_confirm: true,
            user_metadata: {
              name: student.student_name,
              institution_id: student.institution_id,
              class_id: student.class_id || null,
              must_change_password: true,
            },
          });

          if (createError) {
            if (createError.message?.includes('already been registered') || createError.message?.includes('already exists')) {
              // User exists - find their ID via listUsers with email filter
              const { data: listData } = await supabaseAdmin.auth.admin.listUsers({
                filter: student.email,
                page: 1,
                perPage: 1,
              });
              const existingUser = listData?.users?.find(u => u.email === student.email);
              
              if (existingUser) {
                // Ensure profile has correct institution_id
                await supabaseAdmin.from('profiles').upsert({
                  id: existingUser.id,
                  email: student.email,
                  name: student.student_name,
                  institution_id: student.institution_id,
                  class_id: student.class_id || null,
                  must_change_password: true,
                }, { onConflict: 'id', ignoreDuplicates: false });

                // Ensure student role
                await supabaseAdmin.from('user_roles')
                  .upsert({ user_id: existingUser.id, role: 'student' }, { onConflict: 'user_id,role' });

                results.push({ email: student.email, user_id: existingUser.id, success: true, error: null, already_existed: true });
              } else {
                results.push({ email: student.email, user_id: null, success: false, error: 'User exists but could not be found', already_existed: true });
              }
            } else {
              results.push({ email: student.email, user_id: null, success: false, error: createError.message, already_existed: false });
            }
            continue;
          }

          // New user created successfully in repair mode
          const userId = newUser.user.id;
          await ensureProfileAndRole(supabaseAdmin, userId, student);
          results.push({ email: student.email, user_id: userId, success: true, error: null, already_existed: false });
          continue;
        }

        // Standard create mode
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: student.email,
          password: student.password,
          email_confirm: true,
          user_metadata: {
            name: student.student_name,
            institution_id: student.institution_id,
            class_id: student.class_id || null,
            must_change_password: true,
          },
        });

        if (createError) {
          if (createError.message?.includes('already been registered') || createError.message?.includes('already exists')) {
            results.push({ email: student.email, user_id: null, success: false, error: 'Email already registered', already_existed: true });
          } else {
            results.push({ email: student.email, user_id: null, success: false, error: createError.message, already_existed: false });
          }
          continue;
        }

        const userId = newUser.user.id;
        await ensureProfileAndRole(supabaseAdmin, userId, student);
        results.push({ email: student.email, user_id: userId, success: true, error: null, already_existed: false });

      } catch (err: any) {
        console.error(`[BatchCreate] Error for ${student.email}:`, err);
        results.push({ email: student.email, user_id: null, success: false, error: err.message || 'Unexpected error', already_existed: false });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    console.log(`[BatchCreate] Done. success=${successCount} failed=${failCount}`);

    return new Response(
      JSON.stringify({ results, summary: { total: results.length, success: successCount, failed: failCount } }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('[BatchCreate] Unexpected error:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

async function ensureProfileAndRole(supabaseAdmin: any, userId: string, student: StudentInput) {
  // Wait briefly for trigger
  await new Promise(resolve => setTimeout(resolve, 150));

  // Upsert profile
  await supabaseAdmin.from('profiles').upsert({
    id: userId,
    email: student.email,
    name: student.student_name,
    institution_id: student.institution_id,
    class_id: student.class_id || null,
    must_change_password: true,
  }, { onConflict: 'id', ignoreDuplicates: false });

  // Assign student role
  await supabaseAdmin.from('user_roles')
    .upsert({ user_id: userId, role: 'student' }, { onConflict: 'user_id,role' });
}
