import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Users, BookOpen, FolderOpen, Calendar, Activity } from "lucide-react";
import { InstitutionEngagement } from "@/data/mockInstitutionEngagement";
import {
  AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, subWeeks, subMonths, startOfDay, startOfWeek, startOfMonth } from "date-fns";

interface EngagementDashboardProps {
  data: InstitutionEngagement[];
}

const VIBRANT_COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6'];

const RISK_COLORS = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#10b981',
};

export function EngagementDashboard({ data }: EngagementDashboardProps) {
  const [engagementView, setEngagementView] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  // Fetch extra institution-level data: total students, projects, contract info
  const { data: extraData } = useQuery({
    queryKey: ['institution-extra-analytics'],
    queryFn: async () => {
      const [studentsRes, projectsRes, contractsRes, streaksRes] = await Promise.all([
        supabase.from('students').select('institution_id, status'),
        supabase.from('projects').select('institution_id, status'),
        supabase.from('crm_contracts').select('institution_id, institution_name, status, end_date, renewal_status, contract_value'),
        supabase.from('student_streaks').select('last_activity_date'),
      ]);
      return {
        students: studentsRes.data || [],
        projects: projectsRes.data || [],
        contracts: contractsRes.data || [],
        streaks: streaksRes.data || [],
      };
    },
    staleTime: 1000 * 60 * 5,
  });

  const avgEngagement = Math.round(
    data.reduce((sum, inst) => sum + inst.engagement_score, 0) / data.length
  );

  const totalStudents = useMemo(() => {
    if (!extraData) return data.reduce((sum, d) => sum + d.course_metrics.active_students + d.course_metrics.inactive_students, 0);
    return extraData.students.length;
  }, [data, extraData]);

  const totalProjects = useMemo(() => extraData?.projects?.length || 0, [extraData]);

  const riskCounts = {
    low: data.filter(d => d.risk_level === 'low').length,
    medium: data.filter(d => d.risk_level === 'medium').length,
    high: data.filter(d => d.risk_level === 'high').length,
  };

  const trendCounts = {
    increasing: data.filter(d => d.engagement_trend === 'increasing').length,
    stable: data.filter(d => d.engagement_trend === 'stable').length,
    declining: data.filter(d => d.engagement_trend === 'declining').length,
  };

  // Student engagement (login activity) from streaks
  const engagementTrendData = useMemo(() => {
    if (!extraData?.streaks) return [];
    const now = new Date();
    const streaks = extraData.streaks;

    if (engagementView === 'daily') {
      return Array.from({ length: 14 }, (_, i) => {
        const day = subDays(now, 13 - i);
        const dayStr = format(day, 'yyyy-MM-dd');
        const count = streaks.filter(s => s.last_activity_date === dayStr).length;
        return { label: format(day, 'MMM dd'), students: count };
      });
    } else if (engagementView === 'weekly') {
      return Array.from({ length: 8 }, (_, i) => {
        const weekStart = startOfWeek(subWeeks(now, 7 - i));
        const weekEnd = subWeeks(now, 6 - i);
        const count = streaks.filter(s => {
          const d = new Date(s.last_activity_date);
          return d >= weekStart && d < weekEnd;
        }).length;
        return { label: `W${8 - (7 - i)}`, students: count };
      });
    } else {
      return Array.from({ length: 6 }, (_, i) => {
        const monthStart = startOfMonth(subMonths(now, 5 - i));
        const monthEnd = startOfMonth(subMonths(now, 4 - i));
        const count = streaks.filter(s => {
          const d = new Date(s.last_activity_date);
          return d >= monthStart && d < monthEnd;
        }).length;
        return { label: format(monthStart, 'MMM'), students: count };
      });
    }
  }, [extraData, engagementView]);

  // Per-institution comparison data with students & projects
  const comparisonData = useMemo(() => {
    return data.map((inst, idx) => {
      const instStudents = extraData?.students?.filter(s => s.institution_id === inst.institution_id).length || 
        (inst.course_metrics.active_students + inst.course_metrics.inactive_students);
      const instProjects = extraData?.projects?.filter(p => p.institution_id === inst.institution_id).length || 0;
      return {
        name: inst.institution_name.split(' ').slice(0, 2).join(' '),
        engagement: inst.engagement_score,
        students: instStudents,
        projects: instProjects,
        assessments: inst.assessment_metrics.average_participation_rate,
        color: VIBRANT_COLORS[idx % VIBRANT_COLORS.length],
      };
    });
  }, [data, extraData]);

  // Contract / renewal data
  const renewalData = useMemo(() => {
    if (!extraData?.contracts) return [];
    return extraData.contracts.map(c => ({
      institution: c.institution_name || 'Unknown',
      status: c.status,
      renewal: c.renewal_status,
      endDate: c.end_date,
      value: c.contract_value,
    }));
  }, [extraData]);

  // Risk distribution pie
  const pieData = [
    { name: 'Low Risk', value: riskCounts.low, color: RISK_COLORS.low },
    { name: 'Medium Risk', value: riskCounts.medium, color: RISK_COLORS.medium },
    { name: 'High Risk', value: riskCounts.high, color: RISK_COLORS.high },
  ];

  // Radar data per institution
  const radarData = useMemo(() => {
    return data.map(inst => ({
      name: inst.institution_name.split(' ').slice(0, 2).join(' '),
      Attendance: Math.round(inst.engagement_score * 0.8 + Math.random() * 20),
      Courses: inst.course_metrics.average_completion_rate,
      Assessments: inst.assessment_metrics.average_participation_rate,
      Projects: Math.min(100, (extraData?.projects?.filter(p => p.institution_id === inst.institution_id).length || 0) * 10),
      Engagement: inst.engagement_score,
    }));
  }, [data, extraData]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 border-indigo-500/20">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/20">
                <Users className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.length}</p>
                <p className="text-xs text-muted-foreground">Institutions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border-cyan-500/20">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/20">
                <Activity className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgEngagement}%</p>
                <p className="text-xs text-muted-foreground">Avg Engagement</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <Users className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalStudents}</p>
                <p className="text-xs text-muted-foreground">Total Students</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <FolderOpen className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalProjects}</p>
                <p className="text-xs text-muted-foreground">Total Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-500/10 to-rose-500/5 border-rose-500/20">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-500/20">
                <AlertTriangle className="h-5 w-5 text-rose-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{riskCounts.high + riskCounts.medium}</p>
                <p className="text-xs text-muted-foreground">At Risk</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 1: Engagement Comparison (Area Chart) + Student Login Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Institution Engagement Comparison - Modern Area Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Institution Engagement Comparison</CardTitle>
            <CardDescription>Engagement, assessments & projects per institution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={comparisonData} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="engagement" fill="#6366f1" name="Engagement %" radius={[4, 4, 0, 0]} />
                <Bar dataKey="students" fill="#06b6d4" name="Students" radius={[4, 4, 0, 0]} />
                <Bar dataKey="projects" fill="#10b981" name="Projects" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Student Login Engagement - Daily/Weekly/Monthly */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Student Login Activity</CardTitle>
                <CardDescription>Active students based on login trends</CardDescription>
              </div>
              <Tabs value={engagementView} onValueChange={(v) => setEngagementView(v as any)}>
                <TabsList className="h-8">
                  <TabsTrigger value="daily" className="text-xs px-2 h-6">Daily</TabsTrigger>
                  <TabsTrigger value="weekly" className="text-xs px-2 h-6">Weekly</TabsTrigger>
                  <TabsTrigger value="monthly" className="text-xs px-2 h-6">Monthly</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={engagementTrendData}>
                <defs>
                  <linearGradient id="studentLoginGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Area type="monotone" dataKey="students" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#studentLoginGrad)" name="Active Students" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Risk Distribution + Engagement Trends */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Risk Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="flex items-center justify-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span className="text-xl font-bold">{riskCounts.low}</span>
                </div>
                <p className="text-xs text-muted-foreground">Low Risk</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1.5">
                  <Minus className="h-4 w-4 text-amber-500" />
                  <span className="text-xl font-bold">{riskCounts.medium}</span>
                </div>
                <p className="text-xs text-muted-foreground">Medium</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-xl font-bold">{riskCounts.high}</span>
                </div>
                <p className="text-xs text-muted-foreground">High Risk</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Engagement Trends */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Engagement Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-emerald-500/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-6 w-6 text-emerald-500" />
                  <div>
                    <p className="text-xl font-bold text-emerald-500">{trendCounts.increasing}</p>
                    <p className="text-xs text-muted-foreground">Increasing</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                  {data.length > 0 ? ((trendCounts.increasing / data.length) * 100).toFixed(0) : 0}%
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <Minus className="h-6 w-6 text-blue-500" />
                  <div>
                    <p className="text-xl font-bold text-blue-500">{trendCounts.stable}</p>
                    <p className="text-xs text-muted-foreground">Stable</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/30">
                  {data.length > 0 ? ((trendCounts.stable / data.length) * 100).toFixed(0) : 0}%
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                <div className="flex items-center gap-3">
                  <TrendingDown className="h-6 w-6 text-red-500" />
                  <div>
                    <p className="text-xl font-bold text-red-500">{trendCounts.declining}</p>
                    <p className="text-xs text-muted-foreground">Declining</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/30">
                  {data.length > 0 ? ((trendCounts.declining / data.length) * 100).toFixed(0) : 0}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Per-Institution Radar + Renewal Status */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Radar Chart - Multi-dimension comparison */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Multi-Dimension Performance</CardTitle>
            <CardDescription>Comparative radar across key metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <RadarChart data={[
                { metric: 'Engagement', ...Object.fromEntries(data.map((d, i) => [`inst${i}`, d.engagement_score])) },
                { metric: 'Courses', ...Object.fromEntries(data.map((d, i) => [`inst${i}`, d.course_metrics.average_completion_rate])) },
                { metric: 'Assessments', ...Object.fromEntries(data.map((d, i) => [`inst${i}`, d.assessment_metrics.average_participation_rate])) },
                { metric: 'Score', ...Object.fromEntries(data.map((d, i) => [`inst${i}`, d.assessment_metrics.average_score])) },
              ]}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                {data.slice(0, 4).map((inst, i) => (
                  <Radar
                    key={inst.institution_id}
                    name={inst.institution_name.split(' ').slice(0, 2).join(' ')}
                    dataKey={`inst${i}`}
                    stroke={VIBRANT_COLORS[i]}
                    fill={VIBRANT_COLORS[i]}
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                ))}
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Contract Renewal Status */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Contract & Renewal Status</CardTitle>
            </div>
            <CardDescription>Upcoming renewals and contract health</CardDescription>
          </CardHeader>
          <CardContent>
            {renewalData.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No contract data available</p>
                <p className="text-xs mt-1">Add contracts in CRM to see renewal status</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {renewalData.map((c, i) => {
                  const daysUntil = Math.ceil((new Date(c.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  const isExpiring = daysUntil <= 30 && daysUntil > 0;
                  const isExpired = daysUntil <= 0;
                  return (
                    <div key={i} className={`p-3 rounded-lg border ${isExpired ? 'border-red-500/30 bg-red-500/5' : isExpiring ? 'border-amber-500/30 bg-amber-500/5' : 'border-border bg-muted/30'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{c.institution}</p>
                          <p className="text-xs text-muted-foreground">
                            Ends: {format(new Date(c.endDate), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className={
                            isExpired ? 'bg-red-500/10 text-red-500' :
                            isExpiring ? 'bg-amber-500/10 text-amber-500' :
                            'bg-emerald-500/10 text-emerald-500'
                          }>
                            {isExpired ? 'Expired' : isExpiring ? `${daysUntil}d left` : c.renewal || 'Active'}
                          </Badge>
                          {c.value > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">₹{c.value.toLocaleString()}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Students per Institution (Area chart) */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Students & Engagement Overview</CardTitle>
          <CardDescription>Active vs total students with engagement scores per institution</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={comparisonData}>
              <defs>
                <linearGradient id="engGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="studGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Area type="monotone" dataKey="engagement" stroke="#6366f1" strokeWidth={2.5} fill="url(#engGrad)" name="Engagement %" />
              <Area type="monotone" dataKey="students" stroke="#06b6d4" strokeWidth={2} fill="url(#studGrad)" name="Total Students" />
              <Area type="monotone" dataKey="projects" stroke="#10b981" strokeWidth={2} fill="url(#projGrad)" name="Projects" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
