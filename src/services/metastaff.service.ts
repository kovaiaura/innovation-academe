import { User } from '@/types';
import { SystemAdminPosition, SystemAdminFeature } from '@/types/permissions';
import { mockUsers } from '@/data/mockUsers';
import { updatePositionPermissions as updatePermissionsConfig } from '@/data/mockPositionPermissions';

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
    position: SystemAdminPosition;
  }): Promise<User> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newUser: User = {
      id: `meta-${Date.now()}`,
      email: data.email,
      name: data.name,
      role: 'system_admin',
      position: data.position,
      is_ceo: false,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`,
      created_at: new Date().toISOString(),
    };
    
    return newUser;
  },

  updatePosition: async (userId: string, position: SystemAdminPosition): Promise<void> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const user = mockUsers.find(u => u.id === userId);
    if (user) {
      user.position = position;
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

  getPositionPermissions: async (position: SystemAdminPosition): Promise<SystemAdminFeature[]> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const { getPositionPermissions } = await import('@/data/mockPositionPermissions');
    const perms = getPositionPermissions(position);
    return perms[0] === 'ALL' ? [] : perms as SystemAdminFeature[];
  },

  updatePositionPermissions: async (
    position: SystemAdminPosition,
    features: SystemAdminFeature[]
  ): Promise<void> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    updatePermissionsConfig(position, features);
  },
};
