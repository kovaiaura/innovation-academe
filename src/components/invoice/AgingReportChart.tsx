import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { AgingBucket } from '@/services/invoice-export.service';

interface AgingReportChartProps {
  buckets: AgingBucket[];
  loading?: boolean;
}

const COLORS = ['#22c55e', '#eab308', '#f97316', '#ef4444', '#dc2626'];

export function AgingReportChart({ buckets, loading }: AgingReportChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aging Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  const chartData = buckets.map((bucket, index) => ({
    name: bucket.label,
    amount: bucket.amount,
    count: bucket.count,
    color: COLORS[index],
  }));

  const totalOutstanding = buckets.reduce((sum, b) => sum + b.amount, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Aging Analysis</CardTitle>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Outstanding</p>
            <p className="text-xl font-bold">
              ₹{totalOutstanding.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }} 
                className="fill-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 12 }} 
                className="fill-muted-foreground"
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border rounded-lg shadow-lg p-3">
                        <p className="font-medium">{data.name}</p>
                        <p className="text-sm">
                          Amount: ₹{data.amount.toLocaleString('en-IN')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {data.count} invoice(s)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 justify-center">
          {buckets.map((bucket, index) => (
            <div key={bucket.label} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-sm" 
                style={{ backgroundColor: COLORS[index] }} 
              />
              <span className="text-sm">
                {bucket.label}: {bucket.count} ({((bucket.amount / totalOutstanding) * 100 || 0).toFixed(0)}%)
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
