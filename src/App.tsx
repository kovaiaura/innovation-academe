import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { InstitutionDataProvider } from "@/contexts/InstitutionDataContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import SuperAdminDashboard from "./pages/super-admin/Dashboard";
import SuperAdminSystemConfig from "./pages/super-admin/SystemConfig";
import SuperAdminAuditLogs from "./pages/super-admin/AuditLogs";
import SystemAdminDashboard from "./pages/system-admin/Dashboard";
import InstitutionManagement from "./pages/system-admin/InstitutionManagement";
import SystemAdminReports from "./pages/system-admin/Reports";
import OfficerManagement from "./pages/system-admin/OfficerManagement";
import SystemAdminOfficerAttendance from "./pages/system-admin/OfficerAttendance";
import InventoryManagement from "./pages/system-admin/InventoryManagement";
import InstitutionInventoryDetail from "./pages/system-admin/InstitutionInventoryDetail";
import StudentDashboard from "./pages/student/Dashboard";
import StudentCourses from "./pages/student/Courses";
import StudentProjects from "./pages/student/Projects";
import StudentTimetable from "./pages/student/Timetable";
import StudentCertificates from "./pages/student/Certificates";
import StudentGamification from "./pages/student/Gamification";
import StudentResume from "./pages/student/Resume";
import StudentEvents from "./pages/student/Events";
import OfficerDashboard from "./pages/officer/Dashboard";
import OfficerSessions from "./pages/officer/Sessions";
import OfficerProjects from "./pages/officer/Projects";
import OfficerInventory from "./pages/officer/Inventory";
import OfficerAttendance from "./pages/officer/Attendance";
import OfficerEvents from "./pages/officer/Events";
import InstitutionDashboard from "./pages/institution/Dashboard";
import InstitutionTeachers from "./pages/institution/Teachers";
import InstitutionStudents from "./pages/institution/Students";
import ManagementStudents from "./pages/management/Students";
import InstitutionCourses from "./pages/institution/Courses";
import InstitutionReports from "./pages/institution/Reports";
import TeacherDashboard from "./pages/teacher/Dashboard";
import TeacherCourses from "./pages/teacher/Courses";
import TeacherGrades from "./pages/teacher/Grades";
import TeacherAttendance from "./pages/teacher/Attendance";
import TeacherSchedule from "./pages/teacher/Schedule";
import TeacherMaterials from "./pages/teacher/Materials";
import ManagementDashboard from "./pages/management/Dashboard";
import ManagementTeachers from "./pages/management/Teachers";
import ManagementOfficers from "./pages/management/Officers";
import CoursesAndSessions from "./pages/management/CoursesAndSessions";
import InventoryAndPurchase from "./pages/management/InventoryAndPurchase";
import ProjectsAndCertificates from "./pages/management/ProjectsAndCertificates";
import ManagementSettings from "./pages/management/Settings";
import Attendance from "./pages/management/Attendance";
import ManagementReports from "./pages/management/Reports";
import ManagementEvents from "./pages/management/Events";
import SystemAdminCourseManagement from "./pages/system-admin/CourseManagement";
import SystemAdminCourseDetail from "./pages/system-admin/CourseDetail";
import SystemAdminAssessmentManagement from "./pages/system-admin/AssessmentManagement";
import OfficerCourseManagement from "./pages/officer/CourseManagement";
import OfficerCourseContentViewer from "./pages/officer/CourseContentViewer";
import OfficerProfile from "./pages/officer/Profile";
import OfficerLeaveManagement from "./pages/officer/LeaveManagement";
import OfficerAssessmentManagement from "./pages/officer/AssessmentManagement";
import StudentCourseDetail from "./pages/student/CourseDetail";
import StudentAssessments from "./pages/student/Assessments";
import TakeAssessment from "./pages/student/TakeAssessment";
import InstitutionalCalendar from "./pages/system-admin/InstitutionalCalendar";
import InstitutionDetail from "./pages/system-admin/InstitutionDetail";
import ClassDetail from "./pages/system-admin/ClassDetail";
import OfficerDetail from "./pages/system-admin/OfficerDetail";
import ProjectManagement from "./pages/system-admin/ProjectManagement";
import SystemAdminLeaveApprovals from "./pages/system-admin/LeaveApprovals";
import EventManagement from "./pages/system-admin/EventManagement";
import Performance from "./pages/management/Performance";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <InstitutionDataProvider>
        <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Super Admin Routes - Technical Platform Oversight */}
            <Route
              path="/super-admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <SuperAdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/super-admin/system-config"
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <SuperAdminSystemConfig />
                </ProtectedRoute>
              }
            />
            <Route
              path="/super-admin/audit-logs"
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <SuperAdminAuditLogs />
                </ProtectedRoute>
              }
            />

            {/* System Admin Routes - Business Operations & Customer Onboarding */}
            <Route
              path="/system-admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['system_admin']}>
                  <SystemAdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/system-admin/institutions"
              element={
                <ProtectedRoute allowedRoles={['system_admin']}>
                  <InstitutionManagement />
                </ProtectedRoute>
              }
            />
          <Route
            path="/system-admin/institutions/:institutionId"
            element={
              <ProtectedRoute allowedRoles={['system_admin']}>
                <InstitutionDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/system-admin/institutions/:institutionId/classes/:classId"
            element={
              <ProtectedRoute allowedRoles={['system_admin']}>
                <ClassDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/system-admin/officers/:officerId"
            element={
              <ProtectedRoute allowedRoles={['system_admin']}>
                <OfficerDetail />
              </ProtectedRoute>
            }
          />
            <Route
              path="/system-admin/reports"
              element={
                <ProtectedRoute allowedRoles={['system_admin']}>
                  <SystemAdminReports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/system-admin/officers"
              element={
                <ProtectedRoute allowedRoles={['system_admin']}>
                  <OfficerManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/system-admin/officer-attendance"
              element={
                <ProtectedRoute allowedRoles={['system_admin']}>
                  <SystemAdminOfficerAttendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/system-admin/leave-approvals"
              element={
                <ProtectedRoute allowedRoles={['system_admin']}>
                  <SystemAdminLeaveApprovals />
                </ProtectedRoute>
              }
            />
            <Route
              path="/system-admin/inventory-management"
              element={
                <ProtectedRoute allowedRoles={['system_admin']}>
                  <InventoryManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/system-admin/inventory-management/:institutionId"
              element={
                <ProtectedRoute allowedRoles={['system_admin']}>
                  <InstitutionInventoryDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/system-admin/course-management"
              element={
                <ProtectedRoute allowedRoles={['system_admin']}>
                  <SystemAdminCourseManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/system-admin/courses/:courseId"
              element={
                <ProtectedRoute allowedRoles={['system_admin']}>
                  <SystemAdminCourseDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/system-admin/assessments"
              element={
                <ProtectedRoute allowedRoles={['system_admin']}>
                  <SystemAdminAssessmentManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/system-admin/institutional-calendar"
              element={
                <ProtectedRoute allowedRoles={['system_admin']}>
                  <InstitutionalCalendar />
                </ProtectedRoute>
              }
            />
            <Route
              path="/system-admin/project-management"
              element={
                <ProtectedRoute allowedRoles={['system_admin']}>
                  <ProjectManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/system-admin/event-management"
              element={
                <ProtectedRoute allowedRoles={['system_admin']}>
                  <EventManagement />
                </ProtectedRoute>
              }
            />
            {/* Teacher Routes (path-based multi-tenancy) */}
            <Route
              path="/tenant/:tenantId/teacher/dashboard"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant/:tenantId/teacher/courses"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherCourses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant/:tenantId/teacher/grades"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherGrades />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant/:tenantId/teacher/attendance"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherAttendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant/:tenantId/teacher/schedule"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherSchedule />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant/:tenantId/teacher/materials"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherMaterials />
                </ProtectedRoute>
              }
            />


            {/* Officer Routes (path-based multi-tenancy) */}
            <Route
              path="/tenant/:tenantId/officer/dashboard"
              element={
                <ProtectedRoute allowedRoles={['officer']}>
                  <OfficerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant/:tenantId/officer/sessions"
              element={
                <ProtectedRoute allowedRoles={['officer']}>
                  <OfficerSessions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant/:tenantId/officer/projects"
              element={
                <ProtectedRoute allowedRoles={['officer']}>
                  <OfficerProjects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant/:tenantId/officer/inventory"
              element={
                <ProtectedRoute allowedRoles={['officer']}>
                  <OfficerInventory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant/:tenantId/officer/attendance"
              element={
                <ProtectedRoute allowedRoles={['officer']}>
                  <OfficerAttendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant/:tenantId/officer/course-management"
              element={
                <ProtectedRoute allowedRoles={['officer']}>
                  <OfficerCourseManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant/:tenantId/officer/courses/:courseId/viewer"
              element={
                <ProtectedRoute allowedRoles={['officer']}>
                  <OfficerCourseContentViewer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant/:tenantId/officer/profile"
              element={
                <ProtectedRoute allowedRoles={['officer']}>
                  <OfficerProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant/:tenantId/officer/leave-management"
              element={
                <ProtectedRoute allowedRoles={['officer']}>
                  <OfficerLeaveManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant/:tenantId/officer/events"
              element={
                <ProtectedRoute allowedRoles={['officer']}>
                  <OfficerEvents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant/:tenantId/officer/assessments"
              element={
                <ProtectedRoute allowedRoles={['officer']}>
                  <OfficerAssessmentManagement />
                </ProtectedRoute>
              }
            />

            {/* Management Routes (path-based multi-tenancy) - Merged with institution admin */}
            <Route
              path="/tenant/:tenantId/management/dashboard"
              element={
                <ProtectedRoute allowedRoles={['management']}>
                  <ManagementDashboard />
                </ProtectedRoute>
              }
            />
            {/* People Management Routes */}
            <Route
              path="/tenant/:tenantId/management/teachers"
              element={
                <ProtectedRoute allowedRoles={['management']}>
                  <ManagementTeachers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant/:tenantId/management/students"
              element={
                <ProtectedRoute allowedRoles={['management']}>
                  <ManagementStudents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant/:tenantId/management/officers"
              element={
                <ProtectedRoute allowedRoles={['management']}>
                  <ManagementOfficers />
                </ProtectedRoute>
              }
            />
            {/* Combined Functionality Routes */}
            <Route
              path="/tenant/:tenantId/management/courses-sessions"
              element={
                <ProtectedRoute allowedRoles={['management']}>
                  <CoursesAndSessions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant/:tenantId/management/inventory-purchase"
              element={
                <ProtectedRoute allowedRoles={['management']}>
                  <InventoryAndPurchase />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant/:tenantId/management/projects-certificates"
              element={
                <ProtectedRoute allowedRoles={['management']}>
                  <ProjectsAndCertificates />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant/:tenantId/management/reports"
              element={
                <ProtectedRoute allowedRoles={['management']}>
                  <ManagementReports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant/:tenantId/management/settings"
              element={
                <ProtectedRoute allowedRoles={['management']}>
                  <ManagementSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant/:tenantId/management/attendance"
              element={
                <ProtectedRoute allowedRoles={['management']}>
                  <Attendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant/:tenantId/management/events"
              element={
                <ProtectedRoute allowedRoles={['management']}>
                  <ManagementEvents />
                </ProtectedRoute>
              }
            />

            {/* Student Routes (path-based multi-tenancy) */}
            <Route
              path="/tenant/:tenantId/student/dashboard"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant/:tenantId/student/courses"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentCourses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant/:tenantId/student/courses/:courseId"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentCourseDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant/:tenantId/student/projects"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentProjects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant/:tenantId/student/timetable"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentTimetable />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant/:tenantId/student/certificates"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentCertificates />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant/:tenantId/student/gamification"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentGamification />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant/:tenantId/student/resume"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentResume />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant/:tenantId/student/events"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentEvents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant/:tenantId/student/assessments"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentAssessments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant/:tenantId/student/assessments/:assessmentId/take"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <TakeAssessment />
                </ProtectedRoute>
              }
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Catch all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </TooltipProvider>
      </InstitutionDataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
