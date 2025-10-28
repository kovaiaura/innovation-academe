import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, Target, Award, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

const Performance = () => {
  const [period, setPeriod] = useState("monthly");

  const performanceMetrics = [
    {
      id: "1",
      metricName: "Student Pass Rate",
      category: "academic" as const,
      currentValue: 87,
      targetValue: 90,
      trend: "up" as const,
      period: "January 2024",
    },
    {
      id: "2",
      metricName: "Average Attendance",
      category: "attendance" as const,
      currentValue: 92,
      targetValue: 95,
      trend: "stable" as const,
      period: "January 2024",
    },
    {
      id: "3",
      metricName: "Student Engagement Score",
      category: "engagement" as const,
      currentValue: 78,
      targetValue: 85,
      trend: "up" as const,
      period: "January 2024",
    },
    {
      id: "4",
      metricName: "Lab Utilization",
      category: "resource" as const,
      currentValue: 65,
      targetValue: 80,
      trend: "down" as const,
      period: "January 2024",
    },
    {
      id: "5",
      metricName: "Faculty Satisfaction",
      category: "engagement" as const,
      currentValue: 88,
      targetValue: 90,
      trend: "up" as const,
      period: "January 2024",
    },
    {
      id: "6",
      metricName: "Project Completion Rate",
      category: "academic" as const,
      currentValue: 94,
      targetValue: 95,
      trend: "stable" as const,
      period: "January 2024",
    },
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "academic":
        return <Award className="h-5 w-5 text-blue-500" />;
      case "attendance":
        return <Users className="h-5 w-5 text-green-500" />;
      case "engagement":
        return <Target className="h-5 w-5 text-purple-500" />;
      default:
        return <Target className="h-5 w-5 text-orange-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "academic":
        return "bg-blue-500";
      case "attendance":
        return "bg-green-500";
      case "engagement":
        return "bg-purple-500";
      default:
        return "bg-orange-500";
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Performance Metrics</h1>
            <p className="text-muted-foreground">Track and analyze key performance indicators</p>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="annual">Annual</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {performanceMetrics.map((metric) => (
            <Card key={metric.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(metric.category)}
                    <CardTitle className="text-sm font-medium">
                      {metric.metricName}
                    </CardTitle>
                  </div>
                  {getTrendIcon(metric.trend)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-bold">{metric.currentValue}%</span>
                  <span className="text-sm text-muted-foreground">
                    Target: {metric.targetValue}%
                  </span>
                </div>

                <div className="space-y-2">
                  <Progress 
                    value={(metric.currentValue / metric.targetValue) * 100} 
                    className="h-2"
                  />
                  <div className="flex items-center justify-between text-xs">
                    <Badge variant="outline" className="capitalize">
                      {metric.category}
                    </Badge>
                    <span className="text-muted-foreground">{metric.period}</span>
                  </div>
                </div>

                {metric.currentValue < metric.targetValue && (
                  <div className="text-xs text-muted-foreground">
                    {metric.targetValue - metric.currentValue}% below target
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                  <span className="text-sm font-medium">Academic</span>
                </div>
                <p className="text-2xl font-bold">90.5%</p>
                <p className="text-xs text-muted-foreground">Average performance</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="text-sm font-medium">Attendance</span>
                </div>
                <p className="text-2xl font-bold">92%</p>
                <p className="text-xs text-muted-foreground">Average rate</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-purple-500" />
                  <span className="text-sm font-medium">Engagement</span>
                </div>
                <p className="text-2xl font-bold">83%</p>
                <p className="text-xs text-muted-foreground">Average score</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-orange-500" />
                  <span className="text-sm font-medium">Resources</span>
                </div>
                <p className="text-2xl font-bold">65%</p>
                <p className="text-xs text-muted-foreground">Utilization rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Performance;
