import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Download, User, Building2, Calendar } from 'lucide-react';
import { formatCurrency } from '@/utils/attendanceHelpers';
import { format, parseISO, isValid } from 'date-fns';
import { 
  fetchAllEmployees, 
  EmployeePayrollSummary,
  calculateLOPDeduction,
  STANDARD_DAYS_PER_MONTH
} from '@/services/payroll.service';

interface EmployeesOverviewTabProps {
  month: number;
  year: number;
}

export function EmployeesOverviewTab({ month, year }: EmployeesOverviewTabProps) {
  const [employees, setEmployees] = useState<EmployeePayrollSummary[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<EmployeePayrollSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState<string>('all');

  useEffect(() => {
    loadEmployees();
  }, [month, year]);

  useEffect(() => {
    filterEmployees();
  }, [employees, searchQuery, userTypeFilter]);

  const loadEmployees = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAllEmployees(month, year);
      setEmployees(data);
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterEmployees = () => {
    let filtered = [...employees];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(e => 
        e.name.toLowerCase().includes(query) ||
        e.email.toLowerCase().includes(query) ||
        e.position_name?.toLowerCase().includes(query) ||
        e.department?.toLowerCase().includes(query)
      );
    }
    
    if (userTypeFilter !== 'all') {
      filtered = filtered.filter(e => e.user_type === userTypeFilter);
    }
    
    setFilteredEmployees(filtered);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500/10 text-green-700 border-green-500/20">Paid</Badge>;
      case 'approved':
        return <Badge className="bg-blue-500/10 text-blue-700 border-blue-500/20">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">Pending</Badge>;
      default:
        return <Badge variant="secondary">Draft</Badge>;
    }
  };

  const formatJoinDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const date = parseISO(dateStr);
      if (!isValid(date)) return '-';
      return format(date, 'dd MMM yyyy');
    } catch {
      return '-';
    }
  };

  // Calculate prorated salary based on join date
  const calculateProratedSalary = (employee: EmployeePayrollSummary): number => {
    if (!employee.join_date) return employee.monthly_salary;
    
    const joinDate = parseISO(employee.join_date);
    if (!isValid(joinDate)) return employee.monthly_salary;
    
    const currentMonthStart = new Date(year, month - 1, 1);
    const currentMonthEnd = new Date(year, month, 0);
    
    // If join date is after the month end, no salary
    if (joinDate > currentMonthEnd) return 0;
    
    // If join date is before or on the month start, full salary
    if (joinDate <= currentMonthStart) return employee.monthly_salary;
    
    // Prorate: calculate days from join date to end of month
    const daysInMonth = currentMonthEnd.getDate();
    const daysWorked = daysInMonth - joinDate.getDate() + 1;
    
    return (employee.monthly_salary / STANDARD_DAYS_PER_MONTH) * daysWorked;
  };

  // LOP Deduction = (Days LOP + Days Not Marked) × Per Day Salary
  const calculateTotalLopDeduction = (employee: EmployeePayrollSummary): number => {
    const totalLopDays = employee.days_lop + (employee.days_not_marked ?? 0);
    return employee.per_day_salary * totalLopDays;
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Type', 'Position', 'Join Date', 'Monthly Salary', 'Per Day Salary', 'Days Present', 'Days Leave', 'Days LOP', 'Not Marked', 'LOP Deduction', 'Net Pay', 'Status'];
    const rows = filteredEmployees.map(e => {
      const proratedSalary = calculateProratedSalary(e);
      const daysNotMarked = e.days_not_marked ?? 0;
      const lopDeduction = calculateTotalLopDeduction(e);
      const netPay = proratedSalary - lopDeduction;
      
      return [
        e.name,
        e.email,
        e.user_type,
        e.position_name || e.department || '-',
        e.join_date || '-',
        proratedSalary.toFixed(2),
        e.per_day_salary.toFixed(2),
        e.days_present,
        e.days_leave,
        e.days_lop,
        daysNotMarked,
        lopDeduction.toFixed(2),
        netPay.toFixed(2),
        e.payroll_status
      ];
    });
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employees-payroll-${year}-${month}.csv`;
    a.click();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Officers & Staff Overview</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              All employees with their payroll summary • LOP = Monthly Salary ÷ {STANDARD_DAYS_PER_MONTH} days × LOP Days • Salary prorated from join date
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search employees..." 
                className="pl-9 w-[200px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="officer">Officers</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Position / Department</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead className="text-right">Monthly Salary</TableHead>
                  <TableHead className="text-right">Per Day (÷30)</TableHead>
                  <TableHead className="text-center">Days Present</TableHead>
                  <TableHead className="text-center">Days Leave</TableHead>
                  <TableHead className="text-center">Days LOP</TableHead>
                  <TableHead className="text-center text-orange-600">Not Marked</TableHead>
                  <TableHead className="text-right">LOP Deduction</TableHead>
                  <TableHead className="text-right">Net Pay</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={14} className="text-center py-8 text-muted-foreground">
                      No employees found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((employee) => {
                    const proratedSalary = calculateProratedSalary(employee);
                    const daysNotMarked = employee.days_not_marked ?? 0;
                    // LOP Deduction = (Days LOP + Days Not Marked) × Per Day Salary
                    const lopDeduction = calculateTotalLopDeduction(employee);
                    const netPay = proratedSalary - lopDeduction;
                    const isProrated = proratedSalary !== employee.monthly_salary;
                    
                    return (
                      <TableRow key={employee.user_id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{employee.name}</p>
                              <p className="text-xs text-muted-foreground">{employee.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={employee.user_type === 'officer' ? 'default' : 'secondary'}>
                            {employee.user_type === 'officer' ? 'Officer' : 'Staff'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span>{employee.position_name || employee.department || '-'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{formatJoinDate(employee.join_date)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div>
                            <span className="font-medium">{formatCurrency(proratedSalary)}</span>
                            {isProrated && (
                              <p className="text-xs text-orange-600">(Prorated)</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatCurrency(employee.per_day_salary)}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-green-600 font-medium">{employee.days_present}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          {employee.days_leave > 0 ? (
                            <span className="text-blue-600 font-medium">{employee.days_leave}</span>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {employee.days_lop > 0 ? (
                            <span className="text-red-600 font-medium">{employee.days_lop}</span>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {daysNotMarked > 0 ? (
                            <span className="text-orange-600 font-medium">{daysNotMarked}</span>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {lopDeduction > 0 ? (
                            <span className="text-red-600">-{formatCurrency(lopDeduction)}</span>
                          ) : (
                            <span className="text-muted-foreground">₹0</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-green-600">
                          {formatCurrency(netPay)}
                        </TableCell>
                        <TableCell className="text-center">
                          {getStatusBadge(employee.payroll_status)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}
        
        {filteredEmployees.length > 0 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Showing {filteredEmployees.length} of {employees.length} employees
            </p>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Net Payroll</p>
              <p className="text-lg font-bold">
                {formatCurrency(filteredEmployees.reduce((sum, e) => {
                  const proratedSalary = calculateProratedSalary(e);
                  const lopDeduction = calculateTotalLopDeduction(e);
                  return sum + (proratedSalary - lopDeduction);
                }, 0))}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
