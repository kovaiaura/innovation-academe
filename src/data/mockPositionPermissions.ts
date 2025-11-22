import { SystemAdminFeature, SystemAdminPosition, PositionPermissions, PermissionsConfig } from '@/types/permissions';

export const defaultPositionPermissions: PositionPermissions[] = [
  {
    position: 'ceo',
    display_name: 'CEO (System Admin)',
    allowed_features: [
      'institution_management',
      'course_management',
      'assessment_management',
      'assignment_management',
      'event_management',
      'officer_management',
      'project_management',
      'inventory_management',
      'attendance_payroll',
      'leave_approvals',
      'institutional_calendar',
      'reports_analytics',
      'sdg_management',
      'task_management',
      'task_allotment',
      'credential_management'
    ],
    description: 'Complete system access and permission management'
  },
  {
    position: 'md',
    display_name: 'Managing Director',
    allowed_features: [
      'institution_management',
      'officer_management',
      'reports_analytics',
      'leave_approvals',
      'attendance_payroll',
      'task_management',
      'task_allotment',
      'credential_management'
    ],
    description: 'Senior management with oversight access'
  },
  {
    position: 'agm',
    display_name: 'Assistant General Manager',
    allowed_features: [
      'institution_management',
      'course_management',
      'officer_management',
      'reports_analytics',
      'task_management',
      'task_allotment',
      'credential_management'
    ],
    description: 'Operational management access'
  },
  {
    position: 'gm',
    display_name: 'General Manager',
    allowed_features: [
      'institution_management',
      'reports_analytics',
      'leave_approvals',
      'attendance_payroll',
      'task_management',
      'task_allotment',
      'credential_management'
    ],
    description: 'General management operations'
  },
  {
    position: 'manager',
    display_name: 'Manager',
    allowed_features: [
      'course_management',
      'assessment_management',
      'assignment_management',
      'project_management',
      'task_allotment'
    ],
    description: 'Academic operations management'
  },
  {
    position: 'admin_staff',
    display_name: 'Admin Staff',
    allowed_features: [
      'officer_management',
      'inventory_management',
      'institutional_calendar',
      'task_allotment'
    ],
    description: 'Administrative support functions'
  }
];

// Store current permissions configuration
let permissionsConfig: PermissionsConfig = {
  ceo: defaultPositionPermissions.find(p => p.position === 'ceo')!.allowed_features as SystemAdminFeature[],
  md: defaultPositionPermissions.find(p => p.position === 'md')!.allowed_features as SystemAdminFeature[],
  agm: defaultPositionPermissions.find(p => p.position === 'agm')!.allowed_features as SystemAdminFeature[],
  gm: defaultPositionPermissions.find(p => p.position === 'gm')!.allowed_features as SystemAdminFeature[],
  manager: defaultPositionPermissions.find(p => p.position === 'manager')!.allowed_features as SystemAdminFeature[],
  admin_staff: defaultPositionPermissions.find(p => p.position === 'admin_staff')!.allowed_features as SystemAdminFeature[],
};

export const getPositionPermissions = (position: SystemAdminPosition): SystemAdminFeature[] | ['ALL'] => {
  return permissionsConfig[position] || [];
};

export const updatePositionPermissions = (position: SystemAdminPosition, features: SystemAdminFeature[]) => {
  permissionsConfig[position] = features;
};

export const getAllPositions = () => defaultPositionPermissions;

export const getPositionDisplayName = (position: SystemAdminPosition): string => {
  const positionData = defaultPositionPermissions.find(p => p.position === position);
  return positionData?.display_name || position;
};
