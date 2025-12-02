import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Task, TaskStatus, TaskPriority } from '@/types/task';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TaskStatsCards } from '@/components/task/TaskStatsCards';
import { TaskFilters } from '@/components/task/TaskFilters';
import { TaskCard } from '@/components/task/TaskCard';
import { CreateTaskDialog } from '@/components/task/CreateTaskDialog';
import { TaskDetailDialog } from '@/components/task/TaskDetailDialog';
import { Button } from '@/components/ui/button';
import { Plus, AlertCircle } from 'lucide-react';
import { loadTasks, saveTasks, addTask, updateTask, deleteTask, getTaskStats, getTasksByCreator, getTasksPendingApproval } from '@/data/mockTaskData';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { canAccessFeature } from '@/utils/permissionHelpers';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function TaskManagement() {
  const { user } = useAuth();

  // Check if user has task_management feature
  if (!canAccessFeature(user, 'task_management')) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              You do not have permission to create or manage tasks. Contact your administrator for access.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'created' | 'pending'>('all');
  
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Load tasks on mount
  useEffect(() => {
    refreshTasks();
  }, []);

  const refreshTasks = () => {
    setTasks(loadTasks());
  };

  const stats = getTaskStats();
  const pendingApprovalCount = user?.id ? getTasksPendingApproval(user.id).length : 0;

  // Get unique assignees
  const assignees = Array.from(
    new Map(tasks.map(task => [task.assigned_to_id, { id: task.assigned_to_id, name: task.assigned_to_name }])).values()
  );

  // Apply filters
  useEffect(() => {
    let filtered = tasks;

    // Tab-based filtering
    if (activeTab === 'created' && user?.id) {
      filtered = filtered.filter(task => task.created_by_id === user.id);
    } else if (activeTab === 'pending' && user?.id) {
      filtered = filtered.filter(
        task => task.created_by_id === user.id && task.status === 'submitted_for_approval'
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    if (assigneeFilter !== 'all') {
      filtered = filtered.filter(task => task.assigned_to_id === assigneeFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query)
      );
    }

    setFilteredTasks(filtered);
  }, [tasks, statusFilter, priorityFilter, assigneeFilter, searchQuery, activeTab, user?.id]);

  const handleCreateTask = (taskData: Omit<Task, 'id' | 'created_at' | 'status' | 'comments'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      created_at: new Date().toISOString(),
      status: 'pending',
      comments: [],
    };
    addTask(newTask);
    refreshTasks();
    toast.success('Task created successfully');
  };

  const handleUpdateStatus = (taskId: string, status: TaskStatus, progress?: number) => {
    updateTask(taskId, {
      status,
      progress_percentage: progress !== undefined ? progress : undefined,
      completed_at: status === 'completed' ? new Date().toISOString() : undefined,
    });
    
    refreshTasks();
    
    if (selectedTask?.id === taskId) {
      const updatedTasks = loadTasks();
      const updated = updatedTasks.find(t => t.id === taskId);
      if (updated) setSelectedTask(updated);
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

    const task = loadTasks().find(t => t.id === taskId);
    if (task) {
      updateTask(taskId, {
        comments: [...(task.comments || []), newComment],
      });
      refreshTasks();
      
      if (selectedTask?.id === taskId) {
        const updatedTasks = loadTasks();
        const updated = updatedTasks.find(t => t.id === taskId);
        if (updated) setSelectedTask(updated);
      }
    }
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
    refreshTasks();
    toast.success('Task deleted successfully');
  };

  const handleApproveTask = (taskId: string, approvedById: string) => {
    const approver = user;
    updateTask(taskId, {
      status: 'completed',
      completed_at: new Date().toISOString(),
      approved_by_id: approvedById,
      approved_by_name: approver?.name || '',
      approved_at: new Date().toISOString(),
    });
    refreshTasks();
    if (selectedTask?.id === taskId) {
      const updatedTasks = loadTasks();
      const updated = updatedTasks.find(t => t.id === taskId);
      if (updated) setSelectedTask(updated);
    }
  };

  const handleRejectTask = (taskId: string, reason: string) => {
    updateTask(taskId, {
      status: 'rejected',
      rejection_reason: reason,
    });
    refreshTasks();
    if (selectedTask?.id === taskId) {
      const updatedTasks = loadTasks();
      const updated = updatedTasks.find(t => t.id === taskId);
      if (updated) setSelectedTask(updated);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Task Management</h1>
            <p className="text-muted-foreground mt-1">
              Create, assign, and manage tasks across your organization
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Task
          </Button>
        </div>

        <TaskStatsCards stats={stats} />

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Tasks</TabsTrigger>
            <TabsTrigger value="created">Created by Me</TabsTrigger>
            <TabsTrigger value="pending">
              Pending Approval
              {pendingApprovalCount > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-orange-500 text-white rounded-full">
                  {pendingApprovalCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">

        <TaskFilters
          statusFilter={statusFilter}
          priorityFilter={priorityFilter}
          searchQuery={searchQuery}
          onStatusChange={setStatusFilter}
          onPriorityChange={setPriorityFilter}
          onSearchChange={setSearchQuery}
          showAssigneeFilter
          assigneeFilter={assigneeFilter}
          onAssigneeChange={setAssigneeFilter}
          assignees={assignees}
        />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTasks.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No tasks found</p>
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
          </TabsContent>
        </Tabs>
      </div>

      <CreateTaskDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreateTask={handleCreateTask}
        currentUser={{
          id: user?.id || '',
          name: user?.name || '',
          position: user?.position_name || 'CEO',
        }}
      />

      {selectedTask && (
        <TaskDetailDialog
          open={!!selectedTask}
          onOpenChange={(open) => !open && setSelectedTask(null)}
          task={selectedTask}
          currentUserId={user?.id || ''}
          onUpdateStatus={handleUpdateStatus}
          onAddComment={handleAddComment}
          onDeleteTask={handleDeleteTask}
          onApproveTask={handleApproveTask}
          onRejectTask={handleRejectTask}
        />
      )}
    </Layout>
  );
}
