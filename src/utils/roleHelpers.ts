import { User, UserRole } from '@/types';

export const getRoleBasePath = (role: UserRole, tenantSlug?: string): string => {
  const basePaths: Record<UserRole, string> = {
    super_admin: '/super-admin',
    system_admin: '/system-admin',
    management: tenantSlug ? `/tenant/${tenantSlug}/management` : '/management',
    officer: tenantSlug ? `/tenant/${tenantSlug}/officer` : '/officer',
    teacher: tenantSlug ? `/tenant/${tenantSlug}/teacher` : '/teacher',
    student: tenantSlug ? `/tenant/${tenantSlug}/student` : '/student',
  };
  
  return basePaths[role];
};

export const getRoleDashboardPath = (role: UserRole, tenantSlug?: string): string => {
  return `${getRoleBasePath(role, tenantSlug)}/dashboard`;
};

// Get dashboard path for multi-role user (prioritizes system_admin for CEO)
export const getMultiRoleDashboardPath = (user: User, tenantSlug?: string): string => {
  const roles = user.roles || [user.role];
  
  // Priority: system_admin > super_admin > others
  if (roles.includes('system_admin')) {
    return getRoleDashboardPath('system_admin', tenantSlug);
  }
  if (roles.includes('super_admin')) {
    return getRoleDashboardPath('super_admin', tenantSlug);
  }
  
  return getRoleDashboardPath(user.role, tenantSlug);
};
