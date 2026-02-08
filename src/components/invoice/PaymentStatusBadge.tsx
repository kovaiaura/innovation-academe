import { Badge } from '@/components/ui/badge';
import type { PaymentStatus } from '@/types/invoice';

interface PaymentStatusBadgeProps {
  status: PaymentStatus | string | undefined;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  unpaid: { label: 'Unpaid', className: 'bg-muted text-muted-foreground' },
  partial: { label: 'Partial', className: 'bg-amber-500/10 text-amber-600' },
  paid: { label: 'Paid', className: 'bg-green-500/10 text-green-600' },
};

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  const config = statusConfig[status || 'unpaid'] || statusConfig.unpaid;
  
  return (
    <Badge className={config.className}>
      {config.label}
    </Badge>
  );
}
