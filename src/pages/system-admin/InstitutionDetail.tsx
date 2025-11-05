import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ArrowLeft, Users, GraduationCap, Building2, Mail, Phone, Calendar, MapPin, Pencil } from 'lucide-react';
import { EditInstitutionDialog } from '@/components/institution/EditInstitutionDialog';
import { AddClassDialog } from '@/components/institution/AddClassDialog';
import { InstitutionClassesTab } from '@/components/institution/InstitutionClassesTab';
import { InstitutionOfficersTab } from '@/components/institution/InstitutionOfficersTab';
import { InstitutionAnalyticsTab } from '@/components/institution/InstitutionAnalyticsTab';
import { InstitutionTimetableTab } from '@/components/institution/InstitutionTimetableTab';
import { Student, InstitutionClass } from '@/types/student';
import { getStudentsByInstitution } from '@/data/mockStudentData';
import { getClassesByInstitution } from '@/data/mockClassData';
import { getInstitutionOfficers, getAvailableOfficers } from '@/data/mockInstitutionOfficers';
import { getInstitutionAnalytics } from '@/data/mockInstitutionAnalytics';
import { getInstitutionPeriods } from '@/data/mockInstitutionPeriods';
import { getInstitutionTimetable } from '@/data/mockInstitutionTimetable';
import { toast } from 'sonner';
import { useInstitutionData } from '@/contexts/InstitutionDataContext';

export default function InstitutionDetail() {
  const { institutionId } = useParams();
  const navigate = useNavigate();
  const { institutions, updateInstitution } = useInstitutionData();
  const [institutionClasses, setInstitutionClasses] = useState<InstitutionClass[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isEditInstitutionOpen, setIsEditInstitutionOpen] = useState(false);
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [isEditClassOpen, setIsEditClassOpen] = useState(false);
  const [selectedClassForEdit, setSelectedClassForEdit] = useState<InstitutionClass | null>(null);

  const institution = institutions.find(inst => inst.id === institutionId);

  useEffect(() => {
    if (institutionId) {
      const allStudents = getStudentsByInstitution(institutionId);
      setStudents(allStudents);
      
      const classes = getClassesByInstitution(institutionId);
      setInstitutionClasses(classes);
    }
  }, [institutionId]);

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

  const handleAddClass = (classData: Partial<InstitutionClass>) => {
    const newClass: InstitutionClass = {
      ...classData,
      id: `class-${Date.now()}`,
      institution_id: institutionId!,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as InstitutionClass;
    
    setInstitutionClasses([...institutionClasses, newClass]);
    toast.success(`Class "${classData.class_name}" created successfully`);
  };

  const handleEditClass = (classData: Partial<InstitutionClass>) => {
    const updated = institutionClasses.map(c => 
      c.id === selectedClassForEdit?.id ? { ...c, ...classData, updated_at: new Date().toISOString() } : c
    );
    setInstitutionClasses(updated);
    setSelectedClassForEdit(null);
    toast.success('Class updated successfully');
  };

  const handleDeleteClass = (classId: string) => {
    const classToDelete = institutionClasses.find(c => c.id === classId);
    const studentsInClass = students.filter(s => s.class_id === classId).length;
    
    if (studentsInClass > 0) {
      toast.error(`Cannot delete class with ${studentsInClass} students. Please move or delete students first.`);
      return;
    }
    
    if (window.confirm(`Delete class "${classToDelete?.class_name}"? This action cannot be undone.`)) {
      setInstitutionClasses(institutionClasses.filter(c => c.id !== classId));
      toast.success('Class deleted successfully');
    }
  };

  const handleSaveInstitution = (updatedInstitution: Partial<any>) => {
    if (institutionId) {
      updateInstitution(institutionId, updatedInstitution);
      toast.success('Institution details updated successfully');
      setIsEditInstitutionOpen(false);
    }
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="officers">Innovation Officers</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="timetable">Timetable</TabsTrigger>
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
                  <div className="text-2xl font-bold">{institutionClasses.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {institutionClasses.length === 0 
                      ? 'No classes created' 
                      : `${institutionClasses.length} active class${institutionClasses.length !== 1 ? 'es' : ''}`
                    }
                  </p>
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
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Institution Information</CardTitle>
                    <CardDescription>Basic details and contact information</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditInstitutionOpen(true)}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
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

          {/* Classes Tab */}
          <TabsContent value="classes" className="space-y-6">
            <InstitutionClassesTab
              institutionId={institutionId!}
              institutionClasses={institutionClasses}
              studentCounts={students.reduce((acc, s) => ({ ...acc, [s.class_id || '']: (acc[s.class_id || ''] || 0) + 1 }), {} as Record<string, number>)}
              onAddClass={() => setIsAddClassOpen(true)}
              onEditClass={(cls) => { setSelectedClassForEdit(cls); setIsEditClassOpen(true); }}
              onDeleteClass={handleDeleteClass}
              onSelectClass={(id) => navigate(`/system-admin/institutions/${institutionId}/classes/${id}`)}
            />
          </TabsContent>

          {/* Innovation Officers Tab */}
          <TabsContent value="officers" className="space-y-6">
            <InstitutionOfficersTab
              institutionId={institutionId!}
              institutionName={institution.name}
              assignedOfficers={getInstitutionOfficers(institutionId!)}
              availableOfficers={getAvailableOfficers(institutionId!)}
              onAssignOfficer={async (officerId) => { toast.success('Officer assigned'); }}
              onRemoveOfficer={async (officerId) => { toast.success('Officer removed'); }}
            />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {getInstitutionAnalytics(institutionId!) ? (
              <InstitutionAnalyticsTab
                institutionId={institutionId!}
                institutionName={institution.name}
                analytics={getInstitutionAnalytics(institutionId!)!}
                onGenerateReport={async (options) => { toast.success('Report generated'); }}
              />
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground">Analytics data not available for this institution</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Timetable Tab */}
          <TabsContent value="timetable" className="space-y-6">
            <InstitutionTimetableTab
              institutionId={institutionId!}
              institutionName={institution.name}
              classes={institutionClasses.filter(c => c.status === 'active')}
              periods={getInstitutionPeriods(institutionId!)}
              timetableData={getInstitutionTimetable(institutionId!)}
              onSavePeriods={async (periods) => { toast.success('Periods saved'); }}
              onSaveTimetable={async (assignments) => { toast.success('Timetable saved'); }}
            />
          </TabsContent>

        </Tabs>

        {/* Dialogs */}
        <EditInstitutionDialog
          institution={institution}
          open={isEditInstitutionOpen}
          onOpenChange={setIsEditInstitutionOpen}
          onSave={handleSaveInstitution}
        />

        <AddClassDialog
          open={isAddClassOpen || isEditClassOpen}
          onOpenChange={(open) => {
            setIsAddClassOpen(open);
            setIsEditClassOpen(open);
            if (!open) setSelectedClassForEdit(null);
          }}
          onSave={selectedClassForEdit ? handleEditClass : handleAddClass}
          existingClass={selectedClassForEdit}
          institutionId={institutionId || ''}
        />
      </div>
    </Layout>
  );
}
