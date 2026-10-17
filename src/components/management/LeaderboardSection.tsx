import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Medal, Loader2 } from 'lucide-react';
import { useComprehensiveAnalytics } from '@/hooks/useComprehensiveAnalytics';

interface LeaderboardEntry {
  rank: number;
  student_id: string;
  student_name: string;
  total_points: number;
  badges_earned: number;
  class_name: string;
}

interface LeaderboardSectionProps {
  institutionId: string;
}

export function LeaderboardSection({ institutionId }: LeaderboardSectionProps) {
  const { data, isLoading: loading } = useComprehensiveAnalytics(institutionId);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const classes = (data?.classPerformance || []).map(c => ({ id: c.class_id, class_name: c.class_name }))
    .sort((a, b) => a.class_name.localeCompare(b.class_name));

  useEffect(() => {
    if (!selectedClass && classes.length > 0) setSelectedClass(classes[0].id);
  }, [classes.length, selectedClass]);

  const toEntry = (s: any): LeaderboardEntry => ({
    rank: s.rank || 0,
    student_id: s.student_id,
    student_name: s.student_name,
    total_points: s.overall_score,
    badges_earned: s.badges_count,
    class_name: s.class_name,
  });
  const overallLeaderboard = (data?.topStudents || []).map(toEntry);
  const classLeaderboard = (data?.classPerformance.find(c => c.class_id === selectedClass)?.topStudents || []).map(toEntry);

  const renderLeaderboard = (entries: LeaderboardEntry[], showClass: boolean = false) => {
    if (entries.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No leaderboard data yet</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {entries.map((entry) => (
          <div
            key={entry.student_id}
            className="flex items-center justify-between rounded-lg p-3 bg-muted hover:bg-muted/80 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                entry.rank === 1 ? 'bg-yellow-500 text-white' :
                entry.rank === 2 ? 'bg-gray-400 text-white' :
                entry.rank === 3 ? 'bg-orange-600 text-white' :
                'bg-muted-foreground/20 text-foreground'
              }`}>
                {entry.rank}
              </div>
              <div>
                <div className="font-medium text-sm">{entry.student_name}</div>
                <div className="text-xs text-muted-foreground">
                  {entry.badges_earned} badges
                  {showClass && entry.class_name && (
                    <span> • {entry.class_name}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-primary">{entry.total_points}</div>
              <div className="text-xs text-muted-foreground">overall</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="h-6 w-6 text-primary" />
          Student Leaderboards
        </h2>
        <p className="text-sm text-muted-foreground">Ranked by overall performance (assessments, assignments, projects, XP)</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {/* Overall Institution Leaderboard */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Medal className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-lg">Overall Leaderboard</CardTitle>
                <CardDescription>Top 10 across all classes</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {renderLeaderboard(overallLeaderboard, true)}
          </CardContent>
        </Card>

        {/* Class-wise Leaderboard */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">Class Leaderboard</CardTitle>
                  <CardDescription>Top students in selected class</CardDescription>
                </div>
              </div>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.class_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {renderLeaderboard(classLeaderboard)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
