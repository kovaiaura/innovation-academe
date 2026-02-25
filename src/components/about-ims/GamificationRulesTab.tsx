import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Star, Award, Target, Zap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const BADGE_DEFINITIONS = [
  { category: 'Projects', icon: <Target className="h-4 w-4" />, thresholds: [1, 5, 10, 15, 20] },
  { category: 'Achievements', icon: <Trophy className="h-4 w-4" />, thresholds: [1, 5, 10, 20] },
  { category: 'Assessments', icon: <Star className="h-4 w-4" />, thresholds: [5, 10, 15, 20] },
  { category: 'Assignments', icon: <Award className="h-4 w-4" />, thresholds: [5, 10, 15, 20] },
];

const RANKING_FORMULA = [
  { category: 'Assessments', weight: 50 },
  { category: 'Assignments', weight: 20 },
  { category: 'Projects', weight: 20 },
  { category: 'XP Points', weight: 10 },
];

export function GamificationRulesTab() {
  const { data: xpRules, isLoading } = useQuery({
    queryKey: ['xp-rules-about'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('xp_rules')
        .select('*')
        .eq('is_active', true)
        .order('activity');
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      {/* XP Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            XP Points Rules
          </CardTitle>
          <CardDescription>How students earn Experience Points (XP)</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-4 py-2 text-left font-medium">Activity</th>
                    <th className="px-4 py-2 text-center font-medium">Points</th>
                    <th className="px-4 py-2 text-left font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {xpRules?.map((rule) => (
                    <tr key={rule.id} className="border-t">
                      <td className="px-4 py-2">
                        <Badge variant="outline" className="capitalize">
                          {rule.activity.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span className="font-bold text-primary">{rule.points} XP</span>
                      </td>
                      <td className="px-4 py-2 text-muted-foreground">{rule.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Badge Thresholds */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Badge Thresholds
          </CardTitle>
          <CardDescription>Badges are awarded when students reach specific milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BADGE_DEFINITIONS.map((badge) => (
              <div key={badge.category} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center gap-2">
                  {badge.icon}
                  <h4 className="font-semibold">{badge.category}</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {badge.thresholds.map((t) => (
                    <Badge key={t} variant="secondary">
                      {t} {badge.category.toLowerCase()}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            <strong>Note:</strong> Earning a badge does not grant additional XP points.
          </p>
        </CardContent>
      </Card>

      {/* Ranking Formula */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Ranking Formula
          </CardTitle>
          <CardDescription>How the overall student ranking is calculated</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {RANKING_FORMULA.map((item) => (
              <div key={item.category} className="rounded-lg border p-4 text-center">
                <p className="text-3xl font-bold text-primary">{item.weight}%</p>
                <p className="text-sm text-muted-foreground mt-1">{item.category}</p>
              </div>
            ))}
          </div>

          <div className="w-full h-4 rounded-full overflow-hidden flex">
            <div className="bg-blue-500 h-full" style={{ width: '50%' }} />
            <div className="bg-green-500 h-full" style={{ width: '20%' }} />
            <div className="bg-purple-500 h-full" style={{ width: '20%' }} />
            <div className="bg-orange-500 h-full" style={{ width: '10%' }} />
          </div>

          <div className="rounded-lg border bg-muted/50 p-4">
            <p className="text-sm font-medium mb-2">Formula:</p>
            <code className="text-sm font-mono bg-background rounded px-3 py-2 block">
              Rank Score = (Assessments × 0.50) + (Assignments × 0.20) + (Projects × 0.20) + (XP × 0.10)
            </code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
