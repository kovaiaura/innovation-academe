import { OfficerAssignment } from '@/types/institution';

export const mockInstitutionOfficers: Record<string, OfficerAssignment[]> = {
  '1': [
    {
      officer_id: 'officer-1',
      officer_name: 'Dr. Sarah Johnson',
      employee_id: 'EMP001',
      email: 'sarah.johnson@springfield.edu',
      phone: '+1 234-567-8901',
      avatar: undefined,
      assigned_date: '2024-01-15T00:00:00Z',
      total_courses: 3,
      total_teaching_hours: 18,
      status: 'active'
    },
    {
      officer_id: 'officer-2',
      officer_name: 'Prof. Michael Chen',
      employee_id: 'EMP002',
      email: 'michael.chen@springfield.edu',
      phone: '+1 234-567-8902',
      avatar: undefined,
      assigned_date: '2024-01-20T00:00:00Z',
      total_courses: 2,
      total_teaching_hours: 12,
      status: 'active'
    },
    {
      officer_id: 'officer-3',
      officer_name: 'Dr. Emily Rodriguez',
      employee_id: 'EMP003',
      email: 'emily.rodriguez@springfield.edu',
      phone: '+1 234-567-8903',
      avatar: undefined,
      assigned_date: '2024-02-01T00:00:00Z',
      total_courses: 4,
      total_teaching_hours: 24,
      status: 'active'
    }
  ],
  '2': [
    {
      officer_id: 'officer-4',
      officer_name: 'Mr. David Kumar',
      employee_id: 'EMP004',
      email: 'david.kumar@riverside.edu',
      phone: '+1 234-567-8904',
      avatar: undefined,
      assigned_date: '2024-01-10T00:00:00Z',
      total_courses: 2,
      total_teaching_hours: 14,
      status: 'active'
    },
    {
      officer_id: 'officer-5',
      officer_name: 'Ms. Lisa Anderson',
      employee_id: 'EMP005',
      email: 'lisa.anderson@riverside.edu',
      phone: '+1 234-567-8905',
      avatar: undefined,
      assigned_date: '2024-02-15T00:00:00Z',
      total_courses: 3,
      total_teaching_hours: 16,
      status: 'active'
    }
  ]
};

// All officers for assignment selection
export const mockAllOfficers: OfficerAssignment[] = [
  {
    officer_id: 'officer-1',
    officer_name: 'Dr. Sarah Johnson',
    employee_id: 'EMP001',
    email: 'sarah.johnson@springfield.edu',
    phone: '+1 234-567-8901',
    avatar: undefined,
    assigned_date: '2024-01-15T00:00:00Z',
    total_courses: 3,
    total_teaching_hours: 18,
    status: 'active'
  },
  {
    officer_id: 'officer-2',
    officer_name: 'Prof. Michael Chen',
    employee_id: 'EMP002',
    email: 'michael.chen@springfield.edu',
    phone: '+1 234-567-8902',
    avatar: undefined,
    assigned_date: '2024-01-20T00:00:00Z',
    total_courses: 2,
    total_teaching_hours: 12,
    status: 'active'
  },
  {
    officer_id: 'officer-3',
    officer_name: 'Dr. Emily Rodriguez',
    employee_id: 'EMP003',
    email: 'emily.rodriguez@springfield.edu',
    phone: '+1 234-567-8903',
    avatar: undefined,
    assigned_date: '2024-02-01T00:00:00Z',
    total_courses: 4,
    total_teaching_hours: 24,
    status: 'active'
  },
  {
    officer_id: 'officer-4',
    officer_name: 'Mr. David Kumar',
    employee_id: 'EMP004',
    email: 'david.kumar@riverside.edu',
    phone: '+1 234-567-8904',
    avatar: undefined,
    assigned_date: '2024-01-10T00:00:00Z',
    total_courses: 2,
    total_teaching_hours: 14,
    status: 'active'
  },
  {
    officer_id: 'officer-5',
    officer_name: 'Ms. Lisa Anderson',
    employee_id: 'EMP005',
    email: 'lisa.anderson@riverside.edu',
    phone: '+1 234-567-8905',
    avatar: undefined,
    assigned_date: '2024-02-15T00:00:00Z',
    total_courses: 3,
    total_teaching_hours: 16,
    status: 'active'
  },
  {
    officer_id: 'officer-6',
    officer_name: 'Dr. Robert Williams',
    employee_id: 'EMP006',
    email: 'robert.williams@tech.edu',
    phone: '+1 234-567-8906',
    avatar: undefined,
    assigned_date: '2024-03-01T00:00:00Z',
    total_courses: 2,
    total_teaching_hours: 10,
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
