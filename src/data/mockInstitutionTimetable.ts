import { InstitutionTimetableAssignment } from '@/types/institution';

export const mockInstitutionTimetable: Record<string, InstitutionTimetableAssignment[]> = {
  '1': [
    // Monday
    {
      id: 'tt-1',
      institution_id: '1',
      academic_year: '2024-25',
      day: 'Monday',
      period_id: 'period-1',
      class_id: 'class-8a',
      class_name: 'Class 8A',
      subject: 'Mathematics',
      room: 'Room 101',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'tt-2',
      institution_id: '1',
      academic_year: '2024-25',
      day: 'Monday',
      period_id: 'period-2',
      class_id: 'class-9b',
      class_name: 'Class 9B',
      subject: 'Science',
      room: 'Lab 1',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    // Tuesday
    {
      id: 'tt-3',
      institution_id: '1',
      academic_year: '2024-25',
      day: 'Tuesday',
      period_id: 'period-1',
      class_id: 'class-10a',
      class_name: 'Class 10A',
      subject: 'Physics',
      room: 'Lab 2',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'tt-4',
      institution_id: '1',
      academic_year: '2024-25',
      day: 'Tuesday',
      period_id: 'period-2',
      class_id: 'class-8a',
      class_name: 'Class 8A',
      subject: 'English',
      room: 'Room 102',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ],
  '2': []
};

export const getInstitutionTimetable = (institutionId: string): InstitutionTimetableAssignment[] => {
  return mockInstitutionTimetable[institutionId] || [];
};
