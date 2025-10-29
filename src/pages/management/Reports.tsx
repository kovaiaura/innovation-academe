import { Layout } from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Calendar, Filter, Plus, TrendingUp } from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { InstitutionHeader } from "@/components/management/InstitutionHeader";

// Import Performance component content
const PerformanceAnalyticsTab = () => {
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
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Performance Analytics</h2>
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
              <CardTitle className="text-sm font-medium">{metric.metricName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold">{metric.currentValue}%</span>
                <span className="text-sm text-muted-foreground">
                  Target: {metric.targetValue}%
                </span>
              </div>
              <Badge variant="outline" className="capitalize">
                {metric.category}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const MonthlyReportsTab = () => {
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const reports = [
    {
      id: "1",
      title: "January 2024 Department Performance",
      type: "monthly" as const,
      generatedDate: "2024-01-31",
      status: "published" as const,
      downloadUrl: "#",
    },
    {
      id: "2",
      title: "Q4 2023 Academic Overview",
      type: "quarterly" as const,
      generatedDate: "2024-01-15",
      status: "published" as const,
      downloadUrl: "#",
    },
    {
      id: "3",
      title: "Annual Performance Report 2023",
      type: "annual" as const,
      generatedDate: "2024-01-10",
      status: "published" as const,
      downloadUrl: "#",
    },
    {
      id: "4",
      title: "February 2024 Department Performance",
      type: "monthly" as const,
      generatedDate: "2024-02-05",
      status: "draft" as const,
      downloadUrl: "#",
    },
  ];

  const filteredReports = reports.filter((report) => {
    const matchesType = typeFilter === "all" || report.type === typeFilter;
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    return matchesType && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      published: "default",
      draft: "secondary",
      archived: "outline",
    } as const;
    return variants[status as keyof typeof variants] || "secondary";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Monthly Reports</h2>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate New Report</DialogTitle>
                <DialogDescription>
                  Select the report type and parameters to generate a new department report.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="report-type">Report Type</Label>
                  <Select>
                    <SelectTrigger id="report-type">
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly Performance</SelectItem>
                      <SelectItem value="quarterly">Quarterly Overview</SelectItem>
                      <SelectItem value="annual">Annual Summary</SelectItem>
                      <SelectItem value="custom">Custom Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select>
                    <SelectTrigger id="department">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      <SelectItem value="cs">Computer Science</SelectItem>
                      <SelectItem value="ec">Electronics</SelectItem>
                      <SelectItem value="me">Mechanical</SelectItem>
                      <SelectItem value="ce">Civil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="period">Period</Label>
                  <Select>
                    <SelectTrigger id="period">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="current">Current Month</SelectItem>
                      <SelectItem value="previous">Previous Month</SelectItem>
                      <SelectItem value="quarter">Current Quarter</SelectItem>
                      <SelectItem value="year">Current Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Generate Report</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Reports</CardTitle>
              <div className="flex gap-2">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <Card key={report.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <FileText className="h-10 w-10 text-blue-500" />
                        <div className="space-y-1 flex-1">
                          <h3 className="font-semibold">{report.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {report.generatedDate}
                            </div>
                            <Badge variant={getStatusBadge(report.status)}>
                              {report.status}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {report.type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
    </div>
  );
};

const ExportDataTab = () => {
  const exportOptions = [
    {
      id: "1",
      title: "Student Data Export",
      description: "Export all student records with attendance and grades",
      formats: ["PDF", "CSV", "Excel"],
    },
    {
      id: "2",
      title: "Faculty Performance Export",
      description: "Export faculty performance metrics and evaluations",
      formats: ["PDF", "Excel"],
    },
    {
      id: "3",
      title: "Course Analytics Export",
      description: "Export course completion rates and engagement data",
      formats: ["PDF", "CSV", "Excel"],
    },
    {
      id: "4",
      title: "Financial Reports Export",
      description: "Export budget allocation and expenditure reports",
      formats: ["PDF", "Excel"],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Export Data</h2>
          <p className="text-muted-foreground">Download reports in PDF, CSV, or Excel format</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {exportOptions.map((option) => (
          <Card key={option.id}>
            <CardHeader>
              <CardTitle className="text-lg">{option.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{option.description}</p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {option.formats.map((format) => (
                  <Button key={format} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export as {format}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const Reports = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <InstitutionHeader />
        
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Performance analytics, reports, and data exports</p>
        </div>

        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
            <TabsTrigger value="reports">Monthly Reports</TabsTrigger>
            <TabsTrigger value="export">Export Data</TabsTrigger>
          </TabsList>
          <TabsContent value="analytics" className="mt-6">
            <PerformanceAnalyticsTab />
          </TabsContent>
          <TabsContent value="reports" className="mt-6">
            <MonthlyReportsTab />
          </TabsContent>
          <TabsContent value="export" className="mt-6">
            <ExportDataTab />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Reports;
