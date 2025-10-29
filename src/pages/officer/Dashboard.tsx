import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Package, TrendingUp, Clock, CheckCircle, Check, X, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/auth.service';
import { Layout } from '@/components/layout/Layout';
import { toast } from 'sonner';
import { useState } from 'react';
import { format } from 'date-fns';
import { getOfficerById } from '@/data/mockOfficerData';
import { getOfficerTimetable } from '@/data/mockOfficerTimetable';
import { OfficerTimetableSlot } from '@/types/officer';

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
  
  // Get future slots from today onwards
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
  const { user } = useAuth();
  const tenant = authService.getTenant();
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [attendanceTime, setAttendanceTime] = useState<string | null>(null);
  
  const officerProfile = getOfficerById(user?.id || '');
  const officerTimetable = getOfficerTimetable(user?.id || '');
  const todaySlots = getTodaySchedule(officerTimetable?.slots || []);
  const upcomingSlots = getUpcomingSlots(officerTimetable?.slots || [], 3);

  const handleMarkAttendance = () => {
    const currentTime = format(new Date(), 'hh:mm a');
    setAttendanceMarked(true);
    setAttendanceTime(currentTime);
    toast.success(`Attendance marked as Present at ${currentTime}`);
  };

  const stats = [
    {
      title: 'Upcoming Sessions',
      value: officerTimetable ? officerTimetable.total_hours.toString() : '0',
      icon: Calendar,
      description: `${upcomingSlots.length} upcoming this week`,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Active Projects',
      value: '28',
      icon: TrendingUp,
      description: '8 pending review',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Lab Equipment',
      value: '156',
      icon: Package,
      description: '12 in maintenance',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Students Enrolled',
      value: '342',
      icon: Users,
      description: '89% attendance rate',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  const pendingProjects = [
    { id: '1', title: 'Smart Campus System', team: 'Team Alpha', status: 'Pending Review' },
    { id: '2', title: 'Eco-Friendly App', team: 'Team Beta', status: 'Pending Review' },
    { id: '3', title: 'Healthcare Chatbot', team: 'Team Gamma', status: 'Pending Review' },
  ];

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
        {/* Daily Attendance Card */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                {!attendanceMarked ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-4">
                      Mark your attendance for {format(new Date(), 'MMMM dd, yyyy')}
                    </p>
                    <Button onClick={handleMarkAttendance} className="w-full">
                      <Check className="mr-2 h-4 w-4" />
                      Mark Present
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="bg-green-500/10 p-4 rounded-lg mb-4">
                      <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <p className="font-medium text-green-700">Attendance Marked</p>
                      <p className="text-sm text-green-600">Present at {attendanceTime}</p>
                    </div>
                  </>
                )}
              </div>

              {/* Last 7 Days Attendance History */}
              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-3">Last 7 Days</p>
                <div className="grid grid-cols-7 gap-2">
                  {[
                    { day: 'M', status: 'present' },
                    { day: 'T', status: 'present' },
                    { day: 'W', status: 'present' },
                    { day: 'T', status: 'leave' },
                    { day: 'F', status: 'present' },
                    { day: 'S', status: 'weekend' },
                    { day: 'S', status: 'weekend' },
                  ].map((day, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center"
                      title={
                        day.status === 'present'
                          ? 'Present'
                          : day.status === 'leave'
                          ? 'Leave'
                          : 'Weekend'
                      }
                    >
                      <span className="text-xs text-muted-foreground mb-1">{day.day}</span>
                      <div
                        className={`w-8 h-8 rounded flex items-center justify-center text-xs ${
                          day.status === 'present'
                            ? 'bg-green-500/20 text-green-700'
                            : day.status === 'leave'
                            ? 'bg-yellow-500/20 text-yellow-700'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {day.status === 'present' ? (
                          <Check className="h-3 w-3" />
                        ) : day.status === 'leave' ? (
                          'L'
                        ) : (
                          '-'
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* My Schedule / Timetable */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>My Schedule</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link to={`/tenant/${tenant?.slug}/officer/sessions`}>View Full Timetable</Link>
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
                {/* Today's Classes Section */}
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
                          <Link to={`/tenant/${tenant?.slug}/officer/sessions`}>Start</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Upcoming Classes */}
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
              <Link to={`/tenant/${tenant?.slug}/officer/projects`}>View All</Link>
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
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button variant="outline" className="h-24 flex-col gap-2" asChild>
              <Link to={`/tenant/${tenant?.slug}/officer/sessions`}>
                <Calendar className="h-6 w-6" />
                View My Timetable
              </Link>
            </Button>
            <Button variant="outline" className="h-24 flex-col gap-2" asChild>
              <Link to={`/tenant/${tenant?.slug}/officer/projects`}>
                <CheckCircle className="h-6 w-6" />
                Review Projects
              </Link>
            </Button>
            <Button variant="outline" className="h-24 flex-col gap-2" asChild>
              <Link to={`/tenant/${tenant?.slug}/officer/inventory`}>
                <Package className="h-6 w-6" />
                Manage Inventory
              </Link>
            </Button>
            <Button variant="outline" className="h-24 flex-col gap-2" asChild>
              <Link to={`/tenant/${tenant?.slug}/officer/attendance`}>
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
