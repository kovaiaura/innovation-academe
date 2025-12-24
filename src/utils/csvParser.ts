import Papa from 'papaparse';

export interface ParsedRow {
  student_name: string;
  email: string;
  password: string;
  roll_number: string;
  admission_number: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  parent_name: string;
  parent_phone: string;
  address: string;
  blood_group?: string;
  previous_school?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface DuplicateInfo {
  rollNumbers: string[];
  admissionNumbers: string[];
  emails: string[];
}

export function parseCSV(file: File): Promise<ParsedRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase().replace(/\s+/g, '_'),
      complete: (results) => {
        resolve(results.data as ParsedRow[]);
      },
      error: (error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      }
    });
  });
}

export function validateRow(row: ParsedRow, rowIndex: number): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required field validation
  if (!row.student_name?.trim()) {
    errors.push('Student name is required');
  } else if (row.student_name.length < 2 || row.student_name.length > 100) {
    errors.push('Student name must be 2-100 characters');
  }

  // Email validation for student login
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!row.email?.trim()) {
    errors.push('Student email is required for login');
  } else if (!emailRegex.test(row.email)) {
    errors.push('Invalid student email format');
  }

  // Password validation for student login
  if (!row.password?.trim()) {
    errors.push('Password is required for student login');
  } else if (row.password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (!row.roll_number?.trim()) {
    errors.push('Roll number is required');
  } else if (row.roll_number.length < 1 || row.roll_number.length > 30) {
    errors.push('Roll number must be 1-30 characters');
  }

  if (!row.admission_number?.trim()) {
    errors.push('Admission number is required');
  }

  // Date validation
  if (!row.date_of_birth) {
    errors.push('Date of birth is required');
  } else {
    const dob = new Date(row.date_of_birth);
    if (isNaN(dob.getTime())) {
      errors.push('Invalid date format (use YYYY-MM-DD)');
    } else {
      const age = new Date().getFullYear() - dob.getFullYear();
      if (age < 4 || age > 25) {
        warnings.push('Student age should typically be between 4 and 25 years');
      }
    }
  }

  // Gender validation
  if (!row.gender || !['male', 'female', 'other'].includes(row.gender.toLowerCase())) {
    errors.push('Gender must be male, female, or other');
  }

  if (!row.parent_name?.trim()) {
    errors.push('Parent name is required');
  }

  // Phone validation
  const phoneRegex = /^[\+]?[0-9\s\-()]{10,20}$/;
  if (!row.parent_phone || !phoneRegex.test(row.parent_phone)) {
    errors.push('Valid parent phone number is required');
  }

  if (!row.address?.trim() || row.address.length < 10) {
    errors.push('Address is required (minimum 10 characters)');
  }

  // Blood group validation (optional)
  const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  if (row.blood_group && !validBloodGroups.includes(row.blood_group.toUpperCase())) {
    warnings.push('Invalid blood group format');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function findDuplicates(data: ParsedRow[]): DuplicateInfo {
  const rollNumbers = new Map<string, number>();
  const admissionNumbers = new Map<string, number>();
  const emails = new Map<string, number>();
  const duplicateRolls: string[] = [];
  const duplicateAdmissions: string[] = [];
  const duplicateEmails: string[] = [];

  data.forEach((row, index) => {
    const rollNum = row.roll_number?.trim();
    const admNum = row.admission_number?.trim();
    const email = row.email?.trim()?.toLowerCase();

    if (rollNum) {
      if (rollNumbers.has(rollNum)) {
        duplicateRolls.push(rollNum);
      } else {
        rollNumbers.set(rollNum, index);
      }
    }

    if (admNum) {
      if (admissionNumbers.has(admNum)) {
        duplicateAdmissions.push(admNum);
      } else {
        admissionNumbers.set(admNum, index);
      }
    }

    if (email) {
      if (emails.has(email)) {
        duplicateEmails.push(email);
      } else {
        emails.set(email, index);
      }
    }
  });

  return {
    rollNumbers: [...new Set(duplicateRolls)],
    admissionNumbers: [...new Set(duplicateAdmissions)],
    emails: [...new Set(duplicateEmails)]
  };
}

export function generateTemplate(): Blob {
  const headers = [
    'student_name',
    'email',
    'password',
    'roll_number',
    'admission_number',
    'date_of_birth',
    'gender',
    'parent_name',
    'parent_phone',
    'address',
    'blood_group',
    'previous_school'
  ];

  const exampleRow = [
    'John Doe',
    'john.doe@school.com',
    'Student@123',
    'MSA-5-A-001-KGA',
    'ADM-2025-001',
    '2010-05-15',
    'male',
    'Mr. Robert Doe',
    '+91-98765-43210',
    '123 Main St, New Delhi',
    'O+',
    'XYZ School'
  ];

  const csvContent = [
    headers.join(','),
    exampleRow.map(cell => `"${cell}"`).join(',')
  ].join('\n');

  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
}
