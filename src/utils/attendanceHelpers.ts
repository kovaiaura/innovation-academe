import { format, getDaysInMonth, startOfMonth, addDays } from 'date-fns';
import { DailyAttendance, OfficerAttendanceRecord } from '@/types/attendance';

export const calculateAttendancePercentage = (
  presentDays: number,
  totalDays: number
): number => {
  if (totalDays === 0) return 0;
  return (presentDays / totalDays) * 100;
};

export const generateMonthCalendarDays = (yearMonth: string): Date[] => {
  const [year, month] = yearMonth.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  const daysCount = getDaysInMonth(date);
  const firstDay = startOfMonth(date);
  
  const days: Date[] = [];
  for (let i = 0; i < daysCount; i++) {
    days.push(addDays(firstDay, i));
  }
  
  return days;
};

export const getAttendanceForDate = (
  date: Date,
  dailyRecords: DailyAttendance[]
): DailyAttendance | undefined => {
  const dateStr = format(date, 'yyyy-MM-dd');
  return dailyRecords.find(record => record.date === dateStr);
};

export const calculatePayroll = (
  attendance: OfficerAttendanceRecord,
  monthlySalary: number
): number => {
  const totalDays = attendance.present_days + attendance.absent_days + attendance.leave_days;
  if (totalDays === 0) return 0;
  
  // Full pay for present and leave days
  const paidDays = attendance.present_days + attendance.leave_days;
  return (monthlySalary / totalDays) * paidDays;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value;
      }).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};
