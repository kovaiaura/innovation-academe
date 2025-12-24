import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, hasAnyRole } from '@/types';
import { SystemAdminFeature } from '@/types/permissions';
import { canAccessFeature } from '@/utils/permissionHelpers';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredFeature?: SystemAdminFeature;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles,
  requiredFeature
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
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
  const userRoles = user?.roles || [user?.role];
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
