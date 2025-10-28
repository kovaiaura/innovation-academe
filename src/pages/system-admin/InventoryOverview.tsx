import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

interface InventoryAudit {
  institution_id: string;
  institution_name: string;
  total_items: number;
  last_audit_date: string;
  value: number;
  status: 'good' | 'needs_review' | 'critical';
  categories: Record<string, number>;
}

const mockInventory: InventoryAudit[] = [
  {
    institution_id: 'inst1',
    institution_name: 'Springfield University',
    total_items: 342,
    last_audit_date: '2024-01-10',
    value: 145000,
    status: 'good',
    categories: { Technology: 150, Furniture: 120, Equipment: 72 },
  },
  {
    institution_id: 'inst2',
    institution_name: 'River College',
    total_items: 218,
    last_audit_date: '2023-11-25',
    value: 89000,
    status: 'needs_review',
    categories: { Technology: 90, Furniture: 80, Equipment: 48 },
  },
  {
    institution_id: 'inst3',
    institution_name: 'Oakwood Institute',
    total_items: 156,
    last_audit_date: '2023-09-15',
    value: 62000,
    status: 'critical',
    categories: { Technology: 60, Furniture: 70, Equipment: 26 },
  },
  {
    institution_id: 'inst4',
    institution_name: 'Tech Valley School',
    total_items: 289,
    last_audit_date: '2024-01-15',
    value: 112000,
    status: 'good',
    categories: { Technology: 130, Furniture: 100, Equipment: 59 },
  },
];

export default function InventoryOverview() {
  const [inventory] = useState<InventoryAudit[]>(mockInventory);

  const totalValue = inventory.reduce((sum, inv) => sum + inv.value, 0);
  const totalItems = inventory.reduce((sum, inv) => sum + inv.total_items, 0);
  const criticalCount = inventory.filter((inv) => inv.status === 'critical').length;
  const needsReviewCount = inventory.filter((inv) => inv.status === 'needs_review').length;

  const getStatusBadge = (status: InventoryAudit['status']) => {
    const config = {
      good: { variant: 'secondary' as const, icon: <CheckCircle className="h-3 w-3" />, label: 'Good' },
      needs_review: { variant: 'default' as const, icon: <AlertTriangle className="h-3 w-3" />, label: 'Needs Review' },
      critical: { variant: 'destructive' as const, icon: <AlertTriangle className="h-3 w-3" />, label: 'Critical' },
    };
    const { variant, icon, label } = config[status];
    return (
      <Badge variant={variant} className="gap-1">
        {icon}
        {label}
      </Badge>
    );
  };

  const getDaysSinceAudit = (date: string) => {
    const auditDate = new Date(date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - auditDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Inventory Overview</h1>
          <p className="text-muted-foreground mt-1">
            Institution-wise inventory audit summaries
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(totalValue / 1000).toFixed(0)}K</div>
              <p className="text-xs text-muted-foreground">Across all institutions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalItems}</div>
              <p className="text-xs text-muted-foreground">Tracked assets</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Needs Review</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{needsReviewCount}</div>
              <p className="text-xs text-muted-foreground">Institutions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Audits</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{criticalCount}</div>
              <p className="text-xs text-muted-foreground">Urgent attention</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Institution Inventory Status</CardTitle>
            <CardDescription>Detailed inventory audit information</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Institution</TableHead>
                  <TableHead className="text-right">Total Items</TableHead>
                  <TableHead>Category Breakdown</TableHead>
                  <TableHead className="text-right">Total Value</TableHead>
                  <TableHead>Last Audit</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((inv) => {
                  const daysSinceAudit = getDaysSinceAudit(inv.last_audit_date);
                  return (
                    <TableRow key={inv.institution_id}>
                      <TableCell className="font-medium">{inv.institution_name}</TableCell>
                      <TableCell className="text-right">{inv.total_items}</TableCell>
                      <TableCell>
                        <div className="flex gap-2 flex-wrap">
                          {Object.entries(inv.categories).map(([category, count]) => (
                            <Badge key={category} variant="outline">
                              {category}: {count}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${inv.value.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div>
                          {new Date(inv.last_audit_date).toLocaleDateString()}
                          <div className="text-xs text-muted-foreground">
                            {daysSinceAudit} days ago
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(inv.status)}</TableCell>
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
