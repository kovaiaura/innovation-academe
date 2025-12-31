import { supabase } from '@/integrations/supabase/client';
import { Task, TaskComment, TaskStats } from '@/types/task';

export async function fetchAllTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  const tasksWithComments = await Promise.all(
    (data || []).map(async (task) => {
      const { data: comments } = await supabase
        .from('task_comments')
        .select('*')
        .eq('task_id', task.id)
        .order('created_at', { ascending: true });
      
      return { ...task, comments: comments || [] } as Task;
    })
  );
  
  return tasksWithComments;
}

export async function fetchTasksByAssignee(userId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('assigned_to_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  const tasksWithComments = await Promise.all(
    (data || []).map(async (task) => {
      const { data: comments } = await supabase
        .from('task_comments')
        .select('*')
        .eq('task_id', task.id)
        .order('created_at', { ascending: true });
      
      return { ...task, comments: comments || [] } as Task;
    })
  );
  
  return tasksWithComments;
}

export async function createTask(taskData: Omit<Task, 'id' | 'created_at' | 'comments'>): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      title: taskData.title,
      description: taskData.description,
      category: taskData.category,
      priority: taskData.priority,
      status: taskData.status || 'pending',
      created_by_id: taskData.created_by_id,
      created_by_name: taskData.created_by_name,
      created_by_position: taskData.created_by_position,
      assigned_to_id: taskData.assigned_to_id,
      assigned_to_name: taskData.assigned_to_name,
      assigned_to_position: taskData.assigned_to_position,
      assigned_to_role: taskData.assigned_to_role,
      due_date: taskData.due_date,
      progress_percentage: taskData.progress_percentage || 0,
    })
    .select()
    .single();

  if (error) throw error;
  return { ...data, comments: [] } as Task;
}

export async function updateTaskInDb(taskId: string, updates: Partial<Task>): Promise<Task> {
  const updateData = { ...updates };
  delete (updateData as any).comments;
  
  const { data, error } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', taskId)
    .select()
    .single();

  if (error) throw error;
  
  const { data: comments } = await supabase
    .from('task_comments')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: true });
  
  return { ...data, comments: comments || [] } as Task;
}

export async function deleteTaskFromDb(taskId: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', taskId);
  if (error) throw error;
}

export async function addTaskComment(taskId: string, userId: string, userName: string, comment: string): Promise<TaskComment> {
  const { data, error } = await supabase
    .from('task_comments')
    .insert({ task_id: taskId, user_id: userId, user_name: userName, comment })
    .select()
    .single();

  if (error) throw error;
  return data as TaskComment;
}

export async function getTaskStatistics(userId?: string): Promise<TaskStats> {
  let query = supabase.from('tasks').select('status, due_date');
  if (userId) query = query.eq('assigned_to_id', userId);
  
  const { data, error } = await query;
  if (error) throw error;
  
  const now = new Date();
  const tasks = data || [];
  
  return {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled' && new Date(t.due_date) < now).length,
  };
}

export async function fetchAssignees(): Promise<{
  metaEmployees: Array<{ id: string; name: string; position: string; avatar?: string }>;
  officers: Array<{ id: string; userId: string; name: string; position: string; avatar?: string }>;
}> {
  const { data: metaEmployees } = await supabase
    .from('profiles')
    .select('id, name, position_name, avatar, position_id')
    .not('position_id', 'is', null);

  const { data: officers } = await supabase
    .from('officers')
    .select('id, user_id, full_name, profile_photo_url')
    .eq('status', 'active');

  return {
    metaEmployees: (metaEmployees || []).map(emp => ({
      id: emp.id,
      name: emp.name || 'Unknown',
      position: emp.position_name || 'Meta Employee',
      avatar: emp.avatar,
    })),
    officers: (officers || []).map(off => ({
      id: off.id,
      userId: off.user_id,
      name: off.full_name || 'Unknown Officer',
      position: 'Innovation Officer',
      avatar: off.profile_photo_url,
    })),
  };
}
