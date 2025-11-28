import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Student } from "@/types/student";
import { getStudentsByInstitution } from "@/data/mockStudentData";
import { StudentDetailsDialog } from "@/components/student/StudentDetailsDialog";
import { 
  getStatusColor, 
  calculateAge, 
  exportStudentsToCSV
} from "@/utils/studentHelpers";
import { Download, Search, Users, UserCheck, UserX, GraduationCap, Phone } from "lucide-react";
import { toast } from "sonner";
import { useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { InstitutionHeader } from "@/components/management/InstitutionHeader";
import { getInstitutionBySlug } from "@/data/mockInstitutionData";
import { useLocation } from "react-router-dom";

export default function Students() {
  const { tenantId } = useParams();
  
  // Extract institution from URL
  const location = useLocation();
  const institutionSlug = location.pathname.split('/')[2];
  const institution = getInstitutionBySlug(institutionSlug);
  
  // Use the actual institution ID from the fetched institution object
  const institutionId = institution?.id || 'inst-msd-001';
  
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Load students from localStorage when institution changes
  useEffect(() => {
    if (institutionId) {
      const institutionStudents = getStudentsByInstitution(institutionId);
      setStudents(institutionStudents);
    }
  }, [institutionId]);

  // Calculate statistics
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.status === 'active').length;
  const boys = students.filter(s => s.gender === 'male').length;
  const girls = students.filter(s => s.gender === 'female').length;
  const uniqueClasses = [...new Set(students.map(s => s.class))].length;

  // Filter students
  const filteredStudents = students.filter(student => {
    const searchMatch = 
      searchQuery === '' ||
      student.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.roll_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.admission_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.parent_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const classMatch = classFilter === 'all' || student.class === classFilter;
    const sectionMatch = sectionFilter === 'all' || student.section === sectionFilter;
    const genderMatch = genderFilter === 'all' || student.gender === genderFilter;
    const statusMatch = statusFilter === 'all' || student.status === statusFilter;
    
    return searchMatch && classMatch && sectionMatch && genderMatch && statusMatch;
  });

  // Handlers
  const handleStudentClick = (student: Student) => {
    setSelectedStudent(student);
    setDetailsDialogOpen(true);
  };

  const handleExportStudents = () => {
    exportStudentsToCSV(filteredStudents, `students-${institutionId}-${new Date().toISOString().split('T')[0]}.csv`);
    toast.success('Students exported successfully');
  };

  const classes = [...new Set(students.map(s => s.class))].sort();
  const sections = [...new Set(students.map(s => s.section))].sort();

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6">
      {institution && (
        <InstitutionHeader 
          institutionName={institution.name}
          establishedYear={institution.established_year}
          location={institution.location}
          totalStudents={institution.total_students}
          totalFaculty={institution.total_faculty}
          totalDepartments={institution.total_departments}
          academicYear={institution.academic_year}
          userRole="Management Portal"
          assignedOfficers={institution.assigned_officers.map(o => o.officer_name)}
        />
      )}
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Management</h1>
          <p className="text-muted-foreground">View and monitor student information</p>
        </div>
        <Button variant="outline" onClick={handleExportStudents}>
          <Download className="h-4 w-4 mr-2" />
          Export Students
        </Button>
      </div>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
        <CardContent className="flex items-start gap-3 py-4">
          <Users className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Student Management Access
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Adding and removing students is managed by the System Admin team. 
              You can view student details, export data, and monitor student information.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeStudents}</div>
            <p className="text-xs text-muted-foreground">
              {totalStudents > 0 ? ((activeStudents / totalStudents) * 100).toFixed(1) : 0}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Boys / Girls</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{boys} / {girls}</div>
            <p className="text-xs text-muted-foreground">
              Gender distribution
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Classes</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueClasses}</div>
            <p className="text-xs text-muted-foreground">
              Grade 6 to Grade 12
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Student List */}
      <div className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>Search and filter students</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, roll number, admission number..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={classFilter} onValueChange={setClassFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All Classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {classes.map(cls => (
                      <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sectionFilter} onValueChange={setSectionFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="All Sections" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sections</SelectItem>
                    {sections.map(sec => (
                      <SelectItem key={sec} value={sec}>Section {sec}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={genderFilter} onValueChange={setGenderFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="All Genders" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genders</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="transferred">Transferred</SelectItem>
                    <SelectItem value="graduated">Graduated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-muted-foreground">
                Showing {filteredStudents.length} of {totalStudents} students
              </div>
            </CardContent>
          </Card>

          {/* Student Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.map(student => (
              <Card 
                key={student.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleStudentClick(student)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={student.avatar} alt={student.student_name} />
                      <AvatarFallback>{student.student_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-semibold truncate">{student.student_name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {student.roll_number}
                          </p>
                        </div>
                        <Badge className={getStatusColor(student.status)} variant="secondary">
                          {student.status}
                        </Badge>
                      </div>
                      <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <GraduationCap className="h-3 w-3" />
                          <span>{student.class} - {student.section}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{student.gender === 'male' ? '👨' : student.gender === 'female' ? '👩' : '🧑'} {student.gender} | 🩸 {student.blood_group || 'N/A'} | Age: {calculateAge(student.date_of_birth)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span className="truncate">{student.parent_phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredStudents.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <UserX className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No students found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
              </CardContent>
            </Card>
          )}
        </div>

      {/* Dialog */}
      <StudentDetailsDialog
        isOpen={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        student={selectedStudent}
        onEdit={() => {}}
        onDelete={() => {}}
      />
      </div>
    </Layout>
  );
}
