import { Layout } from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ManagementCoursesView } from "@/components/management/ManagementCoursesView";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { InstitutionHeader } from "@/components/management/InstitutionHeader";

const TimetableTab = () => {
  const sessions = [
    {
      id: "1",
      course: "Introduction to IoT",
      class: "3rd Year CSE - Section A",
      officer: "Dr. Rajesh Kumar",
      day: "Monday",
      time: "10:00 AM - 12:00 PM",
      room: "Lab 301",
      status: "scheduled" as const,
    },
    {
      id: "2",
      course: "AI Fundamentals",
      class: "3rd Year CSE - Section B",
      officer: "Ms. Priya Sharma",
      day: "Tuesday",
      time: "2:00 PM - 4:00 PM",
      room: "Lab 302",
      status: "scheduled" as const,
    },
    {
      id: "3",
      course: "Web Development Workshop",
      class: "2nd Year IT",
      officer: "Mr. Amit Patel",
      day: "Wednesday",
      time: "11:00 AM - 1:00 PM",
      room: "Lab 201",
      status: "completed" as const,
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      scheduled: "default",
      completed: "secondary",
      cancelled: "destructive",
    } as const;
    return variants[status as keyof typeof variants] || "secondary";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Timetable</h2>
          <p className="text-muted-foreground">Create and edit class/session schedule</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Session
        </Button>
      </div>

      <div className="grid gap-4">
        {sessions.map((session) => (
          <Card key={session.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{session.course}</h3>
                      <Badge variant={getStatusBadge(session.status)}>
                        {session.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{session.class}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Officer</p>
                      <p className="font-medium">{session.officer}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Schedule</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <p className="font-medium">{session.day}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Time & Location</p>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-green-500" />
                        <p className="font-medium">{session.time}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{session.room}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const CoursesAndSessions = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <InstitutionHeader />
        
        <div>
          <h1 className="text-3xl font-bold">Courses & Sessions</h1>
          <p className="text-muted-foreground">Manage course catalog and session schedule</p>
        </div>

        <Tabs defaultValue="courses" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="courses">STEM Course Catalog</TabsTrigger>
            <TabsTrigger value="timetable">STEM Class Schedule</TabsTrigger>
          </TabsList>
          <TabsContent value="courses" className="mt-6">
            <ManagementCoursesView institutionId="springfield" />
          </TabsContent>
          <TabsContent value="timetable" className="mt-6">
            <TimetableTab />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default CoursesAndSessions;
