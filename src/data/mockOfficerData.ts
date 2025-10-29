import { OfficerDetails } from '@/services/systemadmin.service';

export const mockOfficerProfiles: OfficerDetails[] = [
  {
    id: 'off-001',
    name: 'Dr. Rajesh Kumar',
    email: 'rajesh.kumar@springfield.edu',
    phone: '+91-9876543210',
    assigned_institutions: ['springfield'],
    employment_type: 'full_time',
    salary: 75000,
    join_date: '2023-06-15',
    status: 'active',
    date_of_birth: '1985-03-20',
    address: 'Flat 301, Tech Park Apartments, Springfield',
    employee_id: 'EMP-IOF-001',
    department: 'Innovation & Research',
    
    qualifications: [
      'Ph.D. in Computer Science - IIT Delhi',
      'M.Tech in Artificial Intelligence - IIT Mumbai',
      'B.Tech in Computer Engineering - NIT Trichy'
    ],
    certifications: [
      'Certified Innovation Manager (CIM)',
      'AWS Solutions Architect Professional',
      'Scrum Master Certification'
    ],
    skills: [
      'STEM Education',
      'Robotics & Automation',
      'IoT Implementation',
      'AI/ML Implementation',
      'Innovation Coaching',
      'Mentorship & Training'
    ],
    profile_photo_url: '/placeholder.svg',
  },
  {
    id: '3',
    name: 'Innovation Officer',
    email: 'officer@college.edu',
    phone: '+91-9876543211',
    assigned_institutions: ['springfield'],
    employment_type: 'full_time',
    salary: 70000,
    join_date: '2023-08-01',
    status: 'active',
    date_of_birth: '1988-07-15',
    address: 'Springfield College Campus',
    employee_id: 'EMP-IOF-003',
    department: 'Innovation & Research',
    
    qualifications: [
      'M.Tech in Electronics Engineering - Anna University',
      'B.E. in Electronics & Communication - PSG Tech'
    ],
    certifications: [
      'Innovation Leadership Certification',
      'Design Thinking Facilitator',
      'Google Cloud Professional'
    ],
    skills: [
      'STEM Education',
      'Electronics Projects',
      'Embedded Systems',
      'Robotics',
      'Maker Space Management',
      'Student Mentorship'
    ],
    profile_photo_url: '/placeholder.svg',
  },
  {
    id: 'off-002',
    name: 'Prof. Anita Sharma',
    email: 'anita.sharma@ryan.edu',
    phone: '+91-9876543212',
    assigned_institutions: ['ryan'],
    employment_type: 'full_time',
    salary: 72000,
    join_date: '2023-09-10',
    status: 'active',
    date_of_birth: '1987-11-08',
    address: 'House 45, Green Valley, Ryan District',
    employee_id: 'EMP-IOF-002',
    department: 'Innovation & Research',
    
    qualifications: [
      'Ph.D. in Mechanical Engineering - IISc Bangalore',
      'M.E. in Robotics - BITS Pilani',
      'B.E. in Mechanical Engineering - NIT Warangal'
    ],
    certifications: [
      'Certified Innovation Manager',
      'Six Sigma Black Belt',
      'PMP Certification'
    ],
    skills: [
      'Automation',
      'Product Design',
      'Team Leadership',
      'Technology Integration'
    ],
    profile_photo_url: '/placeholder.svg',
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
