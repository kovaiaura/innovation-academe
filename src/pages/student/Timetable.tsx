import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, User } from 'lucide-react';
import { format, addDays, startOfWeek } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { getStudentTimetable, getTypeColor } from '@/utils/studentTimetableHelpers';

const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function Timetable() {
  const { user } = useAuth();
  const startDate = startOfWeek(new Date(), { weekStartsOn: 1 });

  // Get student timetable from officer schedules
  const events = user?.institution_id && user?.class_id 
    ? getStudentTimetable(user.institution_id, user.class_id)
    : [];

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
