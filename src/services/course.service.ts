import api from './api';
import { ApiResponse } from '@/types';
import {
  Course,
  CourseModule,
  CourseContent,
  Assignment,
  Quiz,
  QuizQuestion,
  CourseAssignment,
  CourseAnalytics,
  CreateCourseRequest,
  UpdateCourseRequest,
  CreateModuleRequest,
  CourseAssignmentRequest
} from '@/types/course';

// System Admin Course Service
export const courseService = {
  // ========== COURSE CRUD ==========
  async createCourse(data: CreateCourseRequest): Promise<ApiResponse<Course>> {
    const response = await api.post('/system-admin/courses', data);
    return response.data;
  },

  async getCourses(params?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    search?: string;
  }): Promise<ApiResponse<{ courses: Course[]; pagination: any }>> {
    const response = await api.get('/system-admin/courses', { params });
    return response.data;
  },

  async getCourseById(id: string): Promise<ApiResponse<Course>> {
    const response = await api.get(`/system-admin/courses/${id}`);
    return response.data;
  },

  async updateCourse(id: string, data: UpdateCourseRequest): Promise<ApiResponse<Course>> {
    const response = await api.put(`/system-admin/courses/${id}`, data);
    return response.data;
  },

  async deleteCourse(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete(`/system-admin/courses/${id}`);
    return response.data;
  },

  async duplicateCourse(id: string): Promise<ApiResponse<Course>> {
    const response = await api.post(`/system-admin/courses/${id}/duplicate`);
    return response.data;
  },

  // ========== MODULE MANAGEMENT ==========
  async addModule(courseId: string, data: CreateModuleRequest): Promise<ApiResponse<CourseModule>> {
    const response = await api.post(`/system-admin/courses/${courseId}/modules`, data);
    return response.data;
  },

  async getModules(courseId: string): Promise<ApiResponse<CourseModule[]>> {
    const response = await api.get(`/system-admin/courses/${courseId}/modules`);
    return response.data;
  },

  async updateModule(courseId: string, moduleId: string, data: Partial<CreateModuleRequest>): Promise<ApiResponse<CourseModule>> {
    const response = await api.put(`/system-admin/courses/${courseId}/modules/${moduleId}`, data);
    return response.data;
  },

  async deleteModule(courseId: string, moduleId: string): Promise<ApiResponse<void>> {
    const response = await api.delete(`/system-admin/courses/${courseId}/modules/${moduleId}`);
    return response.data;
  },

  // ========== CONTENT MANAGEMENT ==========
  async uploadContent(courseId: string, formData: FormData): Promise<ApiResponse<CourseContent>> {
    const response = await api.post(`/system-admin/courses/${courseId}/content`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  async getContent(courseId: string): Promise<ApiResponse<CourseContent[]>> {
    const response = await api.get(`/system-admin/courses/${courseId}/content`);
    return response.data;
  },

  async updateContent(courseId: string, contentId: string, data: Partial<CourseContent>): Promise<ApiResponse<CourseContent>> {
    const response = await api.put(`/system-admin/courses/${courseId}/content/${contentId}`, data);
    return response.data;
  },

  async deleteContent(courseId: string, contentId: string): Promise<ApiResponse<void>> {
    const response = await api.delete(`/system-admin/courses/${courseId}/content/${contentId}`);
    return response.data;
  },

  // ========== ASSIGNMENT & QUIZ MANAGEMENT ==========
  async createAssignment(courseId: string, data: Partial<Assignment>): Promise<ApiResponse<Assignment>> {
    const response = await api.post(`/system-admin/courses/${courseId}/assignments`, data);
    return response.data;
  },

  async getAssignments(courseId: string): Promise<ApiResponse<Assignment[]>> {
    const response = await api.get(`/system-admin/courses/${courseId}/assignments`);
    return response.data;
  },

  async updateAssignment(courseId: string, assignmentId: string, data: Partial<Assignment>): Promise<ApiResponse<Assignment>> {
    const response = await api.put(`/system-admin/courses/${courseId}/assignments/${assignmentId}`, data);
    return response.data;
  },

  async deleteAssignment(courseId: string, assignmentId: string): Promise<ApiResponse<void>> {
    const response = await api.delete(`/system-admin/courses/${courseId}/assignments/${assignmentId}`);
    return response.data;
  },

  async createQuiz(courseId: string, data: Partial<Quiz>): Promise<ApiResponse<Quiz>> {
    const response = await api.post(`/system-admin/courses/${courseId}/quizzes`, data);
    return response.data;
  },

  async getQuizzes(courseId: string): Promise<ApiResponse<Quiz[]>> {
    const response = await api.get(`/system-admin/courses/${courseId}/quizzes`);
    return response.data;
  },

  async updateQuiz(quizId: string, data: Partial<Quiz>): Promise<ApiResponse<Quiz>> {
    const response = await api.put(`/system-admin/quizzes/${quizId}`, data);
    return response.data;
  },

  async deleteQuiz(quizId: string): Promise<ApiResponse<void>> {
    const response = await api.delete(`/system-admin/quizzes/${quizId}`);
    return response.data;
  },

  async addQuizQuestion(quizId: string, data: Partial<QuizQuestion>): Promise<ApiResponse<QuizQuestion>> {
    const response = await api.post(`/system-admin/quizzes/${quizId}/questions`, data);
    return response.data;
  },

  async getQuizQuestions(quizId: string): Promise<ApiResponse<QuizQuestion[]>> {
    const response = await api.get(`/system-admin/quizzes/${quizId}/questions`);
    return response.data;
  },

  // ========== COURSE ASSIGNMENTS (to Institutions & Officers) ==========
  async assignCourse(data: CourseAssignmentRequest): Promise<ApiResponse<CourseAssignment>> {
    const response = await api.post('/system-admin/course-assignments', data);
    return response.data;
  },

  async getCourseAssignments(params?: {
    course_id?: string;
    institution_id?: string;
  }): Promise<ApiResponse<CourseAssignment[]>> {
    const response = await api.get('/system-admin/course-assignments', { params });
    return response.data;
  },

  async updateCourseAssignment(id: string, data: Partial<CourseAssignmentRequest>): Promise<ApiResponse<CourseAssignment>> {
    const response = await api.put(`/system-admin/course-assignments/${id}`, data);
    return response.data;
  },

  async deleteCourseAssignment(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete(`/system-admin/course-assignments/${id}`);
    return response.data;
  },

  // ========== ANALYTICS ==========
  async getCourseAnalytics(courseId?: string): Promise<ApiResponse<CourseAnalytics | CourseAnalytics[]>> {
    const url = courseId 
      ? `/system-admin/courses/${courseId}/analytics`
      : '/system-admin/courses/analytics';
    const response = await api.get(url);
    return response.data;
  },

  async exportReport(type: 'excel' | 'pdf', courseId: string): Promise<ApiResponse<{ file_url: string }>> {
    const response = await api.post('/system-admin/courses/export', { type, courseId });
    return response.data;
  }
};
