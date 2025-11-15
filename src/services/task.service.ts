import api from './api';
import { Task, TaskComment, TaskStats } from '@/types/task';

export const taskService = {
  // Get all tasks (for task management)
  getAllTasks: async (): Promise<Task[]> => {
    const response = await api.get('/tasks');
    return response.data;
  },
  
  // Get tasks assigned to user
  getMyTasks: async (userId: string): Promise<Task[]> => {
    const response = await api.get(`/tasks/assigned/${userId}`);
    return response.data;
  },
  
  // Get task statistics
  getTaskStats: async (userId?: string): Promise<TaskStats> => {
    const endpoint = userId ? `/tasks/stats/${userId}` : '/tasks/stats';
    const response = await api.get(endpoint);
    return response.data;
  },
  
  // Create task
  createTask: async (taskData: Omit<Task, 'id' | 'created_at'>): Promise<Task> => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },
  
  // Update task
  updateTask: async (taskId: string, updates: Partial<Task>): Promise<Task> => {
    const response = await api.put(`/tasks/${taskId}`, updates);
    return response.data;
  },
  
  // Delete task
  deleteTask: async (taskId: string): Promise<void> => {
    await api.delete(`/tasks/${taskId}`);
  },
  
  // Add comment
  addComment: async (taskId: string, comment: string): Promise<TaskComment> => {
    const response = await api.post(`/tasks/${taskId}/comments`, { comment });
    return response.data;
  },
};
