import { useState, useEffect } from 'react';
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
import { UserPlus, Search, Mail, Phone, Building2, UserCheck, DollarSign, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import type { LeaveBalance } from '@/types/attendance';
import { loadOfficers, addOfficer } from '@/data/mockOfficerData';
import type { OfficerDetails } from '@/services/systemadmin.service';
import { initializeLeaveBalance } from '@/data/mockLeaveData';

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

export default function OfficerManagement() {
  const navigate = useNavigate();
  const [officers, setOfficers] = useState<OfficerDetails[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    employment_type: 'full_time',
    salary: '',
    // Payroll Configuration
    hourly_rate: '',
    overtime_rate_multiplier: '1.5',
    normal_working_hours: '8',
    // Leave Balance Configuration
    casual_leave: '12',
    sick_leave: '10',
    earned_leave: '15',
  });

  // Load officers from localStorage on mount
  useEffect(() => {
    refreshOfficers();
  }, []);

  const refreshOfficers = () => {
    const loaded = loadOfficers();
    setOfficers(loaded);
  };

  const handleAddOfficer = () => {
    // Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.salary) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!formData.hourly_rate || !formData.overtime_rate_multiplier || !formData.normal_working_hours) {
      toast.error("Please fill in payroll configuration");
      return;
    }

    if (!formData.casual_leave || !formData.sick_leave || !formData.earned_leave) {
      toast.error("Please fill in leave allowances");
      return;
    }

    const newOfficer: OfficerDetails = {
      id: `off-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      assigned_institutions: [],
      employment_type: formData.employment_type as OfficerDetails['employment_type'],
      salary: Number(formData.salary),
      join_date: new Date().toISOString().split('T')[0],
      status: 'active',
      employee_id: `EMP-${Date.now()}`,
      department: 'Innovation & STEM Education',
      hourly_rate: parseFloat(formData.hourly_rate),
      overtime_rate_multiplier: parseFloat(formData.overtime_rate_multiplier),
      normal_working_hours: parseFloat(formData.normal_working_hours),
      qualifications: [],
      certifications: [],
      skills: [],
      profile_photo_url: '/placeholder.svg',
    };

    // Add to localStorage
    addOfficer(newOfficer);

    // Create initial leave balance
    const leaveBalance: LeaveBalance = {
      officer_id: newOfficer.id,
      sick_leave: parseInt(formData.sick_leave),
      casual_leave: parseInt(formData.casual_leave),
      earned_leave: parseInt(formData.earned_leave),
      year: new Date().getFullYear().toString(),
    };
    
    initializeLeaveBalance(leaveBalance);

    // Refresh officers list
    refreshOfficers();

    toast.success(`Officer ${formData.name} added successfully`, {
      description: 'Configure credentials in Credential Management',
      action: {
        label: 'Go to Credentials',
        onClick: () => navigate('/system-admin/credentials')
      }
    });
    setIsAddDialogOpen(false);
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      employment_type: 'full_time',
      salary: '',
      hourly_rate: '',
      overtime_rate_multiplier: '1.5',
      normal_working_hours: '8',
      casual_leave: '12',
      sick_leave: '10',
      earned_leave: '15',
    });
  };

  const filteredOfficers = officers.filter((officer) =>
    officer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    officer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: OfficerDetails['status']) => {
    const variants = {
      active: 'default',
      on_leave: 'secondary',
      terminated: 'destructive',
    };
    return <Badge variant={variants[status] as any}>{status.replace('_', ' ')}</Badge>;
  };

  const getEmploymentBadge = (type: OfficerDetails['employment_type']) => {
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

        {/* Directory Section - Assignments tab removed as per requirement */}
        <div className="space-y-4">
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
                    
                    {/* Payroll Configuration Section */}
                    <div className="border-t pt-4 mt-4">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Payroll Configuration
                      </h3>
                      
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label htmlFor="hourly_rate">Hourly Rate (₹)</Label>
                          <Input
                            id="hourly_rate"
                            type="number"
                            value={formData.hourly_rate}
                            onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                            placeholder="500"
                          />
                        </div>
                        <div>
                          <Label htmlFor="overtime_multiplier">Overtime Rate</Label>
                          <Input
                            id="overtime_multiplier"
                            type="number"
                            step="0.1"
                            value={formData.overtime_rate_multiplier}
                            onChange={(e) => setFormData({ ...formData, overtime_rate_multiplier: e.target.value })}
                            placeholder="1.5"
                          />
                        </div>
                        <div>
                          <Label htmlFor="working_hours">Working Hrs/Day</Label>
                          <Input
                            id="working_hours"
                            type="number"
                            value={formData.normal_working_hours}
                            onChange={(e) => setFormData({ ...formData, normal_working_hours: e.target.value })}
                            placeholder="8"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Leave Balance Configuration Section */}
                    <div className="border-t pt-4 mt-4">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Annual Leave Allowance
                      </h3>
                      
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label htmlFor="casual_leave">Casual Leave</Label>
                          <Input
                            id="casual_leave"
                            type="number"
                            value={formData.casual_leave}
                            onChange={(e) => setFormData({ ...formData, casual_leave: e.target.value })}
                            placeholder="12"
                          />
                          <p className="text-xs text-muted-foreground mt-1">days/year</p>
                        </div>
                        <div>
                          <Label htmlFor="sick_leave">Sick Leave</Label>
                          <Input
                            id="sick_leave"
                            type="number"
                            value={formData.sick_leave}
                            onChange={(e) => setFormData({ ...formData, sick_leave: e.target.value })}
                            placeholder="10"
                          />
                          <p className="text-xs text-muted-foreground mt-1">days/year</p>
                        </div>
                        <div>
                          <Label htmlFor="earned_leave">Earned Leave</Label>
                          <Input
                            id="earned_leave"
                            type="number"
                            value={formData.earned_leave}
                            onChange={(e) => setFormData({ ...formData, earned_leave: e.target.value })}
                            placeholder="15"
                          />
                          <p className="text-xs text-muted-foreground mt-1">days/year</p>
                        </div>
                      </div>
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
            </div>
          </div>
        </Layout>
      );
    }
