import { InstitutionClass } from './student';

// Period Configuration
export interface PeriodConfig {
  id: string;
  institution_id: string;
  label: string;
  start_time: string;  // '08:00'
  end_time: string;    // '08:45'
  is_break: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// Timetable Assignment
export interface InstitutionTimetableAssignment {
  id: string;
  institution_id: string;
  academic_year: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  period_id: string;
  class_id: string;
  class_name: string;
  subject: string;
  teacher_id?: string;
  teacher_name?: string;
  room?: string;
  created_at: string;
  updated_at: string;
}

// Report Options
export interface ReportOptions {
  report_type: 'enrollment' | 'attendance' | 'performance' | 'staff_utilization' | 'comprehensive';
  date_range: {
    start: Date;
    end: Date;
  };
  format: 'pdf' | 'excel' | 'csv';
  sections?: string[];
  email_to?: string;
}

// Analytics Data
export interface InstitutionAnalytics {
  institution_id: string;
  period: string;
  student_metrics: {
    total_students: number;
    active_students: number;
    new_enrollments: number;
    attendance_rate: number;
    dropout_rate: number;
    gender_distribution: {
      male: number;
      female: number;
      other: number;
    };
  };
  academic_metrics: {
    average_grade: number;
    top_performing_class: string;
    students_needing_attention: number;
    subject_performance: Array<{
      subject: string;
      average_score: number;
    }>;
  };
  staff_metrics: {
    total_officers: number;
    officer_utilization_rate: number;
    staff_attendance_rate: number;
    teacher_student_ratio: string;
  };
  operational_metrics: {
    total_classes: number;
    lab_utilization: number;
    event_participation_rate: number;
    project_completion_rate: number;
  };
}

// Officer Assignment
export interface OfficerAssignment {
  officer_id: string;
  officer_name: string;
  employee_id: string;
  email: string;
  phone: string;
  avatar?: string;
  assigned_date: string;
  total_courses: number;
  total_teaching_hours: number;
  status: 'active' | 'inactive';
}
