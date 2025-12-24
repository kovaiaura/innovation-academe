import { User, hasAnyRole } from '@/types';
import { SystemAdminFeature } from '@/types/permissions';
import { getPositionById } from '@/data/mockPositions';

// Position cache to avoid repeated lookups
const positionFeaturesCache = new Map<string, SystemAdminFeature[]>();

// Keep cache in sync with positions storage version
const POSITIONS_VERSION_KEY = 'meta_positions_version';
let cachedPositionsVersion: string | null = null;

const ensurePositionCacheFresh = () => {
  try {
    const current = localStorage.getItem(POSITIONS_VERSION_KEY);
    if (cachedPositionsVersion !== current) {
      positionFeaturesCache.clear();
      cachedPositionsVersion = current;
    }
  } catch {
    // If localStorage is unavailable, just keep the in-memory cache as-is
  }
};

const ALL_SYSTEM_ADMIN_FEATURES: SystemAdminFeature[] = [
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
  'survey_feedback',
  'performance_ratings',
];

export const canAccessFeature = (user: User | null, feature: SystemAdminFeature): boolean => {
  ensurePositionCacheFresh();

  if (!user) return false;

  // Super admins can access all system admin features
  if (hasAnyRole(user, ['super_admin'])) return true;

  // Only system admins have position-based feature access
  if (!hasAnyRole(user, ['system_admin'])) return false;

  // Check position permissions
  if (!user.position_id) return false;

  // Check cache first
  if (positionFeaturesCache.has(user.position_id)) {
    const features = positionFeaturesCache.get(user.position_id)!;
    return features.includes(feature);
  }

  // Lookup position
  const position = getPositionById(user.position_id);
  if (!position) return false;

  // Cache the features
  positionFeaturesCache.set(user.position_id, position.visible_features);

  // Check specific feature
  return position.visible_features.includes(feature);
};

export const getAccessibleFeatures = (user: User | null): SystemAdminFeature[] => {
  ensurePositionCacheFresh();

  if (!user) return [];

  // Super admins can access all system admin features
  if (hasAnyRole(user, ['super_admin'])) return ALL_SYSTEM_ADMIN_FEATURES;

  if (!hasAnyRole(user, ['system_admin'])) return [];

  if (!user.position_id) return [];

  // Check cache first
  if (positionFeaturesCache.has(user.position_id)) {
    return positionFeaturesCache.get(user.position_id)!;
  }

  const position = getPositionById(user.position_id);
  if (!position) return [];

  // Cache and return
  positionFeaturesCache.set(user.position_id, position.visible_features);
  return position.visible_features;
};

export const isCEO = (user: User | null): boolean => {
  if (!user) return false;

  // Super admins should be treated as having CEO-level visibility
  if (hasAnyRole(user, ['super_admin'])) return true;

  if (!hasAnyRole(user, ['system_admin'])) return false;

  // Check is_ceo flag or position
  if (user.is_ceo === true) return true;

  // Check if position is CEO position
  if (user.position_id) {
    const position = getPositionById(user.position_id);
    return position?.is_ceo_position === true;
  }

  return false;
};

// Clear cache (useful when positions are updated)
export const clearPositionCache = () => {
  positionFeaturesCache.clear();
  cachedPositionsVersion = null;
};

