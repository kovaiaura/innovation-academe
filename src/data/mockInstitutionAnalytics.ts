import { InstitutionAnalytics } from '@/types/institution';

export const mockInstitutionAnalytics: Record<string, InstitutionAnalytics> = {
  'inst-msd-001': {
    institution_id: 'inst-msd-001',
    period: '2024-25',
    student_metrics: {
      total_students: 350,
      active_students: 345,
      new_enrollments: 50,
      attendance_rate: 93.2,
      dropout_rate: 0.8,
      gender_distribution: {
        male: 185,
        female: 163,
        other: 2
      }
    },
    academic_metrics: {
      average_grade: 81.5,
      top_performing_class: 'Grade 11 - Section A',
      students_needing_attention: 12,
      subject_performance: [
        { subject: 'Mathematics', average_score: 84.2 },
        { subject: 'Science', average_score: 82.8 },
        { subject: 'English', average_score: 87.3 },
        { subject: 'Social Studies', average_score: 79.5 },
        { subject: 'Innovation Lab', average_score: 90.1 }
      ]
    },
    staff_metrics: {
      total_officers: 1,
      officer_utilization_rate: 92.5,
      staff_attendance_rate: 96.8,
      teacher_student_ratio: '1:25'
    },
    operational_metrics: {
      total_classes: 14,
      lab_utilization: 82.5,
      event_participation_rate: 72.3,
      project_completion_rate: 88.2
    }
  },
  'inst-kga-001': {
    institution_id: 'inst-kga-001',
    period: '2024-25',
    student_metrics: {
      total_students: 520,
      active_students: 512,
      new_enrollments: 75,
      attendance_rate: 94.8,
      dropout_rate: 0.5,
      gender_distribution: {
        male: 278,
        female: 239,
        other: 3
      }
    },
    academic_metrics: {
      average_grade: 83.7,
      top_performing_class: 'Grade 12 - Section A',
      students_needing_attention: 18,
      subject_performance: [
        { subject: 'Mathematics', average_score: 86.5 },
        { subject: 'Science', average_score: 85.2 },
        { subject: 'English', average_score: 88.9 },
        { subject: 'Social Studies', average_score: 81.3 },
        { subject: 'Innovation Lab', average_score: 92.4 }
      ]
    },
    staff_metrics: {
      total_officers: 2,
      officer_utilization_rate: 95.3,
      staff_attendance_rate: 98.5,
      teacher_student_ratio: '1:26'
    },
    operational_metrics: {
      total_classes: 21,
      lab_utilization: 88.7,
      event_participation_rate: 79.6,
      project_completion_rate: 91.3
    }
  }
};

export const getInstitutionAnalytics = (institutionId: string): InstitutionAnalytics | undefined => {
  return mockInstitutionAnalytics[institutionId];
};
