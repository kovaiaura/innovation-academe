import { CertificateTemplate, StudentCertificate } from '@/types/gamification';
import { Student } from '@/types/student';

export const certificateService = {
  // Generate certificate image with student name overlay
  generateCertificateImage: async (
    template: CertificateTemplate,
    studentName: string
  ): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 900;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve('');
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // Draw template image
        ctx.drawImage(img, 0, 0, 1200, 900);
        
        // Draw student name
        ctx.font = `${template.name_position.fontSize}px ${template.name_position.fontFamily}`;
        ctx.fillStyle = template.name_position.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(studentName, template.name_position.x, template.name_position.y);
        
        // Convert to data URL
        resolve(canvas.toDataURL('image/png'));
      };
      
      img.onerror = () => {
        resolve('');
      };
      
      img.src = template.template_image_url;
    });
  },

  // Save generated certificate
  saveCertificate: (certificate: StudentCertificate): void => {
    const key = `certificates_${certificate.student_id}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    
    // Check if certificate already exists
    const existingIndex = existing.findIndex(
      (c: StudentCertificate) => 
        c.activity_type === certificate.activity_type && 
        c.activity_id === certificate.activity_id
    );
    
    if (existingIndex >= 0) {
      existing[existingIndex] = certificate;
    } else {
      existing.unshift(certificate);
    }
    
    localStorage.setItem(key, JSON.stringify(existing));
  },

  // Get student's certificates
  getStudentCertificates: (studentId: string): StudentCertificate[] => {
    const key = `certificates_${studentId}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  },

  // Generate and save certificate
  awardCertificate: async (
    student: Student,
    activityType: 'course' | 'assignment' | 'assessment' | 'event',
    activityId: string,
    activityName: string,
    templateId: string,
    institutionName: string,
    completionDate: string,
    grade?: string
  ): Promise<StudentCertificate> => {
    const timestamp = Date.now();
    const verificationCode = `CERT-${timestamp}-${student.id.slice(-4).toUpperCase()}`;
    
    const certificate: StudentCertificate = {
      id: `cert-${timestamp}`,
      student_id: student.id,
      student_name: student.student_name,
      template_id: templateId,
      activity_type: activityType,
      activity_id: activityId,
      activity_name: activityName,
      institution_name: institutionName,
      issued_date: new Date().toISOString(),
      completion_date: completionDate,
      certificate_url: `/generated-certificates/${student.id}-${activityId}.pdf`,
      verification_code: verificationCode,
      qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verificationCode)}`,
      grade
    };
    
    certificateService.saveCertificate(certificate);
    return certificate;
  }
};
