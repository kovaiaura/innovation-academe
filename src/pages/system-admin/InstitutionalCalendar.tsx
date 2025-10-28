import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InstitutionEventsTab } from '@/components/calendar/InstitutionEventsTab';
import { AcademicYearPlannerTab } from '@/components/calendar/AcademicYearPlannerTab';
import { HolidayDirectivesTab } from '@/components/calendar/HolidayDirectivesTab';
import { AuditCalendarTab } from '@/components/calendar/AuditCalendarTab';

export default function InstitutionalCalendar() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Institutional Calendar</h1>
          <p className="text-muted-foreground mt-1">
            Manage events, academic planning, holidays, and audits across all institutions
          </p>
        </div>

        <Tabs defaultValue="events" className="space-y-6">
          <TabsList>
            <TabsTrigger value="events">Institution Events Overview</TabsTrigger>
            <TabsTrigger value="academic">Academic Year Planner</TabsTrigger>
            <TabsTrigger value="holidays">Holiday Directives</TabsTrigger>
            <TabsTrigger value="audits">Audit & Review Calendar</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-6">
            <InstitutionEventsTab />
          </TabsContent>

          <TabsContent value="academic" className="space-y-6">
            <AcademicYearPlannerTab />
          </TabsContent>

          <TabsContent value="holidays" className="space-y-6">
            <HolidayDirectivesTab />
          </TabsContent>

          <TabsContent value="audits" className="space-y-6">
            <AuditCalendarTab />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
