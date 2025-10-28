import { Student } from '@/types/student';

export const exportStudentsToCSV = (students: Student[], filename: string) => {
  const headers = [
    'Name',
    'Roll Number',
    'Admission Number',
    'Class',
    'Section',
    'Gender',
    'Status',
    'Date of Birth',
    'Parent Name',
    'Parent Phone',
    'Parent Email',
    'Blood Group',
    'Address'
  ];

  const rows = students.map(student => [
    student.student_name,
    student.roll_number,
    student.admission_number,
    student.class,
    student.section,
    student.gender,
    student.status,
    student.date_of_birth,
    student.parent_name,
    student.parent_phone,
    student.parent_email,
    student.blood_group || '',
    student.address
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const getStatusColor = (status: string): string => {
  const colors = {
    active: 'bg-green-500/10 text-green-700 dark:text-green-400',
    inactive: 'bg-gray-500/10 text-gray-700 dark:text-gray-400',
    transferred: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
    graduated: 'bg-purple-500/10 text-purple-700 dark:text-purple-400'
  };
  return colors[status as keyof typeof colors] || colors.active;
};

export const getGenderIcon = (gender: string): string => {
  return gender === 'male' ? '👨' : gender === 'female' ? '👩' : '🧑';
};

export const filterStudents = (
  students: Student[],
  searchTerm: string,
  sectionFilter: string,
  statusFilter: string,
  genderFilter: string
): Student[] => {
  return students.filter(student => {
    const matchesSearch = 
      student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.roll_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.admission_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.parent_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSection = sectionFilter === 'all' || student.section === sectionFilter;
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    const matchesGender = genderFilter === 'all' || student.gender === genderFilter;
    
    return matchesSearch && matchesSection && matchesStatus && matchesGender;
  });
};

export const sortStudents = (
  students: Student[],
  sortBy: 'name' | 'roll_number' | 'admission_date',
  sortOrder: 'asc' | 'desc'
): Student[] => {
  const sorted = [...students].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.student_name.localeCompare(b.student_name);
        break;
      case 'roll_number':
        comparison = a.roll_number.localeCompare(b.roll_number);
        break;
      case 'admission_date':
        comparison = new Date(a.admission_date).getTime() - new Date(b.admission_date).getTime();
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });
  
  return sorted;
};

export const calculateClassStatistics = (students: Student[]) => {
  const total = students.length;
  const boys = students.filter(s => s.gender === 'male').length;
  const girls = students.filter(s => s.gender === 'female').length;
  const active = students.filter(s => s.status === 'active').length;
  const sections = [...new Set(students.map(s => s.section))];
  
  return {
    total,
    boys,
    girls,
    active,
    inactive: total - active,
    sections: sections.sort()
  };
};
