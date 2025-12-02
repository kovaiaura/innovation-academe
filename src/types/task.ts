export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in_progress' | 'submitted_for_approval' | 'completed' | 'rejected' | 'cancelled';
export type TaskCategory = 'administrative' | 'operational' | 'strategic' | 'technical' | 'other';

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  
  // Assignment
  created_by_id: string;
  created_by_name: string;
  created_by_position: string; // CEO, MD, AGM
  
  assigned_to_id: string;
  assigned_to_name: string;
  assigned_to_position: string; // GM, Manager, Admin Staff, Officer
  assigned_to_role: string; // 'system_admin' or 'officer'
  
  // Dates
  created_at: string;
  due_date: string;
  completed_at?: string;
  
  // Optional fields
  attachments?: string[];
  comments?: TaskComment[];
  progress_percentage?: number;
  
  // Approval workflow fields
  submitted_at?: string;
  approved_by_id?: string;
  approved_by_name?: string;
  approved_at?: string;
  rejection_reason?: string;
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  user_name: string;
  comment: string;
  created_at: string;
}

export interface TaskStats {
  total: number;
  pending: number;
  in_progress: number;
  completed: number;
  overdue: number;
}
