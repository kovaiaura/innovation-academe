import { Student } from '@/types/student';
import { Course } from '@/types/course';

export interface CertificateData {
  id: string;
  student_id: string;
  student_name: string;
  course_id: string;
  course_title: string;
  course_code: string;
  institution_name: string;
  issued_by: string;
  issued_date: string;
  completion_date: string;
  certificate_url: string;
  qr_code_url: string;
  verification_code: string;
  type: 'course_completion';
  grade?: string;
}

export function generateCourseCertificate(
  student: Student,
  course: Course,
  officerName: string,
  institutionName: string,
  completionDate: string
): CertificateData {
  const timestamp = Date.now();
  const verificationCode = `CERT-${timestamp}-${student.id.slice(-4).toUpperCase()}`;
  
  return {
    id: `cert-${timestamp}`,
    student_id: student.id,
    student_name: student.student_name,
    course_id: course.id,
    course_title: course.title,
    course_code: course.course_code,
    institution_name: institutionName,
    issued_by: officerName,
    issued_date: new Date().toISOString(),
    completion_date: completionDate,
    certificate_url: `/certificates/${student.id}-${course.id}.pdf`,
    qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verificationCode)}`,
    verification_code: verificationCode,
    type: 'course_completion'
  };
}

export function storeCertificate(certificate: CertificateData): void {
  const key = `certificates_${certificate.student_id}`;
  const existing = JSON.parse(localStorage.getItem(key) || '[]');
  
  // Check if certificate already exists
  const existingIndex = existing.findIndex(
    (c: CertificateData) => c.course_id === certificate.course_id
  );
  
  if (existingIndex >= 0) {
    existing[existingIndex] = certificate;
  } else {
    existing.unshift(certificate);
  }
  
  localStorage.setItem(key, JSON.stringify(existing));
}

export function getCertificates(studentId: string): CertificateData[] {
  const key = `certificates_${studentId}`;
  return JSON.parse(localStorage.getItem(key) || '[]');
}

export function getCertificateByCourse(studentId: string, courseId: string): CertificateData | null {
  const certificates = getCertificates(studentId);
  return certificates.find(c => c.course_id === courseId) || null;
}
