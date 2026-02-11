import { CourseOutcomeData } from '@/hooks/useCourseOutcomeAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, TrendingDown, BookOpen } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface Props {
  data: CourseOutcomeData;
  isLoading: boolean;
  title?: string;
}

const getColor = (accuracy: number) => {
  if (accuracy >= 75) return 'hsl(142, 71%, 45%)';
  if (accuracy >= 50) return 'hsl(48, 96%, 53%)';
  return 'hsl(0, 84%, 60%)';
};

const getBadgeVariant = (accuracy: number): 'default' | 'secondary' | 'destructive' => {
  if (accuracy >= 75) return 'default';
  if (accuracy >= 50) return 'secondary';
  return 'destructive';
};

export const CourseOutcomeAnalytics = ({ data, isLoading, title = 'Course Outcome Analytics' }: Props) => {
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading analytics...</p>
        </CardContent>
      </Card>
    );
  }

  if (data.courseAccuracies.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No course outcome data available yet</p>
          <p className="text-sm text-muted-foreground mt-2">Assessment questions need to be mapped to courses to generate analytics</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Strength & Weakness Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.strengths.length === 0 ? (
              <p className="text-sm text-muted-foreground">No strong areas identified yet</p>
            ) : (
              data.strengths.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-green-500/10">
                  <div>
                    <span className="text-sm font-medium">{s.title}</span>
                    <Badge variant="outline" className="ml-2 text-xs">{s.type}</Badge>
                  </div>
                  <Badge variant="default" className="bg-green-600">{s.accuracy}%</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              Needs Improvement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.weaknesses.length === 0 ? (
              <p className="text-sm text-muted-foreground">No weak areas identified</p>
            ) : (
              data.weaknesses.map((w, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-red-500/10">
                  <div>
                    <span className="text-sm font-medium">{w.title}</span>
                    <Badge variant="outline" className="ml-2 text-xs">{w.type}</Badge>
                  </div>
                  <Badge variant="destructive">{w.accuracy}%</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Course-Level Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Accuracy by Course</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={Math.max(200, data.courseAccuracies.length * 50)}>
            <BarChart data={data.courseAccuracies} layout="vertical" margin={{ left: 120 }}>
              <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} />
              <YAxis type="category" dataKey="course_title" width={110} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: number) => [`${value}%`, 'Accuracy']} />
              <Bar dataKey="accuracy" radius={[0, 4, 4, 0]}>
                {data.courseAccuracies.map((entry, i) => (
                  <Cell key={i} fill={getColor(entry.accuracy)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Module & Session Drill-Down */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Module & Session Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.courseAccuracies.map(course => {
            const courseModules = data.moduleAccuracies.filter(m => m.course_id === course.course_id);
            return (
              <Collapsible
                key={course.course_id}
                open={expandedCourse === course.course_id}
                onOpenChange={(open) => setExpandedCourse(open ? course.course_id : null)}
              >
                <CollapsibleTrigger className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-sm">{course.course_title}</span>
                    <Badge variant={getBadgeVariant(course.accuracy)}>{course.accuracy}%</Badge>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-6 mt-2 space-y-2">
                  {courseModules.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">No module-level data</p>
                  ) : (
                    courseModules.map(mod => {
                      const modSessions = data.sessionAccuracies.filter(s => s.module_id === mod.module_id);
                      return (
                        <div key={mod.module_id} className="space-y-1">
                          <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                            <span className="text-sm">{mod.module_title}</span>
                            <Badge variant={getBadgeVariant(mod.accuracy)} className="text-xs">{mod.accuracy}%</Badge>
                          </div>
                          {modSessions.length > 0 && (
                            <div className="pl-4 space-y-1">
                              {modSessions.map(sess => (
                                <div key={sess.session_id} className="flex items-center justify-between p-1.5 rounded text-sm">
                                  <span className="text-muted-foreground">{sess.session_title}</span>
                                  <Badge variant={getBadgeVariant(sess.accuracy)} className="text-xs">{sess.accuracy}%</Badge>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};
