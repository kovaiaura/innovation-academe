import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { PlayCircle, CheckCircle2, Circle, BookOpen, Lock, Loader2, ChevronDown, Trophy } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ThumbnailImage } from '@/components/officer/ThumbnailImage';
import { isNotApplicableTitle } from '@/utils/courseHelpers';
import { cn } from '@/lib/utils';

interface ClassCourseLauncherProps {
  classId: string;
  className: string;
  officerId: string;
}

/** Reads every row for `ids` in chunks, paging past the 1000-row limit. */
async function readIn<T>(table: string, select: string, col: string, ids: string[], order = 'id'): Promise<T[]> {
  const out: T[] = [];
  for (let i = 0; i < ids.length; i += 50) {
    const slice = ids.slice(i, i + 50);
    for (let from = 0; ; from += 1000) {
      const { data, error } = await (supabase.from(table as any) as any)
        .select(select).in(col, slice).order(order).range(from, from + 999);
      if (error) throw error;
      out.push(...((data || []) as T[]));
      if (!data || data.length < 1000) break;
    }
  }
  return out;
}

interface SessionRow { id: string; class_module_assignment_id: string; session_id: string; is_unlocked: boolean; unlock_order: number | null; course_sessions?: { title: string } | null }
interface ModuleRow { id: string; class_assignment_id: string; module_id: string; is_unlocked: boolean; unlock_order: number | null; course_modules?: { title: string; display_order: number | null } | null }

