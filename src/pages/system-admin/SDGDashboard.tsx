import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { sdgGoals, getSDGAnalytics } from "@/data/mockSDGData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Target, BookOpen, FolderKanban, Building2 } from "lucide-react";

export default function SDGDashboard() {
  const analytics = getSDGAnalytics();
  
  // Filter only SDGs that have courses or projects
  const activeSDGs = analytics.filter(a => a.course_count > 0 || a.project_count > 0);
  
  const totalCoursesWithSDG = activeSDGs.reduce((sum, a) => sum + a.course_count, 0);
  const totalProjectsWithSDG = activeSDGs.reduce((sum, a) => sum + a.project_count, 0);
  const totalSDGsInUse = activeSDGs.length;
  const institutionsEngaged = 2; // MSD + KGA

  // Prepare chart data
  const chartData = activeSDGs.map(a => ({
    name: `SDG ${a.sdg_info.number}`,
    courses: a.course_count,
    projects: a.project_count,
    color: a.sdg_info.color
  }));

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses with SDGs</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCoursesWithSDG}</div>
            <p className="text-xs text-muted-foreground">Mapped to SDG goals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects with SDGs</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProjectsWithSDG}</div>
            <p className="text-xs text-muted-foreground">Student projects aligned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SDGs in Use</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSDGsInUse}</div>
            <p className="text-xs text-muted-foreground">Out of 17 goals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Institutions Engaged</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{institutionsEngaged}</div>
            <p className="text-xs text-muted-foreground">Participating institutions</p>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>SDG Distribution</CardTitle>
          <p className="text-sm text-muted-foreground">Courses and projects mapped to each SDG goal</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
              />
              <Legend />
              <Bar dataKey="courses" fill="hsl(var(--primary))" name="Courses" />
              <Bar dataKey="projects" fill="hsl(var(--secondary))" name="Projects" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* SDG Details Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Active SDG Goals</CardTitle>
          <p className="text-sm text-muted-foreground">Detailed view of all active SDG mappings</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeSDGs.map((analytics) => (
              <Card key={analytics.sdg_goal}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div 
                      className="h-3 w-3 rounded-full" 
                      style={{ backgroundColor: analytics.sdg_info.color }}
                    />
                    <CardTitle className="text-base">
                      {analytics.sdg_info.number}. {analytics.sdg_info.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {analytics.sdg_info.description}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="secondary">
                      {analytics.course_count} {analytics.course_count === 1 ? 'Course' : 'Courses'}
                    </Badge>
                    <Badge variant="outline">
                      {analytics.project_count} {analytics.project_count === 1 ? 'Project' : 'Projects'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
