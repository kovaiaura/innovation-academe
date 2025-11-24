export interface InstitutionContact {
  id: string;
  institution_id: string;
  institution_name: string;
  
  // Personal Information
  full_name: string;
  designation: string;
  department: string;
  
  // Contact Details
  email: string;
  phone: string;
  mobile?: string;
  whatsapp?: string;
  
  // Status
  is_primary_contact: boolean;
  is_decision_maker: boolean;
  reporting_to?: string;
  
  // Metadata
  date_added: string;
  last_contacted: string;
  total_interactions: number;
  preferred_contact_method: 'email' | 'phone' | 'whatsapp' | 'meeting';
  
  // Social/Professional
  linkedin_url?: string;
  notes?: string;
  tags: string[];
}

export const mockContacts: InstitutionContact[] = [
  // Modern School Vasant Vihar Contacts
  {
    id: 'contact-1',
    institution_id: 'modern-school-vv',
    institution_name: 'Modern School Vasant Vihar',
    full_name: 'Dr. Meera Kapoor',
    designation: 'Principal',
    department: 'Administration',
    email: 'meera.kapoor@modernschool.edu.in',
    phone: '+91-11-2614-3955',
    mobile: '+91-98101-23456',
    whatsapp: '+91-98101-23456',
    is_primary_contact: true,
    is_decision_maker: true,
    date_added: '2023-09-01',
    last_contacted: '2024-11-20',
    total_interactions: 12,
    preferred_contact_method: 'meeting',
    linkedin_url: 'https://linkedin.com/in/meera-kapoor',
    notes: 'Very supportive of EdTech initiatives. Interested in expanding to 2 more branches.',
    tags: ['decision-maker', 'highly-engaged', 'expansion-interest']
  },
  {
    id: 'contact-2',
    institution_id: 'modern-school-vv',
    institution_name: 'Modern School Vasant Vihar',
    full_name: 'Mr. Rajiv Malhotra',
    designation: 'IT Head',
    department: 'Information Technology',
    email: 'rajiv.malhotra@modernschool.edu.in',
    phone: '+91-11-2614-3956',
    mobile: '+91-98765-43210',
    whatsapp: '+91-98765-43210',
    is_primary_contact: false,
    is_decision_maker: false,
    reporting_to: 'contact-1',
    date_added: '2023-09-01',
    last_contacted: '2024-11-15',
    total_interactions: 8,
    preferred_contact_method: 'email',
    linkedin_url: 'https://linkedin.com/in/rajiv-malhotra',
    notes: 'Tech-savvy, handles all technical implementation. Quick responder via email.',
    tags: ['technical', 'responsive', 'implementation-lead']
  },
  {
    id: 'contact-3',
    institution_id: 'modern-school-vv',
    institution_name: 'Modern School Vasant Vihar',
    full_name: 'Ms. Anita Sharma',
    designation: 'Finance Head',
    department: 'Finance & Accounts',
    email: 'anita.sharma@modernschool.edu.in',
    phone: '+91-11-2614-3957',
    mobile: '+91-99999-11111',
    is_primary_contact: false,
    is_decision_maker: true,
    reporting_to: 'contact-1',
    date_added: '2023-09-15',
    last_contacted: '2024-11-10',
    total_interactions: 5,
    preferred_contact_method: 'phone',
    notes: 'Handles all payment approvals. Prefers phone calls for financial discussions.',
    tags: ['budget-approver', 'finance']
  },

  // Kikani Global Academy Contacts
  {
    id: 'contact-4',
    institution_id: 'kga',
    institution_name: 'Kikani Global Academy',
    full_name: 'Amit Desai',
    designation: 'IT Head',
    department: 'Information Technology',
    email: 'amit.desai@kga.edu.in',
    phone: '+91-79-2630-7890',
    mobile: '+91-93270-12345',
    whatsapp: '+91-93270-12345',
    is_primary_contact: true,
    is_decision_maker: false,
    date_added: '2023-03-15',
    last_contacted: '2024-11-18',
    total_interactions: 10,
    preferred_contact_method: 'whatsapp',
    linkedin_url: 'https://linkedin.com/in/amit-desai-kga',
    notes: 'Very hands-on with tech. Prefers WhatsApp for quick queries. Interested in advanced robotics module.',
    tags: ['technical', 'early-adopter', 'robotics-interest']
  },
  {
    id: 'contact-5',
    institution_id: 'kga',
    institution_name: 'Kikani Global Academy',
    full_name: 'Dr. Kavita Shah',
    designation: 'Academic Director',
    department: 'Academics',
    email: 'kavita.shah@kga.edu.in',
    phone: '+91-79-2630-7891',
    mobile: '+91-93270-67890',
    is_primary_contact: false,
    is_decision_maker: true,
    date_added: '2023-03-15',
    last_contacted: '2024-11-05',
    total_interactions: 7,
    preferred_contact_method: 'email',
    linkedin_url: 'https://linkedin.com/in/kavita-shah-phd',
    notes: 'Focuses on academic outcomes. Very data-driven, appreciates analytics reports.',
    tags: ['decision-maker', 'data-driven', 'academic-focus']
  },
  {
    id: 'contact-6',
    institution_id: 'kga',
    institution_name: 'Kikani Global Academy',
    full_name: 'Mr. Ketan Kikani',
    designation: 'Chairman',
    department: 'Management',
    email: 'ketan.kikani@kga.edu.in',
    phone: '+91-79-2630-7892',
    mobile: '+91-98250-11111',
    is_primary_contact: false,
    is_decision_maker: true,
    date_added: '2023-03-15',
    last_contacted: '2024-10-20',
    total_interactions: 3,
    preferred_contact_method: 'meeting',
    notes: 'Top-level decision maker. Involved in major strategic decisions only.',
    tags: ['chairman', 'strategic-decisions', 'high-level']
  },

  // Valley View School Contacts
  {
    id: 'contact-7',
    institution_id: 'valley-view',
    institution_name: 'Valley View School',
    full_name: 'Mr. Suresh Patel',
    designation: 'Director',
    department: 'Management',
    email: 'suresh.patel@valleyview.edu.in',
    phone: '+91-22-2579-3344',
    mobile: '+91-98200-55555',
    is_primary_contact: true,
    is_decision_maker: true,
    date_added: '2024-01-20',
    last_contacted: '2024-11-15',
    total_interactions: 6,
    preferred_contact_method: 'phone',
    notes: 'Concerned about low engagement rates (38%). Contract expires in 60 days - critical situation.',
    tags: ['decision-maker', 'at-risk', 'renewal-critical']
  },
  {
    id: 'contact-8',
    institution_id: 'valley-view',
    institution_name: 'Valley View School',
    full_name: 'Ms. Neha Gupta',
    designation: 'Admin Manager',
    department: 'Administration',
    email: 'neha.gupta@valleyview.edu.in',
    phone: '+91-22-2579-3345',
    mobile: '+91-98200-66666',
    whatsapp: '+91-98200-66666',
    is_primary_contact: false,
    is_decision_maker: false,
    reporting_to: 'contact-7',
    date_added: '2024-01-20',
    last_contacted: '2024-11-12',
    total_interactions: 4,
    preferred_contact_method: 'email',
    notes: 'Handles day-to-day operations. Responsive and helpful with logistics.',
    tags: ['operations', 'responsive', 'helpful']
  },
  {
    id: 'contact-9',
    institution_id: 'valley-view',
    institution_name: 'Valley View School',
    full_name: 'Mr. Prakash Mehta',
    designation: 'IT Coordinator',
    department: 'Information Technology',
    email: 'prakash.mehta@valleyview.edu.in',
    phone: '+91-22-2579-3346',
    mobile: '+91-98200-77777',
    is_primary_contact: false,
    is_decision_maker: false,
    reporting_to: 'contact-8',
    date_added: '2024-02-01',
    last_contacted: '2024-11-08',
    total_interactions: 5,
    preferred_contact_method: 'phone',
    notes: 'Limited tech expertise. May need additional training and support.',
    tags: ['technical', 'needs-support', 'training-required']
  }
];
