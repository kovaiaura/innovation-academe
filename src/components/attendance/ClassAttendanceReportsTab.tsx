import { useState, useMemo } from 'react';
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addWeeks,
  addMonths,
  subWeeks,
  subMonths,
} from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Users,
  Clock,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Props {
  institutionId?: string;
  institutionName?: string;
}

type RangeMode = 'weekly' | 'monthly';

interface Row {
  id: string;
  date: string;
  class_id: string;
  class_name: string;
  officer_id: string | null;
  officer_name: string;
  period_label: string | null;
  period_time: string | null;
  subject: string | null;
  total_students: number;
  students_present: number;
  students_late: number;
  students_absent: number;
  is_session_completed: boolean;
  notes: string | null;
}

const parseDurationMinutes = (periodTime: string | null): number => {
  if (!periodTime) return 0;
  const m = periodTime.match(/(\d{1,2}):(\d{2}).*?(\d{1,2}):(\d{2})/);
  if (!m) return 0;
  const start = parseInt(m[1]) * 60 + parseInt(m[2]);
  const end = parseInt(m[3]) * 60 + parseInt(m[4]);
  return Math.max(0, end - start);
};

const formatHrs = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
};

export function ClassAttendanceReportsTab({ institutionId, institutionName }: Props) {
  const [mode, setMode] = useState<RangeMode>('weekly');
  const [anchor, setAnchor] = useState<Date>(new Date());
  const [classFilter, setClassFilter] = useState<string>('all');
  const [officerFilter, setOfficerFilter] = useState<string>('all');

  const { start, end, label } = useMemo(() => {
    if (mode === 'weekly') {
      const s = startOfWeek(anchor, { weekStartsOn: 1 });
      const e = endOfWeek(anchor, { weekStartsOn: 1 });
      return {
        start: s,
        end: e,
        label: `${format(s, 'MMM d')} – ${format(e, 'MMM d, yyyy')}`,
      };
    }
    const s = startOfMonth(anchor);
    const e = endOfMonth(anchor);
    return { start: s, end: e, label: format(anchor, 'MMMM yyyy') };
  }, [mode, anchor]);

  const startStr = format(start, 'yyyy-MM-dd');
  const endStr = format(end, 'yyyy-MM-dd');

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['mgmt-attn-report', institutionId, startStr, endStr],
    queryFn: async (): Promise<Row[]> => {
      if (!institutionId) return [];
      const { data, error } = await supabase
        .from('class_session_attendance')
        .select(
          `id, date, class_id, officer_id, period_label, period_time, subject,
           total_students, students_present, students_late, students_absent,
           is_session_completed, notes,
           classes:class_id (class_name),
           officers:officer_id (full_name)`
        )
        .eq('institution_id', institutionId)
        .gte('date', startStr)
        .lte('date', endStr)
        .order('date', { ascending: true });
      if (error) throw error;
      return (data || []).map((r: any) => ({
        id: r.id,
        date: r.date,
        class_id: r.class_id,
        class_name: r.classes?.class_name || 'Unknown',
        officer_id: r.officer_id,
        officer_name: r.officers?.full_name || 'Unassigned',
        period_label: r.period_label,
        period_time: r.period_time,
        subject: r.subject,
        total_students: r.total_students || 0,
        students_present: r.students_present || 0,
        students_late: r.students_late || 0,
        students_absent: r.students_absent || 0,
        is_session_completed: !!r.is_session_completed,
        notes: r.notes || null,
      }));
    },
    enabled: !!institutionId,
  });

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          (classFilter === 'all' || r.class_id === classFilter) &&
          (officerFilter === 'all' || r.officer_id === officerFilter)
      ),
    [rows, classFilter, officerFilter]
  );

  const summary = useMemo(() => {
    const totalPeriods = filtered.length;
    const totalMinutes = filtered.reduce(
      (s, r) => s + parseDurationMinutes(r.period_time),
      0
    );
    const totalStudents = filtered.reduce((s, r) => s + r.total_students, 0);
    const totalPresent = filtered.reduce(
      (s, r) => s + r.students_present + r.students_late,
      0
    );
    const completed = filtered.filter((r) => r.is_session_completed).length;
    const uniqueClasses = new Set(filtered.map((r) => r.class_id)).size;
    const uniqueOfficers = new Set(filtered.map((r) => r.officer_id).filter(Boolean)).size;
    const avgAttendance =
      totalStudents > 0 ? (totalPresent / totalStudents) * 100 : 0;
    return {
      totalPeriods,
      totalMinutes,
      avgAttendance,
      completed,
      uniqueClasses,
      uniqueOfficers,
    };
  }, [filtered]);

  // Set of known officer names in this dataset — used to filter accidental
  // "officer name as subject" entries out of Topics Covered.
  const officerNameSet = useMemo(() => {
    const s = new Set<string>();
    rows.forEach((r) => {
      if (r.officer_name) s.add(r.officer_name.trim().toLowerCase());
    });
    return s;
  }, [rows]);

  const isValidTopic = (subject: string | null, officerName?: string | null) => {
    if (!subject) return false;
    const t = subject.trim();
    if (!t) return false;
    const low = t.toLowerCase();
    if (officerName && low === officerName.trim().toLowerCase()) return false;
    if (officerNameSet.has(low)) return false;
    return true;
  };

  // Extracts the topic string to aggregate for a row: prefer the remark
  // when present, else the subject only if it is a real topic (not an
  // officer name) AND the session is marked completed.
  const topicFor = (r: Row): string | null => {
    const note = (r.notes || '').trim();
    if (note) return `Remark: ${note}`;
    if (r.is_session_completed && isValidTopic(r.subject, r.officer_name)) {
      return r.subject!.trim();
    }
    return null;
  };

  const logRows = useMemo(
    () =>
      [...filtered].sort(
        (a, b) =>
          a.date.localeCompare(b.date) ||
          (a.period_label || '').localeCompare(b.period_label || '') ||
          a.class_name.localeCompare(b.class_name)
      ),
    [filtered]
  );


  const classOptions = useMemo(() => {
    const m = new Map<string, string>();
    rows.forEach((r) => m.set(r.class_id, r.class_name));
    return Array.from(m.entries());
  }, [rows]);

  const officerOptions = useMemo(() => {
    const m = new Map<string, string>();
    rows.forEach((r) => r.officer_id && m.set(r.officer_id, r.officer_name));
    return Array.from(m.entries());
  }, [rows]);

  const shift = (dir: 1 | -1) => {
    setAnchor((a) =>
      mode === 'weekly'
        ? dir === 1
          ? addWeeks(a, 1)
          : subWeeks(a, 1)
        : dir === 1
        ? addMonths(a, 1)
        : subMonths(a, 1)
    );
  };

  const handleExportCSV = () => {
    const header = [
      'Date',
      'Class',
      'Officer',
      'Period',
      'Time',
      'Subject',
      'Total',
      'Present',
      'Late',
      'Absent',
      'Completed',
      'Remark',
    ];
    const rowsCsv = filtered.map((r) => [
      r.date,
      r.class_name,
      r.officer_name,
      r.period_label || '',
      r.period_time || '',
      isValidTopic(r.subject, r.officer_name) ? r.subject : '',
      r.total_students,
      r.students_present,
      r.students_late,
      r.students_absent,
      r.is_session_completed ? 'Yes' : 'No',
      (r.notes || '').replace(/[\n,]/g, ' '),
    ]);
    const csv = [header, ...rowsCsv].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${mode}_${startStr}_to_${endStr}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    const title = `${mode === 'weekly' ? 'Weekly' : 'Monthly'} Attendance Report`;
    doc.setFontSize(16);
    doc.text(title, 14, 15);
    doc.setFontSize(10);
    doc.text(institutionName || 'Institution', 14, 22);
    doc.text(label, 14, 28);
    doc.text(`Generated: ${format(new Date(), 'PPpp')}`, 14, 34);

    // Summary
    autoTable(doc, {
      startY: 40,
      head: [['Total Periods', 'Total Hours', 'Avg Attendance', 'Sessions Completed', 'Classes', 'Officers']],
      body: [[
        summary.totalPeriods,
        formatHrs(summary.totalMinutes),
        `${summary.avgAttendance.toFixed(1)}%`,
        summary.completed,
        summary.uniqueClasses,
        summary.uniqueOfficers,
      ]],
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59] },
    });

    // Per Officer
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 8,
      head: [['Officer', 'Periods', 'Hours', 'Classes', 'Avg Attendance', 'Completed', 'Topics Covered']],
      body: perOfficer.map((o) => [
        o.name,
        o.periods,
        formatHrs(o.minutes),
        o.classes.size,
        o.total > 0 ? `${((o.present / o.total) * 100).toFixed(1)}%` : '-',
        o.completed,
        Array.from(o.topics).join(', ') || '-',
      ]),
      theme: 'striped',
      headStyles: { fillColor: [30, 41, 59] },
      columnStyles: { 6: { cellWidth: 70 } },
    });

    // Per Class
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 8,
      head: [['Class', 'Periods', 'Hours', 'Officers', 'Avg Attendance', 'Topics Covered']],
      body: perClass.map((c) => [
        c.name,
        c.periods,
        formatHrs(c.minutes),
        Array.from(c.officers).join(', ') || '-',
        c.total > 0 ? `${((c.present / c.total) * 100).toFixed(1)}%` : '-',
        Array.from(c.topics).join(', ') || '-',
      ]),
      theme: 'striped',
      headStyles: { fillColor: [30, 41, 59] },
      columnStyles: { 5: { cellWidth: 70 } },
    });

    // Per Day
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 8,
      head: [['Date', 'Periods', 'Hours', 'Attendance', 'Completed', 'Topics Covered']],
      body: perDay.map((d) => [
        format(new Date(d.date), 'EEE, MMM d'),
        d.periods,
        formatHrs(d.minutes),
        d.total > 0 ? `${((d.present / d.total) * 100).toFixed(1)}%` : '-',
        d.completed,
        Array.from(d.topics).join(', ') || '-',
      ]),
      theme: 'striped',
      headStyles: { fillColor: [30, 41, 59] },
      columnStyles: { 5: { cellWidth: 80 } },
    });

    // Remarks
    if (remarks.length > 0) {
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 8,
        head: [['Date', 'Class', 'Officer', 'Remark']],
        body: remarks.map((r) => [
          format(new Date(r.date), 'MMM d'),
          r.class_name,
          r.officer_name,
          r.notes || '',
        ]),
        theme: 'striped',
        headStyles: { fillColor: [180, 83, 9] },
        columnStyles: { 3: { cellWidth: 120 } },
      });
    }

    doc.save(`attendance_${mode}_${startStr}_to_${endStr}.pdf`);
    toast.success('PDF exported');
  };

  return (
    <div className="space-y-6">
      {/* Range controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <div className="flex items-center gap-3 flex-wrap">
              <Tabs value={mode} onValueChange={(v) => setMode(v as RangeMode)}>
                <TabsList>
                  <TabsTrigger value="weekly">Weekly</TabsTrigger>
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" onClick={() => shift(-1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="px-3 py-1.5 text-sm font-medium min-w-[180px] text-center bg-muted rounded">
                  {label}
                </div>
                <Button variant="outline" size="icon" onClick={() => shift(1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All classes</SelectItem>
                  {classOptions.map(([id, name]) => (
                    <SelectItem key={id} value={id}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={officerFilter} onValueChange={setOfficerFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All officers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All officers</SelectItem>
                  {officerOptions.map(([id, name]) => (
                    <SelectItem key={id} value={id}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleExportCSV} disabled={filtered.length === 0} className="gap-2">
                <Download className="h-4 w-4" /> CSV
              </Button>
              <Button onClick={handleExportPDF} disabled={filtered.length === 0} className="gap-2">
                <FileText className="h-4 w-4" /> Export PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            <SummaryCard icon={<BookOpen className="h-5 w-5" />} label="Total Periods" value={summary.totalPeriods} />
            <SummaryCard icon={<Clock className="h-5 w-5" />} label="Total Hours" value={formatHrs(summary.totalMinutes)} />
            <SummaryCard icon={<Users className="h-5 w-5" />} label="Avg Attendance" value={`${summary.avgAttendance.toFixed(1)}%`} />
            <SummaryCard icon={<CheckCircle2 className="h-5 w-5" />} label="Completed" value={summary.completed} />
            <SummaryCard icon={<BookOpen className="h-5 w-5" />} label="Classes" value={summary.uniqueClasses} />
            <SummaryCard icon={<Users className="h-5 w-5" />} label="Officers" value={summary.uniqueOfficers} />
          </div>

          {/* Detailed log */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {mode === 'weekly' ? 'Weekly' : 'Monthly'} Attendance Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Day</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Trainer</TableHead>
                    <TableHead className="text-right">Attendance</TableHead>
                    <TableHead>Topic / Remark</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logRows.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-6">No data</TableCell></TableRow>
                  ) : logRows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{format(new Date(r.date), 'dd MMM yyyy')}</TableCell>
                      <TableCell>{format(new Date(r.date), 'EEE')}</TableCell>
                      <TableCell className="text-sm">
                        {r.period_label || '-'}
                        {r.period_time ? <span className="text-muted-foreground"> ({r.period_time})</span> : null}
                      </TableCell>
                      <TableCell className="font-medium">{r.class_name}</TableCell>
                      <TableCell className="text-sm">{r.officer_name}</TableCell>
                      <TableCell className="text-right">
                        {r.students_present + r.students_late}/{r.total_students}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[320px]">
                        {topicFor(r) || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

        </>
      )}
    </div>
  );
}

function SummaryCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className="text-muted-foreground/50">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}
