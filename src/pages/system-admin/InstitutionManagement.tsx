import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInstitutionData, Institution } from '@/contexts/InstitutionDataContext';
import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Search, Plus, Building2, Upload, Calendar, FileText, AlertCircle, CheckCircle, Clock, DollarSign, Users, Shield, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import ViewMouDialog from '@/components/institution/ViewMouDialog';

export default function InstitutionManagement() {
  const navigate = useNavigate();
  const { institutions, addInstitution, updateInstitution } = useInstitutionData();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [licenseFilter, setLicenseFilter] = useState<string>('all');
  const [contractStatusFilter, setContractStatusFilter] = useState<string>('all');
  const [isRenewDialogOpen, setIsRenewDialogOpen] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [activeTab, setActiveTab] = useState('list');
  const [isMouDialogOpen, setIsMouDialogOpen] = useState(false);
  const [selectedInstitutionForMou, setSelectedInstitutionForMou] = useState<Institution | null>(null);

  // Add institution form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    type: 'school' as Institution['type'],
    location: '',
    established_year: new Date().getFullYear(),
    contact_email: '',
    contact_phone: '',
    admin_name: '',
    admin_email: '',
    license_type: 'basic' as Institution['license_type'],
    max_users: 500,
    subscription_plan: 'basic' as Institution['subscription_plan'],
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      suspended: 'destructive'
    };
    return <Badge variant={variants[status as keyof typeof variants] as any}>{status}</Badge>;
  };

  const getLicenseBadge = (type: string) => {
    const colors = {
      basic: 'bg-gray-500',
      standard: 'bg-blue-500',
      premium: 'bg-purple-500',
      enterprise: 'bg-orange-500'
    };
    return <Badge className={colors[type as keyof typeof colors]}>{type}</Badge>;
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getContractStatus = (expiryDate: string) => {
    const daysLeft = getDaysUntilExpiry(expiryDate);
    if (daysLeft < 0) return 'expired';
    if (daysLeft <= 30) return 'expiring_soon';
    return 'active';
  };

  // Filtered institutions
  const filteredInstitutions = institutions.filter(inst => {
    const matchesSearch = inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          inst.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          inst.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || inst.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || inst.subscription_status === statusFilter;
    const matchesLicense = licenseFilter === 'all' || inst.license_type === licenseFilter;
    
    let matchesContractStatus = true;
    if (contractStatusFilter !== 'all') {
      const status = getContractStatus(inst.contract_expiry_date);
      matchesContractStatus = status === contractStatusFilter;
    }
    
    return matchesSearch && matchesType && matchesStatus && matchesLicense && matchesContractStatus;
  });

  const handleAddInstitution = () => {
    const newInstitution: Institution = {
      id: String(institutions.length + 1),
      ...formData,
      code: `${formData.type.toUpperCase()}-${formData.slug.toUpperCase()}-${String(institutions.length + 1).padStart(3, '0')}`,
      total_students: 0,
      total_faculty: 0,
      total_users: 0,
      storage_used_gb: 0,
      subscription_status: 'active',
      license_expiry: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      current_users: 0,
      features: formData.license_type === 'enterprise' ? ['All Features'] : 
                formData.license_type === 'premium' ? ['Innovation Lab', 'Analytics'] : 
                ['Basic Features'],
      contract_type: 'Annual Contract',
      contract_start_date: new Date().toISOString().split('T')[0],
      contract_expiry_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      contract_value: formData.license_type === 'enterprise' ? 1000000 : 
                      formData.license_type === 'premium' ? 500000 : 150000,
      created_at: new Date().toISOString().split('T')[0]
    };

    addInstitution(newInstitution);
    toast.success('Institution added successfully with inventory tracking enabled');
    setFormData({
      name: '',
      slug: '',
      type: 'school',
      location: '',
      established_year: new Date().getFullYear(),
      contact_email: '',
      contact_phone: '',
      admin_name: '',
      admin_email: '',
      license_type: 'basic',
      max_users: 500,
      subscription_plan: 'basic',
    });
    setActiveTab('list');
  };

  const handleRenewLicense = () => {
    if (selectedInstitution) {
      updateInstitution(selectedInstitution.id, {
        license_expiry: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
      });
      toast.success(`License renewed for ${selectedInstitution.name}`);
      setIsRenewDialogOpen(false);
      setSelectedInstitution(null);
    }
  };

  // Calculate stats
  const stats = {
    total: institutions.length,
    active: institutions.filter(i => i.subscription_status === 'active').length,
    expiringSoon: institutions.filter(i => getDaysUntilExpiry(i.license_expiry) <= 30 && getDaysUntilExpiry(i.license_expiry) > 0).length,
    totalUsers: institutions.reduce((sum, i) => sum + i.current_users, 0),
    totalValue: institutions.reduce((sum, i) => sum + i.contract_value, 0),
    renewalPipeline: institutions.filter(i => getDaysUntilExpiry(i.contract_expiry_date) <= 60).reduce((sum, i) => sum + i.contract_value, 0)
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Institution Management</h1>
          <p className="text-muted-foreground">Manage tenants, licenses, and contracts in one place</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="list">
              Institutions ({stats.total})
            </TabsTrigger>
            <TabsTrigger value="add">
              Add Institution
            </TabsTrigger>
            <TabsTrigger value="licenses">
              License Management
            </TabsTrigger>
            <TabsTrigger value="renewals">
              Renewals & Contracts
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Institutions List */}
          <TabsContent value="list" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Institutions</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Institutions</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.active}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Licenses Expiring</CardTitle>
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.expiringSoon}</div>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Search */}
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search institutions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-[140px]">
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
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[140px]">
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
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Institution</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Users</TableHead>
                      <TableHead>License</TableHead>
                      <TableHead>Expiry</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInstitutions.map((inst) => (
                      <TableRow key={inst.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/system-admin/institutions/${inst.id}`)}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-primary hover:underline">{inst.name}</div>
                            <div className="text-sm text-muted-foreground">{inst.code}</div>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{inst.type}</TableCell>
                        <TableCell>{inst.location}</TableCell>
                        <TableCell>{inst.current_users} / {inst.max_users}</TableCell>
                        <TableCell>{getLicenseBadge(inst.license_type)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(inst.license_expiry).toLocaleDateString()}
                            <div className={`text-xs ${getDaysUntilExpiry(inst.license_expiry) <= 30 ? 'text-orange-500' : 'text-muted-foreground'}`}>
                              {getDaysUntilExpiry(inst.license_expiry)} days left
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(inst.subscription_status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Add Institution */}
          <TabsContent value="add" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Institution</CardTitle>
                <CardDescription>Register a new school or institution to the platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="font-semibold text-lg">Basic Information</div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Organization Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Delhi Public School"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slug">Slug (URL-friendly) *</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                        placeholder="e.g., dps-delhi"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Institution Type *</Label>
                      <Select value={formData.type} onValueChange={(value: Institution['type']) => setFormData({ ...formData, type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="university">University</SelectItem>
                          <SelectItem value="college">College</SelectItem>
                          <SelectItem value="school">School</SelectItem>
                          <SelectItem value="institute">Institute</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="City, State, Country"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="established_year">Established Year</Label>
                      <Input
                        id="established_year"
                        type="number"
                        value={formData.established_year}
                        onChange={(e) => setFormData({ ...formData, established_year: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="font-semibold text-lg">Contact Information</div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="contact_email">Institution Email *</Label>
                      <Input
                        id="contact_email"
                        type="email"
                        value={formData.contact_email}
                        onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                        placeholder="admin@institution.edu"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact_phone">Phone Number</Label>
                      <Input
                        id="contact_phone"
                        value={formData.contact_phone}
                        onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                        placeholder="+91-XX-XXXX-XXXX"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin_name">Admin Name *</Label>
                      <Input
                        id="admin_name"
                        value={formData.admin_name}
                        onChange={(e) => setFormData({ ...formData, admin_name: e.target.value })}
                        placeholder="Dr. John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin_email">Admin Email *</Label>
                      <Input
                        id="admin_email"
                        type="email"
                        value={formData.admin_email}
                        onChange={(e) => setFormData({ ...formData, admin_email: e.target.value })}
                        placeholder="admin@institution.edu"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="font-semibold text-lg">License Configuration</div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="license_type">License Type *</Label>
                      <Select value={formData.license_type} onValueChange={(value: Institution['license_type']) => setFormData({ ...formData, license_type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">Basic - ₹150k/year</SelectItem>
                          <SelectItem value="standard">Standard - ₹350k/year</SelectItem>
                          <SelectItem value="premium">Premium - ₹500k/year</SelectItem>
                          <SelectItem value="enterprise">Enterprise - ₹1M/year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max_users">Max Users</Label>
                      <Input
                        id="max_users"
                        type="number"
                        value={formData.max_users}
                        onChange={(e) => setFormData({ ...formData, max_users: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="font-semibold text-lg">MoU Document (Optional)</div>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Drag and drop or click to upload MoU document</p>
                    <Button variant="outline" className="mt-2">
                      <Upload className="h-4 w-4 mr-2" />
                      Browse Files
                    </Button>
                  </div>
                </div>

                <Button onClick={handleAddInstitution} className="w-full" size="lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Institution
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: License Management */}
          <TabsContent value="licenses" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Licenses</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Licenses</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.active}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
                  <Clock className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.expiringSoon}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>License Overview</CardTitle>
                  <Select value={licenseFilter} onValueChange={setLicenseFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by license" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Licenses</SelectItem>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Institution</TableHead>
                      <TableHead>License Type</TableHead>
                      <TableHead>User Capacity</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Days Left</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInstitutions.map((inst) => {
                      const usagePercent = (inst.current_users / inst.max_users) * 100;
                      const daysLeft = getDaysUntilExpiry(inst.license_expiry);
                      return (
                        <TableRow key={inst.id}>
                          <TableCell>
                            <div className="font-medium">{inst.name}</div>
                            <div className="text-sm text-muted-foreground">{inst.code}</div>
                          </TableCell>
                          <TableCell>{getLicenseBadge(inst.license_type)}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm">{inst.current_users} / {inst.max_users}</div>
                              <Progress value={usagePercent} className="h-2" />
                            </div>
                          </TableCell>
                          <TableCell>{new Date(inst.license_expiry).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant={daysLeft <= 30 ? 'destructive' : daysLeft <= 60 ? 'outline' : 'secondary'}>
                              {daysLeft} days
                            </Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(inst.subscription_status)}</TableCell>
                          <TableCell>
                            <Button 
                              size="sm" 
                              onClick={() => {
                                setSelectedInstitution(inst);
                                setIsRenewDialogOpen(true);
                              }}
                            >
                              Renew
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 4: Renewals & Contracts */}
          <TabsContent value="renewals" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
                  <Clock className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {institutions.filter(i => {
                      const days = getDaysUntilExpiry(i.contract_expiry_date);
                      return days <= 30 && days > 0;
                    }).length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Expired</CardTitle>
                  <AlertCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {institutions.filter(i => getDaysUntilExpiry(i.contract_expiry_date) < 0).length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Contract Value</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{(stats.totalValue / 100000).toFixed(1)}L</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Renewal Pipeline</CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{(stats.renewalPipeline / 100000).toFixed(1)}L</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Contract Renewals</CardTitle>
                  <Select value={contractStatusFilter} onValueChange={setContractStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Contracts</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Institution</TableHead>
                      <TableHead>Contract Type</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Days Until Expiry</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInstitutions.map((inst) => {
                      const daysLeft = getDaysUntilExpiry(inst.contract_expiry_date);
                      const status = getContractStatus(inst.contract_expiry_date);
                      return (
                        <TableRow key={inst.id}>
                          <TableCell>
                            <div className="font-medium">{inst.name}</div>
                          </TableCell>
                          <TableCell>{inst.contract_type}</TableCell>
                          <TableCell>{new Date(inst.contract_start_date).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(inst.contract_expiry_date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                status === 'expired' ? 'destructive' : 
                                status === 'expiring_soon' ? 'outline' : 
                                'secondary'
                              }
                            >
                              {daysLeft < 0 ? `${Math.abs(daysLeft)} days ago` : `${daysLeft} days`}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">₹{(inst.contract_value / 100000).toFixed(1)}L</TableCell>
                          <TableCell>
                            {status === 'expired' && <Badge variant="destructive">Expired</Badge>}
                            {status === 'expiring_soon' && <Badge variant="outline" className="bg-orange-500/10 text-orange-500">Expiring Soon</Badge>}
                            {status === 'active' && <Badge variant="default">Active</Badge>}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedInstitutionForMou(inst);
                                setIsMouDialogOpen(true);
                              }}
                              disabled={!inst.mou_document_url}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              View MoU
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* View MoU Dialog */}
        <ViewMouDialog 
          open={isMouDialogOpen}
          onOpenChange={setIsMouDialogOpen}
          institution={selectedInstitutionForMou}
        />

        {/* Renew License Dialog */}
        <Dialog open={isRenewDialogOpen} onOpenChange={setIsRenewDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Renew License</DialogTitle>
              <DialogDescription>
                Extend the license for {selectedInstitution?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Current Expiry</Label>
                <p className="text-sm text-muted-foreground">
                  {selectedInstitution && new Date(selectedInstitution.license_expiry).toLocaleDateString()}
                </p>
              </div>
              <div>
                <Label>Extension Period</Label>
                <Select defaultValue="1year">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6months">6 Months</SelectItem>
                    <SelectItem value="1year">1 Year</SelectItem>
                    <SelectItem value="2years">2 Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRenewDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleRenewLicense}>
                Renew License
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}