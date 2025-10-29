import { Student } from '@/types/student';

const firstNames = [
  'Aarav', 'Vivaan', 'Aditya', 'Arjun', 'Sai', 'Reyansh', 'Krishna', 'Ishaan', 'Shaurya', 'Atharv',
  'Aadhya', 'Ananya', 'Diya', 'Isha', 'Kavya', 'Saanvi', 'Sara', 'Avni', 'Myra', 'Kiara',
  'Rohan', 'Ayaan', 'Ved', 'Kabir', 'Arnav', 'Vihaan', 'Advaith', 'Rudra', 'Pranav', 'Dhruv',
  'Aanya', 'Pari', 'Mira', 'Riya', 'Navya', 'Prisha', 'Zara', 'Ahana', 'Anvi', 'Tara'
];

const lastNames = [
  'Sharma', 'Verma', 'Gupta', 'Kumar', 'Singh', 'Patel', 'Reddy', 'Nair', 'Iyer', 'Rao',
  'Mehta', 'Shah', 'Joshi', 'Agarwal', 'Malhotra', 'Kapoor', 'Chopra', 'Bansal', 'Sinha', 'Bhatia'
];

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

const generateStudent = (
  index: number,
  institutionId: string,
  classNum: number,
  section: string
): Student => {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const studentName = `${firstName} ${lastName}`;
  const rollNum = String(index).padStart(3, '0');
  const gender: 'male' | 'female' = Math.random() > 0.5 ? 'male' : 'female';
  
  const statusRand = Math.random();
  let status: 'active' | 'inactive' | 'transferred' | 'graduated';
  if (statusRand > 0.95) status = 'transferred';
  else if (statusRand > 0.90) status = 'inactive';
  else status = 'active';

  const yearOffset = Math.floor(Math.random() * 5);
  const admissionYear = 2024 - yearOffset;
  
  return {
    id: `${institutionId}-${classNum}-${section}-${rollNum}`,
    student_name: studentName,
    roll_number: `${classNum}-${section}-${rollNum}`,
    admission_number: `ADM-${admissionYear}-${institutionId}-${rollNum}`,
    class: `Class ${classNum}`,
    section: section,
    admission_date: `${admissionYear}-04-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
    date_of_birth: `${2024 - classNum - 5}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
    gender: gender,
    status: status,
    parent_name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastName}`,
    parent_phone: `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    parent_email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
    address: `${Math.floor(Math.random() * 999) + 1}, Sector ${Math.floor(Math.random() * 50) + 1}, Delhi`,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${studentName}`,
    institution_id: institutionId,
    blood_group: bloodGroups[Math.floor(Math.random() * bloodGroups.length)],
    previous_school: Math.random() > 0.7 ? 'Previous School Name' : undefined,
    created_at: `${admissionYear}-04-01T00:00:00Z`
  };
};

const generateStudentsForInstitution = (institutionId: string): Student[] => {
  const students: Student[] = [];
  
  // Generate students for classes 1-12
  for (let classNum = 1; classNum <= 12; classNum++) {
    const sections = classNum <= 5 ? ['A', 'B'] : ['A', 'B', 'C'];
    
    sections.forEach(section => {
      const studentsPerSection = Math.floor(Math.random() * 15) + 30; // 30-45 students per section
      
      for (let i = 1; i <= studentsPerSection; i++) {
        students.push(generateStudent(i, institutionId, classNum, section));
      }
    });
  }
  
  return students;
};

// Generate students for all 3 institutions using tenant slugs
export const mockStudents: Student[] = [
  ...generateStudentsForInstitution('springfield'), // Springfield Elementary
  ...generateStudentsForInstitution('ryan'), // Ryan International
  ...generateStudentsForInstitution('innovation'), // Innovation Hub
];

// Helper functions
export const getStudentsByInstitution = (institutionId: string): Student[] => {
  return mockStudents.filter(s => s.institution_id === institutionId);
};

export const getStudentsByClass = (institutionId: string, className: string): Student[] => {
  return mockStudents.filter(s => s.institution_id === institutionId && s.class === className);
};

export const getStudentsByClassAndSection = (
  institutionId: string, 
  className: string, 
  section: string
): Student[] => {
  return mockStudents.filter(
    s => s.institution_id === institutionId && s.class === className && s.section === section
  );
};
