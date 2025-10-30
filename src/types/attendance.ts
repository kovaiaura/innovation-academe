export type AttendanceStatus = 'present' | 'absent' | 'leave';
export type LeaveType = 'sick' | 'casual' | 'earned';
export type PayrollStatus = 'draft' | 'pending' | 'approved' | 'forwarded' | 'paid';

// Salary Component Types
export type SalaryComponentType = 
  | 'basic_pay' 
  | 'hra' 
  | 'da' 
  | 'transport_allowance' 
  | 'special_allowance' 
  | 'medical_allowance' 
  | 'overtime' 
  | 'bonus' 
  | 'incentive';

export type DeductionType = 
  | 'pf' 
  | 'esi' 
  | 'tds' 
  | 'professional_tax' 
  | 'loan' 
  | 'advance' 
  | 'other';

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

// Salary Component
export interface SalaryComponent {
  component_type: SalaryComponentType;
  amount: number;
  is_taxable: boolean;
  calculation_type: 'fixed' | 'percentage' | 'computed';
  percentage_of?: 'basic_pay' | 'gross_salary';
  percentage?: number;
}

// Deduction
export interface Deduction {
  deduction_type: DeductionType;
  amount: number;
  calculation_type: 'fixed' | 'percentage' | 'statutory';
  percentage?: number;
  notes?: string;
}

// Statutory Information
export interface StatutoryInfo {
  pf_number?: string;
  uan_number?: string;
  esi_number?: string;
  pan_number?: string;
  pt_registration?: string;
  pf_applicable: boolean;
  esi_applicable: boolean;
  pt_applicable: boolean;
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

// Enhanced PayrollRecord
export interface PayrollRecord {
  officer_id: string;
  officer_name: string;
  employee_id: string;
  month: string;
  year: number;
  
  // Attendance-based
  working_days: number;
  days_present: number;
  days_absent: number;
  days_leave: number;
  
  // Salary Components
  salary_components: SalaryComponent[];
  total_earnings: number;
  
  // Deductions
  deductions: Deduction[];
  total_deductions: number;
  
  // Final Amounts
  gross_salary: number;
  net_pay: number;
  
  // Legacy fields for backward compatibility
  salary_monthly?: number;
  calculated_pay?: number;
  
  // Statutory Compliance
  pf_employee: number;
  pf_employer: number;
  esi_employee: number;
  esi_employer: number;
  tds: number;
  professional_tax: number;
  
  // Workflow
  status: PayrollStatus;
  approved_by?: string;
  approved_date?: string;
  paid_date?: string;
  payment_mode?: 'bank_transfer' | 'cash' | 'cheque';
  payment_reference?: string;
  notes?: string;
}

// Payslip Interface
export interface Payslip {
  id: string;
  payroll_record: PayrollRecord;
  generated_date: string;
  pdf_url?: string;
  emailed_to?: string;
  email_sent_date?: string;
}

// Overtime Record
export interface OvertimeRecord {
  officer_id: string;
  date: string;
  hours: number;
  rate_per_hour: number;
  total_amount: number;
  approved: boolean;
  approved_by?: string;
  notes?: string;
}

// Loan Record
export interface LoanRecord {
  id: string;
  officer_id: string;
  loan_type: 'advance' | 'personal' | 'housing' | 'education';
  principal_amount: number;
  outstanding_amount: number;
  monthly_deduction: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'closed';
}

// Leave Application
export interface LeaveApplication {
  id: string;
  officer_id: string;
  officer_name: string;
  institution_id?: string;
  institution_name?: string;
  start_date: string; // "2025-10-30"
  end_date: string; // "2025-11-01"
  leave_type: LeaveType;
  reason: string;
  total_days: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  applied_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  admin_comments?: string;
}

// Leave Balance
export interface LeaveBalance {
  officer_id: string;
  sick_leave: number;
  casual_leave: number;
  earned_leave: number;
  year: string; // "2025"
}
