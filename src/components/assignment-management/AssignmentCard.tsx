import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AssignmentStatusBadge } from './AssignmentStatusBadge';
import { StandaloneAssignment } from '@/types/assignment-management';
import { formatDueDate, getDueDateCountdown, getSubmissionTypeLabel } from '@/utils/assignmentHelpers';
import { Calendar, FileText, Users, Eye, Copy, Trash2 } from 'lucide-react';

interface AssignmentCardProps {
  assignment: StandaloneAssignment;
  mode?: 'manage' | 'student-view';
  onView?: (assignment: StandaloneAssignment) => void;
  onDuplicate?: (assignment: StandaloneAssignment) => void;
  onDelete?: (assignment: StandaloneAssignment) => void;
  onStart?: (assignment: StandaloneAssignment) => void;
}

export function AssignmentCard({
  assignment,
  mode = 'manage',
  onView,
  onDuplicate,
  onDelete,
  onStart,
}: AssignmentCardProps) {
  const totalClasses = assignment.publishing.reduce((sum, pub) => sum + pub.class_ids.length, 0);
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{assignment.title}</CardTitle>
            <CardDescription className="mt-1 line-clamp-2">
              {assignment.description}
            </CardDescription>
          </div>
          <AssignmentStatusBadge status={assignment.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDueDate(assignment.due_date, assignment.due_time)}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {assignment.total_points} pts
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">{getSubmissionTypeLabel(assignment.submission_type)}</span>
        </div>

        {mode === 'manage' && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{assignment.total_submissions || 0} submissions</span>
            </div>
            <div>
              <span>{totalClasses} classes</span>
            </div>
          </div>
        )}

        {mode === 'student-view' && assignment.status === 'ongoing' && (
          <div className="text-sm font-medium text-primary">
            {getDueDateCountdown(assignment.due_date, assignment.due_time)}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-wrap gap-2">
        {mode === 'manage' && (
          <>
            <Button variant="outline" size="sm" onClick={() => onView?.(assignment)} className="flex-1 min-w-[90px]">
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button variant="outline" size="sm" onClick={() => onDuplicate?.(assignment)} className="flex-1 min-w-[110px]">
              <Copy className="h-4 w-4 mr-1" />
              Duplicate
            </Button>
            <Button variant="outline" size="sm" onClick={() => onDelete?.(assignment)} className="flex-1 min-w-[90px]">
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </>
        )}

        {mode === 'student-view' && (
          <Button onClick={() => onStart?.(assignment)} className="w-full">
            Start Assignment
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
