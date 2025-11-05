import { InstitutionAnalytics } from '@/types/institution';

export const mockInstitutionAnalytics: Record<string, InstitutionAnalytics> = {
  '1': {
    institution_id: '1',
    period: '2024-25',
    student_metrics: {
      total_students: 1247,
      active_students: 1198,
      new_enrollments: 47,
      attendance_rate: 92.5,
      dropout_rate: 1.2,
      gender_distribution: {
        male: 642,
        female: 598,
        other: 7
      }
    },
    academic_metrics: {
      average_grade: 78.4,
      top_performing_class: 'Class 10A',
      students_needing_attention: 34,
      subject_performance: [
        { subject: 'Mathematics', average_score: 82.3 },
        { subject: 'Science', average_score: 79.1 },
        { subject: 'English', average_score: 85.6 },
        { subject: 'Social Studies', average_score: 76.8 },
        { subject: 'Computer Science', average_score: 88.2 }
      ]
    },
    staff_metrics: {
      total_officers: 12,
      officer_utilization_rate: 87.5,
      staff_attendance_rate: 95.2,
      teacher_student_ratio: '1:24'
    },
    operational_metrics: {
      total_classes: 18,
      lab_utilization: 76.3,
      event_participation_rate: 68.4,
      project_completion_rate: 84.7
    }
  },
  '2': {
    institution_id: '2',
    period: '2024-25',
    student_metrics: {
      total_students: 892,
      active_students: 865,
      new_enrollments: 32,
      attendance_rate: 89.7,
      dropout_rate: 1.8,
      gender_distribution: {
        male: 458,
        female: 429,
        other: 5
      }
    },
    academic_metrics: {
      average_grade: 74.2,
      top_performing_class: 'Class 9B',
      students_needing_attention: 28,
      subject_performance: [
        { subject: 'Mathematics', average_score: 76.5 },
        { subject: 'Science', average_score: 73.8 },
        { subject: 'English', average_score: 81.2 },
        { subject: 'Social Studies', average_score: 72.4 },
        { subject: 'Computer Science', average_score: 79.6 }
      ]
    },
    staff_metrics: {
      total_officers: 8,
      officer_utilization_rate: 82.3,
      staff_attendance_rate: 93.8,
      teacher_student_ratio: '1:28'
    },
    operational_metrics: {
      total_classes: 14,
      lab_utilization: 68.9,
      event_participation_rate: 62.1,
      project_completion_rate: 79.3
    }
  }
};

export const getInstitutionAnalytics = (institutionId: string): InstitutionAnalytics | undefined => {
  return mockInstitutionAnalytics[institutionId];
};
