import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface StudentInput {
  student_id?: string; // DB row id for linking
  email: string;
  password: string;
  student_name: string;
  institution_id: string;
  class_id: string;
}

interface StudentResult {
  student_id: string | null;
  email: string;
  user_id: string | null;
  success: boolean;
  error: string | null;
  error_code: string | null;
  already_existed: boolean;
  stage: string;
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
    const { data: claimsData, error: claimsError } = await supabaseAdmin.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const callingUserId = claimsData.claims.sub as string;

    const { data: callerRoles } = await supabaseAdmin
      .from('user_roles').select('role').eq('user_id', callingUserId);
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

    if (students.length > 25) {
      return new Response(JSON.stringify({ error: 'Maximum 25 students per batch' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    console.log(`[BatchCreate] Processing ${students.length} students, mode=${mode || 'create'}`);

    const results: StudentResult[] = [];

    for (const student of students) {
      const normalizedEmail = student.email?.trim().toLowerCase();
      
      if (!normalizedEmail || !student.institution_id) {
        results.push({ 
          student_id: student.student_id || null, email: student.email || 'unknown', 
          user_id: null, success: false, error: 'Missing email or institution_id', 
          error_code: 'missing_fields', already_existed: false, stage: 'validation' 
        });
        continue;
      }

      try {
        const password = student.password || defaultPassword || crypto.randomUUID().slice(0, 16) + 'Aa1!';

        // Try to create auth user
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: normalizedEmail,
          password,
          email_confirm: true,
          user_metadata: {
            name: student.student_name,
            institution_id: student.institution_id,
            class_id: student.class_id || null,
            must_change_password: true,
          },
        });

        let userId: string | null = null;
        let alreadyExisted = false;

        if (createError) {
          if (createError.message?.includes('already been registered') || createError.message?.includes('already exists')) {
            alreadyExisted = true;
            // Find existing user by email using getUserByEmail (more reliable than listUsers)
            try {
              // listUsers with exact email filter
              const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers({
                page: 1,
                perPage: 50,
              });
              
              if (listError) {
                console.error(`[BatchCreate] listUsers error for ${normalizedEmail}:`, listError.message);
              }
              
              const existingUser = listData?.users?.find(u => u.email?.toLowerCase() === normalizedEmail);
              
              if (!existingUser) {
                // Try creating with a known unique approach - search via profiles table
                const { data: profileData } = await supabaseAdmin
                  .from('profiles')
                  .select('id')
                  .eq('email', normalizedEmail)
                  .maybeSingle();
                
                if (profileData?.id) {
                  userId = profileData.id;
                } else {
                  results.push({ 
                    student_id: student.student_id || null, email: normalizedEmail, 
                    user_id: null, success: false, 
                    error: 'Auth user exists but could not be located. Email: ' + normalizedEmail, 
                    error_code: 'user_not_found', already_existed: true, stage: 'auth_lookup' 
                  });
                  await new Promise(resolve => setTimeout(resolve, 200));
                  continue;
                }
              } else {
                userId = existingUser.id;
              }
            } catch (lookupErr: any) {
              console.error(`[BatchCreate] Lookup error for ${normalizedEmail}:`, lookupErr?.message);
              results.push({ 
                student_id: student.student_id || null, email: normalizedEmail, 
                user_id: null, success: false, error: 'Lookup failed: ' + (lookupErr?.message || 'unknown'), 
                error_code: 'lookup_error', already_existed: true, stage: 'auth_lookup' 
              });
              await new Promise(resolve => setTimeout(resolve, 200));
              continue;
            }
          } else {
            console.error(`[BatchCreate] Create error for ${normalizedEmail}:`, createError.message);
            results.push({ 
              student_id: student.student_id || null, email: normalizedEmail, 
              user_id: null, success: false, error: createError.message, 
              error_code: 'auth_create_failed', already_existed: false, stage: 'auth_create' 
            });
            await new Promise(resolve => setTimeout(resolve, 200));
            continue;
          }
        } else {
          userId = newUser.user.id;
        }

        if (!userId) {
          results.push({ 
            student_id: student.student_id || null, email: normalizedEmail, 
            user_id: null, success: false, error: 'No user ID obtained', 
            error_code: 'no_user_id', already_existed: alreadyExisted, stage: 'auth' 
          });
          await new Promise(resolve => setTimeout(resolve, 200));
          continue;
        }

        // Ensure profile exists with correct data
        const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
          id: userId,
          email: normalizedEmail,
          name: student.student_name,
          institution_id: student.institution_id,
          class_id: student.class_id || null,
          must_change_password: true,
        }, { onConflict: 'id', ignoreDuplicates: false });

        if (profileError) {
          console.error(`[BatchCreate] Profile error for ${normalizedEmail}:`, profileError.message);
        }

        // Ensure student role
        const { error: roleError } = await supabaseAdmin.from('user_roles')
          .upsert({ user_id: userId, role: 'student' }, { onConflict: 'user_id,role' });

        if (roleError) {
          console.error(`[BatchCreate] Role error for ${normalizedEmail}:`, roleError.message);
        }

        // Link user_id to student record (using service role - bypasses RLS)
        if (student.student_id) {
          const { error: linkError } = await supabaseAdmin
            .from('students')
            .update({ user_id: userId })
            .eq('id', student.student_id);

          if (linkError) {
            console.error(`[BatchCreate] Link error for ${normalizedEmail} (student_id=${student.student_id}):`, linkError.message);
            results.push({ 
              student_id: student.student_id, email: normalizedEmail, 
              user_id: userId, success: false, 
              error: 'Account created but failed to link to student record: ' + linkError.message, 
              error_code: 'link_failed', already_existed: alreadyExisted, stage: 'student_link' 
            });
            await new Promise(resolve => setTimeout(resolve, 200));
            continue;
          }
        }

        results.push({ 
          student_id: student.student_id || null, email: normalizedEmail, 
          user_id: userId, success: true, error: null, 
          error_code: null, already_existed: alreadyExisted, 
          stage: student.student_id ? 'student_linked' : 'profile_ok' 
        });

      } catch (err: any) {
        console.error(`[BatchCreate] Unexpected error for ${normalizedEmail}:`, err?.message || err);
        results.push({ 
          student_id: student.student_id || null, email: normalizedEmail, 
          user_id: null, success: false, error: err.message || 'Unexpected error', 
          error_code: 'unexpected', already_existed: false, stage: 'unknown' 
        });
      }

      // Throttle between students
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    console.log(`[BatchCreate] Done. success=${successCount} failed=${failCount}`);
    
    // Log failure details
    const failures = results.filter(r => !r.success);
    if (failures.length > 0) {
      console.log(`[BatchCreate] Failure details:`, JSON.stringify(failures.map(f => ({ email: f.email, error_code: f.error_code, stage: f.stage, error: f.error }))));
    }

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
