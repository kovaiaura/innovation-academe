import { useState, useEffect, useCallback } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Key, Mail, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { loadMetaStaff, loadCredentialStatus, saveCredentialStatus, MetaStaffUser } from '@/data/mockMetaStaffData';
import { loadPositions } from '@/data/mockPositions';
import { mockInstitutions } from '@/data/mockInstitutionData';
import { mockStudents, getStudentsByInstitution } from '@/data/mockStudentData';
import { SetPasswordDialog } from '@/components/auth/SetPasswordDialog';
import { passwordService } from '@/services/password.service';
import { metaStaffService } from '@/services/metastaff.service';
import { toast } from 'sonner';

// Officers from mockUsers for now (can be migrated to separate localStorage later)
import { mockUsers } from '@/data/mockUsers';

export default function CredentialManagement() {
  // Meta Employees Tab State
  const [metaSearch, setMetaSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [metaEmployees, setMetaEmployees] = useState<MetaStaffUser[]>([]);
  const [positions, setPositions] = useState<{ id: string; display_name: string; position_name: string }[]>([]);

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

  // Load data from localStorage
  const loadData = useCallback(() => {
    // Load meta staff from localStorage
    const metaStaff = loadMetaStaff();
    
    // Also include officers from mockUsers
    const officers = mockUsers.filter(u => u.role === 'officer');
    
    // Combine meta staff with officers
    const allEmployees = [
      ...metaStaff,
      ...officers.map(o => ({ ...o, password: (o as any).password } as MetaStaffUser))
    ];
    
    setMetaEmployees(allEmployees);
    
    // Load positions
    const loadedPositions = loadPositions();
    setPositions(loadedPositions.map(p => ({
      id: p.id,
      display_name: p.display_name,
      position_name: p.position_name
    })));
    
    // Load credential status
    setCredentialStatus(loadCredentialStatus());
  }, []);

  useEffect(() => {
    loadData();
    
    // Listen for focus to refresh data when returning to this page
    const handleFocus = () => loadData();
    window.addEventListener('focus', handleFocus);
    
    return () => window.removeEventListener('focus', handleFocus);
  }, [loadData]);

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

  const handleSetPasswordSuccess = async (userId: string, password: string, userType: string) => {
    if (userType === 'meta_employee') {
      // Update password in localStorage via service
      await metaStaffService.setPassword(userId, password);
      // Refresh data
      loadData();
    } else if (userType === 'institution_admin') {
      // Update credential status for institution
      const admin = mockUsers.find(u => u.id === userId);
      if (admin?.institution_id) {
        const newStatus = { ...credentialStatus, [admin.institution_id]: true };
        setCredentialStatus(newStatus);
        saveCredentialStatus(newStatus);
      }
    }
    
    toast.success('Password set successfully!', {
      description: 'The user can now log in with their new credentials'
    });
    
    setSetPasswordDialogOpen(false);
  };

  const handleRefresh = () => {
    loadData();
    toast.success('Data refreshed');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Credential Management</h1>
            <p className="text-muted-foreground">
              Manage passwords and authentication for all users
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
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
                      {positions.map(pos => (
                        <SelectItem key={pos.id} value={pos.position_name}>
                          {pos.display_name}
                        </SelectItem>
                      ))}
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
                      {filteredMetaEmployees.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            No employees found
                          </TableCell>
                        </TableRow>
                      )}
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
                            <TableHead>Parent Email</TableHead>
                            <TableHead>Class</TableHead>
                            <TableHead>Section</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredStudents.length > 0 ? (
                            filteredStudents.slice(0, 20).map((student) => (
                              <TableRow key={student.id}>
                                <TableCell className="font-medium">{student.student_id}</TableCell>
                                <TableCell>{student.student_name}</TableCell>
                                <TableCell>{student.email}</TableCell>
                                <TableCell>{student.class}</TableCell>
                                <TableCell>{student.section}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleSetPassword(student.id, student.student_name, student.email, 'student')}
                                    >
                                      <Key className="h-4 w-4 mr-1" />
                                      Set Password
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleSendResetLink(student.email, student.student_name, 'student')}
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
                              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                No students found
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                      {filteredStudents.length > 20 && (
                        <div className="p-4 text-center text-sm text-muted-foreground border-t">
                          Showing 20 of {filteredStudents.length} students. Use search to filter.
                        </div>
                      )}
                    </div>
                  </>
                )}

                {!selectedInstitution && (
                  <div className="text-center py-8 text-muted-foreground">
                    Select an institution to manage student credentials
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
          userName={selectedUser.name}
          userEmail={selectedUser.email}
          userId={selectedUser.id}
          userType={selectedUser.type}
          onSetPassword={async (password) => {
            await handleSetPasswordSuccess(selectedUser.id, password, selectedUser.type);
          }}
        />
      )}
    </Layout>
  );
}
