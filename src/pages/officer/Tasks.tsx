import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Task, TaskStatus, TaskPriority } from '@/types/task';
import { TaskStatsCards } from '@/components/task/TaskStatsCards';
import { TaskFilters } from '@/components/task/TaskFilters';
import { TaskCard } from '@/components/task/TaskCard';
import { TaskDetailDialog } from '@/components/task/TaskDetailDialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { CourseContentTab } from '@/components/officer/CourseContentTab';
import { ClassSelector } from '@/components/officer/ClassSelector';
import { ClassCourseLauncher } from '@/components/officer/ClassCourseLauncher';
import { ClassStudentsList } from '@/components/officer/ClassStudentsList';
import { ClassTeachingReport } from '@/components/officer/ClassTeachingReport';
import { loadTasks, updateTask, getTasksByAssignee, getTaskStats } from '@/data/mockTaskData';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function OfficerTasks() {
  const { tenantId } = useParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('teaching');
  
  // Teaching tab state
  const [teachingSubTab, setTeachingSubTab] = useState('classes');
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedClassName, setSelectedClassName] = useState<string>('');
  const [classSubTab, setClassSubTab] = useState('courses');
  
  // Task allotment state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Get officer ID from the officers table based on user_id
  const { data: officerData } = useQuery({
    queryKey: ['officer-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('officers')
        .select('id, assigned_institutions')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const officerId = officerData?.id;
  const institutionId = officerData?.assigned_institutions?.[0];

  // Load user's tasks for Task Allotment tab
  useEffect(() => {
    refreshTasks();
  }, [user?.id]);

  const refreshTasks = () => {
    if (user?.id) {
      const userTasks = getTasksByAssignee(user.id).filter(
        task => task.assigned_to_role === 'officer'
      );
      setTasks(userTasks);
      setFilteredTasks(userTasks);
    }
  };

  const stats = getTaskStats(user?.id);

  // Apply filters for tasks
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

  const handleSubmitForApproval = (taskId: string) => {
    updateTask(taskId, {
      status: 'submitted_for_approval',
      submitted_at: new Date().toISOString(),
      progress_percentage: 100,
    });
    refreshTasks();
    if (selectedTask?.id === taskId) {
      const updatedTasks = loadTasks();
      const updated = updatedTasks.find(t => t.id === taskId);
      if (updated) setSelectedTask(updated);
    }
    toast.success('Task submitted for approval');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Task</h1>
          <p className="text-muted-foreground mt-2">
            Manage your teaching sessions and assigned tasks
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="teaching">Teaching</TabsTrigger>
            <TabsTrigger value="tasks">Task Allotment</TabsTrigger>
          </TabsList>

          {/* Teaching Tab - Complete CourseManagement workflow */}
          <TabsContent value="teaching" className="space-y-6">
            <Tabs value={teachingSubTab} onValueChange={setTeachingSubTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="classes">Classes</TabsTrigger>
                <TabsTrigger value="content">Course Content</TabsTrigger>
              </TabsList>

              {/* Classes Sub-tab */}
              <TabsContent value="classes" className="space-y-6">
                {!selectedClassId ? (
                  <ClassSelector
                    officerId={officerId}
                    institutionId={institutionId}
                    onClassSelect={(classId, className) => {
                      setSelectedClassId(classId);
                      setSelectedClassName(className);
                      setClassSubTab('courses');
                    }}
                    selectedClassId={selectedClassId || undefined}
                  />
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedClassId(null)}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Classes
                      </Button>
                      <div>
                        <h2 className="text-2xl font-bold">{selectedClassName}</h2>
                        <p className="text-muted-foreground">Class Management</p>
                      </div>
                    </div>

                    <Tabs value={classSubTab} onValueChange={setClassSubTab}>
                      <TabsList>
                        <TabsTrigger value="courses">Courses</TabsTrigger>
                        <TabsTrigger value="students">Students</TabsTrigger>
                        <TabsTrigger value="report">Teaching Report</TabsTrigger>
                      </TabsList>

                      <TabsContent value="courses">
                        <ClassCourseLauncher
                          classId={selectedClassId}
                          className={selectedClassName}
                          officerId={officerId}
                        />
                      </TabsContent>

                      <TabsContent value="students">
                        <ClassStudentsList 
                          classId={selectedClassId}
                          className={selectedClassName}
                        />
                      </TabsContent>

                      <TabsContent value="report">
                        <ClassTeachingReport
                          classId={selectedClassId}
                          className={selectedClassName}
                          officerId={officerId}
                        />
                      </TabsContent>
                    </Tabs>
                  </div>
                )}
              </TabsContent>

              {/* Course Content Sub-tab - View-only mode */}
              <TabsContent value="content" className="space-y-6">
                <CourseContentTab />
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Task Allotment Tab */}
          <TabsContent value="tasks" className="space-y-6">
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
          </TabsContent>
        </Tabs>
      </div>

      {selectedTask && (
        <TaskDetailDialog
          open={!!selectedTask}
          onOpenChange={(open) => !open && setSelectedTask(null)}
          task={selectedTask}
          currentUserId={user?.id || ''}
          onUpdateStatus={handleUpdateStatus}
          onAddComment={handleAddComment}
          onSubmitForApproval={handleSubmitForApproval}
        />
      )}
    </Layout>
  );
}
