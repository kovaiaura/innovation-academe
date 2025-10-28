import { OfficerAttendanceRecord, PayrollRecord, DailyAttendance } from '@/types/attendance';

const generateDailyRecords = (
  month: string,
  pattern: 'regular' | 'some_absences' | 'frequent_absences'
): DailyAttendance[] => {
  const records: DailyAttendance[] = [];
  const year = 2024;
  const monthNum = parseInt(month.split('-')[1]);
  const daysInMonth = new Date(year, monthNum, 0).getDate();
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${month}-${String(day).padStart(2, '0')}`;
    const dayOfWeek = new Date(year, monthNum - 1, day).getDay();
    
    // Skip weekends
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;
    
    let status: 'present' | 'absent' | 'leave';
    let checkIn: string | undefined;
    let checkOut: string | undefined;
    let hoursWorked: number | undefined;
    
    if (pattern === 'regular') {
      status = 'present';
      checkIn = `0${8 + Math.floor(Math.random() * 2)}:${15 + Math.floor(Math.random() * 30)} AM`;
      checkOut = `0${5 + Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 60)} PM`;
      hoursWorked = 8 + Math.random();
    } else if (pattern === 'some_absences') {
      const rand = Math.random();
      if (rand < 0.85) {
        status = 'present';
        checkIn = `0${8 + Math.floor(Math.random() * 2)}:${15 + Math.floor(Math.random() * 30)} AM`;
        checkOut = `0${5 + Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 60)} PM`;
        hoursWorked = 8 + Math.random();
      } else if (rand < 0.92) {
        status = 'leave';
      } else {
        status = 'absent';
      }
    } else {
      const rand = Math.random();
      if (rand < 0.70) {
        status = 'present';
        checkIn = `0${8 + Math.floor(Math.random() * 2)}:${15 + Math.floor(Math.random() * 30)} AM`;
        checkOut = `0${5 + Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 60)} PM`;
        hoursWorked = 8 + Math.random();
      } else if (rand < 0.85) {
        status = 'leave';
      } else {
        status = 'absent';
      }
    }
    
    const record: DailyAttendance = {
      date,
      status,
      check_in_time: checkIn,
      check_out_time: checkOut,
      hours_worked: hoursWorked,
    };
    
    if (status === 'leave') {
      record.leave_type = day % 3 === 0 ? 'sick' : 'casual';
      record.leave_reason = day % 3 === 0 ? 'Medical appointment' : 'Personal work';
    }
    
    records.push(record);
  }
  
  return records;
};

export const mockAttendanceData: OfficerAttendanceRecord[] = [
  {
    officer_id: '1',
    officer_name: 'John Smith',
    employee_id: 'EMP001',
    department: 'Innovation Labs',
    month: '2024-01',
    daily_records: generateDailyRecords('2024-01', 'regular'),
    present_days: 22,
    absent_days: 0,
    leave_days: 1,
    total_hours_worked: 184,
    last_marked_date: '2024-01-31',
  },
  {
    officer_id: '2',
    officer_name: 'Sarah Johnson',
    employee_id: 'EMP002',
    department: 'Innovation Labs',
    month: '2024-01',
    daily_records: generateDailyRecords('2024-01', 'some_absences'),
    present_days: 20,
    absent_days: 2,
    leave_days: 1,
    total_hours_worked: 168,
    last_marked_date: '2024-01-30',
  },
  {
    officer_id: '3',
    officer_name: 'Michael Chen',
    employee_id: 'EMP003',
    department: 'Innovation Labs',
    month: '2024-01',
    daily_records: generateDailyRecords('2024-01', 'frequent_absences'),
    present_days: 18,
    absent_days: 3,
    leave_days: 2,
    total_hours_worked: 152,
    last_marked_date: '2024-01-29',
  },
  {
    officer_id: '4',
    officer_name: 'Emily Rodriguez',
    employee_id: 'EMP004',
    department: 'Innovation Labs',
    month: '2024-01',
    daily_records: generateDailyRecords('2024-01', 'regular'),
    present_days: 21,
    absent_days: 1,
    leave_days: 1,
    total_hours_worked: 176,
    last_marked_date: '2024-01-31',
  },
  {
    officer_id: '5',
    officer_name: 'David Park',
    employee_id: 'EMP005',
    department: 'Innovation Labs',
    month: '2024-01',
    daily_records: generateDailyRecords('2024-01', 'some_absences'),
    present_days: 19,
    absent_days: 2,
    leave_days: 2,
    total_hours_worked: 160,
    last_marked_date: '2024-01-30',
  },
];

export const mockPayrollData: PayrollRecord[] = [
  {
    officer_id: '1',
    officer_name: 'John Smith',
    employee_id: 'EMP001',
    month: '2024-01',
    working_days: 23,
    salary_monthly: 65000,
    calculated_pay: 65000,
    deductions: 0,
    net_pay: 65000,
    status: 'approved',
    approved_by: 'Admin',
    approved_date: '2024-01-31',
  },
  {
    officer_id: '2',
    officer_name: 'Sarah Johnson',
    employee_id: 'EMP002',
    month: '2024-01',
    working_days: 23,
    salary_monthly: 62000,
    calculated_pay: 56522,
    deductions: 1000,
    net_pay: 55522,
    status: 'pending',
  },
  {
    officer_id: '3',
    officer_name: 'Michael Chen',
    employee_id: 'EMP003',
    month: '2024-01',
    working_days: 23,
    salary_monthly: 55000,
    calculated_pay: 47826,
    deductions: 500,
    net_pay: 47326,
    status: 'pending',
  },
  {
    officer_id: '4',
    officer_name: 'Emily Rodriguez',
    employee_id: 'EMP004',
    month: '2024-01',
    working_days: 23,
    salary_monthly: 60000,
    calculated_pay: 58696,
    deductions: 0,
    net_pay: 58696,
    status: 'approved',
    approved_by: 'Admin',
    approved_date: '2024-01-31',
  },
  {
    officer_id: '5',
    officer_name: 'David Park',
    employee_id: 'EMP005',
    month: '2024-01',
    working_days: 23,
    salary_monthly: 58000,
    calculated_pay: 52174,
    deductions: 750,
    net_pay: 51424,
    status: 'draft',
  },
];
