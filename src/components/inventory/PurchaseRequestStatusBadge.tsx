import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, Package, Loader2 } from 'lucide-react';
import { PurchaseRequest } from '@/types/inventory';

interface PurchaseRequestStatusBadgeProps {
  status: PurchaseRequest['status'];
  size?: 'sm' | 'default';
}

export function PurchaseRequestStatusBadge({ status, size = 'default' }: PurchaseRequestStatusBadgeProps) {
  const statusConfig: Record<PurchaseRequest['status'], { icon: React.ReactNode; className: string; label: string }> = {
    pending_system_admin: {
      icon: <Clock className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />,
      className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      label: 'Pending System Admin'
    },
    approved_by_system_admin: {
      icon: <CheckCircle className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />,
      className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      label: 'Forwarded to Institution'
    },
    pending_institution_approval: {
      icon: <Clock className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />,
      className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      label: 'Pending Institution'
    },
    approved_by_institution: {
      icon: <CheckCircle className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />,
      className: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
      label: 'Approved - Ready'
    },
    in_progress: {
      icon: <Loader2 className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} animate-spin`} />,
      className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      label: 'In Progress'
    },
    fulfilled: {
      icon: <CheckCircle className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />,
      className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      label: 'Fulfilled'
    },
    rejected_by_system_admin: {
      icon: <XCircle className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />,
      className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      label: 'Rejected by Admin'
    },
    rejected_by_institution: {
      icon: <XCircle className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />,
      className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      label: 'Rejected by Institution'
    },
  };

  const config = statusConfig[status];

  return (
    <Badge className={`${config.className} gap-1 ${size === 'sm' ? 'text-xs px-2 py-0' : ''}`}>
      {config.icon}
      {config.label}
    </Badge>
  );
}
