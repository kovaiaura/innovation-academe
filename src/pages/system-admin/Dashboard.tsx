import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, GraduationCap, Key, TrendingUp, AlertCircle, Phone, Package, Calendar, CalendarCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { getPendingLeaveCount } from '@/data/mockLeaveData';

export default function SystemAdminDashboard() {
  const { user } = useAuth();
  const [pendingLeaveCount, setPendingLeaveCount] = useState(0);

  useEffect(() => {
    setPendingLeaveCount(getPendingLeaveCount());
  }, []);

  const stats = [
    {
      title: 'Total Tenants',
      value: '25',
      icon: Building2,
      description: '+3 this month',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Active Subscriptions',
      value: '22',
      icon: Key,
      description: '88% active rate',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Total Users',
      value: '15,420',
      icon: Users,
      description: 'Across all tenants',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Expiring Licenses',
      value: '3',
      icon: AlertCircle,
      description: 'Within 30 days',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'Pending Leave Approvals',
      value: pendingLeaveCount.toString(),
      icon: CalendarCheck,
      description: 'Require your attention',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      link: '/system-admin/leave-approvals',
    },
  ];

  const recentTenants = [
    { id: '1', name: 'Delhi Public School Network', plan: 'Premium', institutions: 5, users: 2450, status: 'active' },
    { id: '2', name: 'Ryan International Schools', plan: 'Enterprise', institutions: 8, users: 3800, status: 'active' },
    { id: '3', name: 'Innovation Hub Chennai', plan: 'Basic', institutions: 1, users: 450, status: 'active' },
  ];

  const alerts = [
    { id: '1', message: 'DPS Network license expires in 15 days', severity: 'warning' },
    { id: '2', message: 'Ryan Schools exceeded storage limit by 10%', severity: 'error' },
    { id: '3', message: 'New tenant signup: Tech Academy Network', severity: 'info' },
  ];

  const topTenants = [
    { name: 'Ryan International Schools', users: 3800, growth: '+12%' },
    { name: 'Delhi Public School Network', users: 2450, growth: '+8%' },
    { name: 'Cambridge International', users: 1890, growth: '+15%' },
    { name: 'Oxford Schools Group', users: 1650, growth: '+5%' },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">System Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}! Manage tenants and customer operations</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {stats.map((stat) => {
            const Icon = stat.icon;
            
            return stat.link ? (
              <Link key={stat.title} to={stat.link}>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
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
              </Link>
            ) : (
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

          {/* Top Tenants */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Top Tenants by Users</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link to="/system-admin/tenants">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topTenants.map((tenant, index) => (
                  <div key={tenant.name} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{tenant.name}</p>
                        <p className="text-sm text-muted-foreground">{tenant.users} users</p>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-green-500">{tenant.growth}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Tenants */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Tenants</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link to="/system-admin/tenants">Manage All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTenants.map((tenant) => (
                <div key={tenant.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Building2 className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{tenant.name}</p>
                      <p className="text-sm text-muted-foreground">{tenant.plan} • {tenant.institutions} institutions • {tenant.users} users</p>
                    </div>
                  </div>
                  <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded-full">
                    {tenant.status}
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
                  Institution Management
                </Link>
              </Button>
              <Button variant="outline" className="h-24 flex-col gap-2" asChild>
                <Link to="/system-admin/reports">
                  <TrendingUp className="h-6 w-6" />
                  System Reports
                </Link>
              </Button>
              <Button variant="outline" className="h-24 flex-col gap-2" asChild>
                <Link to="/system-admin/officers">
                  <Users className="h-6 w-6" />
                  Officer Management
                </Link>
              </Button>
              <Button variant="outline" className="h-24 flex-col gap-2" asChild>
                <Link to="/system-admin/crm#contacts">
                  <Phone className="h-6 w-6" />
                  CRM & Communication
                </Link>
              </Button>
              <Button variant="outline" className="h-24 flex-col gap-2" asChild>
                <Link to="/system-admin/inventory-management#overview">
                  <Package className="h-6 w-6" />
                  Inventory Management
                </Link>
              </Button>
              <Button variant="outline" className="h-24 flex-col gap-2" asChild>
                <Link to="/system-admin/institutional-calendar">
                  <Calendar className="h-6 w-6" />
                  Institutional Calendar
                </Link>
              </Button>
              <Button variant="outline" className="h-24 flex-col gap-2 relative" asChild>
                <Link to="/system-admin/leave-approvals">
                  <CalendarCheck className="h-6 w-6" />
                  Leave Approvals
                  {pendingLeaveCount > 0 && (
                    <Badge variant="destructive" className="absolute top-2 right-2">
                      {pendingLeaveCount}
                    </Badge>
                  )}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
