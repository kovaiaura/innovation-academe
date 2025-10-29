import { useState } from 'react';
import { Layout } from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, ShoppingCart, FileText, AlertTriangle, CheckCircle } from "lucide-react";
import { InstitutionHeader } from "@/components/management/InstitutionHeader";
import { PurchaseRequestStatusBadge } from "@/components/inventory/PurchaseRequestStatusBadge";
import { PurchaseRequestDetailDialog } from "@/components/inventory/PurchaseRequestDetailDialog";
import { ApproveRejectDialog } from "@/components/inventory/ApproveRejectDialog";
import { getPurchaseRequestsByInstitution, updateMockPurchaseRequest, mockInventoryItems } from "@/data/mockInventoryData";
import { PurchaseRequest, InventoryItem } from "@/types/inventory";
import { format } from "date-fns";
import { toast } from "sonner";

// Stock Overview Tab Component - Read-only view of Officer's inventory
const StockOverviewTab = () => {
  // Pull inventory data from shared source (Officer's data)
  const inventory: InventoryItem[] = mockInventoryItems['springfield'] || [];

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

      {inventory.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No inventory items found</p>
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

const PurchaseRequestsTab = () => {
  const [requests, setRequests] = useState<PurchaseRequest[]>(getPurchaseRequestsByInstitution('springfield'));
  const [selectedRequest, setSelectedRequest] = useState<PurchaseRequest | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [actionRequest, setActionRequest] = useState<PurchaseRequest | null>(null);

  const pendingRequests = requests.filter(r => r.status === 'pending_institution_approval');
  const approvedRequests = requests.filter(r => r.status === 'approved_by_institution' || r.status === 'in_progress');

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
      updateMockPurchaseRequest(actionRequest.id, {
        status: 'approved_by_institution',
        institution_approved_by: 'mgmt-001',
        institution_approved_by_name: 'Dr. Sarah Williams',
        institution_approved_at: new Date().toISOString(),
        institution_comments: comments,
      });
      setRequests(getPurchaseRequestsByInstitution('springfield'));
      toast.success(`Request ${actionRequest.request_code} approved successfully`);
      setActionRequest(null);
    }
  };

  const confirmReject = (reason: string) => {
    if (actionRequest) {
      updateMockPurchaseRequest(actionRequest.id, {
        status: 'rejected_by_institution',
        institution_rejection_reason: reason,
      });
      setRequests(getPurchaseRequestsByInstitution('springfield'));
      toast.error(`Request ${actionRequest.request_code} rejected`);
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
                        onClick={() => setSelectedRequest(request)}
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
              <h3 className="text-lg font-semibold">Approved - Awaiting System Admin ({approvedRequests.length})</h3>
            </div>

            {approvedRequests.map((request) => (
              <Card key={request.id} className="cursor-pointer hover:bg-accent/50" onClick={() => setSelectedRequest(request)}>
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
                      <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                        <p>Approved by: {request.institution_approved_by_name}</p>
                        <p>Approved on: {request.institution_approved_at && format(new Date(request.institution_approved_at), 'MMM dd, yyyy')}</p>
                      </div>
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

        {/* All Other Requests */}
        {requests.filter(r => !['pending_institution_approval', 'approved_by_institution', 'in_progress'].includes(r.status)).length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Request History</h3>
            
            {requests.filter(r => !['pending_institution_approval', 'approved_by_institution', 'in_progress'].includes(r.status)).map((request) => (
              <Card key={request.id} className="cursor-pointer hover:bg-accent/50" onClick={() => setSelectedRequest(request)}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{request.request_code}</h3>
                        <PurchaseRequestStatusBadge status={request.status} size="sm" />
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{request.officer_name} • ₹{request.total_estimated_cost.toLocaleString()}</p>
                    </div>
                    <Button variant="outline" size="sm">View Details</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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

const AuditReportsTab = () => {
  const auditReports = [
    {
      id: "1",
      month: "January 2024",
      totalItems: 156,
      itemsAdded: 23,
      itemsUsed: 45,
      discrepancies: 2,
      generatedDate: "2024-02-01",
      status: "completed",
    },
    {
      id: "2",
      month: "December 2023",
      totalItems: 178,
      itemsAdded: 15,
      itemsUsed: 37,
      discrepancies: 0,
      generatedDate: "2024-01-01",
      status: "completed",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Audit Reports</h2>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          Generate New Report
        </Button>
      </div>

      <div className="grid gap-4">
        {auditReports.map((report) => (
          <Card key={report.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{report.month}</CardTitle>
                <Badge variant="default">{report.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Items</p>
                  <p className="text-2xl font-bold">{report.totalItems}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Items Added</p>
                  <p className="text-2xl font-bold text-green-500">+{report.itemsAdded}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Items Used</p>
                  <p className="text-2xl font-bold text-blue-500">-{report.itemsUsed}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Discrepancies</p>
                  <p className={`text-2xl font-bold ${report.discrepancies > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {report.discrepancies}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">Generated on {report.generatedDate}</p>
                <Button variant="outline" size="sm">
                  Download Report
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const InventoryAndPurchase = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <InstitutionHeader />
        
        <div>
          <h1 className="text-3xl font-bold">Inventory & Purchase</h1>
          <p className="text-muted-foreground">Manage lab inventory and approve purchase requisitions</p>
        </div>

        <Tabs defaultValue="purchase" className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="stock">Stock Overview</TabsTrigger>
            <TabsTrigger value="purchase">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Purchase Requests
            </TabsTrigger>
            <TabsTrigger value="audit">Audit Reports</TabsTrigger>
          </TabsList>
          <TabsContent value="stock" className="mt-6">
            <StockOverviewTab />
          </TabsContent>
          <TabsContent value="purchase" className="mt-6">
            <PurchaseRequestsTab />
          </TabsContent>
          <TabsContent value="audit" className="mt-6">
            <AuditReportsTab />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default InventoryAndPurchase;
