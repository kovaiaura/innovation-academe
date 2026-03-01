import { Card, CardContent } from '@/components/ui/card';
import { IndianRupee, ArrowDownLeft, AlertTriangle } from 'lucide-react';
import type { Invoice } from '@/types/invoice';
import type { Payment } from '@/types/payment';
import { useMemo } from 'react';

interface GlobalSummaryCardsProps {
  invoices: Invoice[];
  payments: Payment[];
  loading?: boolean;
}

export function GlobalSummaryCards({ invoices, payments, loading }: GlobalSummaryCardsProps) {
  const stats = useMemo(() => {
    const salesInvoices = invoices.filter(
      inv => inv.invoice_type === 'sales' || inv.invoice_type === 'institution'
    );

    const totalSales = salesInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);

    const salesIds = new Set(salesInvoices.map(inv => inv.id));
    const received = payments
      .filter(p => salesIds.has(p.invoice_id))
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const today = new Date();
    const overdue = salesInvoices
      .filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled' && inv.due_date && new Date(inv.due_date) < today)
      .reduce((sum, inv) => sum + ((inv.total_amount || 0) - (inv.amount_paid || 0)), 0);

    return { totalSales, received, overdue };
  }, [invoices, payments]);

  const cards = [
    {
      title: 'Total Sales',
      value: stats.totalSales,
      icon: IndianRupee,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Received',
      value: stats.received,
      icon: ArrowDownLeft,
      color: 'text-green-600',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Overdue',
      value: stats.overdue,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-500/10',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-6">
              <div className="h-16 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">{card.title}</p>
                <p className="text-xl font-bold">
                  ₹{card.value.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className={`p-2 rounded-full ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
