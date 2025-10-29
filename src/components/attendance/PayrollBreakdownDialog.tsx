import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { FileText } from 'lucide-react';
import { PayrollRecord } from '@/types/attendance';
import { formatCurrency } from '@/utils/attendanceHelpers';

interface PayrollBreakdownDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  payroll: PayrollRecord | null;
  onGeneratePayslip?: (payroll: PayrollRecord) => void;
}

export function PayrollBreakdownDialog({ 
  isOpen, 
  onOpenChange, 
  payroll,
  onGeneratePayslip 
}: PayrollBreakdownDialogProps) {
  if (!payroll) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Payroll Breakdown - {payroll.officer_name}</DialogTitle>
          <DialogDescription>
            Month: {payroll.month} | Employee ID: {payroll.employee_id}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Attendance Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Attendance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label>Working Days</Label>
                  <p className="text-2xl font-bold">{payroll.working_days}</p>
                </div>
                <div>
                  <Label>Days Present</Label>
                  <p className="text-2xl font-bold text-green-600">{payroll.days_present}</p>
                </div>
                <div>
                  <Label>Days Absent</Label>
                  <p className="text-2xl font-bold text-red-600">{payroll.days_absent}</p>
                </div>
                <div>
                  <Label>Days Leave</Label>
                  <p className="text-2xl font-bold text-blue-600">{payroll.days_leave}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Earnings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Component</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payroll.salary_components?.map((component, index) => (
                    <TableRow key={index}>
                      <TableCell className="capitalize">
                        {component.component_type.replace(/_/g, ' ')}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(component.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-t-2 font-bold">
                    <TableCell>Total Earnings</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(payroll.total_earnings || payroll.gross_salary)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          {/* Deductions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Deductions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Component</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payroll.deductions?.map((deduction, index) => (
                    <TableRow key={index}>
                      <TableCell className="capitalize">
                        {deduction.deduction_type.replace(/_/g, ' ')}
                        {deduction.notes && (
                          <span className="text-xs text-muted-foreground ml-2">
                            ({deduction.notes})
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        -{formatCurrency(deduction.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-t-2 font-bold">
                    <TableCell>Total Deductions</TableCell>
                    <TableCell className="text-right text-red-600">
                      -{formatCurrency(payroll.total_deductions || 0)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          {/* Net Pay */}
          <Card className="bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <Label className="text-lg">Net Pay</Label>
                  <p className="text-sm text-muted-foreground">Amount to be paid</p>
                </div>
                <p className="text-4xl font-bold text-primary">
                  {formatCurrency(payroll.net_pay)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {onGeneratePayslip && (
            <Button onClick={() => onGeneratePayslip(payroll)}>
              <FileText className="mr-2 h-4 w-4" />
              Generate Payslip
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
