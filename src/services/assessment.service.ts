import api from './api';
import { Assessment, AssessmentQuestion, AssessmentAttempt, AssessmentPublishing, AssessmentAnswer } from '@/types/assessment';

export const assessmentService = {
  // Assessment CRUD
  createAssessment: async (data: Partial<Assessment>) => {
    return api.post('/assessments', data);
  },
  
  getAssessments: async (filters?: { status?: string; institution_id?: string }) => {
    return api.get('/assessments', { params: filters });
  },
  
  getAssessmentById: async (id: string) => {
    return api.get(`/assessments/${id}`);
  },
  
  updateAssessment: async (id: string, data: Partial<Assessment>) => {
    return api.put(`/assessments/${id}`, data);
  },
  
  deleteAssessment: async (id: string) => {
    return api.delete(`/assessments/${id}`);
  },
  
  duplicateAssessment: async (id: string, includeQuestions: boolean = true) => {
    return api.post(`/assessments/${id}/duplicate`, { includeQuestions });
  },
  
  // Publishing
  publishAssessment: async (id: string, publishing: AssessmentPublishing[]) => {
    return api.post(`/assessments/${id}/publish`, { publishing });
  },
  
  unpublishAssessment: async (id: string) => {
    return api.post(`/assessments/${id}/unpublish`);
  },
  
  // Question Management
  addQuestion: async (assessmentId: string, question: Partial<AssessmentQuestion>) => {
    return api.post(`/assessments/${assessmentId}/questions`, question);
  },
  
  getQuestions: async (assessmentId: string) => {
    return api.get(`/assessments/${assessmentId}/questions`);
  },
  
  updateQuestion: async (questionId: string, data: Partial<AssessmentQuestion>) => {
    return api.put(`/assessments/questions/${questionId}`, data);
  },
  
  deleteQuestion: async (questionId: string) => {
    return api.delete(`/assessments/questions/${questionId}`);
  },
  
  reorderQuestions: async (assessmentId: string, questionIds: string[]) => {
    return api.put(`/assessments/${assessmentId}/questions/reorder`, { questionIds });
  },
  
  // Analytics
  getAssessmentAnalytics: async (id: string) => {
    return api.get(`/assessments/${id}/analytics`);
  },
  
  getAttempts: async (assessmentId: string, filters?: { institution_id?: string; class_id?: string }) => {
    return api.get(`/assessments/${assessmentId}/attempts`, { params: filters });
  },
  
  getAttemptById: async (attemptId: string) => {
    return api.get(`/assessments/attempts/${attemptId}`);
  },
  
  // Officer-specific
  getInstitutionAssessments: async (institutionId: string) => {
    return api.get(`/assessments/institution/${institutionId}`);
  },

  // Student-specific
  getStudentAssessments: async (studentId: string, classId: string) => {
    return api.get(`/assessments/student`, { params: { studentId, classId } });
  },

  getStudentAttempts: async (studentId: string) => {
    return api.get(`/assessments/attempts/student/${studentId}`);
  },

  submitAttempt: async (attemptId: string, answers: AssessmentAnswer[]) => {
    return api.post(`/assessments/attempts/${attemptId}/submit`, { answers });
  },

  startAttempt: async (assessmentId: string, studentId: string) => {
    return api.post(`/assessments/${assessmentId}/start`, { studentId });
  }
};
