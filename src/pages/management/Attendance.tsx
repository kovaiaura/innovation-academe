import { Layout } from "@/components/layout/Layout";
import { InstitutionHeader } from "@/components/management/InstitutionHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Users, CalendarCheck, CheckCircle2, Clock } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { OfficerAttendanceTab } from "@/components/attendance/OfficerAttendanceTab";
import { ClassSessionAttendanceTab } from "@/components/attendance/ClassSessionAttendanceTab";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { transformDbToApp } from "@/hooks/useInstitutions";
import { format } from "date-fns";

const Attendance = () => {
  const [activeTab, setActiveTab] = useState<'officers' | 'class-sessions'>('officers');
  
  const { tenantId } = useParams<{ tenantId: string }>();
  
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

  const { data: studentCount = 0 } = useQuery({
    queryKey: ['institution-student-count', institution?.id],
    queryFn: async () => {
      if (!institution?.id) return 0;
      const { count, error } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('institution_id', institution.id)
        .eq('status', 'active');
      if (error) return 0;
      return count || 0;
    },
    enabled: !!institution?.id,
  });

  const { data: todayStats } = useQuery({
    queryKey: ['attendance-today-stats', institution?.id],
    queryFn: async () => {
      if (!institution?.id) return null;
      const today = format(new Date(), 'yyyy-MM-dd');
      
      const { data: sessions } = await supabase
        .from('class_session_attendance')
        .select('id, is_session_completed, students_present, students_late, total_students')
        .eq('institution_id', institution.id)
        .eq('date', today);
      
      const { data: officerAttendance } = await supabase
        .from('officer_attendance')
        .select('id, status')
        .eq('institution_id', institution.id)
        .eq('date', today);
      
      const { data: officers } = await supabase
        .from('officers')
        .select('id')
        .contains('assigned_institutions', [institution.id])
        .eq('status', 'active');
      
      const completedSessions = sessions?.filter(s => s.is_session_completed).length || 0;
      const officersCheckedIn = officerAttendance?.filter(o => o.status === 'checked_in' || o.status === 'checked_out').length || 0;
      const totalOfficers = officers?.length || 0;
      
      return {
        completedSessions,
        officersCheckedIn,
        totalOfficers,
        hasAnyActivity: completedSessions > 0 || officersCheckedIn > 0,
      };
    },
    enabled: !!institution?.id,
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
          totalStudents={studentCount}
          academicYear="2025-26"
          userRole="Management Portal"
          assignedOfficers={[]}
        />
        
        <div>
          <h1 className="text-3xl font-bold">Attendance Management</h1>
          <p className="text-muted-foreground">Track attendance for officers and class sessions</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-l-4 border-l-primary">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Officers Today</p>
                  <p className="text-2xl font-bold">
                    {todayStats?.officersCheckedIn ?? 0} / {todayStats?.totalOfficers ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {todayStats?.officersCheckedIn === 0 ? 'No check-ins yet' : 'checked in'}
                  </p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Sessions Completed Today</p>
                  <p className="text-2xl font-bold text-green-600">
                    {todayStats?.completedSessions ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {todayStats?.completedSessions === 0 ? 'Awaiting first session' : 'classes marked'}
                  </p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500/50" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {todayStats?.hasAnyActivity ? (
                    <>
                      <p className="text-2xl font-bold text-green-600">Active</p>
                      <p className="text-xs text-muted-foreground mt-1">Attendance being recorded</p>
                    </>
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-amber-600">Awaiting</p>
                      <p className="text-xs text-muted-foreground mt-1">No activity recorded today</p>
                    </>
                  )}
                </div>
                {todayStats?.hasAnyActivity ? (
                  <CheckCircle2 className="h-8 w-8 text-green-500/50" />
                ) : (
                  <Clock className="h-8 w-8 text-amber-500/50" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="grid w-full grid-cols-2 max-w-2xl">
            <TabsTrigger value="officers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Officer Attendance
            </TabsTrigger>
            <TabsTrigger value="class-sessions" className="flex items-center gap-2">
              <CalendarCheck className="h-4 w-4" />
              Class Sessions
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="officers" className="mt-6">
            <OfficerAttendanceTab institutionId={institution.id} />
          </TabsContent>
          
          <TabsContent value="class-sessions" className="mt-6">
            <ClassSessionAttendanceTab institutionId={institution.id} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Attendance;
