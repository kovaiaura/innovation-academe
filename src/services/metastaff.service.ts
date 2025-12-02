import { User } from '@/types';
import { SystemAdminFeature } from '@/types/permissions';
import { 
  loadMetaStaff, 
  addMetaStaffUser, 
  updateMetaStaffUser, 
  deleteMetaStaffUser,
  updateMetaStaffPassword,
  generateTemporaryPassword,
  MetaStaffUser
} from '@/data/mockMetaStaffData';
import { getPositionById, updatePositionInStore } from '@/data/mockPositions';

export const metaStaffService = {
  getMetaStaff: async (): Promise<User[]> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const staff = loadMetaStaff();
    return staff
      .filter(u => u.role === 'system_admin')
      .map(({ password, ...user }) => user as User);
  },

  createMetaStaff: async (data: {
    name: string;
    email: string;
    position_id: string;
    custom_password?: string;
    // Leave allowances
    casual_leave?: number;
    sick_leave?: number;
    earned_leave?: number;
  }): Promise<{ user: User; password: string }> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Get position details
    const position = getPositionById(data.position_id);
    if (!position) throw new Error('Position not found');
    
    // Use custom password if provided, otherwise generate random
    const tempPassword = data.custom_password || generateTemporaryPassword();
    
    const newUser: MetaStaffUser = {
      id: `meta-${Date.now()}`,
      email: data.email,
      name: data.name,
      role: 'system_admin',
      position_id: data.position_id,
      position_name: position.position_name,
      is_ceo: position.is_ceo_position || false,
      password: tempPassword,
      must_change_password: true,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`,
      created_at: new Date().toISOString(),
      hourly_rate: 300, // Default hourly rate
      overtime_rate_multiplier: 1.5,
      normal_working_hours: 8,
    };
    
    // Add to localStorage
    addMetaStaffUser(newUser);
    
    // Initialize leave balance for new meta staff
    const { initializeLeaveBalance } = await import('@/data/mockLeaveData');
    initializeLeaveBalance({
      officer_id: newUser.id,
      casual_leave: data.casual_leave ?? 12,
      sick_leave: data.sick_leave ?? 10,
      earned_leave: data.earned_leave ?? 15,
      year: new Date().getFullYear().toString(),
    });
    
    // Return user without password field and the password separately
    const { password, ...userWithoutPassword } = newUser;
    return { user: userWithoutPassword as User, password: tempPassword };
  },

  updatePosition: async (userId: string, position_id: string): Promise<void> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const position = getPositionById(position_id);
    if (!position) throw new Error('Position not found');
    
    updateMetaStaffUser(userId, {
      position_id: position_id,
      position_name: position.position_name,
    });
  },

  deleteMetaStaff: async (userId: string): Promise<void> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    deleteMetaStaffUser(userId);
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
    const newPassword = generateTemporaryPassword();
    
    // Update password in localStorage
    updateMetaStaffPassword(userId, newPassword, true);
    
    return newPassword;
  },

  setPassword: async (userId: string, password: string): Promise<void> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Update password in localStorage
    updateMetaStaffPassword(userId, password, true);
  },

  // Get a single meta staff user by ID
  getMetaStaffById: async (userId: string): Promise<User | null> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const { getMetaStaffById } = await import('@/data/mockMetaStaffData');
    const user = getMetaStaffById(userId);
    
    if (!user) return null;
    
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  },

  // Update meta staff user details
  updateMetaStaff: async (userId: string, updates: Partial<User>): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    updateMetaStaffUser(userId, updates);
  },
};
