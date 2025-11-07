import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import logoImage from '@/assets/logo.png';
import { 
  Home, Users, User, Settings, LogOut, ChevronLeft, 
  BookOpen, Target, Calendar, Award, BarChart,
  Building2, FileText, Trophy, Package, UserCheck, GraduationCap,
  Shield, Phone, Clock, ShoppingCart, PieChart, Briefcase, CalendarCheck,
  LayoutDashboard
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { UserRole } from '@/types';
import { OfficerSidebarProfile } from './OfficerSidebarProfile';
import { getOfficerByEmail } from '@/data/mockOfficerData';
import { OfficerDetails } from '@/services/systemadmin.service';
import { TeacherSidebarProfile } from '@/components/teacher/TeacherSidebarProfile';
import { getTeacherByEmail } from '@/data/mockTeacherData';
import { SchoolTeacher } from '@/types/teacher';
import { getPendingLeaveCount } from '@/data/mockLeaveData';
import { NotificationBell } from './NotificationBell';

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  roles: UserRole[];
}

// Role-based menu configuration
const menuItems: MenuItem[] = [
  { label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" />, path: '/dashboard', roles: ['super_admin', 'system_admin', 'management', 'officer', 'teacher', 'student'] },
  // Super Admin menu items - Technical oversight
  { label: 'System Config', icon: <Settings className="h-5 w-5" />, path: '/system-config', roles: ['super_admin'] },
  { label: 'Audit Logs', icon: <FileText className="h-5 w-5" />, path: '/audit-logs', roles: ['super_admin'] },
  // System Admin menu items - Business operations
  { label: 'Institution Management', icon: <Building2 className="h-5 w-5" />, path: '/institutions', roles: ['system_admin'] },
  { label: 'Course Management', icon: <BookOpen className="h-5 w-5" />, path: '/course-management', roles: ['system_admin'] },
  { label: 'Assessment Management', icon: <FileText className="h-5 w-5" />, path: '/assessments', roles: ['system_admin'] },
  { label: 'Event Management', icon: <Trophy className="h-5 w-5" />, path: '/event-management', roles: ['system_admin'] },
  // Officers Management
  { label: 'Officer Management', icon: <Users className="h-5 w-5" />, path: '/officers', roles: ['system_admin'] },
  // Project Management
  { label: 'Project Management', icon: <Target className="h-5 w-5" />, path: '/project-management', roles: ['system_admin'] },
  // Inventory & Purchase
  { label: 'Inventory Management', icon: <Package className="h-5 w-5" />, path: '/inventory-management', roles: ['system_admin'] },
  { label: 'Attendance', icon: <Clock className="h-5 w-5" />, path: '/officer-attendance', roles: ['system_admin'] },
  { label: 'Leave Approvals', icon: <CalendarCheck className="h-5 w-5" />, path: '/leave-approvals', roles: ['system_admin'] },
  { label: 'Institutional Calendar', icon: <Calendar className="h-5 w-5" />, path: '/institutional-calendar', roles: ['system_admin'] },
  // Reports & Analytics
  { label: 'Reports & Analytics', icon: <BarChart className="h-5 w-5" />, path: '/reports', roles: ['system_admin'] },
  // Teacher menu items
  { label: 'My Courses', icon: <BookOpen className="h-5 w-5" />, path: '/courses', roles: ['teacher'] },
  { label: 'Grades', icon: <Award className="h-5 w-5" />, path: '/grades', roles: ['teacher'] },
  { label: 'Attendance', icon: <UserCheck className="h-5 w-5" />, path: '/attendance', roles: ['teacher'] },
  { label: 'Schedule', icon: <Calendar className="h-5 w-5" />, path: '/schedule', roles: ['teacher'] },
  { label: 'Materials', icon: <FileText className="h-5 w-5" />, path: '/materials', roles: ['teacher'] },
  // Officer menu items
  { label: 'Start Teaching', icon: <BookOpen className="h-5 w-5" />, path: '/course-management', roles: ['officer'] },
  { label: 'My Timetable', icon: <Calendar className="h-5 w-5" />, path: '/sessions', roles: ['officer'] },
  { label: 'Assessments', icon: <FileText className="h-5 w-5" />, path: '/assessments', roles: ['officer'] },
  { label: 'My Profile', icon: <User className="h-5 w-5" />, path: '/profile', roles: ['officer'] },
  { label: 'Projects', icon: <Target className="h-5 w-5" />, path: '/projects', roles: ['officer'] },
  { label: 'Lab Inventory', icon: <Package className="h-5 w-5" />, path: '/inventory', roles: ['officer'] },
  { label: 'Class Attendance', icon: <UserCheck className="h-5 w-5" />, path: '/attendance', roles: ['officer'] },
  { label: 'Leave Management', icon: <CalendarCheck className="h-5 w-5" />, path: '/leave-management', roles: ['officer'] },
  { label: 'Events & Activities', icon: <Trophy className="h-5 w-5" />, path: '/events', roles: ['officer'] },
  // Student menu items
  { label: 'My Courses', icon: <BookOpen className="h-5 w-5" />, path: '/courses', roles: ['student'] },
  { label: 'Assessments', icon: <FileText className="h-5 w-5" />, path: '/assessments', roles: ['student'] },
  { label: 'My Projects', icon: <Target className="h-5 w-5" />, path: '/projects', roles: ['student'] },
  { label: 'Events & Activities', icon: <Trophy className="h-5 w-5" />, path: '/events', roles: ['student'] },
  { label: 'Timetable', icon: <Calendar className="h-5 w-5" />, path: '/timetable', roles: ['student'] },
  { label: 'Certificates', icon: <Award className="h-5 w-5" />, path: '/certificates', roles: ['student'] },
  { label: 'Gamification', icon: <BarChart className="h-5 w-5" />, path: '/gamification', roles: ['student'] },
  { label: 'Resume', icon: <FileText className="h-5 w-5" />, path: '/resume', roles: ['student'] },
  // Management menu items (merged with institution admin functionality)
  { label: 'Teachers', icon: <Users className="h-5 w-5" />, path: '/teachers', roles: ['management'] },
  { label: 'Students', icon: <GraduationCap className="h-5 w-5" />, path: '/students', roles: ['management'] },
  { label: 'Innovation Officers', icon: <UserCheck className="h-5 w-5" />, path: '/officers', roles: ['management'] },
  { label: 'Courses & Sessions', icon: <BookOpen className="h-5 w-5" />, path: '/courses-sessions', roles: ['management'] },
  { label: 'Inventory & Purchase', icon: <Package className="h-5 w-5" />, path: '/inventory-purchase', roles: ['management'] },
  { label: 'Projects & Certificates', icon: <Target className="h-5 w-5" />, path: '/projects-certificates', roles: ['management'] },
  { label: 'Events & Activities', icon: <Trophy className="h-5 w-5" />, path: '/events', roles: ['management'] },
  { label: 'Reports', icon: <FileText className="h-5 w-5" />, path: '/reports', roles: ['management'] },
  { label: 'Settings', icon: <Settings className="h-5 w-5" />, path: '/settings', roles: ['management'] },
  { label: 'Attendance', icon: <Clock className="h-5 w-5" />, path: '/attendance', roles: ['management'] },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const [officerProfile, setOfficerProfile] = useState<OfficerDetails | null>(null);
  const [teacherProfile, setTeacherProfile] = useState<SchoolTeacher | null>(null);
  const [pendingLeaveCount, setPendingLeaveCount] = useState(0);

  useEffect(() => {
    // Fetch officer profile if user is an officer
    if (user?.role === 'officer' && user?.email) {
      const profile = getOfficerByEmail(user.email);
      setOfficerProfile(profile || null);
    }
    
    // Fetch teacher profile if user is a teacher
    if (user?.role === 'teacher' && user?.email) {
      const profile = getTeacherByEmail(user.email);
      setTeacherProfile(profile || null);
    }
    
    // Load pending leave count for system admin
    if (user?.role === 'system_admin') {
      setPendingLeaveCount(getPendingLeaveCount());
      // Refresh every 30 seconds
      const interval = setInterval(() => {
        setPendingLeaveCount(getPendingLeaveCount());
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

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

    // Management routes (with tenant path) - merged institution admin
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
            <div className="flex h-10 w-10 items-center justify-center rounded-full overflow-hidden bg-[#2d437f]">
              <img src={logoImage} alt="CR Logo" className="h-full w-full object-contain p-1" />
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
            const showBadge = item.label === 'Leave Approvals' && pendingLeaveCount > 0;
            
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
                  {!collapsed && (
                    <>
                      <span className="ml-3">{item.label}</span>
                      {showBadge && (
                        <Badge variant="destructive" className="ml-auto">
                          {pendingLeaveCount}
                        </Badge>
                      )}
                    </>
                  )}
                </Button>
              </Link>
            );
          })}
        </div>
      </ScrollArea>

      {/* User Section */}
      <div className="border-t border-meta-dark-lighter">
        {user?.role === 'officer' && officerProfile ? (
          <OfficerSidebarProfile officer={officerProfile} collapsed={collapsed} />
        ) : user?.role === 'teacher' && teacherProfile ? (
          <TeacherSidebarProfile teacher={teacherProfile} collapsed={collapsed} />
        ) : (
          // Default user section for other roles
          <div className="p-4">
            {!collapsed && user && (
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-gray-400">{user.role.replace('_', ' ')}</p>
                </div>
                {['system_admin', 'officer', 'student'].includes(user.role) && (
                  <NotificationBell 
                    userId={user.id} 
                    userRole={user.role as 'officer' | 'student' | 'system_admin'} 
                  />
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Logout Button (always visible) */}
        <div className="px-4 pb-4">
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
    </div>
  );
}
