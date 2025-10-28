import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, BookOpen } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';

const mockSchedule = [
  {
    id: '1',
    day: 'Monday',
    course_code: 'CS301',
    course_name: 'AI & Machine Learning',
    start_time: '09:00',
    end_time: '10:30',
    room: 'Lab A',
    type: 'lecture' as const,
  },
  {
    id: '2',
    day: 'Monday',
    course_code: 'CS401',
    course_name: 'Advanced Algorithms',
    start_time: '14:00',
    end_time: '15:00',
    room: 'Lab B',
    type: 'lab' as const,
  },
  {
    id: '3',
    day: 'Tuesday',
    course_code: 'CS302',
    course_name: 'Data Structures',
    start_time: '09:00',
    end_time: '10:30',
    room: 'Room 201',
    type: 'lecture' as const,
  },
  {
    id: '4',
    day: 'Wednesday',
    course_code: 'CS301',
    course_name: 'AI & Machine Learning',
    start_time: '10:00',
    end_time: '11:30',
    room: 'Lab A',
    type: 'tutorial' as const,
  },
  {
    id: '5',
    day: 'Wednesday',
    course_code: 'CS401',
    course_name: 'Advanced Algorithms',
    start_time: '14:00',
    end_time: '15:00',
    room: 'Lab B',
    type: 'lecture' as const,
  },
  {
    id: '6',
    day: 'Thursday',
    course_code: 'CS302',
    course_name: 'Data Structures',
    start_time: '09:00',
    end_time: '10:30',
    room: 'Room 201',
    type: 'lab' as const,
  },
  {
    id: '7',
    day: 'Friday',
    course_code: 'CS401',
    course_name: 'Advanced Algorithms',
    start_time: '14:00',
    end_time: '15:00',
    room: 'Lab B',
    type: 'lecture' as const,
  },
];

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function TeacherSchedule() {
  const [schedule] = useState(mockSchedule);

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      lecture: 'bg-blue-500/10 text-blue-500',
      lab: 'bg-green-500/10 text-green-500',
      tutorial: 'bg-purple-500/10 text-purple-500',
    };
    return colors[type] || colors.lecture;
  };

  const getScheduleForDay = (day: string) => {
    return schedule.filter((item) => item.day === day).sort((a, b) => {
      return a.start_time.localeCompare(b.start_time);
    });
  };

  const totalHours = schedule.reduce((total, item) => {
    const start = new Date(`1970-01-01T${item.start_time}`);
    const end = new Date(`1970-01-01T${item.end_time}`);
    return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  }, 0);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Class Schedule</h1>
            <p className="text-muted-foreground">Your weekly teaching schedule</p>
          </div>
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Export Schedule
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{schedule.length}</div>
              <p className="text-sm text-muted-foreground">Total Classes/Week</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{totalHours.toFixed(1)} hrs</div>
              <p className="text-sm text-muted-foreground">Teaching Hours/Week</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {new Set(schedule.map((s) => s.course_code)).size}
              </div>
              <p className="text-sm text-muted-foreground">Active Courses</p>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Schedule */}
        <div className="grid gap-4">
          {days.map((day) => {
            const daySchedule = getScheduleForDay(day);
            if (daySchedule.length === 0) return null;

            return (
              <Card key={day}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {day}
                    <Badge variant="outline">{daySchedule.length} classes</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {daySchedule.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="bg-primary/10 p-3 rounded-lg">
                            <BookOpen className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold">
                                {item.course_code} - {item.course_name}
                              </p>
                              <Badge className={getTypeColor(item.type)}>{item.type}</Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {item.start_time} - {item.end_time}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>{item.room}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
