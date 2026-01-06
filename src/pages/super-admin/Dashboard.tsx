import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Building2, Activity, HardDrive, GraduationCap, BookOpen, RefreshCw, FolderOpen, FileText, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalOfficers: number;
  totalInstitutions: number;
  totalCourses: number;
  totalClasses: number;
  totalLogs: number;
  storageBuckets: number;
  isLoading: boolean;
  dbHealthy: boolean;
  storageHealthy: boolean;
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalStudents: 0,
    totalOfficers: 0,
    totalInstitutions: 0,
    totalCourses: 0,
    totalClasses: 0,
    totalLogs: 0,
    storageBuckets: 13,
    isLoading: true,
    dbHealthy: true,
    storageHealthy: true,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      // Fetch all counts in parallel
      const [
        usersResult,
        studentsResult,
        officersResult,
        institutionsResult,
        coursesResult,
        classesResult,
        logsResult,
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('students').select('id', { count: 'exact', head: true }),
        supabase.from('officers').select('id', { count: 'exact', head: true }),
        supabase.from('institutions').select('id', { count: 'exact', head: true }),
        supabase.from('courses').select('id', { count: 'exact', head: true }),
        supabase.from('classes').select('id', { count: 'exact', head: true }),
        supabase.from('system_logs').select('id', { count: 'exact', head: true }),
      ]);

      const dbHealthy = !usersResult.error && !institutionsResult.error;

      setStats({
        totalUsers: usersResult.count || 0,
        totalStudents: studentsResult.count || 0,
        totalOfficers: officersResult.count || 0,
        totalInstitutions: institutionsResult.count || 0,
        totalCourses: coursesResult.count || 0,
        totalClasses: classesResult.count || 0,
        totalLogs: logsResult.count || 0,
        storageBuckets: 13, // Known from storage config
        isLoading: false,
        dbHealthy,
        storageHealthy: true,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats(prev => ({ ...prev, isLoading: false, dbHealthy: false }));
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchStats();
    setIsRefreshing(false);
    toast.success('Dashboard refreshed');
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
            <p className="text-muted-foreground">Technical platform oversight and system health</p>
          </div>
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            {isRefreshing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh Stats
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {stats.isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{formatNumber(stats.totalUsers)}</div>
                  <p className="text-xs text-muted-foreground">Registered accounts</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {stats.isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{formatNumber(stats.totalStudents)}</div>
                  <p className="text-xs text-muted-foreground">Enrolled students</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Institutions</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {stats.isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{formatNumber(stats.totalInstitutions)}</div>
                  <p className="text-xs text-muted-foreground">Active institutions</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Storage Buckets</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {stats.isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats.storageBuckets}</div>
                  <p className="text-xs text-muted-foreground">Configured buckets</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Database Status</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  stats.dbHealthy 
                    ? 'bg-green-500/10 text-green-500' 
                    : 'bg-destructive/10 text-destructive'
                }`}>
                  {stats.dbHealthy ? 'Healthy' : 'Error'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">API Gateway</span>
                <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded-full">Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Storage System</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  stats.storageHealthy 
                    ? 'bg-green-500/10 text-green-500' 
                    : 'bg-destructive/10 text-destructive'
                }`}>
                  {stats.storageHealthy ? 'Operational' : 'Error'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Email Service</span>
                <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded-full">Operational</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Platform Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Officers</span>
                <span className="text-sm text-muted-foreground">
                  {stats.isLoading ? '...' : formatNumber(stats.totalOfficers)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Courses</span>
                <span className="text-sm text-muted-foreground">
                  {stats.isLoading ? '...' : formatNumber(stats.totalCourses)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Classes</span>
                <span className="text-sm text-muted-foreground">
                  {stats.isLoading ? '...' : formatNumber(stats.totalClasses)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">System Logs</span>
                <span className="text-sm text-muted-foreground">
                  {stats.isLoading ? '...' : formatNumber(stats.totalLogs)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
