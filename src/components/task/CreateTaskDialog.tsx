import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Task, TaskPriority, TaskCategory } from '@/types/task';
import { toast } from 'sonner';

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTask: (taskData: Omit<Task, 'id' | 'created_at' | 'status' | 'comments'>) => void;
  currentUser: {
    id: string;
    name: string;
    position: string;
  };
}

// Mock assignees - in real app, fetch from API
const mockAssignees = [
  { id: '7', name: 'Managing Director', position_name: 'md', role: 'system_admin' },
  { id: '8', name: 'Operations Manager', position_name: 'manager', role: 'system_admin' },
  { id: '9', name: 'AGM Operations', position_name: 'agm', role: 'system_admin' },
  { id: '10', name: 'General Manager', position_name: 'gm', role: 'system_admin' },
  { id: '11', name: 'Admin Staff', position_name: 'admin_staff', role: 'system_admin' },
  { id: 'off-msd-001', name: 'Mr. Atif Ansari', position_name: 'Innovation Officer', role: 'officer' },
  { id: 'off-kga-001', name: 'Mr. Saran T', position_name: 'Sr. Innovation Officer', role: 'officer' },
  { id: 'off-kga-002', name: 'Mr. Sreeram R', position_name: 'Innovation Officer', role: 'officer' },
];

export function CreateTaskDialog({ open, onOpenChange, onCreateTask, currentUser }: CreateTaskDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'administrative' as TaskCategory,
    priority: 'medium' as TaskPriority,
    assigned_to_id: '',
    due_date: '',
  });

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a task title');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Please enter a task description');
      return;
    }
    if (!formData.assigned_to_id) {
      toast.error('Please select an assignee');
      return;
    }
    if (!formData.due_date) {
      toast.error('Please select a due date');
      return;
    }

    const assignee = mockAssignees.find(a => a.id === formData.assigned_to_id);
    if (!assignee) return;

    const taskData: Omit<Task, 'id' | 'created_at' | 'status' | 'comments'> = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      priority: formData.priority,
      created_by_id: currentUser.id,
      created_by_name: currentUser.name,
      created_by_position: currentUser.position,
      assigned_to_id: assignee.id,
      assigned_to_name: assignee.name,
      assigned_to_position: assignee.position_name || '',
      assigned_to_role: assignee.role,
      due_date: new Date(formData.due_date).toISOString(),
      progress_percentage: 0,
    };

    onCreateTask(taskData);
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      category: 'administrative',
      priority: 'medium',
      assigned_to_id: '',
      due_date: '',
    });
    
    onOpenChange(false);
    toast.success('Task created successfully');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              placeholder="Enter task title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Enter task description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as TaskCategory }))}
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="administrative">Administrative</SelectItem>
                  <SelectItem value="operational">Operational</SelectItem>
                  <SelectItem value="strategic">Strategic</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as TaskPriority }))}
              >
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignee">Assign To *</Label>
            <Select
              value={formData.assigned_to_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, assigned_to_id: value }))}
            >
              <SelectTrigger id="assignee">
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent>
                {mockAssignees.map((assignee) => (
                  <SelectItem key={assignee.id} value={assignee.id}>
                    {assignee.name} ({assignee.position_name || assignee.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="due_date">Due Date *</Label>
            <Input
              id="due_date"
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Create Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
