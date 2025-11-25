import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Key, Mail, Check, AlertCircle } from 'lucide-react';
import { mockUsers } from '@/data/mockUsers';
import { mockInstitutions } from '@/data/mockInstitutionData';
import { mockStudents, getStudentsByInstitution } from '@/data/mockStudentData';
import { SetPasswordDialog } from '@/components/auth/SetPasswordDialog';
import { passwordService } from '@/services/password.service';
import { toast } from 'sonner';

export default function CredentialManagement() {
  // Meta Employees Tab State
  const [metaSearch, setMetaSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState<string>('all');

  // Institutions Tab State
  const [institutionSearch, setInstitutionSearch] = useState('');
  const [showOnlyPending, setShowOnlyPending] = useState(false);
  const [credentialStatus, setCredentialStatus] = useState<Record<string, boolean>>({});

  // Students Tab State
  const [selectedInstitution, setSelectedInstitution] = useState<string>('');
  const [studentSearch, setStudentSearch] = useState('');

  // Set Password Dialog State
  const [setPasswordDialogOpen, setSetPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    name: string;
    email: string;
    type: 'meta_employee' | 'institution_admin' | 'student';
  } | null>(null);

  // Get meta employees (system_admin role + officers)
  const metaEmployees = mockUsers.filter(user => 
    user.role === 'system_admin' || user.role === 'officer'
  );

  // Filter meta employees
  const filteredMetaEmployees = metaEmployees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(metaSearch.toLowerCase()) ||
                         emp.email.toLowerCase().includes(metaSearch.toLowerCase());
    const matchesPosition = positionFilter === 'all' || 
                           (emp.role === 'officer' && positionFilter === 'officer') ||
                           (emp.position_name === positionFilter);
    return matchesSearch && matchesPosition;
  });

  // Get institutions
  const institutions = Object.values(mockInstitutions);

  // Filter institutions
  const filteredInstitutions = institutions.filter(inst => {
    const matchesSearch = inst.name.toLowerCase().includes(institutionSearch.toLowerCase()) ||
      inst.contact_email.toLowerCase().includes(institutionSearch.toLowerCase());
    const matchesPending = !showOnlyPending || !credentialStatus[inst.id];
    return matchesSearch && matchesPending;
  });

  const pendingCount = institutions.filter(inst => !credentialStatus[inst.id]).length;

  // Get students for selected institution
  const studentsForInstitution = selectedInstitution 
    ? getStudentsByInstitution(selectedInstitution)
    : [];

  // Filter students
  const filteredStudents = studentsForInstitution.filter(student =>
    student.student_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    student.student_id.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const handleSetPassword = (userId: string, userName: string, userEmail: string, userType: 'meta_employee' | 'institution_admin' | 'student') => {
    setSelectedUser({ id: userId, name: userName, email: userEmail, type: userType });
    setSetPasswordDialogOpen(true);
  };

  const handleSendResetLink = async (email: string, userName: string, userType: string) => {
    try {
      await passwordService.sendResetLink(email, userName, userType);
    } catch (error) {
      toast.error('Failed to send reset link');
    }
  };

  const handleSetPasswordSuccess = (institutionId: string) => {
    setCredentialStatus(prev => ({ ...prev, [institutionId]: true }));
    toast.success('Credentials configured successfully!', {
      description: 'The institution admin can now log in'
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Credential Management</h1>
          <p className="text-muted-foreground">
            Manage passwords and authentication for all users
          </p>
        </div>

        <Tabs defaultValue="meta-employees" className="space-y-4">
          <TabsList>
            <TabsTrigger value="meta-employees">Meta Employees</TabsTrigger>
            <TabsTrigger value="institutions">Institutions</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
          </TabsList>

          {/* Meta Employees Tab */}
          <TabsContent value="meta-employees" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Meta Employees</CardTitle>
                <CardDescription>
                  Manage credentials for system administrators, innovation officers, and staff
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or email..."
                      value={metaSearch}
                      onChange={(e) => setMetaSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={positionFilter} onValueChange={setPositionFilter}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Filter by position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Positions</SelectItem>
                      <SelectItem value="ceo">CEO</SelectItem>
                      <SelectItem value="md">MD</SelectItem>
                      <SelectItem value="agm">AGM</SelectItem>
                      <SelectItem value="gm">GM</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin_staff">Admin Staff</SelectItem>
                      <SelectItem value="officer">Innovation Officer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMetaEmployees.map((emp) => (
                        <TableRow key={emp.id}>
                          <TableCell className="font-medium">{emp.name}</TableCell>
                          <TableCell>{emp.email}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {emp.role === 'officer' ? 'Innovation Officer' : 
                               emp.position_name?.toUpperCase().replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-200">
                              Active
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSetPassword(emp.id, emp.name, emp.email, 'meta_employee')}
                              >
                                <Key className="h-4 w-4 mr-1" />
                                Set Password
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSendResetLink(emp.email, emp.name, 'meta_employee')}
                              >
                                <Mail className="h-4 w-4 mr-1" />
                                Send Reset Link
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Institutions Tab */}
          <TabsContent value="institutions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Institution Administrators</CardTitle>
                <CardDescription>
                  Manage credentials for onboarded institutions and their administrators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by institution name..."
                      value={institutionSearch}
                      onChange={(e) => setInstitutionSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="pending-credentials"
                      checked={showOnlyPending}
                      onCheckedChange={(checked) => setShowOnlyPending(checked as boolean)}
                    />
                    <label htmlFor="pending-credentials" className="text-sm cursor-pointer">
                      Show only institutions pending credential setup ({pendingCount})
                    </label>
                  </div>
                </div>

                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Institution Name</TableHead>
                        <TableHead>Admin Email</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Credential Status</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInstitutions.map((inst) => {
                        // Find admin for this institution
                        const admin = mockUsers.find(u => u.institution_id === inst.id && u.role === 'management');
                        const isConfigured = credentialStatus[inst.id];
                        return (
                          <TableRow key={inst.id}>
                            <TableCell className="font-medium">{inst.name}</TableCell>
                            <TableCell>{admin?.email || inst.contact_email}</TableCell>
                            <TableCell>{inst.location}</TableCell>
                            <TableCell>
                              {isConfigured ? (
                                <Badge className="bg-green-500/10 text-green-700 border-green-200">
                                  <Check className="h-3 w-3 mr-1" />
                                  Configured
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-orange-500/10 text-orange-700 border-orange-200">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Pending Setup
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant={inst.status === 'active' ? 'default' : 'secondary'}>
                                {inst.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {admin ? (
                                <div className="flex justify-end gap-2 flex-wrap">
                                  {!isConfigured ? (
                                    <Button
                                      size="sm"
                                      variant="default"
                                      onClick={() => {
                                        handleSetPassword(admin.id, admin.name, admin.email, 'institution_admin');
                                      }}
                                    >
                                      <Key className="h-4 w-4 mr-1" />
                                      Set Up Credentials
                                    </Button>
                                  ) : (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleSetPassword(admin.id, admin.name, admin.email, 'institution_admin')}
                                      >
                                        <Key className="h-4 w-4 mr-1" />
                                        Reset Password
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleSendResetLink(admin.email, admin.name, 'institution_admin')}
                                      >
                                        <Mail className="h-4 w-4 mr-1" />
                                        Send Reset Link
                                      </Button>
                                    </>
                                  )}
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">No admin assigned</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Students</CardTitle>
                <CardDescription>
                  Manage credentials for students by institution
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={selectedInstitution} onValueChange={setSelectedInstitution}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an institution..." />
                  </SelectTrigger>
                  <SelectContent>
                    {institutions.map((inst) => (
                      <SelectItem key={inst.id} value={inst.id}>
                        {inst.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedInstitution && (
                  <>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by student ID or name..."
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Class</TableHead>
                            <TableHead>Section</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredStudents.length > 0 ? (
                            filteredStudents.slice(0, 50).map((student) => (
                              <TableRow key={student.id}>
                                <TableCell className="font-medium">{student.student_id}</TableCell>
                                <TableCell>{student.student_name}</TableCell>
                                <TableCell>{student.parent_email}</TableCell>
                                <TableCell>{student.class}</TableCell>
                                <TableCell>{student.section}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleSetPassword(student.id, student.student_name, student.parent_email, 'student')}
                                    >
                                      <Key className="h-4 w-4 mr-1" />
                                      Set Password
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleSendResetLink(student.parent_email, student.student_name, 'student')}
                                    >
                                      <Mail className="h-4 w-4 mr-1" />
                                      Send Reset Link
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center text-muted-foreground">
                                No students found
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                      {filteredStudents.length > 50 && (
                        <div className="p-4 text-center text-sm text-muted-foreground border-t">
                          Showing 50 of {filteredStudents.length} students. Use search to narrow results.
                        </div>
                      )}
                    </div>
                  </>
                )}

                {!selectedInstitution && (
                  <div className="text-center py-12 text-muted-foreground">
                    Please select an institution to view students
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Set Password Dialog */}
      {selectedUser && (
        <SetPasswordDialog
          open={setPasswordDialogOpen}
          onClose={() => {
            setSetPasswordDialogOpen(false);
            setSelectedUser(null);
          }}
          onSetPassword={async (password) => {
            await passwordService.setPassword(selectedUser.id, password, selectedUser.type);
            if (selectedUser.type === 'institution_admin') {
              // Find institution for this admin
              const institution = institutions.find(inst => {
                const admin = mockUsers.find(u => u.institution_id === inst.id && u.role === 'management');
                return admin?.id === selectedUser.id;
              });
              if (institution) {
                handleSetPasswordSuccess(institution.id);
              }
            }
            setSetPasswordDialogOpen(false);
            setSelectedUser(null);
          }}
          userName={selectedUser.name}
          userEmail={selectedUser.email}
          userId={selectedUser.id}
          userType={selectedUser.type}
        />
      )}
    </Layout>
  );
}
