import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Building2, Users, BookOpen, Target, Trophy, RefreshCw, 
  GraduationCap, FileText, TrendingUp, BarChart3, Loader2, Globe, Activity 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import { SDG_GOALS, getSDGByNumber } from '@/services/sdg.service';
import { format, subDays, subWeeks, subMonths, startOfDay, startOfWeek, startOfMonth } from 'date-fns';

interface InstitutionStats {
  id: string;
  name: string;
  studentCount: number;
  classCount: number;
  courseCount: number;
}

interface SDGStats {
  activeSDGs: number[];
  sdgCounts: Record<number, number>;
  totalSDGProjects: number;
  studentsInSDGProjects: number;
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
  sdgStats: SDGStats;
  isLoading: boolean;
}

const VIBRANT_COLORS = ['#3B82F6', '#22C55E', '#F97316', '#A855F7', '#14B8A6', '#EF4444', '#F59E0B', '#EC4899'];
const PIE_COLORS = ['#3B82F6', '#22C55E', '#F97316', '#A855F7', '#14B8A6', '#EF4444', '#F59E0B', '#EC4899'];

const tooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  fontSize: '12px',
};

export default function CEOAnalyticsDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalInstitutions: 0, totalStudents: 0, totalCourses: 0, totalProjects: 0,
    totalEvents: 0, totalOfficers: 0, totalClasses: 0,
    totalAssessmentAttempts: 0, assessmentPassRate: 0, avgAssessmentScore: 0,
    totalAssignmentSubmissions: 0, avgAssignmentMarks: 0,
    totalXP: 0, xpTransactions: 0,
    institutionStats: [],
    sdgStats: { activeSDGs: [], sdgCounts: {}, totalSDGProjects: 0, studentsInSDGProjects: 0 },
    isLoading: true,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [engagementData, setEngagementData] = useState<{ label: string; count: number }[]>([]);
  const [engagementView, setEngagementView] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [xpGrowthData, setXpGrowthData] = useState<{ date: string; xp: number }[]>([]);
  const [projectStatusData, setProjectStatusData] = useState<{ status: string; count: number }[]>([]);

  const fetchStats = async () => {
    try {
      const [
        institutionsRes, studentsRes, coursesRes, projectsRes, eventsRes, officersRes, classesRes,
        assessmentAttemptsRes, assignmentSubmissionsRes, xpRes,
        institutionListRes, projectsWithSDGRes, projectMembersRes,
      ] = await Promise.all([
        supabase.from('institutions').select('id', { count: 'exact', head: true }),
        supabase.from('students').select('id', { count: 'exact', head: true }),
        supabase.from('courses').select('id', { count: 'exact', head: true }),
        supabase.from('projects').select('id', { count: 'exact', head: true }),
        supabase.from('events').select('id', { count: 'exact', head: true }),
        supabase.from('officers').select('id', { count: 'exact', head: true }),
        supabase.from('classes').select('id', { count: 'exact', head: true }),
        supabase.from('assessment_attempts').select('id, passed, percentage', { count: 'exact' })
          .in('status', ['completed', 'evaluated', 'submitted', 'auto_submitted']),
        supabase.from('assignment_submissions').select('id, marks_obtained', { count: 'exact' }),
        supabase.from('student_xp_transactions').select('points_earned', { count: 'exact' }),
        supabase.from('institutions').select('id, name'),
        supabase.from('projects').select('id, sdg_goals'),
        supabase.from('project_members').select('project_id, student_id'),
      ]);

      // Assessment stats
      let passRate = 0, avgScore = 0;
      if (assessmentAttemptsRes.data && assessmentAttemptsRes.data.length > 0) {
        const passedCount = assessmentAttemptsRes.data.filter(a => a.passed).length;
        passRate = Math.round((passedCount / assessmentAttemptsRes.data.length) * 100);
        avgScore = Math.round(assessmentAttemptsRes.data.reduce((sum, a) => sum + (a.percentage || 0), 0) / assessmentAttemptsRes.data.length);
      }

      // Assignment stats
      let avgMarks = 0;
      if (assignmentSubmissionsRes.data && assignmentSubmissionsRes.data.length > 0) {
        const validMarks = assignmentSubmissionsRes.data.filter(s => s.marks_obtained != null);
        if (validMarks.length > 0) {
          avgMarks = Math.round(validMarks.reduce((sum, s) => sum + (s.marks_obtained || 0), 0) / validMarks.length);
        }
      }

      let totalXP = 0;
      if (xpRes.data) totalXP = xpRes.data.reduce((sum, t) => sum + (t.points_earned || 0), 0);

      // SDG stats
      const sdgCounts: Record<number, number> = {};
      const activeSDGsSet = new Set<number>();
      let totalSDGProjects = 0;
      const sdgProjectIds: string[] = [];
      if (projectsWithSDGRes.data) {
        projectsWithSDGRes.data.forEach(p => {
          const goals = p.sdg_goals as number[] | null;
          if (goals && goals.length > 0) {
            totalSDGProjects++;
            sdgProjectIds.push(p.id);
            goals.forEach(g => { activeSDGsSet.add(g); sdgCounts[g] = (sdgCounts[g] || 0) + 1; });
          }
        });
      }
      const studentsInSDGProjects = new Set(
        (projectMembersRes.data || []).filter(m => sdgProjectIds.includes(m.project_id)).map(m => m.student_id)
      ).size;

      // Institution stats
      const institutionStats: InstitutionStats[] = [];
      if (institutionListRes.data) {
        for (const inst of institutionListRes.data) {
          const [studentsCount, classesCount, coursesAssignments] = await Promise.all([
            supabase.from('students').select('id', { count: 'exact', head: true }).eq('institution_id', inst.id),
            supabase.from('classes').select('id', { count: 'exact', head: true }).eq('institution_id', inst.id),
            supabase.from('course_class_assignments').select('course_id').eq('institution_id', inst.id),
          ]);
          const uniqueCourseIds = new Set(coursesAssignments.data?.map(c => c.course_id) || []);
          institutionStats.push({ id: inst.id, name: inst.name, studentCount: studentsCount.count || 0, classCount: classesCount.count || 0, courseCount: uniqueCourseIds.size });
        }
      }

      setStats({
        totalInstitutions: institutionsRes.count || 0, totalStudents: studentsRes.count || 0,
        totalCourses: coursesRes.count || 0, totalProjects: projectsRes.count || 0,
        totalEvents: eventsRes.count || 0, totalOfficers: officersRes.count || 0,
        totalClasses: classesRes.count || 0,
        totalAssessmentAttempts: assessmentAttemptsRes.count || 0,
        assessmentPassRate: passRate, avgAssessmentScore: avgScore,
        totalAssignmentSubmissions: assignmentSubmissionsRes.count || 0, avgAssignmentMarks: avgMarks,
        totalXP: totalXP, xpTransactions: xpRes.count || 0,
        institutionStats,
        sdgStats: { activeSDGs: Array.from(activeSDGsSet).sort((a, b) => a - b), sdgCounts, totalSDGProjects, studentsInSDGProjects },
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats(prev => ({ ...prev, isLoading: false }));
    }
  };

  const fetchEngagementData = async (view: 'daily' | 'weekly' | 'monthly') => {
    try {
      const { data: streakData } = await supabase
        .from('student_streaks')
        .select('last_activity_date');

      if (!streakData || streakData.length === 0) {
        setEngagementData([]);
        return;
      }

      const counts: Record<string, number> = {};
      
      if (view === 'daily') {
        // Last 14 days
        for (let i = 13; i >= 0; i--) {
          const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
          counts[d] = 0;
        }
        streakData.forEach(s => {
          if (s.last_activity_date && counts[s.last_activity_date] !== undefined) {
            counts[s.last_activity_date]++;
          }
        });
        setEngagementData(Object.entries(counts).map(([label, count]) => ({ label: format(new Date(label), 'MMM dd'), count })));
      } else if (view === 'weekly') {
        // Last 8 weeks
        for (let i = 7; i >= 0; i--) {
          const weekStart = format(startOfWeek(subWeeks(new Date(), i)), 'yyyy-MM-dd');
          counts[weekStart] = 0;
        }
        streakData.forEach(s => {
          if (s.last_activity_date) {
            const weekStart = format(startOfWeek(new Date(s.last_activity_date)), 'yyyy-MM-dd');
            if (counts[weekStart] !== undefined) counts[weekStart]++;
          }
        });
        setEngagementData(Object.entries(counts).map(([label, count]) => ({ label: format(new Date(label), 'MMM dd'), count })));
      } else {
        // Last 6 months
        for (let i = 5; i >= 0; i--) {
          const monthStart = format(startOfMonth(subMonths(new Date(), i)), 'yyyy-MM');
          counts[monthStart] = 0;
        }
        streakData.forEach(s => {
          if (s.last_activity_date) {
            const monthKey = s.last_activity_date.substring(0, 7);
            if (counts[monthKey] !== undefined) counts[monthKey]++;
          }
        });
        setEngagementData(Object.entries(counts).map(([label, count]) => ({ label: format(new Date(label + '-01'), 'MMM yyyy'), count })));
      }
    } catch (err) {
      console.error('Engagement fetch error:', err);
    }
  };

  const fetchXpGrowth = async () => {
    try {
      const { data } = await supabase
        .from('student_xp_transactions')
        .select('earned_at, points_earned')
        .order('earned_at', { ascending: true })
        .limit(1000);
      
      if (!data || data.length === 0) { setXpGrowthData([]); return; }

      const dailyMap: Record<string, number> = {};
      data.forEach(t => {
        const day = t.earned_at.substring(0, 10);
        dailyMap[day] = (dailyMap[day] || 0) + t.points_earned;
      });

      let cumulative = 0;
      const growth = Object.entries(dailyMap).sort().map(([date, points]) => {
        cumulative += points;
        return { date: format(new Date(date), 'MMM dd'), xp: cumulative };
      });
      setXpGrowthData(growth);
    } catch (err) { console.error('XP growth error:', err); }
  };

  const fetchProjectStatus = async () => {
    try {
      const { data } = await supabase.from('projects').select('status');
      if (!data) return;
      const counts: Record<string, number> = {};
      data.forEach(p => { counts[p.status] = (counts[p.status] || 0) + 1; });
      setProjectStatusData(Object.entries(counts).map(([status, count]) => ({ status: status.charAt(0).toUpperCase() + status.slice(1), count })));
    } catch (err) { console.error('Project status error:', err); }
  };

  useEffect(() => { fetchStats(); fetchEngagementData('daily'); fetchXpGrowth(); fetchProjectStatus(); }, []);
  useEffect(() => { fetchEngagementData(engagementView); }, [engagementView]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchStats(), fetchEngagementData(engagementView), fetchXpGrowth(), fetchProjectStatus()]);
    setIsRefreshing(false);
    toast.success('Analytics refreshed');
  };

  const institutionChartData = stats.institutionStats.map(inst => ({
    name: inst.name.length > 15 ? inst.name.substring(0, 15) + '...' : inst.name,
    students: inst.studentCount, classes: inst.classCount, courses: inst.courseCount,
  }));

  const studentDistributionData = stats.institutionStats.map((inst, idx) => ({
    name: inst.name, value: inst.studentCount, color: PIE_COLORS[idx % PIE_COLORS.length],
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

        {/* Institution Comparison (Area Chart) & Student Distribution */}
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
                  <AreaChart data={institutionChartData}>
                    <defs>
                      <linearGradient id="gradStudents" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradClasses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradCourses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" tick={{ fontSize: 11 }} />
                    <YAxis className="text-xs" tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    <Area type="monotone" dataKey="students" stroke="#3B82F6" fill="url(#gradStudents)" strokeWidth={2} name="Students" />
                    <Area type="monotone" dataKey="classes" stroke="#22C55E" fill="url(#gradClasses)" strokeWidth={2} name="Classes" />
                    <Area type="monotone" dataKey="courses" stroke="#F97316" fill="url(#gradCourses)" strokeWidth={2} name="Courses" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">No institution data available</div>
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
                    <Pie data={studentDistributionData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}>
                      {studentDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">No student data available</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Student Engagement Graph */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Student Engagement
                </CardTitle>
                <CardDescription>Active students based on login activity</CardDescription>
              </div>
              <Tabs value={engagementView} onValueChange={(v) => setEngagementView(v as any)} className="w-auto">
                <TabsList className="h-8">
                  <TabsTrigger value="daily" className="text-xs px-3 h-7">Daily</TabsTrigger>
                  <TabsTrigger value="weekly" className="text-xs px-3 h-7">Weekly</TabsTrigger>
                  <TabsTrigger value="monthly" className="text-xs px-3 h-7">Monthly</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {engagementData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={engagementData}>
                  <defs>
                    <linearGradient id="gradEngagement" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="label" className="text-xs" tick={{ fontSize: 10 }} />
                  <YAxis className="text-xs" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value} students`, 'Active']} />
                  <Area type="monotone" dataKey="count" stroke="#8B5CF6" fill="url(#gradEngagement)" strokeWidth={2.5} dot={{ r: 3, fill: '#8B5CF6' }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">No engagement data available</div>
            )}
          </CardContent>
        </Card>

        {/* XP Growth & Project Activity */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                XP Growth Trend
              </CardTitle>
              <CardDescription>Cumulative XP over time</CardDescription>
            </CardHeader>
            <CardContent>
              {xpGrowthData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={xpGrowthData}>
                    <defs>
                      <linearGradient id="gradXP" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 10 }} />
                    <YAxis className="text-xs" tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value.toLocaleString()} XP`, 'Total']} />
                    <Area type="monotone" dataKey="xp" stroke="#14B8A6" fill="url(#gradXP)" strokeWidth={2.5} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">No XP data available</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Project Activity
              </CardTitle>
              <CardDescription>Projects by status</CardDescription>
            </CardHeader>
            <CardContent>
              {projectStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={projectStatusData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="status" className="text-xs" tick={{ fontSize: 11 }} />
                    <YAxis className="text-xs" tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="count" name="Projects" radius={[6, 6, 0, 0]}>
                      {projectStatusData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={VIBRANT_COLORS[index % VIBRANT_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">No project data available</div>
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

        {/* Platform Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Platform Overview
            </CardTitle>
            <CardDescription>Quick pitch stats</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
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
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total XP</p>
                <p className="text-2xl font-bold text-primary">{stats.totalXP.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">XP Transactions</p>
                <p className="text-2xl font-bold">{stats.xpTransactions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SDG Progress Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              SDG Progress & Impact
            </CardTitle>
            <CardDescription>Sustainable Development Goals metrics for investor pitching</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="p-4 rounded-lg bg-muted/50 space-y-1">
                <p className="text-sm text-muted-foreground">Active SDGs</p>
                <p className="text-2xl font-bold">{stats.sdgStats.activeSDGs.length}/17</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 space-y-1">
                <p className="text-sm text-muted-foreground">SDG Projects</p>
                <p className="text-2xl font-bold">{stats.sdgStats.totalSDGProjects}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 space-y-1">
                <p className="text-sm text-muted-foreground">Students Impacted</p>
                <p className="text-2xl font-bold">{stats.sdgStats.studentsInSDGProjects}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 space-y-1">
                <p className="text-sm text-muted-foreground">SDG Coverage</p>
                <p className="text-2xl font-bold">{Math.round((stats.sdgStats.activeSDGs.length / 17) * 100)}%</p>
              </div>
            </div>

            {stats.sdgStats.activeSDGs.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-4">Projects per SDG Goal</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={stats.sdgStats.activeSDGs.map(num => {
                      const sdg = getSDGByNumber(num);
                      return { name: `SDG ${num}`, projects: stats.sdgStats.sdgCounts[num] || 0, fill: sdg?.color || '#3B82F6' };
                    })}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="projects" name="Projects" radius={[4, 4, 0, 0]}>
                        {stats.sdgStats.activeSDGs.map((num, index) => {
                          const sdg = getSDGByNumber(num);
                          return <Cell key={`cell-${index}`} fill={sdg?.color || VIBRANT_COLORS[index % VIBRANT_COLORS.length]} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h4 className="font-medium mb-4">Active SDG Goals</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {stats.sdgStats.activeSDGs.map(num => {
                      const sdg = getSDGByNumber(num);
                      if (!sdg) return null;
                      return (
                        <div key={num} className="p-3 rounded-lg text-white text-sm flex items-center gap-2" style={{ backgroundColor: sdg.color }}>
                          <span className="font-bold">SDG {num}</span>
                          <span className="truncate text-xs">{sdg.title}</span>
                          <Badge variant="secondary" className="ml-auto bg-white/20 text-white">
                            {stats.sdgStats.sdgCounts[num]}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                No SDG data available yet. Start by assigning SDG goals to projects.
              </div>
            )}
          </CardContent>
        </Card>

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
                        <td className="py-3 px-4 text-center"><Badge variant="outline">{inst.studentCount}</Badge></td>
                        <td className="py-3 px-4 text-center"><Badge variant="outline">{inst.classCount}</Badge></td>
                        <td className="py-3 px-4 text-center"><Badge variant="outline">{inst.courseCount}</Badge></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-muted-foreground">No institutions found</td>
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
