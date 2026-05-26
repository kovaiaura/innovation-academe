import { supabase } from '@/integrations/supabase/client';

/**
 * Shared session-based course progress utilities.
 *
 * A session counts as "completed" for a student when EITHER:
 *  - it has course_content rows AND every row has a matching
 *    student_content_completions row for that student, OR
 *  - the session was marked completed for the student via the officer's
 *    "mark session complete" flow (class_session_attendance row with
 *    is_session_completed = true and the student present in attendance_records).
 *
 * Per-student progress = completed allocated sessions / total allocated sessions.
 * Class progress and institution progress are aggregated as the MAX across
 * students/classes by the analytics hooks (top performer rule).
 */

export interface SessionCompletionContext {
  /** classAssignmentId (course_class_assignments.id) */
  classAssignmentId: string;
  classId: string;
  /** Allocated session ids (course_sessions.id) */
  sessionIds: string[];
  /** Map sessionId -> required course_content ids */
  contentBySession: Map<string, string[]>;
}

export interface StudentSessionProgress {
  studentRecordId: string;
  totalSessions: number;
  completedSessions: number;
  progressPercentage: number;
}

/**
 * Build the allocation context for one or many class assignments.
 */
export async function buildSessionCompletionContexts(
  classAssignmentIds: string[]
): Promise<Map<string, SessionCompletionContext>> {
  const result = new Map<string, SessionCompletionContext>();
  if (classAssignmentIds.length === 0) return result;

  const { data: assignments } = await supabase
    .from('course_class_assignments')
    .select('id, class_id')
    .in('id', classAssignmentIds);

  const { data: moduleAssigns } = await supabase
    .from('class_module_assignments')
    .select('id, class_assignment_id')
    .in('class_assignment_id', classAssignmentIds);

  const moduleIds = (moduleAssigns || []).map((m: any) => m.id);
  const { data: sessionAssigns } = moduleIds.length
    ? await supabase
        .from('class_session_assignments')
        .select('session_id, class_module_assignment_id')
        .in('class_module_assignment_id', moduleIds)
    : { data: [] as any[] };

  const sessionIds = [...new Set((sessionAssigns || []).map((s: any) => s.session_id))];
  const { data: contentItems } = sessionIds.length
    ? await supabase
        .from('course_content')
        .select('id, session_id')
        .in('session_id', sessionIds)
    : { data: [] as any[] };

  // session -> content ids
  const sessionContent = new Map<string, string[]>();
  (contentItems || []).forEach((c: any) => {
    const arr = sessionContent.get(c.session_id) || [];
    arr.push(c.id);
    sessionContent.set(c.session_id, arr);
  });

  // assignment -> module ids
  const assignmentModules = new Map<string, string[]>();
  (moduleAssigns || []).forEach((m: any) => {
    const arr = assignmentModules.get(m.class_assignment_id) || [];
    arr.push(m.id);
    assignmentModules.set(m.class_assignment_id, arr);
  });
  // module -> session ids
  const moduleSessions = new Map<string, string[]>();
  (sessionAssigns || []).forEach((s: any) => {
    const arr = moduleSessions.get(s.class_module_assignment_id) || [];
    arr.push(s.session_id);
    moduleSessions.set(s.class_module_assignment_id, arr);
  });

  (assignments || []).forEach((a: any) => {
    const sIds: string[] = [];
    const cBySession = new Map<string, string[]>();
    (assignmentModules.get(a.id) || []).forEach(mid => {
      (moduleSessions.get(mid) || []).forEach(sid => {
        sIds.push(sid);
        cBySession.set(sid, sessionContent.get(sid) || []);
      });
    });
    result.set(a.id, {
      classAssignmentId: a.id,
      classId: a.class_id,
      sessionIds: sIds,
      contentBySession: cBySession,
    });
  });

  return result;
}

/**
 * Load officer-marked session completions for the given classes.
 * Returns map studentRecordId -> Set<sessionId> of sessions marked complete
 * via class_session_attendance.is_session_completed where the student appears
 * as present in the attendance_records JSON.
 */
