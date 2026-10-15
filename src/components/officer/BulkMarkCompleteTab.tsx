import { isNotApplicableTitle } from '@/utils/courseHelpers';
import { QuickBulkMarkCard } from './QuickBulkMarkCard';
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Loader2, BookOpen, ChevronRight, CheckCircle2, Users, ListChecks } from 'lucide-react';
import { useSessionCompletion, issueCertificatesForClass } from '@/hooks/useSessionCompletion';
import { toast } from 'sonner';

interface BulkMarkCompleteTabProps {
  classId: string;
  className: string;
}

export function BulkMarkCompleteTab({ classId, className }: BulkMarkCompleteTabProps) {
  const [selectedCourseAssignmentId, setSelectedCourseAssignmentId] = useState<string>('');
  const [selectedSessionIds, setSelectedSessionIds] = useState<Set<string>>(new Set());
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressCurrent, setProgressCurrent] = useState(0);
  const [progressTotal, setProgressTotal] = useState(0);
  const [markDate, setMarkDate] = useState<string>(() => new Date().toISOString().slice(0, 10));

  const { markSessionComplete } = useSessionCompletion();

  // Fetch course class assignments
  const { data: classAssignments, isLoading: loadingAssignments } = useQuery({
    queryKey: ['bulk-class-course-assignments', classId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_class_assignments')
        .select(`id, course_id, courses (id, title, course_code)`)
        .eq('class_id', classId);
      if (error) throw error;
      return data || [];
    }
  });

  const selectedAssignment = classAssignments?.find(ca => ca.id === selectedCourseAssignmentId);

  // Fetch module assignments for selected course
  const { data: moduleAssignments, isLoading: loadingModules } = useQuery({
    queryKey: ['bulk-module-assignments', selectedCourseAssignmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('class_module_assignments')
        .select(`id, class_assignment_id, module_id, is_unlocked, unlock_order,
          course_modules (id, title, display_order, course_id)`)
        .eq('class_assignment_id', selectedCourseAssignmentId)
        .order('unlock_order', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedCourseAssignmentId
  });

  // Fetch session assignments
  const { data: sessionAssignments, isLoading: loadingSessions } = useQuery({
    queryKey: ['bulk-session-assignments', moduleAssignments?.map(m => m.id).join(',')],
    queryFn: async () => {
      if (!moduleAssignments?.length) return [];
      const ids = moduleAssignments.map(m => m.id);
      const { data, error } = await supabase
        .from('class_session_assignments')
        .select(`id, class_module_assignment_id, session_id, is_unlocked, unlock_order,
          course_sessions (id, title, display_order, module_id)`)
        .in('class_module_assignment_id', ids)
        .order('unlock_order', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!moduleAssignments?.length
  });

  // Fetch students in class
  const { data: students, isLoading: loadingStudents } = useQuery({
    queryKey: ['bulk-class-students', classId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('id, student_name, roll_number, student_id')
        .eq('class_id', classId)
        .eq('status', 'active')
        .order('roll_number', { ascending: true });
      if (error) throw error;
      return data || [];
    }
  });

  // Group sessions by module
  const moduleTree = useMemo(() => {
    if (!moduleAssignments || !sessionAssignments) return [];
    return moduleAssignments
      .filter(mod => !isNotApplicableTitle(mod.course_modules?.title))
      .map(mod => ({
        ...mod,
        sessions: sessionAssignments.filter(s => s.class_module_assignment_id === mod.id)
      }))
      .sort((a, b) => (a.sessions.length === 0 ? 1 : 0) - (b.sessions.length === 0 ? 1 : 0));
  }, [moduleAssignments, sessionAssignments]);

  // Toggle helpers
  const toggleSession = (sessionId: string) => {
    setSelectedSessionIds(prev => {
      const next = new Set(prev);
      if (next.has(sessionId)) next.delete(sessionId);
      else next.add(sessionId);
      return next;
    });
  };

  const toggleAllSessionsInModule = (moduleId: string, sessions: typeof sessionAssignments) => {
    if (!sessions) return;
    const moduleSessions = sessions.filter(s => s.class_module_assignment_id === moduleId);
    const allSelected = moduleSessions.every(s => selectedSessionIds.has(s.session_id));
    setSelectedSessionIds(prev => {
      const next = new Set(prev);
      moduleSessions.forEach(s => {
        if (allSelected) next.delete(s.session_id);
        else next.add(s.session_id);
      });
      return next;
    });
  };

  const toggleStudent = (studentId: string) => {
    setSelectedStudentIds(prev => {
      const next = new Set(prev);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });
  };

  const toggleAllStudents = () => {
    if (!students) return;
    const allSelected = students.every(s => selectedStudentIds.has(s.id));
    if (allSelected) setSelectedStudentIds(new Set());
    else setSelectedStudentIds(new Set(students.map(s => s.id)));
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  // Handle bulk mark
  const handleBulkMark = async () => {
    if (selectedSessionIds.size === 0) {
      toast.error('Please select at least one session');
      return;
    }
    if (selectedStudentIds.size === 0) {
      toast.error('Please select at least one student');
      return;
    }

    setIsProcessing(true);
    const total = selectedSessionIds.size;
    setProgressTotal(total);
    setProgressCurrent(0);

    const studentArr = Array.from(selectedStudentIds);
    let successCount = 0;

    for (const sessionId of selectedSessionIds) {
      // Find the session assignment to get module info
      const sessionAssignment = sessionAssignments?.find(s => s.session_id === sessionId);
      const moduleAssignment = moduleAssignments?.find(
        m => m.id === sessionAssignment?.class_module_assignment_id
      );

      const success = await markSessionComplete(
        sessionId,
        studentArr,
        selectedCourseAssignmentId,
        classId,
        undefined, // timetableAssignmentId
        moduleAssignment?.module_id,
        selectedAssignment?.course_id,
        { silent: true, date: markDate, skipCertificates: true }
      );

      if (success) successCount++;
      setProgressCurrent(prev => prev + 1);
    }

    setIsProcessing(false);
    if (successCount > 0) void issueCertificatesForClass(classId, studentArr);
    if (successCount === total) {
      toast.success(`All ${total} session${total !== 1 ? 's' : ''} marked complete for ${studentArr.length} student${studentArr.length !== 1 ? 's' : ''}`);
      setSelectedSessionIds(new Set());
    } else if (successCount > 0) {
      toast.warning(`${successCount} of ${total} sessions marked complete (${total - successCount} failed)`);
      setSelectedSessionIds(new Set());
    } else {
      toast.error('Could not mark any sessions complete.');
    }
  };

  const handleCourseChange = (val: string) => {
    setSelectedCourseAssignmentId(val);
    setSelectedSessionIds(new Set());
    setExpandedModules(new Set());
  };

  const isLoading = loadingAssignments || loadingModules || loadingSessions || loadingStudents;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Bulk Mark Complete</h2>
        <p className="text-muted-foreground mt-1">
          Select sessions and students to mark as completed in bulk
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Date conducted</CardTitle>
        </CardHeader>
        <CardContent>
          <input
            type="date"
            value={markDate}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setMarkDate(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          />
        </CardContent>
      </Card>

      <QuickBulkMarkCard classId={classId} markDate={markDate} students={students || []} />

      {/* Course Selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Select Course
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingAssignments ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Select value={selectedCourseAssignmentId} onValueChange={handleCourseChange}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a course..." />
              </SelectTrigger>
              <SelectContent>
                {classAssignments?.map(ca => (
                  <SelectItem key={ca.id} value={ca.id}>
                    {ca.courses?.title} ({ca.courses?.course_code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {selectedCourseAssignmentId && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Levels & Sessions Tree */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ListChecks className="h-4 w-4" />
                Levels & Sessions
                {selectedSessionIds.size > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {selectedSessionIds.size} selected
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : moduleTree.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No levels found for this course
                </p>
              ) : (
                <div className="h-[420px] overflow-y-auto overscroll-contain rounded-md">
                  <div className="space-y-2 pr-3">
                    {moduleTree.map(mod => {
                      const moduleSessions = mod.sessions || [];
                      const allSelected = moduleSessions.length > 0 &&
                        moduleSessions.every(s => selectedSessionIds.has(s.session_id));
                      const someSelected = moduleSessions.some(s => selectedSessionIds.has(s.session_id));
                      const isExpanded = expandedModules.has(mod.id);

                      return (
                        <Collapsible
                          key={mod.id}
                          open={isExpanded}
                          onOpenChange={() => toggleModule(mod.id)}
                        >
                          <div className={`flex items-center gap-2 p-2 rounded-md border bg-muted/30 ${moduleSessions.length === 0 ? 'opacity-50' : ''}`} >
                            <Checkbox
                              checked={allSelected}
                              // @ts-ignore
                              indeterminate={someSelected && !allSelected}
                              onCheckedChange={() => toggleAllSessionsInModule(mod.id, sessionAssignments)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <CollapsibleTrigger asChild>
                              <button className="flex items-center gap-2 flex-1 text-left">
                                <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                <span className="text-sm font-medium">
                                  {mod.course_modules?.title || 'Level'}
                                </span>
                                <Badge variant="outline" className="ml-auto text-xs">
                                  {moduleSessions.length} sessions
                                </Badge>
                              </button>
                            </CollapsibleTrigger>
                          </div>
                          <CollapsibleContent>
                            <div className="ml-8 mt-1 space-y-1">
                              {moduleSessions.map(session => (
                                <div
                                  key={session.id}
                                  className="flex items-center gap-2 p-1.5 rounded hover:bg-muted/30 transition-colors"
                                >
                                  <Checkbox
                                    checked={selectedSessionIds.has(session.session_id)}
                                    onCheckedChange={() => toggleSession(session.session_id)}
                                  />
                                  <span className="text-sm">
                                    {session.course_sessions?.title || 'Session'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Student Selection */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Students
                  {selectedStudentIds.size > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {selectedStudentIds.size} selected
                    </Badge>
                  )}
                </CardTitle>
                {students && students.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={toggleAllStudents}>
                    {students.every(s => selectedStudentIds.has(s.id)) ? 'Deselect All' : 'Select All'}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loadingStudents ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : !students || students.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No active students in this class
                </p>
              ) : (
                <div className="h-[420px] overflow-y-auto overscroll-contain rounded-md">
                  <div className="space-y-1 pr-3">
                    {students.map(student => (
                      <div
                        key={student.id}
                        className="flex items-center gap-3 p-2 rounded hover:bg-muted/30 transition-colors"
                      >
                        <Checkbox
                          checked={selectedStudentIds.has(student.id)}
                          onCheckedChange={() => toggleStudent(student.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{student.student_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {student.student_id || student.roll_number || 'No ID'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Progress & Action */}
      {isProcessing && (
        <Card>
          <CardContent className="py-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing sessions...</span>
                <span>{progressCurrent} / {progressTotal}</span>
              </div>
              <Progress value={(progressCurrent / progressTotal) * 100} />
            </div>
          </CardContent>
        </Card>
      )}

      {selectedCourseAssignmentId && (
        <div className="sticky bottom-0 z-10 -mx-1 flex justify-end bg-background/95 px-1 py-3 backdrop-blur">
          <Button
            size="lg"
            onClick={handleBulkMark}
            disabled={isProcessing || selectedSessionIds.size === 0 || selectedStudentIds.size === 0}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark {selectedSessionIds.size} Session{selectedSessionIds.size !== 1 ? 's' : ''} Complete
                {selectedStudentIds.size > 0 && ` for ${selectedStudentIds.size} Student${selectedStudentIds.size !== 1 ? 's' : ''}`}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
