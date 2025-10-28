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
import { Key, RefreshCw, AlertCircle, CheckCircle, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Layout } from '@/components/layout/Layout';

const mockLicenses = [
  {
    id: '1',
    institution_id: 'inst-1',
    institution_name: 'Springfield College',
    license_type: 'premium' as const,
    start_date: '2024-07-01',
    expiry_date: '2025-06-30',
    max_users: 500,
    current_users: 431,
    status: 'active' as const,
    features: ['Advanced Analytics', 'API Access', 'Custom Branding', 'Priority Support'],
  },
  {
    id: '2',
    institution_id: 'inst-2',
    institution_name: 'Tech University',
    license_type: 'enterprise' as const,
    start_date: '2024-01-01',
    expiry_date: '2025-12-31',
    max_users: 2000,
    current_users: 1434,
    status: 'active' as const,
    features: ['All Premium Features', 'Dedicated Support', 'SLA Guarantee', 'Custom Integration'],
  },
  {
    id: '3',
    institution_id: 'inst-3',
    institution_name: 'Innovation Institute',
    license_type: 'standard' as const,
    start_date: '2024-04-01',
    expiry_date: '2025-03-31',
    max_users: 200,
    current_users: 154,
    status: 'expiring_soon' as const,
    features: ['Basic Analytics', 'Email Support', 'Standard Features'],
  },
];

export default function SystemAdminLicenses() {
  const [licenses, setLicenses] = useState(mockLicenses);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const handleRenewLicense = (licenseId: string, institutionName: string) => {
    toast.success(`License renewed for ${institutionName}`);
    setIsDialogOpen(false);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: 'bg-green-500/10 text-green-500',
      expired: 'bg-red-500/10 text-red-500',
      expiring_soon: 'bg-yellow-500/10 text-yellow-500',
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

  const filteredLicenses = licenses.filter(
    (license) =>
      (filterStatus === 'all' || license.status === filterStatus) &&
      (license.institution_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        license.license_type.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const days = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">License Management</h1>
            <p className="text-muted-foreground">Manage institution licenses and renewals</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search licenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{licenses.length}</div>
              <p className="text-sm text-muted-foreground">Total Licenses</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-500">
                {licenses.filter((l) => l.status === 'active').length}
              </div>
              <p className="text-sm text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-500">
                {licenses.filter((l) => l.status === 'expiring_soon').length}
              </div>
              <p className="text-sm text-muted-foreground">Expiring Soon</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {licenses.reduce((sum, l) => sum + l.current_users, 0)}
              </div>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </CardContent>
          </Card>
        </div>

        {/* Licenses Table */}
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Institution</TableHead>
                  <TableHead>License Type</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Days Left</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLicenses.map((license) => {
                  const daysLeft = getDaysUntilExpiry(license.expiry_date);
                  const usagePercent = (license.current_users / license.max_users) * 100;

                  return (
                    <TableRow key={license.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Key className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{license.institution_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getLicenseBadge(license.license_type)}>
                          {license.license_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {license.current_users}/{license.max_users}
                          </p>
                          <div className="w-20 bg-secondary rounded-full h-1 mt-1">
                            <div
                              className={`h-1 rounded-full ${
                                usagePercent >= 90 ? 'bg-red-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${usagePercent}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(license.start_date).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(license.expiry_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <span
                          className={
                            daysLeft < 30
                              ? 'text-red-500 font-medium'
                              : daysLeft < 60
                              ? 'text-yellow-500'
                              : ''
                          }
                        >
                          {daysLeft} days
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(license.status)}>
                          {license.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Dialog open={isDialogOpen && selectedLicense?.id === license.id} onOpenChange={setIsDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedLicense(license)}
                            >
                              <RefreshCw className="h-4 w-4 mr-1" />
                              Renew
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Renew License</DialogTitle>
                              <DialogDescription>
                                Extend the license for {license.institution_name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label>Current Expiry Date</Label>
                                <Input
                                  value={new Date(license.expiry_date).toLocaleDateString()}
                                  disabled
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="duration">Extension Duration</Label>
                                <Select>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select duration" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="3">3 Months</SelectItem>
                                    <SelectItem value="6">6 Months</SelectItem>
                                    <SelectItem value="12">1 Year</SelectItem>
                                    <SelectItem value="24">2 Years</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="license_type">License Type</Label>
                                <Select defaultValue={license.license_type}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="basic">Basic</SelectItem>
                                    <SelectItem value="standard">Standard</SelectItem>
                                    <SelectItem value="premium">Premium</SelectItem>
                                    <SelectItem value="enterprise">Enterprise</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="rounded-lg bg-blue-500/10 p-4 text-sm">
                                <div className="flex items-start gap-2">
                                  <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                                  <div>
                                    <p className="font-medium text-blue-500">Features Included:</p>
                                    <ul className="list-disc list-inside mt-2 text-muted-foreground">
                                      {license.features.map((feature, index) => (
                                        <li key={index}>{feature}</li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button
                                onClick={() =>
                                  handleRenewLicense(license.id, license.institution_name)
                                }
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Renew License
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
