import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserCheck, Calendar, BookOpen } from "lucide-react";
import { useState } from "react";
import { InstitutionHeader } from "@/components/management/InstitutionHeader";
import { OfficerDetailsDialog } from "@/components/officer/OfficerDetailsDialog";
import { OfficerScheduleDialog } from "@/components/officer/OfficerScheduleDialog";
import { OfficerTimetableSlot } from "@/types/officer";
import { updateMockOfficerTimetable } from "@/data/mockOfficerTimetable";
import { loadOfficers, getOfficerById } from "@/data/mockOfficerData";
import { OfficerDetails } from "@/services/systemadmin.service";
import { toast } from "sonner";
import { getInstitutionBySlug } from "@/data/mockInstitutionData";
import { getInstitutionOfficers } from "@/data/mockInstitutionOfficers";
import { useLocation } from "react-router-dom";

const Officers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOfficer, setSelectedOfficer] = useState<OfficerDetails | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);

  // Extract institution from URL
  const location = useLocation();
  const institutionSlug = location.pathname.split('/')[2];
  const institution = getInstitutionBySlug(institutionSlug);

  // Get officers assigned to this institution
  const officers = institution 
    ? getInstitutionOfficers(institution.id).map(officer => {
        const officerDetails = loadOfficers().find(o => o.id === officer.officer_id);
        return {
          id: officer.officer_id,
          name: officer.officer_name,
          email: officer.email,
          assignedInstitution: institution.name,
          coursesAssigned: officer.total_courses,
          sessionsThisMonth: 12,
          status: officer.status,
          expertise: officerDetails?.skills.join(', ') || '',
          lastActive: new Date().toISOString().split('T')[0],
        };
      })
    : [];

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

  const handleScheduleSave = (officerId: string, slots: OfficerTimetableSlot[]) => {
    updateMockOfficerTimetable(officerId, slots);
    const totalHours = slots.length;
    toast.success(`Schedule updated: ${totalHours} hours/week`);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {institution && (
          <InstitutionHeader 
            institutionName={institution.name}
            establishedYear={institution.established_year}
            location={institution.location}
            totalStudents={institution.total_students}
            totalFaculty={institution.total_faculty}
            totalDepartments={institution.total_departments}
            academicYear={institution.academic_year}
            userRole="Management Portal"
            assignedOfficers={institution.assigned_officers.map(o => o.officer_name)}
          />
        )}
        
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
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const fullOfficer = loadOfficers().find(o => o.id === officer.id);
                            if (fullOfficer) {
                              setSelectedOfficer(fullOfficer);
                              setDetailsDialogOpen(true);
                            }
                          }}
                        >
                          View Details
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const fullOfficer = loadOfficers().find(o => o.id === officer.id);
                            if (fullOfficer) {
                              setSelectedOfficer(fullOfficer);
                              setScheduleDialogOpen(true);
                            }
                          }}
                        >
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

      <OfficerDetailsDialog
        officer={selectedOfficer}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        viewerRole="management"
      />

      <OfficerScheduleDialog
        officer={selectedOfficer}
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
        onSave={handleScheduleSave}
      />
    </Layout>
  );
};

export default Officers;
