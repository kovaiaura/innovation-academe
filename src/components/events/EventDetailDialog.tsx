import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { mockActivityEvents } from '@/data/mockEventsData';
import { Button } from '@/components/ui/button';
import { EventStatusBadge } from './EventStatusBadge';
import { RegistrationCountdown } from './RegistrationCountdown';
import { Calendar, MapPin, Users, Trophy, FileText, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';

interface EventDetailDialogProps {
  eventId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userRole: 'system_admin' | 'student' | 'officer' | 'management';
}

export function EventDetailDialog({ eventId, open, onOpenChange, userRole }: EventDetailDialogProps) {
  const event = mockActivityEvents.find(e => e.id === eventId);

  if (!event) return null;

  const canEdit = userRole === 'system_admin';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">{event.title}</DialogTitle>
              <div className="flex items-center gap-2">
                <EventStatusBadge status={event.status} />
                <span className="text-sm text-muted-foreground capitalize">
                  {event.event_type.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Banner */}
          {event.banner_image && (
            <div className="w-full h-48 bg-muted rounded-lg overflow-hidden">
              <img src={event.banner_image} alt={event.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">About This Event</h3>
            <p className="text-muted-foreground">{event.description}</p>
          </div>

          <Separator />

          {/* Key Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Event Date</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(event.event_start), 'PPP')} - {format(new Date(event.event_end), 'PPP')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Registration Deadline</p>
                  <div className="mt-1">
                    <RegistrationCountdown endDate={event.registration_end} />
                  </div>
                </div>
              </div>

              {event.venue && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Venue</p>
                    <p className="text-sm text-muted-foreground">{event.venue}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Participants</p>
                  <p className="text-sm text-muted-foreground">
                    {event.current_participants}
                    {event.max_participants && ` / ${event.max_participants}`} registered
                  </p>
                </div>
              </div>

              {event.prizes && event.prizes.length > 0 && (
                <div className="flex items-start gap-3">
                  <Trophy className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium mb-1">Prizes</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {event.prizes.map((prize, index) => (
                        <li key={index}>• {prize}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Eligibility */}
          {event.eligibility_criteria && (
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Eligibility Criteria
              </h3>
              <p className="text-sm text-muted-foreground">{event.eligibility_criteria}</p>
            </div>
          )}

          {/* Rules */}
          {event.rules && (
            <div>
              <h3 className="font-semibold mb-2">Rules & Guidelines</h3>
              <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans">
                {event.rules}
              </pre>
            </div>
          )}

          {/* Contact Note for Students */}
          {userRole === 'student' && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Interested in this event?</strong> Please contact your Innovation Officer directly to express your interest and get more details.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {canEdit && (
              <Button variant="secondary">
                Edit Event
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