async function loadOfficerMarkedSessionsByStudent(
  classIds: string[]
): Promise<Map<string, Set<string>>> {
  const result = new Map<string, Set<string>>();
  if (classIds.length === 0) return result;

  const { data: attendanceRows } = await supabase
    .from('class_session_attendance')
    .select('subject, period_label, attendance_records, is_session_completed, class_id')
    .in('class_id', classIds)
    .eq('is_session_completed', true);

  if (!attendanceRows || attendanceRows.length === 0) return result;

  // Resolve subject/period_label to session_id via the classes' allocated sessions.
  const { data: classAssignments } = await supabase
    .from('course_class_assignments')
    .select('id, class_id')
    .in('class_id', classIds);
  const assignIdToClass = new Map<string, string>();
  (classAssignments || []).forEach((a: any) => assignIdToClass.set(a.id, a.class_id));

  const { data: moduleAssigns } = (classAssignments || []).length
    ? await supabase
        .from('class_module_assignments')
        .select('id, class_assignment_id')
        .in('class_assignment_id', (classAssignments || []).map((a: any) => a.id))
    : { data: [] as any[] };
  const moduleIdToClass = new Map<string, string>();
  (moduleAssigns || []).forEach((m: any) => {
    const cls = assignIdToClass.get(m.class_assignment_id);
    if (cls) moduleIdToClass.set(m.id, cls);
  });

  const { data: sessionAssigns } = (moduleAssigns || []).length
    ? await supabase
        .from('class_session_assignments')
        .select('session_id, class_module_assignment_id, course_sessions(id, title)')
        .in('class_module_assignment_id', (moduleAssigns || []).map((m: any) => m.id))
    : { data: [] as any[] };

  const titleToSessionByClass = new Map<string, Map<string, string>>();
  (sessionAssigns || []).forEach((row: any) => {
    const cls = moduleIdToClass.get(row.class_module_assignment_id);
    const title: string | undefined = row?.course_sessions?.title;
    const sid: string | undefined = row?.session_id;
    if (!cls || !title || !sid) return;
    const m = titleToSessionByClass.get(cls) || new Map<string, string>();
    m.set(title, sid);
    titleToSessionByClass.set(cls, m);
  });

  attendanceRows.forEach((row: any) => {
    const titleMap = titleToSessionByClass.get(row.class_id);
    if (!titleMap) return;
    const sid =
      titleMap.get(row.subject) ||
      titleMap.get(row.period_label);
    if (!sid) return;

    const records = Array.isArray(row.attendance_records) ? row.attendance_records : [];
    records.forEach((rec: any) => {
      if (!rec?.student_id) return;
      if (rec.status === 'present' || rec.status === 'late') {
        const set = result.get(rec.student_id) || new Set<string>();
        set.add(sid);
        result.set(rec.student_id, set);
      }
    });
  });

  return result;
}


/**
 * Compute per-student completed-session counts for a list of class assignments.
 * Returns map: studentRecordId -> { totalSessions, completedSessions } across ALL given assignments combined.
 */
export async function computeStudentSessionProgress(
  studentRecordIds: string[],
  contexts: SessionCompletionContext[]
): Promise<Map<string, StudentSessionProgress>> {
  const map = new Map<string, StudentSessionProgress>();
  if (studentRecordIds.length === 0 || contexts.length === 0) {
    studentRecordIds.forEach(id =>
      map.set(id, {
        studentRecordId: id,
        totalSessions: 0,
        completedSessions: 0,
        progressPercentage: 0,
      })
    );
    return map;
  }

  const allAssignmentIds = contexts.map(c => c.classAssignmentId);
  const allContentIds = new Set<string>();
  contexts.forEach(c =>
    c.contentBySession.forEach(arr => arr.forEach(id => allContentIds.add(id)))
  );

  let completions: { student_id: string; content_id: string; class_assignment_id: string }[] = [];
  if (allContentIds.size > 0) {
    const { data } = await supabase
      .from('student_content_completions')
      .select('student_id, content_id, class_assignment_id')
      .in('class_assignment_id', allAssignmentIds)
      .in('student_id', studentRecordIds);
    completions = (data || []) as any;
  }

  // Also load officer-marked session completions for the involved classes
  const classIds = [...new Set(contexts.map(c => c.classId))];
  const markedBySession = await loadOfficerMarkedSessionsByStudent(classIds);

  // Build set per (student, classAssignment) of completed content ids
  const completedByStudentAssign = new Map<string, Set<string>>();
  completions.forEach(c => {
    const key = `${c.student_id}__${c.class_assignment_id}`;
    const set = completedByStudentAssign.get(key) || new Set<string>();
    set.add(c.content_id);
    completedByStudentAssign.set(key, set);
  });

  for (const sid of studentRecordIds) {
    let totalSessions = 0;
    let completedSessions = 0;
    const officerMarked = markedBySession.get(sid) || new Set<string>();
    for (const ctx of contexts) {
      const completedSet =
        completedByStudentAssign.get(`${sid}__${ctx.classAssignmentId}`) || new Set<string>();
      ctx.contentBySession.forEach((contentIds, sessionId) => {
        totalSessions += 1;
        // Officer-marked counts as completed regardless of content
        if (officerMarked.has(sessionId)) {
          completedSessions += 1;
          return;
        }
        if (contentIds.length === 0) return; // empty session and not officer-marked: not completed
        if (contentIds.every(cid => completedSet.has(cid))) {
          completedSessions += 1;
        }
      });
    }
    map.set(sid, {
      studentRecordId: sid,
      totalSessions,
      completedSessions,
      progressPercentage:
        totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 1000) / 10 : 0,
    });
  }

  return map;
}
