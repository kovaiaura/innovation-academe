import { Student } from '@/types/student';

const firstNames = [
  'Aarav', 'Vivaan', 'Aditya', 'Arjun', 'Sai', 'Krishna', 'Aryan', 'Ishaan', 'Reyansh', 'Ayaan',
  'Aadhya', 'Ananya', 'Diya', 'Saanvi', 'Pari', 'Sara', 'Aaradhya', 'Navya', 'Angel', 'Kiara',
  'Arnav', 'Dhruv', 'Vihaan', 'Shaurya', 'Atharv', 'Rudra', 'Kabir', 'Shivansh', 'Kian', 'Om'
];

const lastNames = [
  'Sharma', 'Verma', 'Gupta', 'Kumar', 'Singh', 'Patel', 'Reddy', 'Rao', 'Mehta', 'Joshi',
  'Agarwal', 'Desai', 'Nair', 'Kulkarni', 'Iyer', 'Pandey', 'Saxena', 'Bhat', 'Pillai', 'Menon'
];

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const genders: Array<'male' | 'female' | 'other'> = ['male', 'female', 'male', 'female', 'male', 'female', 'other'];

// Generate students for Institution 1 classes
const generateStudentsForClass = (classId: string, className: string, section: string, startIndex: number, count: number): Student[] => {
  const students: Student[] = [];
  const classNumber = className.replace('Grade ', '');
  
  for (let i = 0; i < count; i++) {
    const index = startIndex + i;
    const firstName = firstNames[index % firstNames.length];
    const lastName = lastNames[index % lastNames.length];
    const gender = genders[index % genders.length];
    
    students.push({
      id: `stu-1-${classId}-${i + 1}`,
      student_name: `${firstName} ${lastName}`,
      roll_number: `${classNumber}${section}${String(i + 1).padStart(3, '0')}`,
      admission_number: `ADM1-2024-${String(index).padStart(5, '0')}`,
      class: className,
      section: section,
      class_id: classId,
      institution_id: '1',
      admission_date: '2024-04-01',
      date_of_birth: `${2010 - parseInt(classNumber)}-${String((index % 12) + 1).padStart(2, '0')}-${String((index % 28) + 1).padStart(2, '0')}`,
      gender: gender,
      status: index % 25 === 0 ? 'inactive' : 'active',
      parent_name: `Mr/Mrs ${lastName}`,
      parent_phone: `+91-${9000000000 + index}`,
      parent_email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
      address: `${index + 1}, Block ${String.fromCharCode(65 + (index % 5))}, Main Street, City`,
      blood_group: bloodGroups[index % bloodGroups.length],
      previous_school: index % 3 === 0 ? 'St. Xavier School' : undefined,
      created_at: '2024-01-15T00:00:00Z'
    });
  }
  
  return students;
};

// Generate mock students for Institution 1
export const mockStudents: Student[] = [
  // Grade 9 Section A (class-1-9a) - 32 students
  ...generateStudentsForClass('class-1-9a', 'Grade 9', 'A', 0, 32),
  
  // Grade 9 Section B (class-1-9b) - 33 students
  ...generateStudentsForClass('class-1-9b', 'Grade 9', 'B', 100, 33),
  
  // Grade 10 Section A (class-1-10a) - 30 students
  ...generateStudentsForClass('class-1-10a', 'Grade 10', 'A', 200, 30),
  
  // Grade 11 Section A (class-1-11a) - 28 students
  ...generateStudentsForClass('class-1-11a', 'Grade 11', 'A', 300, 28),
  
  // Grade 12 Section A (class-1-12a) - 25 students
  ...generateStudentsForClass('class-1-12a', 'Grade 12', 'A', 400, 25),
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
