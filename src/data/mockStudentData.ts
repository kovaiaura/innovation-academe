import { Student } from '@/types/student';

const firstNames = [
  'Aarav', 'Vivaan', 'Aditya', 'Arjun', 'Sai', 'Krishna', 'Aryan', 'Ishaan', 'Reyansh', 'Ayaan',
  'Aadhya', 'Ananya', 'Diya', 'Saanvi', 'Pari', 'Sara', 'Aaradhya', 'Navya', 'Angel', 'Kiara',
  'Arnav', 'Dhruv', 'Vihaan', 'Shaurya', 'Atharv', 'Rudra', 'Kabir', 'Shivansh', 'Kian', 'Om',
  'Priya', 'Lakshmi', 'Karthik', 'Meera', 'Ravi', 'Sanjay', 'Divya', 'Pooja', 'Rahul', 'Neha',
  'Arun', 'Kavya', 'Harish', 'Sneha', 'Manoj', 'Swathi', 'Vijay', 'Deepa', 'Suresh', 'Ramya'
];

const lastNames = [
  'Sharma', 'Verma', 'Gupta', 'Kumar', 'Singh', 'Patel', 'Reddy', 'Rao', 'Mehta', 'Joshi',
  'Agarwal', 'Desai', 'Nair', 'Kulkarni', 'Iyer', 'Pandey', 'Saxena', 'Bhat', 'Pillai', 'Menon',
  'Malhotra', 'Kapoor', 'Chopra', 'Shetty', 'Krishnan', 'Naidu', 'Chauhan', 'Thakur', 'Bansal', 'Rajan'
];

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const genders: Array<'male' | 'female' | 'other'> = ['male', 'female', 'male', 'female', 'male', 'female', 'other'];

// Generate students for classes
const generateStudentsForClass = (
  institutionId: string,
  institutionCode: string,
  classId: string,
  className: string,
  section: string,
  startIndex: number,
  count: number
): Student[] => {
  const students: Student[] = [];
  const gradeNumber = className.split(' ')[1]; // Extract "6" from "Grade 6"
  
  for (let i = 0; i < count; i++) {
    const index = startIndex + i;
    const firstName = firstNames[index % firstNames.length];
    const lastName = lastNames[index % lastNames.length];
    const gender = genders[index % genders.length];
    
    students.push({
      id: `stu-${institutionId}-${classId}-${i + 1}`,
      student_id: `${institutionCode}-2024-${String(index).padStart(4, '0')}`, // Lifelong student ID
      student_name: `${firstName} ${lastName}`,
      roll_number: `${gradeNumber}${section}${String(i + 1).padStart(3, '0')}`,
      admission_number: `${institutionCode}-ADM-2024-${String(index).padStart(4, '0')}`,
      class: `Grade ${gradeNumber}`,
      section: section,
      class_id: classId,
      institution_id: institutionId,
      admission_date: '2024-04-01',
      date_of_birth: `${2010 - parseInt(gradeNumber)}-${String((index % 12) + 1).padStart(2, '0')}-${String((index % 28) + 1).padStart(2, '0')}`,
      gender: gender,
      status: index % 30 === 0 ? 'inactive' : 'active',
      parent_name: `Mr/Mrs ${lastName}`,
      parent_phone: `+91-${9000000000 + index}`,
      parent_email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
      address: `${index + 1}, Block ${String.fromCharCode(65 + (index % 5))}, ${institutionId === 'inst-msd-001' ? 'New Delhi' : 'Coimbatore'}`,
      blood_group: bloodGroups[index % bloodGroups.length],
      previous_school: index % 3 === 0 ? 'Previous School' : undefined,
      created_at: '2024-04-01T00:00:00Z'
    });
  }
  
  return students;
};

