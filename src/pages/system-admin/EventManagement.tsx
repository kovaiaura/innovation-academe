import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EventsListTab } from '@/components/events/EventsListTab';
import { CreateEventTab } from '@/components/events/CreateEventTab';
import { ApplicationsOverviewTab } from '@/components/events/ApplicationsOverviewTab';

export default function EventManagement() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Event Management</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage competitions, hackathons, science fairs, and other events
          </p>
        </div>

        <Tabs defaultValue="events" className="space-y-6">
          <TabsList>
            <TabsTrigger value="events">All Events</TabsTrigger>
            <TabsTrigger value="create">Create Event</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
          </TabsList>

          <TabsContent value="events">
            <EventsListTab />
          </TabsContent>

          <TabsContent value="create">
            <CreateEventTab />
          </TabsContent>

          <TabsContent value="applications">
            <ApplicationsOverviewTab />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
