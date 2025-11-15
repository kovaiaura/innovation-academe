import { useState, useMemo, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addYears, subYears } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { mockEvents } from '@/data/mockCalendarData';
import { InstitutionEvent } from '@/types/calendar';
import { CreateEditEventDialog } from './CreateEditEventDialog';
import { EventDialog } from './EventDialog';
import { YearView } from './YearView';
import { DayEventsPanel } from './DayEventsPanel';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '@/styles/calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export function InstitutionEventsCalendar() {
  const [events, setEvents] = useState<InstitutionEvent[]>(mockEvents);
  const [view, setView] = useState<View | 'year'>('month');
  const [date, setDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<InstitutionEvent | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [createSlotInfo, setCreateSlotInfo] = useState<{ start: Date; end: Date } | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Convert events to calendar format
  const calendarEvents = useMemo(() => {
    return events.map(event => ({
      ...event,
      start: new Date(event.start_datetime),
      end: new Date(event.end_datetime),
    }));
  }, [events]);

  // Event style getter
  const eventStyleGetter = useCallback((event: any) => {
    const colors: Record<string, string> = {
      academic: '#3b82f6',
      extra_curricular: '#10b981',
      administrative: '#f59e0b',
      important: '#ef4444',
    };

    const backgroundColor = event.color || colors[event.event_type] || '#6366f1';

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.9,
        border: 'none',
        color: 'white',
        fontSize: '13px',
        padding: '2px 5px',
      },
    };
  }, []);

  // Handle selecting a time slot (for creating new event)
  const handleSelectSlot = useCallback((slotInfo: { start: Date; end: Date }) => {
    setCreateSlotInfo(slotInfo);
    setSelectedEvent(null);
    setSelectedDate(slotInfo.start);
    setIsCreateDialogOpen(true);
  }, []);

  // Handle selecting an event (for viewing/editing)
  const handleSelectEvent = useCallback((event: any) => {
    setSelectedEvent(event);
    setSelectedDate(new Date(event.start_datetime));
    setIsDetailsDialogOpen(true);
  }, []);

  // Handle event drop (drag and drop)
  const handleEventDrop = useCallback(({ event, start, end }: any) => {
    setEvents(prev => prev.map(e => 
      e.id === event.id 
        ? { ...e, start_datetime: start.toISOString(), end_datetime: end.toISOString() }
        : e
    ));
  }, []);

  // Handle event resize
  const handleEventResize = useCallback(({ event, start, end }: any) => {
    setEvents(prev => prev.map(e => 
      e.id === event.id 
        ? { ...e, start_datetime: start.toISOString(), end_datetime: end.toISOString() }
        : e
    ));
  }, []);

  // Handle event save (create or update)
  const handleEventSave = useCallback((eventData: InstitutionEvent) => {
    if (selectedEvent) {
      // Update existing event
      setEvents(prev => prev.map(e => e.id === eventData.id ? eventData : e));
    } else {
      // Create new event
      setEvents(prev => [...prev, eventData]);
    }
    setIsCreateDialogOpen(false);
  }, [selectedEvent]);

  // Handle event delete
  const handleEventDelete = useCallback((eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
    setIsCreateDialogOpen(false);
    setIsDetailsDialogOpen(false);
  }, []);

  // Handle editing from details dialog
  const handleEditFromDetails = useCallback(() => {
    setIsDetailsDialogOpen(false);
    setIsCreateDialogOpen(true);
  }, []);

  // Navigation toolbar (for Calendar views only)
  const NavigationToolbar = ({ label, onNavigate }: any) => (
    <div className="flex items-center justify-between mb-4 p-4 bg-card border border-border rounded-lg">
      <div className="flex items-center gap-2">
        <Button onClick={() => onNavigate('TODAY')} variant="outline" size="sm">
          Today
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onNavigate('PREV')}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold min-w-[200px] text-center">{label}</h2>
        <Button variant="ghost" size="icon" onClick={() => onNavigate('NEXT')}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Always visible view switcher */}
      <div className="flex items-center justify-center gap-1 p-4 bg-card border border-border rounded-lg">
        {(['year', 'month', 'week', 'day', 'agenda'] as (View | 'year')[]).map(v => (
          <Button
            key={v}
            variant={view === v ? 'default' : 'ghost'}
            size="sm"
            onClick={() => {
              if (v === 'year') {
                setView('year');
              } else {
                setView(v as View);
              }
            }}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </Button>
        ))}
      </div>

      {view === 'year' ? (
        <YearView
          date={date}
          events={calendarEvents}
          onSelectDate={(date) => {
            setSelectedDate(date);
            setView('day');
            setDate(date);
          }}
          onNavigate={(action) => {
            const newDate = action === 'NEXT' ? addYears(date, 1) : subYears(date, 1);
            setDate(newDate);
          }}
          selectedDate={selectedDate}
        />
      ) : (
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 'calc(100vh - 250px)', minHeight: '600px' }}
          view={view === 'year' ? 'month' : view}
          onView={(newView) => setView(newView)}
          date={date}
          onNavigate={setDate}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          onEventDrop={handleEventDrop}
          onEventResize={handleEventResize}
          eventPropGetter={eventStyleGetter}
          selectable
          resizable
          draggableAccessor={() => true}
          components={{
            toolbar: NavigationToolbar,
          }}
        />
      )}

      {selectedDate && (
        <DayEventsPanel
          selectedDate={selectedDate}
          events={calendarEvents}
          onEventClick={handleSelectEvent}
          onClose={() => setSelectedDate(null)}
        />
      )}

      <CreateEditEventDialog
        isOpen={isCreateDialogOpen}
        onClose={() => {
          setIsCreateDialogOpen(false);
          setSelectedEvent(null);
          setCreateSlotInfo(null);
        }}
        onSave={handleEventSave}
        onDelete={handleEventDelete}
        event={selectedEvent || undefined}
        initialStart={createSlotInfo?.start}
        initialEnd={createSlotInfo?.end}
      />

      <EventDialog
        event={selectedEvent || undefined}
        isOpen={isDetailsDialogOpen}
        onClose={() => {
          setIsDetailsDialogOpen(false);
          setSelectedEvent(null);
        }}
        onEdit={handleEditFromDetails}
      />
    </div>
  );
}
