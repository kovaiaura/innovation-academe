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

export default function OfficerDashboard() {
  const { user } = useAuth();
  const tenant = authService.getTenant();
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [attendanceTime, setAttendanceTime] = useState<string | null>(null);
  
  const officerProfile = getOfficerById(user?.id || '');

  const handleMarkAttendance = () => {
    const currentTime = format(new Date(), 'hh:mm a');
    setAttendanceMarked(true);
    setAttendanceTime(currentTime);
    toast.success(`Attendance marked as Present at ${currentTime}`);
  };

  const stats = [
    {
      title: 'Upcoming Sessions',
      value: '12',
      icon: Calendar,
      description: '3 this week',
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

  const recentSessions = [
    { id: '1', title: 'AI & Machine Learning Workshop', time: '10:00 AM', date: 'Today', attendees: 45 },
    { id: '2', title: 'Startup Pitch Session', time: '2:00 PM', date: 'Tomorrow', attendees: 30 },
    { id: '3', title: 'IoT Hackathon', time: '9:00 AM', date: 'Dec 20', attendees: 60 },
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

        {/* Recent Sessions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming Sessions</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link to={`/tenant/${tenant?.slug}/officer/sessions`}>View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{session.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {session.date} at {session.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {session.attendees}
                  </div>
                </div>
              ))}
            </div>
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
                Schedule Session
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
