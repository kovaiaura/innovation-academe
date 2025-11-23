import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { LeaveApplication } from '@/types/attendance';
import {
  getLeaveApplicationsByStage,
  approveLeaveApplicationManager,
  rejectLeaveApplicationHierarchical
} from '@/data/mockLeaveData';

export default function ManagerLeaveApprovals() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<LeaveApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<LeaveApplication | null>(null);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [comments, setComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = () => {
    const apps = getLeaveApplicationsByStage('manager_pending');
    setApplications(apps);
  };

  const handleApproveClick = (application: LeaveApplication) => {
    setSelectedApplication(application);
    setComments('');
    setIsApproveDialogOpen(true);
  };

  const handleRejectClick = (application: LeaveApplication) => {
    setSelectedApplication(application);
    setRejectionReason('');
    setIsRejectDialogOpen(true);
  };

  const handleApprove = () => {
    if (!selectedApplication || !user) return;

    setIsProcessing(true);
    try {
      approveLeaveApplicationManager(selectedApplication.id, user.name, comments || undefined);
      toast.success('Leave application approved. Forwarded to AGM for final approval.');
      loadApplications();
      setIsApproveDialogOpen(false);
      setSelectedApplication(null);
    } catch (error) {
      toast.error('Failed to approve leave application');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = () => {
    if (!selectedApplication || !user || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setIsProcessing(true);
    try {
      rejectLeaveApplicationHierarchical(
        selectedApplication.id,
        user.name,
        rejectionReason.trim(),
        'manager'
      );
      toast.success('Leave application rejected');
      loadApplications();
      setIsRejectDialogOpen(false);
      setSelectedApplication(null);
    } catch (error) {
      toast.error('Failed to reject leave application');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manager Leave Approvals</h1>
          <p className="text-muted-foreground mt-2">
            Review and approve Innovation Officer leave applications (First Level Approval)
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pending Leave Applications</CardTitle>
            <CardDescription>
              Applications awaiting your approval. After approval, they will be forwarded to AGM.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {applications.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No pending leave applications</p>
                </div>
              ) : (
                applications.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{app.officer_name}</span>
                          <Badge variant="outline" className="capitalize">
                            {app.leave_type}
                          </Badge>
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            Manager Approval Pending
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {format(new Date(app.start_date), 'dd MMM yyyy')} - {format(new Date(app.end_date), 'dd MMM yyyy')}
                          </span>
                          <span>({app.total_days} {app.total_days === 1 ? 'day' : 'days'})</span>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Reason:</Label>
                          <p className="text-sm mt-1">{app.reason}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Applied: {format(new Date(app.applied_at), 'dd MMM yyyy, hh:mm a')}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleApproveClick(app)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRejectClick(app)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Approve Dialog */}
        <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve Leave Application</DialogTitle>
              <DialogDescription>
                This will forward the application to AGM for final approval.
              </DialogDescription>
            </DialogHeader>
            {selectedApplication && (
              <div className="space-y-4">
                <div>
                  <Label>Officer Name</Label>
                  <p className="font-medium">{selectedApplication.officer_name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Leave Type</Label>
                    <p className="capitalize">{selectedApplication.leave_type}</p>
                  </div>
                  <div>
                    <Label>Duration</Label>
                    <p>{selectedApplication.total_days} days</p>
                  </div>
                </div>
                <div>
                  <Label>Comments (Optional)</Label>
                  <Textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Add any comments for the AGM..."
                    rows={3}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleApprove}
                disabled={isProcessing}
                className="bg-green-600 hover:bg-green-700"
              >
                Approve & Forward to AGM
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Leave Application</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this leave application.
              </DialogDescription>
            </DialogHeader>
            {selectedApplication && (
              <div className="space-y-4">
                <div>
                  <Label>Officer Name</Label>
                  <p className="font-medium">{selectedApplication.officer_name}</p>
                </div>
                <div>
                  <Label>Rejection Reason *</Label>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Explain why this leave application is being rejected..."
                    rows={4}
                    required
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={isProcessing || !rejectionReason.trim()}
              >
                Reject Application
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
