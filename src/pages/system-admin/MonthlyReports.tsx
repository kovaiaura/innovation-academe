import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, FileText, TrendingUp, Users, GraduationCap, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface MonthlyReport {
  institution_id: string;
  institution_name: string;
  month: string;
  students: number;
  teachers: number;
  attendance_rate: number;
  revenue: number;
  courses_active: number;
  satisfaction_score: number;
}

const mockReports: MonthlyReport[] = [
  {
    institution_id: 'inst1',
    institution_name: 'Springfield University',
    month: '2024-01',
    students: 5420,
    teachers: 248,
    attendance_rate: 87.5,
    revenue: 425000,
    courses_active: 156,
    satisfaction_score: 4.3,
  },
  {
    institution_id: 'inst2',
    institution_name: 'River College',
    month: '2024-01',
    students: 3200,
    teachers: 145,
    attendance_rate: 91.2,
    revenue: 285000,
    courses_active: 98,
    satisfaction_score: 4.5,
  },
  {
    institution_id: 'inst3',
    institution_name: 'Oakwood Institute',
    month: '2024-01',
    students: 2100,
    teachers: 92,
    attendance_rate: 84.8,
    revenue: 178000,
    courses_active: 67,
    satisfaction_score: 4.1,
  },
  {
    institution_id: 'inst4',
    institution_name: 'Tech Valley School',
    month: '2024-01',
    students: 1800,
    teachers: 78,
    attendance_rate: 89.3,
    revenue: 165000,
    courses_active: 54,
    satisfaction_score: 4.4,
  },
];

export default function MonthlyReports() {
  const [reports] = useState<MonthlyReport[]>(mockReports);
  const [selectedMonth, setSelectedMonth] = useState('2024-01');

  const handleExportPDF = () => {
    toast.success('Exporting report to PDF...');
  };

  const handleExportExcel = () => {
    toast.success('Exporting report to Excel...');
  };

  const totalStudents = reports.reduce((sum, r) => sum + r.students, 0);
  const totalTeachers = reports.reduce((sum, r) => sum + r.teachers, 0);
  const totalRevenue = reports.reduce((sum, r) => sum + r.revenue, 0);
  const avgAttendance =
    reports.reduce((sum, r) => sum + r.attendance_rate, 0) / reports.length;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Monthly Reports</h1>
            <p className="text-muted-foreground mt-1">
              Consolidated monthly reports per institution
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportExcel}>
              <FileText className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
            <Button onClick={handleExportPDF}>
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="grid gap-4 md:grid-cols-4 flex-1">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalStudents.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Across all institutions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Faculty</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalTeachers}</div>
                <p className="text-xs text-muted-foreground">Active teachers</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${(totalRevenue / 1000).toFixed(0)}K</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgAttendance.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Platform average</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Institution Performance</CardTitle>
                <CardDescription>Detailed metrics by institution</CardDescription>
              </div>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-01">January 2024</SelectItem>
                  <SelectItem value="2023-12">December 2023</SelectItem>
                  <SelectItem value="2023-11">November 2023</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Institution</TableHead>
                  <TableHead className="text-right">Students</TableHead>
                  <TableHead className="text-right">Teachers</TableHead>
                  <TableHead className="text-right">Active Courses</TableHead>
                  <TableHead className="text-right">Attendance</TableHead>
                  <TableHead className="text-right">Satisfaction</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.institution_id}>
                    <TableCell className="font-medium">{report.institution_name}</TableCell>
                    <TableCell className="text-right">{report.students.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{report.teachers}</TableCell>
                    <TableCell className="text-right">{report.courses_active}</TableCell>
                    <TableCell className="text-right font-medium">
                      {report.attendance_rate.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-right">{report.satisfaction_score}/5.0</TableCell>
                    <TableCell className="text-right font-bold">
                      ${report.revenue.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold bg-muted/50">
                  <TableCell>TOTAL</TableCell>
                  <TableCell className="text-right">{totalStudents.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{totalTeachers}</TableCell>
                  <TableCell className="text-right">
                    {reports.reduce((sum, r) => sum + r.courses_active, 0)}
                  </TableCell>
                  <TableCell className="text-right">{avgAttendance.toFixed(1)}%</TableCell>
                  <TableCell className="text-right">
                    {(reports.reduce((sum, r) => sum + r.satisfaction_score, 0) / reports.length).toFixed(1)}/5.0
                  </TableCell>
                  <TableCell className="text-right">${totalRevenue.toLocaleString()}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
