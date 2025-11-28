import { InstitutionTimetableAssignment } from '@/types/institution';

const INSTITUTION_TIMETABLE_KEY = 'institution_timetables';

// Initial mock data with correct IDs
const initialMockInstitutionTimetable: Record<string, InstitutionTimetableAssignment[]> = {
  'inst-msd-001': [
    // Monday
    {
      id: 'tt-msd-1',
      institution_id: 'inst-msd-001',
      academic_year: '2024-25',
      day: 'Monday',
      period_id: 'period-1',
      class_id: 'class-msd-8a',
      class_name: 'Grade 8 - Section A',
      subject: 'STEM Workshop - Robotics Basics',
      room: 'Innovation Lab 1',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'tt-msd-2',
      institution_id: 'inst-msd-001',
      academic_year: '2024-25',
      day: 'Monday',
      period_id: 'period-2',
      class_id: 'class-msd-9b',
      class_name: 'Grade 9 - Section B',
      subject: 'STEM Lab - IoT Projects',
      room: 'Electronics Lab',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'tt-msd-3',
      institution_id: 'inst-msd-001',
      academic_year: '2024-25',
      day: 'Monday',
      period_id: 'period-4',
      class_id: 'class-msd-10a',
      class_name: 'Grade 10 - Section A',
      subject: 'AI & Machine Learning Intro',
      room: 'Computer Lab',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    // Tuesday
    {
      id: 'tt-msd-4',
      institution_id: 'inst-msd-001',
      academic_year: '2024-25',
      day: 'Tuesday',
      period_id: 'period-1',
      class_id: 'class-msd-7a',
      class_name: 'Grade 7 - Section A',
      subject: 'Design Thinking Fundamentals',
      room: 'Room 201',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'tt-msd-5',
      institution_id: 'inst-msd-001',
      academic_year: '2024-25',
      day: 'Tuesday',
      period_id: 'period-2',
      class_id: 'class-msd-8b',
      class_name: 'Grade 8 - Section B',
      subject: 'Arduino Programming',
      room: 'Electronics Lab',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    // Wednesday
    {
      id: 'tt-msd-6',
      institution_id: 'inst-msd-001',
      academic_year: '2024-25',
      day: 'Wednesday',
      period_id: 'period-1',
      class_id: 'class-msd-9a',
      class_name: 'Grade 9 - Section A',
      subject: 'Data Science Basics',
      room: 'Computer Lab',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'tt-msd-7',
      institution_id: 'inst-msd-001',
      academic_year: '2024-25',
      day: 'Wednesday',
      period_id: 'period-3',
      class_id: 'class-msd-6a',
      class_name: 'Grade 6 - Section A',
      subject: 'Introduction to Electronics',
      room: 'Innovation Lab 1',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    // Thursday
    {
      id: 'tt-msd-8',
      institution_id: 'inst-msd-001',
      academic_year: '2024-25',
      day: 'Thursday',
      period_id: 'period-2',
      class_id: 'class-msd-11a',
      class_name: 'Grade 11 - Section A',
      subject: 'Advanced Robotics',
      room: 'Innovation Lab 1',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    // Friday
    {
      id: 'tt-msd-9',
      institution_id: 'inst-msd-001',
      academic_year: '2024-25',
      day: 'Friday',
      period_id: 'period-1',
      class_id: 'class-msd-12a',
      class_name: 'Grade 12 - Section A',
      subject: 'Project Review - Innovation Showcase',
      room: 'Auditorium',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ],
  'inst-kga-001': [
    // Monday
    {
      id: 'tt-kga-1',
      institution_id: 'inst-kga-001',
      academic_year: '2024-25',
      day: 'Monday',
      period_id: 'period-1',
      class_id: 'class-kga-8a',
      class_name: 'Grade 8 - Section A',
      subject: 'STEM Workshop - Mechanical Design',
      room: 'Engineering Lab',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'tt-kga-2',
      institution_id: 'inst-kga-001',
      academic_year: '2024-25',
      day: 'Monday',
      period_id: 'period-2',
      class_id: 'class-kga-9a',
      class_name: 'Grade 9 - Section A',
      subject: 'CAD Modeling Basics',
      room: 'Design Studio',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    // Tuesday
    {
      id: 'tt-kga-3',
      institution_id: 'inst-kga-001',
      academic_year: '2024-25',
      day: 'Tuesday',
      period_id: 'period-1',
      class_id: 'class-kga-10a',
      class_name: 'Grade 10 - Section A',
      subject: 'Automation Systems',
      room: 'Engineering Lab',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'tt-kga-4',
      institution_id: 'inst-kga-001',
      academic_year: '2024-25',
      day: 'Tuesday',
      period_id: 'period-3',
      class_id: 'class-kga-7b',
      class_name: 'Grade 7 - Section B',
      subject: 'Basic Electronics',
      room: 'Physics Lab',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    // Wednesday
    {
      id: 'tt-kga-5',
      institution_id: 'inst-kga-001',
      academic_year: '2024-25',
      day: 'Wednesday',
      period_id: 'period-2',
      class_id: 'class-kga-8b',
      class_name: 'Grade 8 - Section B',
      subject: 'Prototype Development',
      room: 'Workshop',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    // Thursday
    {
      id: 'tt-kga-6',
      institution_id: 'inst-kga-001',
      academic_year: '2024-25',
      day: 'Thursday',
      period_id: 'period-1',
      class_id: 'class-kga-9b',
      class_name: 'Grade 9 - Section B',
      subject: 'Robotics Programming',
      room: 'Engineering Lab',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'tt-kga-7',
      institution_id: 'inst-kga-001',
      academic_year: '2024-25',
      day: 'Thursday',
      period_id: 'period-4',
      class_id: 'class-kga-11a',
      class_name: 'Grade 11 - Section A',
      subject: 'Innovation Projects Review',
      room: 'Conference Hall',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    // Friday
    {
      id: 'tt-kga-8',
      institution_id: 'inst-kga-001',
      academic_year: '2024-25',
      day: 'Friday',
      period_id: 'period-2',
      class_id: 'class-kga-6c',
      class_name: 'Grade 6 - Section C',
      subject: 'Introduction to STEM',
      room: 'Room A-103',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    // Saturday
    {
      id: 'tt-kga-9',
      institution_id: 'inst-kga-001',
      academic_year: '2024-25',
      day: 'Saturday',
      period_id: 'period-1',
      class_id: 'class-kga-12a',
      class_name: 'Grade 12 - Section A',
      subject: 'Innovation Boot Camp',
      room: 'Auditorium',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ]
};

// localStorage functions
export function loadInstitutionTimetables(): Record<string, InstitutionTimetableAssignment[]> {
  try {
    const stored = localStorage.getItem(INSTITUTION_TIMETABLE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading institution timetables:', error);
  }
  // Initialize with mock data if not in localStorage
  saveInstitutionTimetables(initialMockInstitutionTimetable);
  return initialMockInstitutionTimetable;
}

export function saveInstitutionTimetables(timetables: Record<string, InstitutionTimetableAssignment[]>): void {
  try {
    localStorage.setItem(INSTITUTION_TIMETABLE_KEY, JSON.stringify(timetables));
  } catch (error) {
    console.error('Error saving institution timetables:', error);
  }
}

export function getInstitutionTimetable(institutionId: string): InstitutionTimetableAssignment[] {
  const timetables = loadInstitutionTimetables();
  return timetables[institutionId] || [];
}

export function saveInstitutionTimetable(institutionId: string, assignments: InstitutionTimetableAssignment[]): void {
  const timetables = loadInstitutionTimetables();
  timetables[institutionId] = assignments;
  saveInstitutionTimetables(timetables);
}

export function addTimetableAssignment(institutionId: string, assignment: InstitutionTimetableAssignment): void {
  const timetables = loadInstitutionTimetables();
  if (!timetables[institutionId]) {
    timetables[institutionId] = [];
  }
  timetables[institutionId].push(assignment);
  saveInstitutionTimetables(timetables);
}

export function updateTimetableAssignment(institutionId: string, assignmentId: string, updates: Partial<InstitutionTimetableAssignment>): void {
  const timetables = loadInstitutionTimetables();
  if (timetables[institutionId]) {
    timetables[institutionId] = timetables[institutionId].map(a =>
      a.id === assignmentId ? { ...a, ...updates, updated_at: new Date().toISOString() } : a
    );
    saveInstitutionTimetables(timetables);
  }
}

export function deleteTimetableAssignment(institutionId: string, assignmentId: string): void {
  const timetables = loadInstitutionTimetables();
  if (timetables[institutionId]) {
    timetables[institutionId] = timetables[institutionId].filter(a => a.id !== assignmentId);
    saveInstitutionTimetables(timetables);
  }
}

// Legacy export for backward compatibility
export const mockInstitutionTimetable = initialMockInstitutionTimetable;
