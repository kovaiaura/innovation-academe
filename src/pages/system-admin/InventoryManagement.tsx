import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInstitutionData, InventorySummary } from '@/contexts/InstitutionDataContext';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, AlertTriangle, CheckCircle, TrendingUp, Search, Clock, DollarSign, AlertCircle as AlertCircleIcon, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { mockPurchaseRequests, updateMockPurchaseRequest } from '@/data/mockInventoryData';
import { PurchaseRequest } from '@/types/inventory';
import { PurchaseRequestStatusBadge } from '@/components/inventory/PurchaseRequestStatusBadge';
import { PurchaseRequestDetailDialog } from '@/components/inventory/PurchaseRequestDetailDialog';
import { ApproveRejectDialog } from '@/components/inventory/ApproveRejectDialog';
import { FulfillRequestDialog } from '@/components/inventory/FulfillRequestDialog';
import { format } from 'date-fns';

export default function InventoryManagement() {
  const navigate = useNavigate();
  const { inventorySummaries } = useInstitutionData();
  const inventory = Object.values(inventorySummaries);
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>(mockPurchaseRequests);
  const [selectedRequest, setSelectedRequest] = useState<PurchaseRequest | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [fulfillDialogOpen, setFulfillDialogOpen] = useState(false);
  const [fulfillMode, setFulfillMode] = useState<'in_progress' | 'fulfilled'>('in_progress');
  const [actionRequest, setActionRequest] = useState<PurchaseRequest | null>(null);
  
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
  const pendingRequests = purchaseRequests.filter(r => r.status === 'approved_by_institution' || r.status === 'pending_system_admin').length;
  const pendingValue = purchaseRequests.filter(r => r.status === 'approved_by_institution' || r.status === 'pending_system_admin').reduce((sum, r) => sum + r.total_estimated_cost, 0);
  const approvedThisMonth = purchaseRequests.filter(r => (r.status === 'fulfilled' || r.status === 'in_progress') && new Date(r.created_at).getMonth() === new Date().getMonth()).length;

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
      critical: { variant: 'destructive' as const, icon: <AlertCircleIcon className="h-3 w-3" />, label: 'Critical' },
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

  const handleMarkInProgress = (request: PurchaseRequest) => {
    setActionRequest(request);
    setFulfillMode('in_progress');
    setFulfillDialogOpen(true);
  };

  const handleMarkFulfilled = (request: PurchaseRequest) => {
    setActionRequest(request);
    setFulfillMode('fulfilled');
    setFulfillDialogOpen(true);
  };

  const handleReject = (request: PurchaseRequest) => {
    setActionRequest(request);
    setRejectDialogOpen(true);
  };

  const confirmFulfill = (data: { comments: string; deliveryDate?: string }) => {
    if (actionRequest) {
      if (fulfillMode === 'in_progress') {
        updateMockPurchaseRequest(actionRequest.id, {
          status: 'in_progress',
          system_admin_processed_by: 'sysadmin-001',
          system_admin_processed_by_name: 'John Doe',
          system_admin_processed_at: new Date().toISOString(),
          system_admin_comments: data.comments,
        });
        toast.success(`Request ${actionRequest.request_code} marked as in progress`);
      } else {
        updateMockPurchaseRequest(actionRequest.id, {
          status: 'fulfilled',
          fulfillment_details: data.comments,
          fulfillment_date: data.deliveryDate,
        });
        toast.success(`Request ${actionRequest.request_code} fulfilled`);
      }
      setPurchaseRequests([...mockPurchaseRequests]);
      setActionRequest(null);
    }
  };

  const confirmReject = (reason: string) => {
    if (actionRequest) {
      updateMockPurchaseRequest(actionRequest.id, {
        status: 'rejected_by_system_admin',
        system_admin_processed_by: 'sysadmin-001',
        system_admin_processed_by_name: 'John Doe',
        system_admin_processed_at: new Date().toISOString(),
        system_admin_rejection_reason: reason,
      });
      setPurchaseRequests([...mockPurchaseRequests]);
      toast.error(`Request ${actionRequest.request_code} rejected`);
      setActionRequest(null);
    }
  };

  const handleRowClick = (institutionId: string) => {
    navigate(`/system-admin/inventory-management/${institutionId}`);
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
                  <div className="text-2xl font-bold">₹{(totalValue / 1000).toFixed(0)}K</div>
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
                        <TableRow 
                          key={inv.institution_id}
                          onClick={() => handleRowClick(inv.institution_id)}
                          className="cursor-pointer hover:bg-accent/50 transition-colors"
                        >
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
                            ₹{inv.value.toLocaleString()}
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
            {/* Approved by Institutions Section */}
            {filteredRequests.filter(r => r.status === 'approved_by_institution').length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-blue-500" />
                    <CardTitle>Approved by Institutions - Action Required</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {filteredRequests.filter(r => r.status === 'approved_by_institution').map((req) => (
                    <Card key={req.id}>
                      <CardContent className="pt-6 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{req.request_code}</h3>
                              <PurchaseRequestStatusBadge status={req.status} size="sm" />
                            </div>
                            <p className="text-sm text-muted-foreground">{req.institution_name} • {req.officer_name}</p>
                          </div>
                          <p className="text-xl font-bold">₹{req.total_estimated_cost.toLocaleString()}</p>
                        </div>
                        <div className="text-sm">
                          <p className="text-muted-foreground mb-1">Approved by: {req.institution_approved_by_name}</p>
                          <p className="text-muted-foreground">Approval Date: {req.institution_approved_at && format(new Date(req.institution_approved_at), 'MMM dd, yyyy')}</p>
                        </div>
                        <div className="flex gap-2 pt-2 border-t">
                          <Button size="sm" variant="outline" onClick={() => setSelectedRequest(req)}>View Details</Button>
                          <Button size="sm" onClick={() => handleMarkInProgress(req)}><Loader2 className="h-4 w-4 mr-1" />Mark In Progress</Button>
                          <Button size="sm" variant="default" onClick={() => handleMarkFulfilled(req)}><CheckCircle className="h-4 w-4 mr-1" />Mark Fulfilled</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleReject(req)}>Reject</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* In Progress Section */}
            {filteredRequests.filter(r => r.status === 'in_progress').length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin text-purple-500" />Orders In Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {filteredRequests.filter(r => r.status === 'in_progress').map((req) => (
                    <Card key={req.id} className="cursor-pointer" onClick={() => setSelectedRequest(req)}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{req.request_code}</h3>
                              <PurchaseRequestStatusBadge status={req.status} size="sm" />
                            </div>
                            <p className="text-sm text-muted-foreground">{req.institution_name}</p>
                            <p className="text-xs text-muted-foreground mt-2">Updated: {format(new Date(req.updated_at), 'MMM dd, yyyy')}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">₹{req.total_estimated_cost.toLocaleString()}</p>
                            <Button size="sm" className="mt-2" onClick={(e) => { e.stopPropagation(); handleMarkFulfilled(req); }}>Mark Fulfilled</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Completed/Fulfilled Requests */}
            {filteredRequests.filter(r => r.status === 'fulfilled' || r.status === 'rejected_by_system_admin').length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Request History</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {filteredRequests.filter(r => r.status === 'fulfilled' || r.status === 'rejected_by_system_admin').map((req) => (
                    <Card key={req.id} className="cursor-pointer hover:bg-accent/50" onClick={() => setSelectedRequest(req)}>
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{req.request_code}</h3>
                              <PurchaseRequestStatusBadge status={req.status} size="sm" />
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{req.institution_name} • ₹{req.total_estimated_cost.toLocaleString()}</p>
                          </div>
                          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedRequest(req); }}>View Details</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <PurchaseRequestDetailDialog isOpen={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)} request={selectedRequest} />
      <ApproveRejectDialog isOpen={rejectDialogOpen} onOpenChange={setRejectDialogOpen} request={actionRequest} mode="reject" onConfirm={confirmReject} title="Reject Purchase Request" />
      <FulfillRequestDialog isOpen={fulfillDialogOpen} onOpenChange={setFulfillDialogOpen} request={actionRequest} mode={fulfillMode} onConfirm={confirmFulfill} />
    </Layout>
  );
}
