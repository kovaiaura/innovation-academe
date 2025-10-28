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
import { FileText, Download, Calendar, TrendingUp, Users, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { Layout } from '@/components/layout/Layout';

const mockReports = [
  {
    id: '1',
    title: 'Student Enrollment Report',
    type: 'enrollment' as const,
    period: '2024-Q4',
    generated_date: '2024-12-01',
  },
  {
    id: '2',
    title: 'Academic Performance Analysis',
    type: 'academic' as const,
    period: '2024 Semester 1',
    generated_date: '2024-11-28',
  },
  {
    id: '3',
    title: 'Faculty Attendance Report',
    type: 'attendance' as const,
    period: 'November 2024',
    generated_date: '2024-11-25',
  },
  {
    id: '4',
    title: 'Department Performance Report',
    type: 'performance' as const,
    period: '2024-Q3',
    generated_date: '2024-10-15',
  },
];

const reportTypes = [
  { value: 'enrollment', label: 'Enrollment Report', icon: Users },
  { value: 'academic', label: 'Academic Performance', icon: TrendingUp },
  { value: 'attendance', label: 'Attendance Report', icon: Calendar },
  { value: 'performance', label: 'Department Performance', icon: BookOpen },
];

export default function Reports() {
  const [reports] = useState(mockReports);
  const [selectedType, setSelectedType] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');

  const handleGenerateReport = () => {
    if (!selectedType || !selectedPeriod) {
      toast.error('Please select report type and period');
      return;
    }
    toast.success('Report generated successfully!');
  };

  const handleDownloadReport = (reportTitle: string) => {
    toast.success(`Downloading ${reportTitle}...`);
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, string> = {
      enrollment: 'bg-blue-500/10 text-blue-500',
      academic: 'bg-green-500/10 text-green-500',
      attendance: 'bg-yellow-500/10 text-yellow-500',
      performance: 'bg-purple-500/10 text-purple-500',
    };
    return variants[type] || variants.enrollment;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">Generate and download institutional reports</p>
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
                    <SelectItem value="2024-q4">2024 Q4</SelectItem>
                    <SelectItem value="2024-q3">2024 Q3</SelectItem>
                    <SelectItem value="2024-sem1">2024 Semester 1</SelectItem>
                    <SelectItem value="2024-sem2">2024 Semester 2</SelectItem>
                    <SelectItem value="nov-2024">November 2024</SelectItem>
                    <SelectItem value="oct-2024">October 2024</SelectItem>
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
          <h2 className="text-xl font-semibold mb-4">Available Report Templates</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {reportTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Card key={type.value} className="hover:border-primary cursor-pointer transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{type.label}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Generate detailed {type.label.toLowerCase()}
                        </p>
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
                          <span className="text-sm text-muted-foreground">Period: {report.period}</span>
                        </div>
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
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Generated on {new Date(report.generated_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
