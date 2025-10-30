import { CertificateData } from '@/utils/certificateGenerator';

export const mockCertificates: CertificateData[] = [
  {
    id: 'cert-001',
    student_id: 'springfield-8-A-001',
    student_name: 'Aarav Sharma',
    course_id: 'course-1',
    course_title: 'Introduction to Artificial Intelligence',
    course_code: 'AI101',
    institution_name: 'Springfield High School',
    issued_by: 'Dr. Rajesh Kumar',
    issued_date: '2024-03-15T00:00:00Z',
    completion_date: '2024-03-14T00:00:00Z',
    certificate_url: '/certificates/springfield-8-A-001-course-1.pdf',
    qr_code_url: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=CERT-1710460800000-A001',
    verification_code: 'CERT-1710460800000-A001',
    type: 'course_completion',
    grade: 'A'
  }
];
