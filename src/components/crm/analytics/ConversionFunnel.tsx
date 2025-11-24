import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import { ConversionFunnelStage } from "@/data/mockCRMAnalytics";

interface ConversionFunnelProps {
  data: ConversionFunnelStage[];
}

export function ConversionFunnel({ data }: ConversionFunnelProps) {
  const chartConfig = {
    count: {
      label: "Opportunities",
      color: "hsl(var(--primary))",
    },
  };

  const colors = [
    "hsl(var(--primary))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversion Funnel</CardTitle>
        <CardDescription>Pipeline stage progression and conversion rates</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" />
            <YAxis dataKey="stage" type="category" width={80} />
            <ChartTooltip 
              content={<ChartTooltipContent />}
              formatter={(value: number, name: string, props: any) => [
                `${value} opportunities`,
                `${props.payload.conversionRate.toFixed(1)}% conversion`
              ]}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
        <div className="mt-4 space-y-2">
          {data.map((stage, index) => (
            <div key={stage.stage} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-sm" 
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="font-medium">{stage.stage}</span>
              </div>
              <div className="flex items-center gap-4 text-muted-foreground">
                <span>{stage.count} opportunities</span>
                <span>${(stage.value / 1000000).toFixed(1)}M value</span>
                <span className="font-medium">{stage.conversionRate.toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
