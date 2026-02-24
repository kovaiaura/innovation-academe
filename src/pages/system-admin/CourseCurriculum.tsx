import { useState, useEffect, useMemo } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { pdf } from '@react-pdf/renderer';
import { CurriculumFilters } from '@/components/curriculum/CurriculumFilters';
import { CurriculumDisplay, CurriculumLevel } from '@/components/curriculum/CurriculumDisplay';
import { CurriculumPDF } from '@/components/curriculum/pdf/CurriculumPDF';
import { BookOpen } from 'lucide-react';

interface Course { id: string; title: string; }
interface Module { id: string; title: string; display_order: number; course_id: string; }
interface Session { id: string; title: string; display_order: number; course_id: string; module_id: string; }

export default function CourseCurriculum() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('all');
  const [selectedModuleId, setSelectedModuleId] = useState('all');
  const [isDownloading, setIsDownloading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [coursesRes, modulesRes, sessionsRes] = await Promise.all([
        supabase.from('courses').select('id, title').order('title'),
        supabase.from('course_modules').select('id, title, display_order, course_id').order('display_order'),
        supabase.from('course_sessions').select('id, title, display_order, course_id, module_id').order('display_order'),
      ]);

      if (coursesRes.error || modulesRes.error || sessionsRes.error) {
        toast.error('Failed to load curriculum data');
      } else {
        setCourses(coursesRes.data || []);
        setModules(modulesRes.data || []);
        setSessions(sessionsRes.data || []);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // Unique modules for filter dropdown (deduplicated by title)
  const uniqueModules = useMemo(() => {
    const seen = new Map<string, Module>();
    modules.forEach((m) => {
      if (!seen.has(m.title)) seen.set(m.title, m);
    });
    return Array.from(seen.values()).sort((a, b) => a.display_order - b.display_order);
  }, [modules]);

  // Build curriculum data grouped by level -> course -> sessions
  const curriculumData: CurriculumLevel[] = useMemo(() => {
    // Filter modules
    let filteredModules = modules;
    if (selectedModuleId !== 'all') {
      const selectedTitle = modules.find((m) => m.id === selectedModuleId)?.title;
      filteredModules = modules.filter((m) => m.title === selectedTitle);
    }
    if (selectedCourseId !== 'all') {
      filteredModules = filteredModules.filter((m) => m.course_id === selectedCourseId);
    }

    // Group by module title (level)
    const levelMap = new Map<string, { moduleId: string; modules: Module[] }>();
    filteredModules.forEach((m) => {
      if (!levelMap.has(m.title)) {
        levelMap.set(m.title, { moduleId: m.id, modules: [] });
      }
      levelMap.get(m.title)!.modules.push(m);
    });

    const result: CurriculumLevel[] = [];
    levelMap.forEach((val, levelTitle) => {
      const coursesInLevel = val.modules
        .map((mod) => {
          const course = courses.find((c) => c.id === mod.course_id);
          if (!course) return null;
          const moduleSessions = sessions
            .filter((s) => s.module_id === mod.id)
            .sort((a, b) => a.display_order - b.display_order);
          return {
            courseId: course.id,
            courseTitle: course.title,
            sessions: moduleSessions.map((s) => ({ id: s.id, title: s.title, display_order: s.display_order })),
          };
        })
        .filter(Boolean) as CurriculumLevel['courses'];

      if (coursesInLevel.length > 0) {
        result.push({ moduleId: val.moduleId, moduleTitle: levelTitle, courses: coursesInLevel });
      }
    });

    // Sort levels by display_order of first module
    return result.sort((a, b) => {
      const aOrder = modules.find((m) => m.title === a.moduleTitle)?.display_order ?? 0;
      const bOrder = modules.find((m) => m.title === b.moduleTitle)?.display_order ?? 0;
      return aOrder - bOrder;
    });
  }, [modules, sessions, courses, selectedCourseId, selectedModuleId]);

  const filterLabel = useMemo(() => {
    const parts: string[] = [];
    if (selectedModuleId !== 'all') {
      const m = modules.find((mod) => mod.id === selectedModuleId);
      if (m) parts.push(m.title);
    }
    if (selectedCourseId !== 'all') {
      const c = courses.find((co) => co.id === selectedCourseId);
      if (c) parts.push(c.title);
    }
    return parts.length > 0 ? parts.join(' - ') : 'All Courses';
  }, [selectedCourseId, selectedModuleId, courses, modules]);

  const handleDownloadPDF = async () => {
    if (curriculumData.length === 0) {
      toast.error('No data to download');
      return;
    }
    setIsDownloading(true);
    try {
      const blob = await pdf(<CurriculumPDF data={curriculumData} filterLabel={filterLabel} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `MetaINNOVA_Curriculum_${filterLabel.replace(/\s+/g, '_')}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('PDF downloaded successfully');
    } catch (err) {
      console.error('PDF generation failed:', err);
      toast.error('Failed to generate PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleReset = () => {
    setSelectedCourseId('all');
    setSelectedModuleId('all');
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <header className="border-b bg-card px-6 py-4 flex items-center gap-3">
            <SidebarTrigger />
            <BookOpen className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Course Curriculum</h1>
          </header>

          <main className="flex-1 p-6 space-y-6">
            <CurriculumFilters
              courses={courses}
              modules={uniqueModules}
              selectedCourseId={selectedCourseId}
              selectedModuleId={selectedModuleId}
              onCourseChange={setSelectedCourseId}
              onModuleChange={setSelectedModuleId}
              onDownloadPDF={handleDownloadPDF}
              onReset={handleReset}
              isDownloading={isDownloading}
            />

            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading curriculum...</div>
            ) : (
              <CurriculumDisplay data={curriculumData} />
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
