export interface MonthlyInvoice {
  invoice_id: string;
  month: string;
  year: string;
  institution_id: string;
  institution_name: string;
  institution_location: string;
  
  trainers: {
    name: string;
    designation: string;
    attendance_percentage: number;
  }[];
  
  hours_handled: number;
  portion_covered_percentage: number;
  assessments_completed: number;
  assessment_results: string;
  
  activities: {
    activity: string;
    remarks: string;
  }[];
  
  signed_by: string;
  signed_name: string;
  generation_date: string;
}

// Based on actual PDF templates provided
export const mockInvoices: MonthlyInvoice[] = [
  {
    invoice_id: 'INV-MSD-AUG25',
    month: 'August',
    year: '2025',
    institution_id: 'inst-msd-001',
    institution_name: 'Modern School Vasant Vihar',
    institution_location: 'New Delhi, India',
    trainers: [
      { name: 'Mr. Atif Ansari', designation: 'Innovation Officer', attendance_percentage: 95 }
    ],
    hours_handled: 62,
    portion_covered_percentage: 13,
    assessments_completed: 0,
    assessment_results: 'Postponed to 11th of September due to exams',
    activities: [
      { activity: 'Eureka Junior', remarks: '2 Students selected for Phase 2' },
      { activity: 'Inspire 2025', remarks: '5 Students Registered' }
    ],
    signed_by: 'AGM – Metasage Academy',
    signed_name: 'Mr. Vasanthaseelan',
    generation_date: '2025-08-30'
  },
  {
    invoice_id: 'INV-KGA-AUG25',
    month: 'August',
    year: '2025',
    institution_id: 'inst-kga-001',
    institution_name: 'Kikani Global Academy',
    institution_location: 'Pachapalayam, Coimbatore',
    trainers: [
      { name: 'Mr. Saran T', designation: 'Sr. Innovation Officer', attendance_percentage: 100 },
      { name: 'Mr. Sreeram R', designation: 'Innovation Officer', attendance_percentage: 100 }
    ],
    hours_handled: 63,
    portion_covered_percentage: 14,
    assessments_completed: 2,
    assessment_results: 'Yet to be evaluated',
    activities: [
      { activity: 'Ignitia 2025 (Sahodaya)', remarks: '2 Teams Secured 3rd Place' },
      { activity: 'Eureka Junior', remarks: '21 Students selected for Phase 2' },
      { activity: 'Inspire 2025', remarks: 'Idea selection ongoing' },
      { activity: 'Guest Session on "Mastering Entrepreneurial Mindset"', remarks: '30+ Students Attended' }
    ],
    signed_by: 'AGM – Metasage Academy',
    signed_name: 'Mr. Vasanthaseelan',
    generation_date: '2025-08-30'
  },
  {
    invoice_id: 'INV-MSD-SEP25',
    month: 'September',
    year: '2025',
    institution_id: 'inst-msd-001',
    institution_name: 'Modern School Vasant Vihar',
    institution_location: 'New Delhi, India',
    trainers: [
      { name: 'Mr. Atif Ansari', designation: 'Innovation Officer', attendance_percentage: 100 }
    ],
    hours_handled: 68,
    portion_covered_percentage: 27,
    assessments_completed: 1,
    assessment_results: 'Assessment completed with average score of 78%',
    activities: [
      { activity: 'Science Fair Preparation', remarks: '12 Students participated in district level' },
      { activity: 'Coding Bootcamp', remarks: 'Introduction to Python - 25 students enrolled' }
    ],
    signed_by: 'AGM – Metasage Academy',
    signed_name: 'Mr. Vasanthaseelan',
    generation_date: '2025-09-30'
  },
  {
    invoice_id: 'INV-KGA-SEP25',
    month: 'September',
    year: '2025',
    institution_id: 'inst-kga-001',
    institution_name: 'Kikani Global Academy',
    institution_location: 'Pachapalayam, Coimbatore',
    trainers: [
      { name: 'Mr. Saran T', designation: 'Sr. Innovation Officer', attendance_percentage: 95 },
      { name: 'Mr. Sreeram R', designation: 'Innovation Officer', attendance_percentage: 100 }
    ],
    hours_handled: 70,
    portion_covered_percentage: 28,
    assessments_completed: 3,
    assessment_results: 'All assessments evaluated - Average score 82%',
    activities: [
      { activity: 'Robotics Workshop', remarks: '35 Students completed basic robotics training' },
      { activity: 'Innovation Challenge', remarks: '8 Projects submitted, 3 selected for state level' },
      { activity: 'Industry Visit - Tech Park', remarks: '42 Students attended' }
    ],
    signed_by: 'AGM – Metasage Academy',
    signed_name: 'Mr. Vasanthaseelan',
    generation_date: '2025-09-30'
  }
];

export const getInvoicesByInstitution = (institutionId: string): MonthlyInvoice[] => {
  return mockInvoices.filter(invoice => invoice.institution_id === institutionId);
};

export const getInvoiceByMonthYear = (institutionId: string, month: string, year: string): MonthlyInvoice | undefined => {
  return mockInvoices.find(
    invoice => 
      invoice.institution_id === institutionId && 
      invoice.month === month && 
      invoice.year === year
  );
};
