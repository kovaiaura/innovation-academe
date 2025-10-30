import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EventsOverviewTab } from '@/components/events/officer/EventsOverviewTab';
import { ApplicationReviewTab } from '@/components/events/officer/ApplicationReviewTab';

export default function OfficerEvents() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Events & Activities</h1>
          <p className="text-muted-foreground mt-1">
            Review student applications and manage event participation
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Events Overview</TabsTrigger>
            <TabsTrigger value="applications">Student Applications</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <EventsOverviewTab />
          </TabsContent>

          <TabsContent value="applications">
            <ApplicationReviewTab />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
