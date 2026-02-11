import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, FolderOpen, Calendar, Activity, ClipboardCheck, GraduationCap } from "lucide-react";
import { InstitutionEngagement } from "@/data/mockInstitutionEngagement";
import {
  AreaChart, Area, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, subWeeks, subMonths, startOfWeek, startOfMonth } from "date-fns";

interface EngagementDashboardProps {
  data: InstitutionEngagement[];
}

const VIBRANT_COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6'];

const tooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  fontSize: '12px',
};

export function EngagementDashboard({ data }: EngagementDashboardProps) {
  const [engagementView, setEngagementView] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  const { data: extraData } = useQuery({
    queryKey: ['institution-extra-analytics'],
    queryFn: async () => {
      const [studentsRes, projectsRes, contractsRes, streaksRes, attemptsRes] = await Promise.all([
        supabase.from('students').select('institution_id, status'),
        supabase.from('projects').select('institution_id, status'),
        supabase.from('crm_contracts').select('institution_id, institution_name, status, end_date, renewal_status, contract_value'),
        supabase.from('student_streaks').select('last_activity_date'),
        supabase.from('assessment_attempts').select('institution_id, percentage, passed, status'),
      ]);
      return {
        students: studentsRes.data || [],
        projects: projectsRes.data || [],
        contracts: contractsRes.data || [],
        streaks: streaksRes.data || [],
        attempts: attemptsRes.data || [],
      };
    },
    staleTime: 1000 * 60 * 5,
  });

  const avgEngagement = data.length > 0 ? Math.round(
    data.reduce((sum, inst) => sum + inst.engagement_score, 0) / data.length
  ) : 0;

  const totalStudents = useMemo(() => {
    if (!extraData) return data.reduce((sum, d) => sum + d.course_metrics.active_students + d.course_metrics.inactive_students, 0);
    return extraData.students.length;
  }, [data, extraData]);

  const totalProjects = useMemo(() => extraData?.projects?.length || 0, [extraData]);

  const totalAssessments = useMemo(() => extraData?.attempts?.length || 0, [extraData]);

  // Student login activity
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

  // Per-institution student comparison
  const studentComparisonData = useMemo(() => {
    return data.map((inst, idx) => {
      const active = extraData?.students?.filter(s => s.institution_id === inst.institution_id && s.status === 'active').length || inst.course_metrics.active_students;
      const inactive = extraData?.students?.filter(s => s.institution_id === inst.institution_id && s.status !== 'active').length || inst.course_metrics.inactive_students;
      return {
        name: inst.institution_name.split(' ').slice(0, 2).join(' '),
        active,
        inactive,
        total: active + inactive,
      };
    });
  }, [data, extraData]);

  // Per-institution project comparison
  const projectComparisonData = useMemo(() => {
    return data.map((inst) => {
      const instProjects = extraData?.projects?.filter(p => p.institution_id === inst.institution_id) || [];
      const ongoing = instProjects.filter(p => ['ongoing', 'in_progress', 'draft', 'pending_review'].includes(p.status)).length;
      const completed = instProjects.filter(p => ['completed', 'evaluated', 'submitted'].includes(p.status)).length;
      return {
        name: inst.institution_name.split(' ').slice(0, 2).join(' '),
        ongoing,
        completed,
        total: instProjects.length,
      };
    });
  }, [data, extraData]);

  // Per-institution assessment comparison
  const assessmentComparisonData = useMemo(() => {
    return data.map((inst) => {
      const instAttempts = extraData?.attempts?.filter(a => a.institution_id === inst.institution_id) || [];
      const totalAttempts = instAttempts.length;
      const passedCount = instAttempts.filter(a => a.passed).length;
      const avgScore = totalAttempts > 0 ? Math.round(instAttempts.reduce((s, a) => s + (a.percentage || 0), 0) / totalAttempts) : 0;
      const passRate = totalAttempts > 0 ? Math.round((passedCount / totalAttempts) * 100) : 0;
      return {
        name: inst.institution_name.split(' ').slice(0, 2).join(' '),
        avgScore,
        passRate,
        totalAttempts,
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

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 border-indigo-500/20">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/20"><Users className="h-5 w-5 text-indigo-400" /></div>
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
              <div className="p-2 rounded-lg bg-cyan-500/20"><Activity className="h-5 w-5 text-cyan-400" /></div>
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
              <div className="p-2 rounded-lg bg-emerald-500/20"><GraduationCap className="h-5 w-5 text-emerald-400" /></div>
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
              <div className="p-2 rounded-lg bg-amber-500/20"><FolderOpen className="h-5 w-5 text-amber-400" /></div>
              <div>
                <p className="text-2xl font-bold">{totalProjects}</p>
                <p className="text-xs text-muted-foreground">Total Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-violet-500/10 to-violet-500/5 border-violet-500/20">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-500/20"><ClipboardCheck className="h-5 w-5 text-violet-400" /></div>
              <div>
                <p className="text-2xl font-bold">{totalAssessments}</p>
                <p className="text-xs text-muted-foreground">Assessments Taken</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student Login Activity */}
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
          <ResponsiveContainer width="100%" height={300}>
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
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="students" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#studentLoginGrad)" name="Active Students" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Student Comparison per Institution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Student Comparison by Institution</CardTitle>
          <CardDescription>Active vs inactive students across institutions</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={studentComparisonData} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="active" fill="#10b981" name="Active" radius={[4, 4, 0, 0]} />
              <Bar dataKey="inactive" fill="#f59e0b" name="Inactive" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Project Comparison per Institution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Project Comparison by Institution</CardTitle>
          <CardDescription>Project status breakdown per institution</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={projectComparisonData} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="ongoing" fill="#6366f1" name="In Progress" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[4, 4, 0, 0]} />
              <Bar dataKey="total" fill="#f59e0b" name="Total" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Assessment Comparison per Institution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Assessment Performance by Institution</CardTitle>
          <CardDescription>Average score, pass rate & total attempts per institution</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={assessmentComparisonData} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="avgScore" fill="#8b5cf6" name="Avg Score %" radius={[4, 4, 0, 0]} />
              <Bar dataKey="passRate" fill="#10b981" name="Pass Rate %" radius={[4, 4, 0, 0]} />
              <Bar dataKey="totalAttempts" fill="#f59e0b" name="Total Attempts" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Multi-Dimension Radar + Contract Renewal */}
      <div className="grid gap-6 lg:grid-cols-2">
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
                          <p className="text-xs text-muted-foreground">Ends: {format(new Date(c.endDate), 'MMM dd, yyyy')}</p>
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
    </div>
  );
}
