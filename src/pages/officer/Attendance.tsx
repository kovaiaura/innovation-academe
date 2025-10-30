import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Download, Clock, UserCheck, UserX, AlertCircle, Users } from "lucide-react";
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
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getOfficerTimetable } from "@/data/mockOfficerTimetable";
import { getStudentsByClassAndSection } from "@/data/mockStudentData";
import { sessionService } from "@/services/session.service";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

interface AttendanceRecord {
  id: string;
  studentName: string;
  rollNumber: string;
  avatar?: string;
  checkIn?: string;
  status: "present" | "absent" | "late";
}

interface ClassSession {
  id: string;
  slotId: string;
  title: string;
  className: string;
  section: string;
  date: string;
  startTime: string;
  endTime: string;
  courseId?: string;
}

const Attendance = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [availableSessions, setAvailableSessions] = useState<ClassSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string>("");
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Load officer's timetable and create sessions
  useEffect(() => {
    if (!user?.id) return;
    
    const timetable = getOfficerTimetable(user.id);
    if (!timetable) return;

    const today = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' });
    const todaySlots = timetable.slots.filter(slot => slot.day === today);

    const sessions: ClassSession[] = todaySlots.map(slot => {
      // Extract class name and section from slot.class (e.g., "Class 8A" -> "Class 8", "A")
      const classMatch = slot.class.match(/Class (\d+)([A-Z])?/);
      const className = classMatch ? `Class ${classMatch[1]}` : slot.class;
      const section = classMatch?.[2] || 'A';

      return {
        id: slot.id,
        slotId: slot.id,
        title: `${slot.subject} - ${slot.class}`,
        className,
        section,
        date: selectedDate,
        startTime: slot.start_time,
        endTime: slot.end_time,
        courseId: slot.course_id,
      };
    });

    setAvailableSessions(sessions);
    if (sessions.length > 0 && !selectedSession) {
      setSelectedSession(sessions[0].id);
    }
  }, [user?.id, selectedDate, selectedSession]);

  // Load students when session is selected
  useEffect(() => {
    if (!selectedSession || !user?.institution_id) return;

    const session = availableSessions.find(s => s.id === selectedSession);
    if (!session) return;

    // Load students for the selected class and section
    const students = getStudentsByClassAndSection(
      user.institution_id,
      session.className,
      session.section
    );

    // Initialize attendance records (default to absent)
    const attendanceRecords: AttendanceRecord[] = students.map(student => ({
      id: student.id,
      studentName: student.student_name,
      rollNumber: student.roll_number,
      avatar: student.avatar,
      status: "absent",
    }));

    setAttendance(attendanceRecords);
  }, [selectedSession, availableSessions, user?.institution_id]);

  const handleMarkAttendance = (studentId: string, status: "present" | "absent" | "late") => {
    setAttendance(prev =>
      prev.map(record =>
        record.id === studentId
          ? {
              ...record,
              status,
              checkIn: status !== "absent" ? format(new Date(), 'hh:mm a') : undefined,
            }
          : record
      )
    );
  };

  const handleMarkAllPresent = () => {
    setAttendance(prev =>
      prev.map(record => ({
        ...record,
        status: "present" as const,
        checkIn: format(new Date(), 'hh:mm a'),
      }))
    );
    toast.success("Marked all students present");
  };

  const handleMarkAllAbsent = () => {
    setAttendance(prev =>
      prev.map(record => ({
        ...record,
        status: "absent" as const,
        checkIn: undefined,
      }))
    );
    toast.success("Marked all students absent");
  };

  const handleSaveAttendance = async () => {
    if (!selectedSession || !user?.institution_id) return;

    const session = availableSessions.find(s => s.id === selectedSession);
    if (!session) return;

    setIsLoading(true);
    try {
      const studentsPresent = attendance
        .filter(record => record.status === "present" || record.status === "late")
        .map(record => record.id);

      // Save attendance using session service
      await sessionService.recordAttendance(
        user.institution_id,
        selectedSession,
        {
          students_present: studentsPresent,
          total_students: attendance.length,
        }
      );

      toast.success("Attendance saved successfully!");
    } catch (error) {
      console.error("Failed to save attendance:", error);
      toast.error("Failed to save attendance. Please try again.");
    } finally {
      setIsLoading(false);
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
    record.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
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

  const handleExportCSV = () => {
    if (!selectedSessionData) return;

    const csvContent = [
      ['Class', 'Section', 'Date', 'Time', 'Student Name', 'Roll Number', 'Status', 'Check-in Time'],
      ...attendance.map(record => [
        selectedSessionData.className,
        selectedSessionData.section,
        selectedSessionData.date,
        `${selectedSessionData.startTime}-${selectedSessionData.endTime}`,
        record.studentName,
        record.rollNumber,
        record.status,
        record.checkIn || '-'
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

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Attendance Tracking</h1>
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
                onChange={(e) => setSelectedDate(e.target.value)}
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
                        {session.className} - Section {session.section} ({session.startTime} - {session.endTime})
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
          </CardContent>
        </Card>

        {/* Stats Cards */}
        {selectedSession && attendance.length > 0 && (
          <div className="grid gap-4 md:grid-cols-4">
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
        {selectedSession && attendance.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Student Attendance - {selectedSessionData?.className} Section {selectedSessionData?.section}</CardTitle>
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
                              <AvatarFallback>{record.studentName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{record.studentName}</span>
                          </div>
                        </TableCell>
                        <TableCell>{record.rollNumber}</TableCell>
                        <TableCell>{record.checkIn || "-"}</TableCell>
                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant={record.status === "present" ? "default" : "outline"}
                              onClick={() => handleMarkAttendance(record.id, "present")}
                            >
                              <UserCheck className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={record.status === "late" ? "default" : "outline"}
                              onClick={() => handleMarkAttendance(record.id, "late")}
                            >
                              <Clock className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={record.status === "absent" ? "destructive" : "outline"}
                              onClick={() => handleMarkAttendance(record.id, "absent")}
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

              <div className="flex justify-end">
                <Button onClick={handleSaveAttendance} disabled={isLoading} className="gap-2">
                  {isLoading ? "Saving..." : "Save Attendance"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Attendance;
