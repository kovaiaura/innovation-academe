import { Progress } from '@/components/ui/progress';
import type { OutcomeMetric } from '@/utils/courseOutcomeMetrics';

export function OutcomeProgress({ metric, compact = false }: { metric: OutcomeMetric; compact?: boolean }) {
  return <div className={`grid min-w-0 gap-4 ${compact ? 'sm:grid-cols-2' : ''}`}>
    <div className="space-y-2 min-w-0">
      <div className="flex items-center justify-between gap-2 text-sm"><span className="text-muted-foreground">Learning completion</span><strong>{metric.totalSessions ? `${metric.progress}%` : '—'}</strong></div>
      <Progress aria-label="Learning completion" value={metric.progress} className="outcome-learning h-2" />
      <p className="text-xs text-muted-foreground">{metric.totalSessions ? `${metric.completedSessions.toLocaleString()} / ${metric.totalSessions.toLocaleString()} ${metric.studentCount > 1 ? 'student-sessions' : 'sessions'} completed` : 'No allocated sessions'}</p>
    </div>
    <div className="space-y-2 min-w-0">
      <div className="flex items-center justify-between gap-2 text-sm"><span className="text-muted-foreground">Assessment accuracy</span><strong>{metric.total_questions ? `${metric.accuracy}%` : '—'}</strong></div>
      <Progress aria-label="Assessment accuracy" value={metric.total_questions ? metric.accuracy : 0} className="outcome-assessment h-2" />
      <p className="text-xs text-muted-foreground">{metric.total_questions ? `${metric.correct_answers.toLocaleString()} / ${metric.total_questions.toLocaleString()} answers correct${metric.total_questions < 5 ? ' · Small sample' : ''}` : 'Not assessed yet'}</p>
    </div>
  </div>;
}