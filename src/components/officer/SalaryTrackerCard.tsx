import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { formatCurrency } from '@/utils/attendanceHelpers';

interface SalaryTrackerProps {
  currentMonthSalary: number;
  normalHoursWorked: number;
  overtimeHours: number;
  overtimePay: number;
  expectedHours: number;
  netPay: number;
}

export function SalaryTrackerCard({
  currentMonthSalary,
  normalHoursWorked,
  overtimeHours,
  overtimePay,
  expectedHours,
  netPay,
}: SalaryTrackerProps) {
  const progressPercent = Math.min((normalHoursWorked / expectedHours) * 100, 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          My Salary Tracker
        </CardTitle>
        <CardDescription>Current month estimated earnings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Net Pay */}
        <div className="p-4 bg-primary/10 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Expected Net Pay</p>
          <p className="text-2xl font-bold text-primary">{formatCurrency(netPay)}</p>
        </div>

        {/* Hours Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Hours Worked
            </span>
            <span className="font-medium">
              {normalHoursWorked.toFixed(1)} / {expectedHours}h
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Overtime */}
        {overtimeHours > 0 && (
          <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-700">Overtime Earnings</p>
                <p className="text-xs text-green-600">{overtimeHours.toFixed(1)} hours</p>
              </div>
            </div>
            <p className="font-semibold text-green-700">{formatCurrency(overtimePay)}</p>
          </div>
        )}

        {/* Breakdown */}
        <div className="space-y-2 pt-2 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Base Salary</span>
            <span className="font-medium">{formatCurrency(currentMonthSalary)}</span>
          </div>
          {overtimeHours > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Overtime Pay</span>
              <span className="font-medium text-green-600">+{formatCurrency(overtimePay)}</span>
            </div>
          )}
        </div>

        {/* Last Updated */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
          <Calendar className="h-3 w-3" />
          <span>Updates in real-time as you work</span>
        </div>
      </CardContent>
    </Card>
  );
}
