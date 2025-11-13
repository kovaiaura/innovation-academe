import { Badge } from '@/components/ui/badge';
import { AssignmentStatus } from '@/types/assignment-management';

interface AssignmentStatusBadgeProps {
  status: AssignmentStatus;
}

export function AssignmentStatusBadge({ status }: AssignmentStatusBadgeProps) {
  const getStatusConfig = (status: AssignmentStatus) => {
    switch (status) {
      case 'draft':
        return { label: 'Draft', variant: 'secondary' as const };
      case 'ongoing':
        return { label: 'Ongoing', variant: 'default' as const };
      case 'upcoming':
        return { label: 'Upcoming', variant: 'outline' as const };
      case 'completed':
        return { label: 'Completed', variant: 'default' as const };
      case 'overdue':
        return { label: 'Overdue', variant: 'destructive' as const };
      default:
        return { label: status, variant: 'secondary' as const };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
}
