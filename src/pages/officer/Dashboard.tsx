import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { format, differenceInMinutes, parse } from 'date-fns';
import {
  Calendar,
  Clock,
  FileText,
  BookOpen,
  Users,
  Package,
  ArrowRight,
  CheckCircle2,
  School,
  Briefcase,
  CalendarCheck,
  AlertCircle,
  CheckCircle,
  Check,
  X,
  Building2,
  LogOut,
  Timer,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { toast } from 'sonner';
import { getOfficerById, loadOfficers } from '@/data/mockOfficerData';
import { getOfficerTimetable as getOfficerTimetableData } from '@/data/mockOfficerTimetable';
import type { OfficerTimetableSlot } from '@/types/officer';
import {
  getLeaveApplicationsByOfficer,
  getApprovedLeaveDates,
  getTodayLeaveDetails,
  getAllLeaveApplications,
  getLeaveBalance,
} from '@/data/mockLeaveData';
import type { LeaveApplication } from '@/types/attendance';
import { getRoleBasePath } from '@/utils/roleHelpers';
import { mockEventApplications } from '@/data/mockEventsData';
import { SalaryTrackerCard } from '@/components/officer/SalaryTrackerCard';
import { useInstitutionData } from '@/contexts/InstitutionDataContext';
import { OfficerCheckInCard } from '@/components/officer/OfficerCheckInCard';
import { DelegatedClassesCard } from '@/components/officer/DelegatedClassesCard';
import { UpcomingClassesCard } from '@/components/officer/UpcomingClassesCard';
import { useOfficerByUserId } from '@/hooks/useOfficerProfile';
import { useOfficerTodayAttendance } from '@/hooks/useOfficerAttendance';
import { useOfficerSalaryCalculation, useOfficerDashboardStats, useOfficerTasks } from '@/hooks/useOfficerDashboardData';
import { SalaryProgressCard } from '@/components/dashboard/SalaryProgressCard';
import { TasksSummaryCard } from '@/components/dashboard/TasksSummaryCard';
import { supabase } from '@/integrations/supabase/client';

// Helper functions
const getDayName = (date: Date) => {
  return date.toLocaleDateString('en-US', { weekday: 'long' });
};

const getTodaySchedule = (slots: OfficerTimetableSlot[]) => {
  const today = getDayName(new Date());
  return slots
    .filter(slot => slot.day === today)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));
};

const getUpcomingSlots = (slots: OfficerTimetableSlot[], count: number) => {
  const today = getDayName(new Date());
  const currentTime = new Date().toTimeString().slice(0, 5);
  const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayIndex = daysOrder.indexOf(today);
  
  const futureSlots = slots
    .filter(slot => {
      const slotDayIndex = daysOrder.indexOf(slot.day);
      if (slotDayIndex === todayIndex) {
        return slot.start_time > currentTime;
      }
      return slotDayIndex > todayIndex;
    })
    .sort((a, b) => {
      const dayCompare = daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day);
      if (dayCompare !== 0) return dayCompare;
      return a.start_time.localeCompare(b.start_time);
    });
  
  return futureSlots.slice(0, count);
};

const getActivityIcon = (type: string) => {
  switch(type) {
    case 'workshop': return '🔧';
    case 'lab': return '🧪';
    case 'mentoring': return '👥';
    case 'project_review': return '📋';
    default: return '📚';
  }
};

const getActivityColor = (type: string) => {
  switch(type) {
    case 'workshop': return 'text-blue-500 bg-blue-500/10';
    case 'lab': return 'text-green-500 bg-green-500/10';
    case 'mentoring': return 'text-yellow-500 bg-yellow-500/10';
    case 'project_review': return 'text-purple-500 bg-purple-500/10';
    default: return 'text-primary bg-primary/10';
  }
};

