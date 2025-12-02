import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Task, TaskStatus } from '@/types/task';
import { TaskStatusBadge } from './TaskStatusBadge';
import { TaskPriorityBadge } from './TaskPriorityBadge';
import { TaskCommentSection } from './TaskCommentSection';
import { ApproveRejectDialog } from './ApproveRejectDialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Calendar, User, Building, Trash2, CheckCircle2, XCircle, Send } from 'lucide-react';
import { format } from 'date-fns';
import { isTaskOverdue, canEditTask, canUpdateStatus, canSubmitForApproval, canApproveTask } from '@/utils/taskHelpers';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface TaskDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  currentUserId: string;
  onUpdateStatus: (taskId: string, status: TaskStatus, progress?: number) => void;
  onAddComment: (taskId: string, comment: string) => void;
  onDeleteTask?: (taskId: string) => void;
  onSubmitForApproval?: (taskId: string) => void;
  onApproveTask?: (taskId: string, approvedBy: string) => void;
  onRejectTask?: (taskId: string, reason: string) => void;
}

const categoryLabels = {
  administrative: 'Administrative',
  operational: 'Operational',
  strategic: 'Strategic',
  technical: 'Technical',
  other: 'Other',
};

export function TaskDetailDialog({
  open,
  onOpenChange,
  task,
  currentUserId,
  onUpdateStatus,
  onAddComment,
  onDeleteTask,
  onSubmitForApproval,
  onApproveTask,
  onRejectTask,
}: TaskDetailDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus>(task.status);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [approvalMode, setApprovalMode] = useState<'approve' | 'reject'>('approve');
  
  const overdue = isTaskOverdue(task);
  const canEdit = canEditTask(task, currentUserId);
  const canUpdate = canUpdateStatus(task, currentUserId);
  const canSubmit = canSubmitForApproval(task, currentUserId);
  const canApprove = canApproveTask(task, currentUserId);
  const isAssignee = task.assigned_to_id === currentUserId;
  const isCreator = task.created_by_id === currentUserId;

  const handleStatusChange = (newStatus: TaskStatus) => {
    setSelectedStatus(newStatus);
    const progress = newStatus === 'completed' ? 100 : task.progress_percentage;
    onUpdateStatus(task.id, newStatus, progress);
    toast.success('Task status updated');
  };

  const handleDelete = () => {
    if (onDeleteTask) {
      onDeleteTask(task.id);
      setShowDeleteDialog(false);
      onOpenChange(false);
      toast.success('Task deleted successfully');
    }
  };

  const handleSubmitForApproval = () => {
    if (onSubmitForApproval) {
      onSubmitForApproval(task.id);
      toast.success('Task submitted for approval');
    }
  };

  const handleApprovalAction = (reason?: string) => {
    if (approvalMode === 'approve' && onApproveTask) {
      onApproveTask(task.id, currentUserId);
      toast.success('Task approved successfully');
    } else if (approvalMode === 'reject' && onRejectTask && reason) {
      onRejectTask(task.id, reason);
      toast.success('Task rejected');
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <DialogTitle className="text-xl">{task.title}</DialogTitle>
              {canEdit && onDeleteTask && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Status and Priority */}
            <div className="flex flex-wrap gap-3">
              <TaskStatusBadge status={task.status} />
              <TaskPriorityBadge priority={task.priority} />
              <Badge variant="outline">{categoryLabels[task.category]}</Badge>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {task.description}
              </p>
            </div>

            <Separator />

            {/* Progress */}
            {task.progress_percentage !== undefined && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">Progress</span>
                  <span className="text-muted-foreground">{task.progress_percentage}%</span>
                </div>
                <Progress value={task.progress_percentage} className="h-2" />
              </div>
            )}

            {/* Status Update for Assignee */}
            {isAssignee && !canApprove && (
              <div className="space-y-2">
                <Label>Update Status</Label>
                <Select value={selectedStatus} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Submit for Approval Button */}
            {canSubmit && onSubmitForApproval && (
              <Button 
                onClick={handleSubmitForApproval} 
                className="w-full"
                variant="default"
              >
                <Send className="h-4 w-4 mr-2" />
                Submit for Approval
              </Button>
            )}

            {/* Approval Actions for Creator */}
            {canApprove && onApproveTask && onRejectTask && (
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setApprovalMode('approve');
                    setShowApproveDialog(true);
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve Task
                </Button>
                <Button
                  onClick={() => {
                    setApprovalMode('reject');
                    setShowRejectDialog(true);
                  }}
                  variant="destructive"
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Task
                </Button>
              </div>
            )}

            {/* Show rejection reason if task was rejected */}
            {task.status === 'rejected' && task.rejection_reason && (
              <div className="space-y-2 p-4 border border-destructive/20 bg-destructive/5 rounded-md">
                <h3 className="font-semibold text-sm text-destructive">Rejection Reason</h3>
                <p className="text-sm text-muted-foreground">{task.rejection_reason}</p>
              </div>
            )}

            <Separator />

            {/* Task Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Assigned To</p>
                    <p className="text-muted-foreground">{task.assigned_to_name}</p>
                    <p className="text-xs text-muted-foreground">{task.assigned_to_position}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Created By</p>
                    <p className="text-muted-foreground">{task.created_by_name}</p>
                    <p className="text-xs text-muted-foreground">{task.created_by_position}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Due Date</p>
                    <p className={overdue ? 'text-destructive' : 'text-muted-foreground'}>
                      {format(new Date(task.due_date), 'MMM d, yyyy')}
                    </p>
                    {overdue && <p className="text-xs text-destructive">Overdue</p>}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Created On</p>
                    <p className="text-muted-foreground">
                      {format(new Date(task.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>

                {task.completed_at && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Completed On</p>
                      <p className="text-muted-foreground">
                        {format(new Date(task.completed_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                )}

                {task.submitted_at && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Submitted For Approval</p>
                      <p className="text-muted-foreground">
                        {format(new Date(task.submitted_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                )}

                {task.approved_at && task.approved_by_name && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Approved By</p>
                      <p className="text-muted-foreground">{task.approved_by_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(task.approved_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Comments */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Comments</h3>
              <TaskCommentSection
                comments={task.comments || []}
                onAddComment={(comment) => onAddComment(task.id, comment)}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ApproveRejectDialog
        open={showApproveDialog}
        onOpenChange={setShowApproveDialog}
        mode="approve"
        onConfirm={handleApprovalAction}
        taskTitle={task.title}
      />

      <ApproveRejectDialog
        open={showRejectDialog}
        onOpenChange={setShowRejectDialog}
        mode="reject"
        onConfirm={handleApprovalAction}
        taskTitle={task.title}
      />
    </>
  );
}
