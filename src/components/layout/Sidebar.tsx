import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Home, Users, Settings, LogOut, ChevronLeft, 
  BookOpen, Target, Calendar, Award, BarChart,
  Building2, FileText, Trophy
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { UserRole } from '@/types';

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  roles: UserRole[];
}

// Role-based menu configuration
const menuItems: MenuItem[] = [
  { label: 'Dashboard', icon: <Home className="h-5 w-5" />, path: '/dashboard', roles: ['super_admin', 'system_admin', 'institution_admin', 'management', 'officer', 'teacher', 'student'] },
  { label: 'Tenants', icon: <Building2 className="h-5 w-5" />, path: '/tenants', roles: ['super_admin'] },
  { label: 'System Config', icon: <Settings className="h-5 w-5" />, path: '/system-config', roles: ['super_admin'] },
  { label: 'Audit Logs', icon: <FileText className="h-5 w-5" />, path: '/audit-logs', roles: ['super_admin'] },
  { label: 'Institutions', icon: <Building2 className="h-5 w-5" />, path: '/institutions', roles: ['system_admin'] },
  { label: 'My Courses', icon: <BookOpen className="h-5 w-5" />, path: '/courses', roles: ['student', 'teacher'] },
  { label: 'My Projects', icon: <Target className="h-5 w-5" />, path: '/projects', roles: ['student', 'officer'] },
  { label: 'Timetable', icon: <Calendar className="h-5 w-5" />, path: '/timetable', roles: ['student', 'teacher'] },
  { label: 'Certificates', icon: <Award className="h-5 w-5" />, path: '/certificates', roles: ['student'] },
  { label: 'Gamification', icon: <Trophy className="h-5 w-5" />, path: '/gamification', roles: ['student'] },
  { label: 'Resume', icon: <FileText className="h-5 w-5" />, path: '/resume', roles: ['student'] },
  { label: 'Analytics', icon: <BarChart className="h-5 w-5" />, path: '/analytics', roles: ['super_admin', 'system_admin', 'institution_admin'] },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const visibleMenuItems = menuItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  // Get base path for role-based routing
  const getFullPath = (path: string) => {
    if (!user) return path;
    
    // Super admin routes
    if (user.role === 'super_admin') {
      return `/super-admin${path}`;
    }
    
    // Student routes (with tenant path)
    if (user.role === 'student' && user.tenant_id) {
      // Get tenant slug from localStorage
      const tenantStr = localStorage.getItem('tenant');
      const tenant = tenantStr ? JSON.parse(tenantStr) : null;
      const tenantSlug = tenant?.slug || 'default';
      return `/tenant/${tenantSlug}/student${path}`;
    }
    
    // For other roles, will be implemented in future phases
    return path;
  };

  return (
    <div
      className={cn(
        'flex h-screen flex-col border-r bg-meta-dark text-white transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo Section */}
      <div className="flex h-16 items-center justify-between border-b border-meta-dark-lighter px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-meta-accent">
              <span className="text-lg font-bold text-meta-dark">MI</span>
            </div>
            <span className="text-xl font-bold">Meta-INNOVA</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-white hover:bg-meta-dark-lighter hover:text-meta-accent"
        >
          <ChevronLeft className={cn('h-5 w-5 transition-transform', collapsed && 'rotate-180')} />
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-4">
        <div className="space-y-1">
          {visibleMenuItems.map((item) => {
            const fullPath = getFullPath(item.path);
            const isActive = location.pathname.includes(item.path);
            return (
              <Link key={item.path} to={fullPath}>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start text-white hover:bg-meta-dark-lighter hover:text-meta-accent',
                    isActive && 'bg-meta-accent text-meta-dark hover:bg-meta-accent hover:text-meta-dark',
                    collapsed && 'justify-center px-2'
                  )}
                >
                  {item.icon}
                  {!collapsed && <span className="ml-3">{item.label}</span>}
                </Button>
              </Link>
            );
          })}
        </div>
      </ScrollArea>

      {/* User Section */}
      <div className="border-t border-meta-dark-lighter p-4">
        {!collapsed && user && (
          <div className="mb-3">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-gray-400">{user.role.replace('_', ' ')}</p>
          </div>
        )}
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            'w-full justify-start text-white hover:bg-red-600 hover:text-white',
            collapsed && 'justify-center px-2'
          )}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span className="ml-3">Logout</span>}
        </Button>
      </div>
    </div>
  );
}
