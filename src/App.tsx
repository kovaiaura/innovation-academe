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
import StudentDashboard from "./pages/student/Dashboard";
import StudentCourses from "./pages/student/Courses";
import StudentProjects from "./pages/student/Projects";
import StudentTimetable from "./pages/student/Timetable";
import StudentCertificates from "./pages/student/Certificates";
import StudentGamification from "./pages/student/Gamification";
import StudentResume from "./pages/student/Resume";

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
