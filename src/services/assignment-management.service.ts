import api from './api';
import { ApiResponse } from '@/types';
import {
  StandaloneAssignment,
  StandaloneAssignmentSubmission,
  AssignmentStats,
  StudentAssignmentSummary,
} from '@/types/assignment-management';

export const assignmentManagementService = {
  // System Admin - Create Assignment
  async createAssignment(data: Partial<StandaloneAssignment>): Promise<ApiResponse<StandaloneAssignment>> {
    const response = await api.post('/assignments', data);
    return response.data;
  },

  // System Admin - Get All Assignments
  async getAssignments(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    institution_id?: string;
  }): Promise<ApiResponse<{ assignments: StandaloneAssignment[]; pagination: any }>> {
    const response = await api.get('/assignments', { params });
    return response.data;
  },

  // Get Assignment by ID
  async getAssignmentById(id: string): Promise<ApiResponse<StandaloneAssignment>> {
    const response = await api.get(`/assignments/${id}`);
    return response.data;
  },

  // Update Assignment
  async updateAssignment(id: string, data: Partial<StandaloneAssignment>): Promise<ApiResponse<StandaloneAssignment>> {
    const response = await api.put(`/assignments/${id}`, data);
    return response.data;
  },

  // Delete Assignment
  async deleteAssignment(id: string): Promise<ApiResponse<any>> {
    const response = await api.delete(`/assignments/${id}`);
    return response.data;
  },

  // Publish Assignment to Institutions/Classes
  async publishAssignment(
    id: string,
    publishing: Array<{ institution_id: string; class_ids: string[] }>
  ): Promise<ApiResponse<any>> {
    const response = await api.post(`/assignments/${id}/publish`, { publishing });
    return response.data;
  },

  // Get Assignment Stats (for dashboard)
  async getAssignmentStats(): Promise<ApiResponse<AssignmentStats>> {
    const response = await api.get('/assignments/stats');
    return response.data;
  },

  // Student - Get Assigned Assignments
  async getStudentAssignments(params?: {
    status?: 'pending' | 'submitted' | 'graded';
    search?: string;
  }): Promise<ApiResponse<{ assignments: StandaloneAssignment[]; submissions: StandaloneAssignmentSubmission[] }>> {
    const response = await api.get('/assignments/student/my-assignments', { params });
    return response.data;
  },

  // Student - Get Assignment Summary Stats
  async getStudentAssignmentSummary(): Promise<ApiResponse<StudentAssignmentSummary>> {
    const response = await api.get('/assignments/student/summary');
    return response.data;
  },

  // Student - Submit Assignment
  async submitAssignment(assignmentId: string, data: {
    text_content?: string;
    url?: string;
    file_ids?: string[];
    answers?: any[];
  }): Promise<ApiResponse<StandaloneAssignmentSubmission>> {
    const response = await api.post(`/assignments/${assignmentId}/submit`, data);
    return response.data;
  },

  // Student - Save Draft
  async saveDraft(assignmentId: string, data: {
    draft_content?: string;
    answers?: any[];
  }): Promise<ApiResponse<any>> {
    const response = await api.post(`/assignments/${assignmentId}/save-draft`, data);
    return response.data;
  },

  // Student - Get Submission
  async getSubmission(assignmentId: string): Promise<ApiResponse<StandaloneAssignmentSubmission>> {
    const response = await api.get(`/assignments/${assignmentId}/submission`);
    return response.data;
  },

  // Officer/Admin - Get All Submissions for Assignment
  async getAssignmentSubmissions(
    assignmentId: string,
    params?: {
      page?: number;
      limit?: number;
      status?: string;
      class_id?: string;
    }
  ): Promise<ApiResponse<{ submissions: StandaloneAssignmentSubmission[]; pagination: any }>> {
    const response = await api.get(`/assignments/${assignmentId}/submissions`, { params });
    return response.data;
  },

  // Officer/Admin - Grade Submission
  async gradeSubmission(
    submissionId: string,
    data: {
      grade: number;
      feedback?: string;
      rubric_scores?: any[];
      feedback_file_ids?: string[];
    }
  ): Promise<ApiResponse<StandaloneAssignmentSubmission>> {
    const response = await api.put(`/assignments/submissions/${submissionId}/grade`, data);
    return response.data;
  },

  // Upload file (for submissions or feedback)
  async uploadFile(file: File, type: 'submission' | 'feedback'): Promise<ApiResponse<{ file_id: string; url: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    const response = await api.post('/assignments/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Duplicate Assignment
  async duplicateAssignment(id: string): Promise<ApiResponse<StandaloneAssignment>> {
    const response = await api.post(`/assignments/${id}/duplicate`);
    return response.data;
  },
};
