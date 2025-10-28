import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Calendar, DollarSign, TrendingUp } from 'lucide-react';

interface RenewalContract {
  id: string;
  tenant_name: string;
  contract_type: string;
  start_date: string;
  expiry_date: string;
  value: number;
  status: 'active' | 'expiring_soon' | 'expired';
  days_until_expiry: number;
}

const mockContracts: RenewalContract[] = [
  {
    id: '1',
    tenant_name: 'Springfield University',
    contract_type: 'Enterprise License',
    start_date: '2023-01-01',
    expiry_date: '2025-03-15',
    value: 125000,
    status: 'expiring_soon',
    days_until_expiry: 45,
  },
  {
    id: '2',
    tenant_name: 'River College',
    contract_type: 'Premium Plan',
    start_date: '2023-06-01',
    expiry_date: '2025-06-01',
    value: 75000,
    status: 'active',
    days_until_expiry: 120,
  },
  {
    id: '3',
    tenant_name: 'Oakwood Institute',
    contract_type: 'Standard License',
    start_date: '2022-09-01',
    expiry_date: '2024-12-20',
    value: 45000,
    status: 'expired',
    days_until_expiry: -40,
  },
  {
    id: '4',
    tenant_name: 'Tech Valley School',
    contract_type: 'Premium Plan',
    start_date: '2023-03-15',
    expiry_date: '2025-02-28',
    value: 68000,
    status: 'expiring_soon',
    days_until_expiry: 30,
  },
];

export default function RenewalTracker() {
  const [contracts] = useState<RenewalContract[]>(mockContracts);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredContracts = contracts.filter((contract) =>
    filterStatus === 'all' ? true : contract.status === filterStatus
  );

  const expiringSoonCount = contracts.filter((c) => c.status === 'expiring_soon').length;
  const expiredCount = contracts.filter((c) => c.status === 'expired').length;
  const totalValue = contracts
    .filter((c) => c.status !== 'expired')
    .reduce((sum, c) => sum + c.value, 0);
  const potentialRenewalValue = contracts
    .filter((c) => c.status === 'expiring_soon')
    .reduce((sum, c) => sum + c.value, 0);

  const getStatusBadge = (status: RenewalContract['status']) => {
    const variants = {
      active: 'secondary',
      expiring_soon: 'default',
      expired: 'destructive',
    };
    const labels = {
      active: 'Active',
      expiring_soon: 'Expiring Soon',
      expired: 'Expired',
    };
    return <Badge variant={variants[status] as any}>{labels[status]}</Badge>;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Renewal Tracker</h1>
          <p className="text-muted-foreground mt-1">
            Monitor contract expiry dates and manage renewals
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{expiringSoonCount}</div>
              <p className="text-xs text-muted-foreground">Within 60 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expired</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{expiredCount}</div>
              <p className="text-xs text-muted-foreground">Needs attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contract Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(totalValue / 1000).toFixed(0)}K</div>
              <p className="text-xs text-muted-foreground">Active contracts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Renewal Pipeline</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(potentialRenewalValue / 1000).toFixed(0)}K</div>
              <p className="text-xs text-muted-foreground">Up for renewal</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Contract Renewals</CardTitle>
                <CardDescription>Track upcoming and expired contracts</CardDescription>
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
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
                  <TableHead>Tenant</TableHead>
                  <TableHead>Contract Type</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Days Until Expiry</TableHead>
                  <TableHead className="text-right">Contract Value</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell className="font-medium">{contract.tenant_name}</TableCell>
                    <TableCell>{contract.contract_type}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(contract.expiry_date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          contract.days_until_expiry < 0
                            ? 'text-red-500 font-medium'
                            : contract.days_until_expiry <= 60
                            ? 'text-orange-500 font-medium'
                            : ''
                        }
                      >
                        {contract.days_until_expiry < 0
                          ? `${Math.abs(contract.days_until_expiry)} days ago`
                          : `${contract.days_until_expiry} days`}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${contract.value.toLocaleString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(contract.status)}</TableCell>
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
