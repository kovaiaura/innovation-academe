export type NotificationType = 
  | 'assignment_submission' 
  | 'quiz_completion' 
  | 'project_update'
  | 'certificate_issued'
  | 'grade_received'
  | 'event_application_submitted'
  | 'event_application_reviewed'
  | 'event_published'
  | 'event_reminder';

export interface Notification {
  id: string;
  recipient_id: string;
  recipient_role: 'officer' | 'student';
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
    [key: string]: any;
  };
  read: boolean;
  created_at: string;
}
