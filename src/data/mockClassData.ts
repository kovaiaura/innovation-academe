import { InstitutionClass } from '@/types/student';

export const mockInstitutionClasses: InstitutionClass[] = [
  // Springfield High School
  {
    id: 'class-spring-1',
    institution_id: 'springfield',
    class_name: 'Grade 1 A',
    display_order: 1,
    academic_year: '2024-2025',
    capacity: 40,
    room_number: 'Room 101',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'class-spring-2',
    institution_id: 'springfield',
    class_name: 'Grade 1 B',
    display_order: 2,
    academic_year: '2024-2025',
    capacity: 40,
    room_number: 'Room 102',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'class-spring-3',
    institution_id: 'springfield',
    class_name: 'Grade 2 A',
    display_order: 3,
    academic_year: '2024-2025',
    capacity: 35,
    room_number: 'Room 201',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  // Ryan International
  {
    id: 'class-ryan-1',
    institution_id: 'ryan',
    class_name: 'Class 2D',
    display_order: 1,
    academic_year: '2024-2025',
    capacity: 30,
    room_number: 'D-Block 201',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'class-ryan-2',
    institution_id: 'ryan',
    class_name: 'Standard V-B',
    display_order: 2,
    academic_year: '2024-2025',
    capacity: 35,
    room_number: 'B-Block 301',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  // Delhi Public School
  {
    id: 'class-dps-1',
    institution_id: 'dps',
    class_name: 'Grade 1 Section A',
    display_order: 1,
    academic_year: '2024-2025',
    capacity: 45,
    room_number: 'A-101',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'class-dps-2',
    institution_id: 'dps',
    class_name: 'Grade 1 Section B',
    display_order: 2,
    academic_year: '2024-2025',
    capacity: 45,
    room_number: 'A-102',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

export const getClassesByInstitution = (institutionId: string): InstitutionClass[] => {
  return mockInstitutionClasses
    .filter(c => c.institution_id === institutionId && c.status === 'active')
    .sort((a, b) => a.display_order - b.display_order);
};
