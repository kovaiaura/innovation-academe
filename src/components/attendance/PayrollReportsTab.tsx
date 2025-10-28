import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, TrendingUp, Users, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { mockPayrollData, mockAttendanceData } from '@/data/mockAttendanceData';
import { formatCurrency, exportToCSV } from '@/utils/attendanceHelpers';

export function PayrollReportsTab() {
  const [selectedYear, setSelectedYear] = useState('2024');

  const totalPaidThisYear = mockPayrollData
    .filter(r => r.month.startsWith(selectedYear))
    .reduce((sum, r) => sum + r.net_pay, 0);

  const avgSalaryPerOfficer = mockPayrollData.length > 0
    ? totalPaidThisYear / mockPayrollData.length
    : 0;

  const attendanceRates = mockAttendanceData.map(record => {
    const total = record.present_days + record.absent_days + record.leave_days;
    return {
      name: record.officer_name,
      rate: total > 0 ? (record.present_days / total) * 100 : 0,
    };
  });

  const highestAttendance = attendanceRates.reduce(
    (max, curr) => (curr.rate > max.rate ? curr : max),
    attendanceRates[0]
  );

  const lowestAttendance = attendanceRates.reduce(
    (min, curr) => (curr.rate < min.rate ? curr : min),
    attendanceRates[0]
  );

  const handleDownloadMonthlyReport = () => {
    const reportData = mockPayrollData.map(record => ({
      'Month': record.month,
      'Employee ID': record.employee_id,
      'Officer Name': record.officer_name,
      'Monthly Salary': record.salary_monthly,
      'Calculated Pay': record.calculated_pay,
      'Deductions': record.deductions,
      'Net Pay': record.net_pay,
      'Status': record.status,
    }));
    
    exportToCSV(reportData, `payroll-report-${selectedYear}.csv`);
    toast.success('Monthly payroll report downloaded');
  };

  const handleDownloadAnnualReport = () => {
    toast.success('Annual report generation started. You will receive an email when ready.');
  };

  const handleDownloadAttendanceAnalytics = () => {
    const analyticsData = mockAttendanceData.map(record => {
      const total = record.present_days + record.absent_days + record.leave_days;
      return {
        'Employee ID': record.employee_id,
        'Officer Name': record.officer_name,
        'Department': record.department,
        'Present Days': record.present_days,
        'Absent Days': record.absent_days,
        'Leave Days': record.leave_days,
        'Total Hours': record.total_hours_worked,
        'Attendance Rate': total > 0 ? ((record.present_days / total) * 100).toFixed(1) + '%' : '0%',
      };
    });
    
    exportToCSV(analyticsData, `attendance-analytics-${selectedYear}.csv`);
    toast.success('Attendance analytics downloaded');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2024">2024</SelectItem>
            <SelectItem value="2023">2023</SelectItem>
            <SelectItem value="2022">2022</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPaidThisYear)}</div>
            <p className="text-xs text-muted-foreground">Year {selectedYear}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Salary</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(avgSalaryPerOfficer)}</div>
            <p className="text-xs text-muted-foreground">Per officer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Highest Attendance</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {highestAttendance?.rate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">{highestAttendance?.name}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lowest Attendance</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {lowestAttendance?.rate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">{lowestAttendance?.name}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Payroll Trends</CardTitle>
            <CardDescription>Payroll summary over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Chart visualization would appear here</p>
                <p className="text-sm">Showing monthly trends for {selectedYear}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance vs Salary</CardTitle>
            <CardDescription>Correlation analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Chart visualization would appear here</p>
                <p className="text-sm">Attendance impact on calculated pay</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Downloadable Reports</CardTitle>
          <CardDescription>Export detailed reports for analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button onClick={handleDownloadMonthlyReport} variant="outline" className="h-auto py-4">
              <div className="flex flex-col items-center gap-2">
                <Download className="h-6 w-6" />
                <div className="text-center">
                  <p className="font-medium">Monthly Summary</p>
                  <p className="text-xs text-muted-foreground">CSV Format</p>
                </div>
              </div>
            </Button>

            <Button onClick={handleDownloadAnnualReport} variant="outline" className="h-auto py-4">
              <div className="flex flex-col items-center gap-2">
                <Download className="h-6 w-6" />
                <div className="text-center">
                  <p className="font-medium">Annual Report</p>
                  <p className="text-xs text-muted-foreground">Excel Format</p>
                </div>
              </div>
            </Button>

            <Button onClick={handleDownloadAttendanceAnalytics} variant="outline" className="h-auto py-4">
              <div className="flex flex-col items-center gap-2">
                <Download className="h-6 w-6" />
                <div className="text-center">
                  <p className="font-medium">Attendance Analytics</p>
                  <p className="text-xs text-muted-foreground">CSV Format</p>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cross-Verification Tools</CardTitle>
          <CardDescription>Compare attendance with payroll data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Attendance-Payroll Sync Check</p>
                <p className="text-sm text-muted-foreground">
                  Verify that all attendance records match payroll calculations
                </p>
              </div>
              <Button variant="outline">Run Check</Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Flag Discrepancies</p>
                <p className="text-sm text-muted-foreground">
                  Identify mismatches between attendance and calculated pay
                </p>
              </div>
              <Button variant="outline">Analyze</Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Audit Trail Report</p>
                <p className="text-sm text-muted-foreground">
                  Generate complete audit trail for compliance
                </p>
              </div>
              <Button variant="outline">Generate</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
