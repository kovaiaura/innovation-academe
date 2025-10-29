import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, Search, Mail, Phone, Building2, UserCheck, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

interface Officer {
  id: string;
  name: string;
  email: string;
  phone: string;
  assigned_institutions: string[];
  employment_type: 'full_time' | 'part_time' | 'contract';
  salary: number;
  join_date: string;
  status: 'active' | 'on_leave' | 'terminated';
}

interface Assignment {
  officer_id: string;
  officer_name: string;
  institution_id: string;
  institution_name: string;
  assigned_date: string;
  status: 'active' | 'inactive';
}

const mockOfficersData: Officer[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@metainnova.com',
    phone: '+1234567890',
    assigned_institutions: ['Springfield University', 'River College'],
    employment_type: 'full_time',
    salary: 65000,
    join_date: '2023-01-15',
    status: 'active',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@metainnova.com',
    phone: '+1234567891',
    assigned_institutions: ['Oakwood Institute'],
    employment_type: 'full_time',
    salary: 62000,
    join_date: '2023-03-20',
    status: 'active',
  },
  {
    id: '3',
    name: 'Michael Chen',
    email: 'michael.c@metainnova.com',
    phone: '+1234567892',
    assigned_institutions: ['Tech Valley School', 'Innovation Hub'],
    employment_type: 'contract',
    salary: 55000,
    join_date: '2023-06-10',
    status: 'active',
  },
];

const mockAssignmentsData: Assignment[] = [
  {
    officer_id: '1',
    officer_name: 'John Smith',
    institution_id: 'inst1',
    institution_name: 'Springfield University',
    assigned_date: '2023-01-15',
    status: 'active',
  },
  {
    officer_id: '1',
    officer_name: 'John Smith',
    institution_id: 'inst2',
    institution_name: 'River College',
    assigned_date: '2023-02-20',
    status: 'active',
  },
  {
    officer_id: '2',
    officer_name: 'Sarah Johnson',
    institution_id: 'inst3',
    institution_name: 'Oakwood Institute',
    assigned_date: '2023-03-20',
    status: 'active',
  },
];

const mockInstitutions = [
  { id: 'inst1', name: 'Springfield University' },
  { id: 'inst2', name: 'River College' },
  { id: 'inst3', name: 'Oakwood Institute' },
  { id: 'inst4', name: 'Tech Valley School' },
  { id: 'inst5', name: 'Innovation Hub' },
];

