import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Target, Users, Clock } from "lucide-react";
import { SalesMetrics } from "@/data/mockCRMAnalytics";

interface MetricsOverviewProps {
  metrics: SalesMetrics;
}

export function MetricsOverview({ metrics }: MetricsOverviewProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const metricCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(metrics.totalRevenue),
      icon: DollarSign,
      trend: metrics.revenueGrowth,
      trendLabel: "vs last period",
    },
    {
      title: "Monthly Revenue",
      value: formatCurrency(metrics.monthlyRevenue),
      icon: TrendingUp,
      trend: metrics.revenueGrowth,
      trendLabel: "growth",
    },
    {
      title: "Active Deals",
      value: metrics.activeDeals.toString(),
      icon: Target,
      subtitle: `${metrics.wonDeals} won deals`,
    },
    {
      title: "Conversion Rate",
      value: `${metrics.conversionRate}%`,
      icon: Users,
      subtitle: "lead to customer",
    },
    {
      title: "Avg Deal Size",
      value: formatCurrency(metrics.averageDealSize),
      icon: DollarSign,
      subtitle: "per contract",
    },
    {
      title: "Avg Deal Cycle",
      value: `${metrics.averageDealCycle} days`,
      icon: Clock,
      subtitle: "time to close",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {metricCards.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {metric.title}
            </CardTitle>
            <metric.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            {metric.trend !== undefined && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                {metric.trend >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span className={metric.trend >= 0 ? "text-green-500" : "text-red-500"}>
                  {metric.trend > 0 ? "+" : ""}{metric.trend}%
                </span>
                {metric.trendLabel}
              </p>
            )}
            {metric.subtitle && (
              <p className="text-xs text-muted-foreground mt-1">
                {metric.subtitle}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
