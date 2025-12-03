import { CustomPosition, CreatePositionRequest, UpdatePositionRequest, SystemAdminFeature } from '@/types/permissions';
import { User } from '@/types';
import { 
  loadPositions, 
  savePositions, 
  addPosition, 
  updatePositionInStore, 
  deletePositionFromStore,
  getPositionById 
} from '@/data/mockPositions';
import { loadMetaStaff, getMetaStaffByPosition } from '@/data/mockMetaStaffData';

export const positionService = {
  // Get all positions
  getAllPositions: async (): Promise<CustomPosition[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const positions = loadPositions();
    const metaStaff = loadMetaStaff();
    
    return positions.map(pos => ({
      ...pos,
      user_count: metaStaff.filter(u => u.position_id === pos.id).length
    }));
  },

  // Get position by ID
  getPositionById: async (id: string): Promise<CustomPosition | null> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const position = getPositionById(id);
    if (!position) return null;
    
    const metaStaff = loadMetaStaff();
    return {
      ...position,
      user_count: metaStaff.filter(u => u.position_id === id).length
    };
  },

  // Create new position
  createPosition: async (data: CreatePositionRequest): Promise<CustomPosition> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newPosition: CustomPosition = {
      id: `pos-${Date.now()}`,
      position_name: data.position_name,
      display_name: data.display_name || data.position_name,
      description: data.description || '',
      visible_features: data.visible_features,
      created_at: new Date().toISOString(),
      created_by: 'system',
      user_count: 0,
      is_ceo_position: false
    };
    
    addPosition(newPosition);
    return newPosition;
  },

  // Update existing position
  updatePosition: async (id: string, data: UpdatePositionRequest): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const position = getPositionById(id);
    if (!position) throw new Error('Position not found');
    
    // For CEO position: Allow feature updates but protect essential settings
    if (position.is_ceo_position) {
      // Prevent renaming CEO position
      if (data.position_name && data.position_name !== position.position_name) {
        throw new Error('Cannot rename CEO position');
      }
      
      // Ensure credential_management (Position Management) is always included for CEO
      let features = data.visible_features || position.visible_features;
      if (!features.includes('credential_management')) {
        features = [...features, 'credential_management'];
      }
      
      // Update CEO with protected features
      const updated = {
        ...position,
        display_name: data.display_name || position.display_name,
        description: data.description || position.description,
        visible_features: features
      };
      
      updatePositionInStore(id, updated);
      return;
    }
    
    // For non-CEO positions: Allow full modification
    const updated = {
      ...position,
      position_name: data.position_name || position.position_name,
      display_name: data.display_name || position.display_name,
      description: data.description || position.description,
      visible_features: data.visible_features || position.visible_features
    };
    
    updatePositionInStore(id, updated);
  },

  // Delete position
  deletePosition: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const position = getPositionById(id);
    if (!position) throw new Error('Position not found');
    
    if (position.is_ceo_position) {
      throw new Error('Cannot delete CEO position');
    }
    
    // Check if any users are assigned
    const usersWithPosition = getMetaStaffByPosition(id);
    if (usersWithPosition.length > 0) {
      throw new Error(`Cannot delete position with ${usersWithPosition.length} assigned users`);
    }
    
    deletePositionFromStore(id);
  },

  // Get users by position
  getUsersByPosition: async (positionId: string): Promise<User[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const users = getMetaStaffByPosition(positionId);
    return users.map(({ password, ...user }) => user as User);
  },

  // Assign user to position
  assignUserToPosition: async (userId: string, positionId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const { updateMetaStaffUser, getMetaStaffById } = await import('@/data/mockMetaStaffData');
    
    const user = getMetaStaffById(userId);
    if (!user) throw new Error('User not found');
    
    const position = getPositionById(positionId);
    if (!position) throw new Error('Position not found');
    
    updateMetaStaffUser(userId, {
      position_id: positionId,
      position_name: position.position_name,
    });
  },

  // Get position features (for permission checking)
  getPositionFeatures: async (positionId: string): Promise<SystemAdminFeature[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const position = getPositionById(positionId);
    return position?.visible_features || [];
  }
};
