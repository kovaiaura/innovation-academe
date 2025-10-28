import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Building2, Plus, Edit, Ban, CheckCircle, Search, Users, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { Layout } from '@/components/layout/Layout';
import { Institution } from '@/services/systemadmin.service';

const mockInstitutions: Institution[] = [
  {
    id: '1',
    name: 'Springfield College',
    code: 'SPRC',
    type: 'college',
    location: 'Springfield, IL',
    established_year: 1985,
    total_students: 2845,
    total_faculty: 186,
    status: 'active',
    license_type: 'premium',
    license_expiry: '2025-06-30',
    contact_email: 'admin@springfield.edu',
    contact_phone: '+1-555-0100',
    admin_name: 'John Admin',
    admin_email: 'john.admin@springfield.edu',
  },
  {
    id: '2',
    name: 'Tech University',
    code: 'TECH',
    type: 'university',
    location: 'San Francisco, CA',
    established_year: 1970,
    total_students: 8920,
    total_faculty: 542,
    status: 'active',
    license_type: 'enterprise',
    license_expiry: '2025-12-31',
    contact_email: 'admin@techuni.edu',
    contact_phone: '+1-555-0200',
    admin_name: 'Sarah Tech',
    admin_email: 'sarah@techuni.edu',
  },
  {
    id: '3',
    name: 'Innovation Institute',
    code: 'INNO',
    type: 'institute',
    location: 'Boston, MA',
    established_year: 2010,
    total_students: 1560,
    total_faculty: 98,
    status: 'active',
    license_type: 'standard',
    license_expiry: '2025-03-15',
    contact_email: 'admin@innovation.edu',
    contact_phone: '+1-555-0300',
    admin_name: 'Mike Innovate',
    admin_email: 'mike@innovation.edu',
  },
];

export default function SystemAdminInstitutions() {
  const [institutions, setInstitutions] = useState(mockInstitutions);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const handleAddInstitution = () => {
    toast.success('Institution added successfully!');
    setIsDialogOpen(false);
  };

  const handleSuspendInstitution = (id: string, name: string) => {
    setInstitutions(
      institutions.map((inst) =>
        inst.id === id ? { ...inst, status: 'suspended' as 'suspended' } : inst
      )
    );
    toast.success(`${name} has been suspended`);
  };

  const handleActivateInstitution = (id: string, name: string) => {
    setInstitutions(
      institutions.map((inst) =>
        inst.id === id ? { ...inst, status: 'active' as 'active' } : inst
      )
    );
    toast.success(`${name} has been activated`);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: 'bg-green-500/10 text-green-500',
      inactive: 'bg-gray-500/10 text-gray-500',
      suspended: 'bg-red-500/10 text-red-500',
    };
    return variants[status] || variants.active;
  };

  const getLicenseBadge = (license: string) => {
    const variants: Record<string, string> = {
      basic: 'bg-gray-500/10 text-gray-500',
      standard: 'bg-blue-500/10 text-blue-500',
      premium: 'bg-purple-500/10 text-purple-500',
      enterprise: 'bg-orange-500/10 text-orange-500',
    };
    return variants[license] || variants.standard;
  };

  const filteredInstitutions = institutions.filter(
    (inst) =>
      (filterStatus === 'all' || inst.status === filterStatus) &&
      (filterType === 'all' || inst.type === filterType) &&
      (inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inst.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inst.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Institution Management</h1>
            <p className="text-muted-foreground">Manage all institutions across the platform</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingInstitution(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Institution
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>
                  {editingInstitution ? 'Edit Institution' : 'Add New Institution'}
                </DialogTitle>
                <DialogDescription>Enter institution details and configuration</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Institution Name</Label>
                    <Input id="name" placeholder="Springfield College" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="code">Code</Label>
                    <Input id="code" placeholder="SPRC" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="type">Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="university">University</SelectItem>
                        <SelectItem value="college">College</SelectItem>
                        <SelectItem value="school">School</SelectItem>
                        <SelectItem value="institute">Institute</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="established">Established Year</Label>
                    <Input id="established" type="number" placeholder="1985" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="license">License Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" placeholder="City, State" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="contact_email">Contact Email</Label>
                    <Input id="contact_email" type="email" placeholder="admin@institution.edu" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="contact_phone">Contact Phone</Label>
                    <Input id="contact_phone" type="tel" placeholder="+1-555-0100" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="admin_name">Admin Name</Label>
                    <Input id="admin_name" placeholder="John Admin" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="admin_email">Admin Email</Label>
                    <Input id="admin_email" type="email" placeholder="admin@institution.edu" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddInstitution}>
                  {editingInstitution ? 'Update' : 'Add'} Institution
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search institutions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="university">University</SelectItem>
              <SelectItem value="college">College</SelectItem>
              <SelectItem value="school">School</SelectItem>
              <SelectItem value="institute">Institute</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{institutions.length}</div>
              <p className="text-sm text-muted-foreground">Total Institutions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-500">
                {institutions.filter((i) => i.status === 'active').length}
              </div>
              <p className="text-sm text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {institutions.reduce((sum, i) => sum + i.total_students, 0)}
              </div>
              <p className="text-sm text-muted-foreground">Total Students</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {institutions.reduce((sum, i) => sum + i.total_faculty, 0)}
              </div>
              <p className="text-sm text-muted-foreground">Total Faculty</p>
            </CardContent>
          </Card>
        </div>

        {/* Institutions Table */}
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Institution</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Faculty</TableHead>
                  <TableHead>License</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInstitutions.map((inst) => (
                  <TableRow key={inst.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                          <Building2 className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{inst.name}</p>
                          <p className="text-xs text-muted-foreground">{inst.code}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{inst.type}</TableCell>
                    <TableCell>{inst.location}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        {inst.total_students}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {inst.total_faculty}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getLicenseBadge(inst.license_type)} variant="outline">
                        {inst.license_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(inst.status)}>{inst.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingInstitution(inst);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {inst.status === 'active' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSuspendInstitution(inst.id, inst.name)}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleActivateInstitution(inst.id, inst.name)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
