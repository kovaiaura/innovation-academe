import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Download, Calendar, Search, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { AttendanceCalendar } from './AttendanceCalendar';
import { OfficerAttendanceRecord } from '@/types/attendance';
import { mockAttendanceData } from '@/data/mockAttendanceData';
import { calculateAttendancePercentage, exportToCSV } from '@/utils/attendanceHelpers';
import { format } from 'date-fns';

export function OfficerAttendanceTab() {
  const [selectedMonth, setSelectedMonth] = useState('2024-01');
  const [searchQuery, setSearchQuery] = useState('');
  const [attendanceData] = useState<OfficerAttendanceRecord[]>(mockAttendanceData);
  const [selectedOfficer, setSelectedOfficer] = useState<OfficerAttendanceRecord | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const filteredData = attendanceData.filter(
    record =>
      record.month === selectedMonth &&
      (record.officer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.employee_id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalOfficers = filteredData.length;
  const totalPresentDays = filteredData.reduce((sum, record) => sum + record.present_days, 0);
  const avgAttendanceRate =
    filteredData.length > 0
      ? filteredData.reduce((sum, record) => {
          const total = record.present_days + record.absent_days + record.leave_days;
          return sum + calculateAttendancePercentage(record.present_days, total);
        }, 0) / filteredData.length
      : 0;

  const handleExportSummary = () => {
    const exportData = filteredData.map(record => ({
      'Employee ID': record.employee_id,
      'Officer Name': record.officer_name,
      'Department': record.department,
      'Present Days': record.present_days,
      'Absent Days': record.absent_days,
      'Leave Days': record.leave_days,
      'Total Hours': record.total_hours_worked.toFixed(1),
      'Last Marked': record.last_marked_date,
    }));
    
    exportToCSV(exportData, `attendance-summary-${selectedMonth}.csv`);
    toast.success('Attendance summary exported successfully');
  };

  const handleViewCalendar = (officer: OfficerAttendanceRecord) => {
    setSelectedOfficer(officer);
    setIsCalendarOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or employee ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024-01">January 2024</SelectItem>
              <SelectItem value="2023-12">December 2023</SelectItem>
              <SelectItem value="2023-11">November 2023</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExportSummary} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Officers</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOfficers}</div>
            <p className="text-xs text-muted-foreground">Active officers tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Attendance Rate</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgAttendanceRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Across all officers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Present Days</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPresentDays}</div>
            <p className="text-xs text-muted-foreground">For {selectedMonth}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Officer Attendance Records</CardTitle>
          <CardDescription>View and verify daily attendance submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Officer Name</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead className="text-right">Present</TableHead>
                <TableHead className="text-right">Absent</TableHead>
                <TableHead className="text-right">Leave</TableHead>
                <TableHead className="text-right">Attendance %</TableHead>
                <TableHead className="text-right">Last Marked</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((record) => {
                const totalDays = record.present_days + record.absent_days + record.leave_days;
                const attendanceRate = calculateAttendancePercentage(record.present_days, totalDays);
                
                return (
                  <TableRow key={record.officer_id}>
                    <TableCell>
                      <button
                        onClick={() => handleViewCalendar(record)}
                        className="font-medium text-primary hover:underline text-left"
                      >
                        {record.officer_name}
                      </button>
                    </TableCell>
                    <TableCell>{record.employee_id}</TableCell>
                    <TableCell className="text-right text-green-600 font-medium">
                      {record.present_days}
                    </TableCell>
                    <TableCell className="text-right text-red-600 font-medium">
                      {record.absent_days}
                    </TableCell>
                    <TableCell className="text-right text-yellow-600 font-medium">
                      {record.leave_days}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {attendanceRate.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {format(new Date(record.last_marked_date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewCalendar(record)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Calendar
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedOfficer && (
        <AttendanceCalendar
          attendance={selectedOfficer}
          isOpen={isCalendarOpen}
          onClose={() => setIsCalendarOpen(false)}
        />
      )}
    </div>
  );
}
