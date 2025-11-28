import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, AlertTriangle, CheckCircle, TrendingUp, Search, Clock, DollarSign, AlertCircle as AlertCircleIcon, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { 
  loadPurchaseRequests, 
  savePurchaseRequests,
  loadInventoryItems,
  loadAuditRecords,
  getInventoryByInstitution,
  getAuditRecordsByInstitution,
} from '@/data/mockInventoryData';
import { PurchaseRequest, InventoryItem, AuditRecord } from '@/types/inventory';
import { PurchaseRequestStatusBadge } from '@/components/inventory/PurchaseRequestStatusBadge';
import { PurchaseRequestDetailDialog } from '@/components/inventory/PurchaseRequestDetailDialog';
import { ApproveRejectDialog } from '@/components/inventory/ApproveRejectDialog';
import { FulfillRequestDialog } from '@/components/inventory/FulfillRequestDialog';
import { SystemAdminApprovalDialog } from '@/components/inventory/SystemAdminApprovalDialog';
import { format } from 'date-fns';

interface InstitutionInventorySummary {
  institution_id: string;
  institution_name: string;
  total_items: number;
  total_value: number;
  missing_items: number;
  damaged_items: number;
  last_audit_date: string;
  status: 'good' | 'needs_review' | 'critical';
}

