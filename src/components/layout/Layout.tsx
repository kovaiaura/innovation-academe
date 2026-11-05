import { Sidebar } from './Sidebar';
import { AcademicYearSelector } from './AcademicYearSelector';
import { useAuth } from '@/contexts/AuthContext';
import { useStudentCopyProtection } from '@/hooks/useStudentCopyProtection';

interface LayoutProps {
  children: React.ReactNode;
  hideNav?: boolean;
  showAcademicYear?: boolean;
}

export function Layout({ children, hideNav = false, showAcademicYear = true }: LayoutProps) {
  const { user } = useAuth();
  useStudentCopyProtection(user?.role === 'student');

  if (hideNav) {
    return (
      <main className="h-screen overflow-hidden bg-gray-50">
        {children}
      </main>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
        {showAcademicYear && (
          <div className="mb-4 flex justify-end">
            <AcademicYearSelector />
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
