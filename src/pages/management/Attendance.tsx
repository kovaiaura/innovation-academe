import { Layout } from "@/components/layout/Layout";
import { InstitutionHeader } from "@/components/management/InstitutionHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, GraduationCap, BookOpen, CalendarCheck } from "lucide-react";
import { useState } from "react";
import { getInstitutionBySlug } from "@/data/mockInstitutionData";
import { useLocation } from "react-router-dom";
import { OfficerAttendanceTab } from "@/components/attendance/OfficerAttendanceTab";
import { StudentAttendanceTab } from "@/components/attendance/StudentAttendanceTab";
import { TeacherAttendanceTab } from "@/components/attendance/TeacherAttendanceTab";
import { ClassSessionAttendanceTab } from "@/components/attendance/ClassSessionAttendanceTab";

const Attendance = () => {
  const [activeTab, setActiveTab] = useState<'officers' | 'class-sessions' | 'students' | 'teachers'>('officers');
  
  // Extract institution from URL
  const location = useLocation();
  const institutionSlug = location.pathname.split('/')[2];
  const institution = getInstitutionBySlug(institutionSlug);
  
  return (
    <Layout>
      <div className="space-y-6">
        {institution && (
          <InstitutionHeader 
            institutionName={institution.name}
            establishedYear={institution.established_year}
            location={institution.location}
            totalStudents={institution.total_students}
            totalFaculty={institution.total_faculty}
            totalDepartments={institution.total_departments}
            academicYear={institution.academic_year}
            userRole="Management Portal"
            assignedOfficers={institution.assigned_officers.map(o => o.officer_name)}
          />
        )}
        
        <div>
          <h1 className="text-3xl font-bold">Attendance Management</h1>
          <p className="text-muted-foreground">Track attendance for officers, class sessions, students, and teachers</p>
        </div>
        
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="grid w-full grid-cols-4 max-w-4xl">
            <TabsTrigger value="officers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Innovation Officers
            </TabsTrigger>
            <TabsTrigger value="class-sessions" className="flex items-center gap-2">
              <CalendarCheck className="h-4 w-4" />
              Class Sessions
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Students
            </TabsTrigger>
            <TabsTrigger value="teachers" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Teachers
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="officers" className="mt-6">
            <OfficerAttendanceTab institutionId={institution?.id} />
          </TabsContent>
          
          <TabsContent value="class-sessions" className="mt-6">
            <ClassSessionAttendanceTab institutionId={institution?.id} />
          </TabsContent>
          
          <TabsContent value="students" className="mt-6">
            <StudentAttendanceTab />
          </TabsContent>
          
          <TabsContent value="teachers" className="mt-6">
            <TeacherAttendanceTab />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Attendance;
