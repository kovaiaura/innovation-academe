import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Download, Eye } from 'lucide-react';
import { getAllClassSections, getStudentAttendanceByClass } from '@/data/mockStudentAttendance';
import { getClassAttendanceStats, exportStudentAttendanceCSV } from '@/utils/studentAttendanceHelpers';
import { StudentAttendanceDetailsDialog } from './StudentAttendanceDetailsDialog';

export const StudentAttendanceTab = () => {
  const classSections = getAllClassSections();
  const [selectedClass, setSelectedClass] = useState(classSections[0]?.display || '');
  const [selectedMonth, setSelectedMonth] = useState('2024-01');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // Get attendance data for selected class
  const selectedSection = classSections.find(cs => cs.display === selectedClass);
  const attendanceData = selectedSection
    ? getStudentAttendanceByClass('springfield', selectedSection.class, selectedSection.section, selectedMonth)
    : [];
  
  // Filter by search query
  const filteredData = attendanceData.filter(record =>
    record.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.roll_number.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Calculate stats
  const stats = getClassAttendanceStats(filteredData);
  
  // Handle export
  const handleExport = () => {
    exportStudentAttendanceCSV(filteredData, `student-attendance-${selectedClass}-${selectedMonth}.csv`);
  };
  
  // Handle view details
  const handleViewDetails = (studentId: string) => {
    setSelectedStudent(studentId);
    setIsDetailsOpen(true);
  };
  
  // Get badge color for attendance percentage
  const getAttendanceBadge = (percentage: number) => {
    if (percentage >= 90) return { variant: 'default' as const, color: 'text-green-600 dark:text-green-400' };
    if (percentage >= 75) return { variant: 'secondary' as const, color: 'text-yellow-600 dark:text-yellow-400' };
    return { variant: 'destructive' as const, color: 'text-red-600 dark:text-red-400' };
  };
  
  return (
    <div className="space-y-6">
      {/* Filters Row */}
      <div className="flex flex-wrap gap-4">
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select Class" />
          </SelectTrigger>
          <SelectContent>
            {classSections.map(cs => (
              <SelectItem key={cs.display} value={cs.display}>
                {cs.display}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select Month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2024-01">January 2024</SelectItem>
            <SelectItem value="2023-12">December 2023</SelectItem>
            <SelectItem value="2023-11">November 2023</SelectItem>
          </SelectContent>
        </Select>
        
        <Input
          placeholder="Search students..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-64"
        />
        
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Students</p>
              <p className="text-3xl font-bold">{stats.totalStudents}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Avg Attendance</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats.avgAttendance.toFixed(1)}%
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Below 75%</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {stats.belowThreshold}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Classes Conducted</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.totalClasses}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Student Attendance Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Roll Number</TableHead>
                <TableHead className="text-center">Present</TableHead>
                <TableHead className="text-center">Absent</TableHead>
                <TableHead className="text-center">Total Classes</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map(record => {
                const badge = getAttendanceBadge(record.attendance_percentage);
                return (
                  <TableRow key={record.student_id}>
                    <TableCell className="font-medium">{record.student_name}</TableCell>
                    <TableCell>{record.roll_number}</TableCell>
                    <TableCell className="text-center">
                      <span className="text-green-600 dark:text-green-400 font-semibold">
                        {record.classes_attended}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-red-600 dark:text-red-400 font-semibold">
                        {record.total_classes - record.classes_attended}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">{record.total_classes}</TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Progress value={record.attendance_percentage} className="h-2 flex-1" />
                          <Badge variant={badge.variant} className={badge.color}>
                            {record.attendance_percentage.toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(record.student_id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Details Dialog */}
      {selectedStudent && (
        <StudentAttendanceDetailsDialog
          studentId={selectedStudent}
          month={selectedMonth}
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
        />
      )}
    </div>
  );
};
