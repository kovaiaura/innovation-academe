import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OfficerAttendanceTab } from '@/components/attendance/OfficerAttendanceTab';
import { PayrollManagementTab } from '@/components/attendance/PayrollManagementTab';
import { PayrollReportsTab } from '@/components/attendance/PayrollReportsTab';
import { ComplianceReportsTab } from '@/components/attendance/ComplianceReportsTab';

export default function OfficerAttendance() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Attendance & Payroll</h1>
          <p className="text-muted-foreground mt-1">
            Monitor officer attendance and manage salary payments
          </p>
        </div>

        <Tabs defaultValue="attendance" className="space-y-6">
          <TabsList>
            <TabsTrigger value="attendance">Officer Attendance</TabsTrigger>
            <TabsTrigger value="payroll">Payroll Management</TabsTrigger>
            <TabsTrigger value="reports">Payroll Reports</TabsTrigger>
            <TabsTrigger value="compliance">Statutory Compliance</TabsTrigger>
          </TabsList>

          <TabsContent value="attendance" className="space-y-6">
            <OfficerAttendanceTab />
          </TabsContent>

          <TabsContent value="payroll" className="space-y-6">
            <PayrollManagementTab />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <PayrollReportsTab />
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <ComplianceReportsTab />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
