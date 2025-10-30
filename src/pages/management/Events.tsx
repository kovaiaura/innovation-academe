import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EventsViewTab } from '@/components/events/management/EventsViewTab';
import { InstitutionParticipationTab } from '@/components/events/management/InstitutionParticipationTab';

export default function ManagementEvents() {
  return (
    <Layout>
      <div className="space-y-6">
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
