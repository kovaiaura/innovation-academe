import { supabase } from '@/integrations/supabase/client';

/** Read every matching row: chunks the id list and pages past the 1000-row limit. */
export async function fetchAllIn<T = any>(
  table: string,
  select: string,
  col: string,
  ids: string[],
  extra?: (q: any) => any
): Promise<T[]> {
  const out: T[] = [];
  const unique = [...new Set(ids.filter(Boolean))];
  for (let i = 0; i < unique.length; i += 100) {
    const chunk = unique.slice(i, i + 100);
    for (let from = 0; ; from += 1000) {
      let q: any = (supabase.from(table as any) as any).select(select).in(col, chunk);
      if (extra) q = extra(q);
      const { data, error } = await q.order('id', { ascending: true }).range(from, from + 999);
      if (error) throw error;
      out.push(...((data || []) as T[]));
      if (!data || data.length < 1000) break;
    }
  }
  return out;
}

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

  const assignments = await fetchAllIn('course_class_assignments', 'id, class_id', 'id', classAssignmentIds);

  const moduleAssigns = await fetchAllIn('class_module_assignments', 'id, class_assignment_id', 'class_assignment_id', classAssignmentIds);

  const moduleIds = (moduleAssigns || []).map((m: any) => m.id);
  const sessionAssigns = await fetchAllIn('class_session_assignments', 'id, session_id, class_module_assignment_id', 'class_module_assignment_id', moduleIds);

  const sessionIds = [...new Set((sessionAssigns || []).map((s: any) => s.session_id))];
  const contentItems = await fetchAllIn('course_content', 'id, session_id', 'session_id', sessionIds as string[]);

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
 * Load officer-marked session completions for the given classes from the
 * dedicated class_session_completions table (explicit session ids, no
 * fragile title matching).
 * Returns map studentRecordId -> Set<sessionId>.
 */
async function loadOfficerMarkedSessionsByStudent(
  classIds: string[],
  studentIds?: string[]
): Promise<Map<string, Set<string>>> {
  const result = new Map<string, Set<string>>();
  if (classIds.length === 0) return result;

  const data = studentIds?.length
    ? await fetchAllIn('class_session_completions', 'id, student_id, session_id', 'student_id', studentIds,
        q => q.in('class_id', classIds))
    : await fetchAllIn('class_session_completions', 'id, student_id, session_id', 'class_id', classIds);

  (data || []).forEach((row: any) => {
    if (!row?.student_id || !row?.session_id) return;
    const set = result.get(row.student_id) || new Set<string>();
    set.add(row.session_id);
    result.set(row.student_id, set);
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
    completions = await fetchAllIn('student_content_completions', 'id, student_id, content_id, class_assignment_id',
      'student_id', studentRecordIds, q => q.in('class_assignment_id', allAssignmentIds));
  }

  // Also load officer-marked session completions for the involved classes
  const classIds = [...new Set(contexts.map(c => c.classId))];
  const markedBySession = await loadOfficerMarkedSessionsByStudent(classIds, studentRecordIds);

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
