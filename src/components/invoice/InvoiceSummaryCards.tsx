import { Card, CardContent } from '@/components/ui/card';
import { 
  IndianRupee, 
  TrendingUp, 
  TrendingDown,
  Clock, 
  AlertTriangle, 
  FileCheck,
  Receipt,
  FileText
} from 'lucide-react';
import type { InvoiceSummary } from '@/services/invoice-export.service';
import type { InvoiceType } from '@/types/invoice';

interface InvoiceSummaryCardsProps {
  summary: InvoiceSummary;
  loading?: boolean;
  invoiceType?: InvoiceType;
}

export function InvoiceSummaryCards({ summary, loading, invoiceType = 'institution' }: InvoiceSummaryCardsProps) {
  const isPurchase = invoiceType === 'purchase';
  
  // Configure cards based on invoice type
  const cards = isPurchase 
    ? [
        {
          title: 'Total Bills',
          value: summary.total_invoiced,
          icon: FileText,
          color: 'text-blue-600',
          bgColor: 'bg-blue-500/10',
          subtitle: `${summary.invoice_count} vendor bills`,
        },
        {
          title: 'Outstanding',
          value: summary.total_outstanding,
          icon: Clock,
          color: 'text-amber-600',
          bgColor: 'bg-amber-500/10',
          subtitle: 'Balance to pay',
        },
        {
          title: 'Amount Paid',
          value: summary.total_collected,
          icon: TrendingDown,
          color: 'text-green-600',
          bgColor: 'bg-green-500/10',
          subtitle: `${summary.paid_count} settled`,
        },
        {
          title: 'Overdue',
          value: summary.total_overdue,
          icon: AlertTriangle,
          color: 'text-red-600',
          bgColor: 'bg-red-500/10',
          subtitle: `${summary.overdue_count} overdue`,
        },
        {
          title: 'TDS Deducted',
          value: summary.tds_deducted,
          icon: FileCheck,
          color: 'text-purple-600',
          bgColor: 'bg-purple-500/10',
          subtitle: 'By us',
        },
      ]
    : [
        {
          title: 'Total Invoiced',
          value: summary.total_invoiced,
          icon: Receipt,
          color: 'text-blue-600',
          bgColor: 'bg-blue-500/10',
          subtitle: `${summary.invoice_count} invoices`,
        },
        {
          title: 'Outstanding',
          value: summary.total_outstanding,
          icon: Clock,
          color: 'text-amber-600',
          bgColor: 'bg-amber-500/10',
          subtitle: 'Balance due',
        },
        {
          title: 'Collected',
          value: summary.total_collected,
          icon: TrendingUp,
          color: 'text-green-600',
          bgColor: 'bg-green-500/10',
          subtitle: `${summary.paid_count} paid`,
        },
        {
          title: 'Overdue',
          value: summary.total_overdue,
          icon: AlertTriangle,
          color: 'text-red-600',
          bgColor: 'bg-red-500/10',
          subtitle: `${summary.overdue_count} overdue`,
        },
        {
          title: 'TDS Receivable',
          value: summary.tds_receivable,
          icon: FileCheck,
          color: 'text-purple-600',
          bgColor: 'bg-purple-500/10',
          subtitle: 'Client deducted',
        },
      ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map(i => (
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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p className="text-2xl font-bold">
                  ₹{card.value.toLocaleString('en-IN', { 
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0 
                  })}
                </p>
                <p className="text-xs text-muted-foreground">{card.subtitle}</p>
              </div>
              <div className={`p-2 rounded-full ${card.bgColor}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
