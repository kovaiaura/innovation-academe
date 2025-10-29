import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ArrowLeft, Users, GraduationCap, Building2, Mail, Phone, Calendar, MapPin, Download, Upload } from 'lucide-react';
import { ClassStudentTable } from '@/components/institution/ClassStudentTable';
import { StudentEditDialog } from '@/components/institution/StudentEditDialog';
import { BulkUploadDialog, BulkUploadResult } from '@/components/student/BulkUploadDialog';
import { Student } from '@/types/student';
import { getStudentsByInstitution, getStudentsByClass } from '@/data/mockStudentData';
import { calculateClassStatistics } from '@/utils/studentHelpers';
import { generateTemplate } from '@/utils/csvParser';
import { toast } from 'sonner';

// Mock institution data (in real app, fetch from API)
const mockInstitutions = [
  {
    id: '1',
    name: 'Delhi Public School - Vasant Kunj',
    code: 'DPS-VK-001',
    type: 'school',
    location: 'New Delhi, India',
    established_year: 1995,
    contact_email: 'admin@dpsvk.edu.in',
    contact_phone: '+91-11-2345-6789',
    admin_name: 'Dr. Rajesh Kumar',
    admin_email: 'rajesh.kumar@dpsvk.edu.in',
    total_students: 2450,
    total_faculty: 180,
  },
  {
    id: '2',
    name: 'Ryan International School',
    code: 'RIS-MUM-002',
    type: 'school',
    location: 'Mumbai, India',
    established_year: 1989,
    contact_email: 'info@ryanmumbai.edu.in',
    contact_phone: '+91-22-3456-7890',
    admin_name: 'Mrs. Priya Sharma',
    admin_email: 'priya.sharma@ryanmumbai.edu.in',
    total_students: 3800,
    total_faculty: 250,
  },
  {
    id: '3',
    name: 'Innovation Hub Chennai',
    code: 'IHC-CHN-003',
    type: 'institute',
    location: 'Chennai, India',
    established_year: 2020,
    contact_email: 'contact@innohubchennai.org',
    contact_phone: '+91-44-4567-8901',
    admin_name: 'Mr. Arjun Patel',
    admin_email: 'arjun.patel@innohubchennai.org',
    total_students: 450,
    total_faculty: 35,
  }
];

export default function InstitutionDetail() {
  const { institutionId } = useParams();
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState('Class 1');
  const [students, setStudents] = useState<Student[]>([]);
  const [classStudents, setClassStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);

  const institution = mockInstitutions.find(inst => inst.id === institutionId);

  useEffect(() => {
    if (institutionId) {
      const allStudents = getStudentsByInstitution(institutionId);
      setStudents(allStudents);
      
      const filtered = getStudentsByClass(institutionId, selectedClass);
      setClassStudents(filtered);
    }
  }, [institutionId, selectedClass]);

  if (!institution) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <h2 className="text-2xl font-bold">Institution Not Found</h2>
          <p className="text-muted-foreground">The institution you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/system-admin/institutions')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Institutions
          </Button>
        </div>
      </Layout>
    );
  }

  const classStats = calculateClassStatistics(classStudents);
  const classes = Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`);

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsEditDialogOpen(true);
  };

  const handleSaveStudent = (updatedStudent: Student) => {
    const updatedStudents = students.map(s => 
      s.id === updatedStudent.id ? updatedStudent : s
    );
    setStudents(updatedStudents);
    
    const updatedClassStudents = classStudents.map(s => 
      s.id === updatedStudent.id ? updatedStudent : s
    );
    setClassStudents(updatedClassStudents);
    
    toast.success('Student details updated successfully');
  };

  const handleBulkUploadComplete = (result: BulkUploadResult) => {
    toast.success(`Successfully imported ${result.imported} students!`);
    if (result.failed > 0) {
      toast.warning(`${result.failed} students failed to import. Check logs.`);
    }
    setIsBulkUploadOpen(false);
    // Refresh student data
    if (institutionId) {
      const allStudents = getStudentsByInstitution(institutionId);
      setStudents(allStudents);
      const filtered = getStudentsByClass(institutionId, selectedClass);
      setClassStudents(filtered);
    }
  };

  const handleDownloadTemplate = () => {
    const blob = generateTemplate();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'student_bulk_upload_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Template downloaded');
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header with Breadcrumb */}
        <div className="space-y-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/system-admin/dashboard">System Admin</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/system-admin/institutions">Institutions</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{institution.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/system-admin/institutions')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <h1 className="text-3xl font-bold">{institution.name}</h1>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {institution.code}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {institution.location}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Est. {institution.established_year}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="students">Students by Class</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{students.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Faculty</CardTitle>
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{institution.total_faculty}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Classes</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">Class 1 - 12</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                  <Users className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {students.filter(s => s.status === 'active').length}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Institution Information</CardTitle>
                <CardDescription>Basic details and contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Institution Code</div>
                    <div className="font-medium">{institution.code}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Type</div>
                    <Badge className="capitalize">{institution.type}</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Contact Email</div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{institution.contact_email}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Contact Phone</div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{institution.contact_phone}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Admin Name</div>
                    <div className="font-medium">{institution.admin_name}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Admin Email</div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{institution.admin_email}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students by Class Tab */}
          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle>Students by Class</CardTitle>
                    <CardDescription>View and manage students organized by class</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleDownloadTemplate}>
                      <Download className="h-4 w-4 mr-2" />
                      Download Template
                    </Button>
                    <Button variant="outline" onClick={() => setIsBulkUploadOpen(true)}>
                      <Upload className="h-4 w-4 mr-2" />
                      Bulk Upload Students
                    </Button>
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map(className => (
                          <SelectItem key={className} value={className}>
                            {className}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Class Statistics */}
                <div className="grid gap-4 md:grid-cols-5 mb-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{classStats.total}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Boys</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">{classStats.boys}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Girls</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-pink-600">{classStats.girls}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Active</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">{classStats.active}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Sections</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{classStats.sections.join(', ')}</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Student Table */}
                <ClassStudentTable
                  students={classStudents}
                  onEditStudent={handleEditStudent}
                  institutionCode={institution.code}
                  className={selectedClass}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Student Dialog */}
        <StudentEditDialog
          student={selectedStudent}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSave={handleSaveStudent}
        />

        {/* Bulk Upload Dialog */}
        <BulkUploadDialog
          isOpen={isBulkUploadOpen}
          onOpenChange={setIsBulkUploadOpen}
          institutionId={institutionId || '1'}
          onUploadComplete={handleBulkUploadComplete}
        />
      </div>
    </Layout>
  );
}
