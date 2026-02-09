import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, subMonths, parseISO } from 'date-fns';
import type { Invoice, InvoiceType } from '@/types/invoice';
import type { Payment } from '@/types/payment';
import type { AgingBucket } from '@/hooks/useGlobalInvoiceSummary';

interface InvoiceReportSectionProps {
  invoices: Invoice[];
  payments: Payment[];
  invoiceType: 'sales' | 'purchase';
  agingBuckets: AgingBucket[];
}

export function InvoiceReportSection({
  invoices,
  payments,
  invoiceType,
  agingBuckets,
}: InvoiceReportSectionProps) {
  const [reportTab, setReportTab] = useState<string>('monthly');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');

  const isPurchase = invoiceType === 'purchase';
  const invoicedLabel = isPurchase ? 'Bills' : 'Invoiced';
  const collectedLabel = isPurchase ? 'Paid' : 'Collected';

  // Generate monthly data for last 6 months
  const monthlyData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);

      const monthInvoices = invoices.filter(inv => {
        const date = new Date(inv.invoice_date);
        return date >= monthStart && date <= monthEnd;
      });

      const invoiceIds = new Set(invoices.map(inv => inv.id));
      const monthPayments = payments.filter(p => {
        const date = new Date(p.payment_date);
        return date >= monthStart && date <= monthEnd && invoiceIds.has(p.invoice_id);
      });

      months.push({
        month: format(monthDate, 'MMM yy'),
        invoiced: monthInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0),
        collected: monthPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
      });
    }
    return months;
  }, [invoices, payments]);

  // Generate quarterly data for last 4 quarters
  const quarterlyData = useMemo(() => {
    const quarters = [];
    const now = new Date();
    
    for (let i = 3; i >= 0; i--) {
      const quarterDate = subMonths(now, i * 3);
      const qStart = startOfQuarter(quarterDate);
      const qEnd = endOfQuarter(quarterDate);

      const quarterInvoices = invoices.filter(inv => {
        const date = new Date(inv.invoice_date);
        return date >= qStart && date <= qEnd;
      });

      const invoiceIds = new Set(invoices.map(inv => inv.id));
      const quarterPayments = payments.filter(p => {
        const date = new Date(p.payment_date);
        return date >= qStart && date <= qEnd && invoiceIds.has(p.invoice_id);
      });

      const qNum = Math.floor(qStart.getMonth() / 3) + 1;
      quarters.push({
        quarter: `Q${qNum} ${format(qStart, 'yy')}`,
        invoiced: quarterInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0),
        collected: quarterPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
      });
    }
    return quarters;
  }, [invoices, payments]);

  // Custom range data
  const customData = useMemo(() => {
    if (!customStart || !customEnd) return null;

    const start = parseISO(customStart);
    const end = parseISO(customEnd);

    const rangeInvoices = invoices.filter(inv => {
      const date = new Date(inv.invoice_date);
      return date >= start && date <= end;
    });

    const invoiceIds = new Set(invoices.map(inv => inv.id));
    const rangePayments = payments.filter(p => {
      const date = new Date(p.payment_date);
      return date >= start && date <= end && invoiceIds.has(p.invoice_id);
    });

    return {
      invoiced: rangeInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0),
      collected: rangePayments.reduce((sum, p) => sum + (p.amount || 0), 0),
      invoiceCount: rangeInvoices.length,
      paymentCount: rangePayments.length,
    };
  }, [invoices, payments, customStart, customEnd]);

  // Aging chart data
  const agingChartData = useMemo(() => {
    return agingBuckets.map(bucket => ({
      name: bucket.label,
      amount: bucket.amount,
      count: bucket.count,
    }));
  }, [agingBuckets]);

  const formatCurrency = (value: number) => `₹${(value / 1000).toFixed(0)}K`;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">
          {isPurchase ? 'Payables' : 'Receivables'} Report
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={reportTab} onValueChange={setReportTab}>
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
            <TabsTrigger value="aging">Aging</TabsTrigger>
          </TabsList>

          <TabsContent value="monthly" className="mt-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis tickFormatter={formatCurrency} fontSize={12} />
                  <Tooltip
                    formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
                  />
                  <Legend />
                  <Bar 
                    dataKey="invoiced" 
                    name={invoicedLabel} 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="collected" 
                    name={collectedLabel} 
                    fill="hsl(var(--chart-2))" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="quarterly" className="mt-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={quarterlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quarter" fontSize={12} />
                  <YAxis tickFormatter={formatCurrency} fontSize={12} />
                  <Tooltip
                    formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
                  />
                  <Legend />
                  <Bar 
                    dataKey="invoiced" 
                    name={invoicedLabel} 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="collected" 
                    name={collectedLabel} 
                    fill="hsl(var(--chart-2))" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="custom" className="mt-4">
            <div className="space-y-4">
              <div className="flex gap-4 items-end flex-wrap">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={customStart}
                    onChange={e => setCustomStart(e.target.value)}
                    className="w-40"
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={customEnd}
                    onChange={e => setCustomEnd(e.target.value)}
                    className="w-40"
                  />
                </div>
              </div>

              {customData && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">{invoicedLabel}</p>
                    <p className="text-xl font-bold">
                      ₹{customData.invoiced.toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {customData.invoiceCount} {isPurchase ? 'bills' : 'invoices'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{collectedLabel}</p>
                    <p className="text-xl font-bold text-green-600">
                      ₹{customData.collected.toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {customData.paymentCount} payments
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Outstanding</p>
                    <p className="text-xl font-bold text-amber-600">
                      ₹{(customData.invoiced - customData.collected).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Collection %</p>
                    <p className="text-xl font-bold">
                      {customData.invoiced > 0
                        ? ((customData.collected / customData.invoiced) * 100).toFixed(1)
                        : 0}%
                    </p>
                  </div>
                </div>
              )}

              {!customData && (
                <p className="text-muted-foreground text-center py-8">
                  Select a date range to view the report
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="aging" className="mt-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agingChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis tickFormatter={formatCurrency} fontSize={12} />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `₹${value.toLocaleString('en-IN')}`,
                      name === 'amount' ? (isPurchase ? 'Payable' : 'Receivable') : 'Count'
                    ]}
                  />
                  <Bar 
                    dataKey="amount" 
                    name={isPurchase ? 'Amount to Pay' : 'Amount to Receive'}
                    fill="hsl(var(--chart-1))" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-5 gap-2 mt-4">
              {agingBuckets.map((bucket, idx) => (
                <div key={idx} className="text-center p-2 bg-muted/30 rounded">
                  <p className="text-xs text-muted-foreground">{bucket.label}</p>
                  <p className="font-medium text-sm">
                    ₹{bucket.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-xs text-muted-foreground">{bucket.count} items</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
