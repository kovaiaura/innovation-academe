export interface SchoolTeacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  subjects: string[];
  classes_taught: string[];
  experience_years: number;
  qualification: string;
  employee_id: string;
  joining_date: string;
  status: 'active' | 'on_leave' | 'inactive';
  total_students: number;
  average_attendance: number;
  last_active: string;
}

export type TeacherStatus = 'active' | 'on_leave' | 'inactive';

export const SCHOOL_SUBJECTS = [
  'Mathematics',
  'Science',
  'English',
  'Hindi',
  'Social Studies',
  'Computer Science',
  'Physical Education',
  'Arts & Crafts',
  'Sanskrit',
  'Music',
] as const;

export const CLASS_LEVELS = {
  PRIMARY: 'Primary (1-5)',
  MIDDLE: 'Middle (6-8)',
  SECONDARY: 'Secondary (9-10)',
  SENIOR_SECONDARY: 'Senior Secondary (11-12)',
} as const;
