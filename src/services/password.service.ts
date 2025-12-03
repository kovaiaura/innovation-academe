import { toast } from 'sonner';

// Types for password management
export interface PasswordResetToken {
  token: string;
  email: string;
  user_id: string;
  user_type: 'meta_staff' | 'officer' | 'institution' | 'student';
  created_at: string;
  expires_at: string;
  used: boolean;
}

export interface PasswordChangeLog {
  id: string;
  user_id: string;
  user_email: string;
  action: 'password_changed' | 'reset_requested' | 'reset_completed';
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
}

// localStorage keys
const RESET_TOKENS_KEY = 'password_reset_tokens';
const CHANGE_LOGS_KEY = 'password_change_logs';
const USER_PASSWORDS_KEY = 'user_passwords'; // For mock password storage

// Helper functions for localStorage persistence
const loadResetTokens = (): PasswordResetToken[] => {
  const stored = localStorage.getItem(RESET_TOKENS_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveResetTokens = (tokens: PasswordResetToken[]) => {
  localStorage.setItem(RESET_TOKENS_KEY, JSON.stringify(tokens));
};

const loadChangeLogs = (): PasswordChangeLog[] => {
  const stored = localStorage.getItem(CHANGE_LOGS_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveChangeLogs = (logs: PasswordChangeLog[]) => {
  localStorage.setItem(CHANGE_LOGS_KEY, JSON.stringify(logs));
};

const loadUserPasswords = (): Record<string, string> => {
  const stored = localStorage.getItem(USER_PASSWORDS_KEY);
  return stored ? JSON.parse(stored) : {};
};

const saveUserPasswords = (passwords: Record<string, string>) => {
  localStorage.setItem(USER_PASSWORDS_KEY, JSON.stringify(passwords));
};

export const passwordService = {
  // Verify current password
  verifyCurrentPassword: async (userId: string, currentPassword: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const passwords = loadUserPasswords();
    const storedPassword = passwords[userId];
    
    // If no stored password, accept any password (first-time setup scenario)
    if (!storedPassword) {
      return true;
    }
    
    return storedPassword === currentPassword;
    
    // Backend API: POST /api/auth/verify-password
    // Body: { userId, currentPassword }
    // Returns: { valid: boolean }
  },

  // Change password (requires current password verification)
  changePassword: async (userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Verify current password
    const isValid = await passwordService.verifyCurrentPassword(userId, currentPassword);
    if (!isValid) {
      return { success: false, error: 'Current password is incorrect' };
    }
    
    // Save new password
    const passwords = loadUserPasswords();
    passwords[userId] = newPassword;
    saveUserPasswords(passwords);
    
    // Log the change
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    passwordService.logPasswordChange(userId, user.email || 'unknown', 'password_changed');
    
    // Update user's password_changed flag
    if (user.id === userId) {
      user.password_changed = true;
      user.must_change_password = false;
      user.password_changed_at = new Date().toISOString();
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    return { success: true };
    
    // Backend API: POST /api/auth/change-password
    // Body: { userId, currentPassword, newPassword }
    // Returns: { success: boolean, error?: string }
  },

  // Set password for first-time login (no current password verification needed)
  setUserPassword: async (userId: string, newPassword: string): Promise<{ success: boolean }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const passwords = loadUserPasswords();
    passwords[userId] = newPassword;
    saveUserPasswords(passwords);
    
    // Log the change
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    passwordService.logPasswordChange(userId, user.email || 'unknown', 'password_changed');
    
    return { success: true };
    
    // Backend API: POST /api/auth/set-password (for forced change)
    // Body: { userId, newPassword }
  },

  // Admin manually sets password for a user
  setPassword: async (userId: string, password: string, userType: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const passwords = loadUserPasswords();
    passwords[userId] = password;
    saveUserPasswords(passwords);
    
    console.log(`Password set for user ${userId} (${userType})`);
    
    // Backend API: POST /api/admin/set-password
    // Body: { userId, password, userType }
  },

  // Generate reset token
  generateResetToken: (userId: string, email: string, userType: 'meta_staff' | 'officer' | 'institution' | 'student'): string => {
    const token = `reset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry
    
    const resetToken: PasswordResetToken = {
      token,
      email,
      user_id: userId,
      user_type: userType,
      created_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      used: false,
    };
    
    const tokens = loadResetTokens();
    // Remove any existing tokens for this user
    const filteredTokens = tokens.filter(t => t.user_id !== userId);
    filteredTokens.push(resetToken);
    saveResetTokens(filteredTokens);
    
    return token;
  },

  // Validate reset token
  validateResetToken: (token: string): { valid: boolean; email?: string; userId?: string; error?: string } => {
    const tokens = loadResetTokens();
    const resetToken = tokens.find(t => t.token === token);
    
    if (!resetToken) {
      return { valid: false, error: 'Invalid or expired reset token' };
    }
    
    if (resetToken.used) {
      return { valid: false, error: 'This reset link has already been used' };
    }
    
    if (new Date() > new Date(resetToken.expires_at)) {
      return { valid: false, error: 'Reset token has expired' };
    }
    
    return { valid: true, email: resetToken.email, userId: resetToken.user_id };
    
    // Backend API: GET /api/auth/validate-token?token=xxx
    // Returns: { valid: boolean, email?: string, userId?: string, error?: string }
  },

  // Admin sends reset link to user email
  sendResetLink: async (email: string, userName: string, userType: string, userId?: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Generate reset token
    const token = passwordService.generateResetToken(
      userId || `user_${Date.now()}`,
      email,
      userType as 'meta_staff' | 'officer' | 'institution' | 'student'
    );
    
    const resetLink = `${window.location.origin}/reset-password?token=${token}`;
    
    console.log('📧 Password Reset Email Simulation');
    console.log('To:', email);
    console.log('User:', userName);
    console.log('Type:', userType);
    console.log('Subject: Password Reset Request');
    console.log('Reset Link:', resetLink);
    console.log('Token expires in: 1 hour');
    
    // Log the reset request
    passwordService.logPasswordChange(userId || 'unknown', email, 'reset_requested');
    
    // In development, show a toast with the link
    toast.success(`Reset link sent to ${email}`, { duration: 3000 });
    toast.info(`DEV MODE: ${resetLink}`, { duration: 10000 });
    
    // Backend API: POST /api/auth/send-reset-link
    // Body: { email, userName, userType, userId }
  },

  // User requests reset link (from login page)
  requestPasswordReset: async (email: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // In real implementation, lookup user by email and generate token
    const token = passwordService.generateResetToken(
      `user_${Date.now()}`,
      email,
      'meta_staff'
    );
    
    const resetLink = `${window.location.origin}/reset-password?token=${token}`;
    
    console.log('📧 Self-service Password Reset');
    console.log('Email:', email);
    console.log('Reset Link:', resetLink);
    
    toast.success('If an account exists, you will receive a reset link');
    toast.info(`DEV MODE: ${resetLink}`, { duration: 10000 });
    
    // Backend API: POST /api/auth/forgot-password
    // Body: { email }
  },

  // User resets password using token from email
  resetPasswordWithToken: async (token: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const validation = passwordService.validateResetToken(token);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    
    // Update the password
    const passwords = loadUserPasswords();
    passwords[validation.userId!] = newPassword;
    saveUserPasswords(passwords);
    
    // Mark token as used
    const tokens = loadResetTokens();
    const updatedTokens = tokens.map(t => 
      t.token === token ? { ...t, used: true } : t
    );
    saveResetTokens(updatedTokens);
    
    // Log the reset completion
    passwordService.logPasswordChange(validation.userId!, validation.email!, 'reset_completed');
    
    console.log('Password reset completed for:', validation.email);
    
    return { success: true };
    
    // Backend API: POST /api/auth/reset-password
    // Body: { token, newPassword }
    // Returns: { success: boolean, error?: string }
  },

  // Log password change for audit trail
  logPasswordChange: (userId: string, email: string, action: PasswordChangeLog['action']) => {
    const log: PasswordChangeLog = {
      id: `log_${Date.now()}`,
      user_id: userId,
      user_email: email,
      action,
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
    };
    
    const logs = loadChangeLogs();
    logs.unshift(log);
    // Keep only last 1000 logs
    saveChangeLogs(logs.slice(0, 1000));
    
    // Backend API: POST /api/audit/password-change
    // Body: { userId, email, action }
  },

  // Get password change logs (for admin)
  getPasswordChangeLogs: (userId?: string): PasswordChangeLog[] => {
    const logs = loadChangeLogs();
    if (userId) {
      return logs.filter(l => l.user_id === userId);
    }
    return logs;
    
    // Backend API: GET /api/audit/password-changes?userId=xxx
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
  },

  // Validate password strength
  validatePasswordStrength: (password: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return { valid: errors.length === 0, errors };
  },
};
