export interface ProjectMember {
  id: string;
  name: string;
  role: 'leader' | 'member';
}

export interface ProgressUpdate {
  date: string;
  notes: string;
  updated_by: string;
  files?: string[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  
  // Team Information
  team_members: ProjectMember[];
  
  // Officer Information (preserved even if account deleted)
  created_by_officer_id: string;
  created_by_officer_name: string; // Stored as text for persistence
  
  // Institution
  institution_id: string;
  class: string;
  
  // Event Assignment
  event_id?: string; // Event this project is assigned to participate in
  event_title?: string; // Title of the assigned event (stored for persistence)
  
  // Project Lifecycle
  status: 'proposal' | 'approved' | 'in_progress' | 'completed' | 'rejected';
  progress: number; // 0-100
  start_date: string;
  completion_date?: string;
  
  // Funding
  funding_required?: number;
  funding_approved?: number;
  
  // SDG Goals
  sdg_goals: number[];
  
  // Progress Tracking
  last_updated: string;
  progress_updates: ProgressUpdate[];
  
  // Gallery/Awards (for showcase)
  is_showcase: boolean; // If true, appears in gallery
  achievements?: string[];
  awards?: string[];
  showcase_image?: string;
}

export const mockProjects: Record<string, Project[]> = {
  'springfield': [
    {
      id: '1',
      title: 'IoT-Based Smart Home Automation',
      description: 'Complete home automation system using IoT sensors and cloud connectivity',
      category: 'IoT',
      team_members: [
        { id: 'springfield-8-A-001', name: 'Aarav Sharma', role: 'leader' },
        { id: '2', name: 'John Student', role: 'member' },
        { id: 'springfield-8-A-002', name: 'Vivaan Verma', role: 'member' },
        { id: 'springfield-8-A-003', name: 'Aditya Gupta', role: 'member' }
      ],
      created_by_officer_id: 'off1',
      created_by_officer_name: 'Dr. Rajesh Kumar',
      institution_id: 'springfield',
      class: '3rd Year CSE - Section A',
      event_id: 'evt-004',
      event_title: 'Innovation Exhibition 2025',
      status: 'in_progress',
      progress: 65,
      start_date: '2024-01-15',
      funding_required: 15000,
      funding_approved: 15000,
      sdg_goals: [7, 11],
      last_updated: '2024-03-20',
      progress_updates: [
        {
          date: '2024-03-20',
          notes: 'Completed sensor integration module. All ESP32 modules are now communicating with the central hub.',
          updated_by: 'Dr. Rajesh Kumar',
          files: ['sensor_report.pdf']
        },
        {
          date: '2024-02-15',
          notes: 'Initial prototype testing completed. Basic home automation features working.',
          updated_by: 'Dr. Rajesh Kumar'
        }
      ],
      is_showcase: false
    },
    {
      id: '2',
      title: 'AI-Powered Agriculture Monitoring',
      description: 'Machine learning system for crop health monitoring and irrigation optimization',
      category: 'AI/ML',
      team_members: [
        { id: '2', name: 'John Student', role: 'leader' },
        { id: 'springfield-10-B-001', name: 'Aadhya Reddy', role: 'member' },
        { id: 'springfield-10-B-002', name: 'Ananya Nair', role: 'member' }
      ],
      created_by_officer_id: 'off1',
      created_by_officer_name: 'Dr. Rajesh Kumar',
      institution_id: 'springfield',
      class: '4th Year CSE - Section B',
      event_id: 'evt-002',
      event_title: 'Science Fair - Springfield High 2025',
      status: 'completed',
      progress: 100,
      start_date: '2023-08-01',
      completion_date: '2024-01-15',
      funding_required: 25000,
      funding_approved: 25000,
      sdg_goals: [2, 12, 13],
      last_updated: '2024-01-15',
      progress_updates: [
        {
          date: '2024-01-15',
          notes: 'Project completed successfully. Final presentation received excellent feedback.',
          updated_by: 'Dr. Rajesh Kumar'
        },
        {
          date: '2023-12-10',
          notes: 'Field testing completed with 95% accuracy in disease detection.',
          updated_by: 'Dr. Rajesh Kumar'
        }
      ],
      is_showcase: true,
      achievements: [
        'National Innovation Award 2024',
        'Best AI Project - State Level',
        'Published paper in IJAER journal'
      ],
      awards: ['Gold Medal - Smart India Hackathon'],
      showcase_image: '/placeholder.svg'
    },
    {
      id: '3',
      title: 'Blockchain-Based Supply Chain',
      description: 'Transparent supply chain management using blockchain technology',
      category: 'Blockchain',
      team_members: [
        { id: 'springfield-9-C-001', name: 'Arjun Singh', role: 'leader' },
        { id: 'springfield-9-C-002', name: 'Sai Patel', role: 'member' },
        { id: 'springfield-9-C-003', name: 'Reyansh Gupta', role: 'member' },
        { id: 'springfield-9-C-004', name: 'Krishna Kumar', role: 'member' }
      ],
      created_by_officer_id: 'off1',
      created_by_officer_name: 'Dr. Rajesh Kumar',
      institution_id: 'springfield',
      class: '3rd Year CSE - Section C',
      status: 'proposal',
      progress: 0,
      start_date: '2024-04-01',
      funding_required: 30000,
      sdg_goals: [9, 12],
      last_updated: '2024-03-25',
      progress_updates: [],
      is_showcase: false
    },
    {
      id: '4',
      title: 'Solar-Powered Water Purification',
      description: 'Low-cost water purification system powered by solar energy for rural areas',
      category: 'Renewable Energy',
      team_members: [
        { id: 'springfield-11-A-001', name: 'Diya Sharma', role: 'leader' },
        { id: '2', name: 'John Student', role: 'member' },
        { id: 'springfield-11-A-002', name: 'Isha Verma', role: 'member' }
      ],
      created_by_officer_id: 'off1',
      created_by_officer_name: 'Dr. Rajesh Kumar',
      institution_id: 'springfield',
      class: '2nd Year Mechanical - Section A',
      event_id: 'evt-004',
      event_title: 'Innovation Exhibition 2025',
      status: 'in_progress',
      progress: 40,
      start_date: '2024-02-01',
      funding_required: 20000,
      funding_approved: 20000,
      sdg_goals: [6, 7, 11],
      last_updated: '2024-03-18',
      progress_updates: [
        {
          date: '2024-03-18',
          notes: 'Solar panel installation completed. Now working on filtration module.',
          updated_by: 'Dr. Rajesh Kumar'
        }
      ],
      is_showcase: false
    }
  ]
};

// Helper Functions
export const getProjectsByInstitution = (institutionId: string): Project[] => {
  return mockProjects[institutionId] || [];
};

export const getProjectsByOfficer = (officerId: string): Project[] => {
  return Object.values(mockProjects)
    .flat()
    .filter(p => p.created_by_officer_id === officerId);
};

export const getProjectsByStudent = (studentId: string): Project[] => {
  return Object.values(mockProjects)
    .flat()
    .filter(p => p.team_members.some(member => member.id === studentId));
};

export const getShowcaseProjects = (institutionId: string): Project[] => {
  return (mockProjects[institutionId] || [])
    .filter(p => p.is_showcase && p.status === 'completed');
};

export const updateProject = (institutionId: string, projectId: string, updates: Partial<Project>) => {
  const projects = mockProjects[institutionId];
  if (!projects) return;
  
  const index = projects.findIndex(p => p.id === projectId);
  if (index !== -1) {
    projects[index] = { 
      ...projects[index], 
      ...updates,
      last_updated: new Date().toISOString().split('T')[0]
    };
  }
};

export const addProject = (institutionId: string, project: Project) => {
  if (!mockProjects[institutionId]) {
    mockProjects[institutionId] = [];
  }
  mockProjects[institutionId].push(project);
};

export const deleteProject = (institutionId: string, projectId: string) => {
  const projects = mockProjects[institutionId];
  if (!projects) return;
  
  const index = projects.findIndex(p => p.id === projectId);
  if (index !== -1) {
    projects.splice(index, 1);
  }
};

export const addProgressUpdate = (
  institutionId: string, 
  projectId: string, 
  update: ProgressUpdate
) => {
  const projects = mockProjects[institutionId];
  if (!projects) return;
  
  const project = projects.find(p => p.id === projectId);
  if (project) {
    project.progress_updates.push(update);
    project.last_updated = update.date;
  }
};

// Get all projects across all institutions with institution ID
export const getAllProjects = (): Array<Project & { institutionId: string }> => {
  return Object.entries(mockProjects).flatMap(([institutionId, projects]) =>
    projects.map(p => ({ ...p, institutionId }))
  );
};

// Get projects by multiple institutions
export const getProjectsByInstitutions = (institutionIds: string[]): Project[] => {
  return institutionIds.flatMap(id => mockProjects[id] || []);
};

// Get project statistics across all institutions
export const getProjectStatistics = () => {
  const allProjects = getAllProjects();
  return {
    total: allProjects.length,
    byStatus: {
      proposal: allProjects.filter(p => p.status === 'proposal').length,
      approved: allProjects.filter(p => p.status === 'approved').length,
      in_progress: allProjects.filter(p => p.status === 'in_progress').length,
      completed: allProjects.filter(p => p.status === 'completed').length,
      rejected: allProjects.filter(p => p.status === 'rejected').length,
    },
    totalStudents: allProjects.reduce((sum, p) => sum + p.team_members.length, 0),
    uniqueOfficers: new Set(allProjects.map(p => p.created_by_officer_id)).size,
    showcaseCount: allProjects.filter(p => p.is_showcase).length,
    avgProgress: allProjects.length > 0 
      ? Math.round(allProjects.reduce((sum, p) => sum + p.progress, 0) / allProjects.length)
      : 0,
  };
};
