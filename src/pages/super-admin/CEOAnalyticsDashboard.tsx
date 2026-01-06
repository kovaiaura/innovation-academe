import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { 
  Building2, Users, BookOpen, Target, Trophy, RefreshCw, 
  GraduationCap, FileText, Award, TrendingUp, BarChart3, Loader2 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

interface InstitutionStats {
  id: string;
  name: string;
  studentCount: number;
  classCount: number;
  courseCount: number;
}

interface Stats {
  totalInstitutions: number;
  totalStudents: number;
  totalCourses: number;
  totalProjects: number;
  totalEvents: number;
  totalOfficers: number;
  totalClasses: number;
  totalAssessmentAttempts: number;
  assessmentPassRate: number;
  avgAssessmentScore: number;
  totalAssignmentSubmissions: number;
  avgAssignmentMarks: number;
  totalXP: number;
  xpTransactions: number;
  institutionStats: InstitutionStats[];
  isLoading: boolean;
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function CEOAnalyticsDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalInstitutions: 0,
    totalStudents: 0,
    totalCourses: 0,
    totalProjects: 0,
    totalEvents: 0,
    totalOfficers: 0,
    totalClasses: 0,
    totalAssessmentAttempts: 0,
    assessmentPassRate: 0,
    avgAssessmentScore: 0,
    totalAssignmentSubmissions: 0,
    avgAssignmentMarks: 0,
    totalXP: 0,
    xpTransactions: 0,
    institutionStats: [],
    isLoading: true,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      // Fetch all counts in parallel
      const [
        institutionsRes,
        studentsRes,
        coursesRes,
        projectsRes,
        eventsRes,
        officersRes,
        classesRes,
        assessmentAttemptsRes,
        assignmentSubmissionsRes,
        xpRes,
        institutionListRes,
      ] = await Promise.all([
        supabase.from('institutions').select('id', { count: 'exact', head: true }),
        supabase.from('students').select('id', { count: 'exact', head: true }),
        supabase.from('courses').select('id', { count: 'exact', head: true }),
        supabase.from('projects').select('id', { count: 'exact', head: true }),
        supabase.from('events').select('id', { count: 'exact', head: true }),
        supabase.from('officers').select('id', { count: 'exact', head: true }),
        supabase.from('classes').select('id', { count: 'exact', head: true }),
        supabase.from('assessment_attempts').select('id, passed, percentage', { count: 'exact' }).eq('status', 'completed'),
        supabase.from('assignment_submissions').select('id, marks_obtained', { count: 'exact' }),
        supabase.from('student_xp_transactions').select('points_earned', { count: 'exact' }),
        supabase.from('institutions').select('id, name'),
      ]);

      // Calculate assessment stats
      let passRate = 0;
      let avgScore = 0;
      if (assessmentAttemptsRes.data && assessmentAttemptsRes.data.length > 0) {
        const passedCount = assessmentAttemptsRes.data.filter(a => a.passed).length;
        passRate = Math.round((passedCount / assessmentAttemptsRes.data.length) * 100);
        avgScore = Math.round(
          assessmentAttemptsRes.data.reduce((sum, a) => sum + (a.percentage || 0), 0) / assessmentAttemptsRes.data.length
        );
      }

      // Calculate assignment stats
      let avgMarks = 0;
      if (assignmentSubmissionsRes.data && assignmentSubmissionsRes.data.length > 0) {
        const validMarks = assignmentSubmissionsRes.data.filter(s => s.marks_obtained != null);
        if (validMarks.length > 0) {
          avgMarks = Math.round(
            validMarks.reduce((sum, s) => sum + (s.marks_obtained || 0), 0) / validMarks.length
          );
        }
      }

      // Calculate XP stats
      let totalXP = 0;
      if (xpRes.data) {
        totalXP = xpRes.data.reduce((sum, t) => sum + (t.points_earned || 0), 0);
      }

      // Get institution-level stats
      const institutionStats: InstitutionStats[] = [];
      if (institutionListRes.data) {
        for (const inst of institutionListRes.data) {
          const [studentsCount, classesCount, coursesCount] = await Promise.all([
            supabase.from('students').select('id', { count: 'exact', head: true }).eq('institution_id', inst.id),
            supabase.from('classes').select('id', { count: 'exact', head: true }).eq('institution_id', inst.id),
            supabase.from('course_institution_assignments').select('id', { count: 'exact', head: true }).eq('institution_id', inst.id),
          ]);
          
          institutionStats.push({
            id: inst.id,
            name: inst.name,
            studentCount: studentsCount.count || 0,
            classCount: classesCount.count || 0,
            courseCount: coursesCount.count || 0,
          });
        }
      }

      setStats({
        totalInstitutions: institutionsRes.count || 0,
        totalStudents: studentsRes.count || 0,
        totalCourses: coursesRes.count || 0,
        totalProjects: projectsRes.count || 0,
        totalEvents: eventsRes.count || 0,
        totalOfficers: officersRes.count || 0,
        totalClasses: classesRes.count || 0,
        totalAssessmentAttempts: assessmentAttemptsRes.count || 0,
        assessmentPassRate: passRate,
        avgAssessmentScore: avgScore,
        totalAssignmentSubmissions: assignmentSubmissionsRes.count || 0,
        avgAssignmentMarks: avgMarks,
        totalXP: totalXP,
        xpTransactions: xpRes.count || 0,
        institutionStats,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats(prev => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchStats();
    setIsRefreshing(false);
    toast.success('Analytics refreshed');
  };

  // Prepare chart data
  const institutionChartData = stats.institutionStats.map(inst => ({
    name: inst.name.length > 15 ? inst.name.substring(0, 15) + '...' : inst.name,
    students: inst.studentCount,
    classes: inst.classCount,
    courses: inst.courseCount,
  }));

  const studentDistributionData = stats.institutionStats.map((inst, idx) => ({
    name: inst.name,
    value: inst.studentCount,
    color: COLORS[idx % COLORS.length],
  }));

  if (stats.isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">CEO Analytics Dashboard</h1>
            <p className="text-muted-foreground">Comprehensive institution metrics for investor pitching</p>
          </div>
          <Button onClick={handleRefresh} disabled={isRefreshing}>
            {isRefreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Refresh
          </Button>
        </div>

        {/* Top KPI Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Institutions</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalInstitutions}</div>
              <p className="text-xs text-muted-foreground">Partner institutions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Students</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">Enrolled students</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCourses}</div>
              <p className="text-xs text-muted-foreground">Available courses</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projects</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProjects}</div>
              <p className="text-xs text-muted-foreground">Active projects</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Events</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEvents}</div>
              <p className="text-xs text-muted-foreground">Total events</p>
            </CardContent>
          </Card>
        </div>

        {/* Institution Comparison & Student Distribution */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Institution Comparison
              </CardTitle>
              <CardDescription>Students, classes, and courses per institution</CardDescription>
            </CardHeader>
            <CardContent>
              {institutionChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={institutionChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Legend />
                    <Bar dataKey="students" fill="hsl(var(--chart-1))" name="Students" />
                    <Bar dataKey="classes" fill="hsl(var(--chart-2))" name="Classes" />
                    <Bar dataKey="courses" fill="hsl(var(--chart-3))" name="Courses" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  No institution data available
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Student Distribution
              </CardTitle>
              <CardDescription>Students per institution</CardDescription>
            </CardHeader>
            <CardContent>
              {studentDistributionData.length > 0 && studentDistributionData.some(d => d.value > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={studentDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {studentDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  No student data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Assessment & Assignment Performance */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Assessment Performance
              </CardTitle>
              <CardDescription>Overall assessment metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Attempts</p>
                  <p className="text-2xl font-bold">{stats.totalAssessmentAttempts}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Pass Rate</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">{stats.assessmentPassRate}%</p>
                    <Badge variant={stats.assessmentPassRate >= 70 ? 'default' : 'secondary'}>
                      {stats.assessmentPassRate >= 70 ? 'Good' : 'Needs Improvement'}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Avg Score</p>
                  <p className="text-2xl font-bold">{stats.avgAssessmentScore}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Assignment Analytics
              </CardTitle>
              <CardDescription>Overall assignment metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Submissions</p>
                  <p className="text-2xl font-bold">{stats.totalAssignmentSubmissions}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Average Marks</p>
                  <p className="text-2xl font-bold">{stats.avgAssignmentMarks}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gamification & Platform Stats */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Gamification Stats
              </CardTitle>
              <CardDescription>Student engagement through gamification</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total XP Earned</p>
                  <p className="text-2xl font-bold text-primary">{stats.totalXP.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">XP Transactions</p>
                  <p className="text-2xl font-bold">{stats.xpTransactions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Platform Overview
              </CardTitle>
              <CardDescription>Quick pitch stats</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Officers</p>
                  <p className="text-2xl font-bold">{stats.totalOfficers}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Classes</p>
                  <p className="text-2xl font-bold">{stats.totalClasses}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Courses</p>
                  <p className="text-2xl font-bold">{stats.totalCourses}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Institution Details Table */}
        <Card>
          <CardHeader>
            <CardTitle>Institution Details</CardTitle>
            <CardDescription>Detailed breakdown by institution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Institution</th>
                    <th className="text-center py-3 px-4 font-medium">Students</th>
                    <th className="text-center py-3 px-4 font-medium">Classes</th>
                    <th className="text-center py-3 px-4 font-medium">Courses</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.institutionStats.length > 0 ? (
                    stats.institutionStats.map((inst) => (
                      <tr key={inst.id} className="border-b last:border-0">
                        <td className="py-3 px-4 font-medium">{inst.name}</td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant="outline">{inst.studentCount}</Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant="outline">{inst.classCount}</Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant="outline">{inst.courseCount}</Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-muted-foreground">
                        No institutions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
