import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3';

/**
 * Issues level and course completion certificates for students of one or more
 * classes. A session counts as complete for a student when the officer marked
 * it (class_session_completions) or every content item in it is completed.
 * Levels named "NA" and levels without allocated sessions are ignored.
 * The certificate date is the date the level/course was actually finished.
 */

const BodySchema = z.object({
  classId: z.string().uuid().optional(),
  classIds: z.array(z.string().uuid()).max(10).optional(),
  studentIds: z.array(z.string().uuid()).max(500).optional(),
  // legacy single-student payload
  studentRecordId: z.string().uuid().optional(),
}).passthrough();

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const isNA = (t?: string | null) => {
  const v = (t || '').trim().toLowerCase().replace(/[\s./-]/g, '');
  return v === 'na';
};

async function readAll<T>(build: (from: number, to: number) => any): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await build(from, from + 999);
    if (error) throw error;
    out.push(...((data || []) as T[]));
    if (!data || data.length < 1000) break;
  }
  return out;
}

async function readIn<T>(admin: any, table: string, select: string, col: string, ids: string[], extra?: (q: any) => any): Promise<T[]> {
  const out: T[] = [];
  for (let i = 0; i < ids.length; i += 100) {
    const slice = ids.slice(i, i + 100);
    const rows = await readAll<T>((from, to) => {
      let q = admin.from(table).select(select).in(col, slice);
      if (extra) q = extra(q);
      return q.order('id').range(from, to);
    });
    out.push(...rows);
  }
  return out;
}

const maxDate = (a: string | null, b: string | null) => (!a ? b : !b ? a : a > b ? a : b);