export default function OfficerManagement() {
  const navigate = useNavigate();
  const [officers, setOfficers] = useState<Officer[]>(mockOfficersData);
  const [assignments, setAssignments] = useState<Assignment[]>(mockAssignmentsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState<string>('');
  const [selectedInstitution, setSelectedInstitution] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    employment_type: 'full_time',
    salary: '',
  });

  const handleAddOfficer = () => {
    const newOfficer: Officer = {
      id: String(officers.length + 1),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      assigned_institutions: [],
      employment_type: formData.employment_type as Officer['employment_type'],
      salary: Number(formData.salary),
      join_date: new Date().toISOString().split('T')[0],
      status: 'active',
    };

    setOfficers([...officers, newOfficer]);
    setIsAddDialogOpen(false);
    setFormData({ name: '', email: '', phone: '', employment_type: 'full_time', salary: '' });
    toast.success('Innovation Officer added successfully');
  };

  const handleAddAssignment = () => {
    if (!selectedOfficer || !selectedInstitution) {
      toast.error('Please select both officer and institution');
      return;
    }

    const officer = officers.find((o) => o.id === selectedOfficer);
    const institution = mockInstitutions.find((i) => i.id === selectedInstitution);

    if (!officer || !institution) return;

    const newAssignment: Assignment = {
      officer_id: officer.id,
      officer_name: officer.name,
      institution_id: institution.id,
      institution_name: institution.name,
      assigned_date: new Date().toISOString().split('T')[0],
      status: 'active',
    };

    setAssignments([...assignments, newAssignment]);
    setSelectedOfficer('');
    setSelectedInstitution('');
    toast.success(`${officer.name} assigned to ${institution.name}`);
  };

  const handleRemoveAssignment = (officerId: string, institutionId: string) => {
    setAssignments(
      assignments.filter(
        (a) => !(a.officer_id === officerId && a.institution_id === institutionId)
      )
    );
    toast.success('Assignment removed');
  };

  const filteredOfficers = officers.filter((officer) =>
    officer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    officer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedAssignments = assignments.reduce((acc, assignment) => {
    if (!acc[assignment.officer_name]) {
      acc[assignment.officer_name] = [];
    }
    acc[assignment.officer_name].push(assignment);
    return acc;
  }, {} as Record<string, Assignment[]>);

  const getStatusBadge = (status: Officer['status']) => {
    const variants = {
      active: 'default',
      on_leave: 'secondary',
      terminated: 'destructive',
    };
    return <Badge variant={variants[status] as any}>{status.replace('_', ' ')}</Badge>;
  };

  const getEmploymentBadge = (type: Officer['employment_type']) => {
    return <Badge variant="outline">{type.replace('_', ' ')}</Badge>;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Officer Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage innovation officers and their institution assignments
          </p>
        </div>

        <Tabs defaultValue="directory" className="space-y-4">
          <TabsList>
            <TabsTrigger value="directory">
              Directory
              <Badge variant="secondary" className="ml-2">
                {officers.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="assignments">
              Assignments
              <Badge variant="secondary" className="ml-2">
                {assignments.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="directory" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Officer
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Officer</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@metainnova.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1234567890"
                      />
                    </div>
                    <div>
                      <Label htmlFor="employment_type">Employment Type</Label>
                      <Select
                        value={formData.employment_type}
                        onValueChange={(value) => setFormData({ ...formData, employment_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full_time">Full Time</SelectItem>
                          <SelectItem value="part_time">Part Time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="salary">Annual Salary</Label>
                      <Input
                        id="salary"
                        type="number"
                        value={formData.salary}
                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                        placeholder="65000"
                      />
                    </div>
                    <Button onClick={handleAddOfficer} className="w-full">
                      Add Officer
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Officers ({filteredOfficers.length})</CardTitle>
                <CardDescription>Search and manage innovation officers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Employment</TableHead>
                      <TableHead>Assignments</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Join Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOfficers.map((officer) => (
                      <TableRow 
                        key={officer.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => navigate(`/system-admin/officers/${officer.id}`)}
                      >
                        <TableCell className="font-medium">{officer.name}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 text-sm">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {officer.email}
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {officer.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {getEmploymentBadge(officer.employment_type)}
                            <span className="text-sm text-muted-foreground">
                              ₹{officer.salary.toLocaleString('en-IN')}/yr
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            <span className="text-sm">{officer.assigned_institutions.length} schools</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(officer.status)}</TableCell>
                        <TableCell>{new Date(officer.join_date).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Assign Officer to Institution</CardTitle>
                <CardDescription>
                  Create new officer-institution assignments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">Select Officer</label>
                    <Select value={selectedOfficer} onValueChange={setSelectedOfficer}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose officer..." />
                      </SelectTrigger>
                      <SelectContent>
                        {officers.map((officer) => (
                          <SelectItem key={officer.id} value={officer.id}>
                            {officer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">Select Institution</label>
                    <Select value={selectedInstitution} onValueChange={setSelectedInstitution}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose institution..." />
                      </SelectTrigger>
                      <SelectContent>
                        {mockInstitutions.map((inst) => (
                          <SelectItem key={inst.id} value={inst.id}>
                            {inst.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleAddAssignment}>
                    <Plus className="mr-2 h-4 w-4" />
                    Assign
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              {Object.entries(groupedAssignments).map(([officerName, officerAssignments]) => (
                <Card key={officerName}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-5 w-5" />
                        <CardTitle>{officerName}</CardTitle>
                      </div>
                      <Badge variant="secondary">
                        {officerAssignments.length} assignment{officerAssignments.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {officerAssignments.map((assignment) => (
                        <div
                          key={`${assignment.officer_id}-${assignment.institution_id}`}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{assignment.institution_name}</div>
                              <div className="text-sm text-muted-foreground">
                                Assigned: {new Date(assignment.assigned_date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleRemoveAssignment(assignment.officer_id, assignment.institution_id)
                            }
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
