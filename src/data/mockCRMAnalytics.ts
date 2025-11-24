export interface SalesMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  activeDeals: number;
  wonDeals: number;
  conversionRate: number;
  averageDealSize: number;
  averageDealCycle: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
  target: number;
}

export interface ConversionFunnelStage {
  stage: string;
  count: number;
  value: number;
  conversionRate: number;
}

export interface CustomerHealthScore {
  id: string;
  institutionName: string;
  healthScore: number;
  status: "excellent" | "good" | "warning" | "critical";
  lastEngagement: string;
  contractValue: number;
  renewalDate: string;
  riskFactors: string[];
}

export const mockSalesMetrics: SalesMetrics = {
  totalRevenue: 2450000,
  monthlyRevenue: 340000,
  revenueGrowth: 23.5,
  activeDeals: 45,
  wonDeals: 28,
  conversionRate: 34.2,
  averageDealSize: 87500,
  averageDealCycle: 45,
};

export const mockRevenueData: RevenueData[] = [
  { month: "Jan", revenue: 280000, target: 250000 },
  { month: "Feb", revenue: 295000, target: 270000 },
  { month: "Mar", revenue: 310000, target: 290000 },
  { month: "Apr", revenue: 325000, target: 300000 },
  { month: "May", revenue: 340000, target: 320000 },
  { month: "Jun", revenue: 360000, target: 340000 },
  { month: "Jul", revenue: 285000, target: 350000 },
  { month: "Aug", revenue: 315000, target: 360000 },
  { month: "Sep", revenue: 340000, target: 370000 },
];

export const mockConversionFunnel: ConversionFunnelStage[] = [
  { stage: "Lead", count: 120, value: 12000000, conversionRate: 100 },
  { stage: "Demo", count: 85, value: 8500000, conversionRate: 70.8 },
  { stage: "Proposal", count: 52, value: 5200000, conversionRate: 61.2 },
  { stage: "Contract", count: 28, value: 2450000, conversionRate: 53.8 },
];

export const mockCustomerHealthScores: CustomerHealthScore[] = [
  {
    id: "1",
    institutionName: "Harvard University",
    healthScore: 95,
    status: "excellent",
    lastEngagement: "2024-01-15",
    contractValue: 450000,
    renewalDate: "2024-12-31",
    riskFactors: [],
  },
  {
    id: "2",
    institutionName: "Stanford University",
    healthScore: 88,
    status: "good",
    lastEngagement: "2024-01-10",
    contractValue: 380000,
    renewalDate: "2025-03-15",
    riskFactors: [],
  },
  {
    id: "3",
    institutionName: "MIT",
    healthScore: 72,
    status: "warning",
    lastEngagement: "2023-12-20",
    contractValue: 420000,
    renewalDate: "2024-06-30",
    riskFactors: ["Low engagement", "Upcoming renewal"],
  },
  {
    id: "4",
    institutionName: "Yale University",
    healthScore: 45,
    status: "critical",
    lastEngagement: "2023-11-15",
    contractValue: 290000,
    renewalDate: "2024-04-30",
    riskFactors: ["No recent engagement", "Pricing concerns", "Renewal at risk"],
  },
  {
    id: "5",
    institutionName: "Princeton University",
    healthScore: 91,
    status: "excellent",
    lastEngagement: "2024-01-18",
    contractValue: 350000,
    renewalDate: "2025-01-31",
    riskFactors: [],
  },
  {
    id: "6",
    institutionName: "Columbia University",
    healthScore: 68,
    status: "warning",
    lastEngagement: "2023-12-28",
    contractValue: 310000,
    renewalDate: "2024-08-15",
    riskFactors: ["Decreased usage"],
  },
];
