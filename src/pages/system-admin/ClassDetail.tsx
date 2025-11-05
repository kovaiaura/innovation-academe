import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ArrowLeft } from 'lucide-react';
import { ClassOverviewTab } from '@/components/institution/ClassOverviewTab';
import { ClassStudentsTab } from '@/components/institution/ClassStudentsTab';
import { ClassCoursesTab } from '@/components/institution/ClassCoursesTab';
import { ClassAnalyticsTab } from '@/components/institution/ClassAnalyticsTab';
import { getClassById } from '@/data/mockClassData';
import { getStudentsByClass } from '@/data/mockClassStudents';
import { getCourseAssignmentsByClass } from '@/data/mockClassCourseAssignments';
import { getClassAnalytics } from '@/data/mockClassAnalytics';
import { useInstitutionData } from '@/contexts/InstitutionDataContext';
import { InstitutionClass, ClassCourseAssignment, ClassAnalytics } from '@/types/institution';
import { Student } from '@/types/student';
import { toast } from 'sonner';

export default function ClassDetail() {
  const { institutionId, classId } = useParams();
  const navigate = useNavigate();
  const { institutions } = useInstitutionData();
  
  const [classData, setClassData] = useState<InstitutionClass | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [courseAssignments, setCourseAssignments] = useState<ClassCourseAssignment[]>([]);
  const [analytics, setAnalytics] = useState<ClassAnalytics | null>(null);

  const institution = institutions.find(inst => inst.id === institutionId);

  useEffect(() => {
    if (classId) {
      const fetchedClass = getClassById(classId);
      if (fetchedClass) {
        setClassData(fetchedClass);
        setStudents(getStudentsByClass(classId));
        setCourseAssignments(getCourseAssignmentsByClass(classId));
        
        const analyticsData = getClassAnalytics(classId);
        if (analyticsData) {
          setAnalytics(analyticsData);
        }
      }
    }
  }, [classId]);

  if (!classData || !institution) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <h2 className="text-2xl font-bold">Class Not Found</h2>
          <p className="text-muted-foreground">The class you're looking for doesn't exist.</p>
          <Button onClick={() => navigate(`/system-admin/institutions/${institutionId}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Institution
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/system-admin/dashboard">System Admin</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/system-admin/institutions">Institutions</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/system-admin/institutions/${institutionId}`}>
                {institution.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{classData.class_name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/system-admin/institutions/${institutionId}`)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-3xl font-bold">{classData.class_name}</h1>
            </div>
            <p className="text-muted-foreground">
              Academic Year: {classData.academic_year} • Capacity: {classData.capacity}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <ClassOverviewTab
              classData={classData}
              studentCount={students.length}
              attendanceRate={analytics?.student_metrics.average_attendance_rate || 0}
              averageGrade={analytics?.academic_metrics.average_grade || 0}
              activeCourses={courseAssignments.length}
              onEditClass={() => {
                navigate(`/system-admin/institutions/${institutionId}`);
                toast.info('Redirecting to institution page to edit class');
              }}
            />
          </TabsContent>

          <TabsContent value="students">
            <ClassStudentsTab
              classId={classId!}
              classData={classData}
              students={students}
              onAddStudent={async (studentData) => {
                // In production, call institutionService.addStudentToClass
                const newStudent = {
                  ...studentData,
                  id: `stu-${Date.now()}`,
                  created_at: new Date().toISOString()
                };
                setStudents([...students, newStudent as any]);
                toast.success('Student added successfully');
              }}
              onEditStudent={async (studentData) => {
                // In production, call institutionService.updateClassStudent
                setStudents(students.map(s => s.id === studentData.id ? { ...s, ...studentData } : s));
                toast.success('Student updated successfully');
              }}
              onRemoveStudent={async (studentId) => {
                // In production, call institutionService.removeStudentFromClass
                setStudents(students.filter(s => s.id !== studentId));
                toast.success('Student removed successfully');
              }}
              onBulkUpload={async (file) => {
                // In production, call institutionService.bulkUploadStudentsToClass
                toast.success('Bulk upload completed');
                return { imported: 25, updated: 0, skipped: 0, failed: 0, duplicates: [] };
              }}
            />
          </TabsContent>

          <TabsContent value="courses">
            <ClassCoursesTab
              classId={classId!}
              classData={classData}
              courseAssignments={courseAssignments}
              onAssignCourse={async (assignment) => {
                // In production, call institutionService.assignCourseToClass
                const newAssignment = {
                  ...assignment,
                  id: `assign-${Date.now()}`,
                  course_thumbnail: '/placeholder.svg',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                };
                setCourseAssignments([...courseAssignments, newAssignment]);
                toast.success('Course assigned successfully');
              }}
              onUpdateAssignment={async (assignmentId, data) => {
                // In production, call institutionService.updateClassCourseAssignment
                setCourseAssignments(courseAssignments.map(a => 
                  a.id === assignmentId ? { ...a, ...data } : a
                ));
                toast.success('Assignment updated successfully');
              }}
              onRemoveAssignment={async (assignmentId) => {
                // In production, call institutionService.removeClassCourseAssignment
                setCourseAssignments(courseAssignments.filter(a => a.id !== assignmentId));
                toast.success('Course assignment removed');
              }}
              onUnlockModule={async (assignmentId, moduleId) => {
                // In production, call institutionService.unlockModuleForClass
                setCourseAssignments(courseAssignments.map(assignment => {
                  if (assignment.id === assignmentId) {
                    return {
                      ...assignment,
                      assigned_modules: assignment.assigned_modules.map(module =>
                        module.module_id === moduleId ? { ...module, is_unlocked: true } : module
                      )
                    };
                  }
                  return assignment;
                }));
                toast.success('Module unlocked successfully');
              }}
            />
          </TabsContent>

          <TabsContent value="analytics">
            {analytics ? (
              <ClassAnalyticsTab
                classId={classId!}
                classData={classData}
                analytics={analytics}
                onGenerateReport={async (options) => {
                  toast.success('Report generation started');
                }}
              />
            ) : (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Analytics data not available for this class</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
