import { User } from '@/types';
import { SystemAdminFeature } from '@/types/permissions';
import { getPositionPermissions } from '@/data/mockPositionPermissions';

export const canAccessFeature = (user: User | null, feature: SystemAdminFeature): boolean => {
  if (!user || user.role !== 'system_admin') return false;
  
  // Check position permissions
  if (!user.position) return false;
  
  const permissions = getPositionPermissions(user.position);
  
  // Check if it's the ALL permission
  if (permissions[0] === 'ALL') return true;
  
  // Check specific feature
  return (permissions as SystemAdminFeature[]).includes(feature);
};

export const getAccessibleFeatures = (user: User | null): SystemAdminFeature[] | ['ALL'] => {
  if (!user || user.role !== 'system_admin') return [];
  
  if (!user.position) return [];
  
  return getPositionPermissions(user.position) as SystemAdminFeature[];
};

export const isCEO = (user: User | null): boolean => {
  return user?.is_ceo === true || user?.position === 'ceo';
};
