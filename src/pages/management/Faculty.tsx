import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, UserCheck, Mail, BookOpen, Users, Star } from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Faculty = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const facultyMembers = [
    {
      id: "1",
      name: "Dr. Sarah Johnson",
      email: "sarah.j@college.edu",
      department: "Computer Science",
      coursesAssigned: 4,
      studentsEnrolled: 150,
      averageRating: 4.8,
      status: "active" as const,
      lastActive: "2024-01-15",
    },
    {
      id: "2",
      name: "Prof. Michael Chen",
      email: "m.chen@college.edu",
      department: "Electronics",
      coursesAssigned: 3,
      studentsEnrolled: 120,
      averageRating: 4.6,
      status: "active" as const,
      lastActive: "2024-01-14",
    },
    {
      id: "3",
      name: "Dr. Emily Rodriguez",
      email: "e.rodriguez@college.edu",
      department: "Mechanical",
      coursesAssigned: 3,
      studentsEnrolled: 110,
      averageRating: 4.9,
      status: "on_leave" as const,
      lastActive: "2024-01-10",
    },
    {
      id: "4",
      name: "Prof. James Wilson",
      email: "j.wilson@college.edu",
      department: "Civil",
      coursesAssigned: 4,
      studentsEnrolled: 130,
      averageRating: 4.7,
      status: "active" as const,
      lastActive: "2024-01-15",
    },
  ];

  const filteredFaculty = facultyMembers.filter((faculty) => {
    const matchesSearch = faculty.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          faculty.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = departmentFilter === "all" || faculty.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      on_leave: "secondary",
      inactive: "destructive",
    } as const;
    return variants[status as keyof typeof variants] || "secondary";
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Faculty Management</h1>
          <p className="text-muted-foreground">Supervise and monitor faculty performance</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Faculty Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search faculty..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="Computer Science">Computer Science</SelectItem>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Mechanical">Mechanical</SelectItem>
                  <SelectItem value="Civil">Civil</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              {filteredFaculty.map((faculty) => (
                <Card key={faculty.id}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{faculty.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <Mail className="h-4 w-4" />
                              {faculty.email}
                            </div>
                          </div>
                          <Badge variant={getStatusBadge(faculty.status)}>
                            {faculty.status.replace('_', ' ')}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-blue-500" />
                            <span>{faculty.coursesAssigned} Courses</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-green-500" />
                            <span>{faculty.studentsEnrolled} Students</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span>{faculty.averageRating}/5.0 Rating</span>
                          </div>
                        </div>

                        <div className="text-sm text-muted-foreground">
                          Department: {faculty.department} • Last Active: {faculty.lastActive}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <UserCheck className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          Performance
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Faculty;
