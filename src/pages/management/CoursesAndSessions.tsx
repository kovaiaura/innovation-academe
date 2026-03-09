import { Layout } from "@/components/layout/Layout";
import { ManagementCoursesView } from "@/components/management/ManagementCoursesView";
import { InstitutionHeader } from "@/components/management/InstitutionHeader";
import { useInstitutionStats } from "@/hooks/useInstitutionStats";
import { useLocation } from "react-router-dom";

const CoursesAndSessions = () => {
  const location = useLocation();
  const institutionSlug = location.pathname.split('/')[2];
  const { institution, stats, assignedOfficers } = useInstitutionStats(institutionSlug);

  return (
    <Layout>
      <div className="space-y-6">
        {institution && (
          <InstitutionHeader 
            institutionName={institution.name}
            establishedYear={institution.settings?.established_year}
            location={institution.address?.city || institution.address?.location}
            totalStudents={stats.totalStudents}
            academicYear={institution.settings?.academic_year || "2025-26"}
            userRole="Management Portal"
            assignedOfficers={assignedOfficers}
          />
        )}
        
        <div>
          <h1 className="text-3xl font-bold">Courses & Sessions</h1>
          <p className="text-muted-foreground">View all published courses</p>
        </div>

        <ManagementCoursesView />
      </div>
    </Layout>
  );
};

export default CoursesAndSessions;
