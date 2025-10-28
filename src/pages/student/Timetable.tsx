import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, User } from 'lucide-react';
import { format, addDays, startOfWeek } from 'date-fns';

// Mock timetable data
const mockEvents = [
  {
    id: '1',
    title: 'Mathematics',
    teacher: 'Prof. Kumar',
    room: 'Room 101',
    day: 0, // Monday
    time: '09:00 - 10:00',
    type: 'lecture'
  },
  {
    id: '2',
    title: 'Physics Lab',
    teacher: 'Dr. Sharma',
    room: 'Lab 3',
    day: 0,
    time: '11:00 - 13:00',
    type: 'lab'
  },
  {
    id: '3',
    title: 'Computer Science',
    teacher: 'Prof. Patel',
    room: 'Room 205',
    day: 1, // Tuesday
    time: '10:00 - 11:00',
    type: 'lecture'
  },
  {
    id: '4',
    title: 'Innovation Session',
    teacher: 'Dr. Verma',
    room: 'Innovation Hub',
    day: 2, // Wednesday
    time: '14:00 - 16:00',
    type: 'workshop'
  },
  {
    id: '5',
    title: 'Chemistry',
    teacher: 'Dr. Singh',
    room: 'Room 102',
    day: 3, // Thursday
    time: '09:00 - 10:00',
    type: 'lecture'
  },
  {
    id: '6',
    title: 'Project Mentoring',
    teacher: 'Dr. Sharma',
    room: 'Lab 1',
    day: 4, // Friday
    time: '15:00 - 17:00',
    type: 'mentoring'
  }
];

const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const getTypeColor = (type: string) => {
  switch (type) {
    case 'lecture': return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'lab': return 'bg-purple-100 text-purple-800 border-purple-300';
    case 'workshop': return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'mentoring': return 'bg-green-100 text-green-800 border-green-300';
    default: return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

export default function Timetable() {
  const [events] = useState(mockEvents);
  const startDate = startOfWeek(new Date(), { weekStartsOn: 1 });

  // Group events by day
  const eventsByDay = weekDays.map((day, index) => ({
    day,
    date: format(addDays(startDate, index), 'MMM dd'),
    events: events.filter(e => e.day === index)
  }));

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Timetable</h1>
          <p className="text-muted-foreground">View your weekly class schedule and sessions</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Weekly Schedule</CardTitle>
                <CardDescription>
                  Week of {format(startDate, 'MMMM dd, yyyy')}
                </CardDescription>
              </div>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                  <span>Lecture</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                  <span>Lab</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                  <span>Workshop</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {eventsByDay.map((dayData) => (
                <Card key={dayData.day} className="border-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>{dayData.day}</span>
                      <Badge variant="outline">{dayData.date}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {dayData.events.length > 0 ? (
                      dayData.events.map((event) => (
                        <div
                          key={event.id}
                          className={`rounded-lg border-2 p-3 space-y-2 ${getTypeColor(event.type)}`}
                        >
                          <div className="font-semibold">{event.title}</div>
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3" />
                              <span>{event.time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="h-3 w-3" />
                              <span>{event.teacher}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3 w-3" />
                              <span>{event.room}</span>
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-xs capitalize">
                            {event.type}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-sm text-muted-foreground">
                        No classes scheduled
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
