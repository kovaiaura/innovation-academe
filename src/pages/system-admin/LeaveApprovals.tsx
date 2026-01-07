import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { leaveApplicationService } from "@/services/leave.service";
import { LeaveApplication, LEAVE_TYPE_LABELS, LEAVE_STATUS_LABELS, LeaveStatus, LeaveType } from "@/types/leave";
import { format, parseISO } from "date-fns";
import { Check, X, Eye, Search, Filter, RefreshCw, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { LOPApprovalDialog } from "@/components/leave/LOPApprovalDialog";
import { ApplicantLeaveBalanceCard } from "@/components/leave/ApplicantLeaveBalanceCard";
import { supabase } from "@/integrations/supabase/client";

export default function LeaveApprovals() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<string>("all");
  const [selectedApplication, setSelectedApplication] = useState<LeaveApplication | null>(null);
  const [actionMode, setActionMode] = useState<"approve" | "reject" | "view" | "lop" | null>(null);
  const [comments, setComments] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [userPositionId, setUserPositionId] = useState<string | null>(null);

  // Fetch user's position ID for filtering
  useEffect(() => {
    const fetchUserPosition = async () => {
      if (!user?.id) return;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('position_id')
        .eq('id', user.id)
        .single();
      
      if (profile?.position_id) {
        setUserPositionId(profile.position_id);
      }
    };
    
    fetchUserPosition();
  }, [user?.id]);

  const { data: applications = [], isLoading, refetch } = useQuery({
    queryKey: ['leave-applications-all'],
    queryFn: () => leaveApplicationService.getAllApplications()
  });

  // Filter applications based on user's position in approval chain
  const filterByApprovalHierarchy = (apps: LeaveApplication[]) => {
    if (!userPositionId && !user?.is_ceo) return apps;
    
    return apps.filter(app => {
      // For pending applications, check if user is the current approver
      if (app.status === 'pending') {
        const currentLevel = app.current_approval_level || 1;
        const currentApprover = app.approval_chain.find(a => a.order === currentLevel);
        
        if (currentApprover) {
          // Check if user's position matches current approver position
          if (currentApprover.position_id === userPositionId) return true;
          
          // CEO can approve if they're in the chain
          if (user?.is_ceo) {
            const ceoInChain = app.approval_chain.some(a => 
              a.position_name?.toLowerCase().includes('ceo') || 
              a.position_name?.toLowerCase().includes('chief executive')
            );
            if (ceoInChain && currentApprover.position_name?.toLowerCase().includes('ceo')) {
              return true;
            }
          }
        }
        return false;
      }
      
      // For history, show all applications where user was involved
      const wasApprover = app.approval_chain.some(a => 
        a.approved_by === user?.id || a.position_id === userPositionId
      );
      return wasApprover || app.final_approved_by === user?.id || app.rejected_by === user?.id;
    });
  };

  const approveMutation = useMutation({
    mutationFn: ({ id, comments }: { id: string; comments?: string }) => 
      leaveApplicationService.approveApplication(id, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-applications-all'] });
      toast.success('Leave application approved');
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => 
      leaveApplicationService.rejectApplication(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-applications-all'] });
      toast.success('Leave application rejected');
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const lopMutation = useMutation({
    mutationFn: async ({ id, lopDays, paidDays, comments }: { id: string; lopDays: number; paidDays: number; comments: string }) => {
      // Update the application with LOP info and approve it
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('Not authenticated');
      
      const { data: profile } = await supabase.from('profiles').select('name').eq('id', authUser.id).single();
      const { data: app } = await supabase.from('leave_applications').select('*').eq('id', id).single();
      
      if (!app) throw new Error('Application not found');
      
      const approvalChain = Array.isArray(app.approval_chain) ? app.approval_chain : [];
      const currentLevel = app.current_approval_level || 1;
      
      const updatedChain = approvalChain.map((a: any) => {
        if (a.order === currentLevel) {
          return { 
            ...a, 
            status: 'approved', 
            approved_by: authUser.id, 
            approved_by_name: profile?.name || 'Unknown', 
            approved_at: new Date().toISOString(), 
            comments: `Approved with LOP: ${lopDays} day(s). ${comments}` 
          };
        }
        return a;
      });
      
      const nextLevel = approvalChain.find((a: any) => a.order === currentLevel + 1);
      const isFinalApproval = !nextLevel;
      
      const updateData: Record<string, unknown> = {
        approval_chain: JSON.parse(JSON.stringify(updatedChain)),
        current_approval_level: isFinalApproval ? currentLevel : currentLevel + 1,
        is_lop: lopDays > 0,
        lop_days: lopDays,
        paid_days: paidDays
      };
      
      if (isFinalApproval) {
        updateData.status = 'approved';
        updateData.final_approved_by = authUser.id;
        updateData.final_approved_by_name = profile?.name;
        updateData.final_approved_at = new Date().toISOString();
      }
      
      const { error } = await supabase.from('leave_applications').update(updateData).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-applications-all'] });
      toast.success('Leave approved with LOP');
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const filteredApplications = filterByApprovalHierarchy(applications).filter(app => {
    const matchesSearch = searchTerm === "" || 
      app.applicant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.institution_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    const matchesType = leaveTypeFilter === "all" || app.leave_type === leaveTypeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const pendingApplications = filteredApplications.filter(app => app.status === "pending");
  const historyApplications = filteredApplications.filter(app => app.status !== "pending");

  const handleApprove = (app: LeaveApplication) => {
    setSelectedApplication(app);
    setActionMode("approve");
    setComments("");
  };

  const handleReject = (app: LeaveApplication) => {
    setSelectedApplication(app);
    setActionMode("reject");
    setRejectionReason("");
  };

  const handleMarkLOP = (app: LeaveApplication) => {
    setSelectedApplication(app);
    setActionMode("lop");
  };

  const handleViewDetails = (app: LeaveApplication) => {
    setSelectedApplication(app);
    setActionMode("view");
  };

  const handleCloseDialog = () => {
    setSelectedApplication(null);
    setActionMode(null);
    setComments("");
    setRejectionReason("");
  };

  const handleConfirmAction = () => {
    if (!selectedApplication) return;

    if (actionMode === "approve") {
      approveMutation.mutate({ id: selectedApplication.id, comments });
    } else if (actionMode === "reject") {
      if (!rejectionReason.trim()) {
        toast.error('Please provide a rejection reason');
        return;
      }
      rejectMutation.mutate({ id: selectedApplication.id, reason: rejectionReason });
    }
  };

  const handleLOPConfirm = (lopDays: number, paidDays: number, comments: string) => {
    if (!selectedApplication) return;
    lopMutation.mutate({ id: selectedApplication.id, lopDays, paidDays, comments });
  };

  const getStatusBadge = (status: LeaveStatus) => {
    const variants: Record<LeaveStatus, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
      cancelled: "outline",
    };
    
    const icons = {
      pending: <Clock className="h-3 w-3 mr-1" />,
      approved: <CheckCircle className="h-3 w-3 mr-1" />,
      rejected: <XCircle className="h-3 w-3 mr-1" />,
      cancelled: <X className="h-3 w-3 mr-1" />,
    };
    
    return (
      <Badge variant={variants[status]} className="flex items-center w-fit">
        {icons[status]}
        {LEAVE_STATUS_LABELS[status]}
      </Badge>
    );
  };

  const stats = {
    pending: pendingApplications.length,
    approved: historyApplications.filter(a => a.status === 'approved').length,
    rejected: historyApplications.filter(a => a.status === 'rejected').length,
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Leave Approvals</h1>
            <p className="text-muted-foreground">
              Review and manage leave applications based on your approval authority
            </p>
          </div>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Pending for Your Action</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Approved by You</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Rejected by You</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or institution..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={leaveTypeFilter} onValueChange={setLeaveTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by leave type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="sick">Sick Leave</SelectItem>
                  <SelectItem value="casual">Casual Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Applications Table */}
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">
              Pending ({pendingApplications.length})
            </TabsTrigger>
            <TabsTrigger value="history">
              History ({historyApplications.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Institution</TableHead>
                      <TableHead>Date Range</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Applied On</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingApplications.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No pending applications for your approval
                        </TableCell>
                      </TableRow>
                    ) : (
                      pendingApplications.map((app) => (
                        <TableRow key={app.id}>
                          <TableCell className="font-medium">{app.applicant_name}</TableCell>
                          <TableCell>{app.institution_name || "-"}</TableCell>
                          <TableCell>
                            {format(parseISO(app.start_date), "PP")} - {format(parseISO(app.end_date), "PP")}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{LEAVE_TYPE_LABELS[app.leave_type]}</Badge>
                          </TableCell>
                          <TableCell>{app.total_days}</TableCell>
                          <TableCell>{format(parseISO(app.applied_at), "PP")}</TableCell>
                          <TableCell>{getStatusBadge(app.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="ghost" onClick={() => handleViewDetails(app)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="default" onClick={() => handleApprove(app)}>
                                <Check className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button size="sm" variant="outline" className="text-amber-600 border-amber-600 hover:bg-amber-50" onClick={() => handleMarkLOP(app)}>
                                <AlertTriangle className="h-4 w-4 mr-1" />
                                LOP
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleReject(app)}>
                                <X className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Institution</TableHead>
                    <TableHead>Date Range</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Paid/LOP</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reviewed By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyApplications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No history found
                      </TableCell>
                    </TableRow>
                  ) : (
                    historyApplications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium">{app.applicant_name}</TableCell>
                        <TableCell>{app.institution_name || "-"}</TableCell>
                        <TableCell>
                          {format(parseISO(app.start_date), "PP")} - {format(parseISO(app.end_date), "PP")}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{LEAVE_TYPE_LABELS[app.leave_type]}</Badge>
                        </TableCell>
                        <TableCell>{app.total_days}</TableCell>
                        <TableCell>
                          <span className="text-green-600">{app.paid_days}</span>
                          {app.lop_days > 0 && (
                            <span className="text-red-600 ml-1">/ {app.lop_days} LOP</span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(app.status)}</TableCell>
                        <TableCell>{app.final_approved_by_name || app.rejected_by_name || "-"}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" onClick={() => handleViewDetails(app)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Approve/Reject/View Dialog */}
      <Dialog open={actionMode !== null && actionMode !== "lop"} onOpenChange={() => handleCloseDialog()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {actionMode === "approve" && "Approve Leave Application"}
              {actionMode === "reject" && "Reject Leave Application"}
              {actionMode === "view" && "Leave Application Details"}
            </DialogTitle>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-sm">Applicant</Label>
                  <p className="font-medium">{selectedApplication.applicant_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm">Position</Label>
                  <p className="font-medium">{selectedApplication.position_name || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm">Leave Type</Label>
                  <p className="font-medium">{LEAVE_TYPE_LABELS[selectedApplication.leave_type]}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm">Total Days</Label>
                  <p className="font-medium">{selectedApplication.total_days}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm">From</Label>
                  <p className="font-medium">{format(parseISO(selectedApplication.start_date), "PPP")}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm">To</Label>
                  <p className="font-medium">{format(parseISO(selectedApplication.end_date), "PPP")}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-muted-foreground text-sm">Reason</Label>
                <p className="font-medium">{selectedApplication.reason}</p>
              </div>

              {/* Applicant Leave Balance Card */}
              <ApplicantLeaveBalanceCard
                applicantId={selectedApplication.applicant_id}
                leaveMonth={parseISO(selectedApplication.start_date).getMonth() + 1}
                leaveYear={parseISO(selectedApplication.start_date).getFullYear()}
                requestedDays={selectedApplication.total_days}
                compact
              />

              {selectedApplication.is_lop && (
                <div className="p-3 bg-yellow-500/10 rounded-lg">
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    ⚠️ This leave includes {selectedApplication.lop_days} LOP (Loss of Pay) days
                  </p>
                </div>
              )}

              {/* Approval Chain */}
              {selectedApplication.approval_chain.length > 0 && (
                <div>
                  <Label className="text-muted-foreground text-sm">Approval Chain</Label>
                  <div className="mt-2 space-y-2">
                    {selectedApplication.approval_chain.map((step, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Badge variant={
                          step.status === 'approved' ? 'default' :
                          step.status === 'rejected' ? 'destructive' :
                          'secondary'
                        }>
                          {step.order}
                        </Badge>
                        <span>{step.position_name || `Level ${step.order}`}</span>
                        {step.approved_by_name && (
                          <span className="text-muted-foreground">({step.approved_by_name})</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {actionMode === "approve" && (
                <div className="space-y-2">
                  <Label>Comments (Optional)</Label>
                  <Textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Add any comments..."
                    rows={3}
                  />
                </div>
              )}

              {actionMode === "reject" && (
                <div className="space-y-2">
                  <Label>Rejection Reason *</Label>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide a reason for rejection..."
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              {actionMode === "view" ? "Close" : "Cancel"}
            </Button>
            {actionMode === "approve" && (
              <Button 
                onClick={handleConfirmAction}
                disabled={approveMutation.isPending}
              >
                <Check className="h-4 w-4 mr-1" />
                Approve
              </Button>
            )}
            {actionMode === "reject" && (
              <Button 
                variant="destructive"
                onClick={handleConfirmAction}
                disabled={rejectMutation.isPending}
              >
                <X className="h-4 w-4 mr-1" />
                Reject
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* LOP Dialog */}
      <LOPApprovalDialog
        open={actionMode === "lop"}
        onOpenChange={(open) => !open && handleCloseDialog()}
        application={selectedApplication}
        onConfirm={handleLOPConfirm}
        isPending={lopMutation.isPending}
      />
    </Layout>
  );
}
