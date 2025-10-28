import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText, Download, TrendingUp, DollarSign, Shield, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { Layout } from '@/components/layout/Layout';

const mockReports = [
  {
    id: '1',
    title: 'Platform Usage Report',
    type: 'usage' as const,
    period: 'Q4 2024',
    generated_date: '2024-12-01',
    institutions_count: 48,
  },
  {
    id: '2',
    title: 'System Performance Analytics',
    type: 'performance' as const,
    period: 'November 2024',
    generated_date: '2024-11-30',
    institutions_count: 48,
  },
  {
    id: '3',
    title: 'Revenue & Billing Report',
    type: 'financial' as const,
    period: 'Q3 2024',
    generated_date: '2024-10-01',
    institutions_count: 45,
  },
  {
    id: '4',
    title: 'Compliance & Security Audit',
    type: 'compliance' as const,
    period: 'October 2024',
    generated_date: '2024-10-15',
    institutions_count: 48,
  },
];

const reportTypes = [
  {
    value: 'usage',
    label: 'Platform Usage',
    description: 'User activity, feature adoption, and engagement metrics',
    icon: Activity,
  },
  {
    value: 'performance',
    label: 'System Performance',
    description: 'Uptime, response times, and system health metrics',
    icon: TrendingUp,
  },
  {
    value: 'financial',
    label: 'Revenue & Billing',
    description: 'Financial reports, billing, and subscription analytics',
    icon: DollarSign,
  },
  {
    value: 'compliance',
    label: 'Compliance & Security',
    description: 'Security audits, data privacy, and compliance reports',
    icon: Shield,
  },
];

export default function SystemAdminReports() {
  const [reports] = useState(mockReports);
  const [selectedType, setSelectedType] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');

  const handleGenerateReport = () => {
    if (!selectedType || !selectedPeriod) {
      toast.error('Please select report type and period');
      return;
    }
    toast.success('Report generation started! You will be notified when ready.');
  };

  const handleDownloadReport = (reportTitle: string) => {
    toast.success(`Downloading ${reportTitle}...`);
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, string> = {
      usage: 'bg-blue-500/10 text-blue-500',
      performance: 'bg-green-500/10 text-green-500',
      financial: 'bg-purple-500/10 text-purple-500',
      compliance: 'bg-orange-500/10 text-orange-500',
    };
    return variants[type] || variants.usage;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">System Reports</h1>
          <p className="text-muted-foreground">Generate and download system-wide reports</p>
        </div>

        {/* Generate New Report */}
        <Card>
          <CardHeader>
            <CardTitle>Generate New Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Report Type</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Period</label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024-q4">Q4 2024</SelectItem>
                    <SelectItem value="2024-q3">Q3 2024</SelectItem>
                    <SelectItem value="nov-2024">November 2024</SelectItem>
                    <SelectItem value="oct-2024">October 2024</SelectItem>
                    <SelectItem value="sep-2024">September 2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={handleGenerateReport} className="w-full">
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Templates */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Report Templates</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {reportTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Card
                  key={type.value}
                  className="hover:border-primary cursor-pointer transition-colors"
                  onClick={() => setSelectedType(type.value)}
                >
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{type.label}</p>
                        <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Recent Reports */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Reports</h2>
          <div className="grid gap-4">
            {reports.map((report) => (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{report.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getTypeBadge(report.type)}>{report.type}</Badge>
                          <span className="text-sm text-muted-foreground">
                            Period: {report.period}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Generated on {new Date(report.generated_date).toLocaleDateString()} •{' '}
                          {report.institutions_count} institutions
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadReport(report.title)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
