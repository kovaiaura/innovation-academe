import { OfficerAssignment } from '@/types/institution';

export const mockInstitutionOfficers: Record<string, OfficerAssignment[]> = {
  'inst-msd-001': [
    {
      officer_id: 'off-msd-001',
      officer_name: 'Mr. Atif Ansari',
      employee_id: 'EMP-MSD-IOF-001',
      email: 'atif.ansari@modernschool.edu.in',
      phone: '+91-9876543210',
      avatar: undefined,
      assigned_date: '2025-04-01T00:00:00Z',
      total_courses: 4,
      total_teaching_hours: 28,
      status: 'active'
    }
  ],
  'inst-kga-001': [
    {
      officer_id: 'off-kga-001',
      officer_name: 'Mr. Saran T',
      employee_id: 'EMP-KGA-IOF-001',
      email: 'saran.t@kikaniacademy.com',
      phone: '+91-9876543211',
      avatar: undefined,
      assigned_date: '2024-06-01T00:00:00Z',
      total_courses: 5,
      total_teaching_hours: 35,
      status: 'active'
    },
    {
      officer_id: 'off-kga-002',
      officer_name: 'Mr. Sreeram R',
      employee_id: 'EMP-KGA-IOF-002',
      email: 'sreeram.r@kikaniacademy.com',
      phone: '+91-9876543212',
      avatar: undefined,
      assigned_date: '2025-01-15T00:00:00Z',
      total_courses: 3,
      total_teaching_hours: 21,
      status: 'active'
    }
  ]
};

// All officers for assignment selection
export const mockAllOfficers: OfficerAssignment[] = [
  {
    officer_id: 'off-msd-001',
    officer_name: 'Mr. Atif Ansari',
    employee_id: 'EMP-MSD-IOF-001',
    email: 'atif.ansari@modernschool.edu.in',
    phone: '+91-9876543210',
    avatar: undefined,
    assigned_date: '2025-04-01T00:00:00Z',
    total_courses: 4,
    total_teaching_hours: 28,
    status: 'active'
  },
  {
    officer_id: 'off-kga-001',
    officer_name: 'Mr. Saran T',
    employee_id: 'EMP-KGA-IOF-001',
    email: 'saran.t@kikaniacademy.com',
    phone: '+91-9876543211',
    avatar: undefined,
    assigned_date: '2024-06-01T00:00:00Z',
    total_courses: 5,
    total_teaching_hours: 35,
    status: 'active'
  },
  {
    officer_id: 'off-kga-002',
    officer_name: 'Mr. Sreeram R',
    employee_id: 'EMP-KGA-IOF-002',
    email: 'sreeram.r@kikaniacademy.com',
    phone: '+91-9876543212',
    avatar: undefined,
    assigned_date: '2025-01-15T00:00:00Z',
    total_courses: 3,
    total_teaching_hours: 21,
    status: 'active'
  }
];

export const getInstitutionOfficers = (institutionId: string): OfficerAssignment[] => {
  return mockInstitutionOfficers[institutionId] || [];
};

export const getAvailableOfficers = (institutionId: string): OfficerAssignment[] => {
  const assigned = getInstitutionOfficers(institutionId);
  const assignedIds = assigned.map(o => o.officer_id);
  return mockAllOfficers.filter(o => !assignedIds.includes(o.officer_id));
};
