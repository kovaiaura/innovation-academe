import { User } from '@/types';
import { SystemAdminFeature } from '@/types/permissions';
import { getPositionById } from '@/data/mockPositions';

// Position cache to avoid repeated lookups
const positionFeaturesCache = new Map<string, SystemAdminFeature[]>();

export const canAccessFeature = (user: User | null, feature: SystemAdminFeature): boolean => {
  if (!user || user.role !== 'system_admin') return false;
  
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
  if (!user || user.role !== 'system_admin') return [];
  
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
  if (!user || user.role !== 'system_admin') return false;
  
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
};
