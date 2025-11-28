import { useState, useEffect } from 'react';
import { Layout } from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, ShoppingCart, FileText, AlertTriangle, CheckCircle, Download } from "lucide-react";
import { InstitutionHeader } from "@/components/management/InstitutionHeader";
import { getInstitutionBySlug } from "@/data/mockInstitutionData";
import { useLocation } from "react-router-dom";
import { PurchaseRequestStatusBadge } from "@/components/inventory/PurchaseRequestStatusBadge";
import { PurchaseRequestDetailDialog } from "@/components/inventory/PurchaseRequestDetailDialog";
import { ApproveRejectDialog } from "@/components/inventory/ApproveRejectDialog";
import { 
  loadInventoryItems, 
  loadPurchaseRequests, 
  savePurchaseRequests,
  loadAuditRecords,
  getPurchaseRequestsByInstitution,
  getInventoryByInstitution,
  getAuditRecordsByInstitution,
} from "@/data/mockInventoryData";
import { PurchaseRequest, InventoryItem, AuditRecord } from "@/types/inventory";
import { format } from "date-fns";
import { toast } from "sonner";

// Stock Overview Tab Component - Read-only view of Officer's inventory
interface StockOverviewTabProps {
  institutionId: string;
}

const StockOverviewTab = ({ institutionId }: StockOverviewTabProps) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  useEffect(() => {
    // Load inventory for this institution
    setInventory(getInventoryByInstitution(institutionId));
  }, [institutionId]);

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-500/10 text-green-500',
      under_maintenance: 'bg-yellow-500/10 text-yellow-500',
      damaged: 'bg-red-500/10 text-red-500',
      retired: 'bg-gray-500/10 text-gray-500',
    };
    return variants[status as keyof typeof variants] || variants.active;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      active: 'Active',
      under_maintenance: 'Under Maintenance',
      damaged: 'Damaged',
      retired: 'Retired',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const totalValue = inventory.reduce((sum, item) => sum + item.total_value, 0);
  const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Stock Overview</h3>
          <p className="text-sm text-muted-foreground">View lab inventory managed by Innovation Officers</p>
        </div>
        <Button variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {inventory.filter(i => i.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {inventory.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No inventory items found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Innovation Officers will add equipment from their dashboard
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Last Audited</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="capitalize">{item.category}</TableCell>
                  <TableCell>{item.quantity} {item.unit}</TableCell>
                  <TableCell>{item.location}</TableCell>
                  <TableCell className="capitalize">{item.condition}</TableCell>
                  <TableCell>
                    {item.last_audited 
                      ? new Date(item.last_audited).toLocaleDateString()
                      : 'N/A'
                    }
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(item.status)}>
                      {getStatusLabel(item.status)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

interface PurchaseRequestsTabProps {
  institutionId: string;
}

const PurchaseRequestsTab = ({ institutionId }: PurchaseRequestsTabProps) => {
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<PurchaseRequest | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [actionRequest, setActionRequest] = useState<PurchaseRequest | null>(null);

  // Function to load fresh data
  const refreshRequests = () => {
    setRequests(getPurchaseRequestsByInstitution(institutionId));
  };

  useEffect(() => {
    // Load purchase requests for this institution
    refreshRequests();
  }, [institutionId]);

  // Helper to view details with fresh data
  const handleViewDetails = (request: PurchaseRequest) => {
    // Get fresh data from localStorage
    const allRequests = loadPurchaseRequests();
    const freshRequest = allRequests.find(r => r.id === request.id);
    setSelectedRequest(freshRequest || request);
  };

  const pendingRequests = requests.filter(r => 
    r.status === 'pending_institution_approval' || 
    r.status === 'approved_by_system_admin'
  );
  const approvedRequests = requests.filter(r => 
    r.status === 'approved_by_institution' || 
    r.status === 'in_progress' || 
    r.status === 'fulfilled'
  );

  const handleApprove = (request: PurchaseRequest) => {
    setActionRequest(request);
    setApproveDialogOpen(true);
  };

  const handleReject = (request: PurchaseRequest) => {
    setActionRequest(request);
    setRejectDialogOpen(true);
  };

  const confirmApprove = (comments: string) => {
    if (actionRequest) {
      const allRequests = loadPurchaseRequests();
      const index = allRequests.findIndex(r => r.id === actionRequest.id);
      if (index !== -1) {
        allRequests[index] = {
          ...allRequests[index],
          status: 'approved_by_institution',
          institution_approved_by: 'mgmt-001',
          institution_approved_by_name: 'Institution Admin',
          institution_approved_at: new Date().toISOString(),
          institution_comments: comments,
          updated_at: new Date().toISOString(),
        };
        savePurchaseRequests(allRequests);
        setRequests(getPurchaseRequestsByInstitution(institutionId));
        toast.success(`Request ${actionRequest.request_code} approved successfully`);
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
          status: 'rejected_by_institution',
          institution_rejection_reason: reason,
          updated_at: new Date().toISOString(),
        };
        savePurchaseRequests(allRequests);
        setRequests(getPurchaseRequestsByInstitution(institutionId));
        toast.error(`Request ${actionRequest.request_code} rejected`);
      }
      setActionRequest(null);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Purchase Requests</h2>
          <div className="flex gap-2">
            <Badge variant="secondary">{pendingRequests.length} Pending</Badge>
            <Badge variant="default">{approvedRequests.length} Approved</Badge>
          </div>
        </div>

        {/* Pending Approval Section */}
        {pendingRequests.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <h3 className="text-lg font-semibold">Pending Your Approval ({pendingRequests.length})</h3>
            </div>

            {pendingRequests.map((request) => (
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
                          {request.status === 'approved_by_system_admin' && (
                            <Badge variant="default" className="text-xs bg-blue-500">✓ System Admin Approved</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{request.officer_name}</p>
                        
                        <div className="space-y-2">
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
                        onClick={() => handleApprove(request)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleReject(request)}
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

        {/* Approved Requests Section */}
        {approvedRequests.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-semibold">Approved Requests ({approvedRequests.length})</h3>
            </div>

            {approvedRequests.map((request) => (
              <Card key={request.id} className="cursor-pointer hover:bg-accent/50" onClick={() => handleViewDetails(request)}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{request.request_code}</h3>
                        <PurchaseRequestStatusBadge status={request.status} size="sm" />
                      </div>
                      <p className="text-sm text-muted-foreground">{request.officer_name}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {request.items.map((item, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {item.item_name} ({item.quantity})
                          </Badge>
                        ))}
                      </div>
                      {request.institution_approved_at && (
                        <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                          <p>Approved by: {request.institution_approved_by_name}</p>
                          <p>Approved on: {format(new Date(request.institution_approved_at), 'MMM dd, yyyy')}</p>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">₹{request.total_estimated_cost.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No requests message */}
        {requests.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No purchase requests found</p>
              <p className="text-sm text-muted-foreground mt-2">
                Purchase requests from Innovation Officers will appear here
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <PurchaseRequestDetailDialog
        isOpen={!!selectedRequest}
        onOpenChange={(open) => !open && setSelectedRequest(null)}
        request={selectedRequest}
      />

      <ApproveRejectDialog
        isOpen={approveDialogOpen}
        onOpenChange={setApproveDialogOpen}
        request={actionRequest}
        mode="approve"
        onConfirm={confirmApprove}
      />

      <ApproveRejectDialog
        isOpen={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        request={actionRequest}
        mode="reject"
        onConfirm={confirmReject}
      />
    </>
  );
};

interface AuditReportsTabProps {
  institutionId: string;
}

const AuditReportsTab = ({ institutionId }: AuditReportsTabProps) => {
  const [auditRecords, setAuditRecords] = useState<AuditRecord[]>([]);

  useEffect(() => {
    // Load audit records for this institution
    setAuditRecords(getAuditRecordsByInstitution(institutionId));
  }, [institutionId]);

  const getStatusBadge = (status: AuditRecord['status']) => {
    const variants = {
      completed: 'bg-green-500/10 text-green-500',
      in_progress: 'bg-blue-500/10 text-blue-500',
      pending_review: 'bg-yellow-500/10 text-yellow-500',
    };
    return variants[status] || variants.completed;
  };

  const handleDownload = (record: AuditRecord) => {
    // Generate audit report content
    const content = `
AUDIT REPORT
============
Audit ID: ${record.audit_id}
Date: ${record.audit_date}
Audited By: ${record.audited_by}
Status: ${record.status}

SUMMARY
-------
Items Checked: ${record.items_checked}
Discrepancies: ${record.discrepancies}
Missing Items: ${record.missing_items.length > 0 ? record.missing_items.join(', ') : 'None'}
Damaged Items: ${record.damaged_items.length > 0 ? record.damaged_items.join(', ') : 'None'}
Newly Added: ${record.newly_added.length > 0 ? record.newly_added.join(', ') : 'None'}

NOTES
-----
${record.notes}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit_report_${record.audit_date}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
    toast.success('Audit report downloaded');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Audit Reports</h2>
          <p className="text-sm text-muted-foreground">View audit reports created by Innovation Officers</p>
        </div>
      </div>

      {auditRecords.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No audit reports found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Audit reports from Innovation Officers will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {auditRecords.map((record) => (
            <Card key={record.audit_id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      Audit - {format(new Date(record.audit_date), 'MMMM dd, yyyy')}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Audited by: {record.audited_by}
                    </p>
                  </div>
                  <Badge className={getStatusBadge(record.status)}>
                    {record.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Items Checked</p>
                    <p className="text-2xl font-bold">{record.items_checked}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Missing Items</p>
                    <p className={`text-2xl font-bold ${record.missing_items.length > 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {record.missing_items.length}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Damaged Items</p>
                    <p className={`text-2xl font-bold ${record.damaged_items.length > 0 ? 'text-orange-500' : 'text-green-500'}`}>
                      {record.damaged_items.length}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Discrepancies</p>
                    <p className={`text-2xl font-bold ${record.discrepancies > 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {record.discrepancies}
                    </p>
                  </div>
                </div>

                {record.notes && (
                  <div className="bg-muted rounded-lg p-3 mb-4">
                    <p className="text-sm font-medium mb-1">Notes:</p>
                    <p className="text-sm text-muted-foreground">{record.notes}</p>
                  </div>
                )}

                {(record.missing_items.length > 0 || record.damaged_items.length > 0) && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {record.missing_items.map((item, idx) => (
                      <Badge key={`missing-${idx}`} variant="destructive" className="text-xs">
                        Missing: {item}
                      </Badge>
                    ))}
                    {record.damaged_items.map((item, idx) => (
                      <Badge key={`damaged-${idx}`} variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                        Damaged: {item}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-end">
                  <Button variant="outline" size="sm" onClick={() => handleDownload(record)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const InventoryAndPurchase = () => {
  // Extract institution from URL
  const location = useLocation();
  const institutionSlug = location.pathname.split('/')[2];
  const institution = getInstitutionBySlug(institutionSlug);
  
  // Get institution ID from the slug mapping
  const institutionIdMap: Record<string, string> = {
    'modern-school-vasant-vihar': 'inst-msd-001',
    'kikani-global-academy': 'inst-kga-001',
  };
  const institutionId = institutionIdMap[institutionSlug] || institutionSlug;

  return (
    <Layout>
      <div className="space-y-6">
        <InstitutionHeader 
          institutionName={institution?.name}
          location={institution?.location}
        />

        <Tabs defaultValue="stock" className="space-y-6">
          <TabsList>
            <TabsTrigger value="stock">
              <Package className="h-4 w-4 mr-2" />
              Stock Overview
            </TabsTrigger>
            <TabsTrigger value="purchases">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Purchase Requests
            </TabsTrigger>
            <TabsTrigger value="audits">
              <FileText className="h-4 w-4 mr-2" />
              Audit Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stock">
            <StockOverviewTab institutionId={institutionId} />
          </TabsContent>

          <TabsContent value="purchases">
            <PurchaseRequestsTab institutionId={institutionId} />
          </TabsContent>

          <TabsContent value="audits">
            <AuditReportsTab institutionId={institutionId} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default InventoryAndPurchase;
