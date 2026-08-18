import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Download, Clock, UserCheck, UserX, AlertCircle, Users, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useOfficerByUserId } from "@/hooks/useOfficerProfile";
import { 
  useOfficerClassAttendance, 
  useSaveClassAttendance, 
  useMarkSessionCompleted,
  AttendanceRecord 
} from "@/hooks/useClassSessionAttendance";
import { useReceivedAccessGrants } from "@/hooks/useOfficerClassAccess";
import { useSessionCompletion } from "@/hooks/useSessionCompletion";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface ClassSession {
  id: string;
  timetable_assignment_id: string;
  title: string;
  className: string;
  classId: string;
  section: string;
  date: string;
  startTime: string;
  endTime: string;
  subject: string;
  periodLabel: string;
  accessType?: 'primary' | 'secondary' | 'backup' | 'delegated';
}

interface StudentRecord {
  id: string;
  student_name: string;
  roll_number: string;
  avatar?: string;
  status: "present" | "absent" | "late";
  check_in_time?: string;
}

const Attendance = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [availableSessions, setAvailableSessions] = useState<ClassSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string>("");
  const [attendance, setAttendance] = useState<StudentRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  
  // Get officer profile from Supabase
  const { data: officerProfile, isLoading: isLoadingOfficer } = useOfficerByUserId(user?.id);
  const primaryInstitutionId = officerProfile?.assigned_institutions?.[0] || '';
  
  // Get saved attendance for today
  const { data: savedAttendance, isLoading: isLoadingAttendance } = useOfficerClassAttendance(
    officerProfile?.id,
    selectedDate
  );
  
  // Mutations
  const saveAttendanceMutation = useSaveClassAttendance();
  const markCompletedMutation = useMarkSessionCompleted();
  const { markSessionComplete, isLoading: isMarkingCurriculum } = useSessionCompletion();

  // Curriculum picker state (Course -> multi Level/Module -> multi Session)
  const [selectedCourseAssignmentId, setSelectedCourseAssignmentId] = useState<string>('');
  const [selectedModuleAssignmentIds, setSelectedModuleAssignmentIds] = useState<string[]>([]);
  const [selectedCurriculumSessionIds, setSelectedCurriculumSessionIds] = useState<string[]>([]);
  const [classRemark, setClassRemark] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);


  // Get delegated access grants for today
  const { data: accessGrants } = useReceivedAccessGrants(officerProfile?.id);

  // Load officer's timetable assignments from Supabase (including delegated classes)
  useEffect(() => {
    const loadTimetable = async () => {
      if (!officerProfile?.id || !primaryInstitutionId) return;
      
      const dayOfWeek = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' });
      const today = new Date().toISOString().split('T')[0];
      const isToday = selectedDate === today;
      
      // Fetch assignments where officer is primary, secondary, or backup
      const { data, error } = await supabase
        .from('institution_timetable_assignments')
        .select(`
          *,
          institution_periods!inner (
            label,
            start_time,
            end_time
          )
        `)
        .eq('institution_id', primaryInstitutionId)
        .eq('day', dayOfWeek)
        .or(`teacher_id.eq.${officerProfile.id},secondary_officer_id.eq.${officerProfile.id},backup_officer_id.eq.${officerProfile.id}`);
      
      if (error) {
        console.error('Error loading timetable:', error);
        return;
      }
      
      const sessions: ClassSession[] = (data || []).map(slot => {
        let accessType: ClassSession['accessType'] = 'primary';
        if (slot.teacher_id === officerProfile.id) {
          accessType = 'primary';
        } else if (slot.secondary_officer_id === officerProfile.id) {
          accessType = 'secondary';
        } else if (slot.backup_officer_id === officerProfile.id) {
          accessType = 'backup';
        }
        
        return {
          id: slot.id,
          timetable_assignment_id: slot.id,
          title: `${slot.subject} - ${slot.class_name}`,
          className: slot.class_name,
          classId: slot.class_id,
          section: 'A',
          date: selectedDate,
          startTime: (slot.institution_periods as any)?.start_time || '',
          endTime: (slot.institution_periods as any)?.end_time || '',
          subject: slot.subject,
          periodLabel: (slot.institution_periods as any)?.label || '',
          accessType,
        };
      });
      
      // Add delegated classes (only for today)
      if (isToday && accessGrants && accessGrants.length > 0) {
        for (const grant of accessGrants) {
          // Fetch timetable assignments for delegated class
          const { data: delegatedAssignments } = await supabase
            .from('institution_timetable_assignments')
            .select(`
              *,
              institution_periods!inner (
                label,
                start_time,
                end_time
              )
            `)
            .eq('class_id', grant.class_id)
            .eq('institution_id', primaryInstitutionId)
            .eq('day', dayOfWeek);
          
          if (delegatedAssignments) {
            for (const slot of delegatedAssignments) {
              // Check if this slot is already in sessions
              const exists = sessions.find(s => s.id === slot.id);
              if (!exists) {
                sessions.push({
                  id: slot.id,
                  timetable_assignment_id: slot.id,
                  title: `${slot.subject} - ${slot.class_name}`,
                  className: slot.class_name,
                  classId: slot.class_id,
                  section: 'A',
                  date: selectedDate,
                  startTime: (slot.institution_periods as any)?.start_time || '',
                  endTime: (slot.institution_periods as any)?.end_time || '',
                  subject: slot.subject,
                  periodLabel: (slot.institution_periods as any)?.label || '',
                  accessType: 'delegated',
                });
              }
            }
          }
        }
      }
      
      // Sort by start time
      sessions.sort((a, b) => a.startTime.localeCompare(b.startTime));
      
      setAvailableSessions(sessions);
      if (sessions.length > 0 && !selectedSession) {
        setSelectedSession(sessions[0].id);
      }
    };
    
    loadTimetable();
  }, [officerProfile?.id, primaryInstitutionId, selectedDate, accessGrants]);

  // Load students when session is selected
  useEffect(() => {
    const loadStudents = async () => {
      if (!selectedSession || !primaryInstitutionId) return;
      
      const session = availableSessions.find(s => s.id === selectedSession);
      if (!session) return;
      
      setIsLoadingStudents(true);
      
      try {
        // Load students for the selected class
        const { data: students, error } = await supabase
          .from('students')
          .select('id, student_name, roll_number, avatar')
          .eq('class_id', session.classId)
          .eq('institution_id', primaryInstitutionId)
          .eq('status', 'active');
        
        if (error) throw error;
        
        // Check if we have saved attendance for this session
        const savedRecord = savedAttendance?.find(
          a => a.timetable_assignment_id === selectedSession
        );
        
        // Initialize attendance records
        const attendanceRecords: StudentRecord[] = (students || []).map(student => {
          // Check if there's saved status for this student
          const savedStatus = savedRecord?.attendance_records?.find(
            (r: AttendanceRecord) => r.student_id === student.id
          );
          
          return {
            id: student.id,
            student_name: student.student_name,
            roll_number: student.roll_number || '',
            avatar: student.avatar || undefined,
            status: savedStatus?.status || "absent",
            check_in_time: savedStatus?.check_in_time,
          };
        });
        
        setAttendance(attendanceRecords);
        setClassRemark(savedRecord?.notes || '');
      } catch (error) {
        console.error('Error loading students:', error);
        toast.error('Failed to load students');
      } finally {
        setIsLoadingStudents(false);
      }
    };
    
    loadStudents();
  }, [selectedSession, availableSessions, primaryInstitutionId, savedAttendance]);

  const getSessionCheckInTime = () => {
    const session = availableSessions.find(s => s.id === selectedSession);
    if (!session?.startTime) return format(new Date(), 'hh:mm a');
    const [h, m] = session.startTime.split(':');
    const d = new Date();
    d.setHours(parseInt(h, 10) || 0, parseInt(m, 10) || 0, 0, 0);
    return format(d, 'hh:mm a');
  };

  const handleMarkAttendance = (studentId: string, status: "present" | "absent" | "late") => {
    const checkIn = getSessionCheckInTime();
    setAttendance(prev =>
      prev.map(record =>
        record.id === studentId
          ? {
              ...record,
              status,
              check_in_time: status !== "absent" ? checkIn : undefined,
            }
          : record
      )
    );
  };

  const handleMarkAllPresent = () => {
    const checkIn = getSessionCheckInTime();
    setAttendance(prev =>
      prev.map(record => ({
        ...record,
        status: "present" as const,
        check_in_time: checkIn,
      }))
    );
    toast.success("Marked all students present");
  };

  const handleMarkAllAbsent = () => {
    setAttendance(prev =>
      prev.map(record => ({
        ...record,
        status: "absent" as const,
        check_in_time: undefined,
      }))
    );
    toast.success("Marked all students absent");
  };


  const handleSaveAttendance = async () => {
    if (!selectedSession || !officerProfile?.id || !primaryInstitutionId) return null;

    const session = availableSessions.find(s => s.id === selectedSession);
    if (!session) return null;

    try {
      const attendanceRecords: AttendanceRecord[] = attendance.map(record => ({
        student_id: record.id,
        student_name: record.student_name,
        roll_number: record.roll_number,
        status: record.status,
        check_in_time: record.check_in_time,
      }));

      const saved = await saveAttendanceMutation.mutateAsync({
        timetable_assignment_id: session.timetable_assignment_id,
        class_id: session.classId,
        institution_id: primaryInstitutionId,
        officer_id: officerProfile.id,
        date: selectedDate,
        period_label: session.periodLabel,
        period_time: `${session.startTime} - ${session.endTime}`,
        subject: session.subject,
        attendance_records: attendanceRecords,
        notes: classRemark || undefined,
        covered_session_ids: selectedCurriculumSessionIds,
        covered_course_id: (selectedCourseAssignment as any)?.course_id || null,
      });

      toast.success("Attendance saved successfully!");
      return saved;
    } catch (error) {
      console.error("Failed to save attendance:", error);
      toast.error("Failed to save attendance. Please try again.");
      return null;
    }
  };

  const handleMarkSessionCompleted = async () => {
    if (!selectedSession || !officerProfile?.id) return;

    const session = availableSessions.find(s => s.id === selectedSession);
    if (!session) return;

    // First save attendance (returns the row for this period + selected date)
    const savedRow = await handleSaveAttendance();

    const attendanceId =
      (savedRow as any)?.id ||
      savedAttendance?.find(a => a.timetable_assignment_id === selectedSession)?.id;

    if (attendanceId) {
      try {
        await markCompletedMutation.mutateAsync({
          attendanceId,
          officerId: officerProfile.id,
        });
      } catch (error) {
        console.error("Failed to mark session completed:", error);
        toast.error("Failed to mark session completed");
        return;
      }
    }

    // If curriculum sessions were picked, mark each complete for present/late students
    const sessionIdsToMark = selectedCurriculumSessionIds.filter(
      (id) => !alreadyCoveredSessionIds.has(id)
    );
    const skipped = selectedCurriculumSessionIds.length - sessionIdsToMark.length;
    if (skipped > 0) {
      toast.warning(
        `${skipped} session${skipped !== 1 ? 's were' : ' was'} already marked complete for this class and ${skipped !== 1 ? 'were' : 'was'} skipped.`
      );
    }

    if (sessionIdsToMark.length > 0 && selectedCourseAssignmentId) {
      const presentStudentIds = attendance
        .filter(r => r.status === 'present' || r.status === 'late')
        .map(r => r.id);

      if (presentStudentIds.length === 0) {
        toast.success("Session marked as completed!");
        toast.warning("No present/late students — curriculum sessions not credited to anyone.");
        return;
      }

      const courseId = (selectedCourseAssignment as any)?.course_id;
      let successCount = 0;

      for (const sessionId of sessionIdsToMark) {
        const sessionMeta = curriculumSessionAssignments.find(
          (s: any) => s.session_id === sessionId
        );
        const moduleAssignmentId = (sessionMeta as any)?.class_module_assignment_id;
        const moduleAssignment = moduleAssignments.find(
          (m: any) => m.id === moduleAssignmentId
        ) || moduleAssignments.find((m: any) => selectedModuleAssignmentIds.includes(m.id));
        const moduleId = (moduleAssignment as any)?.module_id;

        const ok = await markSessionComplete(
          sessionId,
          presentStudentIds,
          selectedCourseAssignmentId,
          session.classId,
          session.timetable_assignment_id,
          moduleId,
          courseId,
          { silent: true, date: selectedDate, attendanceId }
        );
        if (ok) successCount++;
      }

      queryClient.invalidateQueries({ queryKey: ['officer-attn-class-covered'] });
      setIsEditing(false);


      if (successCount > 0) {
        toast.success(
          `Attendance saved. ${successCount} session${successCount !== 1 ? 's' : ''} marked complete for ${presentStudentIds.length} student${presentStudentIds.length !== 1 ? 's' : ''}.`
        );
      } else {
        toast.success("Session marked as completed!");
        toast.error("Could not update curriculum progress. Please try again.");
      }
    } else {
      toast.success("Session marked as completed!");
    }
  };




  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return <Badge className="bg-green-500 hover:bg-green-600"><UserCheck className="h-3 w-3 mr-1" /> Present</Badge>;
      case "late":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600"><Clock className="h-3 w-3 mr-1" /> Late</Badge>;
      case "absent":
        return <Badge variant="destructive"><UserX className="h-3 w-3 mr-1" /> Absent</Badge>;
      default:
        return null;
    }
  };

  const filteredAttendance = attendance.filter(record =>
    record.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.roll_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: attendance.length,
    present: attendance.filter(r => r.status === "present").length,
    absent: attendance.filter(r => r.status === "absent").length,
    late: attendance.filter(r => r.status === "late").length,
  };
  
  const attendanceRate = stats.total > 0 
    ? ((stats.present + stats.late) / stats.total * 100).toFixed(1)
    : "0";

  const selectedSessionData = availableSessions.find(s => s.id === selectedSession);
  const classIdForCurriculum = selectedSessionData?.classId || '';

  // Fetch courses assigned to the selected class
  const { data: classCourseAssignments = [] } = useQuery({
    queryKey: ['officer-attn-course-assignments', classIdForCurriculum],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_class_assignments')
        .select('id, course_id, courses(id, title, course_code)')
        .eq('class_id', classIdForCurriculum);
      if (error) throw error;
      return data || [];
    },
    enabled: !!classIdForCurriculum,
  });

  const selectedCourseAssignment = classCourseAssignments.find(
    (c: any) => c.id === selectedCourseAssignmentId
  );

  // Fetch modules for selected course
  const { data: moduleAssignments = [] } = useQuery({
    queryKey: ['officer-attn-module-assignments', selectedCourseAssignmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('class_module_assignments')
        .select('id, module_id, is_unlocked, unlock_order, course_modules(id, title, display_order)')
        .eq('class_assignment_id', selectedCourseAssignmentId)
        .order('unlock_order', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedCourseAssignmentId,
  });

  // Fetch sessions for selected modules (multi)
  const { data: curriculumSessionAssignments = [] } = useQuery({
    queryKey: ['officer-attn-session-assignments-multi', selectedModuleAssignmentIds.join(',')],
    queryFn: async () => {
      if (selectedModuleAssignmentIds.length === 0) return [];
      const { data, error } = await supabase
        .from('class_session_assignments')
        .select('id, session_id, class_module_assignment_id, is_unlocked, unlock_order, course_sessions(id, title, display_order)')
        .in('class_module_assignment_id', selectedModuleAssignmentIds)
        .order('unlock_order', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: selectedModuleAssignmentIds.length > 0,
  });

  // Reset curriculum picker whenever the timetable slot or date changes
  useEffect(() => {
    setSelectedCourseAssignmentId('');
    setSelectedModuleAssignmentIds([]);
    setSelectedCurriculumSessionIds([]);
    setClassRemark('');
    setIsEditing(false);
  }, [selectedSession, selectedDate]);

  // Saved attendance row for the currently selected period
  const savedRecordForSession = savedAttendance?.find(
    a => a.timetable_assignment_id === selectedSession
  );
  const isSessionCompleted = savedRecordForSession?.is_session_completed || false;
  const isLocked = isSessionCompleted && !isEditing;

  const savedCoveredSessionIds: string[] = Array.isArray((savedRecordForSession as any)?.covered_session_ids)
    ? ((savedRecordForSession as any).covered_session_ids as string[])
    : [];

  // Prefill the curriculum picker from what was already recorded
  useEffect(() => {
    if (!savedRecordForSession) return;
    const courseId = (savedRecordForSession as any).covered_course_id;
    if (courseId) {
      const assignment = classCourseAssignments.find((c: any) => c.course_id === courseId);
      if (assignment) setSelectedCourseAssignmentId((prev) => prev || assignment.id);
    }
    if (savedCoveredSessionIds.length > 0) {
      setSelectedCurriculumSessionIds((prev) => (prev.length > 0 ? prev : savedCoveredSessionIds));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedRecordForSession?.id, classCourseAssignments.length]);

  // Titles of the curriculum sessions already recorded for this period
  const { data: savedCoveredTitles = [] } = useQuery({
    queryKey: ['officer-attn-covered-titles', savedCoveredSessionIds.join(',')],
    queryFn: async (): Promise<string[]> => {
      if (savedCoveredSessionIds.length === 0) return [];
      const { data, error } = await supabase
        .from('course_sessions')
        .select('id, title, course_modules(title)')
        .in('id', savedCoveredSessionIds);
      if (error) throw error;
      return (data || []).map((s: any) =>
        s.course_modules?.title ? `${s.course_modules.title} · ${s.title}` : s.title
      );
    },
    enabled: savedCoveredSessionIds.length > 0,
  });

  // Curriculum sessions already marked complete for this class in ANY other period
  const { data: classCoveredRows = [] } = useQuery({
    queryKey: ['officer-attn-class-covered', classIdForCurriculum],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('class_session_attendance')
        .select('id, covered_session_ids')
        .eq('class_id', classIdForCurriculum)
        .eq('is_session_completed', true);
      if (error) throw error;
      return data || [];
    },
    enabled: !!classIdForCurriculum,
  });

  const alreadyCoveredSessionIds = new Set<string>(
    classCoveredRows
      .filter((r: any) => r.id !== savedRecordForSession?.id)
      .flatMap((r: any) => (Array.isArray(r.covered_session_ids) ? r.covered_session_ids : []))
  );


  const handleExportCSV = () => {
    if (!selectedSessionData) return;

    const csvContent = [
      ['Class', 'Section', 'Date', 'Time', 'Student Name', 'Roll Number', 'Status', 'Check-in Time'],
      ...attendance.map(record => [
        selectedSessionData.className,
        selectedSessionData.section,
        selectedSessionData.date,
        `${selectedSessionData.startTime}-${selectedSessionData.endTime}`,
        record.student_name,
        record.roll_number,
        record.status,
        record.check_in_time || '-'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance_${selectedSessionData.className}_${selectedSessionData.section}_${selectedSessionData.date}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    toast.success("Attendance report exported");
  };

  if (isLoadingOfficer) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-48 w-full" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Class Attendance</h1>
            <p className="text-muted-foreground">Mark student attendance for your scheduled classes</p>
          </div>
          <Button variant="outline" className="gap-2" onClick={handleExportCSV} disabled={!selectedSession || attendance.length === 0}>
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>

        {/* Date & Session Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Select Date & Class Session
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Date</label>
              <Input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedSession("");
                }}
                className="max-w-xs"
              />
            </div>
            
            {availableSessions.length > 0 ? (
              <div>
                <label className="text-sm font-medium mb-2 block">Class Session</label>
                <Select value={selectedSession} onValueChange={setSelectedSession}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a class session" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSessions.map((session) => (
                      <SelectItem key={session.id} value={session.id}>
                        <div className="flex items-center gap-2">
                          <span>{session.className} - {session.subject} ({session.startTime} - {session.endTime})</span>
                          {session.accessType === 'delegated' && (
                            <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded">Delegated</span>
                          )}
                          {session.accessType === 'secondary' && (
                            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-1.5 py-0.5 rounded">Secondary</span>
                          )}
                          {session.accessType === 'backup' && (
                            <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-1.5 py-0.5 rounded">Backup</span>
                          )}
                          {savedAttendance?.find(a => a.timetable_assignment_id === session.id)?.is_session_completed && (
                            <span className="text-xs text-green-600">✓ Completed</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No classes scheduled for this date</p>
              </div>
            )}

            {/* Curriculum picker: Course -> Multi Levels -> Multi Sessions */}
            {selectedSession && (
              classCourseAssignments.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-3 pt-2 border-t">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Course (optional)</label>
                    <Select
                      value={selectedCourseAssignmentId}
                      onValueChange={(v) => {
                        setSelectedCourseAssignmentId(v);
                        setSelectedModuleAssignmentIds([]);
                        setSelectedCurriculumSessionIds([]);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose course..." />
                      </SelectTrigger>
                      <SelectContent>
                        {classCourseAssignments.map((ca: any) => (
                          <SelectItem key={ca.id} value={ca.id}>
                            {ca.courses?.title} {ca.courses?.course_code ? `(${ca.courses.course_code})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Levels / Modules (multi)</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start font-normal"
                          disabled={!selectedCourseAssignmentId || moduleAssignments.length === 0}
                        >
                          {selectedModuleAssignmentIds.length === 0
                            ? 'Choose levels...'
                            : `${selectedModuleAssignmentIds.length} level${selectedModuleAssignmentIds.length !== 1 ? 's' : ''} selected`}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72 p-2" align="start">
                        <div className="space-y-1 max-h-64 overflow-auto">
                          {moduleAssignments.map((m: any) => {
                            const checked = selectedModuleAssignmentIds.includes(m.id);
                            return (
                              <label
                                key={m.id}
                                className={`flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer ${!m.is_unlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                <Checkbox
                                  checked={checked}
                                  disabled={!m.is_unlocked}
                                  onCheckedChange={(v) => {
                                    setSelectedModuleAssignmentIds((prev) => {
                                      const next = v ? [...prev, m.id] : prev.filter((x) => x !== m.id);
                                      // Trim session selections that no longer belong to selected modules
                                      setSelectedCurriculumSessionIds((prevSess) =>
                                        prevSess.filter((sid) => {
                                          const sa = curriculumSessionAssignments.find((s: any) => s.session_id === sid);
                                          return sa && next.includes((sa as any).class_module_assignment_id);
                                        })
                                      );
                                      return next;
                                    });
                                  }}
                                />
                                <span className="text-sm">
                                  {m.course_modules?.title || 'Untitled'} {!m.is_unlocked ? '(Locked)' : ''}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Sessions (multi)</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start font-normal"
                          disabled={selectedModuleAssignmentIds.length === 0 || curriculumSessionAssignments.length === 0}
                        >
                          {selectedCurriculumSessionIds.length === 0
                            ? 'Choose sessions...'
                            : `${selectedCurriculumSessionIds.length} session${selectedCurriculumSessionIds.length !== 1 ? 's' : ''} selected`}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-2" align="start">
                        <div className="space-y-1 max-h-64 overflow-auto">
                          {curriculumSessionAssignments.map((s: any) => {
                            const checked = selectedCurriculumSessionIds.includes(s.session_id);
                            const parentModule = moduleAssignments.find(
                              (m: any) => m.id === s.class_module_assignment_id
                            );
                            return (
                              <label
                                key={s.id}
                                className={`flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer ${!s.is_unlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                <Checkbox
                                  checked={checked}
                                  disabled={!s.is_unlocked}
                                  onCheckedChange={(v) => {
                                    setSelectedCurriculumSessionIds((prev) =>
                                      v ? [...prev, s.session_id] : prev.filter((x) => x !== s.session_id)
                                    );
                                  }}
                                />
                                <span className="text-sm">
                                  <span className="text-muted-foreground">{(parentModule as any)?.course_modules?.title || ''} · </span>
                                  {s.course_sessions?.title || 'Untitled'} {!s.is_unlocked ? '(Locked)' : ''}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground pt-2 border-t">
                  No course assigned to this class yet — session will be marked as attended only.
                </p>
              )
            )}

            {/* Class remark (optional) */}
            {selectedSession && (
              <div className="pt-2 border-t">
                <label className="text-sm font-medium mb-2 block">Class Remark (optional)</label>
                <Textarea
                  placeholder="e.g. Exam day — students in exam hall, Field trip, Substitute assigned, etc."
                  value={classRemark}
                  onChange={(e) => setClassRemark(e.target.value)}
                  rows={2}
                />
              </div>
            )}


          </CardContent>
        </Card>

        {/* Stats Cards */}
        {selectedSession && attendance.length > 0 && (
          <div className="grid gap-4 md:grid-cols-5">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Present</CardTitle>
                <UserCheck className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">{stats.present}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Late</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-500">{stats.late}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Absent</CardTitle>
                <UserX className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">{stats.absent}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{attendanceRate}%</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Attendance Table */}
        {selectedSession && (isLoadingStudents || isLoadingAttendance ? (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        ) : attendance.length > 0 ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle>Student Attendance - {selectedSessionData?.className}</CardTitle>
                  {isSessionCompleted && (
                    <Badge className="bg-green-500">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Session Completed
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleMarkAllPresent}>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Mark All Present
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleMarkAllAbsent}>
                    <UserX className="h-4 w-4 mr-2" />
                    Mark All Absent
                  </Button>
                  <Input
                    placeholder="Search students..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-xs"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Roll Number</TableHead>
                    <TableHead>Check-in Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttendance.length > 0 ? (
                    filteredAttendance.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={record.avatar} />
                              <AvatarFallback>{record.student_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{record.student_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{record.roll_number}</TableCell>
                        <TableCell>{record.check_in_time || "-"}</TableCell>
                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant={record.status === "present" ? "default" : "outline"}
                              onClick={() => handleMarkAttendance(record.id, "present")}
                              disabled={isSessionCompleted}
                            >
                              <UserCheck className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={record.status === "late" ? "default" : "outline"}
                              onClick={() => handleMarkAttendance(record.id, "late")}
                              disabled={isSessionCompleted}
                            >
                              <Clock className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={record.status === "absent" ? "destructive" : "outline"}
                              onClick={() => handleMarkAttendance(record.id, "absent")}
                              disabled={isSessionCompleted}
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No students found matching "{searchQuery}"
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleSaveAttendance} 
                  disabled={saveAttendanceMutation.isPending || isSessionCompleted}
                >
                  {saveAttendanceMutation.isPending ? "Saving..." : "Save Attendance"}
                </Button>
                <Button 
                  onClick={handleMarkSessionCompleted} 
                  disabled={markCompletedMutation.isPending || isMarkingCurriculum || isSessionCompleted}
                  className="gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {markCompletedMutation.isPending || isMarkingCurriculum
                    ? "Completing..."
                    : selectedCurriculumSessionIds.length > 0
                      ? `Save Attendance & Mark ${selectedCurriculumSessionIds.length} Session${selectedCurriculumSessionIds.length !== 1 ? 's' : ''} Completed`
                      : "Mark Session Complete"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No students found for this class</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </Layout>
  );
};

export default Attendance;
