import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockActivityEvents, mockEventApplications } from '@/data/mockEventsData';
import { EventStatusBadge } from '../EventStatusBadge';
import { RegistrationCountdown } from '../RegistrationCountdown';
import { EventDetailDialog } from '../EventDetailDialog';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, MapPin, Users, FileText, FolderKanban } from 'lucide-react';
import { format } from 'date-fns';

export function EventsOverviewTab() {
  const { user } = useAuth();
  const [events] = useState(mockActivityEvents.filter(e => e.status === 'published' || e.status === 'ongoing'));
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Get applications for officer's institution
  const getEventStats = (eventId: string) => {
    const applications = mockEventApplications.filter(app => 
      app.event_id === eventId && app.institution_id === user?.institution_id
    );
    return {
      total: applications.length,
      pending: applications.filter(a => a.status === 'pending').length,
      approved: applications.filter(a => a.status === 'approved').length,
    };
  };

  // Get assigned projects count for this event
  const getAssignedProjectsCount = (eventId: string) => {
    const event = mockActivityEvents.find(e => e.id === eventId);
    return event?.linked_project_ids?.length || 0;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => {
          const stats = getEventStats(event.id);
          return (
            <Card key={event.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge variant="outline" className="capitalize">
                    {event.event_type.replace('_', ' ')}
                  </Badge>
                  <EventStatusBadge status={event.status} />
                </div>
                <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {event.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(event.event_start), 'MMM dd, yyyy')}</span>
                </div>
                {event.venue && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="line-clamp-1">{event.venue}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>
                    {event.current_participants}
                    {event.max_participants && ` / ${event.max_participants}`} total
                  </span>
                </div>
                <div className="pt-2">
                  <RegistrationCountdown endDate={event.registration_end} />
                </div>
                
                {/* Institution Stats */}
                <div className="pt-3 border-t">
                  <div className="flex items-center gap-2 text-sm font-medium mb-2">
                    <FileText className="h-4 w-4" />
                    <span>Our Institution</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div>
                      <div className="text-lg font-bold">{stats.total}</div>
                      <div className="text-xs text-muted-foreground">Applied</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-yellow-600">{stats.pending}</div>
                      <div className="text-xs text-muted-foreground">Pending</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">{stats.approved}</div>
                      <div className="text-xs text-muted-foreground">Approved</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-blue-600 flex items-center justify-center gap-1">
                        <FolderKanban className="h-4 w-4" />
                        {getAssignedProjectsCount(event.id)}
                      </div>
                      <div className="text-xs text-muted-foreground">Projects</div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedEventId(event.id)}
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Detail Dialog */}
      {selectedEventId && (
        <EventDetailDialog
          eventId={selectedEventId}
          open={!!selectedEventId}
          onOpenChange={(open) => !open && setSelectedEventId(null)}
          userRole="officer"
        />
      )}
    </div>
  );
}
