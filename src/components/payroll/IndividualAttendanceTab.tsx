/**
 * Individual Attendance Management Tab
 * View and correct attendance records for individual officers/staff
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  User,
  Calendar,
  Clock,
  Edit2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Timer,
  MapPin,
} from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AttendanceRecord {
  id: string;
  date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  total_hours_worked: number | null;
  overtime_hours: number | null;
  status: string;
  is_late_login: boolean | null;
  late_minutes: number | null;
  check_in_validated: boolean | null;
  is_manual_correction: boolean | null;
  correction_reason: string | null;
}

interface Employee {
  id: string;
  name: string;
  employee_id: string;
  position_name: string | null;
  type: 'officer' | 'staff';
}

interface IndividualAttendanceTabProps {
  month: number;
  year: number;
}

export function IndividualAttendanceTab({ month, year }: IndividualAttendanceTabProps) {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [correctionDialogOpen, setCorrectionDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [correctionData, setCorrectionData] = useState({
    check_in_time: '',
    check_out_time: '',
    reason: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  // Load employees
  useEffect(() => {
    loadEmployees();
  }, []);

  // Load attendance when employee selected
  useEffect(() => {
    if (selectedEmployee) {
      loadAttendance();
    }
  }, [selectedEmployee, month, year]);

  const loadEmployees = async () => {
    try {
      // Fetch officers
      const { data: officers, error } = await supabase
        .from('officers')
        .select('id, full_name, employee_id, department')
        .order('full_name');

      if (error) throw error;

      const employeeList: Employee[] = (officers || []).map((o) => ({
        id: o.id,
        name: o.full_name || '',
        employee_id: o.employee_id || '',
        position_name: o.department || null,
        type: 'officer' as const,
      }));

      setEmployees(employeeList);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const loadAttendance = async () => {
    if (!selectedEmployee) return;

    setIsLoading(true);
    try {
      const startDate = format(startOfMonth(new Date(year, month - 1)), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(new Date(year, month - 1)), 'yyyy-MM-dd');

      // Currently only officers are supported
      const { data, error } = await supabase
        .from('officer_attendance')
        .select('*')
        .eq('officer_id', selectedEmployee.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (error) throw error;
      setAttendanceRecords((data || []) as AttendanceRecord[]);
    } catch (error) {
      console.error('Error loading attendance:', error);
      toast.error('Failed to load attendance records');
    } finally {
      setIsLoading(false);
    }
  };

  const openCorrectionDialog = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setCorrectionData({
      check_in_time: record.check_in_time
        ? format(parseISO(record.check_in_time), "yyyy-MM-dd'T'HH:mm")
        : '',
      check_out_time: record.check_out_time
        ? format(parseISO(record.check_out_time), "yyyy-MM-dd'T'HH:mm")
        : '',
      reason: '',
    });
    setCorrectionDialogOpen(true);
  };

  const handleSaveCorrection = async () => {
    if (!selectedRecord || !selectedEmployee || !user) return;

    if (!correctionData.reason.trim()) {
      toast.error('Please provide a reason for the correction');
      return;
    }

    setIsSaving(true);
    try {
      // Calculate new hours worked
      let totalHoursWorked = null;
      let overtimeHours = null;

      if (correctionData.check_in_time && correctionData.check_out_time) {
        const checkIn = new Date(correctionData.check_in_time);
        const checkOut = new Date(correctionData.check_out_time);
        totalHoursWorked = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
        overtimeHours = Math.max(0, totalHoursWorked - 8);
      }

      // Update the attendance record (officers only for now)
      const { error: updateError } = await supabase
        .from('officer_attendance')
        .update({
          check_in_time: correctionData.check_in_time
            ? new Date(correctionData.check_in_time).toISOString()
            : selectedRecord.check_in_time,
          check_out_time: correctionData.check_out_time
            ? new Date(correctionData.check_out_time).toISOString()
            : selectedRecord.check_out_time,
          original_check_in_time: selectedRecord.check_in_time,
          original_check_out_time: selectedRecord.check_out_time,
          total_hours_worked: totalHoursWorked
            ? Math.round(totalHoursWorked * 100) / 100
            : selectedRecord.total_hours_worked,
          overtime_hours: overtimeHours
            ? Math.round(overtimeHours * 100) / 100
            : selectedRecord.overtime_hours,
          is_manual_correction: true,
          corrected_by: user.id,
          correction_reason: correctionData.reason,
          status:
            correctionData.check_in_time && correctionData.check_out_time
              ? 'checked_out'
              : correctionData.check_in_time
                ? 'checked_in'
                : selectedRecord.status,
        })
        .eq('id', selectedRecord.id);

      if (updateError) throw updateError;

      // Log the correction
      await supabase.from('attendance_corrections').insert({
        attendance_id: selectedRecord.id,
        attendance_type: selectedEmployee.type,
        field_corrected: 'check_in_time, check_out_time',
        original_value: `${selectedRecord.check_in_time || 'null'}, ${selectedRecord.check_out_time || 'null'}`,
        new_value: `${correctionData.check_in_time || 'null'}, ${correctionData.check_out_time || 'null'}`,
        reason: correctionData.reason,
        corrected_by: user.id,
        corrected_by_name: user.name,
      });

      toast.success('Attendance corrected successfully');
      setCorrectionDialogOpen(false);
      loadAttendance();
    } catch (error) {
      console.error('Error saving correction:', error);
      toast.error('Failed to save correction');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.employee_id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate summary stats
  const calculateStats = () => {
    const daysInMonth = eachDayOfInterval({
      start: startOfMonth(new Date(year, month - 1)),
      end: endOfMonth(new Date(year, month - 1)),
    });

    const workingDays = daysInMonth.filter((d) => !isWeekend(d)).length;
    const presentDays = attendanceRecords.filter(
      (r) => r.status === 'checked_in' || r.status === 'checked_out'
    ).length;
    const lateDays = attendanceRecords.filter((r) => r.is_late_login).length;
    const totalHours = attendanceRecords.reduce((sum, r) => sum + (r.total_hours_worked || 0), 0);
    const totalOvertime = attendanceRecords.reduce((sum, r) => sum + (r.overtime_hours || 0), 0);

    return { workingDays, presentDays, lateDays, totalHours, totalOvertime };
  };

  const stats = selectedEmployee ? calculateStats() : null;

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Employee Selection Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Select Employee</CardTitle>
            <CardDescription>Search and select an employee</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or ID..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {filteredEmployees.map((emp) => (
                <div
                  key={`${emp.type}-${emp.id}`}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedEmployee?.id === emp.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/50 hover:bg-muted'
                  }`}
                  onClick={() => setSelectedEmployee(emp)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-9 w-9 rounded-full flex items-center justify-center ${
                        selectedEmployee?.id === emp.id ? 'bg-primary-foreground/20' : 'bg-primary/10'
                      }`}
                    >
                      <User
                        className={`h-4 w-4 ${
                          selectedEmployee?.id === emp.id ? 'text-primary-foreground' : 'text-primary'
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{emp.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs opacity-70">{emp.employee_id}</span>
                        <Badge variant="outline" className="text-xs py-0">
                          {emp.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Attendance Records Panel */}
        <div className="lg:col-span-3 space-y-6">
          {selectedEmployee ? (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card>
                  <CardContent className="pt-4 text-center">
                    <Calendar className="h-5 w-5 mx-auto text-blue-500 mb-1" />
                    <p className="text-2xl font-bold">{stats?.workingDays}</p>
                    <p className="text-xs text-muted-foreground">Working Days</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <CheckCircle className="h-5 w-5 mx-auto text-green-500 mb-1" />
                    <p className="text-2xl font-bold text-green-600">{stats?.presentDays}</p>
                    <p className="text-xs text-muted-foreground">Present</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <AlertTriangle className="h-5 w-5 mx-auto text-orange-500 mb-1" />
                    <p className="text-2xl font-bold text-orange-600">{stats?.lateDays}</p>
                    <p className="text-xs text-muted-foreground">Late Days</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <Clock className="h-5 w-5 mx-auto text-primary mb-1" />
                    <p className="text-2xl font-bold">{stats?.totalHours.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">Total Hours</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <Timer className="h-5 w-5 mx-auto text-purple-500 mb-1" />
                    <p className="text-2xl font-bold text-purple-600">{stats?.totalOvertime.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">Overtime</p>
                  </CardContent>
                </Card>
              </div>

              {/* Attendance Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {selectedEmployee.name}'s Attendance
                  </CardTitle>
                  <CardDescription>
                    {format(new Date(year, month - 1), 'MMMM yyyy')} - {selectedEmployee.employee_id}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    </div>
                  ) : attendanceRecords.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No attendance records found for this month
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Check-in</TableHead>
                          <TableHead>Check-out</TableHead>
                          <TableHead className="text-center">Hours</TableHead>
                          <TableHead className="text-center">Overtime</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                          <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {attendanceRecords.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{format(parseISO(record.date), 'dd MMM')}</p>
                                <p className="text-xs text-muted-foreground">
                                  {format(parseISO(record.date), 'EEEE')}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {record.check_in_time ? (
                                  <>
                                    <span>{format(parseISO(record.check_in_time), 'HH:mm')}</span>
                                    {record.is_late_login && (
                                      <Badge variant="destructive" className="text-xs py-0 px-1">
                                        +{record.late_minutes}m
                                      </Badge>
                                    )}
                                  </>
                                ) : (
                                  <span className="text-muted-foreground">--:--</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {record.check_out_time ? (
                                format(parseISO(record.check_out_time), 'HH:mm')
                              ) : (
                                <span className="text-muted-foreground">--:--</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {record.total_hours_worked?.toFixed(1) || '-'}
                            </TableCell>
                            <TableCell className="text-center">
                              {(record.overtime_hours || 0) > 0 ? (
                                <Badge className="bg-purple-500/10 text-purple-700 border-purple-500/20">
                                  {record.overtime_hours?.toFixed(1)}h
                                </Badge>
                              ) : (
                                '-'
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex flex-col items-center gap-1">
                                {record.status === 'checked_out' ? (
                                  <Badge className="bg-green-500/10 text-green-700 border-green-500/20">
                                    Complete
                                  </Badge>
                                ) : record.status === 'checked_in' ? (
                                  <Badge className="bg-blue-500/10 text-blue-700 border-blue-500/20">
                                    Working
                                  </Badge>
                                ) : (
                                  <Badge variant="outline">Absent</Badge>
                                )}
                                {record.is_manual_correction && (
                                  <Badge variant="secondary" className="text-xs py-0">
                                    Corrected
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openCorrectionDialog(record)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Select an Employee</h3>
                <p className="text-muted-foreground mt-1">
                  Choose an employee from the list to view their attendance records
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Correction Dialog */}
      <Dialog open={correctionDialogOpen} onOpenChange={setCorrectionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Correct Attendance</DialogTitle>
            <DialogDescription>
              Make corrections to the attendance record for{' '}
              {selectedRecord && format(parseISO(selectedRecord.date), 'dd MMMM yyyy')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Original Values */}
            <div className="bg-muted/50 p-3 rounded-lg text-sm">
              <p className="font-medium mb-2">Original Values:</p>
              <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                <span>Check-in:</span>
                <span>
                  {selectedRecord?.check_in_time
                    ? format(parseISO(selectedRecord.check_in_time), 'HH:mm')
                    : '--:--'}
                </span>
                <span>Check-out:</span>
                <span>
                  {selectedRecord?.check_out_time
                    ? format(parseISO(selectedRecord.check_out_time), 'HH:mm')
                    : '--:--'}
                </span>
              </div>
            </div>

            {/* New Values */}
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="check_in">New Check-in Time</Label>
                <Input
                  id="check_in"
                  type="datetime-local"
                  value={correctionData.check_in_time}
                  onChange={(e) =>
                    setCorrectionData({ ...correctionData, check_in_time: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="check_out">New Check-out Time</Label>
                <Input
                  id="check_out"
                  type="datetime-local"
                  value={correctionData.check_out_time}
                  onChange={(e) =>
                    setCorrectionData({ ...correctionData, check_out_time: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Correction *</Label>
                <Textarea
                  id="reason"
                  placeholder="Enter the reason for this correction..."
                  value={correctionData.reason}
                  onChange={(e) =>
                    setCorrectionData({ ...correctionData, reason: e.target.value })
                  }
                  rows={3}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCorrectionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCorrection} disabled={isSaving || !correctionData.reason.trim()}>
              {isSaving ? 'Saving...' : 'Save Correction'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
