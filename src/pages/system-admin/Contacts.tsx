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

interface Contact {
  id: string;
  institution_id: string;
  institution_name: string;
  name: string;
  designation: string;
  email: string;
  phone: string;
  type: 'lead' | 'customer' | 'partner';
  status: 'active' | 'inactive';
}

const mockContacts: Contact[] = [
  {
    id: '1',
    institution_id: 'inst1',
    institution_name: 'Springfield University',
    name: 'Dr. James Wilson',
    designation: 'Director of Innovation',
    email: 'j.wilson@springfield.edu',
    phone: '+1234567890',
    type: 'customer',
    status: 'active',
  },
  {
    id: '2',
    institution_id: 'inst2',
    institution_name: 'River College',
    name: 'Prof. Emily Carter',
    designation: 'Head of Technology',
    email: 'e.carter@river.edu',
    phone: '+1234567891',
    type: 'customer',
    status: 'active',
  },
  {
    id: '3',
    institution_id: 'inst4',
    institution_name: 'Tech Valley School',
    name: 'Sarah Martinez',
    designation: 'Principal',
    email: 's.martinez@techvalley.edu',
    phone: '+1234567892',
    type: 'lead',
    status: 'active',
  },
];

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    institution_name: '',
    name: '',
    designation: '',
    email: '',
    phone: '',
    type: 'customer',
  });

  const handleAddContact = () => {
    const newContact: Contact = {
      id: String(contacts.length + 1),
      institution_id: `inst${contacts.length + 1}`,
      institution_name: formData.institution_name,
      name: formData.name,
      designation: formData.designation,
      email: formData.email,
      phone: formData.phone,
      type: formData.type as Contact['type'],
      status: 'active',
    };

    setContacts([...contacts, newContact]);
    setIsAddDialogOpen(false);
    setFormData({
      institution_name: '',
      name: '',
      designation: '',
      email: '',
      phone: '',
      type: 'customer',
    });
    toast.success('Contact added successfully');
  };

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.institution_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || contact.type === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeBadge = (type: Contact['type']) => {
    const colors = {
      lead: 'default',
      customer: 'secondary',
      partner: 'outline',
    };
    return <Badge variant={colors[type] as any}>{type}</Badge>;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Contacts & Leads</h1>
            <p className="text-muted-foreground mt-1">
              Manage institutional contacts and potential leads
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Contact</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="institution">Institution Name</Label>
                  <Input
                    id="institution"
                    value={formData.institution_name}
                    onChange={(e) =>
                      setFormData({ ...formData, institution_name: e.target.value })
                    }
                    placeholder="University Name"
                  />
                </div>
                <div>
                  <Label htmlFor="contact_name">Contact Name</Label>
                  <Input
                    id="contact_name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Dr. John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="designation">Designation</Label>
                  <Input
                    id="designation"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="Director of Innovation"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@institution.edu"
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
                  <Label htmlFor="type">Contact Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="partner">Partner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddContact} className="w-full">
                  Add Contact
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Contacts ({filteredContacts.length})</CardTitle>
            <CardDescription>Search and filter institutional contacts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <div className="flex items-center gap-2 flex-1">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, institution, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="lead">Leads</SelectItem>
                  <SelectItem value="customer">Customers</SelectItem>
                  <SelectItem value="partner">Partners</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Institution</TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>
                      <div className="font-medium">{contact.name}</div>
                      <div className="text-sm text-muted-foreground">{contact.designation}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {contact.institution_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-sm">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {contact.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {contact.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(contact.type)}</TableCell>
                    <TableCell>
                      <Badge variant={contact.status === 'active' ? 'default' : 'secondary'}>
                        {contact.status}
                      </Badge>
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
