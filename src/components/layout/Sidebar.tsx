import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Home, Users, Settings, LogOut, ChevronLeft, 
  BookOpen, Target, Calendar, Award, BarChart,
  Building2, FileText, Trophy, Package, UserCheck, GraduationCap,
  Shield, Phone, Clock, ShoppingCart, PieChart
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
  // Super Admin menu items - Technical oversight
  { label: 'System Config', icon: <Settings className="h-5 w-5" />, path: '/system-config', roles: ['super_admin'] },
  { label: 'Audit Logs', icon: <FileText className="h-5 w-5" />, path: '/audit-logs', roles: ['super_admin'] },
  // System Admin menu items - Business operations
  { label: 'Tenants', icon: <Building2 className="h-5 w-5" />, path: '/tenants', roles: ['system_admin'] },
  { label: 'Institutions', icon: <Building2 className="h-5 w-5" />, path: '/institutions', roles: ['system_admin'] },
  { label: 'Licenses', icon: <Shield className="h-5 w-5" />, path: '/licenses', roles: ['system_admin'] },
  // Officers Management
  { label: 'Officer Management', icon: <Users className="h-5 w-5" />, path: '/officers', roles: ['system_admin'] },
  { label: 'Attendance & Payroll', icon: <Clock className="h-5 w-5" />, path: '/officer-attendance', roles: ['system_admin'] },
  // CRM & Communication
  { label: 'Contacts & Leads', icon: <Users className="h-5 w-5" />, path: '/contacts', roles: ['system_admin'] },
  { label: 'Renewal Tracker', icon: <Calendar className="h-5 w-5" />, path: '/renewal-tracker', roles: ['system_admin'] },
  { label: 'Communication Log', icon: <Phone className="h-5 w-5" />, path: '/communication-log', roles: ['system_admin'] },
  // Inventory & Purchase
  { label: 'Purchase Requests', icon: <ShoppingCart className="h-5 w-5" />, path: '/purchase-requests', roles: ['system_admin'] },
  { label: 'Inventory Overview', icon: <Package className="h-5 w-5" />, path: '/inventory-overview', roles: ['system_admin'] },
  // Analytics & Reports
  { label: 'Monthly Reports', icon: <FileText className="h-5 w-5" />, path: '/monthly-reports', roles: ['system_admin'] },
  { label: 'Custom Analytics', icon: <PieChart className="h-5 w-5" />, path: '/custom-analytics', roles: ['system_admin'] },
  { label: 'System Reports', icon: <BarChart className="h-5 w-5" />, path: '/reports', roles: ['system_admin'] },
  // Institution Admin menu items
  { label: 'Faculty', icon: <Users className="h-5 w-5" />, path: '/teachers', roles: ['institution_admin'] },
  { label: 'Students', icon: <GraduationCap className="h-5 w-5" />, path: '/students', roles: ['institution_admin'] },
  { label: 'Courses', icon: <BookOpen className="h-5 w-5" />, path: '/courses', roles: ['institution_admin'] },
  { label: 'Reports', icon: <BarChart className="h-5 w-5" />, path: '/reports', roles: ['institution_admin'] },
  // Teacher menu items
  { label: 'My Courses', icon: <BookOpen className="h-5 w-5" />, path: '/courses', roles: ['teacher'] },
  { label: 'Grades', icon: <Award className="h-5 w-5" />, path: '/grades', roles: ['teacher'] },
  { label: 'Attendance', icon: <UserCheck className="h-5 w-5" />, path: '/attendance', roles: ['teacher'] },
  { label: 'Schedule', icon: <Calendar className="h-5 w-5" />, path: '/schedule', roles: ['teacher'] },
  { label: 'Materials', icon: <FileText className="h-5 w-5" />, path: '/materials', roles: ['teacher'] },
  // Officer menu items
  { label: 'Sessions', icon: <Calendar className="h-5 w-5" />, path: '/sessions', roles: ['officer'] },
  { label: 'Projects', icon: <Target className="h-5 w-5" />, path: '/projects', roles: ['officer'] },
  { label: 'Lab Inventory', icon: <Package className="h-5 w-5" />, path: '/inventory', roles: ['officer'] },
  { label: 'Attendance', icon: <UserCheck className="h-5 w-5" />, path: '/attendance', roles: ['officer'] },
  // Student menu items
  { label: 'My Courses', icon: <BookOpen className="h-5 w-5" />, path: '/courses', roles: ['student'] },
  { label: 'My Projects', icon: <Target className="h-5 w-5" />, path: '/projects', roles: ['student'] },
  { label: 'Timetable', icon: <Calendar className="h-5 w-5" />, path: '/timetable', roles: ['student'] },
  { label: 'Certificates', icon: <Award className="h-5 w-5" />, path: '/certificates', roles: ['student'] },
  { label: 'Gamification', icon: <Trophy className="h-5 w-5" />, path: '/gamification', roles: ['student'] },
  { label: 'Resume', icon: <FileText className="h-5 w-5" />, path: '/resume', roles: ['student'] },
  // Management menu items
  { label: 'Faculty', icon: <Users className="h-5 w-5" />, path: '/faculty', roles: ['management'] },
  { label: 'Performance', icon: <BarChart className="h-5 w-5" />, path: '/performance', roles: ['management'] },
  { label: 'Reports', icon: <FileText className="h-5 w-5" />, path: '/reports', roles: ['management'] },
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

    // System admin routes
    if (user.role === 'system_admin') {
      return `/system-admin${path}`;
    }
    
    // Institution Admin routes (with tenant path)
    if (user.role === 'institution_admin' && user.tenant_id) {
      const tenantStr = localStorage.getItem('tenant');
      const tenant = tenantStr ? JSON.parse(tenantStr) : null;
      const tenantSlug = tenant?.slug || 'default';
      return `/tenant/${tenantSlug}/institution${path}`;
    }

    // Teacher routes (with tenant path)
    if (user.role === 'teacher' && user.tenant_id) {
      const tenantStr = localStorage.getItem('tenant');
      const tenant = tenantStr ? JSON.parse(tenantStr) : null;
      const tenantSlug = tenant?.slug || 'default';
      return `/tenant/${tenantSlug}/teacher${path}`;
    }

    // Officer routes (with tenant path)
    if (user.role === 'officer' && user.tenant_id) {
      const tenantStr = localStorage.getItem('tenant');
      const tenant = tenantStr ? JSON.parse(tenantStr) : null;
      const tenantSlug = tenant?.slug || 'default';
      return `/tenant/${tenantSlug}/officer${path}`;
    }

    // Management routes (with tenant path)
    if (user.role === 'management' && user.tenant_id) {
      const tenantStr = localStorage.getItem('tenant');
      const tenant = tenantStr ? JSON.parse(tenantStr) : null;
      const tenantSlug = tenant?.slug || 'default';
      return `/tenant/${tenantSlug}/management${path}`;
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
