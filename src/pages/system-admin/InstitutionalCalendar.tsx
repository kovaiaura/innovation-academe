import { Layout } from '@/components/layout/Layout';
import { InstitutionEventsCalendar } from '@/components/calendar/InstitutionEventsCalendar';

export default function InstitutionalCalendar() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Institutional Events Calendar</h1>
          <p className="text-muted-foreground mt-1">
            Manage and view events across all institutions in calendar view
          </p>
        </div>
        <InstitutionEventsCalendar />
      </div>
    </Layout>
  );
}
