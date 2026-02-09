import { Card, CardContent } from '@/components/ui/card';
import { 
  TrendingUp, 
  TrendingDown,
  ShoppingCart,
  Package,
  Receipt,
  FileCheck
} from 'lucide-react';
import type { GlobalInvoiceSummary } from '@/hooks/useGlobalInvoiceSummary';

interface GlobalSummaryCardsProps {
  summary: GlobalInvoiceSummary;
  loading?: boolean;
}

export function GlobalSummaryCards({ summary, loading }: GlobalSummaryCardsProps) {
  const cards = [
    {
      title: 'Sales Bill Total',
      value: summary.sales_total,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10',
      subtitle: `${summary.sales_count} invoices`,
    },
    {
      title: 'Purchase Bill Total',
      value: summary.purchase_total,
      icon: Package,
      color: 'text-orange-600',
      bgColor: 'bg-orange-500/10',
      subtitle: `${summary.purchase_count} bills`,
    },
    {
      title: 'Payments Made',
      value: summary.payments_made,
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-500/10',
      subtitle: 'For purchases',
    },
    {
      title: 'Payments Received',
      value: summary.payments_received,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-500/10',
      subtitle: 'From sales',
    },
    {
      title: 'TDS We Deducted',
      value: summary.tds_we_deducted,
      icon: FileCheck,
      color: 'text-purple-600',
      bgColor: 'bg-purple-500/10',
      subtitle: 'Self-deducted',
    },
    {
      title: 'TDS Client Deducted',
      value: summary.tds_client_deducted,
      icon: Receipt,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-500/10',
      subtitle: 'Receivable',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-6">
              <div className="h-20 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1 min-w-0">
                <p className="text-xs text-muted-foreground truncate">{card.title}</p>
                <p className="text-lg font-bold truncate">
                  ₹{card.value.toLocaleString('en-IN', { 
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0 
                  })}
                </p>
                <p className="text-xs text-muted-foreground">{card.subtitle}</p>
              </div>
              <div className={`p-1.5 rounded-full ${card.bgColor} flex-shrink-0`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
