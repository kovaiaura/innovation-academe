export interface InstitutionDetails {
  id: string;
  name: string;
  code: string;
  slug: string;
  type: 'school' | 'college' | 'university';
  established_year: string;
  location: string;
  address: string;
  contact_email: string;
  contact_phone: string;
  total_students: number;
  total_faculty: number;
  total_departments: number;
  academic_year: string;
  status: 'active' | 'inactive';
  logo_url?: string;
  assigned_officers: {
    officer_id: string;
    officer_name: string;
  }[];
}

export const mockInstitutions: Record<string, InstitutionDetails> = {
  'inst-msd-001': {
    id: 'inst-msd-001',
    name: 'Modern School Vasant Vihar',
    code: 'MSD',
    slug: 'modern-school-vasant-vihar',
    type: 'school',
    established_year: '1920',
    location: 'New Delhi, India',
    address: 'Vasant Vihar, New Delhi - 110057',
    contact_email: 'info@modernschool.edu.in',
    contact_phone: '+91-11-26140379',
    total_students: 350,
    total_faculty: 1,
    total_departments: 5,
    academic_year: '2024-25 (Semester 2)',
    status: 'active',
    assigned_officers: [
      {
        officer_id: 'off-msd-001',
        officer_name: 'Mr. Atif Ansari'
      }
    ]
  },
  'inst-kga-001': {
    id: 'inst-kga-001',
    name: 'Kikani Global Academy',
    code: 'KGA',
    slug: 'kikani-global-academy',
    type: 'school',
    established_year: '2010',
    location: 'Coimbatore, India',
    address: 'Pachapalayam, Coimbatore - 641037',
    contact_email: 'info@kikaniacademy.com',
    contact_phone: '+91-422-2234567',
    total_students: 520,
    total_faculty: 2,
    total_departments: 7,
    academic_year: '2024-25 (Semester 2)',
    status: 'active',
    assigned_officers: [
      {
        officer_id: 'off-kga-001',
        officer_name: 'Mr. Saran T'
      },
      {
        officer_id: 'off-kga-002',
        officer_name: 'Mr. Sreeram R'
      }
    ]
  }
};

export const getInstitutionBySlug = (slug: string): InstitutionDetails | undefined => {
  return Object.values(mockInstitutions).find(inst => inst.slug === slug);
};

export const getInstitutionById = (id: string): InstitutionDetails | undefined => {
  return mockInstitutions[id];
};