export default function OfficerDashboard() {
  // Mock: Get pending event applications for officer's institution
  const pendingApplications = mockEventApplications.filter(
    app => app.institution_id === 'springfield-high' && app.status === 'pending'
  ).slice(0, 5);
  const { user } = useAuth();
  const { tenantId } = useParams();
  const navigate = useNavigate();
  const todayKey = format(new Date(), 'yyyy-MM-dd');
  const { institutions } = useInstitutionData();
  
  // Get officer profile from Supabase
  const { data: officerProfile, isLoading: isLoadingOfficer } = useOfficerByUserId(user?.id);
  const primaryInstitutionId = officerProfile?.assigned_institutions?.[0] || '';
  
  // Get attendance status for check-in card state
  const { data: todayAttendance } = useOfficerTodayAttendance(
    officerProfile?.id || '',
    primaryInstitutionId
  );
  
  // Get real dashboard stats
  const { data: dashboardStats } = useOfficerDashboardStats(officerProfile?.id, primaryInstitutionId);
  
  // Get real salary calculation
  const { data: salaryData, isLoading: isLoadingSalary } = useOfficerSalaryCalculation(
    officerProfile?.id,
    officerProfile?.annual_salary || undefined
  );
  
  // Get tasks assigned to officer
  const { data: tasks = [], isLoading: isLoadingTasks } = useOfficerTasks(user?.id);

  // Leave state
  const [leaveApplications, setLeaveApplications] = useState<LeaveApplication[]>([]);
  const [approvedLeaveDates, setApprovedLeaveDates] = useState<string[]>([]);
  const [isOnLeaveToday, setIsOnLeaveToday] = useState(false);
  const [todayLeaveDetails, setTodayLeaveDetails] = useState<LeaveApplication | null>(null);
  const [last7Days, setLast7Days] = useState<
    Array<{ date: string; day: string; status: 'present' | 'absent' | 'leave' | 'weekend' | null; leaveType?: string }>
  >([]);
  
  // Get leave balance
  const currentYear = new Date().getFullYear().toString();
  const leaveBalance = user?.id ? getLeaveBalance(user.id, currentYear) : null;
  
  // Substitute assignments state
  const [substituteAssignments, setSubstituteAssignments] = useState<any[]>([]);
  
  const mockOfficerProfile = user?.id ? getOfficerById(user.id) : null;
  const officerTimetable = getOfficerTimetableData(user?.id || '');
  const todaySlots = getTodaySchedule(officerTimetable?.slots || []);
  const upcomingSlots = getUpcomingSlots(officerTimetable?.slots || [], 3);

  // Load leave data on mount
  useEffect(() => {
    // Load leave data
    if (user?.id) {
      const applications = getLeaveApplicationsByOfficer(user.id);
      const approvedDates = getApprovedLeaveDates(user.id);
      const today = format(new Date(), 'yyyy-MM-dd');
      const todayLeave = getTodayLeaveDetails(user.id, today);

      setLeaveApplications(applications);
      setApprovedLeaveDates(approvedDates);
      setIsOnLeaveToday(approvedDates.includes(today));
      setTodayLeaveDetails(todayLeave);
      
      // Find substitute assignments where this officer is the substitute
      const allApplications = getAllLeaveApplications();
      const mySubstituteAssignments: any[] = [];
      
      allApplications.forEach(app => {
        if (app.status === 'approved' && app.substitute_assignments) {
          app.substitute_assignments.forEach(assignment => {
            if (assignment.substitute_officer_id === user.id) {
              const slot = app.affected_slots?.find(s => s.slot_id === assignment.slot_id);
              mySubstituteAssignments.push({
                ...assignment,
                slot,
                original_officer_name: app.officer_name,
                leave_id: app.id
              });
            }
          });
        }
      });
      
      setSubstituteAssignments(mySubstituteAssignments);
    }

    // Generate last 7 days with leave status
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayStr = format(date, 'EEE');
      const dayOfWeek = date.getDay();

      // Check if weekend
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      // Check if this date is on approved leave
      const isOnLeave = user?.id ? getApprovedLeaveDates(user.id).includes(dateStr) : false;
      const leaveDetails = user?.id ? getTodayLeaveDetails(user.id, dateStr) : null;

      const status = isWeekend
        ? ('weekend' as const)
        : isOnLeave
        ? ('leave' as const)
        : i === 0
        ? null
        : i % 3 === 0
        ? ('absent' as const)
        : ('present' as const);

      days.push({
        date: dateStr,
        day: dayStr,
        status,
        leaveType: leaveDetails?.leave_type,
      });
    }
    setLast7Days(days);
  }, [user?.id, todayKey]);

  const stats = [
    {
      title: 'Upcoming Sessions',
      value: dashboardStats?.upcomingSessions?.toString() || '0',
      icon: Calendar,
      description: `${upcomingSlots.length} upcoming this week`,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Active Projects',
      value: dashboardStats?.activeProjects?.toString() || '0',
      icon: TrendingUp,
      description: 'In progress',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Lab Equipment',
      value: dashboardStats?.labEquipment?.toString() || '0',
      icon: Package,
      description: 'Total items',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Students Enrolled',
      value: dashboardStats?.studentsEnrolled?.toString() || '0',
      icon: Users,
      description: 'Active students',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  const pendingProjects = [
    { id: '1', title: 'Smart Campus System', team: 'Team Alpha', status: 'Pending Review' },
    { id: '2', title: 'Eco-Friendly App', team: 'Team Beta', status: 'Pending Review' },
    { id: '3', title: 'Healthcare Chatbot', team: 'Team Gamma', status: 'Pending Review' },
  ];

  // Derive check-in state from Supabase attendance
  const isCheckedIn = todayAttendance?.status === 'checked_in';
  const checkInTime = todayAttendance?.check_in_time 
    ? format(new Date(todayAttendance.check_in_time), 'hh:mm a') 
    : null;
  const checkInLocation = todayAttendance?.check_in_latitude 
    ? { 
        latitude: todayAttendance.check_in_latitude, 
        longitude: todayAttendance.check_in_longitude || 0,
        timestamp: todayAttendance.check_in_time || new Date().toISOString()
      }
    : null;
  const locationValidated = todayAttendance?.check_in_validated ?? null;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-3">
          <div>
            <h1 className="text-3xl font-bold">Innovation Officer Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user?.name}!</p>
          </div>
          
          {/* Assigned Institution Badge */}
          {officerProfile && officerProfile.assigned_institutions.length > 0 && (
            <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-lg w-fit">
              <Building2 className="h-4 w-4 text-primary" />
              <div>
                <span className="text-sm font-medium">Assigned to:</span>
                <span className="ml-2 text-sm text-muted-foreground">
                  {officerProfile.assigned_institutions.join(', ')}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <div className={`${stat.bgColor} p-2 rounded-lg`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* GPS-based Check-in Card from Supabase */}
          {officerProfile && primaryInstitutionId ? (
            <OfficerCheckInCard 
              officerId={officerProfile.id} 
              institutionId={primaryInstitutionId}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Daily Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No institution assigned</p>
                  <p className="text-xs">Contact management to assign you to an institution</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Delegated Classes Today - Only shows if there are delegated classes */}
          {officerProfile && primaryInstitutionId && (
            <DelegatedClassesCard 
              officerId={officerProfile.id} 
              institutionId={primaryInstitutionId}
            />
          )}

          {/* Upcoming Classes with Transfer Option */}
          {officerProfile && primaryInstitutionId && (
            <UpcomingClassesCard 
              officerId={officerProfile.id} 
              institutionId={primaryInstitutionId}
            />
          )}

          {/* My Schedule */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>My Schedule</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link to={`/tenant/${tenantId}/officer/sessions`}>View Full Timetable</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {!officerTimetable || officerTimetable.slots.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No schedule assigned yet</p>
                  <p className="text-sm">Contact management to get your timetable assigned</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {todaySlots.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-1 w-1 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm font-semibold text-green-700">Today's Classes</span>
                      </div>
                      {todaySlots.map((slot) => (
                        <div 
                          key={slot.id} 
                          className="flex items-center justify-between border-b pb-3 mb-3 last:border-0"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${getActivityColor(slot.type)}`}>
                              <span className="text-lg">{getActivityIcon(slot.type)}</span>
                            </div>
                            <div>
                              <p className="font-medium">{slot.subject}</p>
                              <p className="text-sm text-muted-foreground">
                                {slot.class} • {slot.room}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  {slot.start_time} - {slot.end_time}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" asChild>
                            <Link to={`/tenant/${tenantId}/officer/sessions`}>Start</Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {upcomingSlots.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground mb-3">Upcoming This Week</p>
                      {upcomingSlots.map((slot) => (
                        <div 
                          key={slot.id} 
                          className="flex items-center justify-between border-b pb-3 mb-3 last:border-0"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${getActivityColor(slot.type)}`}>
                              <span className="text-lg">{getActivityIcon(slot.type)}</span>
                            </div>
                            <div>
                              <p className="font-medium">{slot.subject}</p>
                              <p className="text-sm text-muted-foreground">
                                {slot.day}, {slot.start_time} • {slot.class}
                              </p>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">{slot.room}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {todaySlots.length === 0 && upcomingSlots.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      <p className="text-sm">No upcoming classes scheduled</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Projects */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Projects Pending Review</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link to={`/tenant/${tenantId}/officer/projects`}>View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingProjects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div className="flex items-start gap-3">
                      <div className="bg-orange-500/10 p-2 rounded-lg">
                        <TrendingUp className="h-4 w-4 text-orange-500" />
                      </div>
                      <div>
                        <p className="font-medium">{project.title}</p>
                        <p className="text-sm text-muted-foreground">{project.team}</p>
                      </div>
                    </div>
                    <span className="text-xs bg-orange-500/10 text-orange-500 px-2 py-1 rounded-full">
                      {project.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Substitute Assignments Card */}
          {substituteAssignments.length > 0 && (
            <Card className="border-orange-200 dark:border-orange-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-orange-600" />
                  My Substitute Assignments
                </CardTitle>
                <CardDescription>Classes you're covering for other officers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {substituteAssignments.slice(0, 5).map((assignment, idx) => (
                    <div key={idx} className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <p className="font-semibold text-sm">{assignment.slot?.subject}</p>
                          <p className="text-xs text-muted-foreground">
                            Covering for: {assignment.original_officer_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(assignment.date), 'MMM dd, yyyy')} • {assignment.slot?.start_time}-{assignment.slot?.end_time}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {assignment.slot?.class} • {assignment.slot?.room}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-orange-100 text-orange-800">
                            Substitute
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">{assignment.hours}h</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {substituteAssignments.length > 5 && (
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link to={`/tenant/${tenantId}/officer/sessions`}>
                        View All {substituteAssignments.length} Assignments
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Leave Balance - Full Width */}
        {leaveBalance && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Leave Balance ({currentYear})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground mb-2">Casual Leave</span>
                  <Badge variant={leaveBalance.casual_leave > 5 ? "default" : "destructive"} className="text-lg px-4 py-2">
                    {leaveBalance.casual_leave} days
                  </Badge>
                </div>
                <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground mb-2">Sick Leave</span>
                  <Badge variant={leaveBalance.sick_leave > 3 ? "default" : "destructive"} className="text-lg px-4 py-2">
                    {leaveBalance.sick_leave} days
                  </Badge>
                </div>
                <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground mb-2">Earned Leave</span>
                  <Badge variant={leaveBalance.earned_leave > 7 ? "default" : "destructive"} className="text-lg px-4 py-2">
                    {leaveBalance.earned_leave} days
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* My Salary Tracker - Real Data */}
        <SalaryProgressCard
          monthlyBase={salaryData?.monthlyBase || 0}
          daysPresent={salaryData?.daysPresent || 0}
          workingDays={salaryData?.workingDays || 26}
          earnedSalary={salaryData?.earnedSalary || 0}
          overtimeHours={salaryData?.overtimeHours || 0}
          overtimePay={salaryData?.overtimePay || 0}
          totalEarnings={salaryData?.totalEarnings || 0}
          progressPercentage={salaryData?.progressPercentage || 0}
          isLoading={isLoadingSalary}
        />
        
        {/* Tasks Summary - Real Data */}
        <TasksSummaryCard 
          tasks={tasks}
          isLoading={isLoadingTasks}
          tasksPath={`/tenant/${tenantId}/officer/tasks`}
          title="My Tasks"
        />

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <Button variant="outline" className="h-24 flex-col gap-2" asChild>
                <Link to={`/tenant/${tenantId}/officer/sessions`}>
                  <Calendar className="h-6 w-6" />
                  View My Timetable
                </Link>
              </Button>
              <Button variant="outline" className="h-24 flex-col gap-2" asChild>
                <Link to={`/tenant/${tenantId}/officer/projects`}>
                  <CheckCircle className="h-6 w-6" />
                  Review Projects
                </Link>
              </Button>
              <Button variant="outline" className="h-24 flex-col gap-2" asChild>
                <Link to={`/tenant/${tenantId}/officer/inventory`}>
                  <Package className="h-6 w-6" />
                  Manage Inventory
                </Link>
              </Button>
              <Button variant="outline" className="h-24 flex-col gap-2" asChild>
                <Link to={`/tenant/${tenantId}/officer/attendance`}>
                  <Users className="h-6 w-6" />
                  Mark Attendance
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
