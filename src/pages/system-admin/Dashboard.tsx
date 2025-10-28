import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Users, GraduationCap, Key, TrendingUp, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';

export default function SystemAdminDashboard() {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Total Institutions',
      value: '48',
      icon: Building2,
      description: '+5 this month',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Total Users',
      value: '12,456',
      icon: Users,
      description: 'Across all institutions',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Total Students',
      value: '8,942',
      icon: GraduationCap,
      description: '72% of total users',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Active Licenses',
      value: '45',
      icon: Key,
      description: '3 expiring soon',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  const recentInstitutions = [
    { id: '1', name: 'Springfield College', type: 'College', users: 245, status: 'active' },
    { id: '2', name: 'Tech University', type: 'University', users: 892, status: 'active' },
    { id: '3', name: 'Innovation Institute', type: 'Institute', users: 156, status: 'active' },
  ];

  const alerts = [
    { id: '1', message: 'Springfield College license expires in 15 days', severity: 'warning' },
    { id: '2', message: 'Tech University exceeded user limit by 10%', severity: 'error' },
    { id: '3', message: 'New institution signup: Design Academy', severity: 'info' },
  ];

  const topInstitutions = [
    { name: 'Tech University', users: 892, growth: '+12%' },
    { name: 'Engineering College', users: 654, growth: '+8%' },
    { name: 'Medical School', users: 543, growth: '+15%' },
    { name: 'Business Institute', users: 432, growth: '+5%' },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">System Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}! Manage institutions across the platform</p>
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

        <div className="grid gap-6 md:grid-cols-2">
          {/* System Alerts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>System Alerts</CardTitle>
              <Button variant="outline" size="sm">View All</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-3 border-b pb-3 last:border-0">
                    <div className={`p-2 rounded-lg ${
                      alert.severity === 'error' ? 'bg-red-500/10' :
                      alert.severity === 'warning' ? 'bg-yellow-500/10' :
                      'bg-blue-500/10'
                    }`}>
                      <AlertCircle className={`h-4 w-4 ${
                        alert.severity === 'error' ? 'text-red-500' :
                        alert.severity === 'warning' ? 'text-yellow-500' :
                        'text-blue-500'
                      }`} />
                    </div>
                    <p className="text-sm flex-1">{alert.message}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Institutions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Top Institutions</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link to="/system-admin/institutions">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topInstitutions.map((inst, index) => (
                  <div key={inst.name} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{inst.name}</p>
                        <p className="text-sm text-muted-foreground">{inst.users} users</p>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-green-500">{inst.growth}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Institutions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Institutions</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link to="/system-admin/institutions">Manage All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentInstitutions.map((inst) => (
                <div key={inst.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Building2 className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{inst.name}</p>
                      <p className="text-sm text-muted-foreground">{inst.type} • {inst.users} users</p>
                    </div>
                  </div>
                  <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded-full">
                    {inst.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <Button variant="outline" className="h-24 flex-col gap-2" asChild>
                <Link to="/system-admin/institutions">
                  <Building2 className="h-6 w-6" />
                  Manage Institutions
                </Link>
              </Button>
              <Button variant="outline" className="h-24 flex-col gap-2" asChild>
                <Link to="/system-admin/licenses">
                  <Key className="h-6 w-6" />
                  License Management
                </Link>
              </Button>
              <Button variant="outline" className="h-24 flex-col gap-2" asChild>
                <Link to="/system-admin/reports">
                  <TrendingUp className="h-6 w-6" />
                  System Reports
                </Link>
              </Button>
              <Button variant="outline" className="h-24 flex-col gap-2" asChild>
                <Link to="/system-admin/analytics">
                  <TrendingUp className="h-6 w-6" />
                  Analytics
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
