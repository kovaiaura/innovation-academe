import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DollarSign, CheckCircle, Send } from 'lucide-react';
import { toast } from 'sonner';
import { PayrollRecord, PayrollStatus } from '@/types/attendance';
import { mockPayrollData } from '@/data/mockAttendanceData';
import { formatCurrency } from '@/utils/attendanceHelpers';

export function PayrollManagementTab() {
  const [selectedMonth, setSelectedMonth] = useState('2024-01');
  const [payrollData, setPayrollData] = useState<PayrollRecord[]>(mockPayrollData);

  const filteredData = payrollData.filter(record => record.month === selectedMonth);

  const totalPayroll = filteredData.reduce((sum, record) => sum + record.net_pay, 0);
  const pendingApprovals = filteredData.filter(r => r.status === 'pending').length;
  const approvedCount = filteredData.filter(r => r.status === 'approved').length;

  const handleApprove = (officerId: string) => {
    setPayrollData(prev =>
      prev.map(record =>
        record.officer_id === officerId
          ? {
              ...record,
              status: 'approved' as PayrollStatus,
              approved_by: 'Admin',
              approved_date: new Date().toISOString().split('T')[0],
            }
          : record
      )
    );
    toast.success('Payroll approved successfully');
  };

  const handleApproveAll = () => {
    setPayrollData(prev =>
      prev.map(record =>
        record.status === 'pending' || record.status === 'draft'
          ? {
              ...record,
              status: 'approved' as PayrollStatus,
              approved_by: 'Admin',
              approved_date: new Date().toISOString().split('T')[0],
            }
          : record
      )
    );
    toast.success('All pending payrolls approved');
  };

  const handleForwardToFinance = () => {
    const approvedRecords = filteredData.filter(r => r.status === 'approved');
    if (approvedRecords.length === 0) {
      toast.error('No approved payroll records to forward');
      return;
    }

    setPayrollData(prev =>
      prev.map(record =>
        record.status === 'approved' && record.month === selectedMonth
          ? { ...record, status: 'forwarded' as PayrollStatus }
          : record
      )
    );
    toast.success(`${approvedRecords.length} payroll records forwarded to finance`);
  };

  const getStatusBadge = (status: PayrollStatus) => {
    const variants: Record<PayrollStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
      draft: { variant: 'outline', label: 'Draft' },
      pending: { variant: 'secondary', label: 'Pending' },
      approved: { variant: 'default', label: 'Approved' },
      forwarded: { variant: 'default', label: 'Forwarded' },
      paid: { variant: 'default', label: 'Paid' },
    };
    
    const { variant, label } = variants[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
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
        
        <div className="flex gap-2">
          <Button onClick={handleApproveAll} disabled={pendingApprovals === 0}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Approve All
          </Button>
          <Button onClick={handleForwardToFinance} disabled={approvedCount === 0}>
            <Send className="mr-2 h-4 w-4" />
            Forward to Finance
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPayroll)}</div>
            <p className="text-xs text-muted-foreground">For {selectedMonth}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">Requires review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedCount}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payroll Records</CardTitle>
          <CardDescription>Review and approve officer payroll</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Officer Name</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead className="text-right">Working Days</TableHead>
                <TableHead className="text-right">Monthly Salary</TableHead>
                <TableHead className="text-right">Calculated Pay</TableHead>
                <TableHead className="text-right">Deductions</TableHead>
                <TableHead className="text-right">Net Pay</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((record) => (
                <TableRow key={record.officer_id}>
                  <TableCell className="font-medium">{record.officer_name}</TableCell>
                  <TableCell>{record.employee_id}</TableCell>
                  <TableCell className="text-right">{record.working_days}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(record.salary_monthly)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(record.calculated_pay)}
                  </TableCell>
                  <TableCell className="text-right text-red-600">
                    {record.deductions > 0 ? formatCurrency(record.deductions) : '-'}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {formatCurrency(record.net_pay)}
                  </TableCell>
                  <TableCell>{getStatusBadge(record.status)}</TableCell>
                  <TableCell className="text-right">
                    {(record.status === 'pending' || record.status === 'draft') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleApprove(record.officer_id)}
                      >
                        Approve
                      </Button>
                    )}
                    {record.status === 'approved' && (
                      <span className="text-sm text-muted-foreground">
                        Approved by {record.approved_by}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
