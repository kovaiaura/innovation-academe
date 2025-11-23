import { User } from '@/types';
import { SystemAdminFeature } from '@/types/permissions';
import { mockUsers } from '@/data/mockUsers';
import { getPositionById } from '@/data/mockPositions';

export const metaStaffService = {
  getMetaStaff: async (): Promise<User[]> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return mockUsers
      .filter(u => u.role === 'system_admin')
      .map(({ password, ...user }: any) => user);
  },

  createMetaStaff: async (data: {
    name: string;
    email: string;
    position_id: string;
    custom_password?: string;
  }): Promise<{ user: User; password: string }> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Get position details
    const position = getPositionById(data.position_id);
    if (!position) throw new Error('Position not found');
    
    // Use custom password if provided, otherwise generate random
    const tempPassword = data.custom_password || `Meta${Math.random().toString(36).slice(-8).toUpperCase()}!`;
    
    const newUser: any = {
      id: `meta-${Date.now()}`,
      email: data.email,
      name: data.name,
      role: 'system_admin',
      position_id: data.position_id,
      position_name: position.position_name,
      is_ceo: position.is_ceo_position || false,
      password: tempPassword,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`,
      created_at: new Date().toISOString(),
    };
    
    // Add to mockUsers array so they can login
    mockUsers.push(newUser);
    
    // Return user without password field and the password separately
    const { password, ...userWithoutPassword } = newUser;
    return { user: userWithoutPassword, password: tempPassword };
  },

  updatePosition: async (userId: string, position_id: string): Promise<void> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const position = getPositionById(position_id);
    if (!position) throw new Error('Position not found');
    
    const user = mockUsers.find(u => u.id === userId);
    if (user) {
      user.position_id = position_id;
      user.position_name = position.position_name;
    }
  },

  deleteMetaStaff: async (userId: string): Promise<void> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = mockUsers.findIndex(u => u.id === userId);
    if (index !== -1) {
      mockUsers.splice(index, 1);
    }
  },

  getPositionPermissions: async (position_id: string): Promise<SystemAdminFeature[]> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const position = getPositionById(position_id);
    return position?.visible_features || [];
  },

  updatePositionPermissions: async (
    position_id: string,
    features: SystemAdminFeature[]
  ): Promise<void> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const { updatePositionInStore } = await import('@/data/mockPositions');
    const { getPositionById } = await import('@/data/mockPositions');
    
    const position = getPositionById(position_id);
    if (position) {
      updatePositionInStore(position_id, {
        ...position,
        visible_features: features
      });
    }
  },

  resetPassword: async (userId: string): Promise<string> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Generate new random password
    const newPassword = `Meta${Math.random().toString(36).slice(-8).toUpperCase()}!`;
    
    const user = mockUsers.find(u => u.id === userId);
    if (user) {
      (user as any).password = newPassword;
    }
    
    return newPassword;
  },
};
