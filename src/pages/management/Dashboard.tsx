import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, GraduationCap, TrendingUp, AlertCircle, Award, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/auth.service";
import { InstitutionHeader } from "@/components/management/InstitutionHeader";
import { CriticalActionsCard } from "@/components/management/CriticalActionsCard";
import { mockCriticalActions } from "@/data/mockManagementData";

const Dashboard = () => {
  const { user } = useAuth();
  const tenant = authService.getTenant();

  const metrics = [
    { title: "Total Faculty", value: "186", change: "+8", icon: Users, color: "text-blue-500", bgColor: "bg-blue-500/10" },
    { title: "Total Students", value: "2,845", change: "+12%", icon: GraduationCap, color: "text-green-500", bgColor: "bg-green-500/10" },
    { title: "Active Courses", value: "245", change: "+15", icon: BookOpen, color: "text-purple-500", bgColor: "bg-purple-500/10" },
    { title: "Avg. CGPA", value: "7.8", change: "+0.3", icon: TrendingUp, color: "text-orange-500", bgColor: "bg-orange-500/10" },
  ];

  const departmentPerformance = [
    { name: "Computer Science", teachers: 28, students: 520, performance: 88, trend: "up" },
    { name: "Electronics", teachers: 24, students: 450, performance: 85, trend: "up" },
    { name: "Mechanical", teachers: 26, students: 480, performance: 82, trend: "stable" },
    { name: "Civil", teachers: 22, students: 390, performance: 84, trend: "up" },
    { name: "Electrical", teachers: 23, students: 425, performance: 86, trend: "up" },
  ];

  const alerts = [
    { type: "warning", message: "3 faculty members pending performance review", icon: AlertCircle },
    { type: "info", message: "Semester exam schedule due in 7 days", icon: Award },
    { type: "success", message: "All departments meeting attendance targets", icon: TrendingUp },
  ];

  const recentActivities = [
    { id: '1', title: 'New batch enrollment completed', time: '2 hours ago', type: 'enrollment' },
    { id: '2', title: 'Semester exam schedule published', time: '5 hours ago', type: 'academic' },
    { id: '3', title: 'Faculty development workshop scheduled', time: '1 day ago', type: 'event' },
    { id: '4', title: 'Student placement drive initiated', time: '2 days ago', type: 'placement' },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <InstitutionHeader />
        
        <div>
          <h1 className="text-3xl font-bold">Management Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}! Complete institution and department overview</p>
        </div>

        {/* Critical Actions Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Critical Actions</h2>
              <p className="text-sm text-muted-foreground">Items requiring immediate attention</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {mockCriticalActions.map((action) => (
              <CriticalActionsCard key={action.id} action={action} />
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card key={metric.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                  <div className={`${metric.bgColor} p-2 rounded-lg`}>
                    <Icon className={`h-4 w-4 ${metric.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-500">{metric.change}</span> from last semester
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Important Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {alerts.map((alert, index) => (
              <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                <alert.icon className={`h-5 w-5 mt-0.5 ${
                  alert.type === 'warning' ? 'text-yellow-500' :
                  alert.type === 'success' ? 'text-green-500' : 'text-blue-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm">{alert.message}</p>
                </div>
                <Badge variant={alert.type === 'warning' ? 'destructive' : 'secondary'}>
                  {alert.type}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Department Performance */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Department Performance Overview</CardTitle>
              <Button variant="outline" size="sm">View All</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departmentPerformance.map((dept) => (
                  <div key={dept.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{dept.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {dept.teachers} Teachers • {dept.students} Students
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={dept.trend === 'up' ? 'default' : 'secondary'}>
                          {dept.trend === 'up' ? '↑' : '→'} {dept.trend}
                        </Badge>
                        <span className="text-xl font-bold">{dept.performance}%</span>
                      </div>
                    </div>
                    <Progress value={dept.performance} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Activities</CardTitle>
              <Button variant="outline" size="sm">View All</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 border-b pb-3 last:border-0">
                    <div className="bg-primary/10 p-2 rounded-lg mt-1">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
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
                <Link to={`/tenant/${tenant?.slug}/management/teachers`}>
                  <Users className="h-6 w-6" />
                  People Management
                </Link>
              </Button>
              <Button variant="outline" className="h-24 flex-col gap-2" asChild>
                <Link to={`/tenant/${tenant?.slug}/management/courses-sessions`}>
                  <BookOpen className="h-6 w-6" />
                  Courses & Sessions
                </Link>
              </Button>
              <Button variant="outline" className="h-24 flex-col gap-2" asChild>
                <Link to={`/tenant/${tenant?.slug}/management/inventory-purchase`}>
                  <TrendingUp className="h-6 w-6" />
                  Inventory & Purchase
                </Link>
              </Button>
              <Button variant="outline" className="h-24 flex-col gap-2" asChild>
                <Link to={`/tenant/${tenant?.slug}/management/reports`}>
                  <TrendingUp className="h-6 w-6" />
                  Reports
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
