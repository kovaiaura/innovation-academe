import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Loader2, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useCourses } from '@/hooks/useCourses';
import { useAssignCourseToClass, UnlockMode } from '@/hooks/useClassCourseAssignments';
import { InstitutionClass } from '@/types/institution';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  classData: InstitutionClass;
  onDone?: () => void;
}

export function BulkAssignCoursesToClassDialog({ isOpen, onOpenChange, classData, onDone }: Props) {
  const { data: courses = [], isLoading: loadingCourses } = useCourses();
  const assignCourse = useAssignCourseToClass();

  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [levelLimit, setLevelLimit] = useState<string>('all'); // 'all' | number as string
  const [unlockMode, setUnlockMode] = useState<UnlockMode>('sequential');
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  const activeCourses = useMemo(
    () =>
      courses.filter(
        (c: any) =>
          c.status !== 'archived' &&
          (search.trim() === '' ||
            c.title?.toLowerCase().includes(search.toLowerCase()) ||
            c.course_code?.toLowerCase().includes(search.toLowerCase()))
      ),
    [courses, search]
  );

  const toggleCourse = (id: string) =>
    setSelectedCourseIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const selectAll = () => setSelectedCourseIds(activeCourses.map((c: any) => c.id));
  const clearAll = () => setSelectedCourseIds([]);

  const reset = () => {
    setSelectedCourseIds([]);
    setLevelLimit('all');
    setUnlockMode('sequential');
    setSearch('');
    setProgress(null);
  };

  const handleAssign = async () => {
    if (selectedCourseIds.length === 0) {
      toast.error('Select at least one course');
      return;
    }

    setBusy(true);
    setProgress({ done: 0, total: selectedCourseIds.length });
    let successCount = 0;
    let skipped: string[] = [];

    try {
      for (let i = 0; i < selectedCourseIds.length; i++) {
        const courseId = selectedCourseIds[i];
        const course = courses.find((c: any) => c.id === courseId);

        // Fetch modules + sessions for this course
        const [{ data: modules, error: modErr }, { data: sessions, error: sessErr }] = await Promise.all([
          supabase
            .from('course_modules')
            .select('id, title, display_order')
            .eq('course_id', courseId)
            .order('display_order'),
          supabase
            .from('course_sessions')
            .select('id, module_id, display_order')
            .eq('course_id', courseId)
            .order('display_order'),
        ]);

        if (modErr || sessErr) {
          skipped.push(course?.title || courseId);
          setProgress({ done: i + 1, total: selectedCourseIds.length });
          continue;
        }

        const allModules = modules || [];
        const limit = levelLimit === 'all' ? allModules.length : Math.min(parseInt(levelLimit), allModules.length);
        const modulesToAssign = allModules.slice(0, limit);

        if (modulesToAssign.length === 0) {
          skipped.push(course?.title || courseId);
          setProgress({ done: i + 1, total: selectedCourseIds.length });
          continue;
        }

        const unlockAll = unlockMode === 'unlock_all';

        const payloadModules = modulesToAssign.map((m: any, index: number) => {
          const modSessions = (sessions || []).filter((s: any) => s.module_id === m.id);
          return {
            moduleId: m.id,
            isUnlocked: unlockAll || index === 0,
            unlockOrder: index + 1,
            unlockMode: unlockAll ? ('unlock_all' as UnlockMode) : index === 0 ? ('manual' as UnlockMode) : unlockMode,
            sessions: modSessions.map((s: any, sIdx: number) => ({
              sessionId: s.id,
              isUnlocked: unlockAll || sIdx === 0,
              unlockOrder: sIdx + 1,
              unlockMode: unlockAll ? ('unlock_all' as UnlockMode) : sIdx === 0 ? ('manual' as UnlockMode) : unlockMode,
            })),
          };
        });

        try {
          await assignCourse.mutateAsync({
            classId: classData.id,
            courseId,
            institutionId: classData.institution_id,
            modules: payloadModules,
          });
          successCount++;
        } catch {
          skipped.push(course?.title || courseId);
        }
        setProgress({ done: i + 1, total: selectedCourseIds.length });
      }

      if (successCount > 0) {
        toast.success(
          `Assigned ${successCount} course${successCount !== 1 ? 's' : ''} to ${classData.class_name}${
            skipped.length > 0 ? ` (${skipped.length} skipped)` : ''
          }`
        );
      }
      if (skipped.length > 0 && successCount === 0) {
        toast.error(`Failed to assign: ${skipped.join(', ')}`);
      }

      reset();
      onOpenChange(false);
      onDone?.();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !busy && onOpenChange(v)}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Bulk Assign Courses to {classData.class_name}
          </DialogTitle>
          <DialogDescription>
            Select multiple courses, choose how many levels to assign, and set the unlock behavior. Existing
            assignments are preserved (only new levels/sessions are added).
          </DialogDescription>
        </DialogHeader>

        {/* Config row */}
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <Label className="text-sm mb-2 block">Assign levels up to</Label>
            <Select value={levelLimit} onValueChange={setLevelLimit} disabled={busy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All levels</SelectItem>
                {Array.from({ length: 15 }, (_, i) => i + 1).map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    Level 1 – {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Levels beyond a course's available count are automatically capped.
            </p>
          </div>
          <div>
            <Label className="text-sm mb-2 block">Unlock mode</Label>
            <Select value={unlockMode} onValueChange={(v) => setUnlockMode(v as UnlockMode)} disabled={busy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sequential">Auto Sequential (next unlocks on completion)</SelectItem>
                <SelectItem value="unlock_all">Unlock All (immediate access)</SelectItem>
                <SelectItem value="manual">Manual (only Level 1 unlocked)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Course picker */}
        <div className="mt-2">
          <div className="flex items-center justify-between mb-2 gap-2">
            <Input
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
              disabled={busy}
            />
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {selectedCourseIds.length} of {activeCourses.length} selected
              </span>
              <Button variant="outline" size="sm" onClick={selectAll} disabled={busy}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={clearAll} disabled={busy}>
                Clear
              </Button>
            </div>
          </div>

          {loadingCourses ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : activeCourses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-40" />
              No courses found
            </div>
          ) : (
            <ScrollArea className="h-[340px] border rounded-md">
              <div className="p-2 space-y-1">
                {activeCourses.map((c: any) => {
                  const checked = selectedCourseIds.includes(c.id);
                  return (
                    <label
                      key={c.id}
                      className={`flex items-start gap-3 p-2.5 rounded cursor-pointer hover:bg-muted transition-colors ${
                        checked ? 'bg-primary/5 border border-primary/30' : 'border border-transparent'
                      }`}
                    >
                      <Checkbox checked={checked} onCheckedChange={() => toggleCourse(c.id)} disabled={busy} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{c.title}</span>
                          {c.course_code && (
                            <Badge variant="outline" className="text-xs">
                              {c.course_code}
                            </Badge>
                          )}
                          {c.status && (
                            <Badge variant="secondary" className="text-xs capitalize">
                              {c.status}
                            </Badge>
                          )}
                        </div>
                        {c.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{c.description}</p>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>

        {progress && (
          <Card>
            <CardContent className="py-3">
              <div className="flex items-center gap-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Assigning courses… {progress.done} / {progress.total}
              </div>
            </CardContent>
          </Card>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={busy || selectedCourseIds.length === 0}>
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Assigning...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Assign {selectedCourseIds.length > 0 ? `${selectedCourseIds.length} ` : ''}Course
                {selectedCourseIds.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
