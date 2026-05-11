import { supabase } from '@/integrations/supabase/client';

/**
 * Shared session-based course progress utilities.
 *
 * Rules used everywhere (student/class/institution):
 *  - A SESSION is "completed" for a student when ALL course_content rows
 *    in that session have a matching student_content_completions row.
 *  - Individual student progress = completed allocated sessions / total allocated sessions.
 *  - Class progress = sum of completed student-sessions across active students
 *                     / (allocated sessions × active students).
 *  - Institution progress = sum across classes using the same numerator/denominator.
 *
 * Locked sessions are still counted in the denominator only if they are part
 * of the class assignment (this matches what officers see and mark).
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
    for (const ctx of contexts) {
      const completedSet =
        completedByStudentAssign.get(`${sid}__${ctx.classAssignmentId}`) || new Set<string>();
      ctx.contentBySession.forEach(contentIds => {
        totalSessions += 1;
        if (contentIds.length === 0) return; // session with no content does not count as completed
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
