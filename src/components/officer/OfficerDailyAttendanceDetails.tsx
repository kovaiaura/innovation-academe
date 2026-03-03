import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MapPin, Download, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useOfficerMonthlyAttendance } from '@/hooks/useOfficerAttendance';
import { exportToCSV } from '@/utils/attendanceHelpers';
import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { calendarDayTypeService } from '@/services/calendarDayType.service';

interface OfficerDailyAttendanceDetailsProps {
  officerId: string;
  officerName: string;
  month: string;
  onMonthChange?: (month: string) => void;
  institutionId?: string;
}

export function OfficerDailyAttendanceDetails({
  officerId,
  officerName,
  month,
  onMonthChange,
  institutionId,
}: OfficerDailyAttendanceDetailsProps) {
  const { data: records, isLoading } = useOfficerMonthlyAttendance(officerId, month);

  const [currentYear, currentMonthNum] = month.split('-').map(Number);

  // Fetch calendar day types (weekends, holidays)
  const { data: dayTypesMap } = useQuery({
    queryKey: ['calendar-day-types', month, institutionId],
    queryFn: async () => {
      const calendarType = institutionId ? 'institution' : 'company';
      return calendarDayTypeService.getDayTypesForMonth(
        calendarType as 'institution' | 'company',
        currentYear,
        currentMonthNum,
        institutionId
      );
    },
    enabled: !!month,
  });

  // Fetch calendar day type descriptions (for holiday names)
  const { data: dayTypeDescriptions } = useQuery({
    queryKey: ['calendar-day-descriptions', month, institutionId],
    queryFn: async () => {
      const startDate = `${currentYear}-${String(currentMonthNum).padStart(2, '0')}-01`;
      const endDate = format(new Date(currentYear, currentMonthNum, 0), 'yyyy-MM-dd');
      const calendarType = institutionId ? 'institution' : 'company';

      let query = supabase
        .from('calendar_day_types')
        .select('date, description, day_type')
        .eq('calendar_type', calendarType)
        .gte('date', startDate)
        .lte('date', endDate);

      if (calendarType === 'institution' && institutionId) {
        query = query.eq('institution_id', institutionId);
      } else {
        query = query.is('institution_id', null);
      }

      const { data } = await query;
      const map: Record<string, string> = {};
      data?.forEach((entry) => {
        if (entry.description) map[entry.date] = entry.description;
      });
      return map;
    },
    enabled: !!month,
  });

  // Fetch approved leaves for the officer in this month
  const { data: approvedLeaves } = useQuery({
    queryKey: ['officer-leaves', officerId, month],
    queryFn: async () => {
      const startDate = `${currentYear}-${String(currentMonthNum).padStart(2, '0')}-01`;
      const endDate = format(new Date(currentYear, currentMonthNum, 0), 'yyyy-MM-dd');

      const { data } = await supabase
        .from('leave_applications')
        .select('start_date, end_date, leave_type, is_lop')
        .eq('applicant_id', officerId)
        .eq('status', 'approved')
        .lte('start_date', endDate)
        .gte('end_date', startDate);

      return data || [];
    },
    enabled: !!officerId && !!month,
  });

  const getLeaveForDate = (dateStr: string) => {
    return approvedLeaves?.find(
      (l) => dateStr >= l.start_date && dateStr <= l.end_date
    );
  };

  const dailyAttendanceDetails = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonthNum, 0).getDate();
    const today = new Date();

    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const date = `${month}-${String(day).padStart(2, '0')}`;
      const dayDate = new Date(currentYear, currentMonthNum - 1, day);
      const isFutureDate = dayDate > today;

      if (isFutureDate) {
        return {
          date,
          displayDate: format(dayDate, 'EEE, MMM dd'),
          status: 'future',
          statusLabel: 'Future',
          checkInTime: '-',
          checkOutTime: '-',
          checkInLocation: null as { latitude: number; longitude: number } | null,
          checkOutLocation: null as { latitude: number; longitude: number } | null,
          locationValidated: null as boolean | null,
          totalHours: '-',
          overtime: '-',
        };
      }

      const record = records?.find((r) => r.date === date);

      // If attendance record exists, use it
      if (record) {
        const formatTime = (isoTime: string | null) => {
          if (!isoTime) return '-';
          try {
            return format(new Date(isoTime), 'hh:mm a');
          } catch {
            return isoTime;
          }
        };

        const totalHours = record.total_hours_worked || 0;
        const overtime = record.overtime_hours || 0;

        let displayStatus = 'not_marked';
        let statusLabel = 'Not Marked';
        if (record.status === 'checked_in' || record.status === 'checked_out') {
          displayStatus = 'present';
          statusLabel = 'Present';
        } else if (record.status === 'not_checked_in') {
          displayStatus = 'absent';
          statusLabel = 'Absent';
        }

        return {
          date,
          displayDate: format(dayDate, 'EEE, MMM dd'),
          status: displayStatus,
          statusLabel,
          checkInTime: formatTime(record.check_in_time),
          checkOutTime: formatTime(record.check_out_time),
          checkInLocation:
            record.check_in_latitude && record.check_in_longitude
              ? { latitude: record.check_in_latitude, longitude: record.check_in_longitude }
              : null,
          checkOutLocation:
            record.check_out_latitude && record.check_out_longitude
              ? { latitude: record.check_out_latitude, longitude: record.check_out_longitude }
              : null,
          locationValidated: record.check_in_validated,
          totalHours: totalHours > 0 ? `${totalHours.toFixed(1)} hrs` : '-',
          overtime: overtime > 0 ? `${overtime.toFixed(1)} hrs` : '-',
        };
      }

      // No attendance record — determine day type
      const calendarDayType = dayTypesMap?.get(date);
      const holidayDesc = dayTypeDescriptions?.[date];
      const leave = getLeaveForDate(date);

      let status = 'not_marked';
      let statusLabel = 'Not Marked';

      if (calendarDayType === 'weekend') {
        status = 'weekend';
        statusLabel = 'Weekend';
      } else if (calendarDayType === 'holiday') {
        status = 'holiday';
        statusLabel = holidayDesc ? `Holiday - ${holidayDesc}` : 'Holiday';
      } else if (leave) {
        if (leave.is_lop) {
          status = 'lop';
          statusLabel = 'LOP';
        } else {
          status = 'leave';
          statusLabel = leave.leave_type
            ? `Leave (${leave.leave_type.charAt(0).toUpperCase() + leave.leave_type.slice(1)})`
            : 'Leave';
        }
      }

      return {
        date,
        displayDate: format(dayDate, 'EEE, MMM dd'),
        status,
        statusLabel,
        checkInTime: '-',
        checkOutTime: '-',
        checkInLocation: null as { latitude: number; longitude: number } | null,
        checkOutLocation: null as { latitude: number; longitude: number } | null,
        locationValidated: null as boolean | null,
        totalHours: '-',
        overtime: '-',
      };
    });
  }, [records, month, currentYear, currentMonthNum, dayTypesMap, dayTypeDescriptions, approvedLeaves]);

  const renderGPSLink = (location: { latitude: number; longitude: number } | null) => {
    if (!location) {
      return <span className="text-muted-foreground">-</span>;
    }

    const { latitude, longitude } = location;
    const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
    const coordinateDisplay = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

    return (
      <a
        href={googleMapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 hover:underline text-sm flex items-center gap-1"
        title={coordinateDisplay}
      >
        <MapPin className="h-3 w-3" />
        <span className="font-mono text-xs">{coordinateDisplay}</span>
      </a>
    );
  };

  const getValidationBadge = (validated: boolean | null, status: string) => {
    if (validated === null || !['present'].includes(status)) {
      return <Badge variant="outline" className="bg-gray-100 text-gray-500">N/A</Badge>;
    }
    if (validated === true) {
      return <Badge className="bg-green-100 text-green-800 border-green-300">✓ Verified</Badge>;
    }
    return <Badge className="bg-red-100 text-red-800 border-red-300">✗ Invalid</Badge>;
  };

  const getAttendanceStatusBadge = (status: string, label: string) => {
    const statusConfig: Record<string, string> = {
      present: 'bg-green-100 text-green-800 border-green-300',
      absent: 'bg-red-100 text-red-800 border-red-300',
      leave: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      lop: 'bg-orange-100 text-orange-800 border-orange-300',
      weekend: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      holiday: 'bg-amber-100 text-amber-800 border-amber-300',
      not_marked: 'bg-gray-100 text-gray-600 border-gray-300',
      future: 'bg-blue-100 text-blue-600 border-blue-300',
    };

    const className = statusConfig[status] || statusConfig.not_marked;
    return <Badge className={className}>{label}</Badge>;
  };

  const handleExport = () => {
    const exportData = dailyAttendanceDetails.map((day) => ({
      Date: day.displayDate,
      Status: day.statusLabel,
      'Check-in Time': day.checkInTime,
      'Check-out Time': day.checkOutTime,
      'Check-in GPS': day.checkInLocation
        ? `${day.checkInLocation.latitude}, ${day.checkInLocation.longitude}`
        : '-',
      'Check-out GPS': day.checkOutLocation
        ? `${day.checkOutLocation.latitude}, ${day.checkOutLocation.longitude}`
        : '-',
      'Location Validated':
        day.locationValidated === null ? 'N/A' : day.locationValidated ? 'Verified' : 'Invalid',
      'Total Hours': day.totalHours,
      'Overtime Hours': day.overtime,
    }));

    const filename = `${officerName.replace(/\s+/g, '_')}_Daily_Attendance_${month}.csv`;
    exportToCSV(exportData, filename);
    toast.success('Daily attendance details exported successfully');
  };

  // Calculate summary
  const summary = useMemo(() => {
    const count = (s: string) => dailyAttendanceDetails.filter((d) => d.status === s).length;
    return {
      presentDays: count('present'),
      absentDays: count('absent'),
      weekendDays: count('weekend'),
      holidayDays: count('holiday'),
      leaveDays: count('leave'),
      lopDays: count('lop'),
      notMarked: count('not_marked'),
    };
  }, [dailyAttendanceDetails]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Daily Attendance Details
        </CardTitle>
        <div className="flex items-center gap-3">
          <Input
            type="month"
            value={month}
            onChange={(e) => onMonthChange?.(e.target.value)}
            className="w-44"
          />
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary badges */}
        <div className="flex flex-wrap gap-3 mb-4">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Present: {summary.presentDays}
          </Badge>
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Absent: {summary.absentDays}
          </Badge>
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
            Weekend: {summary.weekendDays}
          </Badge>
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            Holiday: {summary.holidayDays}
          </Badge>
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Leave: {summary.leaveDays}
          </Badge>
          {summary.lopDays > 0 && (
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              LOP: {summary.lopDays}
            </Badge>
          )}
          <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
            Not Marked: {summary.notMarked}
          </Badge>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
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
                      <TableCell>{getAttendanceStatusBadge(day.status, day.statusLabel)}</TableCell>
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
        )}
      </CardContent>
    </Card>
  );
}
