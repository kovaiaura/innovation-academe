import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, Award, GraduationCap, Zap, Trophy, FolderKanban, 
  BookOpen, Target, Star
} from 'lucide-react';
import { InstitutionPerformance, StudentPerformance } from '@/hooks/useComprehensiveAnalytics';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

interface InstitutionOverviewProps {
  data: InstitutionPerformance;
  institutionName: string;
}

export function InstitutionOverview({ data, institutionName }: InstitutionOverviewProps) {

  const projectsAwardsData = data.classPerformance.map(cls => ({
    name: cls.class_name,
    'Avg Projects': Math.round(cls.avg_projects * 10) / 10,
    'Avg Badges': Math.round(cls.avg_badges * 10) / 10,
  }));

  const assessmentData = data.classPerformance.map(cls => ({
    name: cls.class_name,
    'Assessment Avg': Math.round(cls.assessment_avg * 10) / 10,
    'Assignment Avg': Math.round(cls.assignment_avg * 10) / 10,
  }));

  const tooltipStyle = {
    backgroundColor: 'hsl(var(--background))',
    border: '1px solid hsl(var(--border))',
  };

  return (
    <div className="space-y-6">
      {/* Weighted Assessment Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Weighted Assessment Overview
          </CardTitle>
          <CardDescription>Institution average scores per assessment category (FA1 20% + FA2 20% + Final 40% + Internal 20%)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center">
              <p className="text-sm font-medium text-muted-foreground">FA1 (20%)</p>
              <p className="text-3xl font-bold text-blue-600">{data.weighted_assessment?.fa1_score || 0}</p>
              <Progress value={(data.weighted_assessment?.fa1_score || 0) * 5} className="mt-2 h-1.5" />
            </div>
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
              <p className="text-sm font-medium text-muted-foreground">FA2 (20%)</p>
              <p className="text-3xl font-bold text-green-600">{data.weighted_assessment?.fa2_score || 0}</p>
              <Progress value={(data.weighted_assessment?.fa2_score || 0) * 5} className="mt-2 h-1.5" />
            </div>
            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20 text-center">
              <p className="text-sm font-medium text-muted-foreground">Final (40%)</p>
              <p className="text-3xl font-bold text-purple-600">{data.weighted_assessment?.final_score || 0}</p>
              <Progress value={(data.weighted_assessment?.final_score || 0) * 2.5} className="mt-2 h-1.5" />
            </div>
            <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20 text-center">
              <p className="text-sm font-medium text-muted-foreground">Internal (20%)</p>
              <p className="text-3xl font-bold text-orange-600">{data.weighted_assessment?.internal_score || 0}</p>
              <Progress value={(data.weighted_assessment?.internal_score || 0) * 5} className="mt-2 h-1.5" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-lg font-semibold">Total Weighted Score</span>
            <span className="text-2xl font-bold text-primary">{data.weighted_assessment?.total_weighted || 0}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <Users className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
            <p className="text-2xl font-bold">{data.total_students}</p>
            <p className="text-xs text-muted-foreground">Total Students</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <Target className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
            <p className="text-2xl font-bold">{data.assessment_avg}%</p>
            <p className="text-xs text-muted-foreground">Avg Overall Score</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <Zap className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
            <p className="text-2xl font-bold">{data.total_xp.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total XP Earned</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <FolderKanban className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
            <p className="text-2xl font-bold">{data.total_projects}</p>
            <p className="text-xs text-muted-foreground">Total Projects</p>
            <p className="text-xs text-muted-foreground mt-1">
              ~{(data.total_projects / (data.total_students || 1)).toFixed(1)} per student
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Two Class Comparison Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FolderKanban className="h-4 w-4" />
              Projects & Awards by Class
            </CardTitle>
            <CardDescription>Average projects and badges per student</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {projectsAwardsData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No class data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectsAwardsData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" angle={-45} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    <Bar dataKey="Avg Projects" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Avg Badges" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <GraduationCap className="h-4 w-4" />
              Assessment Performance by Class
            </CardTitle>
            <CardDescription>Average assessment and assignment scores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {assessmentData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No class data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={assessmentData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" angle={-45} textAnchor="end" height={60} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    <Bar dataKey="Assessment Avg" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Assignment Avg" fill="#f97316" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top 10 Institution Toppers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Institution Toppers - Top 10
          </CardTitle>
          <CardDescription>Students with highest overall performance score</CardDescription>
        </CardHeader>
        <CardContent>
          {data.topStudents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No student data available
            </div>
          ) : (
            <div className="space-y-3">
              {data.topStudents.map((student, index) => (
                <StudentRankCard key={student.student_id} student={student} rank={index + 1} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StudentRankCard({ student, rank }: { student: StudentPerformance; rank: number }) {
  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-yellow-500 text-white">🥇 1st</Badge>;
    if (rank === 2) return <Badge className="bg-gray-400 text-white">🥈 2nd</Badge>;
    if (rank === 3) return <Badge className="bg-orange-600 text-white">🥉 3rd</Badge>;
    return <Badge variant="outline">#{rank}</Badge>;
  };

  return (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-4">
        {getRankBadge(rank)}
        <div>
          <p className="font-medium">{student.student_name}</p>
          <p className="text-sm text-muted-foreground">{student.class_name}</p>
        </div>
      </div>
      <div className="flex items-center gap-6 text-sm">
        <div className="text-center">
          <p className="font-semibold">{student.weighted_assessment?.total_weighted || 0}%</p>
          <p className="text-xs text-muted-foreground">Assessments</p>
        </div>
        <div className="text-center">
          <p className="font-semibold">{student.assignment_avg}%</p>
          <p className="text-xs text-muted-foreground">Assignments</p>
        </div>
        <div className="text-center">
          <p className="font-semibold flex items-center gap-1">
            <Zap className="h-3 w-3 text-yellow-500" />
            {student.total_xp}
          </p>
          <p className="text-xs text-muted-foreground">XP</p>
        </div>
        <div className="text-center">
          <p className="font-semibold flex items-center gap-1">
            <Award className="h-3 w-3 text-purple-500" />
            {student.badges_count}
          </p>
          <p className="text-xs text-muted-foreground">Badges</p>
        </div>
        <div className="text-center">
          <p className="font-semibold text-primary">{student.overall_score}</p>
          <p className="text-xs text-muted-foreground">Overall</p>
        </div>
      </div>
    </div>
  );
}
