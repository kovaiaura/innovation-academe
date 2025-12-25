import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EventsViewTab } from '@/components/events/management/EventsViewTab';
import { InstitutionParticipationTab } from '@/components/events/management/InstitutionParticipationTab';
import { InstitutionHeader } from "@/components/management/InstitutionHeader";
import { getInstitutionBySlug } from "@/data/mockInstitutionData";
import { useLocation } from "react-router-dom";

export default function ManagementEvents() {
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
            academicYear={institution.academic_year}
            userRole="Management Portal"
            assignedOfficers={institution.assigned_officers.map(o => o.officer_name)}
          />
        )}
        
        <div>
          <h1 className="text-3xl font-bold">Events & Activities</h1>
          <p className="text-muted-foreground mt-1">
            View events and track institutional participation
          </p>
        </div>

        <Tabs defaultValue="events" className="space-y-6">
          <TabsList>
            <TabsTrigger value="events">All Events</TabsTrigger>
            <TabsTrigger value="participation">Our Participation</TabsTrigger>
          </TabsList>

          <TabsContent value="events">
            <EventsViewTab />
          </TabsContent>

          <TabsContent value="participation">
            <InstitutionParticipationTab />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
