import { Layout } from "@/components/layout/Layout";
import { ManagementCoursesView } from "@/components/management/ManagementCoursesView";
import { InstitutionHeader } from "@/components/management/InstitutionHeader";
import { getInstitutionBySlug } from "@/data/mockInstitutionData";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const CoursesAndSessions = () => {
  const { user } = useAuth();
  
  // Extract institution from URL for header display
  const location = useLocation();
  const institutionSlug = location.pathname.split('/')[2];
  const institution = getInstitutionBySlug(institutionSlug);
  
  // Use the real institution ID from authenticated user
  const institutionId = user?.institution_id;

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
          <p className="text-muted-foreground">View courses assigned to your institution</p>
        </div>

        {/* Course catalog - view only */}
        {institutionId ? (
          <ManagementCoursesView institutionId={institutionId} />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading institution data...</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CoursesAndSessions;