export function ClassCourseLauncher({ classId, className }: ClassCourseLauncherProps) {
  const { tenantId } = useParams();
  const navigate = useNavigate();
  const [openLevels, setOpenLevels] = useState<Set<string>>(new Set());

  const { data, isLoading } = useQuery({
    queryKey: ['class-course-launcher', classId],
    queryFn: async () => {
      const { data: cas, error } = await supabase
        .from('course_class_assignments')
        .select('id, course_id, courses (id, title, course_code, thumbnail_url, status)')
        .eq('class_id', classId);
      if (error) throw error;
      const caList = (cas || []).filter((c: any) => c.courses);
      const caIds = caList.map(c => c.id);
      if (!caIds.length) return { caList, modules: [] as ModuleRow[], sessions: [] as SessionRow[], completed: new Set<string>() };

      const { data: studentRows } = await supabase
        .from('students').select('id').eq('class_id', classId).eq('status', 'active');
      const studentIds = (studentRows || []).map(s => s.id);

      const modules = (await readIn<ModuleRow>('class_module_assignments',
        'id, class_assignment_id, module_id, is_unlocked, unlock_order, course_modules (title, display_order)',
        'class_assignment_id', caIds)).filter(m => !isNotApplicableTitle(m.course_modules?.title));
      const sessions = await readIn<SessionRow>('class_session_assignments',
        'id, class_module_assignment_id, session_id, is_unlocked, unlock_order, course_sessions (title)',
        'class_module_assignment_id', modules.map(m => m.id));

      const sessionIds = [...new Set(sessions.map(s => s.session_id))];
      const content = await readIn<{ id: string; session_id: string }>('course_content', 'id, session_id', 'session_id', sessionIds);
      const contentBySession = new Map<string, string[]>();
      content.forEach(c => contentBySession.set(c.session_id, [...(contentBySession.get(c.session_id) || []), c.id]));

      const marks = await readIn<{ student_id: string; session_id: string; class_assignment_id: string }>(
        'class_session_completions', 'id, student_id, session_id, class_assignment_id', 'class_assignment_id', caIds);
      const marked = new Set(marks.map(m => `${m.class_assignment_id}|${m.session_id}|${m.student_id}`));
      const contentDone = await readIn<{ student_id: string; content_id: string; class_assignment_id: string }>(
        'student_content_completions', 'id, student_id, content_id, class_assignment_id', 'class_assignment_id', caIds);
      const doneContent = new Set(contentDone.map(c => `${c.class_assignment_id}|${c.content_id}|${c.student_id}`));

      const moduleCa = new Map(modules.map(m => [m.id, m.class_assignment_id]));
      // key: class_module_assignment_id|session_id — complete when every active student has it
      const completed = new Set<string>();
      sessions.forEach(s => {
        const ca = moduleCa.get(s.class_module_assignment_id);
        if (!ca) return;
        const items = contentBySession.get(s.session_id) || [];
        const studentDone = (sid: string) =>
          marked.has(`${ca}|${s.session_id}|${sid}`) ||
          (items.length > 0 && items.every(cid => doneContent.has(`${ca}|${cid}|${sid}`)));
        const anyMark = marks.some(m => m.class_assignment_id === ca && m.session_id === s.session_id);
        const done = studentIds.length ? studentIds.every(studentDone) : anyMark;
        if (done) completed.add(`${s.class_module_assignment_id}|${s.session_id}`);
      });

      return { caList, modules, sessions, completed };
    },
  });

  const handleLaunchCourse = (courseId: string, classAssignmentId: string) => {
    navigate(`/tenant/${tenantId}/officer/teaching/${courseId}?class_id=${classId}&class_name=${encodeURIComponent(className)}&assignment_id=${classAssignmentId}`);
  };

  const toggleLevel = (id: string) => setOpenLevels(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const caList = (data?.caList || []) as any[];
  const modules = data?.modules || [];
  const sessions = data?.sessions || [];
  const completed = data?.completed || new Set<string>();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Courses for {className}</h2>
        <p className="text-muted-foreground mt-1">See what's been covered and continue teaching where you left off</p>
      </div>

      {caList.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No courses assigned to this class yet</p>
            <p className="text-sm text-muted-foreground mt-2">Contact the system administrator to assign courses</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {caList.map(assignment => {
          const course = assignment.courses;
          const levels = modules
            .filter(m => m.class_assignment_id === assignment.id)
            .sort((a, b) => (a.unlock_order ?? a.course_modules?.display_order ?? 0) - (b.unlock_order ?? b.course_modules?.display_order ?? 0))
            .map(m => {
              const list = sessions
                .filter(s => s.class_module_assignment_id === m.id)
                .sort((a, b) => (a.unlock_order ?? 0) - (b.unlock_order ?? 0));
              const done = list.filter(s => completed.has(`${m.id}|${s.session_id}`)).length;
              return { m, list, done, finished: list.length > 0 && done === list.length };
            });
          const totalSessions = levels.reduce((s, l) => s + l.list.length, 0);
          const doneSessions = levels.reduce((s, l) => s + l.done, 0);
          const pct = totalSessions ? Math.round((doneSessions / totalSessions) * 100) : 0;
          const levelsDone = levels.filter(l => l.finished).length;
          const courseDone = totalSessions > 0 && doneSessions === totalSessions;
          const unlocked = levels.filter(l => l.m.is_unlocked).length;

          return (
            <Card key={assignment.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-4">
                  <ThumbnailImage
                    thumbnailPath={course.thumbnail_url}
                    alt={course.title}
                    className="w-16 h-16 rounded-lg object-cover shrink-0"
                    fallbackClassName="w-16 h-16 rounded-lg bg-muted flex items-center justify-center shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <CardTitle className="text-lg leading-tight truncate">{course.title}</CardTitle>
                        <CardDescription className="mt-1">{course.course_code}</CardDescription>
                      </div>
                      {courseDone ? (
                        <Badge className="shrink-0 gap-1 bg-primary text-primary-foreground"><Trophy className="h-3 w-3" />Completed</Badge>
                      ) : (
                        <Badge variant="secondary" className="shrink-0">{pct}%</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4">
                <div className="space-y-2 rounded-lg border bg-muted/40 p-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold">{pct}%</span>
                    <span className="text-xs text-muted-foreground">{doneSessions} / {totalSessions} sessions marked</span>
                  </div>
                  <Progress value={pct} className="h-2" />
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Badge variant="outline" className="gap-1"><CheckCircle2 className="h-3 w-3" />Levels done {levelsDone} / {levels.length}</Badge>
                    <Badge variant="outline" className="gap-1"><BookOpen className="h-3 w-3" />{unlocked} of {levels.length} unlocked</Badge>
                  </div>
                </div>

                <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                  {levels.map(({ m, list, done, finished }) => {
                    const open = openLevels.has(m.id);
                    const lpct = list.length ? Math.round((done / list.length) * 100) : 0;
                    return (
                      <Collapsible key={m.id} open={open} onOpenChange={() => toggleLevel(m.id)}>
                        <div className={cn('rounded-md border', !m.is_unlocked && 'bg-muted/50')}>
                          <CollapsibleTrigger className="flex w-full items-center gap-2 p-2 text-left">
                            {!m.is_unlocked ? <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
                              : finished ? <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                              : <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className={cn('truncate text-sm font-medium', !m.is_unlocked && 'text-muted-foreground')}>
                                  {m.course_modules?.title || 'Level'}
                                </span>
                                <span className="shrink-0 text-xs text-muted-foreground">{done}/{list.length}</span>
                              </div>
                              <Progress value={lpct} className="mt-1 h-1" />
                            </div>
                            <ChevronDown className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')} />
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="space-y-1 px-3 pb-2 pl-8">
                              {list.length === 0 && <p className="text-xs text-muted-foreground">No sessions allocated</p>}
                              {list.map(s => {
                                const sDone = completed.has(`${m.id}|${s.session_id}`);
                                return (
                                  <div key={s.id} className="flex items-center gap-2 text-xs">
                                    {sDone ? <CheckCircle2 className="h-3 w-3 shrink-0 text-primary" />
                                      : !s.is_unlocked ? <Lock className="h-3 w-3 shrink-0 text-muted-foreground" />
                                      : <Circle className="h-3 w-3 shrink-0 text-muted-foreground" />}
                                    <span className={cn('truncate', sDone ? 'text-foreground' : 'text-muted-foreground')}>
                                      {s.course_sessions?.title || 'Session'}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    );
                  })}
                </div>

                <Button className="mt-auto w-full" onClick={() => handleLaunchCourse(course.id, assignment.id)} disabled={unlocked === 0}>
                  <PlayCircle className="h-4 w-4 mr-2" />
                  {doneSessions > 0 ? 'Continue Teaching' : 'Start Teaching'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
