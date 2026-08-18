import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const authHeader = req.headers.get('Authorization') || '';
    if (!authHeader.startsWith('Bearer ')) return json({ error: 'Unauthorized' }, 401);

    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await authClient.auth.getUser();
    if (!userData?.user) return json({ error: 'Unauthorized' }, 401);

    const admin = createClient(supabaseUrl, serviceKey);

    const { data: roles } = await admin
      .from('user_roles')
      .select('role')
      .eq('user_id', userData.user.id);
    const allowed = ['super_admin', 'system_admin'];
    if (!(roles || []).some((r: any) => allowed.includes(r.role))) {
      return json({ error: 'Forbidden' }, 403);
    }

    const body = await req.json().catch(() => ({}));
    const institutionId: string | undefined = body?.institutionId;
    if (!institutionId || typeof institutionId !== 'string') {
      return json({ error: 'institutionId is required' }, 400);
    }

    // Classes + course assignments + students for this institution
    const { data: classes } = await admin
      .from('classes')
      .select('id')
      .eq('institution_id', institutionId);
    const classIds = (classes || []).map((c: any) => c.id);

    const { data: students } = await admin
      .from('students')
      .select('id')
      .eq('institution_id', institutionId);
    const studentIds = (students || []).map((s: any) => s.id);

    let assignmentIds: string[] = [];
    if (classIds.length > 0) {
      const { data: assignments } = await admin
        .from('course_class_assignments')
        .select('id')
        .in('class_id', classIds);
      assignmentIds = (assignments || []).map((a: any) => a.id);
    }

    const counts = { sessionCompletions: 0, contentCompletions: 0, attendanceRows: 0 };

    // 1. Session completions
    const { data: delSessions } = await admin
      .from('class_session_completions')
      .delete()
      .eq('institution_id', institutionId)
      .select('id');
    counts.sessionCompletions = (delSessions || []).length;

    // 2. Content completions for this institution's students
    if (studentIds.length > 0 && assignmentIds.length > 0) {
      for (let i = 0; i < studentIds.length; i += 200) {
        const chunk = studentIds.slice(i, i + 200);
        const { data: delContent } = await admin
          .from('student_content_completions')
          .delete()
          .in('student_id', chunk)
          .in('class_assignment_id', assignmentIds)
          .select('id');
        counts.contentCompletions += (delContent || []).length;
      }
    }

    // 3. Class attendance / session-completion rows
    const { data: delAttendance } = await admin
      .from('class_session_attendance')
      .delete()
      .eq('institution_id', institutionId)
      .select('id');
    counts.attendanceRows = (delAttendance || []).length;

    return json({ success: true, ...counts });
  } catch (e) {
    console.error('erase-institution-progress error', e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
