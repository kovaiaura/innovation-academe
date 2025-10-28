import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface OfficerAttendance {
  officer_id: string;
  officer_name: string;
  month: string;
  present_days: number;
  absent_days: number;
  leave_days: number;
  salary: number;
  salary_paid: number;
}

const mockAttendance: OfficerAttendance[] = [
  {
    officer_id: '1',
    officer_name: 'John Smith',
    month: '2024-01',
    present_days: 22,
    absent_days: 0,
    leave_days: 1,
    salary: 65000,
    salary_paid: 5416.67,
  },
  {
    officer_id: '2',
    officer_name: 'Sarah Johnson',
    month: '2024-01',
    present_days: 21,
    absent_days: 1,
    leave_days: 1,
    salary: 62000,
    salary_paid: 5000,
  },
  {
    officer_id: '3',
    officer_name: 'Michael Chen',
    month: '2024-01',
    present_days: 20,
    absent_days: 2,
    leave_days: 1,
    salary: 55000,
    salary_paid: 4400,
  },
];

export default function OfficerAttendance() {
  const [selectedMonth, setSelectedMonth] = useState('2024-01');
  const [attendance] = useState<OfficerAttendance[]>(mockAttendance);

  const handleExportPayroll = () => {
    toast.success('Payroll report exported successfully');
  };

  const totalSalaryPaid = attendance.reduce((sum, record) => sum + record.salary_paid, 0);
  const totalPresentDays = attendance.reduce((sum, record) => sum + record.present_days, 0);
  const avgAttendanceRate =
    (totalPresentDays / (attendance.length * 23)) * 100;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Attendance & Payroll</h1>
            <p className="text-muted-foreground mt-1">
              Monitor officer attendance and manage salary payments
            </p>
          </div>
          <Button onClick={handleExportPayroll}>
            <Download className="mr-2 h-4 w-4" />
            Export Payroll Report
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Salary Paid</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalSalaryPaid.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">For {selectedMonth}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Attendance Rate</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgAttendanceRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Across all officers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Officers Tracked</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{attendance.length}</div>
              <p className="text-xs text-muted-foreground">Active officers</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Monthly Attendance Records</CardTitle>
                <CardDescription>Detailed attendance and payroll data</CardDescription>
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
                  <TableHead>Officer Name</TableHead>
                  <TableHead className="text-right">Present</TableHead>
                  <TableHead className="text-right">Absent</TableHead>
                  <TableHead className="text-right">Leave</TableHead>
                  <TableHead className="text-right">Attendance %</TableHead>
                  <TableHead className="text-right">Monthly Salary</TableHead>
                  <TableHead className="text-right">Paid Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendance.map((record) => {
                  const totalDays = record.present_days + record.absent_days + record.leave_days;
                  const attendanceRate = (record.present_days / totalDays) * 100;
                  return (
                    <TableRow key={record.officer_id}>
                      <TableCell className="font-medium">{record.officer_name}</TableCell>
                      <TableCell className="text-right">{record.present_days}</TableCell>
                      <TableCell className="text-right">{record.absent_days}</TableCell>
                      <TableCell className="text-right">{record.leave_days}</TableCell>
                      <TableCell className="text-right font-medium">
                        {attendanceRate.toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-right">
                        ${(record.salary / 12).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        ${record.salary_paid.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
