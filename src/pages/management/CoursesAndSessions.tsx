import { Layout } from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ManagementCoursesView } from "@/components/management/ManagementCoursesView";
import { InstitutionHeader } from "@/components/management/InstitutionHeader";
import { InstitutionTimetableView } from "@/components/management/InstitutionTimetableView";
import { getInstitutionBySlug } from "@/data/mockInstitutionData";
import { getInstitutionPeriods } from "@/data/mockInstitutionPeriods";
import { getInstitutionTimetable } from "@/data/mockInstitutionTimetable";
import { getOfficerTimetablesByInstitution } from "@/data/mockOfficerTimetable";
import { useLocation } from "react-router-dom";


const CoursesAndSessions = () => {
  // Extract institution from URL
  const location = useLocation();
  const institutionSlug = location.pathname.split('/')[2];
  const institution = getInstitutionBySlug(institutionSlug);
  
  // Load timetable data from localStorage
  const periods = institution ? getInstitutionPeriods(institution.id) : [];
  const timetableData = institution ? getInstitutionTimetable(institution.id) : [];
  const officerTimetables = institution ? getOfficerTimetablesByInstitution(institution.id) : [];

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
            {institution && (
              <InstitutionTimetableView
                institutionId={institution.id}
                periods={periods}
                timetableData={timetableData}
                officerTimetables={officerTimetables}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default CoursesAndSessions;
