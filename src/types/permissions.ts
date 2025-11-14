import { UserRole } from './index';

export type SystemAdminPosition = 
  | 'ceo'           // Full access, can configure permissions
  | 'manager'       // Meta staff
  | 'admin_staff'   // Meta staff
  | 'agm'          // Meta staff (Assistant General Manager)
  | 'md'           // Meta staff (Managing Director)
  | 'gm';          // Meta staff (General Manager)

export type SystemAdminFeature = 
  | 'institution_management'
  | 'course_management'
  | 'assessment_management'
  | 'assignment_management'
  | 'event_management'
  | 'officer_management'
  | 'project_management'
  | 'inventory_management'
  | 'attendance_payroll'
  | 'leave_approvals'
  | 'institutional_calendar'
  | 'reports_analytics';

export interface PositionPermissions {
  position: SystemAdminPosition;
  display_name: string;
  allowed_features: SystemAdminFeature[] | ['ALL'];
  description: string;
}

export interface PermissionsConfig {
  [key: string]: SystemAdminFeature[]; // key = position
}
