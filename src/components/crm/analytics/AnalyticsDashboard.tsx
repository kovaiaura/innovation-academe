import { MetricsOverview } from "./MetricsOverview";
import { RevenueChart } from "./RevenueChart";
import { ConversionFunnel } from "./ConversionFunnel";
import { CustomerHealthScores } from "./CustomerHealthScores";
import {
  mockSalesMetrics,
  mockRevenueData,
  mockConversionFunnel,
  mockCustomerHealthScores,
} from "@/data/mockCRMAnalytics";

export function AnalyticsDashboard() {
  return (
    <div className="space-y-6">
      <MetricsOverview metrics={mockSalesMetrics} />
      
      <div className="grid gap-6 md:grid-cols-2">
        <RevenueChart data={mockRevenueData} />
        <ConversionFunnel data={mockConversionFunnel} />
      </div>

      <CustomerHealthScores customers={mockCustomerHealthScores} />
    </div>
  );
}
