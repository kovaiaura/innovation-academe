import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Task, TaskStatus, TaskPriority } from '@/types/task';
import { TaskStatsCards } from '@/components/task/TaskStatsCards';
import { TaskFilters } from '@/components/task/TaskFilters';
import { TaskCard } from '@/components/task/TaskCard';
import { TaskDetailDialog } from '@/components/task/TaskDetailDialog';
import { getTasksByAssignee, getTaskStats } from '@/data/mockTaskData';
import { useAuth } from '@/contexts/AuthContext';
import { canAccessFeature } from '@/utils/permissionHelpers';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function Tasks() {
  const { user } = useAuth();

  // Check if user has task_allotment feature
  if (!canAccessFeature(user, 'task_allotment')) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              You do not have permission to view assigned tasks. Contact your administrator for access.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Load user's tasks
  useEffect(() => {
    if (user?.id) {
      const userTasks = getTasksByAssignee(user.id);
      setTasks(userTasks);
      setFilteredTasks(userTasks);
    }
  }, [user?.id]);

  const stats = getTaskStats(user?.id);

  // Apply filters
  useEffect(() => {
    let filtered = tasks;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query)
      );
    }

    setFilteredTasks(filtered);
  }, [tasks, statusFilter, priorityFilter, searchQuery]);

  const handleUpdateStatus = (taskId: string, status: TaskStatus, progress?: number) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? {
              ...task,
              status,
              progress_percentage: progress !== undefined ? progress : task.progress_percentage,
              completed_at: status === 'completed' ? new Date().toISOString() : task.completed_at,
            }
          : task
      )
    );
    
    if (selectedTask?.id === taskId) {
      setSelectedTask(prev => prev ? {
        ...prev,
        status,
        progress_percentage: progress !== undefined ? progress : prev.progress_percentage,
        completed_at: status === 'completed' ? new Date().toISOString() : prev.completed_at,
      } : null);
    }
  };

  const handleAddComment = (taskId: string, comment: string) => {
    const newComment = {
      id: `comment-${Date.now()}`,
      task_id: taskId,
      user_id: user?.id || '',
      user_name: user?.name || '',
      comment,
      created_at: new Date().toISOString(),
    };

    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? { ...task, comments: [...(task.comments || []), newComment] }
          : task
      )
    );

    if (selectedTask?.id === taskId) {
      setSelectedTask(prev => prev ? {
        ...prev,
        comments: [...(prev.comments || []), newComment],
      } : null);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Tasks</h1>
          <p className="text-muted-foreground mt-1">
            View and manage your assigned tasks
          </p>
        </div>

        <TaskStatsCards stats={stats} />

        <TaskFilters
          statusFilter={statusFilter}
          priorityFilter={priorityFilter}
          searchQuery={searchQuery}
          onStatusChange={setStatusFilter}
          onPriorityChange={setPriorityFilter}
          onSearchChange={setSearchQuery}
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTasks.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">
                {tasks.length === 0 
                  ? 'No tasks assigned to you yet'
                  : 'No tasks found matching your filters'
                }
              </p>
            </div>
          ) : (
            filteredTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => setSelectedTask(task)}
              />
            ))
          )}
        </div>
      </div>

      {selectedTask && (
        <TaskDetailDialog
          open={!!selectedTask}
          onOpenChange={(open) => !open && setSelectedTask(null)}
          task={selectedTask}
          currentUserId={user?.id || ''}
          onUpdateStatus={handleUpdateStatus}
          onAddComment={handleAddComment}
        />
      )}
    </Layout>
  );
}