// Generate mock students for both schools
export const mockStudents: Student[] = [
  // Modern School Vasant Vihar (350 students total - 25 per section × 2 sections × 7 grades)
  ...generateStudentsForClass('inst-msd-001', 'MSD', 'class-msd-6a', 'Grade 6', 'A', 0, 25),
  ...generateStudentsForClass('inst-msd-001', 'MSD', 'class-msd-6b', 'Grade 6', 'B', 25, 25),
  
  ...generateStudentsForClass('inst-msd-001', 'MSD', 'class-msd-7a', 'Grade 7', 'A', 50, 25),
  ...generateStudentsForClass('inst-msd-001', 'MSD', 'class-msd-7b', 'Grade 7', 'B', 75, 25),
  
  ...generateStudentsForClass('inst-msd-001', 'MSD', 'class-msd-8a', 'Grade 8', 'A', 100, 25),
  ...generateStudentsForClass('inst-msd-001', 'MSD', 'class-msd-8b', 'Grade 8', 'B', 125, 25),
  
  ...generateStudentsForClass('inst-msd-001', 'MSD', 'class-msd-9a', 'Grade 9', 'A', 150, 25),
  ...generateStudentsForClass('inst-msd-001', 'MSD', 'class-msd-9b', 'Grade 9', 'B', 175, 25),
  
  ...generateStudentsForClass('inst-msd-001', 'MSD', 'class-msd-10a', 'Grade 10', 'A', 200, 25),
  ...generateStudentsForClass('inst-msd-001', 'MSD', 'class-msd-10b', 'Grade 10', 'B', 225, 25),
  
  ...generateStudentsForClass('inst-msd-001', 'MSD', 'class-msd-11a', 'Grade 11', 'A', 250, 25),
  ...generateStudentsForClass('inst-msd-001', 'MSD', 'class-msd-11b', 'Grade 11', 'B', 275, 25),
  
  ...generateStudentsForClass('inst-msd-001', 'MSD', 'class-msd-12a', 'Grade 12', 'A', 300, 25),
  ...generateStudentsForClass('inst-msd-001', 'MSD', 'class-msd-12b', 'Grade 12', 'B', 325, 25),

  // Kikani Global Academy (520 students total - varying per section × 3 sections × 7 grades)
  ...generateStudentsForClass('inst-kga-001', 'KGA', 'class-kga-6a', 'Grade 6', 'A', 350, 27),
  ...generateStudentsForClass('inst-kga-001', 'KGA', 'class-kga-6b', 'Grade 6', 'B', 377, 27),
  ...generateStudentsForClass('inst-kga-001', 'KGA', 'class-kga-6c', 'Grade 6', 'C', 404, 26),
  
  ...generateStudentsForClass('inst-kga-001', 'KGA', 'class-kga-7a', 'Grade 7', 'A', 430, 25),
  ...generateStudentsForClass('inst-kga-001', 'KGA', 'class-kga-7b', 'Grade 7', 'B', 455, 25),
  ...generateStudentsForClass('inst-kga-001', 'KGA', 'class-kga-7c', 'Grade 7', 'C', 480, 25),
  
  ...generateStudentsForClass('inst-kga-001', 'KGA', 'class-kga-8a', 'Grade 8', 'A', 505, 25),
  ...generateStudentsForClass('inst-kga-001', 'KGA', 'class-kga-8b', 'Grade 8', 'B', 530, 25),
  ...generateStudentsForClass('inst-kga-001', 'KGA', 'class-kga-8c', 'Grade 8', 'C', 555, 25),
  
  ...generateStudentsForClass('inst-kga-001', 'KGA', 'class-kga-9a', 'Grade 9', 'A', 580, 24),
  ...generateStudentsForClass('inst-kga-001', 'KGA', 'class-kga-9b', 'Grade 9', 'B', 604, 23),
  ...generateStudentsForClass('inst-kga-001', 'KGA', 'class-kga-9c', 'Grade 9', 'C', 627, 23),
  
  ...generateStudentsForClass('inst-kga-001', 'KGA', 'class-kga-10a', 'Grade 10', 'A', 650, 24),
  ...generateStudentsForClass('inst-kga-001', 'KGA', 'class-kga-10b', 'Grade 10', 'B', 674, 23),
  ...generateStudentsForClass('inst-kga-001', 'KGA', 'class-kga-10c', 'Grade 10', 'C', 697, 23),
  
  ...generateStudentsForClass('inst-kga-001', 'KGA', 'class-kga-11a', 'Grade 11', 'A', 720, 25),
  ...generateStudentsForClass('inst-kga-001', 'KGA', 'class-kga-11b', 'Grade 11', 'B', 745, 25),
  ...generateStudentsForClass('inst-kga-001', 'KGA', 'class-kga-11c', 'Grade 11', 'C', 770, 25),
  
  ...generateStudentsForClass('inst-kga-001', 'KGA', 'class-kga-12a', 'Grade 12', 'A', 795, 25),
  ...generateStudentsForClass('inst-kga-001', 'KGA', 'class-kga-12b', 'Grade 12', 'B', 820, 25),
  ...generateStudentsForClass('inst-kga-001', 'KGA', 'class-kga-12c', 'Grade 12', 'C', 845, 25),
];

// Helper functions
export const getStudentsByInstitution = (institutionId: string): Student[] => {
  return mockStudents.filter(student => student.institution_id === institutionId);
};

export const getStudentsByClass = (institutionId: string, className: string): Student[] => {
  return mockStudents.filter(
    student => student.institution_id === institutionId && student.class === className
  );
};

export const getStudentsByClassAndSection = (institutionId: string, className: string, section: string): Student[] => {
  return mockStudents.filter(
    student => 
      student.institution_id === institutionId && 
      student.class === className && 
      student.section === section
  );
};
