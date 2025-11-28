import { InstitutionClass } from '@/types/student';

const CLASSES_STORAGE_KEY = 'institution_classes';

// Initial mock data with correct IDs
const initialMockInstitutionClasses: InstitutionClass[] = [
  // Modern School Vasant Vihar - Grades 6-12 (Sections A & B)
  { id: 'class-msd-6a', institution_id: 'inst-msd-001', class_name: 'Grade 6 - Section A', display_order: 1, academic_year: '2024-25', capacity: 25, room_number: '101', created_at: '2025-04-01T00:00:00Z', updated_at: '2025-04-01T00:00:00Z', status: 'active' as const },
  { id: 'class-msd-6b', institution_id: 'inst-msd-001', class_name: 'Grade 6 - Section B', display_order: 2, academic_year: '2024-25', capacity: 25, room_number: '102', created_at: '2025-04-01T00:00:00Z', updated_at: '2025-04-01T00:00:00Z', status: 'active' as const },
  
  { id: 'class-msd-7a', institution_id: 'inst-msd-001', class_name: 'Grade 7 - Section A', display_order: 3, academic_year: '2024-25', capacity: 25, room_number: '201', created_at: '2025-04-01T00:00:00Z', updated_at: '2025-04-01T00:00:00Z', status: 'active' as const },
  { id: 'class-msd-7b', institution_id: 'inst-msd-001', class_name: 'Grade 7 - Section B', display_order: 4, academic_year: '2024-25', capacity: 25, room_number: '202', created_at: '2025-04-01T00:00:00Z', updated_at: '2025-04-01T00:00:00Z', status: 'active' as const },
  
  { id: 'class-msd-8a', institution_id: 'inst-msd-001', class_name: 'Grade 8 - Section A', display_order: 5, academic_year: '2024-25', capacity: 25, room_number: '301', created_at: '2025-04-01T00:00:00Z', updated_at: '2025-04-01T00:00:00Z', status: 'active' as const },
  { id: 'class-msd-8b', institution_id: 'inst-msd-001', class_name: 'Grade 8 - Section B', display_order: 6, academic_year: '2024-25', capacity: 25, room_number: '302', created_at: '2025-04-01T00:00:00Z', updated_at: '2025-04-01T00:00:00Z', status: 'active' as const },
  
  { id: 'class-msd-9a', institution_id: 'inst-msd-001', class_name: 'Grade 9 - Section A', display_order: 7, academic_year: '2024-25', capacity: 25, room_number: '401', created_at: '2025-04-01T00:00:00Z', updated_at: '2025-04-01T00:00:00Z', status: 'active' as const },
  { id: 'class-msd-9b', institution_id: 'inst-msd-001', class_name: 'Grade 9 - Section B', display_order: 8, academic_year: '2024-25', capacity: 25, room_number: '402', created_at: '2025-04-01T00:00:00Z', updated_at: '2025-04-01T00:00:00Z', status: 'active' as const },
  
  { id: 'class-msd-10a', institution_id: 'inst-msd-001', class_name: 'Grade 10 - Section A', display_order: 9, academic_year: '2024-25', capacity: 25, room_number: '501', created_at: '2025-04-01T00:00:00Z', updated_at: '2025-04-01T00:00:00Z', status: 'active' as const },
  { id: 'class-msd-10b', institution_id: 'inst-msd-001', class_name: 'Grade 10 - Section B', display_order: 10, academic_year: '2024-25', capacity: 25, room_number: '502', created_at: '2025-04-01T00:00:00Z', updated_at: '2025-04-01T00:00:00Z', status: 'active' as const },
  
  { id: 'class-msd-11a', institution_id: 'inst-msd-001', class_name: 'Grade 11 - Section A', display_order: 11, academic_year: '2024-25', capacity: 25, room_number: '601', created_at: '2025-04-01T00:00:00Z', updated_at: '2025-04-01T00:00:00Z', status: 'active' as const },
  { id: 'class-msd-11b', institution_id: 'inst-msd-001', class_name: 'Grade 11 - Section B', display_order: 12, academic_year: '2024-25', capacity: 25, room_number: '602', created_at: '2025-04-01T00:00:00Z', updated_at: '2025-04-01T00:00:00Z', status: 'active' as const },
  
  { id: 'class-msd-12a', institution_id: 'inst-msd-001', class_name: 'Grade 12 - Section A', display_order: 13, academic_year: '2024-25', capacity: 25, room_number: '701', created_at: '2025-04-01T00:00:00Z', updated_at: '2025-04-01T00:00:00Z', status: 'active' as const },
  { id: 'class-msd-12b', institution_id: 'inst-msd-001', class_name: 'Grade 12 - Section B', display_order: 14, academic_year: '2024-25', capacity: 25, room_number: '702', created_at: '2025-04-01T00:00:00Z', updated_at: '2025-04-01T00:00:00Z', status: 'active' as const },

  // Kikani Global Academy - Grades 6-12 (Sections A, B & C)
  { id: 'class-kga-6a', institution_id: 'inst-kga-001', class_name: 'Grade 6 - Section A', display_order: 1, academic_year: '2024-25', capacity: 27, room_number: 'A-101', created_at: '2025-04-01T00:00:00Z', updated_at: '2025-04-01T00:00:00Z', status: 'active' as const },
  { id: 'class-kga-6b', institution_id: 'inst-kga-001', class_name: 'Grade 6 - Section B', display_order: 2, academic_year: '2024-25', capacity: 27, room_number: 'A-102', created_at: '2025-04-01T00:00:00Z', updated_at: '2025-04-01T00:00:00Z', status: 'active' as const },
  { id: 'class-kga-6c', institution_id: 'inst-kga-001', class_name: 'Grade 6 - Section C', display_order: 3, academic_year: '2024-25', capacity: 26, room_number: 'A-103', created_at: '2025-04-01T00:00:00Z', updated_at: '2025-04-01T00:00:00Z', status: 'active' as const },
  
  { id: 'class-kga-7a', institution_id: 'inst-kga-001', class_name: 'Grade 7 - Section A', display_order: 4, academic_year: '2024-25', capacity: 25, room_number: 'A-201', created_at: '2025-04-01T00:00:00Z', updated_at: '2025-04-01T00:00:00Z', status: 'active' as const },
  { id: 'class-kga-7b', institution_id: 'inst-kga-001', class_name: 'Grade 7 - Section B', display_order: 5, academic_year: '2024-25', capacity: 25, room_number: 'A-202', created_at: '2025-04-01T00:00:00Z', updated_at: '2025-04-01T00:00:00Z', status: 'active' as const },
  { id: 'class-kga-7c', institution_id: 'inst-kga-001', class_name: 'Grade 7 - Section C', display_order: 6, academic_year: '2024-25', capacity: 25, room_number: 'A-203', created_at: '2025-04-01T00:00:00Z', updated_at: '2025-04-01T00:00:00Z', status: 'active' as const },
  
  { id: 'class-kga-8a', institution_id: 'inst-kga-001', class_name: 'Grade 8 - Section A', display_order: 7, academic_year: '2024-25', capacity: 25, room_number: 'B-101', created_at: '2025-04-01T00:00:00Z', updated_at: '2025-04-01T00:00:00Z', status: 'active' as const },
  { id: 'class-kga-8b', institution_id: 'inst-kga-001', class_name: 'Grade 8 - Section B', display_order: 8, academic_year: '2024-25', capacity: 25, room_number: 'B-102', created_at: '2025-04-01T00:00:00Z', updated_at: '2025-04-01T00:00:00Z', status: 'active' as const },
  { id: 'class-kga-8c', institution_id: 'inst-kga-001', class_name: 'Grade 8 - Section C', display_order: 9, academic_year: '2024-25', capacity: 25, room_number: 'B-103', created_at: '2025-04-01T00:00:00Z', updated_at: '2025-04-01T00:00:00Z', status: 'active' as const },
  
  { id: 'class-kga-9a', institution_id: 'inst-kga-001', class_name: 'Grade 9 - Section A', display_order: 10, academic_year: '2024-25', capacity: 24, room_number: 'B-201', created_at: '2025-04-01T00:00:00Z', updated_at: '2025-04-01T00:00:00Z', status: 'active' as const },
  { id: 'class-kga-9b', institution_id: 'inst-kga-001', class_name: 'Grade 9 - Section B', display_order: 11, academic_year: '2024-25', capacity: 23, room_number: 'B-202', created_at: '2025-04-01T00:00:00Z', updated_at: '2025-04-01T00:00:00Z', status: 'active' as const },
  { id: 'class-kga-9c', institution_id: 'inst-kga-001', class_name: 'Grade 9 - Section C', display_order: 12, academic_year: '2024-25', capacity: 23, room_number: 'B-203', created_at: '2025-04-01T00:00:00Z', updated_at: '2025-04-01T00:00:00Z', status: 'active' as const },
  
  { id: 'class-kga-10a', institution_id: 'inst-kga-001', class_name: 'Grade 10 - Section A', display_order: 13, academic_year: '2024-25', capacity: 24, room_number: 'C-101', created_at: '2025-04-01T00:00:00Z', updated_at: '2025-04-01T00:00:00Z', status: 'active' as const },
  { id: 'class-kga-10b', institution_id: 'inst-kga-001', class_name: 'Grade 10 - Section B', display_order: 14, academic_year: '2024-25', capacity: 23, room_number: 'C-102', created_at: '2025-04-01T00:00:00Z', updated_at: '2025-04-01T00:00:00Z', status: 'active' as const },
  { id: 'class-kga-10c', institution_id: 'inst-kga-001', class_name: 'Grade 10 - Section C', display_order: 15, academic_year: '2024-25', capacity: 23, room_number: 'C-103', created_at: '2025-04-01T00:00:00Z', updated_at: '2025-04-01T00:00:00Z', status: 'active' as const },
  
  { id: 'class-kga-11a', institution_id: 'inst-kga-001', class_name: 'Grade 11 - Section A', display_order: 16, academic_year: '2024-25', capacity: 25, room_number: 'C-201', created_at: '2025-04-01T00:00:00Z', updated_at: '2025-04-01T00:00:00Z', status: 'active' as const },
  { id: 'class-kga-11b', institution_id: 'inst-kga-001', class_name: 'Grade 11 - Section B', display_order: 17, academic_year: '2024-25', capacity: 25, room_number: 'C-202', created_at: '2025-04-01T00:00:00Z', updated_at: '2025-04-01T00:00:00Z', status: 'active' as const },
  { id: 'class-kga-11c', institution_id: 'inst-kga-001', class_name: 'Grade 11 - Section C', display_order: 18, academic_year: '2024-25', capacity: 25, room_number: 'C-203', created_at: '2025-04-01T00:00:00Z', updated_at: '2025-04-01T00:00:00Z', status: 'active' as const },
  
  { id: 'class-kga-12a', institution_id: 'inst-kga-001', class_name: 'Grade 12 - Section A', display_order: 19, academic_year: '2024-25', capacity: 25, room_number: 'D-101', created_at: '2025-04-01T00:00:00Z', updated_at: '2025-04-01T00:00:00Z', status: 'active' as const },
  { id: 'class-kga-12b', institution_id: 'inst-kga-001', class_name: 'Grade 12 - Section B', display_order: 20, academic_year: '2024-25', capacity: 25, room_number: 'D-102', created_at: '2025-04-01T00:00:00Z', updated_at: '2025-04-01T00:00:00Z', status: 'active' as const },
  { id: 'class-kga-12c', institution_id: 'inst-kga-001', class_name: 'Grade 12 - Section C', display_order: 21, academic_year: '2024-25', capacity: 25, room_number: 'D-103', created_at: '2025-04-01T00:00:00Z', updated_at: '2025-04-01T00:00:00Z', status: 'active' as const },
];

