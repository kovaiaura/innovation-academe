export interface OutcomeMetric {
  total_questions: number;
  correct_answers: number;
  accuracy: number;
  totalSessions: number;
  completedSessions: number;
  progress: number;
  studentCount: number;
}

export const emptyMetric = (): OutcomeMetric => ({ total_questions: 0, correct_answers: 0, accuracy: 0, totalSessions: 0, completedSessions: 0, progress: 0, studentCount: 0 });

export function finishMetric<T extends OutcomeMetric>(metric: T): T {
  return { ...metric, accuracy: metric.total_questions ? Math.round(metric.correct_answers / metric.total_questions * 100) : 0, progress: metric.totalSessions ? Math.round(metric.completedSessions / metric.totalSessions * 100) : 0 };
}

// Same session rule as the shared progress utilities: explicit officer completion
// OR every required content item completed. Empty sessions are not auto-complete.
export function isOutcomeSessionComplete(required: string[], completed: Set<string>, officerMarked: boolean) {
  return officerMarked || (required.length > 0 && required.every(id => completed.has(id)));
}

export function isRevisionTopic(metric: OutcomeMetric) {
  return metric.total_questions > 0 && metric.accuracy < 70;
}

export function isWithinOutcomeYear(date: string, range: { start: string; end: string }) {
  const time = new Date(date).getTime();
  return time >= new Date(range.start).getTime() && time < new Date(range.end).getTime();
}