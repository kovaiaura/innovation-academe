import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import SuperAdminDashboard from "./pages/super-admin/Dashboard";
import SuperAdminTenants from "./pages/super-admin/Tenants";
import SuperAdminSystemConfig from "./pages/super-admin/SystemConfig";
import SuperAdminAuditLogs from "./pages/super-admin/AuditLogs";
import SystemAdminDashboard from "./pages/system-admin/Dashboard";
import SystemAdminInstitutions from "./pages/system-admin/Institutions";
import SystemAdminLicenses from "./pages/system-admin/Licenses";
import SystemAdminReports from "./pages/system-admin/Reports";
import StudentDashboard from "./pages/student/Dashboard";
import StudentCourses from "./pages/student/Courses";
import StudentProjects from "./pages/student/Projects";
import StudentTimetable from "./pages/student/Timetable";
import StudentCertificates from "./pages/student/Certificates";
import StudentGamification from "./pages/student/Gamification";
import StudentResume from "./pages/student/Resume";
import OfficerDashboard from "./pages/officer/Dashboard";
import OfficerSessions from "./pages/officer/Sessions";
import OfficerProjects from "./pages/officer/Projects";
import OfficerInventory from "./pages/officer/Inventory";
import OfficerAttendance from "./pages/officer/Attendance";
import InstitutionDashboard from "./pages/institution/Dashboard";
import InstitutionTeachers from "./pages/institution/Teachers";
import InstitutionStudents from "./pages/institution/Students";
import InstitutionCourses from "./pages/institution/Courses";
import InstitutionReports from "./pages/institution/Reports";
import TeacherDashboard from "./pages/teacher/Dashboard";
import TeacherCourses from "./pages/teacher/Courses";
import TeacherGrades from "./pages/teacher/Grades";
import TeacherAttendance from "./pages/teacher/Attendance";
import TeacherSchedule from "./pages/teacher/Schedule";
import TeacherMaterials from "./pages/teacher/Materials";
import ManagementDashboard from "./pages/management/Dashboard";
import ManagementFaculty from "./pages/management/Faculty";
import ManagementPerformance from "./pages/management/Performance";
import ManagementReports from "./pages/management/Reports";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Super Admin Routes */}
            <Route
              path="/super-admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <SuperAdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/super-admin/tenants"
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <SuperAdminTenants />
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

            {/* System Admin Routes */}
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
                  <SystemAdminInstitutions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/system-admin/licenses"
              element={
                <ProtectedRoute allowedRoles={['system_admin']}>
                  <SystemAdminLicenses />
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

            {/* Institution Admin Routes (path-based multi-tenancy) */}
            <Route
              path="/tenant/:tenantId/institution/dashboard"
              element={
                <ProtectedRoute allowedRoles={['institution_admin']}>
                  <InstitutionDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant/:tenantId/institution/teachers"
              element={
                <ProtectedRoute allowedRoles={['institution_admin']}>
                  <InstitutionTeachers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant/:tenantId/institution/students"
              element={
                <ProtectedRoute allowedRoles={['institution_admin']}>
                  <InstitutionStudents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant/:tenantId/institution/courses"
              element={
                <ProtectedRoute allowedRoles={['institution_admin']}>
                  <InstitutionCourses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant/:tenantId/institution/reports"
              element={
                <ProtectedRoute allowedRoles={['institution_admin']}>
                  <InstitutionReports />
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

            {/* Management Routes (path-based multi-tenancy) */}
            <Route
              path="/tenant/:tenantId/management/dashboard"
              element={
                <ProtectedRoute allowedRoles={['management']}>
                  <ManagementDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant/:tenantId/management/faculty"
              element={
                <ProtectedRoute allowedRoles={['management']}>
                  <ManagementFaculty />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenant/:tenantId/management/performance"
              element={
                <ProtectedRoute allowedRoles={['management']}>
                  <ManagementPerformance />
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

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Catch all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
