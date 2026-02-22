import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { BookOpen, ChevronDown, ChevronRight, Loader2, Plus, Trash2, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface InstitutionCoursesTabProps {
  institutionId: string;
  institutionName: string;
}

interface CourseWithModules {
  id: string;
  title: string;
  course_code: string;
  description: string | null;
  status: string;
  modules: {
    id: string;
    title: string;
    display_order: number;
    sessions: {
      id: string;
      title: string;
      display_order: number;
    }[];
  }[];
}

interface AssignedCourse {
  id: string;
  course_id: string;
  institution_id: string;
  selected_module_ids: string[] | null;
  selected_session_ids: string[] | null;
  assigned_at: string;
}

export function InstitutionCoursesTab({ institutionId, institutionName }: InstitutionCoursesTabProps) {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedModuleIds, setSelectedModuleIds] = useState<Set<string>>(new Set());
  const [selectedSessionIds, setSelectedSessionIds] = useState<Set<string>>(new Set());
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [editingAssignment, setEditingAssignment] = useState<string | null>(null);

  // Fetch all active courses with modules and sessions
  const { data: allCourses, isLoading: isLoadingCourses } = useQuery({
    queryKey: ['all-courses-with-structure'],
    queryFn: async () => {
      const { data: courses, error } = await supabase
        .from('courses')
        .select('id, title, course_code, description, status')
        .in('status', ['active', 'published'])
        .order('title');
      if (error) throw error;

      const courseIds = courses.map(c => c.id);
      if (courseIds.length === 0) return [];

      const { data: modules, error: modErr } = await supabase
        .from('course_modules')
        .select('id, course_id, title, display_order')
        .in('course_id', courseIds)
        .order('display_order');
      if (modErr) throw modErr;

      const moduleIds = (modules || []).map(m => m.id);
      let sessions: any[] = [];
      if (moduleIds.length > 0) {
        const BATCH = 50;
        for (let i = 0; i < moduleIds.length; i += BATCH) {
          const batch = moduleIds.slice(i, i + BATCH);
          const { data, error: sesErr } = await supabase
            .from('course_sessions')
            .select('id, module_id, title, display_order')
            .in('module_id', batch)
            .order('display_order');
          if (sesErr) throw sesErr;
          if (data) sessions.push(...data);
        }
      }

      return courses.map(course => ({
        ...course,
        modules: (modules || [])
          .filter(m => m.course_id === course.id)
          .map(m => ({
            ...m,
            sessions: sessions.filter(s => s.module_id === m.id),
          })),
      })) as CourseWithModules[];
    },
  });

  // Fetch assigned courses for this institution
  const { data: assignedCourses, isLoading: isLoadingAssigned } = useQuery({
    queryKey: ['institution-course-assignments', institutionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_institution_assignments')
        .select('*')
        .eq('institution_id', institutionId);
      if (error) throw error;
      return (data || []) as AssignedCourse[];
    },
  });

  // Assign course mutation
  const assignCourse = useMutation({
    mutationFn: async ({ courseId, moduleIds, sessionIds }: { courseId: string; moduleIds: string[] | null; sessionIds: string[] | null }) => {
      const { error } = await supabase
        .from('course_institution_assignments')
        .insert({
          course_id: courseId,
          institution_id: institutionId,
          selected_module_ids: moduleIds,
          selected_session_ids: sessionIds,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institution-course-assignments', institutionId] });
      toast.success('Course assigned successfully');
      resetDialog();
    },
    onError: (error: any) => {
      if (error.message?.includes('duplicate')) {
        toast.error('Course is already assigned to this institution');
      } else {
        toast.error(`Failed to assign: ${error.message}`);
      }
    },
  });

  // Update assignment mutation
  const updateAssignment = useMutation({
    mutationFn: async ({ assignmentId, moduleIds, sessionIds }: { assignmentId: string; moduleIds: string[] | null; sessionIds: string[] | null }) => {
      const { error } = await supabase
        .from('course_institution_assignments')
        .update({
          selected_module_ids: moduleIds,
          selected_session_ids: sessionIds,
        })
        .eq('id', assignmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institution-course-assignments', institutionId] });
      toast.success('Course selection updated');
      setEditingAssignment(null);
    },
    onError: (error: any) => {
      toast.error(`Failed to update: ${error.message}`);
    },
  });

  // Unassign course mutation
  const unassignCourse = useMutation({
    mutationFn: async (assignmentId: string) => {
      const { error } = await supabase
        .from('course_institution_assignments')
        .delete()
        .eq('id', assignmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institution-course-assignments', institutionId] });
      toast.success('Course removed from institution');
    },
    onError: (error: any) => {
      toast.error(`Failed to remove: ${error.message}`);
    },
  });

  const resetDialog = () => {
    setIsAddDialogOpen(false);
    setSelectedCourseId(null);
    setSelectedModuleIds(new Set());
    setSelectedSessionIds(new Set());
    setExpandedCourses(new Set());
    setExpandedModules(new Set());
  };

  const assignedCourseIds = new Set((assignedCourses || []).map(a => a.course_id));
  const unassignedCourses = (allCourses || []).filter(c => !assignedCourseIds.has(c.id));

  const selectedCourse = (allCourses || []).find(c => c.id === selectedCourseId);

  const toggleModule = (moduleId: string, course: CourseWithModules) => {
    const newModules = new Set(selectedModuleIds);
    const mod = course.modules.find(m => m.id === moduleId);
    if (newModules.has(moduleId)) {
      newModules.delete(moduleId);
      // Also remove all sessions of this module
      const newSessions = new Set(selectedSessionIds);
      mod?.sessions.forEach(s => newSessions.delete(s.id));
      setSelectedSessionIds(newSessions);
    } else {
      newModules.add(moduleId);
      // Also add all sessions of this module
      const newSessions = new Set(selectedSessionIds);
      mod?.sessions.forEach(s => newSessions.add(s.id));
      setSelectedSessionIds(newSessions);
    }
    setSelectedModuleIds(newModules);
  };

  const toggleSession = (sessionId: string, moduleId: string) => {
    const newSessions = new Set(selectedSessionIds);
    if (newSessions.has(sessionId)) {
      newSessions.delete(sessionId);
    } else {
      newSessions.add(sessionId);
      // Ensure parent module is selected
      const newModules = new Set(selectedModuleIds);
      newModules.add(moduleId);
      setSelectedModuleIds(newModules);
    }
    setSelectedSessionIds(newSessions);
  };

  const selectAllModulesAndSessions = (course: CourseWithModules) => {
    const newModules = new Set<string>();
    const newSessions = new Set<string>();
    course.modules.forEach(m => {
      newModules.add(m.id);
      m.sessions.forEach(s => newSessions.add(s.id));
    });
    setSelectedModuleIds(newModules);
    setSelectedSessionIds(newSessions);
  };

  const handleAssign = () => {
    if (!selectedCourseId || !selectedCourse) return;
    const allModulesSelected = selectedCourse.modules.every(m => selectedModuleIds.has(m.id));
    const allSessionsSelected = selectedCourse.modules.every(m => m.sessions.every(s => selectedSessionIds.has(s.id)));
    const isAll = allModulesSelected && allSessionsSelected;

    assignCourse.mutate({
      courseId: selectedCourseId,
      moduleIds: isAll ? null : Array.from(selectedModuleIds),
      sessionIds: isAll ? null : Array.from(selectedSessionIds),
    });
  };

  const handleStartEdit = (assignment: AssignedCourse) => {
    setEditingAssignment(assignment.id);
    const course = (allCourses || []).find(c => c.id === assignment.course_id);
    if (!course) return;

    if (!assignment.selected_module_ids) {
      // All selected
      selectAllForCourse(course);
    } else {
      setSelectedModuleIds(new Set(assignment.selected_module_ids));
      setSelectedSessionIds(new Set(assignment.selected_session_ids || []));
    }
  };

  const selectAllForCourse = (course: CourseWithModules) => {
    const mods = new Set<string>();
    const sess = new Set<string>();
    course.modules.forEach(m => {
      mods.add(m.id);
      m.sessions.forEach(s => sess.add(s.id));
    });
    setSelectedModuleIds(mods);
    setSelectedSessionIds(sess);
  };

  const handleSaveEdit = (assignment: AssignedCourse) => {
    const course = (allCourses || []).find(c => c.id === assignment.course_id);
    if (!course) return;
    const allModulesSelected = course.modules.every(m => selectedModuleIds.has(m.id));
    const allSessionsSelected = course.modules.every(m => m.sessions.every(s => selectedSessionIds.has(s.id)));
    const isAll = allModulesSelected && allSessionsSelected;

    updateAssignment.mutate({
      assignmentId: assignment.id,
      moduleIds: isAll ? null : Array.from(selectedModuleIds),
      sessionIds: isAll ? null : Array.from(selectedSessionIds),
    });
  };

  const handleCancelEdit = () => {
    setEditingAssignment(null);
    setSelectedModuleIds(new Set());
    setSelectedSessionIds(new Set());
  };

  const getAssignmentSummary = (assignment: AssignedCourse, course?: CourseWithModules) => {
    if (!course) return 'Course not found';
    if (!assignment.selected_module_ids) return 'All modules & sessions';
    const modCount = assignment.selected_module_ids.length;
    const sesCount = assignment.selected_session_ids?.length || 0;
    return `${modCount} module${modCount !== 1 ? 's' : ''}, ${sesCount} session${sesCount !== 1 ? 's' : ''}`;
  };

  if (isLoadingCourses || isLoadingAssigned) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Assigned Courses</h3>
          <p className="text-sm text-muted-foreground">
            Select which courses, modules, and sessions are visible to {institutionName}
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} disabled={unassignedCourses.length === 0}>
          <Plus className="h-4 w-4 mr-2" />
          Assign Course
        </Button>
      </div>

      {/* Assigned courses list */}
      {(!assignedCourses || assignedCourses.length === 0) ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No courses assigned to this institution yet.</p>
            <Button className="mt-4" variant="outline" onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Assign First Course
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {assignedCourses.map(assignment => {
            const course = (allCourses || []).find(c => c.id === assignment.course_id);
            const isEditing = editingAssignment === assignment.id;

            return (
              <Card key={assignment.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">{course?.title || 'Unknown Course'}</h4>
                      <p className="text-sm text-muted-foreground">{course?.course_code}</p>
                      <Badge variant="secondary" className="mt-1">
                        {getAssignmentSummary(assignment, course)}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      {isEditing ? (
                        <>
                          <Button size="sm" onClick={() => handleSaveEdit(assignment)} disabled={updateAssignment.isPending}>
                            <Save className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleStartEdit(assignment)}>
                            Edit Selection
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              if (window.confirm('Remove this course from the institution?')) {
                                unassignCourse.mutate(assignment.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Editing mode - show module/session checkboxes */}
                  {isEditing && course && (
                    <div className="mt-4 border rounded-md p-3 space-y-2">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Select Modules & Sessions</span>
                        <Button size="sm" variant="ghost" onClick={() => selectAllForCourse(course)}>
                          Select All
                        </Button>
                      </div>
                      {course.modules.map(mod => (
                        <ModuleCheckbox
                          key={mod.id}
                          module={mod}
                          selectedModuleIds={selectedModuleIds}
                          selectedSessionIds={selectedSessionIds}
                          onToggleModule={(id) => toggleModule(id, course)}
                          onToggleSession={(sId, mId) => toggleSession(sId, mId)}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add course dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => { if (!open) resetDialog(); else setIsAddDialogOpen(true); }}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Assign Course to {institutionName}</DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[55vh] pr-4">
            {!selectedCourseId ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground mb-3">Select a course to assign:</p>
                {unassignedCourses.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">All courses are already assigned.</p>
                ) : (
                  unassignedCourses.map(course => (
                    <Card
                      key={course.id}
                      className="cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => {
                        setSelectedCourseId(course.id);
                        selectAllModulesAndSessions(course);
                      }}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{course.title}</p>
                            <p className="text-sm text-muted-foreground">{course.course_code} · {course.modules.length} modules</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            ) : selectedCourse ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{selectedCourse.title}</h4>
                    <p className="text-sm text-muted-foreground">{selectedCourse.course_code}</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => selectAllModulesAndSessions(selectedCourse)}>
                    Select All
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground">
                  Choose which modules and sessions to make visible. All are selected by default.
                </p>

                <div className="space-y-2">
                  {selectedCourse.modules.map(mod => (
                    <ModuleCheckbox
                      key={mod.id}
                      module={mod}
                      selectedModuleIds={selectedModuleIds}
                      selectedSessionIds={selectedSessionIds}
                      onToggleModule={(id) => toggleModule(id, selectedCourse)}
                      onToggleSession={(sId, mId) => toggleSession(sId, mId)}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </ScrollArea>

          <DialogFooter>
            {selectedCourseId && (
              <Button variant="outline" onClick={() => { setSelectedCourseId(null); setSelectedModuleIds(new Set()); setSelectedSessionIds(new Set()); }}>
                Back
              </Button>
            )}
            <Button variant="outline" onClick={resetDialog}>Cancel</Button>
            {selectedCourseId && (
              <Button
                onClick={handleAssign}
                disabled={selectedModuleIds.size === 0 || assignCourse.isPending}
              >
                {assignCourse.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Assign Course
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ModuleCheckbox({
  module,
  selectedModuleIds,
  selectedSessionIds,
  onToggleModule,
  onToggleSession,
}: {
  module: { id: string; title: string; sessions: { id: string; title: string }[] };
  selectedModuleIds: Set<string>;
  selectedSessionIds: Set<string>;
  onToggleModule: (id: string) => void;
  onToggleSession: (sessionId: string, moduleId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isModuleSelected = selectedModuleIds.has(module.id);
  const selectedSessionCount = module.sessions.filter(s => selectedSessionIds.has(s.id)).length;

  return (
    <div className="border rounded-md p-2">
      <div className="flex items-center gap-2">
        <Checkbox
          checked={isModuleSelected}
          onCheckedChange={() => onToggleModule(module.id)}
        />
        <button
          className="flex items-center gap-1 flex-1 text-left text-sm font-medium"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          {module.title}
        </button>
        <span className="text-xs text-muted-foreground">
          {selectedSessionCount}/{module.sessions.length} sessions
        </span>
      </div>
      {expanded && module.sessions.length > 0 && (
        <div className="ml-8 mt-2 space-y-1">
          {module.sessions.map(session => (
            <div key={session.id} className="flex items-center gap-2">
              <Checkbox
                checked={selectedSessionIds.has(session.id)}
                onCheckedChange={() => onToggleSession(session.id, module.id)}
              />
              <span className="text-sm">{session.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
