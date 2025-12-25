import { Layout } from "@/components/layout/Layout";
import { InstitutionHeader } from "@/components/management/InstitutionHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, GraduationCap, CalendarCheck } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { OfficerAttendanceTab } from "@/components/attendance/OfficerAttendanceTab";
import { StudentAttendanceTab } from "@/components/attendance/StudentAttendanceTab";
import { ClassSessionAttendanceTab } from "@/components/attendance/ClassSessionAttendanceTab";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { transformDbToApp } from "@/hooks/useInstitutions";

const Attendance = () => {
  const [activeTab, setActiveTab] = useState<'officers' | 'class-sessions' | 'students'>('officers');
  
  // Get tenant slug from URL params
  const { tenantId } = useParams<{ tenantId: string }>();
  
  // Fetch institution directly by slug
  const { data: institution, isLoading } = useQuery({
    queryKey: ['institution-by-slug', tenantId],
    queryFn: async () => {
      if (!tenantId) return null;
      
      const { data, error } = await supabase
        .from('institutions')
        .select('*')
        .eq('slug', tenantId)
        .single();
      
      if (error) {
        console.error('[Attendance] Failed to fetch institution:', error);
        return null;
      }
      
      return transformDbToApp(data);
    },
    enabled: !!tenantId,
  });
  
  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!institution) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          Institution not found
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="space-y-6">
        <InstitutionHeader 
          institutionName={institution.name}
          establishedYear={institution.established_year}
          location={institution.location}
          totalStudents={institution.total_students}
          totalFaculty={institution.total_faculty}
          totalDepartments={0}
          academicYear="2024-25"
          userRole="Management Portal"
          assignedOfficers={[]}
        />
        
        <div>
          <h1 className="text-3xl font-bold">Attendance Management</h1>
          <p className="text-muted-foreground">Track attendance for officers, class sessions, and students</p>
        </div>
        
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="grid w-full grid-cols-3 max-w-3xl">
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
          </TabsList>
          
          <TabsContent value="officers" className="mt-6">
            <OfficerAttendanceTab institutionId={institution.id} />
          </TabsContent>
          
          <TabsContent value="class-sessions" className="mt-6">
            <ClassSessionAttendanceTab institutionId={institution.id} />
          </TabsContent>
          
          <TabsContent value="students" className="mt-6">
            <StudentAttendanceTab institutionId={institution.id} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Attendance;