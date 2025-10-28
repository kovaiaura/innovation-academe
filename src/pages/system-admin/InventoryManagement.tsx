import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, AlertTriangle, CheckCircle, TrendingUp, Search, Clock, DollarSign, AlertCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

// Data Types
interface InventorySummary {
  institution_id: string;
  institution_name: string;
  total_items: number;
  missing_items: number;
  damaged_items: number;
  last_audit_date: string;
  value: number;
  status: 'good' | 'needs_review' | 'critical';
  categories: {
    technology: { count: number; value: number };
    tools: { count: number; value: number };
    furniture: { count: number; value: number };
    equipment: { count: number; value: number };
    consumables: { count: number; value: number };
    other: { count: number; value: number };
  };
}

interface PurchaseRequest {
  id: string;
  institution_id: string;
  institution_name: string;
  requested_by: string;
  requester_role: string;
  items: Array<{ name: string; category: string; quantity: number; unit_price: number }>;
  total_amount: number;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requested_date: string;
  notes?: string;
}

// Mock Data
const mockInventory: InventorySummary[] = [
  {
    institution_id: 'inst1',
    institution_name: 'Springfield University',
    total_items: 342,
    missing_items: 5,
    damaged_items: 8,
    last_audit_date: '2024-01-10',
    value: 145000,
    status: 'good',
    categories: {
      technology: { count: 80, value: 45000 },
      tools: { count: 50, value: 15000 },
      furniture: { count: 120, value: 35000 },
      equipment: { count: 72, value: 28000 },
      consumables: { count: 15, value: 4000 },
      other: { count: 5, value: 18000 },
    },
  },
  {
    institution_id: 'inst2',
    institution_name: 'River College',
    total_items: 218,
    missing_items: 12,
    damaged_items: 15,
    last_audit_date: '2023-11-25',
    value: 89000,
    status: 'needs_review',
    categories: {
      technology: { count: 60, value: 28000 },
      tools: { count: 35, value: 10000 },
      furniture: { count: 80, value: 25000 },
      equipment: { count: 28, value: 15000 },
      consumables: { count: 10, value: 3000 },
      other: { count: 5, value: 8000 },
    },
  },
  {
    institution_id: 'inst3',
    institution_name: 'Oakwood Institute',
    total_items: 156,
    missing_items: 25,
    damaged_items: 18,
    last_audit_date: '2023-09-15',
    value: 62000,
    status: 'critical',
    categories: {
      technology: { count: 40, value: 20000 },
      tools: { count: 25, value: 8000 },
      furniture: { count: 60, value: 18000 },
      equipment: { count: 20, value: 10000 },
      consumables: { count: 8, value: 2000 },
      other: { count: 3, value: 4000 },
    },
  },
  {
    institution_id: 'inst4',
    institution_name: 'Tech Valley School',
    total_items: 289,
    missing_items: 3,
    damaged_items: 6,
    last_audit_date: '2024-01-15',
    value: 112000,
    status: 'good',
    categories: {
      technology: { count: 70, value: 38000 },
      tools: { count: 45, value: 12000 },
      furniture: { count: 100, value: 30000 },
      equipment: { count: 55, value: 22000 },
      consumables: { count: 12, value: 3000 },
      other: { count: 7, value: 7000 },
    },
  },
];

