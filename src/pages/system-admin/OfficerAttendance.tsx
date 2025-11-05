import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockAttendanceData, getAttendanceByInstitution } from '@/data/mockAttendanceData';
import { mockOfficerProfiles } from '@/data/mockOfficerData';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { generateMonthCalendarDays, getAttendanceForDate, calculateAttendancePercentage, exportToCSV } from '@/utils/attendanceHelpers';

export default function OfficerAttendance() {
  const [selectedInstitution, setSelectedInstitution] = useState<string>('all');
  const [selectedOfficerId, setSelectedOfficerId] = useState('');
  const [currentMonth, setCurrentMonth] = useState('2024-01');

  // Get unique institutions from officer profiles
  const institutions = Array.from(
    new Set(mockOfficerProfiles.flatMap(officer => officer.assigned_institutions))
  );

  // Get attendance data based on institution filter
  const attendanceData = selectedInstitution === 'all'
    ? mockAttendanceData
    : getAttendanceByInstitution(selectedInstitution);

  // Set default officer when institution changes
  if (selectedOfficerId === '' && attendanceData.length > 0) {
    setSelectedOfficerId(attendanceData[0].officer_id);
  }

  // Get selected officer's data
  const selectedOfficer = attendanceData.find(
    (officer) => officer.officer_id === selectedOfficerId
  );

  // Generate calendar days for current month
  const calendarDays = generateMonthCalendarDays(currentMonth);

  // Navigation functions
  const goToPreviousMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    setCurrentMonth(`${prevYear}-${String(prevMonth).padStart(2, '0')}`);
  };

  const goToNextMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    setCurrentMonth(`${nextYear}-${String(nextMonth).padStart(2, '0')}`);
  };

  // Get status color for calendar day
  const getStatusColor = (date: Date) => {
    if (!selectedOfficer) return 'bg-muted text-muted-foreground';
    
    const attendance = getAttendanceForDate(date, selectedOfficer.daily_records);
    
    if (!attendance) return 'bg-muted text-muted-foreground';
    
    switch (attendance.status) {
      case 'present':
        return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      case 'leave':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  // Get status indicator
  const getStatusIndicator = (date: Date) => {
    if (!selectedOfficer) return '';
    
    const attendance = getAttendanceForDate(date, selectedOfficer.daily_records);
    if (!attendance) return '';
    
    switch (attendance.status) {
      case 'present': return '✓';
      case 'absent': return '✗';
      case 'leave': return 'L';
      default: return '';
    }
  };

  // Export handler
  const handleExport = () => {
    if (!selectedOfficer) return;
    
    const exportData = selectedOfficer.daily_records.map((record) => ({
      Date: record.date,
      Status: record.status,
      'Check In': record.check_in_time || '-',
      'Check Out': record.check_out_time || '-',
      'Hours Worked': record.hours_worked?.toFixed(2) || '0',
      'Leave Type': record.leave_type || '-',
      'Leave Reason': record.leave_reason || '-',
    }));
    
    exportToCSV(
      exportData,
      `${selectedOfficer.officer_name}-attendance-${currentMonth}.csv`
    );
  };

  // Calculate attendance rate
  const attendanceRate = selectedOfficer
    ? calculateAttendancePercentage(
        selectedOfficer.present_days,
        selectedOfficer.present_days + selectedOfficer.absent_days
      )
    : 0;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Officer Attendance</h1>
          <p className="text-muted-foreground mt-1">
            Track and monitor officer attendance records
          </p>
        </div>

        {/* Controls Row */}
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Institution Filter */}
            <div className="w-64">
              <Select value={selectedInstitution} onValueChange={(value) => {
                setSelectedInstitution(value);
                setSelectedOfficerId(''); // Reset officer selection
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Institution" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Institutions</SelectItem>
                  {institutions.map((inst) => (
                    <SelectItem key={inst} value={inst}>
                      {inst.charAt(0).toUpperCase() + inst.slice(1)} High School
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Officer Selection */}
            <div className="w-64">
              <Select value={selectedOfficerId} onValueChange={setSelectedOfficerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Officer" />
                </SelectTrigger>
                <SelectContent>
                  {attendanceData.map((officer) => (
                    <SelectItem key={officer.officer_id} value={officer.officer_id}>
                      {officer.officer_name} ({officer.employee_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-lg font-semibold min-w-[150px] text-center">
                {new Date(currentMonth + '-01').toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              <Button variant="outline" size="icon" onClick={goToNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Export Button */}
            <Button variant="outline" onClick={handleExport} disabled={!selectedOfficer}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Summary Statistics */}
          {selectedOfficer && (
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Present Days</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {selectedOfficer.present_days}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Absent Days</p>
                    <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                      {selectedOfficer.absent_days}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Leave Days</p>
                    <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                      {selectedOfficer.leave_days}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Attendance Rate</p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {attendanceRate.toFixed(1)}%
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Calendar Grid */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Attendance Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Days of Week Header */}
                <div className="grid grid-cols-7 gap-2 text-center font-semibold text-sm">
                  <div>Sun</div>
                  <div>Mon</div>
                  <div>Tue</div>
                  <div>Wed</div>
                  <div>Thu</div>
                  <div>Fri</div>
                  <div>Sat</div>
                </div>

                {/* Calendar Days Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((date, index) => {
                    const dayOfMonth = date.getDate();
                    const isCurrentMonth = date.toISOString().startsWith(currentMonth);
                    const attendance = selectedOfficer
                      ? getAttendanceForDate(date, selectedOfficer.daily_records)
                      : null;

                    return (
                      <div
                        key={index}
                        className={`
                          min-h-[80px] p-2 rounded-lg border-2 transition-all
                          ${isCurrentMonth ? getStatusColor(date) : 'bg-muted/50 text-muted-foreground'}
                          ${attendance ? 'cursor-pointer hover:shadow-md' : ''}
                        `}
                        title={
                          attendance
                            ? `${attendance.status.toUpperCase()}\nCheck In: ${attendance.check_in_time || '-'}\nCheck Out: ${attendance.check_out_time || '-'}\nHours: ${attendance.hours_worked?.toFixed(2) || '0'}h`
                            : ''
                        }
                      >
                        <div className="text-right text-xs font-semibold mb-1">
                          {dayOfMonth}
                        </div>
                        <div className="text-center text-2xl font-bold">
                          {isCurrentMonth && getStatusIndicator(date)}
                        </div>
                        {attendance && attendance.hours_worked && (
                          <div className="text-center text-xs mt-1">
                            {attendance.hours_worked.toFixed(1)}h
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-6 pt-4 border-t flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-100 border-2 border-green-300 dark:bg-green-900/20 dark:border-green-800"></div>
                    <span className="text-sm">Present (✓)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-100 border-2 border-red-300 dark:bg-red-900/20 dark:border-red-800"></div>
                    <span className="text-sm">Absent (✗)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-yellow-100 border-2 border-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-800"></div>
                    <span className="text-sm">Leave (L)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-muted border-2 border-muted-foreground/20"></div>
                    <span className="text-sm">Weekend / No Data</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Details Section */}
          {selectedOfficer && (
            <Card>
              <CardHeader>
                <CardTitle>Officer Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Employee ID</p>
                    <p className="font-semibold">{selectedOfficer.employee_id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Department</p>
                    <p className="font-semibold">{selectedOfficer.department}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Hours Worked</p>
                    <p className="font-semibold">{selectedOfficer.total_hours_worked}h</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Marked</p>
                    <p className="font-semibold">
                      {new Date(selectedOfficer.last_marked_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
