import { UserRole } from '@/types';

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
