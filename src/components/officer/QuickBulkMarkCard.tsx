import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useSessionCompletion, issueCertificatesForClass } from '@/hooks/useSessionCompletion';
import { isNotApplicableTitle } from '@/utils/courseHelpers';

interface Props {
  classId: string;
  markDate: string;
  students: { id: string }[];
}

interface PlanItem {
  sessionId: string;
  classAssignmentId: string;
  courseId: string;
  moduleId: string;
  studentIds: string[];
}

async function chunkedIn<T>(table: string, select: string, col: string, ids: string[], extra?: (q: any) => any): Promise<T[]> {
  const out: T[] = [];
  for (let i = 0; i < ids.length; i += 50) {
    let q: any = (supabase.from(table as any) as any).select(select).in(col, ids.slice(i, i + 50));
    if (extra) q = extra(q);
    const { data, error } = await q;
    if (error) throw error;
    out.push(...((data || []) as T[]));
  }
  return out;
}

export function QuickBulkMarkCard({ classId, markDate, students }: Props) {
  const [tillLevel, setTillLevel] = useState<string>('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [preview, setPreview] = useState<{ items: PlanItem[]; courses: number; skipped: number } | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(0);
  const { markSessionComplete } = useSessionCompletion();
  const queryClient = useQueryClient();

  const { data: tree, isLoading } = useQuery({
    queryKey: ['quick-bulk-tree', classId],
    queryFn: async () => {
      const { data: cas, error } = await supabase
        .from('course_class_assignments')
        .select('id, course_id')
        .eq('class_id', classId);
      if (error) throw error;
      const caIds = (cas || []).map(c => c.id);
      if (!caIds.length) return [];
      const mods = await chunkedIn<any>('class_module_assignments',
        'id, class_assignment_id, module_id, unlock_order, course_modules (title, display_order)',
        'class_assignment_id', caIds);
      const sess = await chunkedIn<any>('class_session_assignments',
        'id, class_module_assignment_id, session_id, unlock_order',
        'class_module_assignment_id', mods.map(m => m.id));
      return (cas || []).map(ca => ({
        ...ca,
        levels: mods
          .filter(m => m.class_assignment_id === ca.id && !isNotApplicableTitle(m.course_modules?.title))
          .sort((a, b) => (a.unlock_order ?? a.course_modules?.display_order ?? 0) - (b.unlock_order ?? b.course_modules?.display_order ?? 0))
          .map(m => ({ ...m, sessions: sess.filter(s => s.class_module_assignment_id === m.id) })),
      }));
    },
  });

  const maxLevels = useMemo(() => Math.max(0, ...(tree || []).map(c => c.levels.length)), [tree]);

  const prepare = async () => {
    if (!tree || !tillLevel) return;
    if (!students.length) { toast.error('No active students in this class'); return; }
    setPreparing(true);
    try {
      const n = Number(tillLevel);
      const candidates: Omit<PlanItem, 'studentIds'>[] = [];
      const courses = new Set<string>();
      tree.forEach(ca => ca.levels.slice(0, n).forEach((lvl: any) => lvl.sessions.forEach((s: any) => {
        courses.add(ca.id);
        candidates.push({ sessionId: s.session_id, classAssignmentId: ca.id, courseId: ca.course_id, moduleId: lvl.module_id });
      })));
      // Read every existing mark for this class page by page (the database
      // returns at most 1000 rows per request).
      const existing: { session_id: string; student_id: string; class_assignment_id: string }[] = [];
      const caIds = tree.map(ca => ca.id);
      for (let i = 0; i < caIds.length; i += 50) {
        for (let from = 0; ; from += 1000) {
          const { data, error } = await supabase
            .from('class_session_completions')
            .select('id, session_id, student_id, class_assignment_id')
            .in('class_assignment_id', caIds.slice(i, i + 50))
            .order('id')
            .range(from, from + 999);
          if (error) throw error;
          existing.push(...((data || []) as any[]));
          if (!data || data.length < 1000) break;
        }
      }
      const done = new Map<string, Set<string>>();
      existing.forEach(r => {
        const k = `${r.class_assignment_id}|${r.session_id}`;
        if (!done.has(k)) done.set(k, new Set());
        done.get(k)!.add(r.student_id);
      });
      let skipped = 0;
      const items: PlanItem[] = [];
      candidates.forEach(c => {
        const have = done.get(`${c.classAssignmentId}|${c.sessionId}`);
        const ids = students.map(s => s.id).filter(id => !have?.has(id));
        if (ids.length) items.push({ ...c, studentIds: ids }); else skipped++;
      });
      setPreview({ items, courses: courses.size, skipped });
      setConfirmOpen(true);
    } catch (e) {
      console.error(e);
      toast.error('Could not prepare quick marking');
    } finally {
      setPreparing(false);
    }
  };

  const run = async () => {
    if (!preview) return;
    setConfirmOpen(false);
    setRunning(true);
    setDone(0);
    let ok = 0;
    for (const it of preview.items) {
      const success = await markSessionComplete(it.sessionId, it.studentIds, it.classAssignmentId, classId,
        undefined, it.moduleId, it.courseId, { silent: true, date: markDate, skipCertificates: true });
      if (success) ok++;
      setDone(d => d + 1);
    }
    if (ok > 0) await issueCertificatesForClass(classId, students.map(s => s.id));
    setRunning(false);
    queryClient.invalidateQueries();
    if (ok === preview.items.length) toast.success(`${ok} sessions marked complete till Level ${tillLevel}`);
    else toast.warning(`${ok} of ${preview.items.length} sessions marked complete`);
    setPreview(null);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2"><Zap className="h-4 w-4" />Quick bulk marking</CardTitle>
        <CardDescription>Mark every assigned course complete up to a level for all students in this class.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select value={tillLevel} onValueChange={setTillLevel} disabled={isLoading || running || maxLevels === 0}>
            <SelectTrigger className="sm:w-60">
              <SelectValue placeholder={isLoading ? 'Loading levels...' : maxLevels === 0 ? 'No levels assigned' : 'Mark till level...'} />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: maxLevels }, (_, i) => (
                <SelectItem key={i + 1} value={String(i + 1)}>Till Level {i + 1}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={prepare} disabled={!tillLevel || preparing || running}>
            {preparing || running ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Zap className="h-4 w-4 mr-2" />}
            Quick mark complete
          </Button>
        </div>
        {running && preview && (
          <div className="space-y-1">
            <div className="flex justify-between text-sm"><span>Marking sessions...</span><span>{done} / {preview.items.length}</span></div>
            <Progress value={preview.items.length ? (done / preview.items.length) * 100 : 0} />
          </div>
        )}
      </CardContent>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark complete till Level {tillLevel}?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-1">
                <p>Courses affected: {preview?.courses ?? 0}</p>
                <p>Sessions to mark: {preview?.items.length ?? 0}</p>
                <p>Already marked (skipped): {preview?.skipped ?? 0}</p>
                <p>Students: {students.length} · Date: {markDate}</p>
                {preview && preview.items.length === 0 && (
                  <p className="pt-2 font-medium text-foreground">Everything till Level {tillLevel} is already marked.</p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={run} disabled={!preview?.items.length}>Mark complete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
