import { Layout } from '@/components/layout/Layout';
import { InstitutionEventsCalendar } from '@/components/calendar/InstitutionEventsCalendar';
import { InstitutionSpecificCalendar } from '@/components/calendar/InstitutionSpecificCalendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

        <Tabs defaultValue="company" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="company">Company Calendar</TabsTrigger>
            <TabsTrigger value="institution">Institution Calendar</TabsTrigger>
          </TabsList>

          <TabsContent value="company">
            <InstitutionEventsCalendar mode="company" />
          </TabsContent>

          <TabsContent value="institution">
            <InstitutionSpecificCalendar />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
