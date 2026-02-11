import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen } from 'lucide-react';

interface CourseMappingSelectorProps {
  courseId?: string;
  moduleId?: string;
  sessionId?: string;
  onCourseChange: (courseId: string | undefined) => void;
  onModuleChange: (moduleId: string | undefined) => void;
  onSessionChange: (sessionId: string | undefined) => void;
}

interface CourseOption { id: string; title: string; }
interface ModuleOption { id: string; title: string; }
interface SessionOption { id: string; title: string; }

export const CourseMappingSelector = ({
  courseId, moduleId, sessionId,
  onCourseChange, onModuleChange, onSessionChange
}: CourseMappingSelectorProps) => {
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [modules, setModules] = useState<ModuleOption[]>([]);
  const [sessions, setSessions] = useState<SessionOption[]>([]);

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      const { data } = await supabase
        .from('courses')
        .select('id, title')
        .in('status', ['active', 'published'])
        .order('title');
      setCourses(data || []);
    };
    fetchCourses();
  }, []);

  // Fetch modules when course changes
  useEffect(() => {
    if (!courseId) { setModules([]); return; }
    const fetchModules = async () => {
      const { data } = await supabase
        .from('course_modules')
        .select('id, title')
        .eq('course_id', courseId)
        .order('display_order');
      setModules(data || []);
    };
    fetchModules();
  }, [courseId]);

  // Fetch sessions when module changes
  useEffect(() => {
    if (!moduleId) { setSessions([]); return; }
    const fetchSessions = async () => {
      const { data } = await supabase
        .from('course_sessions')
        .select('id, title')
        .eq('module_id', moduleId)
        .order('display_order');
      setSessions(data || []);
    };
    fetchSessions();
  }, [moduleId]);

  return (
    <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <BookOpen className="h-4 w-4" />
        Course Mapping (Optional)
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Course</Label>
          <Select
            value={courseId || 'none'}
            onValueChange={(val) => {
              const v = val === 'none' ? undefined : val;
              onCourseChange(v);
              onModuleChange(undefined);
              onSessionChange(undefined);
            }}
          >
            <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {courses.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Level (Module)</Label>
          <Select
            value={moduleId || 'none'}
            onValueChange={(val) => {
              const v = val === 'none' ? undefined : val;
              onModuleChange(v);
              onSessionChange(undefined);
            }}
            disabled={!courseId}
          >
            <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {modules.map(m => (
                <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Session</Label>
          <Select
            value={sessionId || 'none'}
            onValueChange={(val) => onSessionChange(val === 'none' ? undefined : val)}
            disabled={!moduleId}
          >
            <SelectTrigger><SelectValue placeholder="Select session" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {sessions.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
