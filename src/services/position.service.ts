import { CustomPosition, CreatePositionRequest, UpdatePositionRequest, SystemAdminFeature } from '@/types/permissions';
import { User } from '@/types';
import { mockPositions, addPosition, updatePositionInStore, deletePositionFromStore } from '@/data/mockPositions';
import { mockUsers } from '@/data/mockUsers';

export const positionService = {
  // Get all positions
  getAllPositions: async (): Promise<CustomPosition[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockPositions.map(pos => ({
      ...pos,
      user_count: mockUsers.filter(u => u.position_id === pos.id).length
    }));
  },

  // Get position by ID
  getPositionById: async (id: string): Promise<CustomPosition | null> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const position = mockPositions.find(p => p.id === id);
    if (!position) return null;
    
    return {
      ...position,
      user_count: mockUsers.filter(u => u.position_id === id).length
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
    
    const position = mockPositions.find(p => p.id === id);
    if (!position) throw new Error('Position not found');
    
    if (position.is_ceo_position) {
      throw new Error('Cannot modify CEO position');
    }
    
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
    
    const position = mockPositions.find(p => p.id === id);
    if (!position) throw new Error('Position not found');
    
    if (position.is_ceo_position) {
      throw new Error('Cannot delete CEO position');
    }
    
    // Check if any users are assigned
    const usersWithPosition = mockUsers.filter(u => u.position_id === id);
    if (usersWithPosition.length > 0) {
      throw new Error(`Cannot delete position with ${usersWithPosition.length} assigned users`);
    }
    
    deletePositionFromStore(id);
  },

  // Get users by position
  getUsersByPosition: async (positionId: string): Promise<User[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return mockUsers
      .filter(u => u.position_id === positionId)
      .map(({ password, ...user }: any) => user);
  },

  // Assign user to position
  assignUserToPosition: async (userId: string, positionId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const user = mockUsers.find(u => u.id === userId);
    if (!user) throw new Error('User not found');
    
    const position = mockPositions.find(p => p.id === positionId);
    if (!position) throw new Error('Position not found');
    
    user.position_id = positionId;
    user.position_name = position.position_name;
  },

  // Get position features (for permission checking)
  getPositionFeatures: async (positionId: string): Promise<SystemAdminFeature[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const position = mockPositions.find(p => p.id === positionId);
    return position?.visible_features || [];
  }
};
