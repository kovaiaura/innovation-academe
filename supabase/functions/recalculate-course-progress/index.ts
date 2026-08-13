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

    // --- auth: only signed-in staff may run the backfill
    const authHeader = req.headers.get('Authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
      return json({ error: 'Unauthorized' }, 401);
    }
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
    const allowed = ['super_admin', 'system_admin', 'management', 'officer'];
    if (!(roles || []).some((r: any) => allowed.includes(r.role))) {
      return json({ error: 'Forbidden' }, 403);
    }

    // ---------- Load allocation graph ----------
    const { data: classAssignments } = await admin
      .from('course_class_assignments')
      .select('id, class_id, course_id');

    const { data: moduleAssigns } = await admin
      .from('class_module_assignments')
      .select('id, class_assignment_id, module_id');

    const { data: sessionAssigns } = await admin
      .from('class_session_assignments')
      .select('session_id, class_module_assignment_id, course_sessions(id, title)');

    const { data: classes } = await admin.from('classes').select('id, institution_id');
    const classInstitution = new Map<string, string>();
    (classes || []).forEach((c: any) => classInstitution.set(c.id, c.institution_id));

    const moduleMeta = new Map<string, { classAssignmentId: string; moduleId: string }>();
    (moduleAssigns || []).forEach((m: any) =>
      moduleMeta.set(m.id, { classAssignmentId: m.class_assignment_id, moduleId: m.module_id })
    );

    const assignMeta = new Map<string, { classId: string; courseId: string }>();
    (classAssignments || []).forEach((a: any) =>
      assignMeta.set(a.id, { classId: a.class_id, courseId: a.course_id })
    );

    // sessionId -> list of allocation entries
    interface Alloc {
      sessionId: string;
      title: string;
      classId: string;
      classAssignmentId: string;
      courseId: string;
      moduleId: string;
    }
    const allocsBySession = new Map<string, Alloc[]>();
    const allocsByClass = new Map<string, Alloc[]>();

    (sessionAssigns || []).forEach((row: any) => {
      const mm = moduleMeta.get(row.class_module_assignment_id);
      if (!mm) return;
      const am = assignMeta.get(mm.classAssignmentId);
      if (!am) return;
      const alloc: Alloc = {
        sessionId: row.session_id,
        title: row?.course_sessions?.title || '',
        classId: am.classId,
        classAssignmentId: mm.classAssignmentId,
        courseId: am.courseId,
        moduleId: mm.moduleId,
      };
      allocsBySession.set(row.session_id, [...(allocsBySession.get(row.session_id) || []), alloc]);
      allocsByClass.set(am.classId, [...(allocsByClass.get(am.classId) || []), alloc]);
    });

    const rows: any[] = [];
    const seen = new Set<string>();
    const push = (a: Alloc, studentId: string, source: string) => {
      const key = `${studentId}|${a.sessionId}|${a.classAssignmentId}`;
      if (seen.has(key)) return;
      seen.add(key);
      rows.push({
        institution_id: classInstitution.get(a.classId) || null,
        class_id: a.classId,
        class_assignment_id: a.classAssignmentId,
        course_id: a.courseId,
        module_id: a.moduleId,
        session_id: a.sessionId,
        student_id: studentId,
        source,
      });
    };

    // ---------- 1) From officer-marked attendance ----------
    const { data: attendance } = await admin
      .from('class_session_attendance')
      .select('id, class_id, attendance_records, covered_session_ids, subject, period_label')
      .eq('is_session_completed', true);

    (attendance || []).forEach((row: any) => {
      const classAllocs = allocsByClass.get(row.class_id) || [];
      if (classAllocs.length === 0) return;

      const covered: string[] = Array.isArray(row.covered_session_ids)
        ? row.covered_session_ids
        : [];

      let targets: Alloc[] = classAllocs.filter((a) => covered.includes(a.sessionId));

      if (targets.length === 0) {
        // legacy fallback: match session title against subject / period label
        const candidates = [row.subject, row.period_label]
          .filter(Boolean)
          .map((t: string) => t.trim().toLowerCase());
        targets = classAllocs.filter(
          (a) => a.title && candidates.includes(a.title.trim().toLowerCase())
        );
      }
      if (targets.length === 0) return;

      const records = Array.isArray(row.attendance_records) ? row.attendance_records : [];
      records.forEach((rec: any) => {
        if (!rec?.student_id) return;
        if (rec.status !== 'present' && rec.status !== 'late') return;
        targets.forEach((a) => push(a, rec.student_id, 'backfill'));
      });
    });

    // ---------- 2) From fully completed content ----------
    const sessionIds = [...allocsBySession.keys()];
    if (sessionIds.length > 0) {
      const { data: contentItems } = await admin
        .from('course_content')
        .select('id, session_id')
        .in('session_id', sessionIds);

      const contentBySession = new Map<string, string[]>();
      (contentItems || []).forEach((c: any) => {
        contentBySession.set(c.session_id, [...(contentBySession.get(c.session_id) || []), c.id]);
      });

      const { data: completions } = await admin
        .from('student_content_completions')
        .select('student_id, content_id, class_assignment_id');

      const doneByStudentAssign = new Map<string, Set<string>>();
      (completions || []).forEach((c: any) => {
        const key = `${c.student_id}|${c.class_assignment_id}`;
        const set = doneByStudentAssign.get(key) || new Set<string>();
        set.add(c.content_id);
        doneByStudentAssign.set(key, set);
      });

      doneByStudentAssign.forEach((doneSet, key) => {
        const [studentId, classAssignmentId] = key.split('|');
        allocsBySession.forEach((allocs) => {
          allocs
            .filter((a) => a.classAssignmentId === classAssignmentId)
            .forEach((a) => {
              const contentIds = contentBySession.get(a.sessionId) || [];
              if (contentIds.length === 0) return;
              if (contentIds.every((cid) => doneSet.has(cid))) {
                push(a, studentId, 'content_completed');
              }
            });
        });
      });
    }

    // ---------- Upsert in chunks ----------
    let inserted = 0;
    for (let i = 0; i < rows.length; i += 500) {
      const chunk = rows.slice(i, i + 500);
      const { error } = await admin
        .from('class_session_completions')
        .upsert(chunk, {
          onConflict: 'student_id,session_id,class_assignment_id',
          ignoreDuplicates: true,
        });
      if (error) {
        console.error('Upsert failed', error);
        return json({ error: error.message, processed: inserted }, 500);
      }
      inserted += chunk.length;
    }

    return json({ success: true, processed: inserted });
  } catch (err) {
    console.error('recalculate-course-progress error', err);
    return json({ error: (err as Error).message }, 500);
  }
});
