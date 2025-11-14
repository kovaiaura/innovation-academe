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
  }): Promise<{ user: User; password: string }> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Generate random temporary password
    const tempPassword = `Meta${Math.random().toString(36).slice(-8).toUpperCase()}!`;
    
    const newUser: any = {
      id: `meta-${Date.now()}`,
      email: data.email,
      name: data.name,
      role: 'system_admin',
      position: data.position,
      is_ceo: false,
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