const mockPurchaseRequests: PurchaseRequest[] = [
  {
    id: '1',
    institution_id: 'inst1',
    institution_name: 'Springfield University',
    requested_by: 'Dr. Sarah Johnson',
    requester_role: 'Lab Head',
    items: [
      { name: '3D Printer', category: 'Equipment', quantity: 2, unit_price: 1500 },
      { name: 'Arduino Kits', category: 'Technology', quantity: 20, unit_price: 50 },
    ],
    total_amount: 4000,
    priority: 'high',
    status: 'pending',
    requested_date: '2024-01-15',
    notes: 'Urgent need for upcoming AI/ML workshop',
  },
  {
    id: '2',
    institution_id: 'inst2',
    institution_name: 'River College',
    requested_by: 'Prof. Michael Chen',
    requester_role: 'Principal',
    items: [
      { name: 'Soldering Stations', category: 'Tools', quantity: 10, unit_price: 150 },
    ],
    total_amount: 1500,
    priority: 'medium',
    status: 'pending',
    requested_date: '2024-01-12',
  },
  {
    id: '3',
    institution_id: 'inst3',
    institution_name: 'Oakwood Institute',
    requested_by: 'Ms. Emily Rodriguez',
    requester_role: 'Lab Coordinator',
    items: [
      { name: 'Lab Tables', category: 'Furniture', quantity: 5, unit_price: 300 },
      { name: 'Safety Equipment', category: 'Consumables', quantity: 50, unit_price: 20 },
    ],
    total_amount: 2500,
    priority: 'high',
    status: 'approved',
    requested_date: '2024-01-10',
  },
  {
    id: '4',
    institution_id: 'inst4',
    institution_name: 'Tech Valley School',
    requested_by: 'Dr. Amanda White',
    requester_role: 'HOD Electronics',
    items: [
      { name: 'Oscilloscopes', category: 'Equipment', quantity: 3, unit_price: 800 },
    ],
    total_amount: 2400,
    priority: 'low',
    status: 'completed',
    requested_date: '2024-01-08',
  },
];

