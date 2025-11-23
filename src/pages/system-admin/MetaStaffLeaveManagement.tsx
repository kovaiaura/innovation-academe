import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CalendarCheck, Clock, CheckCircle, XCircle, Calendar as CalendarIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format, differenceInBusinessDays } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { LeaveApplication, LeaveType } from '@/types/attendance';
import {
  getLeaveApplicationsByOfficer,
  getLeaveBalance,
  addLeaveApplication,
  getApprovedLeaveDates,
  cancelLeaveApplication
} from '@/data/mockLeaveData';
import { LeaveApprovalTimeline } from '@/components/officer/LeaveApprovalTimeline';

export default function MetaStaffLeaveManagement() {
  const { user } = useAuth();
  const [leaveBalance, setLeaveBalance] = useState({ sick_leave: 0, casual_leave: 0, earned_leave: 0 });
  const [applications, setApplications] = useState<LeaveApplication[]>([]);
  const [approvedDates, setApprovedDates] = useState<string[]>([]);
  
  // Apply Leave Form State
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>();
  const [leaveType, setLeaveType] = useState<LeaveType>('casual');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Detail Dialog State
  const [selectedApplication, setSelectedApplication] = useState<LeaveApplication | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Filtering
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    if (user) {
      const balance = getLeaveBalance(user.id, '2025');
      setLeaveBalance(balance);
      
      const apps = getLeaveApplicationsByOfficer(user.id);
      setApplications(apps);
      
      const approved = getApprovedLeaveDates(user.id);
      setApprovedDates(approved);
    }
  }, [user]);

  const calculateWorkingDays = (from: Date, to: Date): number => {
    const daysDiff = differenceInBusinessDays(to, from) + 1;
    
    // Filter out already approved dates
    let workingDays = 0;
    for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
      const dateStr = format(d, 'yyyy-MM-dd');
      if (!approvedDates.includes(dateStr)) {
        workingDays++;
      }
    }
    
    return workingDays;
  };

  const getRemainingBalance = (): number => {
    if (leaveType === 'casual') return leaveBalance.casual_leave;
    if (leaveType === 'sick') return leaveBalance.sick_leave;
    if (leaveType === 'earned') return leaveBalance.earned_leave;
    return 0;
  };

  const handleSubmit = () => {
    if (!dateRange?.from || !dateRange?.to || !user) {
      toast.error('Please select valid dates');
      return;
    }

    if (!reason.trim()) {
      toast.error('Please provide a reason for leave');
      return;
    }

    const workingDays = calculateWorkingDays(dateRange.from, dateRange.to);
    const remainingBalance = getRemainingBalance();

    if (workingDays > remainingBalance) {
      toast.error(`Insufficient leave balance. You only have ${remainingBalance} ${leaveType} days available`);
      return;
    }

    setIsSubmitting(true);

    const newApplication: LeaveApplication = {
      id: `leave-meta-${Date.now()}`,
      officer_id: user.id,
      officer_name: user.name,
      applicant_type: 'meta_staff',
      position: user.position_name,
      approval_stage: 'ceo_pending',
      start_date: format(dateRange.from, 'yyyy-MM-dd'),
      end_date: format(dateRange.to, 'yyyy-MM-dd'),
      leave_type: leaveType,
      reason: reason.trim(),
      total_days: workingDays,
      status: 'pending',
      applied_at: new Date().toISOString(),
    };

    try {
      addLeaveApplication(newApplication);
      setApplications([...applications, newApplication]);
      toast.success('Leave application submitted successfully');
      
      // Reset form
      setDateRange(undefined);
      setReason('');
      setLeaveType('casual');
      setIsApplyDialogOpen(false);
    } catch (error) {
      toast.error('Failed to submit leave application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetails = (application: LeaveApplication) => {
    setSelectedApplication(application);
    setIsDetailDialogOpen(true);
  };

  const handleCancelApplication = (application: LeaveApplication) => {
    if (application.status !== 'pending') {
      toast.error('Only pending applications can be cancelled');
      return;
    }

    cancelLeaveApplication(application.id, user?.id || '');
    setApplications(applications.filter(app => app.id !== application.id));
    toast.success('Leave application cancelled');
  };

  const filteredApplications = applications.filter(app => {
    if (statusFilter === 'all') return true;
    return app.status === statusFilter;
  });

  const disabledDates = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;
    
    const dateStr = format(date, 'yyyy-MM-dd');
    return approvedDates.includes(dateStr);
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Leave Management</h1>
          <p className="text-muted-foreground mt-2">
            Apply for leave and track your applications
          </p>
        </div>

        {/* Leave Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Casual Leave</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{leaveBalance.casual_leave}</div>
              <p className="text-xs text-muted-foreground">Days Available</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Sick Leave</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{leaveBalance.sick_leave}</div>
              <p className="text-xs text-muted-foreground">Days Available</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Earned Leave</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{leaveBalance.earned_leave}</div>
              <p className="text-xs text-muted-foreground">Days Available</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="history" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="history">Leave History</TabsTrigger>
            <TabsTrigger value="apply">Apply Leave</TabsTrigger>
          </TabsList>

          <TabsContent value="apply" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Apply for Leave</CardTitle>
                <CardDescription>
                  Submit a new leave application. Your leave will require CEO approval.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Leave Type *</Label>
                  <Select value={leaveType} onValueChange={(value) => setLeaveType(value as LeaveType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casual">Casual Leave</SelectItem>
                      <SelectItem value="sick">Sick Leave</SelectItem>
                      <SelectItem value="earned">Earned Leave</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">
                    Available: {getRemainingBalance()} days
                  </p>
                </div>

                <div>
                  <Label>Select Dates *</Label>
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    disabled={disabledDates}
                    numberOfMonths={2}
                    className="rounded-md border"
                  />
                  {dateRange?.from && dateRange?.to && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Working Days: {calculateWorkingDays(dateRange.from, dateRange.to)}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Reason for Leave *</Label>
                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Please provide a detailed reason for your leave application"
                    rows={4}
                  />
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={!dateRange?.from || !dateRange?.to || !reason.trim() || isSubmitting}
                  className="w-full"
                >
                  Submit Leave Application
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>My Leave Applications</CardTitle>
                  <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Applications</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredApplications.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No leave applications found
                    </div>
                  ) : (
                    filteredApplications.map((app) => (
                      <div
                        key={app.id}
                        className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant={
                                app.status === 'approved' ? 'default' :
                                app.status === 'rejected' ? 'destructive' : 'secondary'
                              }>
                                {app.status.toUpperCase()}
                              </Badge>
                              <Badge variant="outline" className="capitalize">
                                {app.leave_type}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {app.total_days} {app.total_days === 1 ? 'day' : 'days'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <CalendarIcon className="h-4 w-4" />
                              <span>{format(new Date(app.start_date), 'dd MMM yyyy')} - {format(new Date(app.end_date), 'dd MMM yyyy')}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{app.reason}</p>
                            <p className="text-xs text-muted-foreground">
                              Applied: {format(new Date(app.applied_at), 'dd MMM yyyy, hh:mm a')}
                            </p>
                            {app.approval_stage === 'ceo_pending' && (
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                Awaiting CEO Approval
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(app)}
                            >
                              View Details
                            </Button>
                            {app.status === 'pending' && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleCancelApplication(app)}
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Leave Application Details</DialogTitle>
              <DialogDescription>
                Complete information about your leave application
              </DialogDescription>
            </DialogHeader>
            {selectedApplication && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Leave Type</Label>
                    <p className="font-medium capitalize">{selectedApplication.leave_type}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Duration</Label>
                    <p className="font-medium">{selectedApplication.total_days} days</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Start Date</Label>
                    <p className="font-medium">{format(new Date(selectedApplication.start_date), 'dd MMM yyyy')}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">End Date</Label>
                    <p className="font-medium">{format(new Date(selectedApplication.end_date), 'dd MMM yyyy')}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground">Reason</Label>
                  <p className="mt-1">{selectedApplication.reason}</p>
                </div>

                <div className="border-t pt-4">
                  <Label className="text-muted-foreground mb-2 block">Approval Status</Label>
                  <LeaveApprovalTimeline application={selectedApplication} />
                </div>

                {selectedApplication.rejection_reason && (
                  <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
                    <Label className="text-destructive">Rejection Reason</Label>
                    <p className="mt-1 text-sm">{selectedApplication.rejection_reason}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
