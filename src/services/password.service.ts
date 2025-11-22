import { toast } from 'sonner';

export const passwordService = {
  // Admin manually sets password
  setPassword: async (userId: string, password: string, userType: string): Promise<void> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    // In real implementation: POST /api/admin/set-password
    console.log(`Password set for user ${userId} (${userType})`);
  },

  // Admin sends reset link to user email
  sendResetLink: async (email: string, userName: string, userType: string): Promise<void> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Generate mock reset token
    const token = `reset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const resetLink = `${window.location.origin}/reset-password?token=${token}`;
    
    console.log('📧 Password Reset Email Simulation');
    console.log('To:', email);
    console.log('User:', userName);
    console.log('Type:', userType);
    console.log('Subject: Password Reset Request');
    console.log('Reset Link:', resetLink);
    console.log('Token expires in: 1 hour');
    
    // In development, show a toast with the link
    toast.success(`Reset link sent to ${email}`, { duration: 3000 });
    toast.info(`DEV MODE: ${resetLink}`, { duration: 10000 });
  },

  // User requests reset link (from login page)
  requestPasswordReset: async (email: string): Promise<void> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    // In real implementation: POST /api/auth/forgot-password
    toast.success('If an account exists, you will receive a reset link');
  },

  // User resets password using token from email
  resetPasswordWithToken: async (token: string, newPassword: string): Promise<void> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    // In real implementation: POST /api/auth/reset-password
    console.log('Password reset with token:', token);
  },

  // Generate strong random password
  generateStrongPassword: (): string => {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    // Ensure at least one of each required character type
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    password += '0123456789'[Math.floor(Math.random() * 10)];
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)];
    // Fill remaining with random characters
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
};
