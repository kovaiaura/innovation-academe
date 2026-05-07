import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, TrendingUp, Award, AlertTriangle } from "lucide-react";
import { useCoursePerformance } from "@/hooks/useCoursePerformance";

interface CoursePerformanceDialogProps {
  courseId: string | null;
  institutionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CoursePerformanceDialog({
  courseId,
  institutionId,
  open,
  onOpenChange,
}: CoursePerformanceDialogProps) {
  const { data, isLoading } = useCoursePerformance(courseId, institutionId);

  if (!courseId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isLoading || !data ? (
              <Skeleton className="h-8 w-64" />
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{data.course.title}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {data.course.course_code}
                    {data.course.category ? ` • ${data.course.category}` : ''}
                  </div>
                </div>
                {data.course.difficulty && (
                  <Badge variant="secondary" className="text-sm">
                    {data.course.difficulty}
                  </Badge>
                )}
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        {isLoading || !data ? (
          <div className="space-y-4 mt-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="students">Students</TabsTrigger>
              <TabsTrigger value="classes">Classes</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              {data.course.description && (
                <Card>
                  <CardHeader>
                    <CardTitle>Course Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{data.course.description}</p>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <Users className="h-8 w-8 text-primary" />
                      <div>
                        <p className="text-2xl font-bold">{data.total_students}</p>
                        <p className="text-xs text-muted-foreground">Total Students</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-8 w-8 text-primary" />
                      <div>
                        <p className="text-2xl font-bold">{data.active_students}</p>
                        <p className="text-xs text-muted-foreground">Active</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <Award className="h-8 w-8 text-primary" />
                      <div>
                        <p className="text-2xl font-bold">{data.completed_students}</p>
                        <p className="text-xs text-muted-foreground">Completed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-8 w-8 text-destructive" />
                      <div>
                        <p className="text-2xl font-bold">{data.at_risk_count}</p>
                        <p className="text-xs text-muted-foreground">At Risk</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Average Progress</span>
                        <span className="text-sm font-bold">{data.avg_progress}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${data.avg_progress}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Completion Rate</span>
                        <span className="text-sm font-bold">{data.completion_rate}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${data.completion_rate}%` }} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="students" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Student Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {data.student_performance.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">No students enrolled.</p>
                    )}
                    {data.student_performance.map(s => (
                      <div key={s.student_id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div>
                          <p className="font-medium">{s.student_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {s.class_name} • {s.completed_content}/{s.total_content} content items
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold">{s.progress_percentage}%</span>
                          <Badge variant={s.status === 'completed' ? 'default' : s.status === 'struggling' ? 'destructive' : 'secondary'}>
                            {s.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="classes" className="mt-6">
              <div className="space-y-4">
                {data.class_breakdown.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No classes assigned.</p>
                )}
                {data.class_breakdown.map(cls => (
                  <Card key={cls.class_id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{cls.class_name}</CardTitle>
                        <Badge variant="secondary">{cls.student_count} students</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Avg Progress</p>
                          <p className="text-2xl font-bold">{cls.avg_progress}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Completed</p>
                          <p className="text-2xl font-bold">{cls.completed_count}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
