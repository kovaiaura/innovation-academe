import { ClassAnalytics } from '@/types/institution';

export const mockClassAnalytics: Record<string, ClassAnalytics> = {
  'class-spring-1': {
    class_id: 'class-spring-1',
    period: '2024-2025',
    student_metrics: {
      total_students: 35,
      active_students: 33,
      average_attendance_rate: 92.5,
      gender_distribution: {
        male: 18,
        female: 15,
        other: 2
      }
    },
    academic_metrics: {
      average_grade: 78.4,
      assignment_completion_rate: 85.2,
      quiz_average_score: 76.8,
      top_performers_count: 8,
      students_needing_attention: 5,
      performance_distribution: {
        excellent: 8,
        good: 18,
        average: 7,
        below_average: 2
      }
    },
    course_metrics: {
      total_courses_assigned: 3,
      overall_completion_rate: 45.6,
      average_modules_completed: 2.3,
      assignment_submission_rate: 82.1,
      quiz_attempt_rate: 88.5
    },
    engagement_metrics: {
      average_login_frequency: 4.2,
      content_views_total: 2456,
      project_participation_rate: 68.5
    },
    attendance_trends: [
      { month: 'Sep', attendance_rate: 94.2 },
      { month: 'Oct', attendance_rate: 92.8 },
      { month: 'Nov', attendance_rate: 91.5 },
      { month: 'Dec', attendance_rate: 90.2 }
    ],
    top_students: [
      { student_id: 'stu-1', student_name: 'Alice Johnson', total_points: 950, rank: 1 },
      { student_id: 'stu-2', student_name: 'Bob Smith', total_points: 920, rank: 2 },
      { student_id: 'stu-3', student_name: 'Carol White', total_points: 890, rank: 3 },
      { student_id: 'stu-4', student_name: 'David Brown', total_points: 870, rank: 4 },
      { student_id: 'stu-5', student_name: 'Emma Davis', total_points: 850, rank: 5 }
    ]
  },
  'class-ryan-1': {
    class_id: 'class-ryan-1',
    period: '2024-2025',
    student_metrics: {
      total_students: 28,
      active_students: 27,
      average_attendance_rate: 89.3,
      gender_distribution: {
        male: 15,
        female: 12,
        other: 1
      }
    },
    academic_metrics: {
      average_grade: 72.1,
      assignment_completion_rate: 78.5,
      quiz_average_score: 71.2,
      top_performers_count: 5,
      students_needing_attention: 7,
      performance_distribution: {
        excellent: 5,
        good: 12,
        average: 8,
        below_average: 3
      }
    },
    course_metrics: {
      total_courses_assigned: 2,
      overall_completion_rate: 52.3,
      average_modules_completed: 1.8,
      assignment_submission_rate: 75.6,
      quiz_attempt_rate: 82.4
    },
    engagement_metrics: {
      average_login_frequency: 3.8,
      content_views_total: 1890,
      project_participation_rate: 61.2
    },
    attendance_trends: [
      { month: 'Sep', attendance_rate: 91.5 },
      { month: 'Oct', attendance_rate: 89.2 },
      { month: 'Nov', attendance_rate: 88.1 },
      { month: 'Dec', attendance_rate: 88.5 }
    ],
    top_students: [
      { student_id: 'stu-6', student_name: 'Frank Wilson', total_points: 880, rank: 1 },
      { student_id: 'stu-7', student_name: 'Grace Lee', total_points: 850, rank: 2 },
      { student_id: 'stu-8', student_name: 'Henry Chen', total_points: 820, rank: 3 },
      { student_id: 'stu-9', student_name: 'Ivy Martinez', total_points: 800, rank: 4 },
      { student_id: 'stu-10', student_name: 'Jack Taylor', total_points: 780, rank: 5 }
    ]
  }
};

export const getClassAnalytics = (classId: string): ClassAnalytics | undefined => {
  return mockClassAnalytics[classId];
};
