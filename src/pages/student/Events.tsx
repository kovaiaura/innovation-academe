import { Layout } from '@/components/layout/Layout';
import { AvailableEventsTab } from '@/components/events/student/AvailableEventsTab';

export default function StudentEvents() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Events & Activities</h1>
          <p className="text-muted-foreground mt-1">
            Browse events and contact your innovation officer if interested
          </p>
        </div>

        <AvailableEventsTab />
      </div>
    </Layout>
  );
}
