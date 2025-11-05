import { ClassAnalytics } from '@/types/institution';

export const mockClassAnalytics: Record<string, ClassAnalytics> = {
  // Institution 1 - Grade 9 Section A
  'class-1-9a': {
    class_id: 'class-1-9a',
    period: '2024-2025',
    student_metrics: {
      total_students: 32,
      active_students: 32,
      average_attendance_rate: 94.2,
      gender_distribution: {
        male: 17,
        female: 14,
        other: 1
      }
    },
    academic_metrics: {
      average_grade: 82.5,
      assignment_completion_rate: 87.3,
      quiz_average_score: 80.1,
      top_performers_count: 10,
      students_needing_attention: 3,
      performance_distribution: {
        excellent: 10,
        good: 16,
        average: 5,
        below_average: 1
      }
    },
    course_metrics: {
      total_courses_assigned: 1,
      overall_completion_rate: 68.8,
      average_modules_completed: 2.8,
      assignment_submission_rate: 85.4,
      quiz_attempt_rate: 91.2
    },
    engagement_metrics: {
      average_login_frequency: 4.8,
      content_views_total: 3240,
      project_participation_rate: 75.2
    },
    attendance_trends: [
      { month: 'Sep', attendance_rate: 96.5 },
      { month: 'Oct', attendance_rate: 94.2 },
      { month: 'Nov', attendance_rate: 93.8 },
      { month: 'Dec', attendance_rate: 92.5 }
    ],
    top_students: [
      { student_id: 'stu-1-class-1-9a-1', student_name: 'Aarav Sharma', total_points: 985, rank: 1 },
      { student_id: 'stu-1-class-1-9a-2', student_name: 'Vivaan Verma', total_points: 962, rank: 2 },
      { student_id: 'stu-1-class-1-9a-3', student_name: 'Aditya Gupta', total_points: 945, rank: 3 },
      { student_id: 'stu-1-class-1-9a-4', student_name: 'Arjun Kumar', total_points: 928, rank: 4 },
      { student_id: 'stu-1-class-1-9a-5', student_name: 'Sai Singh', total_points: 910, rank: 5 }
    ]
  },

  // Institution 1 - Grade 9 Section B
  'class-1-9b': {
    class_id: 'class-1-9b',
    period: '2024-2025',
    student_metrics: {
      total_students: 33,
      active_students: 32,
      average_attendance_rate: 91.8,
      gender_distribution: {
        male: 18,
        female: 15,
        other: 0
      }
    },
    academic_metrics: {
      average_grade: 79.3,
      assignment_completion_rate: 83.6,
      quiz_average_score: 77.8,
      top_performers_count: 9,
      students_needing_attention: 5,
      performance_distribution: {
        excellent: 9,
        good: 15,
        average: 7,
        below_average: 2
      }
    },
    course_metrics: {
      total_courses_assigned: 1,
      overall_completion_rate: 54.5,
      average_modules_completed: 3.3,
      assignment_submission_rate: 81.2,
      quiz_attempt_rate: 87.9
    },
    engagement_metrics: {
      average_login_frequency: 4.3,
      content_views_total: 2980,
      project_participation_rate: 69.8
    },
    attendance_trends: [
      { month: 'Sep', attendance_rate: 93.2 },
      { month: 'Oct', attendance_rate: 91.8 },
      { month: 'Nov', attendance_rate: 90.5 },
      { month: 'Dec', attendance_rate: 91.2 }
    ],
    top_students: [
      { student_id: 'stu-1-class-1-9b-1', student_name: 'Krishna Patel', total_points: 952, rank: 1 },
      { student_id: 'stu-1-class-1-9b-2', student_name: 'Aryan Reddy', total_points: 935, rank: 2 },
      { student_id: 'stu-1-class-1-9b-3', student_name: 'Ishaan Rao', total_points: 918, rank: 3 },
      { student_id: 'stu-1-class-1-9b-4', student_name: 'Reyansh Mehta', total_points: 901, rank: 4 },
      { student_id: 'stu-1-class-1-9b-5', student_name: 'Ayaan Joshi', total_points: 887, rank: 5 }
    ]
  },

  // Institution 1 - Grade 10 Section A
  'class-1-10a': {
    class_id: 'class-1-10a',
    period: '2024-2025',
    student_metrics: {
      total_students: 30,
      active_students: 30,
      average_attendance_rate: 93.5,
      gender_distribution: {
        male: 16,
        female: 13,
        other: 1
      }
    },
    academic_metrics: {
      average_grade: 84.7,
      assignment_completion_rate: 89.4,
      quiz_average_score: 82.3,
      top_performers_count: 11,
      students_needing_attention: 2,
      performance_distribution: {
        excellent: 11,
        good: 14,
        average: 4,
        below_average: 1
      }
    },
    course_metrics: {
      total_courses_assigned: 1,
      overall_completion_rate: 80.0,
      average_modules_completed: 2.4,
      assignment_submission_rate: 88.1,
      quiz_attempt_rate: 93.5
    },
    engagement_metrics: {
      average_login_frequency: 5.2,
      content_views_total: 3567,
      project_participation_rate: 81.3
    },
    attendance_trends: [
      { month: 'Sep', attendance_rate: 95.1 },
      { month: 'Oct', attendance_rate: 93.5 },
      { month: 'Nov', attendance_rate: 92.8 },
      { month: 'Dec', attendance_rate: 93.0 }
    ],
    top_students: [
      { student_id: 'stu-1-class-1-10a-1', student_name: 'Aadhya Agarwal', total_points: 998, rank: 1 },
      { student_id: 'stu-1-class-1-10a-2', student_name: 'Ananya Desai', total_points: 975, rank: 2 },
      { student_id: 'stu-1-class-1-10a-3', student_name: 'Diya Nair', total_points: 958, rank: 3 },
      { student_id: 'stu-1-class-1-10a-4', student_name: 'Saanvi Kulkarni', total_points: 941, rank: 4 },
      { student_id: 'stu-1-class-1-10a-5', student_name: 'Pari Iyer', total_points: 925, rank: 5 }
    ]
  },

  // Institution 1 - Grade 11 Section A
  'class-1-11a': {
    class_id: 'class-1-11a',
    period: '2024-2025',
    student_metrics: {
      total_students: 28,
      active_students: 28,
      average_attendance_rate: 92.1,
      gender_distribution: {
        male: 15,
        female: 12,
        other: 1
      }
    },
    academic_metrics: {
      average_grade: 81.9,
      assignment_completion_rate: 85.7,
      quiz_average_score: 79.5,
      top_performers_count: 8,
      students_needing_attention: 4,
      performance_distribution: {
        excellent: 8,
        good: 13,
        average: 6,
        below_average: 1
      }
    },
    course_metrics: {
      total_courses_assigned: 1,
      overall_completion_rate: 64.3,
      average_modules_completed: 3.2,
      assignment_submission_rate: 83.9,
      quiz_attempt_rate: 89.6
    },
    engagement_metrics: {
      average_login_frequency: 4.6,
      content_views_total: 2845,
      project_participation_rate: 73.5
    },
    attendance_trends: [
      { month: 'Sep', attendance_rate: 94.2 },
      { month: 'Oct', attendance_rate: 92.1 },
      { month: 'Nov', attendance_rate: 90.8 },
      { month: 'Dec', attendance_rate: 91.5 }
    ],
    top_students: [
      { student_id: 'stu-1-class-1-11a-1', student_name: 'Sara Pandey', total_points: 968, rank: 1 },
      { student_id: 'stu-1-class-1-11a-2', student_name: 'Aaradhya Saxena', total_points: 945, rank: 2 },
      { student_id: 'stu-1-class-1-11a-3', student_name: 'Navya Bhat', total_points: 928, rank: 3 },
      { student_id: 'stu-1-class-1-11a-4', student_name: 'Angel Pillai', total_points: 912, rank: 4 },
      { student_id: 'stu-1-class-1-11a-5', student_name: 'Kiara Menon', total_points: 895, rank: 5 }
    ]
  },

  // Institution 1 - Grade 12 Section A
  'class-1-12a': {
    class_id: 'class-1-12a',
    period: '2024-2025',
    student_metrics: {
      total_students: 25,
      active_students: 25,
      average_attendance_rate: 95.8,
      gender_distribution: {
        male: 14,
        female: 11,
        other: 0
      }
    },
    academic_metrics: {
      average_grade: 87.2,
      assignment_completion_rate: 92.1,
      quiz_average_score: 85.6,
      top_performers_count: 12,
      students_needing_attention: 1,
      performance_distribution: {
        excellent: 12,
        good: 10,
        average: 3,
        below_average: 0
      }
    },
    course_metrics: {
      total_courses_assigned: 1,
      overall_completion_rate: 72.0,
      average_modules_completed: 5.8,
      assignment_submission_rate: 91.5,
      quiz_attempt_rate: 96.2
    },
    engagement_metrics: {
      average_login_frequency: 5.8,
      content_views_total: 4120,
      project_participation_rate: 88.5
    },
    attendance_trends: [
      { month: 'Sep', attendance_rate: 97.2 },
      { month: 'Oct', attendance_rate: 95.8 },
      { month: 'Nov', attendance_rate: 95.1 },
      { month: 'Dec', attendance_rate: 95.5 }
    ],
    top_students: [
      { student_id: 'stu-1-class-1-12a-1', student_name: 'Arnav Sharma', total_points: 1025, rank: 1 },
      { student_id: 'stu-1-class-1-12a-2', student_name: 'Dhruv Verma', total_points: 1008, rank: 2 },
      { student_id: 'stu-1-class-1-12a-3', student_name: 'Vihaan Gupta', total_points: 992, rank: 3 },
      { student_id: 'stu-1-class-1-12a-4', student_name: 'Shaurya Kumar', total_points: 975, rank: 4 },
      { student_id: 'stu-1-class-1-12a-5', student_name: 'Atharv Singh', total_points: 958, rank: 5 }
    ]
  },

  // Legacy - Springfield High
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
