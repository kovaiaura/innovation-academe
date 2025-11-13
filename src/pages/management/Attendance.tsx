import { Layout } from "@/components/layout/Layout";
import { InstitutionHeader } from "@/components/management/InstitutionHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, GraduationCap, BookOpen, DollarSign } from "lucide-react";
import { useState } from "react";
import { OfficerAttendanceTab } from "@/components/attendance/OfficerAttendanceTab";
import { StudentAttendanceTab } from "@/components/attendance/StudentAttendanceTab";
import { TeacherAttendanceTab } from "@/components/attendance/TeacherAttendanceTab";
import { OfficerPayrollTab } from "@/components/attendance/OfficerPayrollTab";

const Attendance = () => {
  const [activeTab, setActiveTab] = useState<'officers' | 'students' | 'teachers' | 'payroll'>('officers');
  
  return (
    <Layout>
      <div className="space-y-6">
        <InstitutionHeader />
        
        <div>
          <h1 className="text-3xl font-bold">Attendance Management</h1>
          <p className="text-muted-foreground">Track attendance for officers, students, and teachers</p>
        </div>
        
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="grid w-full grid-cols-4 max-w-3xl">
            <TabsTrigger value="officers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Innovation Officers
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Students
            </TabsTrigger>
            <TabsTrigger value="teachers" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Teachers
            </TabsTrigger>
            <TabsTrigger value="payroll" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Payroll
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="officers" className="mt-6">
            <OfficerAttendanceTab />
          </TabsContent>
          
          <TabsContent value="students" className="mt-6">
            <StudentAttendanceTab />
          </TabsContent>
          
          <TabsContent value="teachers" className="mt-6">
            <TeacherAttendanceTab />
          </TabsContent>
          
          <TabsContent value="payroll" className="mt-6">
            <OfficerPayrollTab />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Attendance;
