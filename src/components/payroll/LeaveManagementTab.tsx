import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Pencil, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { LeaveBalanceEditDialog } from './LeaveBalanceEditDialog';

interface LeaveManagementTabProps {
  year: number;
}

interface Employee {
  id: string;
  name: string;
  employee_id: string | null;
  type: 'officer' | 'staff';
}

interface MonthlyLeaveBalance {
  month: number;
  monthly_credit: number;
  carried_forward: number;
  additional_credit: number;
  available: number;
  sick_leave_used: number;
  casual_leave_used: number;
  lop_days: number;
  balance: number;
  id?: string;
  adjustment_reason?: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function LeaveManagementTab({ year }: LeaveManagementTabProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [leaveBalances, setLeaveBalances] = useState<MonthlyLeaveBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  const [editingMonth, setEditingMonth] = useState<MonthlyLeaveBalance | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployeeId) {
      fetchLeaveBalances();
    }
  }, [selectedEmployeeId, year]);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      
      // Fetch officers
      const { data: officers } = await supabase
        .from('officers')
        .select('id, full_name, employee_id')
        .eq('status', 'active');

      // Fetch meta staff
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, employee_id')
        .not('position_id', 'is', null);

      const allEmployees: Employee[] = [
        ...(officers || []).map((o: any) => ({
          id: o.id,
          name: o.full_name,
          employee_id: o.employee_id,
          type: 'officer' as const
        })),
        ...(profiles || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          employee_id: p.employee_id,
          type: 'staff' as const
        }))
      ];

      setEmployees(allEmployees);
      if (allEmployees.length > 0 && !selectedEmployeeId) {
        setSelectedEmployeeId(allEmployees[0].id);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLeaveBalances = async () => {
    if (!selectedEmployeeId) return;
    
    try {
      setIsLoadingBalances(true);
      
      const selectedEmp = employees.find(e => e.id === selectedEmployeeId);
      
      const { data: balances } = await supabase
        .from('leave_balances')
        .select('*')
        .eq('user_id', selectedEmployeeId)
        .eq('year', year)
        .order('month', { ascending: true });

      // Create a complete 12-month view
      const monthlyData: MonthlyLeaveBalance[] = MONTHS.map((_, index) => {
        const monthNum = index + 1;
        const existing = balances?.find((b: any) => b.month === monthNum);
        
        if (existing) {
          const available = (existing.monthly_credit || 1) + 
                           (existing.carried_forward || 0) +
                           (existing.additional_credit || 0);
          const used = (existing.sick_leave_used || 0) + (existing.casual_leave_used || 0);
          
          return {
            month: monthNum,
            monthly_credit: existing.monthly_credit || 1,
            carried_forward: existing.carried_forward || 0,
            additional_credit: existing.additional_credit || 0,
            available,
            sick_leave_used: existing.sick_leave_used || 0,
            casual_leave_used: existing.casual_leave_used || 0,
            lop_days: existing.lop_days || 0,
            balance: available - used,
            id: existing.id,
            adjustment_reason: existing.adjustment_reason
          };
        }
        
        // Default values for months without data
        return {
          month: monthNum,
          monthly_credit: 1,
          carried_forward: 0,
          additional_credit: 0,
          available: 1,
          sick_leave_used: 0,
          casual_leave_used: 0,
          lop_days: 0,
          balance: 1
        };
      });

      setLeaveBalances(monthlyData);
    } catch (error) {
      console.error('Error fetching leave balances:', error);
    } finally {
      setIsLoadingBalances(false);
    }
  };

  const handleEditSave = async (data: { carriedForward: number; additionalCredit: number; reason: string }) => {
    if (!editingMonth || !selectedEmployeeId) return;

    try {
      const selectedEmp = employees.find(e => e.id === selectedEmployeeId);
      const userType = selectedEmp?.type === 'officer' ? 'officer' : 'meta_staff';
      
      const updateData = {
        carried_forward: data.carriedForward,
        additional_credit: data.additionalCredit,
        adjustment_reason: data.reason,
        adjusted_at: new Date().toISOString()
      };

      if (editingMonth.id) {
        // Update existing record
        await supabase
          .from('leave_balances')
          .update(updateData)
          .eq('id', editingMonth.id);
      } else {
        // Create new record
        await supabase
          .from('leave_balances')
          .insert({
            user_id: selectedEmployeeId,
            user_type: userType,
            year,
            month: editingMonth.month,
            monthly_credit: 1,
            ...updateData
          });
      }

      setEditingMonth(null);
      fetchLeaveBalances();
    } catch (error) {
      console.error('Error saving leave balance:', error);
    }
  };

  const currentMonth = new Date().getMonth() + 1;
  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Employee Selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Employee:</span>
          <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select employee" />
            </SelectTrigger>
            <SelectContent>
              {employees.map(emp => (
                <SelectItem key={emp.id} value={emp.id}>
                  {emp.name} {emp.employee_id ? `(${emp.employee_id})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedEmployee && (
          <Badge variant="outline">
            {selectedEmployee.type === 'officer' ? 'Officer' : 'Staff'}
          </Badge>
        )}
      </div>

      {/* Leave Balance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Leave Balance - {year}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingBalances ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead className="text-center">Credit</TableHead>
                    <TableHead className="text-center">Carried</TableHead>
                    <TableHead className="text-center">Additional</TableHead>
                    <TableHead className="text-center">Available</TableHead>
                    <TableHead className="text-center">Sick</TableHead>
                    <TableHead className="text-center">Casual</TableHead>
                    <TableHead className="text-center">LOP</TableHead>
                    <TableHead className="text-center">Balance</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaveBalances.map((balance) => {
                    const isCurrentMonth = balance.month === currentMonth && year === new Date().getFullYear();
                    return (
                      <TableRow key={balance.month} className={isCurrentMonth ? 'bg-primary/5' : ''}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {isCurrentMonth && (
                              <span className="h-2 w-2 rounded-full bg-primary" />
                            )}
                            {MONTHS[balance.month - 1]}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{balance.monthly_credit}</TableCell>
                        <TableCell className="text-center">
                          {balance.carried_forward > 0 ? (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              {balance.carried_forward}
                            </Badge>
                          ) : (
                            '0'
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {balance.additional_credit > 0 ? (
                            <Badge variant="outline" className="bg-purple-50 text-purple-700">
                              {balance.additional_credit}
                            </Badge>
                          ) : (
                            '0'
                          )}
                        </TableCell>
                        <TableCell className="text-center font-medium">{balance.available}</TableCell>
                        <TableCell className="text-center">
                          {balance.sick_leave_used > 0 ? (
                            <span className="text-orange-600">{balance.sick_leave_used}</span>
                          ) : '0'}
                        </TableCell>
                        <TableCell className="text-center">
                          {balance.casual_leave_used > 0 ? (
                            <span className="text-yellow-600">{balance.casual_leave_used}</span>
                          ) : '0'}
                        </TableCell>
                        <TableCell className="text-center">
                          {balance.lop_days > 0 ? (
                            <Badge variant="destructive">{balance.lop_days}</Badge>
                          ) : '0'}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant={balance.balance > 0 ? 'default' : 'secondary'}
                            className={balance.balance > 0 ? 'bg-green-500' : ''}
                          >
                            {balance.balance}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingMonth(balance)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <LeaveBalanceEditDialog
        open={!!editingMonth}
        onOpenChange={(open) => !open && setEditingMonth(null)}
        monthName={editingMonth ? MONTHS[editingMonth.month - 1] : ''}
        year={year}
        initialCarriedForward={editingMonth?.carried_forward || 0}
        initialAdditionalCredit={editingMonth?.additional_credit || 0}
        initialReason={editingMonth?.adjustment_reason || ''}
        onSave={handleEditSave}
      />
    </div>
  );
}