// localStorage functions
export function loadClasses(): InstitutionClass[] {
  try {
    const stored = localStorage.getItem(CLASSES_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading classes:', error);
  }
  // Initialize with mock data if not in localStorage
  saveClasses(initialMockInstitutionClasses);
  return initialMockInstitutionClasses;
}

export function saveClasses(classes: InstitutionClass[]): void {
  try {
    localStorage.setItem(CLASSES_STORAGE_KEY, JSON.stringify(classes));
  } catch (error) {
    console.error('Error saving classes:', error);
  }
}

export function addClass(institutionClass: InstitutionClass): void {
  const classes = loadClasses();
  classes.push(institutionClass);
  saveClasses(classes);
}

export function updateClass(classId: string, updates: Partial<InstitutionClass>): void {
  const classes = loadClasses();
  const index = classes.findIndex(c => c.id === classId);
  if (index !== -1) {
    classes[index] = { ...classes[index], ...updates, updated_at: new Date().toISOString() };
    saveClasses(classes);
  }
}

export function deleteClass(classId: string): void {
  const classes = loadClasses();
  const filtered = classes.filter(c => c.id !== classId);
  saveClasses(filtered);
}

export function getClassesByInstitution(institutionId: string): InstitutionClass[] {
  const classes = loadClasses();
  return classes
    .filter(c => c.institution_id === institutionId && c.status === 'active')
    .sort((a, b) => a.display_order - b.display_order);
}

export function getClassById(classId: string): InstitutionClass | undefined {
  const classes = loadClasses();
  return classes.find(c => c.id === classId);
}

// Legacy export for backward compatibility
export const mockInstitutionClasses = initialMockInstitutionClasses;
