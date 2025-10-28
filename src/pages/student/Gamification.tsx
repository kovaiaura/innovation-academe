import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Award, TrendingUp, Flame, Medal, Lock } from 'lucide-react';

// Mock data
const mockGamification = {
  total_points: 1250,
  current_rank: 12,
  streak_days: 15,
  badges_earned: [
    { id: '1', name: 'Early Bird', description: 'Attended 10 sessions on time', icon: '🌅', earned_at: '2024-03-01' },
    { id: '2', name: 'Team Player', description: 'Completed 3 group projects', icon: '🤝', earned_at: '2024-02-15' },
    { id: '3', name: 'Quick Learner', description: 'Completed 5 courses', icon: '⚡', earned_at: '2024-03-10' }
  ],
  badges_locked: [
    { id: '4', name: 'Innovation Champion', description: 'Complete 5 projects', icon: '🚀', points_required: 2000, progress: 40 },
    { id: '5', name: 'Perfect Attendance', description: 'Attend all sessions for a month', icon: '✨', points_required: 1500, progress: 83 }
  ],
  points_breakdown: {
    sessions: 450,
    projects: 500,
    attendance: 200,
    assessments: 100
  }
};

const mockLeaderboard = [
  { rank: 1, name: 'Alice Johnson', points: 2450, badges: 12, avatar: '' },
  { rank: 2, name: 'Bob Wilson', points: 2200, badges: 10, avatar: '' },
  { rank: 3, name: 'Carol Martinez', points: 1980, badges: 11, avatar: '' },
  { rank: 12, name: 'You', points: 1250, badges: 3, avatar: '', isCurrentUser: true }
];

export default function Gamification() {
  const [data] = useState(mockGamification);
  const [leaderboard] = useState(mockLeaderboard);

  const totalBreakdown = Object.values(data.points_breakdown).reduce((a, b) => a + b, 0);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Achievements & Leaderboard</h1>
          <p className="text-muted-foreground">Track your progress and compete with peers</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Points</CardTitle>
              <Trophy className="h-4 w-4 text-meta-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.total_points}</div>
              <p className="text-xs text-muted-foreground">+120 this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Rank</CardTitle>
              <Medal className="h-4 w-4 text-meta-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">#{data.current_rank}</div>
              <p className="text-xs text-muted-foreground">In your class</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Streak</CardTitle>
              <Flame className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.streak_days} days</div>
              <p className="text-xs text-muted-foreground">Keep it going!</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="badges" className="space-y-6">
          <TabsList>
            <TabsTrigger value="badges">
              <Award className="mr-2 h-4 w-4" />
              Badges
            </TabsTrigger>
            <TabsTrigger value="leaderboard">
              <TrendingUp className="mr-2 h-4 w-4" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="points">
              <Trophy className="mr-2 h-4 w-4" />
              Points
            </TabsTrigger>
          </TabsList>

          <TabsContent value="badges" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Earned Badges</CardTitle>
                <CardDescription>Your achievements and milestones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {data.badges_earned.map((badge) => (
                    <div
                      key={badge.id}
                      className="rounded-lg border-2 border-meta-accent bg-gradient-to-br from-meta-accent/10 to-transparent p-4 text-center"
                    >
                      <div className="text-4xl mb-2">{badge.icon}</div>
                      <div className="font-semibold">{badge.name}</div>
                      <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Locked Badges</CardTitle>
                <CardDescription>Keep working to unlock these achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.badges_locked.map((badge) => (
                    <div key={badge.id} className="rounded-lg border p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-2xl opacity-50">
                          <Lock className="h-6 w-6 text-gray-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-semibold">{badge.name}</div>
                            <Badge variant="outline">{badge.progress}%</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{badge.description}</p>
                          <Progress value={badge.progress} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">
                            {badge.points_required} points required
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard">
            <Card>
              <CardHeader>
                <CardTitle>Class Leaderboard</CardTitle>
                <CardDescription>Top performers this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {leaderboard.map((entry) => (
                    <div
                      key={entry.rank}
                      className={`flex items-center justify-between rounded-lg p-4 ${
                        entry.isCurrentUser 
                          ? 'bg-meta-accent/20 border-2 border-meta-accent' 
                          : 'bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          entry.rank === 1 ? 'bg-yellow-500 text-white' :
                          entry.rank === 2 ? 'bg-gray-400 text-white' :
                          entry.rank === 3 ? 'bg-orange-600 text-white' :
                          'bg-gray-200'
                        } font-bold`}>
                          {entry.rank}
                        </div>
                        <div>
                          <div className="font-semibold flex items-center gap-2">
                            {entry.name}
                            {entry.isCurrentUser && <Badge variant="secondary">You</Badge>}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {entry.badges} badges earned
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-meta-accent">{entry.points}</div>
                        <div className="text-xs text-muted-foreground">points</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="points">
            <Card>
              <CardHeader>
                <CardTitle>Points Breakdown</CardTitle>
                <CardDescription>See where your points come from</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(data.points_breakdown).map(([category, points]) => {
                  const percentage = (points / totalBreakdown) * 100;
                  return (
                    <div key={category}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="capitalize font-medium">{category}</span>
                        <span className="font-bold text-meta-accent">{points} pts</span>
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
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
