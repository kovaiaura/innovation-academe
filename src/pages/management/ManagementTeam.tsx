import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Briefcase, Mail, Phone, Shield } from "lucide-react";
import { useState } from "react";
import { InstitutionHeader } from "@/components/management/InstitutionHeader";

const ManagementTeam = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const managementMembers = [
    {
      id: "1",
      name: "Dr. Suresh Reddy",
      email: "admin@college.edu",
      phone: "+91 98765 43210",
      role: "Principal",
      department: "Administration",
      status: "active" as const,
      joinedDate: "2020-01-15",
      permissions: ["Full Access", "Approvals", "Reports"],
    },
    {
      id: "2",
      name: "Prof. Meena Iyer",
      email: "meena.iyer@college.edu",
      phone: "+91 98765 43211",
      role: "Academic Coordinator",
      department: "Academics",
      status: "active" as const,
      joinedDate: "2021-06-01",
      permissions: ["Academics", "Timetable", "Reports"],
    },
    {
      id: "3",
      name: "Mr. Karthik Nair",
      email: "karthik.nair@college.edu",
      phone: "+91 98765 43212",
      role: "Department Coordinator",
      department: "Computer Science",
      status: "active" as const,
      joinedDate: "2022-03-10",
      permissions: ["Department", "Courses", "Faculty"],
    },
  ];

  const filteredMembers = managementMembers.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.department.toLowerCase().includes(searchQuery.toLowerCase())
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
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Management Team</h1>
            <p className="text-muted-foreground">Manage coordinators and approval roles</p>
          </div>
          <Button>
            <Briefcase className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Team Members</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search team members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredMembers.map((member) => (
                <Card key={member.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{member.name}</h3>
                            <Badge variant={getStatusBadge(member.status)}>
                              {member.status}
                            </Badge>
                          </div>
                          <Badge variant="outline" className="mb-2">
                            {member.role}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span>{member.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{member.phone}</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Department</p>
                            <p className="font-medium">{member.department}</p>
                            <p className="text-sm text-muted-foreground mt-2">Joined</p>
                            <p className="font-medium">{member.joinedDate}</p>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-blue-500" />
                            <p className="text-sm font-medium">Permissions</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {member.permissions.map((permission, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {permission}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          View Activity
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredMembers.length === 0 && (
                <div className="text-center py-12">
                  <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No team members found matching your search.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ManagementTeam;
