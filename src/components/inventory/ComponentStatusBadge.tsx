import { Badge } from '@/components/ui/badge';
import { ProjectComponent } from '@/types/inventory';

interface ComponentStatusBadgeProps {
  status: ProjectComponent['status'];
}

export const ComponentStatusBadge = ({ status }: ComponentStatusBadgeProps) => {
  const variants: Record<ProjectComponent['status'], { className: string; label: string }> = {
    needed: { className: 'bg-gray-500/10 text-gray-700 border-gray-300', label: 'Needed' },
    requested: { className: 'bg-blue-500/10 text-blue-700 border-blue-300', label: 'Requested' },
    approved: { className: 'bg-green-500/10 text-green-700 border-green-300', label: 'Approved' },
    purchased: { className: 'bg-purple-500/10 text-purple-700 border-purple-300', label: 'Purchased' },
    received: { className: 'bg-emerald-500/10 text-emerald-700 border-emerald-300', label: 'Received' }
  };

  const variant = variants[status];
  
  return (
    <Badge variant="outline" className={variant.className}>
      {variant.label}
    </Badge>
  );
};
