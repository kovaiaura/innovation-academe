import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, GraduationCap, TrendingUp, AlertCircle, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const Dashboard = () => {
  const metrics = [
    { title: "Total Faculty", value: "45", change: "+3", icon: Users, color: "text-blue-500" },
    { title: "Total Students", value: "1,250", change: "+85", icon: GraduationCap, color: "text-green-500" },
    { title: "Active Courses", value: "32", change: "+2", icon: BookOpen, color: "text-purple-500" },
    { title: "Avg. Performance", value: "87%", change: "+5%", icon: TrendingUp, color: "text-orange-500" },
  ];

  const departmentPerformance = [
    { name: "Computer Science", teachers: 12, students: 350, performance: 88, trend: "up" },
    { name: "Electronics", teachers: 10, students: 280, performance: 85, trend: "up" },
    { name: "Mechanical", teachers: 11, students: 320, performance: 82, trend: "stable" },
    { name: "Civil", teachers: 12, students: 300, performance: 84, trend: "up" },
  ];

  const alerts = [
    { type: "warning", message: "3 faculty members pending performance review", icon: AlertCircle },
    { type: "info", message: "Q1 reports due in 7 days", icon: Award },
    { type: "success", message: "All departments meeting attendance targets", icon: TrendingUp },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Management Dashboard</h1>
          <p className="text-muted-foreground">Department-level overview and analytics</p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <Card key={metric.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-500">{metric.change}</span> from last month
                </p>
              </CardContent>
            </Card>
          ))}
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

        {/* Department Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Department Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
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
                      <span className="text-2xl font-bold">{dept.performance}%</span>
                    </div>
                  </div>
                  <Progress value={dept.performance} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
