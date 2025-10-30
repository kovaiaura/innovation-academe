import { useState, useEffect } from 'react';
import { format, differenceInCalendarDays, isWeekend, addDays } from 'date-fns';
import { CalendarCheck, Clock, TrendingUp, FileText, AlertCircle, Eye, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { toast } from 'sonner';
import {
  getLeaveApplicationsByOfficer,
  getLeaveBalance,
  addLeaveApplication,
  getApprovedLeaveDates,
  cancelLeaveApplication,
} from '@/data/mockLeaveData';
import { LeaveApprovalTimeline } from '@/components/officer/LeaveApprovalTimeline';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { LeaveApplication, LeaveBalance, LeaveType } from '@/types/attendance';
import type { DateRange } from 'react-day-picker';
import { useNotifications } from '@/hooks/useNotifications';

export default function LeaveManagement() {
  const { user } = useAuth();
  const { notifications, markAsRead } = useNotifications(user?.id || '', 'officer');
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null);
  const [leaveApplications, setLeaveApplications] = useState<LeaveApplication[]>([]);
  const [approvedLeaveDates, setApprovedLeaveDates] = useState<string[]>([]);
  
  // Form state
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [leaveType, setLeaveType] = useState<LeaveType | ''>('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  
  // Tab state
  const [activeTab, setActiveTab] = useState('apply');
  
  // Details dialog state
  const [selectedApplication, setSelectedApplication] = useState<LeaveApplication | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    if (user?.id) {
      const currentYear = new Date().getFullYear().toString();
      const balance = getLeaveBalance(user.id, currentYear);
      const applications = getLeaveApplicationsByOfficer(user.id);
      const approvedDates = getApprovedLeaveDates(user.id);
      
      setLeaveBalance(balance);
      setLeaveApplications(applications);
      setApprovedLeaveDates(approvedDates);
      
      // Mark leave-related notifications as read when visiting this page
      notifications
        .filter(n => !n.read && (n.type === 'leave_application_approved' || n.type === 'leave_application_rejected'))
        .forEach(n => markAsRead(n.id));
    }
  }, [user]);

  const calculateWorkingDays = (from: Date | undefined, to: Date | undefined): number => {
    if (!from || !to) return 0;

    let workingDays = 0;
    let currentDate = new Date(from);
    const endDate = new Date(to);

    while (currentDate <= endDate) {
      if (!isWeekend(currentDate)) {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        if (!approvedLeaveDates.includes(dateStr)) {
          workingDays++;
        }
      }
      currentDate = addDays(currentDate, 1);
    }

    return workingDays;
  };

  const workingDays = calculateWorkingDays(dateRange?.from, dateRange?.to);

  const getRemainingBalance = (): number => {
    if (!leaveBalance || !leaveType) return 0;
    
    switch (leaveType) {
      case 'sick':
        return leaveBalance.sick_leave;
      case 'casual':
        return leaveBalance.casual_leave;
      case 'earned':
        return leaveBalance.earned_leave;
      default:
        return 0;
    }
  };

  const handleSubmit = () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast.error('Please select a date range');
      return;
    }

    if (!leaveType) {
      toast.error('Please select leave type');
      return;
    }

    if (reason.trim().length < 10) {
      toast.error('Please provide a detailed reason (minimum 10 characters)');
      return;
    }

    const remainingBalance = getRemainingBalance();
    if (workingDays > remainingBalance) {
      toast.error(`Insufficient leave balance. Available: ${remainingBalance} days, Required: ${workingDays} days`);
      return;
    }

    // Check for overlapping dates
    const selectedDates: string[] = [];
    let currentDate = new Date(dateRange.from);
    const endDate = new Date(dateRange.to);

    while (currentDate <= endDate) {
      if (!isWeekend(currentDate)) {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        if (approvedLeaveDates.includes(dateStr)) {
          toast.error('Selected dates overlap with approved leave');
          return;
        }
        selectedDates.push(dateStr);
      }
      currentDate = addDays(currentDate, 1);
    }

    setIsSubmitting(true);

    const newApplication: LeaveApplication = {
      id: `leave-${Date.now()}`,
      officer_id: user?.id || '',
      officer_name: user?.name || '',
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
      
      // Refresh data
      const applications = getLeaveApplicationsByOfficer(user?.id || '');
      setLeaveApplications(applications);

      // Clear form
      setDateRange(undefined);
      setLeaveType('');
      setReason('');

      toast.success('Leave application submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit leave application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetails = (application: LeaveApplication) => {
    setSelectedApplication(application);
    setDetailsOpen(true);
  };

  const handleCancelApplication = (id: string) => {
    if (user?.id) {
      try {
        cancelLeaveApplication(id, user.id);
        const applications = getLeaveApplicationsByOfficer(user.id);
        setLeaveApplications(applications);
        toast.success('Leave application cancelled successfully');
        setDetailsOpen(false);
      } catch (error) {
        toast.error('Failed to cancel leave application');
      }
    }
  };

  const filteredApplications = leaveApplications.filter((app) => {
    if (statusFilter === 'all') return true;
    return app.status === statusFilter;
  });

  const disabledDates = (date: Date) => {
    // Disable past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;

    // Disable already approved leave dates
    const dateStr = format(date, 'yyyy-MM-dd');
    return approvedLeaveDates.includes(dateStr);
  };

  const modifiers = {
    approved: approvedLeaveDates.map((dateStr) => new Date(dateStr)),
  };

  const modifiersStyles = {
    approved: {
      backgroundColor: 'hsl(var(--primary) / 0.1)',
      color: 'hsl(var(--primary))',
    },
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Leave Management</h1>
          <p className="text-muted-foreground">Apply for leave and manage your leave applications</p>
        </div>

        {/* Leave Balance Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sick Leave</CardTitle>
              <div className="bg-red-500/10 p-2 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leaveBalance?.sick_leave || 0}</div>
              <p className="text-xs text-muted-foreground">Days available</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Casual Leave</CardTitle>
              <div className="bg-blue-500/10 p-2 rounded-lg">
                <Clock className="h-4 w-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leaveBalance?.casual_leave || 0}</div>
              <p className="text-xs text-muted-foreground">Days available</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Earned Leave</CardTitle>
              <div className="bg-green-500/10 p-2 rounded-lg">
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leaveBalance?.earned_leave || 0}</div>
              <p className="text-xs text-muted-foreground">Days available</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="apply" className="gap-2">
              <CalendarCheck className="h-4 w-4" />
              Apply Leave
            </TabsTrigger>
            <TabsTrigger value="tracking" className="gap-2">
              <Clock className="h-4 w-4" />
              Approval Tracking
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <FileText className="h-4 w-4" />
              Leave History
            </TabsTrigger>
          </TabsList>

          {/* Apply Leave Tab */}
          <TabsContent value="apply" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Apply for Leave</CardTitle>
                <CardDescription>Select date range and provide leave details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Calendar */}
                <div className="space-y-2">
                  <Label>Select Date Range</Label>
                  <div className="flex justify-center border rounded-lg p-4">
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange}
                      disabled={disabledDates}
                      modifiers={modifiers}
                      modifiersStyles={modifiersStyles}
                      numberOfMonths={2}
                      className="pointer-events-auto"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    * Dates with light blue background are already approved leaves
                  </p>
                </div>

                {/* Leave Type */}
                <div className="space-y-2">
                  <Label>Leave Type</Label>
                  <Select value={leaveType} onValueChange={(value) => setLeaveType(value as LeaveType)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sick">Sick Leave</SelectItem>
                      <SelectItem value="casual">Casual Leave</SelectItem>
                      <SelectItem value="earned">Earned Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Reason */}
                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Textarea
                    placeholder="Provide a detailed reason for your leave application (minimum 10 characters)..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">{reason.length} characters</p>
                </div>

                {/* Summary */}
                {dateRange?.from && dateRange?.to && leaveType && (
                  <div className="p-4 bg-muted rounded-lg space-y-2">
                    <p className="font-medium">Leave Summary</p>
                    <div className="text-sm space-y-1">
                      <p>
                        <span className="text-muted-foreground">Date Range:</span>{' '}
                        {format(dateRange.from, 'MMM dd, yyyy')} - {format(dateRange.to, 'MMM dd, yyyy')}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Working Days:</span> {workingDays} days
                      </p>
                      <p>
                        <span className="text-muted-foreground">Leave Type:</span>{' '}
                        <span className="capitalize">{leaveType} Leave</span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Balance After:</span>{' '}
                        {getRemainingBalance() - workingDays} days remaining
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDateRange(undefined);
                      setLeaveType('');
                      setReason('');
                    }}
                  >
                    Clear
                  </Button>
                  <Button onClick={handleSubmit} disabled={isSubmitting || !dateRange?.from || !dateRange?.to}>
                    {isSubmitting ? 'Submitting...' : 'Submit Leave Application'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Approval Tracking Tab */}
          <TabsContent value="tracking" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Approval Tracking</CardTitle>
                <CardDescription>Track the status of your leave applications</CardDescription>
              </CardHeader>
              <CardContent>
                {leaveApplications.length === 0 ? (
                  <div className="text-center py-12 max-w-md mx-auto">
                    <div className="bg-muted/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CalendarCheck className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No Leave Applications Yet</h3>
                    <p className="text-muted-foreground mb-6">
                      You haven't submitted any leave applications. Once you apply for leave, you'll be able to track the approval status here.
                    </p>
                    <Button onClick={() => setActiveTab('apply')}>
                      <CalendarCheck className="h-4 w-4 mr-2" />
                      Apply for Leave
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {leaveApplications.map((application) => (
                      <Card key={application.id} className="overflow-hidden">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-base">
                                {format(new Date(application.start_date), 'PPP')} -{' '}
                                {format(new Date(application.end_date), 'PPP')}
                              </CardTitle>
                              <CardDescription className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="capitalize">
                                  {application.leave_type} Leave
                                </Badge>
                                <span>• {application.total_days} days</span>
                              </CardDescription>
                            </div>
                            <Badge
                              variant={
                                application.status === 'approved'
                                  ? 'default'
                                  : application.status === 'pending'
                                  ? 'secondary'
                                  : 'destructive'
                              }
                              className="capitalize"
                            >
                              {application.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <LeaveApprovalTimeline application={application} />
                          <div className="mt-4 flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(application)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                            {application.status === 'pending' && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleCancelApplication(application.id)}
                              >
                                <X className="h-4 w-4 mr-2" />
                                Cancel Application
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leave History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Leave History</CardTitle>
                    <CardDescription>View all your leave applications</CardDescription>
                  </div>
                  <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {filteredApplications.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No leave applications found</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date Range</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Days</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Applied On</TableHead>
                          <TableHead>Reason</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredApplications.map((application) => (
                          <TableRow key={application.id}>
                            <TableCell>
                              <div className="font-medium">
                                {application.start_date === application.end_date
                                  ? format(new Date(application.start_date), 'MMM dd, yyyy')
                                  : `${format(new Date(application.start_date), 'MMM dd')} - ${format(
                                      new Date(application.end_date),
                                      'MMM dd, yyyy'
                                    )}`}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {application.leave_type}
                              </Badge>
                            </TableCell>
                            <TableCell>{application.total_days}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  application.status === 'approved'
                                    ? 'default'
                                    : application.status === 'pending'
                                    ? 'secondary'
                                    : 'destructive'
                                }
                                className="capitalize"
                              >
                                {application.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {format(new Date(application.applied_at), 'MMM dd, yyyy')}
                            </TableCell>
                            <TableCell className="max-w-xs truncate">{application.reason}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Leave Application Details</DialogTitle>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Leave Type</p>
                  <Badge variant="outline" className="capitalize mt-1">
                    {selectedApplication.leave_type} Leave
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Days</p>
                  <p className="font-medium mt-1">{selectedApplication.total_days} days</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Date Range</p>
                  <p className="font-medium mt-1">
                    {format(new Date(selectedApplication.start_date), 'PPP')} -{' '}
                    {format(new Date(selectedApplication.end_date), 'PPP')}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Reason</p>
                  <p className="mt-1">{selectedApplication.reason}</p>
                </div>
                {selectedApplication.rejection_reason && (
                  <div className="col-span-2 p-3 bg-destructive/10 rounded-lg">
                    <p className="text-sm text-muted-foreground">Rejection Reason</p>
                    <p className="mt-1 text-destructive">{selectedApplication.rejection_reason}</p>
                  </div>
                )}
                {selectedApplication.admin_comments && (
                  <div className="col-span-2 p-3 bg-primary/10 rounded-lg">
                    <p className="text-sm text-muted-foreground">Admin Comments</p>
                    <p className="mt-1">{selectedApplication.admin_comments}</p>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-semibold mb-4">Approval Timeline</h4>
                <LeaveApprovalTimeline application={selectedApplication} />
              </div>

              {selectedApplication.status === 'pending' && (
                <div className="flex justify-end gap-2">
                  <Button
                    variant="destructive"
                    onClick={() => handleCancelApplication(selectedApplication.id)}
                  >
                    Cancel Application
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
