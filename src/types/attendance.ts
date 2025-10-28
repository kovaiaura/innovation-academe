export type AttendanceStatus = 'present' | 'absent' | 'leave';
export type LeaveType = 'sick' | 'casual' | 'earned';
export type PayrollStatus = 'draft' | 'pending' | 'approved' | 'forwarded' | 'paid';

export interface DailyAttendance {
  date: string; // "2024-01-15"
  status: AttendanceStatus;
  check_in_time?: string; // "09:15 AM"
  check_out_time?: string; // "05:30 PM"
  hours_worked?: number;
  leave_type?: LeaveType;
  leave_reason?: string;
  notes?: string;
}

export interface OfficerAttendanceRecord {
  officer_id: string;
  officer_name: string;
  employee_id: string;
  department: string;
  month: string; // "2024-01"
  daily_records: DailyAttendance[];
  present_days: number;
  absent_days: number;
  leave_days: number;
  total_hours_worked: number;
  last_marked_date: string;
}

export interface PayrollRecord {
  officer_id: string;
  officer_name: string;
  employee_id: string;
  month: string;
  working_days: number;
  salary_monthly: number;
  calculated_pay: number;
  deductions: number;
  net_pay: number;
  status: PayrollStatus;
  approved_by?: string;
  approved_date?: string;
  notes?: string;
}
