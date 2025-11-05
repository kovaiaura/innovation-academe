import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Download, Users } from 'lucide-react';
import { getStudentsByClass } from '@/data/mockClassStudents';
import { mockStudentAttendance } from '@/data/mockStudentAttendance';

interface ClassStudentsListProps {
  classId: string;
  className: string;
}

export function ClassStudentsList({ classId, className }: ClassStudentsListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Get students for this class
  const classStudents = getStudentsByClass(classId);

  // Filter by search
  const filteredStudents = classStudents.filter(student =>
    student.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (student.roll_number || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExport = () => {
    // Export to CSV logic
    console.log('Exporting student list...');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Students in {className}</h2>
          <p className="text-muted-foreground mt-1">
            {classStudents.length} students enrolled
          </p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export List
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Student Roster</CardTitle>
              <CardDescription>View and manage students in this class</CardDescription>
            </div>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or roll number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? 'No students found matching your search' : 'No students in this class yet'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll No.</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => {
                  // Calculate attendance percentage from student attendance records
                  const studentAttendanceRecord = mockStudentAttendance.find(
                    a => a.student_id === student.id
                  );
                  const attendancePercent = studentAttendanceRecord?.attendance_percentage || 0;

                  return (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.roll_number}</TableCell>
                      <TableCell>{student.student_name}</TableCell>
                      <TableCell className="text-muted-foreground">{student.parent_email}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={attendancePercent >= 75 ? 'text-green-600' : 'text-orange-600'}>
                            {Math.round(attendancePercent)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                          {student.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
