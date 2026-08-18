import { useState, useMemo } from 'react';
import { format, getDay } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Calendar, CheckCircle2, Download, Clock, CalendarIcon, Pencil } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useSaveClassAttendance } from '@/hooks/useClassSessionAttendance';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';


interface ClassSessionAttendanceTabProps {
  institutionId?: string;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function ClassSessionAttendanceTab({ institutionId }: ClassSessionAttendanceTabProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const { user } = useAuth();
  const saveMutation = useSaveClassAttendance();


  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const dayOfWeek = DAY_NAMES[getDay(selectedDate)];

  // Fetch classes for filter
  const { data: classes = [] } = useQuery({
    queryKey: ['institution-classes', institutionId],
    queryFn: async () => {
      if (!institutionId) return [];
      const { data, error } = await supabase
        .from('classes')
        .select('id, class_name')
        .eq('institution_id', institutionId)
        .eq('status', 'active')
        .order('display_order');
      if (error) throw error;
      return data || [];
    },
    enabled: !!institutionId,
  });

  // Fetch timetable assignments for the selected day
  const { data: timetableAssignments = [], isLoading: loadingTimetable } = useQuery({
    queryKey: ['timetable-assignments', institutionId, dayOfWeek],
    queryFn: async () => {
      if (!institutionId) return [];
      const { data, error } = await supabase
        .from('institution_timetable_assignments')
        .select('*')
        .eq('institution_id', institutionId)
        .eq('day', dayOfWeek);
      if (error) throw error;
      return data || [];
    },
    enabled: !!institutionId,
  });

  // Fetch periods for time info
  const { data: periods = [] } = useQuery({
    queryKey: ['institution-periods', institutionId],
    queryFn: async () => {
      if (!institutionId) return [];
      const { data, error } = await supabase
        .from('institution_periods')
        .select('*')
        .eq('institution_id', institutionId)
        .eq('is_break', false)
        .order('display_order');
      if (error) throw error;
      return data || [];
    },
    enabled: !!institutionId,
  });

  // Fetch class_session_attendance records for the selected date
  const { data: sessionRecords = [], isLoading: loadingSessions } = useQuery({
    queryKey: ['class-session-attendance', institutionId, dateStr],
    queryFn: async () => {
      if (!institutionId) return [];
      const { data, error } = await supabase
        .from('class_session_attendance')
        .select('*')
        .eq('institution_id', institutionId)
        .eq('date', dateStr);
      if (error) throw error;
      return data || [];
    },
    enabled: !!institutionId,
  });

  // Fetch officer names for display
  const { data: officers = [] } = useQuery({
    queryKey: ['institution-officers-names', institutionId],
    queryFn: async () => {
      if (!institutionId) return [];
      const { data, error } = await supabase
        .from('officers')
        .select('id, full_name')
        .contains('assigned_institutions', [institutionId])
        .eq('status', 'active');
      if (error) throw error;
      return data || [];
    },
    enabled: !!institutionId,
  });

  const officerMap = useMemo(() => {
    const map: Record<string, string> = {};
    officers.forEach(o => { map[o.id] = o.full_name; });
    return map;
  }, [officers]);

  // Resolve titles of the curriculum sessions covered on this date
  const coveredIds = useMemo(() => {
    const set = new Set<string>();
    sessionRecords.forEach((s: any) => {
      (Array.isArray(s.covered_session_ids) ? s.covered_session_ids : []).forEach((id: string) => set.add(id));
    });
    return Array.from(set);
  }, [sessionRecords]);

  const { data: sessionTitleMap = {} } = useQuery({
    queryKey: ['covered-session-titles', coveredIds.join(',')],
    queryFn: async (): Promise<Record<string, string>> => {
      if (coveredIds.length === 0) return {};
      const { data, error } = await supabase
        .from('course_sessions')
        .select('id, title, course_modules(title)')
        .in('id', coveredIds);
      if (error) throw error;
      const map: Record<string, string> = {};
      (data || []).forEach((s: any) => {
        map[s.id] = s.course_modules?.title ? `${s.course_modules.title} · ${s.title}` : s.title;
      });
      return map;
    },
    enabled: coveredIds.length > 0,
  });

  const periodMap = useMemo(() => {
    const map: Record<string, { label: string; start_time: string; end_time: string; display_order: number }> = {};
    periods.forEach(p => { map[p.id] = { label: p.label, start_time: p.start_time, end_time: p.end_time, display_order: p.display_order }; });
    return map;
  }, [periods]);


  // Merge timetable with session records
  const mergedData = useMemo(() => {
    let assignments = timetableAssignments;

    // Apply class filter
    if (selectedClassFilter !== 'all') {
      assignments = assignments.filter(a => a.class_id === selectedClassFilter);
    }

    return assignments
      .map(assignment => {
        const period = periodMap[assignment.period_id];
        // Find matching session record
        const session = sessionRecords.find(
          s => s.timetable_assignment_id === assignment.id
        );

        const scheduledOfficerName =
          assignment.teacher_name ||
          (assignment.teacher_id ? officerMap[assignment.teacher_id] : null) ||
          '-';
        const rawSubject = session?.subject || null;
        // Ignore subject if it accidentally matches the officer name
        const isOfficerNameSubject =
          !!rawSubject &&
          rawSubject.trim().toLowerCase() === scheduledOfficerName.trim().toLowerCase();
        return {
          id: assignment.id,
          sessionId: session?.id || null,
          periodLabel: period?.label || '-',
          periodTime: period ? `${period.start_time} - ${period.end_time}` : '-',
          displayOrder: period?.display_order ?? 999,
          className: assignment.class_name,
          classId: assignment.class_id,
          teacherId: assignment.teacher_id || null,
          scheduledOfficer: scheduledOfficerName,
          isCompleted: session?.is_session_completed ?? false,
          studentsPresent: session?.students_present ?? null,
          totalStudents: session?.total_students ?? null,
          subject: isOfficerNameSubject ? null : rawSubject,
          notes: session?.notes || null,
          completedBy: session?.completed_by ? officerMap[session.completed_by] : null,
          completedById: session?.completed_by || null,
          attendanceRecords: (session?.attendance_records as any) || [],
          periodId: assignment.period_id,
          coveredTitles: (Array.isArray((session as any)?.covered_session_ids)
            ? ((session as any).covered_session_ids as string[])
            : []
          )
            .map((id) => sessionTitleMap[id])
            .filter(Boolean) as string[],
        };

      })
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }, [timetableAssignments, sessionRecords, periodMap, officerMap, selectedClassFilter, sessionTitleMap]);


  const completedCount = mergedData.filter(d => d.isCompleted).length;
  const pendingCount = mergedData.filter(d => !d.isCompleted).length;

  const isLoading = loadingTimetable || loadingSessions;

  const canEditRemarks = !!user && ['management', 'system_admin', 'super_admin', 'officer'].includes(user.role);

  const openEditor = (row: typeof mergedData[number]) => {
    setEditingRowId(row.id);
    setEditValue(row.notes || '');
  };

  const handleSaveRemark = async (row: typeof mergedData[number]) => {
    if (!institutionId || !user) return;
    try {
      await saveMutation.mutateAsync({
        timetable_assignment_id: row.id,
        class_id: row.classId,
        institution_id: institutionId,
        officer_id: row.completedById || row.teacherId || user.id,
        date: dateStr,
        period_label: row.periodLabel,
        period_time: row.periodTime,
        subject: row.subject || undefined,
        attendance_records: row.attendanceRecords || [],
        notes: editValue.trim(),
      });
      toast.success('Remark saved');
      setEditingRowId(null);
      setEditValue('');
    } catch (e: any) {
      console.error('Failed to save remark', e);
      toast.error(e?.message || 'Failed to save remark');
    }
  };


  const handleExportCSV = () => {
    if (mergedData.length === 0) return;
    const csvContent = [
      ['Period', 'Time', 'Class', 'Scheduled Officer', 'Status', 'Students Present', 'Total Students', 'Course/Session Covered', 'Remark'],
      ...mergedData.map(row => {
        const allAbsent = row.isCompleted && row.studentsPresent === 0;
        const covered = row.coveredTitles.length > 0
          ? row.coveredTitles.join('; ')
          : allAbsent && row.notes
            ? `Remark: ${row.notes}`
            : (row.subject || '-');

        return [
          row.periodLabel,
          row.periodTime,
          row.className,
          row.scheduledOfficer,
          row.isCompleted ? 'Completed' : 'Pending',
          row.studentsPresent ?? '-',
          row.totalStudents ?? '-',
          `"${covered.replace(/"/g, '""')}"`,
          `"${(row.notes || '').replace(/"/g, '""')}"`,
        ];
      })
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `class_sessions_${dateStr}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (!institutionId) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No institution selected
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Class Sessions — {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </CardTitle>
            <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={mergedData.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 flex-wrap">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[220px] justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, 'PPP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={(d) => d && setSelectedDate(d)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>

            <Select value={selectedClassFilter} onValueChange={setSelectedClassFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map(cls => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.class_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Total Scheduled</p>
            <p className="text-2xl font-bold">{mergedData.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold text-green-600">{completedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Scheduled Periods</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : mergedData.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No scheduled periods for {dayOfWeek}</p>
              <p className="text-sm mt-1">Check the timetable configuration or select a different date.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Scheduled Officer</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Students</TableHead>
                  <TableHead>Course / Session Covered</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mergedData.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.periodLabel}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {row.periodTime}
                      </div>
                    </TableCell>
                    <TableCell>{row.className}</TableCell>
                    <TableCell>{row.completedBy || row.scheduledOfficer}</TableCell>
                    <TableCell className="text-center">
                      {row.isCompleted ? (
                        <Badge className="bg-green-500">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {row.isCompleted && row.studentsPresent !== null ? (
                        <span className="font-medium">
                          {row.studentsPresent} / {row.totalStudents}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const hasCovered = row.coveredTitles.length > 0;
                        const hasSubject = !!row.subject;
                        const hasNote = !!row.notes;
                        const allAbsent = row.isCompleted && row.studentsPresent === 0;


                        const editButton = canEditRemarks ? (
                          <Popover
                            open={editingRowId === row.id}
                            onOpenChange={(open) => {
                              if (open) openEditor(row);
                              else {
                                setEditingRowId(null);
                                setEditValue('');
                              }
                            }}
                          >
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                                <Pencil className="h-3 w-3 mr-1" />
                                {hasNote ? 'Edit remark' : 'Add topic / remark'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80" align="start">
                              <div className="space-y-2">
                                <p className="text-sm font-medium">Add remark / topic covered</p>
                                <Textarea
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  placeholder="e.g. Topic covered, exam held, class cancelled..."
                                  rows={3}
                                />
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setEditingRowId(null);
                                      setEditValue('');
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    size="sm"
                                    disabled={saveMutation.isPending || !editValue.trim()}
                                    onClick={() => handleSaveRemark(row)}
                                  >
                                    Save
                                  </Button>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        ) : null;

                        if (hasCovered) {
                          return (
                            <div className="space-y-1">
                              <div className="flex flex-wrap gap-1">
                                {row.coveredTitles.map((t) => (
                                  <Badge key={t} variant="secondary" className="text-xs font-normal">
                                    {t}
                                  </Badge>
                                ))}
                              </div>
                              {hasNote && (
                                <div className="text-xs text-muted-foreground italic">Remark: {row.notes}</div>
                              )}
                              {editButton}
                            </div>
                          );
                        }

                        if (allAbsent && hasNote) {

                          return (
                            <div className="space-y-1">
                              <div className="text-sm">
                                <span className="text-amber-700 dark:text-amber-400 font-medium">Remark:</span>{' '}
                                <span className="italic">{row.notes}</span>
                              </div>
                              {editButton}
                            </div>
                          );
                        }
                        if (hasSubject) {
                          return (
                            <div className="space-y-0.5">
                              <div className="text-sm">{row.subject}</div>
                              {hasNote && (
                                <div className="text-xs text-muted-foreground italic">Remark: {row.notes}</div>
                              )}
                              {editButton}
                            </div>
                          );
                        }
                        if (hasNote) {
                          return (
                            <div className="space-y-1">
                              <div className="text-sm italic text-amber-700 dark:text-amber-400">
                                Remark: {row.notes}
                              </div>
                              {editButton}
                            </div>
                          );
                        }
                        return (
                          <div className="space-y-1">
                            <span className="text-muted-foreground text-sm">-</span>
                            {editButton && <div>{editButton}</div>}
                          </div>
                        );
                      })()}
                    </TableCell>

                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