export default function InventoryManagement() {
  const [inventory] = useState<InventorySummary[]>(mockInventory);
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>(mockPurchaseRequests);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [requestStatusFilter, setRequestStatusFilter] = useState<string>('all');

  // Inventory Stats
  const totalValue = inventory.reduce((sum, inv) => sum + inv.value, 0);
  const totalItems = inventory.reduce((sum, inv) => sum + inv.total_items, 0);
  const totalMissing = inventory.reduce((sum, inv) => sum + inv.missing_items, 0);
  const totalDamaged = inventory.reduce((sum, inv) => sum + inv.damaged_items, 0);
  const criticalCount = inventory.filter((inv) => inv.status === 'critical').length;
  const needsReviewCount = inventory.filter((inv) => inv.status === 'needs_review').length;

  // Purchase Request Stats
  const pendingRequests = purchaseRequests.filter(r => r.status === 'pending').length;
  const pendingValue = purchaseRequests.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.total_amount, 0);
  const approvedThisMonth = purchaseRequests.filter(r => r.status === 'approved' && new Date(r.requested_date).getMonth() === new Date().getMonth()).length;

  // Filters
  const filteredInventory = inventory.filter(inv => {
    const matchesSearch = inv.institution_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredRequests = purchaseRequests.filter(req => {
    const matchesStatus = requestStatusFilter === 'all' || req.status === requestStatusFilter;
    return matchesStatus;
  });

  // Badge helpers
  const getStatusBadge = (status: InventorySummary['status']) => {
    const config = {
      good: { variant: 'default' as const, icon: <CheckCircle className="h-3 w-3" />, label: 'Good' },
      needs_review: { variant: 'secondary' as const, icon: <AlertTriangle className="h-3 w-3" />, label: 'Needs Review' },
      critical: { variant: 'destructive' as const, icon: <AlertCircle className="h-3 w-3" />, label: 'Critical' },
    };
    const { variant, icon, label } = config[status];
    return (
      <Badge variant={variant} className="gap-1">
        {icon}
        {label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: PurchaseRequest['priority']) => {
    const variants: Record<PurchaseRequest['priority'], "default" | "secondary" | "destructive"> = {
      high: 'destructive',
      medium: 'secondary',
      low: 'default',
    };
    return <Badge variant={variants[priority]}>{priority.toUpperCase()}</Badge>;
  };

  const getRequestStatusBadge = (status: PurchaseRequest['status']) => {
    const variants: Record<PurchaseRequest['status'], "default" | "secondary" | "destructive" | "outline"> = {
      pending: 'secondary',
      approved: 'default',
      rejected: 'destructive',
      completed: 'outline',
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const getDaysSinceAudit = (date: string) => {
    const auditDate = new Date(date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - auditDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleApproveRequest = (id: string) => {
    setPurchaseRequests(purchaseRequests.map(req => 
      req.id === id ? { ...req, status: 'approved' as const } : req
    ));
    toast.success('Purchase request approved');
  };

  const handleRejectRequest = (id: string) => {
    setPurchaseRequests(purchaseRequests.map(req => 
      req.id === id ? { ...req, status: 'rejected' as const } : req
    ));
    toast.error('Purchase request rejected');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage institution inventory and purchase requests
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Inventory Overview</TabsTrigger>
            <TabsTrigger value="purchases">Purchase Requests ({pendingRequests})</TabsTrigger>
          </TabsList>

          {/* Inventory Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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
                  <CardTitle className="text-sm font-medium">Missing Items</CardTitle>
                  <XCircle className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalMissing}</div>
                  <p className="text-xs text-muted-foreground">Need tracking</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Damaged Items</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalDamaged}</div>
                  <p className="text-xs text-muted-foreground">Need replacement</p>
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
                <div className="flex gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search institutions..." 
                      value={searchTerm} 
                      onChange={(e) => setSearchTerm(e.target.value)} 
                      className="pl-8" 
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="needs_review">Needs Review</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Institution</TableHead>
                      <TableHead className="text-right">Total Items</TableHead>
                      <TableHead className="text-right">Missing</TableHead>
                      <TableHead className="text-right">Damaged</TableHead>
                      <TableHead>Category Breakdown</TableHead>
                      <TableHead className="text-right">Total Value</TableHead>
                      <TableHead>Last Audit</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInventory.map((inv) => {
                      const daysSinceAudit = getDaysSinceAudit(inv.last_audit_date);
                      return (
                        <TableRow key={inv.institution_id}>
                          <TableCell className="font-medium">{inv.institution_name}</TableCell>
                          <TableCell className="text-right">{inv.total_items}</TableCell>
                          <TableCell className="text-right">
                            <span className={inv.missing_items > 10 ? "text-orange-500 font-semibold" : ""}>
                              {inv.missing_items}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={inv.damaged_items > 10 ? "text-red-500 font-semibold" : ""}>
                              {inv.damaged_items}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap">
                              {Object.entries(inv.categories).map(([category, data]) => (
                                <Badge key={category} variant="outline" className="text-xs">
                                  {category.charAt(0).toUpperCase()}: {data.count}
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
          </TabsContent>

          {/* Purchase Requests Tab */}
          <TabsContent value="purchases" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingRequests}</div>
                  <p className="text-xs text-muted-foreground">Awaiting approval</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Value</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${pendingValue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Total amount</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Approved This Month</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{approvedThisMonth}</div>
                  <p className="text-xs text-muted-foreground">Requests processed</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Purchase Requests</CardTitle>
                    <CardDescription>Review and approve inventory purchase requests</CardDescription>
                  </div>
                  <Select value={requestStatusFilter} onValueChange={setRequestStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Institution</TableHead>
                      <TableHead>Requested By</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.institution_name}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{request.requested_by}</div>
                            <div className="text-xs text-muted-foreground">{request.requester_role}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {request.items.map((item, idx) => (
                              <div key={idx} className="mb-1">
                                <span className="font-medium">{item.name}</span> x{item.quantity}
                                <Badge variant="outline" className="ml-2 text-xs">{item.category}</Badge>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">${request.total_amount.toLocaleString()}</TableCell>
                        <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                        <TableCell>{new Date(request.requested_date).toLocaleDateString()}</TableCell>
                        <TableCell>{getRequestStatusBadge(request.status)}</TableCell>
                        <TableCell>
                          {request.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleApproveRequest(request.id)}>
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                onClick={() => handleRejectRequest(request.id)}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
