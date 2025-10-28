import api from './api';
import { ApiResponse } from '@/types';

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  specialization: string[];
  joining_date: string;
  status: 'active' | 'inactive' | 'on_leave';
  courses_assigned: number;
  avatar?: string;
}

export interface StudentEnrollment {
  id: string;
  student_name: string;
  student_email: string;
  roll_number: string;
  department: string;
  semester: number;
  batch: string;
  status: 'active' | 'inactive' | 'suspended' | 'graduated';
  enrollment_date: string;
  cgpa?: number;
  avatar?: string;
}

export interface CourseAssignment {
  id: string;
  course_code: string;
  course_name: string;
  teacher_id: string;
  teacher_name: string;
  department: string;
  semester: number;
  credits: number;
  students_enrolled: number;
  max_capacity: number;
  schedule: string;
}

export interface InstitutionReport {
  id: string;
  title: string;
  type: 'enrollment' | 'academic' | 'attendance' | 'performance';
  period: string;
  generated_date: string;
  file_url?: string;
}

export const institutionService = {
  // Teachers
  async getTeachers(): Promise<ApiResponse<Teacher[]>> {
    const response = await api.get('/institution/teachers');
    return response.data;
  },

  async addTeacher(teacher: Partial<Teacher>): Promise<ApiResponse<Teacher>> {
    const response = await api.post('/institution/teachers', teacher);
    return response.data;
  },

  async updateTeacher(id: string, teacher: Partial<Teacher>): Promise<ApiResponse<Teacher>> {
    const response = await api.put(`/institution/teachers/${id}`, teacher);
    return response.data;
  },

  async deleteTeacher(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete(`/institution/teachers/${id}`);
    return response.data;
  },

  // Student Enrollment
  async getStudents(): Promise<ApiResponse<StudentEnrollment[]>> {
    const response = await api.get('/institution/students');
    return response.data;
  },

  async enrollStudent(student: Partial<StudentEnrollment>): Promise<ApiResponse<StudentEnrollment>> {
    const response = await api.post('/institution/students', student);
    return response.data;
  },

  async updateStudent(id: string, student: Partial<StudentEnrollment>): Promise<ApiResponse<StudentEnrollment>> {
    const response = await api.put(`/institution/students/${id}`, student);
    return response.data;
  },

  async deleteStudent(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete(`/institution/students/${id}`);
    return response.data;
  },

  // Course Assignments
  async getCourseAssignments(): Promise<ApiResponse<CourseAssignment[]>> {
    const response = await api.get('/institution/course-assignments');
    return response.data;
  },

  async assignCourse(assignment: Partial<CourseAssignment>): Promise<ApiResponse<CourseAssignment>> {
    const response = await api.post('/institution/course-assignments', assignment);
    return response.data;
  },

  async updateAssignment(id: string, assignment: Partial<CourseAssignment>): Promise<ApiResponse<CourseAssignment>> {
    const response = await api.put(`/institution/course-assignments/${id}`, assignment);
    return response.data;
  },

  async deleteAssignment(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete(`/institution/course-assignments/${id}`);
    return response.data;
  },

  // Reports
  async getReports(): Promise<ApiResponse<InstitutionReport[]>> {
    const response = await api.get('/institution/reports');
    return response.data;
  },

  async generateReport(type: string, period: string): Promise<ApiResponse<InstitutionReport>> {
    const response = await api.post('/institution/reports/generate', { type, period });
    return response.data;
  },

  // Dashboard Stats
  async getDashboardStats(): Promise<ApiResponse<any>> {
    const response = await api.get('/institution/dashboard/stats');
    return response.data;
  },
};
