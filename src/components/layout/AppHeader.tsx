import { useAuth } from '@/contexts/AuthContext';
import { NotificationBell } from './NotificationBell';

export function AppHeader() {
  const { user } = useAuth();

  if (!user) return null;

  // Only show notification bell for specific roles
  const showNotifications = ['system_admin', 'officer', 'student'].includes(user.role);

  if (!showNotifications) return null;

  return (
    <header className="sticky top-0 z-10 bg-background border-b px-6 py-3 flex justify-end items-center">
      <NotificationBell 
        userId={user.id} 
        userRole={user.role as 'officer' | 'student' | 'system_admin'} 
      />
    </header>
  );
}
