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
  MessageSquare, MessageCircle,
  Shield, Phone, Clock, ShoppingCart, PieChart, Briefcase, CalendarCheck,
  LayoutDashboard, CheckSquare, ListTodo, Key, Star
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { UserRole } from '@/types';
import { SystemAdminFeature } from '@/types/permissions';
import { canAccessFeature, isCEO } from '@/utils/permissionHelpers';
import { OfficerSidebarProfile } from './OfficerSidebarProfile';
import { getOfficerByEmail } from '@/data/mockOfficerData';
import { OfficerDetails } from '@/services/systemadmin.service';
import { TeacherSidebarProfile } from '@/components/teacher/TeacherSidebarProfile';
import { getTeacherByEmail } from '@/data/mockTeacherData';
import { SchoolTeacher } from '@/types/teacher';
import { getPendingLeaveCount, getPendingLeaveCountByStage } from '@/data/mockLeaveData';
import { NotificationBell } from './NotificationBell';
import { SidebarProfileCard } from './SidebarProfileCard';
import { useUserProfilePhoto } from '@/hooks/useUserProfilePhoto';

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  roles: UserRole[];
  feature?: SystemAdminFeature;
  ceoOnly?: boolean;
}

// Role-based menu configuration
const menuItems: MenuItem[] = [
  { label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" />, path: '/dashboard', roles: ['super_admin', 'system_admin', 'management', 'officer', 'teacher', 'student'] },
  // Super Admin menu items - Technical oversight
  { label: 'System Config', icon: <Settings className="h-5 w-5" />, path: '/system-config', roles: ['super_admin'] },
  { label: 'Audit Logs', icon: <FileText className="h-5 w-5" />, path: '/audit-logs', roles: ['super_admin'] },
  // System Admin menu items - Business operations
  { label: 'Institution Management', icon: <Building2 className="h-5 w-5" />, path: '/institutions', roles: ['system_admin'], feature: 'institution_management' },
  { label: 'Course Management', icon: <BookOpen className="h-5 w-5" />, path: '/course-management', roles: ['system_admin'], feature: 'course_management' },
  { label: 'Assessment Management', icon: <FileText className="h-5 w-5" />, path: '/assessments', roles: ['system_admin'], feature: 'assessment_management' },
  { label: 'Assignment Management', icon: <Briefcase className="h-5 w-5" />, path: '/assignment-management', roles: ['system_admin'], feature: 'assignment_management' },
  { label: 'Event Management', icon: <Trophy className="h-5 w-5" />, path: '/event-management', roles: ['system_admin'], feature: 'event_management' },
  // Officers Management
  { label: 'Officer Management', icon: <Users className="h-5 w-5" />, path: '/officers', roles: ['system_admin'], feature: 'officer_management' },
  // Project Management
  { label: 'Project Management', icon: <Target className="h-5 w-5" />, path: '/project-management', roles: ['system_admin'], feature: 'project_management' },
  // Inventory & Purchase
  { label: 'Inventory Management', icon: <Package className="h-5 w-5" />, path: '/inventory-management', roles: ['system_admin'], feature: 'inventory_management' },
  { label: 'Attendance and Payroll', icon: <Clock className="h-5 w-5" />, path: '/officer-attendance', roles: ['system_admin'], feature: 'attendance_payroll' },
  // Hierarchical Leave Management
  { label: 'Leave Management', icon: <CalendarCheck className="h-5 w-5" />, path: '/leave-management', roles: ['system_admin'] },
  { label: 'Manager Approvals', icon: <CalendarCheck className="h-5 w-5" />, path: '/manager-leave-approvals', roles: ['system_admin'] },
  { label: 'AGM Approvals', icon: <CalendarCheck className="h-5 w-5" />, path: '/agm-leave-approvals', roles: ['system_admin'] },
  { label: 'CEO Approvals', icon: <CalendarCheck className="h-5 w-5" />, path: '/ceo-leave-approvals', roles: ['system_admin'], ceoOnly: true },
  { label: 'Institutional Calendar', icon: <Calendar className="h-5 w-5" />, path: '/institutional-calendar', roles: ['system_admin'], feature: 'institutional_calendar' },
  // Position Management (CEO only)
  { label: 'Position Management', icon: <Shield className="h-5 w-5" />, path: '/position-management', roles: ['system_admin'], ceoOnly: true },
  // Credential Management (Feature-based permissions)
  { label: 'Credential Management', icon: <Key className="h-5 w-5" />, path: '/credential-management', roles: ['system_admin'], feature: 'credential_management' },
  // Task Management & Task Allotment (Feature-based permissions)
  { label: 'Task Management', icon: <CheckSquare className="h-5 w-5" />, path: '/task-management', roles: ['system_admin'], feature: 'task_management' },
  { label: 'Task Allotment', icon: <ListTodo className="h-5 w-5" />, path: '/tasks', roles: ['system_admin'], feature: 'task_allotment' },
  // Gamification
  { label: 'Gamification', icon: <Trophy className="h-5 w-5" />, path: '/gamification', roles: ['system_admin'], feature: 'gamification' },
  // Reports & Invoice
  { label: 'Reports & Invoice', icon: <BarChart className="h-5 w-5" />, path: '/reports', roles: ['system_admin'], feature: 'reports_analytics' },
  // SDG Management
  { label: 'SDG Management', icon: <Target className="h-5 w-5" />, path: '/sdg-management', roles: ['system_admin'], feature: 'sdg_management' },
  // CRM & Ask Metova
  { label: 'Surveys & Feedback', icon: <MessageCircle className="h-5 w-5" />, path: '/survey-feedback', roles: ['system_admin'], feature: 'survey_feedback' },
  { label: 'Performance & Ratings', icon: <Star className="h-5 w-5" />, path: '/performance-ratings', roles: ['system_admin'], feature: 'performance_ratings' },
  { label: 'CRM & Clients', icon: <Phone className="h-5 w-5" />, path: '/crm', roles: ['system_admin'] },
  { label: 'Ask Metova', icon: <MessageSquare className="h-5 w-5" />, path: '/ask-metova', roles: ['system_admin'] },
  { label: 'Settings', icon: <Settings className="h-5 w-5" />, path: '/settings', roles: ['system_admin'] },
  // Teacher menu items
  { label: 'My Courses', icon: <BookOpen className="h-5 w-5" />, path: '/courses', roles: ['teacher'] },
  { label: 'Grades', icon: <Award className="h-5 w-5" />, path: '/grades', roles: ['teacher'] },
  { label: 'Attendance', icon: <UserCheck className="h-5 w-5" />, path: '/attendance', roles: ['teacher'] },
  { label: 'Schedule', icon: <Calendar className="h-5 w-5" />, path: '/schedule', roles: ['teacher'] },
  { label: 'Materials', icon: <FileText className="h-5 w-5" />, path: '/materials', roles: ['teacher'] },
  { label: 'Settings', icon: <Settings className="h-5 w-5" />, path: '/settings', roles: ['teacher'] },
  // Officer menu items
  { label: 'Task', icon: <CheckSquare className="h-5 w-5" />, path: '/tasks', roles: ['officer'] },
  { label: 'My Timetable', icon: <Calendar className="h-5 w-5" />, path: '/timetable', roles: ['officer'] },
  { label: 'Assessments', icon: <FileText className="h-5 w-5" />, path: '/assessments', roles: ['officer'] },
  { label: 'My Profile', icon: <User className="h-5 w-5" />, path: '/profile', roles: ['officer'] },
  { label: 'Projects', icon: <Target className="h-5 w-5" />, path: '/projects', roles: ['officer'] },
  { label: 'Lab Inventory', icon: <Package className="h-5 w-5" />, path: '/inventory', roles: ['officer'] },
  { label: 'Class Attendance', icon: <UserCheck className="h-5 w-5" />, path: '/attendance', roles: ['officer'] },
  { label: 'Leave Management', icon: <CalendarCheck className="h-5 w-5" />, path: '/leave-management', roles: ['officer'] },
  { label: 'Events & Activities', icon: <Trophy className="h-5 w-5" />, path: '/events', roles: ['officer'] },
  { label: 'Ask Metova', icon: <MessageSquare className="h-5 w-5" />, path: '/ask-metova', roles: ['officer'] },
  // { label: 'Settings', icon: <Settings className="h-5 w-5" />, path: '/settings', roles: ['officer'] }, // Temporarily hidden
  // Student menu items
  { label: 'My Courses', icon: <BookOpen className="h-5 w-5" />, path: '/courses', roles: ['student'] },
  { label: 'Assessments', icon: <FileText className="h-5 w-5" />, path: '/assessments', roles: ['student'] },
  { label: 'Assignments', icon: <Briefcase className="h-5 w-5" />, path: '/assignments', roles: ['student'] },
  { label: 'My Projects', icon: <Target className="h-5 w-5" />, path: '/projects', roles: ['student'] },
  { label: 'Events & Activities', icon: <Trophy className="h-5 w-5" />, path: '/events', roles: ['student'] },
  { label: 'Timetable', icon: <Calendar className="h-5 w-5" />, path: '/timetable', roles: ['student'] },
  { label: 'Certificates', icon: <Award className="h-5 w-5" />, path: '/certificates', roles: ['student'] },
  { label: 'Gamification', icon: <BarChart className="h-5 w-5" />, path: '/gamification', roles: ['student'] },
  { label: 'Resume', icon: <FileText className="h-5 w-5" />, path: '/resume', roles: ['student'] },
  // { label: 'Settings', icon: <Settings className="h-5 w-5" />, path: '/settings', roles: ['student'] }, // Temporarily hidden
  { label: 'Ask Metova', icon: <MessageSquare className="h-5 w-5" />, path: '/ask-metova', roles: ['student'] },
  { label: 'Feedback/Survey', icon: <MessageCircle className="h-5 w-5" />, path: '/feedback', roles: ['student'] },
  // System Admin - Configuration
  { label: 'ID Configuration', icon: <Settings className="h-5 w-5" />, path: '/id-configuration', roles: ['system_admin'], feature: 'id_configuration' },
  // Management menu items (merged with institution admin functionality)
  // { label: 'Teachers', icon: <Users className="h-5 w-5" />, path: '/teachers', roles: ['management'] }, // Temporarily removed
  { label: 'Students', icon: <GraduationCap className="h-5 w-5" />, path: '/students', roles: ['management'] },
  { label: 'Innovation Officers', icon: <UserCheck className="h-5 w-5" />, path: '/officers', roles: ['management'] },
  { label: 'Courses & Sessions', icon: <BookOpen className="h-5 w-5" />, path: '/courses-sessions', roles: ['management'] },
  { label: 'Inventory & Purchase', icon: <Package className="h-5 w-5" />, path: '/inventory-purchase', roles: ['management'] },
  { label: 'Projects & Awards', icon: <Target className="h-5 w-5" />, path: '/projects-certificates', roles: ['management'] },
  { label: 'Events & Activities', icon: <Trophy className="h-5 w-5" />, path: '/events', roles: ['management'] },
  { label: 'Reports', icon: <FileText className="h-5 w-5" />, path: '/reports', roles: ['management'] },
  { label: 'Timetable', icon: <Calendar className="h-5 w-5" />, path: '/timetable', roles: ['management'] },
  { label: 'Attendance', icon: <Clock className="h-5 w-5" />, path: '/attendance', roles: ['management'] },
  { label: 'My Profile', icon: <User className="h-5 w-5" />, path: '/profile', roles: ['management'] },
  // Student My Profile
  { label: 'My Profile', icon: <User className="h-5 w-5" />, path: '/profile', roles: ['student'] },
  // Teacher My Profile
  { label: 'My Profile', icon: <User className="h-5 w-5" />, path: '/profile', roles: ['teacher'] },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const [officerProfile, setOfficerProfile] = useState<OfficerDetails | null>(null);
  const [teacherProfile, setTeacherProfile] = useState<SchoolTeacher | null>(null);
  const [pendingLeaveCount, setPendingLeaveCount] = useState(0);
  const [managerLeaveCount, setManagerLeaveCount] = useState(0);
  const [agmLeaveCount, setAgmLeaveCount] = useState(0);
  const [ceoLeaveCount, setCeoLeaveCount] = useState(0);
  
  // Fetch profile photo for sidebar display
  const { photoUrl } = useUserProfilePhoto(user?.id);

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
    
    // Load pending leave counts for system admin by position
    if (user?.role === 'system_admin') {
      // Manager sees manager_pending count
      if (user.position_name === 'manager') {
        setManagerLeaveCount(getPendingLeaveCountByStage('manager_pending'));
      }
      
      // AGM sees agm_pending count
      if (user.position_name === 'agm') {
        setAgmLeaveCount(getPendingLeaveCountByStage('agm_pending'));
      }
      
      // CEO sees ceo_pending count
      if (user.is_ceo) {
        setCeoLeaveCount(getPendingLeaveCountByStage('ceo_pending'));
      }
      
      // Refresh every 30 seconds
      const interval = setInterval(() => {
        if (user.position_name === 'manager') {
          setManagerLeaveCount(getPendingLeaveCountByStage('manager_pending'));
        }
        if (user.position_name === 'agm') {
          setAgmLeaveCount(getPendingLeaveCountByStage('agm_pending'));
        }
        if (user.is_ceo) {
          setCeoLeaveCount(getPendingLeaveCountByStage('ceo_pending'));
        }
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  // Get all user roles for multi-role filtering
  const userRoles = user?.roles || (user ? [user.role] : []);
  
  const visibleMenuItems = menuItems.filter((item) => {
    if (!user) return false;
    
    // Check if user has ANY of the item's allowed roles
    const hasMatchingRole = item.roles.some(r => userRoles.includes(r));
    if (!hasMatchingRole) return false;
    
    // If item requires system_admin role and user has it, check position permissions
    if (item.roles.includes('system_admin') && userRoles.includes('system_admin')) {
      // CEO-only items
      if (item.ceoOnly && !isCEO(user)) return false;
      
      // Feature-based items
      if (item.feature && !canAccessFeature(user, item.feature)) return false;
    }
    
    return true;
  });

  // Get base path for role-based routing (supports multi-role)
  const getFullPath = (path: string, itemRole?: UserRole) => {
    if (!user) return path;
    
    // Determine which role context to use for this menu item
    const roleForPath = itemRole || user.role;
    
    // Super admin routes
    if (roleForPath === 'super_admin' && userRoles.includes('super_admin')) {
      return `/super-admin${path}`;
    }

    // System admin routes
    if (roleForPath === 'system_admin' && userRoles.includes('system_admin')) {
      return `/system-admin${path}`;
    }

    // Teacher routes (with tenant path)
    if (roleForPath === 'teacher' && user.tenant_id) {
      const tenantStr = localStorage.getItem('tenant');
      const tenant = tenantStr ? JSON.parse(tenantStr) : null;
      const tenantSlug = tenant?.slug || 'default';
      return `/tenant/${tenantSlug}/teacher${path}`;
    }

    // Officer routes (with tenant path)
    if (roleForPath === 'officer' && user.tenant_id) {
      const tenantStr = localStorage.getItem('tenant');
      const tenant = tenantStr ? JSON.parse(tenantStr) : null;
      const tenantSlug = tenant?.slug || 'default';
      return `/tenant/${tenantSlug}/officer${path}`;
    }

    // Management routes (with tenant path) - merged institution admin
    if (roleForPath === 'management' && user.tenant_id) {
      const tenantStr = localStorage.getItem('tenant');
      const tenant = tenantStr ? JSON.parse(tenantStr) : null;
      const tenantSlug = tenant?.slug || 'default';
      return `/tenant/${tenantSlug}/management${path}`;
    }
    
    // Student routes (with tenant path)
    if (roleForPath === 'student' && user.tenant_id) {
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
            // Determine the appropriate role for this item's path
            // For multi-role users, use the matching role from the item's roles
            const itemRole = item.roles.find(r => userRoles.includes(r));
            const fullPath = getFullPath(item.path, itemRole);
            const isActive = location.pathname.includes(item.path);
            const showBadge = 
              (item.label === 'Manager Approvals' && managerLeaveCount > 0) ||
              (item.label === 'AGM Approvals' && agmLeaveCount > 0) ||
              (item.label === 'CEO Approvals' && ceoLeaveCount > 0);
            const badgeCount = 
              item.label === 'Manager Approvals' ? managerLeaveCount :
              item.label === 'AGM Approvals' ? agmLeaveCount :
              item.label === 'CEO Approvals' ? ceoLeaveCount : 0;
            
            return (
              <Link key={`${item.path}-${itemRole}`} to={fullPath}>
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
                          {badgeCount}
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
        {userRoles.includes('officer') && officerProfile ? (
          <OfficerSidebarProfile officer={officerProfile} collapsed={collapsed} photoUrl={photoUrl} />
        ) : userRoles.includes('teacher') && teacherProfile ? (
          <TeacherSidebarProfile teacher={teacherProfile} collapsed={collapsed} photoUrl={photoUrl} />
        ) : user ? (
          // Profile card for other roles (management, student, system_admin, super_admin)
          <>
            <SidebarProfileCard
              userName={user.name || 'User'}
              photoUrl={photoUrl}
              subtitle={user.roles && user.roles.length > 1 
                ? user.roles.map(r => r.replace('_', ' ')).join(', ')
                : user.role?.replace('_', ' ')}
              profilePath={getFullPath('/profile', user.role as UserRole)}
              collapsed={collapsed}
            />
            {!collapsed && ['system_admin', 'officer', 'student'].some(r => userRoles.includes(r as UserRole)) && (
              <div className="px-4 pb-2 flex justify-end">
                <NotificationBell 
                  userId={user.id} 
                  userRole={user.role as 'officer' | 'student' | 'system_admin'} 
                />
              </div>
            )}
          </>
        ) : null}
        
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
