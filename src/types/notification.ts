export type NotificationType = 
  | 'assignment_submission' 
  | 'quiz_completion' 
  | 'project_update'
  | 'certificate_issued'
  | 'grade_received'
  | 'event_application_submitted'
  | 'event_application_reviewed'
  | 'event_published'
  | 'event_reminder'
  | 'leave_application_submitted'
  | 'leave_application_cancelled'
  | 'leave_application_approved'
  | 'leave_application_rejected';

export interface Notification {
  id: string;
  recipient_id: string;
  recipient_role: 'officer' | 'student' | 'system_admin';
  type: NotificationType;
  title: string;
  message: string;
  link: string;
  metadata?: {
    assignment_id?: string;
    student_id?: string;
    submission_id?: string;
    quiz_id?: string;
    course_id?: string;
    leave_application_id?: string;
    officer_id?: string;
    officer_name?: string;
    leave_type?: string;
    start_date?: string;
    end_date?: string;
    total_days?: number;
    [key: string]: any;
  };
  read: boolean;
  created_at: string;
}
