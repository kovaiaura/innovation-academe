import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { RevenueData } from "@/data/mockCRMAnalytics";

interface RevenueChartProps {
  data: RevenueData[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(var(--primary))",
    },
    target: {
      label: "Target",
      color: "hsl(var(--muted-foreground))",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Tracking</CardTitle>
        <CardDescription>Monthly revenue vs target performance</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis 
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <ChartTooltip 
              content={<ChartTooltipContent />}
              formatter={(value: number) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Legend />
            <Bar dataKey="revenue" fill="var(--color-revenue)" name="Revenue" radius={[4, 4, 0, 0]} />
            <Bar dataKey="target" fill="var(--color-target)" name="Target" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
