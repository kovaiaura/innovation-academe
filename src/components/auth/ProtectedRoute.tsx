import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, hasAnyRole } from '@/types';
import { SystemAdminFeature } from '@/types/permissions';
import { canAccessFeature } from '@/utils/permissionHelpers';
import { usePlatformSettings } from '@/contexts/PlatformSettingsContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredFeature?: SystemAdminFeature;
}

// Roles that bypass maintenance mode
const ADMIN_ROLES: UserRole[] = ['super_admin', 'system_admin'];

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles,
  requiredFeature
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { settings, isLoading: settingsLoading } = usePlatformSettings();
  const location = useLocation();

  if (isLoading || settingsLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-meta-accent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute: User not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check maintenance mode - redirect non-admins to maintenance page
  const userRoles = user?.roles || [user?.role];
  const isAdmin = userRoles.some(role => role && ADMIN_ROLES.includes(role as UserRole));
  
  if (settings.maintenanceMode && !isAdmin) {
    console.log('ProtectedRoute: Maintenance mode active, redirecting non-admin user');
    return <Navigate to="/maintenance" replace />;
  }

  // Check if user has ANY of the allowed roles (multi-role support)
  if (allowedRoles && user && !hasAnyRole(user, allowedRoles)) {
    console.log('ProtectedRoute: Access denied', {
      userRoles: user.roles || [user.role],
      allowedRoles,
      path: location.pathname
    });
    return <Navigate to="/unauthorized" replace />;
  }

  // Check feature-based permission for system_admin
  if (requiredFeature && userRoles.includes('system_admin')) {
    if (!canAccessFeature(user!, requiredFeature)) {
      console.log('ProtectedRoute: Feature access denied', {
        userPositionId: user?.position_id,
        requiredFeature,
        path: location.pathname
      });
      return <Navigate to="/unauthorized" replace />;
    }
  }

  console.log('ProtectedRoute: Access granted', {
    userRole: user?.role,
    path: location.pathname
  });

  return <>{children}</>;
};
