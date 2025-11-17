import { OfficerDetails } from '@/services/systemadmin.service';

export const mockOfficerProfiles: OfficerDetails[] = [
  {
    id: 'off-msd-001',
    name: 'Mr. Atif Ansari',
    email: 'atif.ansari@modernschool.edu.in',
    phone: '+91-9876543210',
    assigned_institutions: ['inst-msd-001'],
    employment_type: 'full_time',
    salary: 55000,
    join_date: '2025-04-01',
    status: 'active',
    date_of_birth: '1990-05-15',
    address: 'South Extension, New Delhi',
    employee_id: 'EMP-MSD-IOF-001',
    department: 'Innovation & STEM Education',
    
    qualifications: [
      'M.Tech in Electronics & Communication',
      'B.E. in Electronics Engineering'
    ],
    certifications: [
      'ATL Trainer Certification',
      'Innovation Leadership Program',
      'Design Thinking Facilitator'
    ],
    skills: [
      'STEM Education',
      'Robotics & Automation',
      'Atal Tinkering Lab Management',
      'Project Mentorship',
      'Innovation Coaching'
    ],
    profile_photo_url: '/placeholder.svg',
    hourly_rate: 343.75,
    overtime_rate_multiplier: 1.5,
    normal_working_hours: 7,
  },
  {
    id: 'off-kga-001',
    name: 'Mr. Saran T',
    email: 'saran.t@kikaniacademy.com',
    phone: '+91-9876543211',
    assigned_institutions: ['inst-kga-001'],
    employment_type: 'full_time',
    salary: 65000,
    join_date: '2024-06-01',
    status: 'active',
    date_of_birth: '1988-08-22',
    address: 'RS Puram, Coimbatore',
    employee_id: 'EMP-KGA-IOF-001',
    department: 'Innovation & STEM Education',
    
    qualifications: [
      'Ph.D. in Mechanical Engineering (pursuing)',
      'M.E. in Robotics & Automation',
      'B.E. in Mechanical Engineering'
    ],
    certifications: [
      'Senior Innovation Officer Certification',
      'ATL Master Trainer',
      'Six Sigma Green Belt',
      'Certified Scrum Master'
    ],
    skills: [
      'Advanced Robotics',
      'IoT & Embedded Systems',
      'Team Leadership',
      'Curriculum Development',
      'Student Mentorship',
      'Competition Training'
    ],
    profile_photo_url: '/placeholder.svg',
    hourly_rate: 406.25,
    overtime_rate_multiplier: 1.5,
    normal_working_hours: 7,
  },
  {
    id: 'off-kga-002',
    name: 'Mr. Sreeram R',
    email: 'sreeram.r@kikaniacademy.com',
    phone: '+91-9876543212',
    assigned_institutions: ['inst-kga-001'],
    employment_type: 'full_time',
    salary: 48000,
    join_date: '2025-01-15',
    status: 'active',
    date_of_birth: '1992-11-10',
    address: 'Peelamedu, Coimbatore',
    employee_id: 'EMP-KGA-IOF-002',
    department: 'Innovation & STEM Education',
    
    qualifications: [
      'M.Tech in Computer Science',
      'B.Tech in Information Technology'
    ],
    certifications: [
      'Innovation Officer Certification',
      'ATL Trainer Certification',
      'Python Programming Professional'
    ],
    skills: [
      'AI/ML for Education',
      'Electronics Projects',
      'Programming & Coding',
      'Maker Space Management',
      'Student Mentorship'
    ],
    profile_photo_url: '/placeholder.svg',
    hourly_rate: 300,
    overtime_rate_multiplier: 1.5,
    normal_working_hours: 7,
  }
];

// Helper functions to get officer data
export const getOfficerByEmail = (email: string): OfficerDetails | undefined => {
  return mockOfficerProfiles.find(officer => officer.email === email);
};

export const getOfficerById = (id: string): OfficerDetails | undefined => {
  return mockOfficerProfiles.find(officer => officer.id === id);
};

export const getOfficerByTenant = (tenantSlug: string): OfficerDetails | undefined => {
  return mockOfficerProfiles.find(officer => 
    officer.assigned_institutions.includes(tenantSlug)
  );
};
