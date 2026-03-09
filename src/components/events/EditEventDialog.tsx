import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Event, ActivityEventType, EVENT_TYPE_LABELS } from '@/types/events';
import { useUpdateEvent, useEventAssignments } from '@/hooks/useEvents';
import { InstitutionClassSelector, ClassSelection } from './InstitutionClassSelector';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface EditEventDialogProps {
  event: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditEventDialog({ event, open, onOpenChange }: EditEventDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState<ActivityEventType>('competition');
  const [venue, setVenue] = useState('');
  const [registrationStart, setRegistrationStart] = useState<Date | undefined>();
  const [registrationEnd, setRegistrationEnd] = useState<Date | undefined>();
  const [eventStart, setEventStart] = useState<Date | undefined>();
  const [eventEnd, setEventEnd] = useState<Date | undefined>();
  const [selectedClasses, setSelectedClasses] = useState<ClassSelection[]>([]);
  const [saving, setSaving] = useState(false);

  const updateEvent = useUpdateEvent();
  const { data: assignments } = useEventAssignments(event?.id);
  const queryClient = useQueryClient();

  // Populate form when event changes
  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || '');
      setEventType(event.event_type);
      setVenue(event.venue || '');
      setRegistrationStart(event.registration_start ? new Date(event.registration_start) : undefined);
      setRegistrationEnd(event.registration_end ? new Date(event.registration_end) : undefined);
      setEventStart(new Date(event.event_start));
      setEventEnd(event.event_end ? new Date(event.event_end) : undefined);
    }
  }, [event]);

  // Populate existing assignments
  useEffect(() => {
    if (assignments && assignments.length > 0) {
      setSelectedClasses(
        assignments.map((a: any) => ({
          institution_id: a.institution_id,
          class_id: a.class_id,
        }))
      );
    }
  }, [assignments]);

  if (!event) return null;

  const handleSave = async () => {
    if (!title || !eventStart) {
      toast.error('Title and Event Start are required');
      return;
    }

    setSaving(true);
    try {
      // Update event details
      await updateEvent.mutateAsync({
        id: event.id,
        data: {
          title,
          description: description || undefined,
          event_type: eventType,
          venue: venue || undefined,
          registration_start: registrationStart?.toISOString(),
          registration_end: registrationEnd?.toISOString(),
          event_start: eventStart.toISOString(),
          event_end: eventEnd?.toISOString(),
        },
      });

      // Update assignments: delete old, insert new
      const { error: deleteError } = await supabase
        .from('event_class_assignments')
        .delete()
        .eq('event_id', event.id);

      if (deleteError) throw deleteError;

      if (selectedClasses.length > 0) {
        const { data: { user } } = await supabase.auth.getUser();

        const { error: insertError } = await supabase
          .from('event_class_assignments')
          .insert(
            selectedClasses.map((c) => ({
              event_id: event.id,
              institution_id: c.institution_id,
              class_id: c.class_id,
              assigned_by: user?.id,
            }))
          );

        if (insertError) throw insertError;

        // If event was draft and now has assignments, publish it
        if (event.status === 'draft') {
          await supabase
            .from('events')
            .update({ status: 'published' })
            .eq('id', event.id);
        }
      }

      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event-assignments', event.id] });
      toast.success('Event updated successfully');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(`Failed to update event: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Event Title *</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Event Type *</Label>
              <Select value={eventType} onValueChange={(v) => setEventType(v as ActivityEventType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-venue">Venue</Label>
              <Input
                id="edit-venue"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Registration Start</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !registrationStart && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {registrationStart ? format(registrationStart, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={registrationStart} onSelect={setRegistrationStart} initialFocus className="pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Registration End</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !registrationEnd && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {registrationEnd ? format(registrationEnd, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={registrationEnd} onSelect={setRegistrationEnd} initialFocus className="pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Event Start *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !eventStart && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {eventStart ? format(eventStart, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={eventStart} onSelect={setEventStart} initialFocus className="pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Event End</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !eventEnd && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {eventEnd ? format(eventEnd, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={eventEnd} onSelect={setEventEnd} initialFocus className="pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Institution/Class Assignment */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Assign to Institutions & Classes</Label>
            <p className="text-sm text-muted-foreground">
              Select which institutions and classes can see this event.
            </p>
            <div className="border rounded-lg p-4">
              <InstitutionClassSelector
                selectedClasses={selectedClasses}
                onSelectionChange={setSelectedClasses}
                height="250px"
                idPrefix="edit-event"
              />
              {selectedClasses.length > 0 && (
                <p className="text-sm text-muted-foreground mt-3">
                  {selectedClasses.length} class(es) selected
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
