import { CustomPosition, SystemAdminFeature } from '@/types/permissions';

// Default positions migrated from old enum-based system
export const mockPositions: CustomPosition[] = [
  {
    id: 'pos-ceo',
    position_name: 'ceo',
    display_name: 'CEO (System Admin)',
    visible_features: [
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
      'credential_management',
      'gamification',
      'id_configuration',
      'survey_feedback'
    ],
    description: 'Complete system access and permission management',
    created_at: new Date().toISOString(),
    created_by: 'system',
    is_ceo_position: true
  },
  {
    id: 'pos-md',
    position_name: 'md',
    display_name: 'Managing Director',
    visible_features: [
      'institution_management',
      'officer_management',
      'reports_analytics',
      'leave_approvals',
      'attendance_payroll',
      'task_management',
      'task_allotment',
      'credential_management'
    ],
    description: 'Senior management with oversight access',
    created_at: new Date().toISOString(),
    created_by: 'system'
  },
  {
    id: 'pos-agm',
    position_name: 'agm',
    display_name: 'Assistant General Manager',
    visible_features: [
      'institution_management',
      'course_management',
      'officer_management',
      'reports_analytics',
      'task_management',
      'task_allotment',
      'credential_management',
      'id_configuration'
    ],
    description: 'Operational management access',
    created_at: new Date().toISOString(),
    created_by: 'system'
  },
  {
    id: 'pos-gm',
    position_name: 'gm',
    display_name: 'General Manager',
    visible_features: [
      'institution_management',
      'reports_analytics',
      'leave_approvals',
      'attendance_payroll',
      'task_management',
      'task_allotment',
      'credential_management',
      'gamification'
    ],
    description: 'General management operations',
    created_at: new Date().toISOString(),
    created_by: 'system'
  },
  {
    id: 'pos-manager',
    position_name: 'manager',
    display_name: 'Manager',
    visible_features: [
      'course_management',
      'assessment_management',
      'assignment_management',
      'project_management',
      'task_allotment',
      'gamification'
    ],
    description: 'Academic operations management',
    created_at: new Date().toISOString(),
    created_by: 'system'
  },
  {
    id: 'pos-admin-staff',
    position_name: 'admin_staff',
    display_name: 'Admin Staff',
    visible_features: [
      'officer_management',
      'inventory_management',
      'institutional_calendar',
      'task_allotment',
      'gamification'
    ],
    description: 'Administrative support functions',
    created_at: new Date().toISOString(),
    created_by: 'system'
  }
];

// Position cache for fast lookups
const positionCache = new Map<string, CustomPosition>();
mockPositions.forEach(pos => positionCache.set(pos.id, pos));

export const getPositionById = (id: string): CustomPosition | undefined => {
  return positionCache.get(id);
};

export const getPositionByName = (name: string): CustomPosition | undefined => {
  return mockPositions.find(p => p.position_name === name);
};

export const addPosition = (position: CustomPosition): void => {
  mockPositions.push(position);
  positionCache.set(position.id, position);
};

export const updatePositionInStore = (id: string, position: CustomPosition): void => {
  const index = mockPositions.findIndex(p => p.id === id);
  if (index !== -1) {
    mockPositions[index] = position;
    positionCache.set(id, position);
  }
};

export const deletePositionFromStore = (id: string): void => {
  const index = mockPositions.findIndex(p => p.id === id);
  if (index !== -1) {
    mockPositions.splice(index, 1);
    positionCache.delete(id);
  }
};

export const getAllPositions = (): CustomPosition[] => {
  return mockPositions;
};
