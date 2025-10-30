import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AvailableEventsTab } from '@/components/events/student/AvailableEventsTab';
import { MyApplicationsTab } from '@/components/events/student/MyApplicationsTab';

export default function StudentEvents() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Events & Activities</h1>
          <p className="text-muted-foreground mt-1">
            Participate in competitions, hackathons, and showcase your innovations
          </p>
        </div>

        <Tabs defaultValue="available" className="space-y-6">
          <TabsList>
            <TabsTrigger value="available">Available Events</TabsTrigger>
            <TabsTrigger value="my-applications">My Applications</TabsTrigger>
          </TabsList>

          <TabsContent value="available">
            <AvailableEventsTab />
          </TabsContent>

          <TabsContent value="my-applications">
            <MyApplicationsTab />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
