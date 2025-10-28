import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Search, Mail, Phone, Building2 } from 'lucide-react';
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

const mockOfficers: Officer[] = [
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

export default function Officers() {
  const [officers, setOfficers] = useState<Officer[]>(mockOfficers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
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

  const filteredOfficers = officers.filter((officer) =>
    officer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    officer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Innovation Officer Directory</h1>
            <p className="text-muted-foreground mt-1">
              Manage innovation officers and their assignments
            </p>
          </div>
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
                  <TableRow key={officer.id}>
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
                          ${officer.salary.toLocaleString()}/yr
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
      </div>
    </Layout>
  );
}