async function processClass(admin: any, classId: string, onlyStudents?: string[]) {
  const result = { classId, levelIssued: 0, courseIssued: 0, missingTemplate: false, completeLevels: 0, alreadyIssued: 0, studentsWithoutUserId: 0 };

  const { data: cls } = await admin.from('classes').select('id, institution_id').eq('id', classId).maybeSingle();
  if (!cls) return result;

  let studentQ = admin.from('students').select('id, user_id').eq('class_id', classId).eq('status', 'active');
  const students = ((await studentQ).data || []) as { id: string; user_id: string | null }[];
  const scoped = students.filter(s => !onlyStudents || onlyStudents.includes(s.id));
  result.studentsWithoutUserId = scoped.filter(s => !s.user_id).length;
  const targets = scoped.filter(s => s.user_id);
  if (!targets.length) return result;

  const { data: cas } = await admin
    .from('course_class_assignments')
    .select('id, course_id, courses (title, certificate_template_id)')
    .eq('class_id', classId);
  const caList = (cas || []) as any[];
  if (!caList.length) return result;
  const caIds = caList.map(c => c.id);

  const mods = await readIn<any>(admin, 'class_module_assignments',
    'id, class_assignment_id, module_id, course_modules (title, certificate_template_id)',
    'class_assignment_id', caIds);
  const levels = mods.filter(m => !isNA(m.course_modules?.title));
  if (!levels.length) return result;

  const sessAssign = await readIn<any>(admin, 'class_session_assignments',
    'id, class_module_assignment_id, session_id', 'class_module_assignment_id', levels.map(m => m.id));
  const sessionIds = [...new Set(sessAssign.map(s => s.session_id))];
  if (!sessionIds.length) return result;

  const content = await readIn<any>(admin, 'course_content', 'id, session_id', 'session_id', sessionIds);
  const contentBySession = new Map<string, string[]>();
  content.forEach(c => contentBySession.set(c.session_id, [...(contentBySession.get(c.session_id) || []), c.id]));

  const studentIds = targets.map(s => s.id);
  // officer marks: key student|assignment|session -> date
  const marks = await readIn<any>(admin, 'class_session_completions',
    'id, student_id, session_id, class_assignment_id, completed_at', 'class_assignment_id', caIds,
    q => q.in('student_id', studentIds));
  const markDate = new Map<string, string | null>();
  marks.forEach(m => markDate.set(`${m.student_id}|${m.class_assignment_id}|${m.session_id}`, m.completed_at || null));

  const contentDone = await readIn<any>(admin, 'student_content_completions',
    'id, student_id, content_id, class_assignment_id, completed_at', 'class_assignment_id', caIds,
    q => q.in('student_id', studentIds));
  const doneContent = new Map<string, string | null>();
  contentDone.forEach(c => doneContent.set(`${c.student_id}|${c.class_assignment_id}|${c.content_id}`, c.completed_at || null));

  // templates
  const { data: tpls } = await admin.from('certificate_templates').select('id, category, is_active');
  const active = ((tpls || []) as any[]).filter(t => t.is_active);
  const activeIds = new Set(active.map(t => t.id));
  const levelFallback = active.find(t => t.category === 'level' || t.category === 'module')?.id || null;
  const courseFallback = active.find(t => t.category === 'course')?.id || null;

  const userIds = targets.map(s => s.user_id!) as string[];
  const existing = await readIn<any>(admin, 'student_certificates', 'id, student_id, activity_type, activity_id',
    'student_id', userIds, q => q.in('activity_type', ['level', 'course']));
  const have = new Set(existing.map(e => `${e.student_id}|${e.activity_type}|${e.activity_id}`));

  const certRows: any[] = [];
  const xpRows: any[] = [];
  const now = new Date().toISOString();
  const code = () => `CERT-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

  for (const ca of caList) {
    const caLevels = levels
      .map(l => ({ l, sessions: sessAssign.filter(s => s.class_module_assignment_id === l.id) }))
      .filter(x => x.l.class_assignment_id === ca.id && x.sessions.length > 0);
    if (!caLevels.length) continue;
    const courseTitle = ca.courses?.title || 'Course';

    for (const st of targets) {
      let allLevelsDone = true;
      let courseDate: string | null = null;

      for (const { l, sessions } of caLevels) {
        let levelDone = true;
        let levelDate: string | null = null;
        for (const s of sessions) {
          const mk = `${st.id}|${ca.id}|${s.session_id}`;
          if (markDate.has(mk)) { levelDate = maxDate(levelDate, markDate.get(mk) || null); continue; }
          const items = contentBySession.get(s.session_id) || [];
          if (items.length && items.every(cid => doneContent.has(`${st.id}|${ca.id}|${cid}`))) {
            items.forEach(cid => { levelDate = maxDate(levelDate, doneContent.get(`${st.id}|${ca.id}|${cid}`) || null); });
            continue;
          }
          levelDone = false;
          break;
        }
        if (!levelDone) { allLevelsDone = false; continue; }
        courseDate = maxDate(courseDate, levelDate);
        result.completeLevels++;

        const key = `${st.user_id}|level|${l.module_id}`;
        if (have.has(key)) { result.alreadyIssued++; continue; }
        const own = l.course_modules?.certificate_template_id;
        const tpl = own && activeIds.has(own) ? own : levelFallback;
        if (!tpl) { result.missingTemplate = true; continue; }
        have.add(key);
        certRows.push({
          student_id: st.user_id, template_id: tpl, activity_type: 'level', activity_id: l.module_id,
          activity_name: `${l.course_modules?.title || 'Level'} - ${courseTitle}`,
          institution_id: cls.institution_id, verification_code: code(), issued_date: levelDate || now,
        });
        xpRows.push({
          student_id: st.user_id, institution_id: cls.institution_id, activity_type: 'level_completion',
          activity_id: l.module_id, points_earned: 100, description: `Level completed: ${l.course_modules?.title || 'Level'}`,
        });
      }

      if (allLevelsDone) {
        const key = `${st.user_id}|course|${ca.course_id}`;
        if (have.has(key)) continue;
        const own = ca.courses?.certificate_template_id;
        const tpl = own && activeIds.has(own) ? own : courseFallback;
        if (!tpl) { result.missingTemplate = true; continue; }
        have.add(key);
        certRows.push({
          student_id: st.user_id, template_id: tpl, activity_type: 'course', activity_id: ca.course_id,
          activity_name: courseTitle, institution_id: cls.institution_id, verification_code: code(),
          issued_date: courseDate || now,
        });
        xpRows.push({
          student_id: st.user_id, institution_id: cls.institution_id, activity_type: 'course_completion',
          activity_id: ca.course_id, points_earned: 500, description: `Course completed: ${courseTitle}`,
        });
      }
    }
  }

  for (let i = 0; i < certRows.length; i += 500) {
    const chunk = certRows.slice(i, i + 500);
    const { data, error } = await admin.from('student_certificates')
      .upsert(chunk, { onConflict: 'student_id,activity_type,activity_id', ignoreDuplicates: true })
      .select('activity_type');
    if (error) throw error;
    (data || []).forEach((r: any) => r.activity_type === 'course' ? result.courseIssued++ : result.levelIssued++);
  }
  for (let i = 0; i < xpRows.length; i += 500) {
    const { error } = await admin.from('student_xp_transactions')
      .upsert(xpRows.slice(i, i + 500), { onConflict: 'student_id,activity_type,activity_id', ignoreDuplicates: true });
    if (error) console.error('XP upsert failed (non-critical)', error);
  }
  return result;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const authHeader = req.headers.get('Authorization') || '';
    if (!authHeader.startsWith('Bearer ')) return json({ error: 'Unauthorized' }, 401);
    const authClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: userData } = await authClient.auth.getUser();
    if (!userData?.user) return json({ error: 'Unauthorized' }, 401);

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: roles } = await admin.from('user_roles').select('role').eq('user_id', userData.user.id);
    const roleList = (roles || []).map((r: any) => r.role);
    const staff = ['super_admin', 'system_admin', 'management', 'officer'].some(r => roleList.includes(r));

    const parsed = BodySchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400);
    const body = parsed.data;

    let classIds = [...new Set([...(body.classIds || []), ...(body.classId ? [body.classId] : [])])];
    let studentIds = body.studentIds;

    // Legacy single-student payload (student self-check)
    if (!classIds.length && body.studentRecordId) {
      const { data: st } = await admin.from('students').select('id, class_id, user_id').eq('id', body.studentRecordId).maybeSingle();
      if (!st?.class_id) return json({ issued: false, message: 'Student not found' });
      if (!staff && st.user_id !== userData.user.id) return json({ error: 'Forbidden' }, 403);
      classIds = [st.class_id];
      studentIds = [st.id];
    } else if (!staff) {
      return json({ error: 'Forbidden' }, 403);
    }

    if (!classIds.length) return json({ error: 'classId is required' }, 400);

    const results = [];
    for (const id of classIds) results.push(await processClass(admin, id, studentIds));
    const levelIssued = results.reduce((s, r) => s + r.levelIssued, 0);
    const courseIssued = results.reduce((s, r) => s + r.courseIssued, 0);

    return json({
      success: true,
      issued: levelIssued + courseIssued > 0,
      levelIssued,
      courseIssued,
      missingTemplate: results.some(r => r.missingTemplate),
      reasons: {
        completeLevels: results.reduce((s, r) => s + r.completeLevels, 0),
        alreadyIssued: results.reduce((s, r) => s + r.alreadyIssued, 0),
        studentsWithoutUserId: results.reduce((s, r) => s + r.studentsWithoutUserId, 0),
      },
    });
  } catch (err) {
    console.error('issue-completion-certificates error', err);
    return json({ error: (err as Error).message }, 500);
  }
});
