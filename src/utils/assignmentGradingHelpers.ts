import { StandaloneAssignment, StandaloneAssignmentSubmission } from '@/types/assignment-management';
import { Student } from '@/types/student';
import { awardAssignmentCompletionCertificate } from './certificateAutoAward';

/**
 * Grade an assignment submission and award certificate if applicable
 */
export async function gradeAssignmentAndAwardCertificate(
  submission: StandaloneAssignmentSubmission,
  assignment: StandaloneAssignment,
  student: Student,
  institutionName: string,
  grade: number,
  feedback?: string
): Promise<void> {
  // Update submission with grade
  submission.grade = grade;
  submission.feedback = feedback;
  submission.status = 'graded';
  submission.graded_at = new Date().toISOString();

  // Auto-award certificate if assignment has one and student passed
  if (assignment.certificate_template_id) {
    await awardAssignmentCompletionCertificate(
      student,
      assignment,
      institutionName,
      submission.graded_at,
      grade
    );
  }
}

/**
 * Calculate percentage grade
 */
export function calculateGradePercentage(score: number, totalPoints: number): number {
  return Math.round((score / totalPoints) * 100);
}

/**
 * Check if grade is passing (>= 60%)
 */
export function isPassingGrade(score: number, totalPoints: number): boolean {
  return calculateGradePercentage(score, totalPoints) >= 60;
}
