import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Download, Eye, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend } from 'date-fns';

interface StudentAttendanceTabProps {
  institutionId?: string;
}

interface StudentAttendanceRecord {
  student_id: string;
  student_name: string;
  roll_number: string;
  classes_attended: number;
  total_classes: number;
  attendance_percentage: number;
}

export const StudentAttendanceTab = ({ institutionId }: StudentAttendanceTabProps) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch classes for this institution
  const { data: classes = [], isLoading: isLoadingClasses } = useQuery({
    queryKey: ['institution-classes', institutionId],
    queryFn: async () => {
      if (!institutionId) return [];
      
      const { data, error } = await supabase
        .from('classes')
        .select('id, class_name, section')
        .eq('institution_id', institutionId)
        .eq('status', 'active')
        .order('display_order');

      if (error) throw error;
      return data || [];
    },
    enabled: !!institutionId,
  });

  // Auto-select first class when classes load
  const effectiveClassId = selectedClass || classes[0]?.id || '';

  // Fetch students for selected class
  const { data: students = [], isLoading: isLoadingStudents } = useQuery({
    queryKey: ['class-students', effectiveClassId],
    queryFn: async () => {
      if (!effectiveClassId) return [];
      
      const { data, error } = await supabase
        .from('students')
        .select('id, student_id, student_name, roll_number')
        .eq('class_id', effectiveClassId)
        .eq('status', 'active')
        .order('roll_number');

      if (error) throw error;
      return data || [];
    },
    enabled: !!effectiveClassId,
  });

  // Fetch class session attendance for this class and month
  const { data: sessionAttendance = [], isLoading: isLoadingAttendance } = useQuery({
    queryKey: ['class-session-attendance', effectiveClassId, selectedMonth],
    queryFn: async () => {
      if (!effectiveClassId || !selectedMonth) return [];
      
      const monthStart = startOfMonth(new Date(selectedMonth + '-01'));
      const monthEnd = endOfMonth(monthStart);
      
      const { data, error } = await supabase
        .from('class_session_attendance')
        .select('id, date, attendance_records, is_session_completed')
        .eq('class_id', effectiveClassId)
        .gte('date', format(monthStart, 'yyyy-MM-dd'))
        .lte('date', format(monthEnd, 'yyyy-MM-dd'))
        .eq('is_session_completed', true);

      if (error) throw error;
      return data || [];
    },
    enabled: !!effectiveClassId && !!selectedMonth,
  });

  // Calculate attendance stats for each student
  const attendanceData: StudentAttendanceRecord[] = students.map(student => {
    let classesAttended = 0;
    const totalClasses = sessionAttendance.length;

    sessionAttendance.forEach(session => {
      const records = session.attendance_records as any[] || [];
      const studentRecord = records.find((r: any) => r.student_id === student.id);
      if (studentRecord && studentRecord.status === 'present') {
        classesAttended++;
      }
    });

    const attendancePercentage = totalClasses > 0 
      ? (classesAttended / totalClasses) * 100 
      : 0;

    return {
      student_id: student.id,
      student_name: student.student_name,
      roll_number: student.roll_number || student.student_id,
      classes_attended: classesAttended,
      total_classes: totalClasses,
      attendance_percentage: attendancePercentage,
    };
  });

  // Filter by search query
  const filteredData = attendanceData.filter(record =>
    record.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.roll_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate stats
  const stats = {
    totalStudents: filteredData.length,
    avgAttendance: filteredData.length > 0 
      ? filteredData.reduce((sum, r) => sum + r.attendance_percentage, 0) / filteredData.length 
      : 0,
    belowThreshold: filteredData.filter(r => r.attendance_percentage < 75).length,
    totalClasses: sessionAttendance.length,
  };

  // Handle export
  const handleExport = () => {
    const csvContent = [
      ['Student Name', 'Roll Number', 'Classes Attended', 'Total Classes', 'Attendance %'],
      ...filteredData.map(r => [
        r.student_name,
        r.roll_number,
        r.classes_attended.toString(),
        r.total_classes.toString(),
        r.attendance_percentage.toFixed(1) + '%'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student-attendance-${selectedMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Get badge color for attendance percentage
  const getAttendanceBadge = (percentage: number) => {
    if (percentage >= 90) return { variant: 'default' as const, color: 'text-green-600 dark:text-green-400' };
    if (percentage >= 75) return { variant: 'secondary' as const, color: 'text-yellow-600 dark:text-yellow-400' };
    return { variant: 'destructive' as const, color: 'text-red-600 dark:text-red-400' };
  };

  // Generate month options (last 6 months)
  const monthOptions = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return {
      value: format(date, 'yyyy-MM'),
      label: format(date, 'MMMM yyyy'),
    };
  });

  const isLoading = isLoadingClasses || isLoadingStudents || isLoadingAttendance;

  if (!institutionId) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No institution selected</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters Row */}
      <div className="flex flex-wrap gap-4">
        <Select 
          value={effectiveClassId} 
          onValueChange={setSelectedClass}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select Class" />
          </SelectTrigger>
          <SelectContent>
            {classes.map(cls => (
              <SelectItem key={cls.id} value={cls.id}>
                {cls.class_name} {cls.section ? `- ${cls.section}` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select Month" />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Input
          placeholder="Search students..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-64"
        />
        
        <Button variant="outline" onClick={handleExport} disabled={filteredData.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Students</p>
              <p className="text-3xl font-bold">{stats.totalStudents}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Avg Attendance</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats.avgAttendance.toFixed(1)}%
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Below 75%</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {stats.belowThreshold}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Classes Conducted</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.totalClasses}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Student Attendance Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>{classes.length === 0 ? 'No classes found' : 'No students or attendance data found'}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Roll Number</TableHead>
                  <TableHead className="text-center">Present</TableHead>
                  <TableHead className="text-center">Absent</TableHead>
                  <TableHead className="text-center">Total Classes</TableHead>
                  <TableHead>Attendance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map(record => {
                  const badge = getAttendanceBadge(record.attendance_percentage);
                  return (
                    <TableRow key={record.student_id}>
                      <TableCell className="font-medium">{record.student_name}</TableCell>
                      <TableCell>{record.roll_number}</TableCell>
                      <TableCell className="text-center">
                        <span className="text-green-600 dark:text-green-400 font-semibold">
                          {record.classes_attended}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-red-600 dark:text-red-400 font-semibold">
                          {record.total_classes - record.classes_attended}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">{record.total_classes}</TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Progress value={record.attendance_percentage} className="h-2 flex-1" />
                            <Badge variant={badge.variant} className={badge.color}>
                              {record.attendance_percentage.toFixed(1)}%
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
