import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockAttendanceData, getAttendanceByInstitution, mockPayrollData } from '@/data/mockAttendanceData';
import { mockOfficerProfiles, getOfficerById } from '@/data/mockOfficerData';
import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Download, DollarSign, Clock, TrendingUp, FileText, CheckCircle, Eye, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { generateMonthCalendarDays, getAttendanceForDate, calculateAttendancePercentage, exportToCSV, formatCurrency, calculateMonthlyOvertime } from '@/utils/attendanceHelpers';
import { format } from 'date-fns';
import { PayrollRecord } from '@/types/attendance';

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

  // Get officer profile for salary configuration
  const officerProfile = selectedOfficer ? getOfficerById(selectedOfficer.officer_id) : null;

  // Calculate metrics for summary cards
  const summaryMetrics = useMemo(() => {
    if (!selectedOfficer || !officerProfile) {
      return {
        totalPayroll: 0,
        overtimeHours: 0,
        averageHours: 0,
        scheduledHours: 8,
      };
    }

    const overtimeHours = calculateMonthlyOvertime(selectedOfficer.daily_records, officerProfile.normal_working_hours || 8);
    const normalHours = selectedOfficer.total_hours_worked - overtimeHours;
    const hourlyRate = officerProfile.hourly_rate || 0;
    const overtimeRate = hourlyRate * (officerProfile.overtime_rate_multiplier || 1.5);
    
    const normalPay = normalHours * hourlyRate;
    const overtimePay = overtimeHours * overtimeRate;
    const totalPayroll = normalPay + overtimePay;

    const averageHours = selectedOfficer.present_days > 0 
      ? selectedOfficer.total_hours_worked / selectedOfficer.present_days 
      : 0;

    return {
      totalPayroll,
      overtimeHours,
      averageHours,
      scheduledHours: officerProfile.normal_working_hours || 8,
    };
  }, [selectedOfficer, officerProfile]);

  // Get current month payroll breakdown
  const currentMonthPayroll = useMemo(() => {
    if (!selectedOfficer) return null;
    
    return mockPayrollData.find(
      p => p.officer_id === selectedOfficer.officer_id && p.month === currentMonth
    );
  }, [selectedOfficer, currentMonth]);

  // Get historical payroll data (last 6 months)
  const historicalPayroll = useMemo(() => {
    if (!selectedOfficer) return [];
    
    return mockPayrollData
      .filter(p => p.officer_id === selectedOfficer.officer_id)
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, 6);
  }, [selectedOfficer]);

  // Generate calendar days for current month
  const calendarDays = generateMonthCalendarDays(currentMonth);

  // Generate all days in the month
  const allDaysInMonth = useMemo(() => {
    const [year, month] = currentMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const date = `${currentMonth}-${day.toString().padStart(2, '0')}`;
      return { date, dayNumber: day };
    });
  }, [currentMonth]);

  // Daily attendance details with GPS tracking
  const dailyAttendanceDetails = useMemo(() => {
    if (!selectedOfficer) return [];
    
    const today = new Date();
    const [currentYear, currentMonthNum] = currentMonth.split('-').map(Number);
    
    return allDaysInMonth.map(({ date, dayNumber }) => {
      const dayDate = new Date(currentYear, currentMonthNum - 1, dayNumber);
      const isFutureDate = dayDate > today;
      
      // Find attendance record for this date
      const record = selectedOfficer.daily_records.find(r => r.date === date);
      
      if (isFutureDate) {
        return {
          date,
          displayDate: format(dayDate, 'EEE, MMM dd'),
          status: 'future',
          checkInTime: '-',
          checkOutTime: '-',
          checkInLocation: null,
          checkOutLocation: null,
          locationValidated: null,
          totalHours: '-',
          overtime: '-',
        };
      }
      
      if (!record) {
        return {
          date,
          displayDate: format(dayDate, 'EEE, MMM dd'),
          status: 'not_marked',
          checkInTime: '-',
          checkOutTime: '-',
          checkInLocation: null,
          checkOutLocation: null,
          locationValidated: null,
          totalHours: '-',
          overtime: '-',
        };
      }
      
      // Calculate overtime
      const normalHours = officerProfile?.normal_working_hours || 8;
      const totalHours = record.hours_worked || 0;
      const overtime = Math.max(0, totalHours - normalHours);
      
      return {
        date,
        displayDate: format(dayDate, 'EEE, MMM dd'),
        status: record.status,
        checkInTime: record.check_in_time || '-',
        checkOutTime: record.check_out_time || '-',
        checkInLocation: record.check_in_location,
        checkOutLocation: record.check_out_location,
        locationValidated: record.location_validated,
        totalHours: record.hours_worked ? `${record.hours_worked.toFixed(1)} hrs` : '-',
        overtime: overtime > 0 ? `${overtime.toFixed(1)} hrs` : '-',
      };
    });
  }, [selectedOfficer, currentMonth, allDaysInMonth, officerProfile]);

  // Helper function to render GPS link
  const renderGPSLink = (location: { latitude: number; longitude: number; address?: string } | null) => {
    if (!location) {
      return <span className="text-muted-foreground">-</span>;
    }
    
    const { latitude, longitude, address } = location;
    const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
    const coordinateDisplay = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    
    return (
      <a 
        href={googleMapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 hover:underline text-sm flex items-center gap-1"
        title={address || coordinateDisplay}
      >
        <MapPin className="h-3 w-3" />
        <span className="font-mono text-xs">{coordinateDisplay}</span>
      </a>
    );
  };

  // Helper function for validation badge
  const getValidationBadge = (validated: boolean | null, status: string) => {
    if (validated === null || status === 'future' || status === 'not_marked' || status === 'absent' || status === 'leave') {
      return <Badge variant="outline" className="bg-gray-100 text-gray-500">N/A</Badge>;
    }
    
    if (validated === true) {
      return <Badge className="bg-green-100 text-green-800 border-green-300">✓ Verified</Badge>;
    }
    
    return <Badge className="bg-red-100 text-red-800 border-red-300">✗ Invalid</Badge>;
  };

  // Helper function for attendance status badge
  const getAttendanceStatusBadge = (status: string) => {
    const statusConfig = {
      present: { label: 'Present', className: 'bg-green-100 text-green-800 border-green-300' },
      absent: { label: 'Absent', className: 'bg-red-100 text-red-800 border-red-300' },
      leave: { label: 'Leave', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
      not_marked: { label: 'Not Marked', className: 'bg-gray-100 text-gray-600 border-gray-300' },
      future: { label: 'Future', className: 'bg-blue-100 text-blue-600 border-blue-300' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.not_marked;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

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

  // Export handler for daily details
  const handleExportDailyDetails = () => {
    if (!selectedOfficer) return;
    
    const exportData = dailyAttendanceDetails.map(day => {
      const checkInCoords = day.checkInLocation 
        ? `${day.checkInLocation.latitude}, ${day.checkInLocation.longitude}`
        : '-';
      const checkOutCoords = day.checkOutLocation 
        ? `${day.checkOutLocation.latitude}, ${day.checkOutLocation.longitude}`
        : '-';
      const validation = day.locationValidated === null 
        ? 'N/A' 
        : day.locationValidated 
          ? 'Verified' 
          : 'Invalid';
      
      return {
        Date: day.displayDate,
        Status: day.status.replace('_', ' ').toUpperCase(),
        'Check-in Time': day.checkInTime,
        'Check-out Time': day.checkOutTime,
        'Check-in GPS': checkInCoords,
        'Check-out GPS': checkOutCoords,
        'Location Validated': validation,
        'Total Hours': day.totalHours,
        'Overtime Hours': day.overtime,
      };
    });
    
    const officerName = selectedOfficer.officer_name.replace(/\s+/g, '_');
    const filename = `${officerName}_Daily_Attendance_${currentMonth}.csv`;
    
    exportToCSV(exportData, filename);
    toast.success('Daily attendance details exported successfully');
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
      'Hours Worked': record.hours_worked?.toFixed(2) || '-',
      'Overtime Hours': record.overtime_hours?.toFixed(2) || '-',
    }));
    
    exportToCSV(exportData, `${selectedOfficer.officer_name}_${currentMonth}_attendance.csv`);
  };

  const getStatusBadge = (status: PayrollRecord['status']) => {
    const variants: Record<PayrollRecord['status'], { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      draft: { variant: 'secondary', label: 'Draft' },
      pending: { variant: 'outline', label: 'Pending' },
      approved: { variant: 'default', label: 'Approved' },
      forwarded: { variant: 'default', label: 'Forwarded' },
      paid: { variant: 'default', label: 'Paid' },
    };
    
    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const attendancePercentage = selectedOfficer 
    ? calculateAttendancePercentage(
        selectedOfficer.present_days,
        selectedOfficer.present_days + selectedOfficer.absent_days + selectedOfficer.leave_days
      )
    : 0;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Innovation Officer Attendance & Payroll</h1>
          <p className="text-muted-foreground mt-2">
            View attendance records and payroll details for innovation officers
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block">Institution</label>
                <Select value={selectedInstitution} onValueChange={setSelectedInstitution}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select institution" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Institutions</SelectItem>
                    {institutions.map((inst) => (
                      <SelectItem key={inst} value={inst}>
                        {inst.charAt(0).toUpperCase() + inst.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block">Officer</label>
                <Select value={selectedOfficerId} onValueChange={setSelectedOfficerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select officer" />
                  </SelectTrigger>
                  <SelectContent>
                    {attendanceData.map((officer) => (
                      <SelectItem key={officer.officer_id} value={officer.officer_id}>
                        {officer.officer_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 min-w-[200px]">
                <label className="text-sm font-medium mb-2 block">Month</label>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex-1 flex items-center justify-center border rounded-md px-3 bg-background">
                    <span className="text-sm font-medium">
                      {format(new Date(currentMonth + '-01'), 'MMMM yyyy')}
                    </span>
                  </div>
                  <Button variant="outline" size="icon" onClick={goToNextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-end">
                <Button onClick={handleExport} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedOfficer && (
          <>
            {/* Summary Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(summaryMetrics.totalPayroll)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Current month estimated
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overtime Hours</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summaryMetrics.overtimeHours.toFixed(1)} hrs</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total overtime this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Working Hours</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {summaryMetrics.averageHours.toFixed(1)} / {summaryMetrics.scheduledHours} hrs
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Average / Scheduled per day
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Attendance Calendar */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Attendance Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-green-600">
                          {selectedOfficer.present_days}
                        </div>
                        <p className="text-xs text-muted-foreground">Present</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-red-600">
                          {selectedOfficer.absent_days}
                        </div>
                        <p className="text-xs text-muted-foreground">Absent</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-yellow-600">
                          {selectedOfficer.leave_days}
                        </div>
                        <p className="text-xs text-muted-foreground">Leave</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-blue-600">
                          {attendancePercentage.toFixed(1)}%
                        </div>
                        <p className="text-xs text-muted-foreground">Attendance Rate</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                        {day}
                      </div>
                    ))}
                    
                    {/* Empty cells for offset */}
                    {Array.from({ length: calendarDays[0]?.getDay() || 0 }).map((_, i) => (
                      <div key={`empty-${i}`} />
                    ))}
                    
                    {/* Calendar days */}
                    {calendarDays.map((date, index) => {
                      const attendance = getAttendanceForDate(date, selectedOfficer.daily_records);
                      
                      return (
                        <div
                          key={index}
                          className={`
                            p-3 text-center rounded-lg border-2 transition-all
                            ${getStatusColor(date)}
                            ${attendance ? 'cursor-pointer hover:scale-105' : ''}
                          `}
                          title={attendance ? `${attendance.status.toUpperCase()}\nCheck-in: ${attendance.check_in_time || '-'}\nCheck-out: ${attendance.check_out_time || '-'}` : ''}
                        >
                          <div className="text-sm font-medium">{date.getDate()}</div>
                          <div className="text-xs font-bold">{getStatusIndicator(date)}</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap gap-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-green-100 border-2 border-green-300 dark:bg-green-900/20 dark:border-green-800" />
                      <span className="text-sm">Present</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-red-100 border-2 border-red-300 dark:bg-red-900/20 dark:border-red-800" />
                      <span className="text-sm">Absent</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-yellow-100 border-2 border-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-800" />
                      <span className="text-sm">Leave</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-muted border-2" />
                      <span className="text-sm">No Data</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Daily Attendance Details Table */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Daily Attendance Details</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Complete daily breakdown with GPS location tracking
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleExportDailyDetails}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export Daily Details
                </Button>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[120px]">Date</TableHead>
                        <TableHead className="min-w-[100px]">Status</TableHead>
                        <TableHead className="min-w-[90px]">Check-in</TableHead>
                        <TableHead className="min-w-[90px]">Check-out</TableHead>
                        <TableHead className="min-w-[180px]">Check-in Location</TableHead>
                        <TableHead className="min-w-[180px]">Check-out Location</TableHead>
                        <TableHead className="min-w-[100px]">Validated</TableHead>
                        <TableHead className="min-w-[90px]">Total Hours</TableHead>
                        <TableHead className="min-w-[90px]">Overtime</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dailyAttendanceDetails.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                            No attendance data available for this month
                          </TableCell>
                        </TableRow>
                      ) : (
                        dailyAttendanceDetails.map((day) => (
                          <TableRow key={day.date}>
                            <TableCell className="font-medium">{day.displayDate}</TableCell>
                            <TableCell>{getAttendanceStatusBadge(day.status)}</TableCell>
                            <TableCell className="text-sm">{day.checkInTime}</TableCell>
                            <TableCell className="text-sm">{day.checkOutTime}</TableCell>
                            <TableCell>{renderGPSLink(day.checkInLocation)}</TableCell>
                            <TableCell>{renderGPSLink(day.checkOutLocation)}</TableCell>
                            <TableCell>{getValidationBadge(day.locationValidated, day.status)}</TableCell>
                            <TableCell className="text-sm">{day.totalHours}</TableCell>
                            <TableCell>
                              {day.overtime !== '-' && day.overtime !== '0.0 hrs' ? (
                                <span className="text-orange-600 font-semibold text-sm">{day.overtime}</span>
                              ) : (
                                <span className="text-muted-foreground text-sm">{day.overtime}</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Officer Details */}
            {officerProfile && (
              <Card>
                <CardHeader>
                  <CardTitle>Officer Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Employee ID</p>
                      <p className="font-medium">{selectedOfficer.employee_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Department</p>
                      <p className="font-medium">{selectedOfficer.department}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Hours Worked</p>
                      <p className="font-medium">{selectedOfficer.total_hours_worked} hrs</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Last Marked Date</p>
                      <p className="font-medium">{selectedOfficer.last_marked_date}</p>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-semibold mb-4">Salary Configuration</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-sm text-muted-foreground">Hourly Rate</p>
                        <p className="font-medium">{formatCurrency(officerProfile.hourly_rate || 0)}/hr</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Overtime Rate</p>
                        <p className="font-medium">
                          {officerProfile.overtime_rate_multiplier}x ({formatCurrency((officerProfile.hourly_rate || 0) * (officerProfile.overtime_rate_multiplier || 1.5))}/hr)
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Normal Working Hours</p>
                        <p className="font-medium">{officerProfile.normal_working_hours || 8} hrs/day</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Current Month Payroll Breakdown */}
            {currentMonthPayroll && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Current Month Payroll Breakdown</span>
                    {getStatusBadge(currentMonthPayroll.status)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Attendance Summary */}
                  <div>
                    <h4 className="font-semibold mb-3">Attendance Summary</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Working Days</p>
                        <p className="text-lg font-semibold">{currentMonthPayroll.working_days}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Days Present</p>
                        <p className="text-lg font-semibold text-green-600">{currentMonthPayroll.days_present}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Days Absent</p>
                        <p className="text-lg font-semibold text-red-600">{currentMonthPayroll.days_absent}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Days Leave</p>
                        <p className="text-lg font-semibold text-yellow-600">{currentMonthPayroll.days_leave}</p>
                      </div>
                    </div>
                  </div>

                  {/* Earnings */}
                  <div>
                    <h4 className="font-semibold mb-3">Earnings</h4>
                    <div className="space-y-2">
                      {currentMonthPayroll.salary_components.map((component, idx) => (
                        <div key={idx} className="flex justify-between items-center py-2 border-b">
                          <span className="text-sm capitalize">
                            {component.component_type.replace(/_/g, ' ')}
                          </span>
                          <span className="font-medium">{formatCurrency(component.amount)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center py-2 bg-muted/50 px-3 rounded-md font-semibold">
                        <span>Total Earnings</span>
                        <span>{formatCurrency(currentMonthPayroll.total_earnings)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Deductions */}
                  <div>
                    <h4 className="font-semibold mb-3">Deductions</h4>
                    <div className="space-y-2">
                      {currentMonthPayroll.deductions.map((deduction, idx) => (
                        <div key={idx} className="flex justify-between items-center py-2 border-b">
                          <span className="text-sm capitalize">
                            {deduction.deduction_type.replace(/_/g, ' ')}
                          </span>
                          <span className="font-medium text-red-600">-{formatCurrency(deduction.amount)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center py-2 bg-muted/50 px-3 rounded-md font-semibold">
                        <span>Total Deductions</span>
                        <span className="text-red-600">-{formatCurrency(currentMonthPayroll.total_deductions)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Net Pay */}
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Net Pay</span>
                      <span className="text-2xl font-bold text-primary">{formatCurrency(currentMonthPayroll.net_pay)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" className="flex-1">
                      <FileText className="mr-2 h-4 w-4" />
                      Download Payslip
                    </Button>
                    {currentMonthPayroll.status === 'pending' && (
                      <Button className="flex-1">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve Payroll
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Historical Payroll Table */}
            {historicalPayroll.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Historical Payroll</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead>Working Days</TableHead>
                        <TableHead>Total Hours</TableHead>
                        <TableHead>Gross Salary</TableHead>
                        <TableHead>Net Pay</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historicalPayroll.map((payroll) => (
                        <TableRow key={payroll.month}>
                          <TableCell className="font-medium">
                            {format(new Date(payroll.month + '-01'), 'MMM yyyy')}
                          </TableCell>
                          <TableCell>{payroll.working_days}</TableCell>
                          <TableCell>
                            {mockAttendanceData.find(
                              a => a.officer_id === payroll.officer_id && a.month === payroll.month
                            )?.total_hours_worked || '-'}
                          </TableCell>
                          <TableCell>{formatCurrency(payroll.gross_salary)}</TableCell>
                          <TableCell className="font-semibold">{formatCurrency(payroll.net_pay)}</TableCell>
                          <TableCell>{getStatusBadge(payroll.status)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {!selectedOfficer && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Please select an officer to view their attendance and payroll details.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
