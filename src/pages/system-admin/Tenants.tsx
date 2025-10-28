import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, Search, MoreVertical, Building2 } from 'lucide-react';

// Mock data for development
const mockTenants = [
  {
    id: '1',
    name: 'Delhi Public School Network',
    slug: 'dps-network',
    subscription_status: 'active' as const,
    subscription_plan: 'premium' as const,
    total_users: 2450,
    total_institutions: 5,
    storage_used_gb: 125.5,
    created_at: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    name: 'Ryan International Schools',
    slug: 'ryan-schools',
    subscription_status: 'active' as const,
    subscription_plan: 'enterprise' as const,
    total_users: 3800,
    total_institutions: 8,
    storage_used_gb: 210.2,
    created_at: '2024-01-20T14:20:00Z'
  },
  {
    id: '3',
    name: 'Innovation Hub Chennai',
    slug: 'innovate-chennai',
    subscription_status: 'inactive' as const,
    subscription_plan: 'basic' as const,
    total_users: 450,
    total_institutions: 1,
    storage_used_gb: 28.3,
    created_at: '2024-02-10T09:15:00Z'
  }
];

export default function Tenants() {
  const [searchTerm, setSearchTerm] = useState('');
  const [tenants] = useState(mockTenants);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    subscription_plan: 'basic',
    admin_name: '',
    admin_email: '',
    admin_password: ''
  });

  const handleAddTenant = () => {
    toast.success('Tenant created successfully');
    setIsAddDialogOpen(false);
    setFormData({
      name: '',
      slug: '',
      subscription_plan: 'basic',
      admin_name: '',
      admin_email: '',
      admin_password: ''
    });
  };

  const filteredTenants = tenants.filter(tenant =>
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Tenant Management</h1>
            <p className="text-muted-foreground">Manage all tenants and their subscriptions</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-meta-dark hover:bg-meta-dark-lighter">
                <Plus className="mr-2 h-4 w-4" />
                Add Tenant
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Tenant</DialogTitle>
                <DialogDescription>
                  Add a new institution or organization to the platform
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Organization Name</Label>
                    <Input
                      id="name"
                      placeholder="Delhi Public School"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug (URL)</Label>
                    <Input
                      id="slug"
                      placeholder="dps-delhi"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plan">Subscription Plan</Label>
                  <Select value={formData.subscription_plan} onValueChange={(value) => setFormData({ ...formData, subscription_plan: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="border-t pt-4">
                  <h4 className="mb-4 font-medium">Admin Account Details</h4>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin_name">Admin Name</Label>
                      <Input
                        id="admin_name"
                        placeholder="John Doe"
                        value={formData.admin_name}
                        onChange={(e) => setFormData({ ...formData, admin_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin_email">Admin Email</Label>
                      <Input
                        id="admin_email"
                        type="email"
                        placeholder="admin@school.com"
                        value={formData.admin_email}
                        onChange={(e) => setFormData({ ...formData, admin_email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin_password">Temporary Password</Label>
                      <Input
                        id="admin_password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.admin_password}
                        onChange={(e) => setFormData({ ...formData, admin_password: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddTenant} className="bg-meta-dark hover:bg-meta-dark-lighter">
                  Create Tenant
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Tenants</CardTitle>
                <CardDescription>A list of all registered tenants</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tenants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Institutions</TableHead>
                  <TableHead>Storage</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-meta-dark">
                          <Building2 className="h-5 w-5 text-meta-accent" />
                        </div>
                        <div>
                          <div className="font-medium">{tenant.name}</div>
                          <div className="text-sm text-muted-foreground">{tenant.slug}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={tenant.subscription_status === 'active' ? 'default' : 'secondary'}>
                        {tenant.subscription_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {tenant.subscription_plan}
                      </Badge>
                    </TableCell>
                    <TableCell>{tenant.total_users.toLocaleString()}</TableCell>
                    <TableCell>{tenant.total_institutions}</TableCell>
                    <TableCell>{tenant.storage_used_gb.toFixed(1)} GB</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
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
