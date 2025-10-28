import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CheckCircle, XCircle, Clock, Download, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Layout } from '@/components/layout/Layout';

const mockSessions = [
  { id: '1', title: 'AI & ML Workshop', date: '2024-12-25' },
  { id: '2', title: 'Startup Pitch Session', date: '2024-12-26' },
];

interface AttendanceRecord {
  id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  check_in_time?: string;
  status: 'present' | 'absent' | 'late';
}

const mockAttendance: AttendanceRecord[] = [
  {
    id: '1',
    student_id: '101',
    student_name: 'John Student',
    student_email: 'john@college.edu',
    check_in_time: '10:05',
    status: 'present',
  },
  {
    id: '2',
    student_id: '102',
    student_name: 'Jane Doe',
    student_email: 'jane@college.edu',
    check_in_time: '10:15',
    status: 'late',
  },
  {
    id: '3',
    student_id: '103',
    student_name: 'Bob Wilson',
    student_email: 'bob@college.edu',
    status: 'absent',
  },
  {
    id: '4',
    student_id: '104',
    student_name: 'Alice Brown',
    student_email: 'alice@college.edu',
    check_in_time: '10:02',
    status: 'present',
  },
];

export default function Attendance() {
  const [selectedSession, setSelectedSession] = useState(mockSessions[0].id);
  const [attendance, setAttendance] = useState(mockAttendance);
  const [searchQuery, setSearchQuery] = useState('');

  const handleMarkAttendance = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setAttendance(
      attendance.map((record) =>
        record.student_id === studentId
          ? { ...record, status, check_in_time: status !== 'absent' ? new Date().toLocaleTimeString() : undefined }
          : record
      )
    );
    toast.success(`Attendance marked as ${status}`);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string; icon: any }> = {
      present: { className: 'bg-green-500/10 text-green-500', icon: CheckCircle },
      absent: { className: 'bg-red-500/10 text-red-500', icon: XCircle },
      late: { className: 'bg-yellow-500/10 text-yellow-500', icon: Clock },
    };
    return variants[status] || variants.present;
  };

  const filteredAttendance = attendance.filter(
    (record) =>
      record.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.student_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.student_id.includes(searchQuery)
  );

  const stats = {
    present: attendance.filter((r) => r.status === 'present').length,
    absent: attendance.filter((r) => r.status === 'absent').length,
    late: attendance.filter((r) => r.status === 'late').length,
    total: attendance.length,
  };

  const attendanceRate = ((stats.present + stats.late) / stats.total * 100).toFixed(1);

  return (
    <Layout>
      <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Attendance Tracking</h1>
          <p className="text-muted-foreground">Mark and manage session attendance</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Session Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Session</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedSession} onValueChange={setSelectedSession}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a session" />
            </SelectTrigger>
            <SelectContent>
              {mockSessions.map((session) => (
                <SelectItem key={session.id} value={session.id}>
                  {session.title} - {new Date(session.date).toLocaleDateString()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.present}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Late</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats.late}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Mark Attendance</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Check-in Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAttendance.map((record) => {
                const statusInfo = getStatusBadge(record.status);
                const StatusIcon = statusInfo.icon;
                
                return (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.student_id}</TableCell>
                    <TableCell>{record.student_name}</TableCell>
                    <TableCell className="text-muted-foreground">{record.student_email}</TableCell>
                    <TableCell>{record.check_in_time || '-'}</TableCell>
                    <TableCell>
                      <Badge className={statusInfo.className}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={record.status === 'present' ? 'default' : 'outline'}
                          onClick={() => handleMarkAttendance(record.student_id, 'present')}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant={record.status === 'late' ? 'default' : 'outline'}
                          onClick={() => handleMarkAttendance(record.student_id, 'late')}
                        >
                          <Clock className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant={record.status === 'absent' ? 'default' : 'outline'}
                          onClick={() => handleMarkAttendance(record.student_id, 'absent')}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      </div>
    </Layout>
  );
}
