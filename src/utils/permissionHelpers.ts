import { User, hasAnyRole } from '@/types';
import { SystemAdminFeature, ALL_SYSTEM_ADMIN_FEATURES } from '@/types/permissions';

/**
 * Check if user can access a specific feature.
 * Uses user.allowed_features which is populated at login time from the database.
 */
export const canAccessFeature = (user: User | null, feature: SystemAdminFeature): boolean => {
  if (!user) return false;

  // Super admins can access all system admin features
  if (hasAnyRole(user, ['super_admin'])) return true;

  // CEOs can access all features
  if (user.is_ceo === true) return true;

  // Only system admins have position-based feature access
  if (!hasAnyRole(user, ['system_admin'])) return false;

  // Check allowed_features from user object (populated at login from database)
  if (!user.allowed_features || user.allowed_features.length === 0) return false;

  return user.allowed_features.includes(feature);
};

/**
 * Get all features the user can access.
 * Uses user.allowed_features which is populated at login time from the database.
 */
export const getAccessibleFeatures = (user: User | null): SystemAdminFeature[] => {
  if (!user) return [];

  // Super admins can access all system admin features
  if (hasAnyRole(user, ['super_admin'])) return ALL_SYSTEM_ADMIN_FEATURES;

  // CEOs can access all features
  if (user.is_ceo === true) return ALL_SYSTEM_ADMIN_FEATURES;

  // Only system admins have feature access
  if (!hasAnyRole(user, ['system_admin'])) return [];

  // Return allowed_features from user object
  return user.allowed_features || [];
};

/**
 * Check if user is CEO (has complete system access)
 */
export const isCEO = (user: User | null): boolean => {
  if (!user) return false;

  // Super admins should be treated as having CEO-level visibility
  if (hasAnyRole(user, ['super_admin'])) return true;

  if (!hasAnyRole(user, ['system_admin'])) return false;

  // Check is_ceo flag
  return user.is_ceo === true;
};

// No cache needed - features are stored on user object at login time
export const clearPositionCache = () => {
  // No-op: kept for backward compatibility but no longer needed
};