export default function InventoryManagement() {
  const navigate = useNavigate();
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([]);
  const [inventorySummaries, setInventorySummaries] = useState<InstitutionInventorySummary[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<PurchaseRequest | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [fulfillDialogOpen, setFulfillDialogOpen] = useState(false);
  const [fulfillMode, setFulfillMode] = useState<'in_progress' | 'fulfilled'>('in_progress');
  const [actionRequest, setActionRequest] = useState<PurchaseRequest | null>(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [approvalMode, setApprovalMode] = useState<'approve' | 'reject'>('approve');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [requestStatusFilter, setRequestStatusFilter] = useState<string>('all');

  // Institution ID to name mapping
  const institutionNames: Record<string, string> = {
    'inst-msd-001': 'Modern School Vasant Vihar',
    'inst-kga-001': 'Kikani Global Academy',
  };

  // Load data on mount
  useEffect(() => {
    // Load purchase requests
    setPurchaseRequests(loadPurchaseRequests());
    
    // Build inventory summaries from all institutions
    const allInventory = loadInventoryItems();
    const allAudits = loadAuditRecords();
    
    const summaries: InstitutionInventorySummary[] = Object.keys(institutionNames).map(instId => {
      const inventory = allInventory[instId] || [];
      const audits = allAudits[instId] || [];
      const latestAudit = audits[0];
      
      const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);
      const totalValue = inventory.reduce((sum, item) => sum + item.total_value, 0);
      const missingItems = latestAudit?.missing_items.length || 0;
      const damagedItems = latestAudit?.damaged_items.length || 0;
      
      // Determine status based on audit results
      let status: 'good' | 'needs_review' | 'critical' = 'good';
      if (missingItems > 5 || damagedItems > 5) {
        status = 'critical';
      } else if (missingItems > 0 || damagedItems > 0) {
        status = 'needs_review';
      }
      
      return {
        institution_id: instId,
        institution_name: institutionNames[instId],
        total_items: totalItems,
        total_value: totalValue,
        missing_items: missingItems,
        damaged_items: damagedItems,
        last_audit_date: latestAudit?.audit_date || 'No audit',
        status,
      };
    });
    
    setInventorySummaries(summaries);
  }, []);

  // Inventory Stats
  const totalValue = inventorySummaries.reduce((sum, inv) => sum + inv.total_value, 0);
  const totalItems = inventorySummaries.reduce((sum, inv) => sum + inv.total_items, 0);
  const totalMissing = inventorySummaries.reduce((sum, inv) => sum + inv.missing_items, 0);
  const totalDamaged = inventorySummaries.reduce((sum, inv) => sum + inv.damaged_items, 0);
  const criticalCount = inventorySummaries.filter((inv) => inv.status === 'critical').length;
  const needsReviewCount = inventorySummaries.filter((inv) => inv.status === 'needs_review').length;

  // Purchase Request Stats
  const pendingReviewRequests = purchaseRequests.filter(r => r.status === 'pending_system_admin').length;
  const forwardedToInstitutions = purchaseRequests.filter(r => r.status === 'approved_by_system_admin' || r.status === 'pending_institution_approval').length;
  const readyForProcessing = purchaseRequests.filter(r => r.status === 'approved_by_institution').length;
  const inProgress = purchaseRequests.filter(r => r.status === 'in_progress').length;

  // Filters
  const filteredInventory = inventorySummaries.filter(inv => {
    const matchesSearch = inv.institution_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredRequests = purchaseRequests.filter(req => {
    const matchesStatus = requestStatusFilter === 'all' || req.status === requestStatusFilter;
    return matchesStatus;
  });

  // Badge helpers
  const getStatusBadge = (status: InstitutionInventorySummary['status']) => {
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
    if (date === 'No audit') return 999;
    const auditDate = new Date(date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - auditDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Purchase request handlers
  const handleViewDetails = (request: PurchaseRequest) => {
    // Get fresh data from localStorage
    const allRequests = loadPurchaseRequests();
    const freshRequest = allRequests.find(r => r.id === request.id);
    setSelectedRequest(freshRequest || request);
  };

  const handleApproveRequest = (request: PurchaseRequest) => {
    setActionRequest(request);
    setApprovalMode('approve');
    setApprovalDialogOpen(true);
  };

  const handleRejectInitialRequest = (request: PurchaseRequest) => {
    setActionRequest(request);
    setApprovalMode('reject');
    setApprovalDialogOpen(true);
  };

  const confirmApproval = (comments: string) => {
    if (actionRequest) {
      const allRequests = loadPurchaseRequests();
      const index = allRequests.findIndex(r => r.id === actionRequest.id);
      if (index !== -1) {
        allRequests[index] = {
          ...allRequests[index],
          status: 'approved_by_system_admin',
          system_admin_reviewed_by: 'sysadmin-001',
          system_admin_reviewed_by_name: 'System Admin',
          system_admin_reviewed_at: new Date().toISOString(),
          system_admin_review_comments: comments,
          updated_at: new Date().toISOString(),
        };
        savePurchaseRequests(allRequests);
        setPurchaseRequests(allRequests);
        toast.success(`Request ${actionRequest.request_code} approved and forwarded to institution`);
      }
      setActionRequest(null);
    }
  };

  const confirmInitialRejection = (reason: string) => {
    if (actionRequest) {
      const allRequests = loadPurchaseRequests();
      const index = allRequests.findIndex(r => r.id === actionRequest.id);
      if (index !== -1) {
        allRequests[index] = {
          ...allRequests[index],
          status: 'rejected_by_system_admin',
          system_admin_reviewed_by: 'sysadmin-001',
          system_admin_reviewed_by_name: 'System Admin',
          system_admin_reviewed_at: new Date().toISOString(),
          system_admin_rejection_reason: reason,
          updated_at: new Date().toISOString(),
        };
        savePurchaseRequests(allRequests);
        setPurchaseRequests(allRequests);
        toast.error(`Request ${actionRequest.request_code} rejected`);
      }
      setActionRequest(null);
    }
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
      const allRequests = loadPurchaseRequests();
      const index = allRequests.findIndex(r => r.id === actionRequest.id);
      if (index !== -1) {
        if (fulfillMode === 'in_progress') {
          allRequests[index] = {
            ...allRequests[index],
            status: 'in_progress',
            system_admin_processed_by: 'sysadmin-001',
            system_admin_processed_by_name: 'System Admin',
            system_admin_processed_at: new Date().toISOString(),
            system_admin_processing_comments: data.comments,
            updated_at: new Date().toISOString(),
          };
          toast.success(`Request ${actionRequest.request_code} marked as in progress`);
        } else {
          allRequests[index] = {
            ...allRequests[index],
            status: 'fulfilled',
            fulfillment_details: data.comments,
            fulfillment_date: data.deliveryDate,
            updated_at: new Date().toISOString(),
          };
          toast.success(`Request ${actionRequest.request_code} fulfilled`);
        }
        savePurchaseRequests(allRequests);
        setPurchaseRequests(allRequests);
      }
      setActionRequest(null);
    }
  };

  const confirmReject = (reason: string) => {
    if (actionRequest) {
      const allRequests = loadPurchaseRequests();
      const index = allRequests.findIndex(r => r.id === actionRequest.id);
      if (index !== -1) {
        allRequests[index] = {
          ...allRequests[index],
          status: 'rejected_by_system_admin',
          system_admin_processed_by: 'sysadmin-001',
          system_admin_processed_by_name: 'System Admin',
          system_admin_processed_at: new Date().toISOString(),
          system_admin_rejection_reason: reason,
          updated_at: new Date().toISOString(),
        };
        savePurchaseRequests(allRequests);
        setPurchaseRequests(allRequests);
        toast.error(`Request ${actionRequest.request_code} rejected`);
      }
      setActionRequest(null);
    }
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
            <TabsTrigger value="purchases">Purchase Requests ({pendingReviewRequests + readyForProcessing})</TabsTrigger>
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
                  <div className="text-2xl font-bold">₹{(totalValue / 100000).toFixed(1)}L</div>
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
                      <TableHead className="text-right">Total Value</TableHead>
                      <TableHead>Last Audit</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInventory.map((inv) => {
                      const daysSinceAudit = getDaysSinceAudit(inv.last_audit_date);
                      return (
                        <TableRow 
                          key={inv.institution_id}
                          className="cursor-pointer hover:bg-accent/50 transition-colors"
                          onClick={() => navigate(`/system-admin/inventory-management/${inv.institution_id}`)}
                        >
                          <TableCell className="font-medium">{inv.institution_name}</TableCell>
                          <TableCell className="text-right">{inv.total_items}</TableCell>
                          <TableCell className="text-right">
                            <span className={inv.missing_items > 0 ? "text-orange-500 font-semibold" : ""}>
                              {inv.missing_items}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={inv.damaged_items > 0 ? "text-red-500 font-semibold" : ""}>
                              {inv.damaged_items}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ₹{inv.total_value.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div>
                              {inv.last_audit_date !== 'No audit' 
                                ? new Date(inv.last_audit_date).toLocaleDateString()
                                : 'No audit'
                              }
                              {inv.last_audit_date !== 'No audit' && (
                                <div className="text-xs text-muted-foreground">
                                  {daysSinceAudit} days ago
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(inv.status)}</TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/system-admin/inventory-management/${inv.institution_id}`);
                              }}
                            >
                              View Details
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

          {/* Purchase Requests Tab */}
          <TabsContent value="purchases" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-500">{pendingReviewRequests}</div>
                  <p className="text-xs text-muted-foreground">Awaiting your approval</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Forwarded to Institutions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-500">{forwardedToInstitutions}</div>
                  <p className="text-xs text-muted-foreground">Pending institution approval</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Ready for Processing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">{readyForProcessing}</div>
                  <p className="text-xs text-muted-foreground">Institution approved</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-500">{inProgress}</div>
                  <p className="text-xs text-muted-foreground">Being processed</p>
                </CardContent>
              </Card>
            </div>

            {/* Pending System Admin Review Section */}
            {purchaseRequests.filter(r => r.status === 'pending_system_admin').length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  <h3 className="text-lg font-semibold">
                    Pending Your Review ({purchaseRequests.filter(r => r.status === 'pending_system_admin').length})
                  </h3>
                </div>

                {purchaseRequests.filter(r => r.status === 'pending_system_admin').map((request) => (
                  <Card key={request.id}>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{request.request_code}</h3>
                              <PurchaseRequestStatusBadge status={request.status} size="sm" />
                              {request.priority === 'urgent' && (
                                <Badge variant="destructive" className="text-xs">🚨 URGENT</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                              {request.officer_name} • {request.institution_name}
                            </p>
                            
                            <div className="space-y-2 mt-3">
                              <p className="text-sm font-medium">Items Requested:</p>
                              <div className="flex flex-wrap gap-2">
                                {request.items.map((item, idx) => (
                                  <Badge key={idx} variant="outline">
                                    {item.item_name} ({item.quantity} {item.unit})
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div className="mt-3 p-3 bg-muted rounded-lg">
                              <p className="text-sm font-medium mb-1">Justification:</p>
                              <p className="text-sm text-muted-foreground">{request.justification}</p>
                            </div>

                            <p className="text-xs text-muted-foreground mt-3">
                              Requested {format(new Date(request.created_at), 'MMM dd, yyyy • hh:mm a')}
                            </p>
                          </div>

                          <div className="text-right ml-4">
                            <p className="text-sm text-muted-foreground mb-1">Total Cost</p>
                            <p className="text-2xl font-bold">₹{request.total_estimated_cost.toLocaleString()}</p>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2 border-t">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewDetails(request)}
                          >
                            View Details
                          </Button>
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => handleApproveRequest(request)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve & Forward
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleRejectInitialRequest(request)}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Approved by Institution - Ready for Processing */}
            {purchaseRequests.filter(r => r.status === 'approved_by_institution').length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <h3 className="text-lg font-semibold">
                    Ready for Processing ({purchaseRequests.filter(r => r.status === 'approved_by_institution').length})
                  </h3>
                </div>

                {purchaseRequests.filter(r => r.status === 'approved_by_institution').map((request) => (
                  <Card key={request.id}>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{request.request_code}</h3>
                              <PurchaseRequestStatusBadge status={request.status} size="sm" />
                              <Badge variant="default" className="text-xs bg-green-500">✓ Institution Approved</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {request.officer_name} • {request.institution_name}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {request.items.map((item, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {item.item_name} ({item.quantity})
                                </Badge>
                              ))}
                            </div>
                            {request.institution_comments && (
                              <div className="mt-2 p-2 bg-green-50 dark:bg-green-950 rounded text-sm">
                                <span className="font-medium">Institution Comment: </span>
                                {request.institution_comments}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold">₹{request.total_estimated_cost.toLocaleString()}</p>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2 border-t">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewDetails(request)}
                          >
                            View Details
                          </Button>
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => handleMarkInProgress(request)}
                          >
                            <Clock className="h-4 w-4 mr-1" />
                            Mark In Progress
                          </Button>
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={() => handleMarkFulfilled(request)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Mark Fulfilled
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* In Progress */}
            {purchaseRequests.filter(r => r.status === 'in_progress').length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-purple-500" />
                  <h3 className="text-lg font-semibold">
                    In Progress ({purchaseRequests.filter(r => r.status === 'in_progress').length})
                  </h3>
                </div>

                {purchaseRequests.filter(r => r.status === 'in_progress').map((request) => (
                  <Card key={request.id} className="cursor-pointer hover:bg-accent/50" onClick={() => handleViewDetails(request)}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{request.request_code}</h3>
                            <PurchaseRequestStatusBadge status={request.status} size="sm" />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {request.officer_name} • {request.institution_name}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {request.items.map((item, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {item.item_name} ({item.quantity})
                              </Badge>
                            ))}
                          </div>
                          {request.system_admin_processing_comments && (
                            <p className="text-xs text-muted-foreground mt-2">
                              {request.system_admin_processing_comments}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold">₹{request.total_estimated_cost.toLocaleString()}</p>
                          <Button 
                            size="sm" 
                            variant="default"
                            className="mt-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkFulfilled(request);
                            }}
                          >
                            Mark Fulfilled
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Request History */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Request History</h3>
              <div className="flex gap-4 mb-4">
                <Select value={requestStatusFilter} onValueChange={setRequestStatusFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Requests</SelectItem>
                    <SelectItem value="pending_system_admin">Pending Review</SelectItem>
                    <SelectItem value="pending_institution_approval">Pending Institution</SelectItem>
                    <SelectItem value="approved_by_institution">Approved</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="fulfilled">Fulfilled</SelectItem>
                    <SelectItem value="rejected_by_system_admin">Rejected by Admin</SelectItem>
                    <SelectItem value="rejected_by_institution">Rejected by Institution</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4">
                {filteredRequests.map((request) => (
                  <Card key={request.id} className="cursor-pointer hover:bg-accent/50" onClick={() => handleViewDetails(request)}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{request.request_code}</h3>
                            <PurchaseRequestStatusBadge status={request.status} size="sm" />
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {request.officer_name} • {request.institution_name} • ₹{request.total_estimated_cost.toLocaleString()}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">View Details</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <PurchaseRequestDetailDialog
        isOpen={!!selectedRequest}
        onOpenChange={(open) => !open && setSelectedRequest(null)}
        request={selectedRequest}
      />

      <SystemAdminApprovalDialog
        isOpen={approvalDialogOpen}
        onOpenChange={setApprovalDialogOpen}
        mode={approvalMode}
        onApprove={confirmApproval}
        onReject={confirmInitialRejection}
      />

      <ApproveRejectDialog
        isOpen={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        request={actionRequest}
        mode="reject"
        onConfirm={confirmReject}
      />

      <FulfillRequestDialog
        isOpen={fulfillDialogOpen}
        onOpenChange={setFulfillDialogOpen}
        request={actionRequest}
        mode={fulfillMode}
        onConfirm={confirmFulfill}
      />
    </Layout>
  );
}
