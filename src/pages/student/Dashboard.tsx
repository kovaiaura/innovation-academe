import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { BookOpen, Target, Trophy, TrendingUp, Flame, Medal, Award, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getProjectsByStudent } from '@/data/mockProjectData';
import { Link } from 'react-router-dom';

// Mock gamification data
const mockGamification = {
  total_points: 1250,
  current_rank: 12,
  streak_days: 15,
  badges_earned: [
    { id: '1', name: 'Early Bird', description: 'Attended 10 sessions on time', icon: '🌅', earned_at: '2024-03-01' },
    { id: '2', name: 'Team Player', description: 'Completed 3 group projects', icon: '🤝', earned_at: '2024-02-15' },
    { id: '3', name: 'Quick Learner', description: 'Completed 5 courses', icon: '⚡', earned_at: '2024-03-10' },
    { id: '4', name: 'High Achiever', description: 'Scored 90%+ in 5 assessments', icon: '🎯', earned_at: '2024-03-15' },
    { id: '5', name: 'Knowledge Seeker', description: 'Read 20 course materials', icon: '📚', earned_at: '2024-03-20' }
  ],
  badges_locked: [
    { id: '6', name: 'Innovation Champion', description: 'Complete 5 projects', icon: '🚀', points_required: 2000, progress: 40 },
    { id: '7', name: 'Perfect Attendance', description: 'Attend all sessions for a month', icon: '✨', points_required: 1500, progress: 83 }
  ],
  points_breakdown: {
    sessions: 450,
    projects: 500,
    attendance: 200,
    assessments: 100
  }
};

const mockLeaderboard = [
  { rank: 1, name: 'Alice Johnson', points: 2450, badges: 12 },
  { rank: 2, name: 'Bob Wilson', points: 2200, badges: 10 },
  { rank: 3, name: 'Carol Martinez', points: 1980, badges: 11 },
  { rank: 12, name: 'You', points: 1250, badges: 5, isCurrentUser: true }
];

export default function StudentDashboard() {
  const { user } = useAuth();
  
  // Get real projects for current student
  const studentProjects = user ? getProjectsByStudent(user.id) : [];
  const activeProjects = studentProjects.filter(p => 
    p.status === 'in_progress' || p.status === 'approved'
  ).length;
  const completedProjects = studentProjects.filter(p => 
    p.status === 'completed'
  ).length;

  const totalBreakdown = Object.values(mockGamification.points_breakdown).reduce((a, b) => a + b, 0);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Student Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Track your progress and achievements</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Courses Enrolled</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">6</div>
              <p className="text-xs text-muted-foreground">4 in progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeProjects}</div>
              <p className="text-xs text-muted-foreground">{completedProjects} completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Points</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,250</div>
              <p className="text-xs text-muted-foreground">+120 this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Rank</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">#12</div>
              <p className="text-xs text-muted-foreground">In your class</p>
            </CardContent>
          </Card>
        </div>

        {/* Gamification Summary */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Streak</CardTitle>
              <Flame className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockGamification.streak_days} days</div>
              <p className="text-xs text-muted-foreground">Keep it going!</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Points</CardTitle>
              <Trophy className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+120</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Badges Earned</CardTitle>
              <Award className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockGamification.badges_earned.length}</div>
              <p className="text-xs text-muted-foreground">{mockGamification.badges_locked.length} more to unlock</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Badges */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Achievements</CardTitle>
              <CardDescription>Your latest earned badges</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/student/gamification">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {mockGamification.badges_earned.map((badge) => (
                <div
                  key={badge.id}
                  className="flex-shrink-0 w-32 rounded-lg border-2 border-primary/20 bg-gradient-to-br from-primary/10 to-transparent p-4 text-center hover:border-primary/40 transition-colors"
                >
                  <div className="text-4xl mb-2">{badge.icon}</div>
                  <div className="font-semibold text-sm">{badge.name}</div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{badge.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard and Points Breakdown */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Class Leaderboard</CardTitle>
                <CardDescription>Top performers this month</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/student/gamification">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockLeaderboard.map((entry) => (
                  <div
                    key={entry.rank}
                    className={`flex items-center justify-between rounded-lg p-3 transition-colors ${
                      entry.isCurrentUser 
                        ? 'bg-primary/10 border-2 border-primary/30' 
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                        entry.rank === 1 ? 'bg-yellow-500 text-white' :
                        entry.rank === 2 ? 'bg-gray-400 text-white' :
                        entry.rank === 3 ? 'bg-orange-600 text-white' :
                        'bg-gray-200 text-gray-700'
                      }`}>
                        {entry.rank}
                      </div>
                      <div>
                        <div className="font-semibold flex items-center gap-2 text-sm">
                          {entry.name}
                          {entry.isCurrentUser && <Badge variant="secondary" className="text-xs">You</Badge>}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {entry.badges} badges
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">{entry.points}</div>
                      <div className="text-xs text-muted-foreground">points</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Points Breakdown</CardTitle>
              <CardDescription>See where your points come from</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(mockGamification.points_breakdown).map(([category, points]) => {
                const percentage = (points / totalBreakdown) * 100;
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="capitalize font-medium text-sm">{category}</span>
                      <span className="font-bold text-primary">{points} pts</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {percentage.toFixed(1)}% of total points
                    </p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Locked Badges */}
        <Card>
          <CardHeader>
            <CardTitle>Locked Badges - Keep Working!</CardTitle>
            <CardDescription>Complete these goals to unlock achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {mockGamification.badges_locked.map((badge) => (
                <div key={badge.id} className="rounded-lg border p-4 hover:border-primary/40 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-2xl opacity-60">
                      <Lock className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold">{badge.name}</div>
                        <Badge variant="outline">{badge.progress}%</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{badge.description}</p>
                      <Progress value={badge.progress} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-2">
                        {badge.points_required} points required
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
