import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserCheck, Calendar, BookOpen } from "lucide-react";
import { useState } from "react";
import { InstitutionHeader } from "@/components/management/InstitutionHeader";

const Officers = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const officers = [
    {
      id: "1",
      name: "Dr. Rajesh Kumar",
      email: "rajesh.kumar@metainnova.com",
      assignedInstitution: "Engineering College - Main Campus",
      coursesAssigned: 5,
      sessionsThisMonth: 12,
      status: "active" as const,
      expertise: "Robotics & IoT",
      lastActive: "2024-02-10",
    },
    {
      id: "2",
      name: "Ms. Priya Sharma",
      email: "priya.sharma@metainnova.com",
      assignedInstitution: "Engineering College - Main Campus",
      coursesAssigned: 4,
      sessionsThisMonth: 10,
      status: "active" as const,
      expertise: "AI & Machine Learning",
      lastActive: "2024-02-10",
    },
    {
      id: "3",
      name: "Mr. Amit Patel",
      email: "amit.patel@metainnova.com",
      assignedInstitution: "Engineering College - Main Campus",
      coursesAssigned: 3,
      sessionsThisMonth: 8,
      status: "on_leave" as const,
      expertise: "Web Development",
      lastActive: "2024-02-05",
    },
  ];

  const filteredOfficers = officers.filter((officer) =>
    officer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    officer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    officer.expertise.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      on_leave: "secondary",
      inactive: "outline",
    } as const;
    return variants[status as keyof typeof variants] || "secondary";
  };

  return (
    <Layout>
      <div className="space-y-6">
        <InstitutionHeader />
        
        <div>
          <h1 className="text-3xl font-bold">Innovation Officers</h1>
          <p className="text-muted-foreground">View assigned innovation officers and their activities</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Assigned Officers</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search officers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredOfficers.map((officer) => (
                <Card key={officer.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{officer.name}</h3>
                            <Badge variant={getStatusBadge(officer.status)}>
                              {officer.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{officer.email}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Expertise</p>
                            <p className="font-medium">{officer.expertise}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Last Active</p>
                            <p className="font-medium">{officer.lastActive}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-blue-500" />
                            <span className="text-muted-foreground">
                              {officer.coursesAssigned} Courses
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-green-500" />
                            <span className="text-muted-foreground">
                              {officer.sessionsThisMonth} Sessions This Month
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          View Schedule
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredOfficers.length === 0 && (
                <div className="text-center py-12">
                  <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No officers found matching your search.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Officers;
