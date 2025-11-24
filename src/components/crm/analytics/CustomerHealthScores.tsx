import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CustomerHealthScore } from "@/data/mockCRMAnalytics";
import { AlertTriangle, CheckCircle, AlertCircle, XCircle } from "lucide-react";

interface CustomerHealthScoresProps {
  customers: CustomerHealthScore[];
}

export function CustomerHealthScores({ customers }: CustomerHealthScoresProps) {
  const getStatusConfig = (status: CustomerHealthScore["status"]) => {
    switch (status) {
      case "excellent":
        return {
          icon: CheckCircle,
          color: "text-green-500",
          bgColor: "bg-green-500/10",
          label: "Excellent",
          variant: "default" as const,
        };
      case "good":
        return {
          icon: CheckCircle,
          color: "text-blue-500",
          bgColor: "bg-blue-500/10",
          label: "Good",
          variant: "secondary" as const,
        };
      case "warning":
        return {
          icon: AlertCircle,
          color: "text-yellow-500",
          bgColor: "bg-yellow-500/10",
          label: "Warning",
          variant: "outline" as const,
        };
      case "critical":
        return {
          icon: XCircle,
          color: "text-red-500",
          bgColor: "bg-red-500/10",
          label: "Critical",
          variant: "destructive" as const,
        };
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-blue-500";
    if (score >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Health Scores</CardTitle>
        <CardDescription>Monitor customer satisfaction and renewal risk</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {customers.map((customer) => {
            const statusConfig = getStatusConfig(customer.status);
            const StatusIcon = statusConfig.icon;

            return (
              <div 
                key={customer.id}
                className="border rounded-lg p-4 space-y-3 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-semibold">{customer.institutionName}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{formatCurrency(customer.contractValue)}</span>
                      <span>•</span>
                      <span>Renewal: {formatDate(customer.renewalDate)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`h-4 w-4 ${statusConfig.color}`} />
                    <Badge variant={statusConfig.variant} className={statusConfig.bgColor}>
                      {statusConfig.label}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Health Score</span>
                    <span className="font-semibold">{customer.healthScore}/100</span>
                  </div>
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className={`h-full transition-all ${getHealthColor(customer.healthScore)}`}
                      style={{ width: `${customer.healthScore}%` }}
                    />
                  </div>
                </div>

                {customer.riskFactors.length > 0 && (
                  <div className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                      <span className="font-medium text-yellow-500">Risk Factors:</span>
                      <div className="flex flex-wrap gap-1">
                        {customer.riskFactors.map((risk, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {risk}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  Last engagement: {formatDate(customer.lastEngagement)}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
