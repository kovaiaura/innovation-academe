import { AssignmentStatus, StandaloneAssignment, SubmissionStatus } from '@/types/assignment-management';
import { format, isPast, isFuture, isToday, parseISO, differenceInDays, differenceInHours } from 'date-fns';

/**
 * Calculate assignment status based on dates
 */
export function getAssignmentStatus(assignment: StandaloneAssignment): AssignmentStatus {
  if (assignment.status === 'draft') return 'draft';
  
  const dueDateTime = parseISO(`${assignment.due_date}T${assignment.due_time || '23:59'}`);
  const now = new Date();
  
  if (isFuture(dueDateTime)) {
    // Check if it's upcoming (not yet started) - within 7 days
    const daysUntilDue = differenceInDays(dueDateTime, now);
    if (daysUntilDue > 7) {
      return 'upcoming';
    }
    return 'ongoing';
  }
  
  if (isPast(dueDateTime)) {
    return 'overdue';
  }
  
  return 'completed';
}

/**
 * Check if submission is late
 */
export function isLateSubmission(dueDate: string, dueTime: string, submittedAt: string): boolean {
  const dueDateTimeStr = `${dueDate}T${dueTime || '23:59'}`;
  const dueDateTime = parseISO(dueDateTimeStr);
  const submissionDateTime = parseISO(submittedAt);
  
  return submissionDateTime > dueDateTime;
}

/**
 * Calculate late penalty
 */
export function calculateLatePenalty(
  originalScore: number,
  penaltyPercentage: number,
  dueDate: string,
  dueTime: string,
  submittedAt: string
): number {
  if (!isLateSubmission(dueDate, dueTime, submittedAt)) {
    return originalScore;
  }
  
  const penalty = originalScore * (penaltyPercentage / 100);
  return Math.max(0, originalScore - penalty);
}

/**
 * Format due date for display
 */
export function formatDueDate(dueDate: string, dueTime?: string): string {
  const date = parseISO(dueDate);
  
  if (isToday(date)) {
    return `Today at ${dueTime || '23:59'}`;
  }
  
  const formattedDate = format(date, 'MMM dd, yyyy');
  const formattedTime = dueTime || '23:59';
  
  return `${formattedDate} at ${formattedTime}`;
}

/**
 * Get countdown text for due date
 */
export function getDueDateCountdown(dueDate: string, dueTime?: string): string {
  const dueDateTimeStr = `${dueDate}T${dueTime || '23:59'}`;
  const dueDateTime = parseISO(dueDateTimeStr);
  const now = new Date();
  
  if (isPast(dueDateTime)) {
    return 'Overdue';
  }
  
  const daysLeft = differenceInDays(dueDateTime, now);
  const hoursLeft = differenceInHours(dueDateTime, now);
  
  if (daysLeft > 1) {
    return `${daysLeft} days left`;
  }
  
  if (daysLeft === 1) {
    return '1 day left';
  }
  
  if (hoursLeft > 1) {
    return `${hoursLeft} hours left`;
  }
  
  if (hoursLeft === 1) {
    return '1 hour left';
  }
  
  return 'Due soon';
}

/**
 * Get submission type label
 */
export function getSubmissionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    file_upload: 'File Upload',
    text_submission: 'Text Submission',
    url_submission: 'URL Submission',
    multi_question: 'Multi-Question',
  };
  
  return labels[type] || type;
}

/**
 * Get assignment status badge color
 */
export function getAssignmentStatusColor(status: AssignmentStatus): string {
  const colors: Record<AssignmentStatus, string> = {
    draft: 'secondary',
    ongoing: 'default',
    upcoming: 'outline',
    completed: 'success',
    overdue: 'destructive',
  };
  
  return colors[status] || 'default';
}

/**
 * Get submission status badge color
 */
export function getSubmissionStatusColor(status: SubmissionStatus): string {
  const colors: Record<SubmissionStatus, string> = {
    not_started: 'secondary',
    in_progress: 'outline',
    submitted: 'default',
    graded: 'success',
    late_submitted: 'destructive',
  };
  
  return colors[status] || 'default';
}

/**
 * Get submission status label
 */
export function getSubmissionStatusLabel(status: SubmissionStatus): string {
  const labels: Record<SubmissionStatus, string> = {
    not_started: 'Not Started',
    in_progress: 'In Progress',
    submitted: 'Submitted',
    graded: 'Graded',
    late_submitted: 'Late Submission',
  };
  
  return labels[status] || status;
}

/**
 * Calculate progress for multi-question assignment
 */
export function calculateAssignmentProgress(totalQuestions: number, answeredQuestions: number): number {
  if (totalQuestions === 0) return 0;
  return Math.round((answeredQuestions / totalQuestions) * 100);
}

/**
 * Validate file type
 */
export function isValidFileType(fileName: string, allowedTypes: string[]): boolean {
  const extension = fileName.split('.').pop()?.toLowerCase();
  if (!extension) return false;
  
  return allowedTypes.map(t => t.toLowerCase()).includes(extension);
}

/**
 * Format file size
 */
export function formatFileSize(sizeMB: number): string {
  if (sizeMB < 1) {
    return `${Math.round(sizeMB * 1024)} KB`;
  }
  return `${sizeMB.toFixed(2)} MB`;
}

/**
 * Get grade percentage
 */
export function getGradePercentage(grade: number, maxGrade: number): number {
  if (maxGrade === 0) return 0;
  return Math.round((grade / maxGrade) * 100);
}

/**
 * Get grade label (A, B, C, etc.)
 */
export function getGradeLabel(percentage: number): string {
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
}
