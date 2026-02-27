import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, Info } from 'lucide-react';

interface CourseMappingSelectorProps {
  courseId?: string;
  moduleId?: string;
  sessionId?: string;
  onCourseChange: (courseId: string | undefined) => void;
  onModuleChange: (moduleId: string | undefined) => void;
  onSessionChange: (sessionId: string | undefined) => void;
  institutionId?: string;
  classId?: string;
}

interface CourseOption { id: string; title: string; }
interface ModuleOption { id: string; title: string; }
interface SessionOption { id: string; title: string; }

export const CourseMappingSelector = ({
  courseId, moduleId, sessionId,
  onCourseChange, onModuleChange, onSessionChange,
  institutionId, classId
}: CourseMappingSelectorProps) => {
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [modules, setModules] = useState<ModuleOption[]>([]);
  const [sessions, setSessions] = useState<SessionOption[]>([]);
  const isFiltered = !!institutionId && !!classId;

  // Fetch courses - filtered by class allocation if institutionId & classId provided
  useEffect(() => {
    const fetchCourses = async () => {
      if (isFiltered) {
        // Get courses assigned to this class
        const { data: classAssignments } = await supabase
          .from('course_class_assignments')
          .select('course_id')
          .eq('class_id', classId)
          .eq('institution_id', institutionId!);

        if (!classAssignments || classAssignments.length === 0) {
          setCourses([]);
          return;
        }

        const courseIds = [...new Set(classAssignments.map(ca => ca.course_id))];
        const { data } = await supabase
          .from('courses')
          .select('id, title')
          .in('id', courseIds)
          .order('title');
        setCourses(data || []);
      } else {
        // Fallback: fetch all active courses
        const { data } = await supabase
          .from('courses')
          .select('id, title')
          .in('status', ['active', 'published'])
          .order('title');
        setCourses(data || []);
      }
    };
    fetchCourses();
  }, [institutionId, classId, isFiltered]);

  // Fetch modules when course changes - filtered by institution assignment
  useEffect(() => {
    if (!courseId) { setModules([]); return; }
    const fetchModules = async () => {
      if (isFiltered) {
        // Get selected module IDs from institution assignment
        const { data: instAssignment } = await supabase
          .from('course_institution_assignments')
          .select('selected_module_ids')
          .eq('course_id', courseId)
          .eq('institution_id', institutionId!)
          .single();

        const selectedModuleIds = instAssignment?.selected_module_ids as string[] | null;

        let query = supabase
          .from('course_modules')
          .select('id, title')
          .eq('course_id', courseId)
          .order('display_order');

        if (selectedModuleIds && selectedModuleIds.length > 0) {
          query = query.in('id', selectedModuleIds);
        }

        const { data } = await query;
        setModules(data || []);
      } else {
        const { data } = await supabase
          .from('course_modules')
          .select('id, title')
          .eq('course_id', courseId)
          .order('display_order');
        setModules(data || []);
      }
    };
    fetchModules();
  }, [courseId, institutionId, isFiltered]);

  // Fetch sessions when module changes - filtered by completed sessions
  useEffect(() => {
    if (!moduleId) { setSessions([]); return; }
    const fetchSessions = async () => {
      if (isFiltered) {
        // Get selected session IDs from institution assignment
        const { data: instAssignment } = await supabase
          .from('course_institution_assignments')
          .select('selected_session_ids')
          .eq('course_id', courseId!)
          .eq('institution_id', institutionId!)
          .single();

        const selectedSessionIds = instAssignment?.selected_session_ids as string[] | null;

        // Get sessions for this module
        let query = supabase
          .from('course_sessions')
          .select('id, title')
          .eq('module_id', moduleId)
          .order('display_order');

        if (selectedSessionIds && selectedSessionIds.length > 0) {
          query = query.in('id', selectedSessionIds);
        }

        // Also filter by completed sessions (sessions that have been marked completed via class_session_assignments)
        const { data: classAssignment } = await supabase
          .from('course_class_assignments')
          .select('id')
          .eq('class_id', classId!)
          .eq('course_id', courseId!)
          .single();

        if (classAssignment) {
          // Get module assignment
          const { data: moduleAssignment } = await supabase
            .from('class_module_assignments')
            .select('id')
            .eq('class_assignment_id', classAssignment.id)
            .eq('module_id', moduleId)
            .single();

          if (moduleAssignment) {
            // Get unlocked session assignments (completed = unlocked)
            const { data: sessionAssignments } = await supabase
              .from('class_session_assignments')
              .select('session_id')
              .eq('class_module_assignment_id', moduleAssignment.id)
              .eq('is_unlocked', true);

            if (sessionAssignments && sessionAssignments.length > 0) {
              const unlockedSessionIds = sessionAssignments.map(sa => sa.session_id);
              query = query.in('id', unlockedSessionIds);
            }
          }
        }

        const { data } = await query;
        setSessions(data || []);
      } else {
        const { data } = await supabase
          .from('course_sessions')
          .select('id, title')
          .eq('module_id', moduleId)
          .order('display_order');
        setSessions(data || []);
      }
    };
    fetchSessions();
  }, [moduleId, courseId, institutionId, classId, isFiltered]);

  return (
    <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <BookOpen className="h-4 w-4" />
        Course Mapping (Optional)
        {isFiltered && (
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full flex items-center gap-1">
            <Info className="h-3 w-3" />
            Filtered by class allocation
          </span>
        )}
      </div>
      {isFiltered && courses.length === 0 && (
        <p className="text-xs text-muted-foreground">No courses allocated to the selected class.</p>
      )}
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
