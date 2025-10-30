import { useState, useEffect } from "react";
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
import { LeaveApplication } from "@/types/attendance";
import {
  getAllLeaveApplications,
  approveLeaveApplication,
  rejectLeaveApplication,
} from "@/data/mockLeaveData";
import { format } from "date-fns";
import { Check, X, Eye, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { LeaveActionDialog } from "@/components/system-admin/LeaveActionDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LeaveApprovalTimeline } from "@/components/officer/LeaveApprovalTimeline";
import { useNotifications } from "@/hooks/useNotifications";

export default function LeaveApprovals() {
  const { user } = useAuth();
  const { notifications, markAsRead } = useNotifications(user?.id || 'system_admin_001', 'system_admin');
  const [applications, setApplications] = useState<LeaveApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<LeaveApplication[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<string>("all");
  const [selectedApplication, setSelectedApplication] = useState<LeaveApplication | null>(null);
  const [actionMode, setActionMode] = useState<"approve" | "reject" | null>(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);

  useEffect(() => {
    loadApplications();
    
    // Mark leave-related notifications as read when visiting this page
    notifications
      .filter(n => !n.read && n.type === 'leave_application_submitted')
      .forEach(n => markAsRead(n.id));
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, statusFilter, leaveTypeFilter]);

  const loadApplications = () => {
    const allApps = getAllLeaveApplications();
    setApplications(allApps);
  };

  const filterApplications = () => {
    let filtered = [...applications];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (app) =>
          app.officer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.institution_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    // Filter by leave type
    if (leaveTypeFilter !== "all") {
      filtered = filtered.filter((app) => app.leave_type === leaveTypeFilter);
    }

    setFilteredApplications(filtered);
  };

  const handleApprove = (application: LeaveApplication) => {
    setSelectedApplication(application);
    setActionMode("approve");
  };

  const handleReject = (application: LeaveApplication) => {
    setSelectedApplication(application);
    setActionMode("reject");
  };

  const handleViewDetails = (application: LeaveApplication) => {
    setSelectedApplication(application);
    setViewDetailsOpen(true);
  };

  const handleConfirmAction = (comments?: string, rejectionReason?: string) => {
    if (!selectedApplication || !user) return;

    try {
      if (actionMode === "approve") {
        approveLeaveApplication(selectedApplication.id, user.name, comments);
        toast.success("Leave application approved successfully");
      } else if (actionMode === "reject") {
        rejectLeaveApplication(selectedApplication.id, user.name, rejectionReason!);
        toast.success("Leave application rejected");
      }

      loadApplications();
      setActionMode(null);
      setSelectedApplication(null);
    } catch (error) {
      toast.error("Failed to process leave application");
    }
  };

  const pendingApplications = applications.filter((app) => app.status === "pending");
  const historyApplications = applications.filter((app) => app.status !== "pending");

  const leaveTypeLabels = {
    sick: "Sick Leave",
    casual: "Casual Leave",
    earned: "Earned Leave",
  };

  const getStatusBadge = (status: LeaveApplication["status"]) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
      cancelled: "outline",
    };
    
    return (
      <Badge variant={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Leave Approvals</h1>
          <p className="text-muted-foreground">
            Review and manage leave applications from officers
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {pendingApplications.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Approved This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {historyApplications.filter((app) => app.status === "approved").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Rejected This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {historyApplications.filter((app) => app.status === "rejected").length}
              </div>
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
                  placeholder="Search by officer or institution..."
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
                  <SelectItem value="earned">Earned Leave</SelectItem>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Officer</TableHead>
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
                  {filteredApplications.filter((app) => app.status === "pending").length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No pending applications found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredApplications
                      .filter((app) => app.status === "pending")
                      .map((app) => (
                        <TableRow key={app.id}>
                          <TableCell className="font-medium">{app.officer_name}</TableCell>
                          <TableCell>{app.institution_name || "N/A"}</TableCell>
                          <TableCell>
                            {format(new Date(app.start_date), "PP")} - {format(new Date(app.end_date), "PP")}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{leaveTypeLabels[app.leave_type]}</Badge>
                          </TableCell>
                          <TableCell>{app.total_days}</TableCell>
                          <TableCell>{format(new Date(app.applied_at), "PP")}</TableCell>
                          <TableCell>{getStatusBadge(app.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleViewDetails(app)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleApprove(app)}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReject(app)}
                              >
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
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Officer</TableHead>
                    <TableHead>Institution</TableHead>
                    <TableHead>Date Range</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Applied On</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reviewed By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.filter((app) => app.status !== "pending").length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No history found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredApplications
                      .filter((app) => app.status !== "pending")
                      .map((app) => (
                        <TableRow key={app.id}>
                          <TableCell className="font-medium">{app.officer_name}</TableCell>
                          <TableCell>{app.institution_name || "N/A"}</TableCell>
                          <TableCell>
                            {format(new Date(app.start_date), "PP")} - {format(new Date(app.end_date), "PP")}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{leaveTypeLabels[app.leave_type]}</Badge>
                          </TableCell>
                          <TableCell>{app.total_days}</TableCell>
                          <TableCell>{format(new Date(app.applied_at), "PP")}</TableCell>
                          <TableCell>{getStatusBadge(app.status)}</TableCell>
                          <TableCell>{app.reviewed_by || "N/A"}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewDetails(app)}
                            >
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

      {/* Action Dialog */}
      <LeaveActionDialog
        application={selectedApplication}
        mode={actionMode}
        open={!!actionMode}
        onOpenChange={(open) => {
          if (!open) {
            setActionMode(null);
            setSelectedApplication(null);
          }
        }}
        onConfirm={handleConfirmAction}
      />

      {/* View Details Dialog */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Leave Application Details</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Officer</p>
                  <p className="font-medium">{selectedApplication.officer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Institution</p>
                  <p className="font-medium">{selectedApplication.institution_name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Leave Type</p>
                  <Badge variant="outline">{leaveTypeLabels[selectedApplication.leave_type]}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Days</p>
                  <p className="font-medium">{selectedApplication.total_days} days</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Date Range</p>
                  <p className="font-medium">
                    {format(new Date(selectedApplication.start_date), "PPP")} - {format(new Date(selectedApplication.end_date), "PPP")}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Reason</p>
                  <p className="mt-1">{selectedApplication.reason}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Approval Timeline</h4>
                <LeaveApprovalTimeline application={selectedApplication} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
