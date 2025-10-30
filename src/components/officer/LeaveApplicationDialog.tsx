import { useState } from "react";
import { format, differenceInDays, isWeekend, eachDayOfInterval } from "date-fns";
import { Calendar, CalendarCheck, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import type { LeaveType, LeaveApplication, LeaveBalance } from "@/types/attendance";
import { addLeaveApplication, getLeaveBalance } from "@/data/mockLeaveData";
import { cn } from "@/lib/utils";

interface LeaveApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  officerId: string;
  officerName: string;
  onLeaveApplied: () => void;
}

export function LeaveApplicationDialog({
  open,
  onOpenChange,
  officerId,
  officerName,
  onLeaveApplied,
}: LeaveApplicationDialogProps) {
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: undefined,
    to: undefined,
  });
  const [leaveType, setLeaveType] = useState<LeaveType | "">("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const leaveBalance: LeaveBalance = getLeaveBalance(officerId, "2025");

  const calculateWorkingDays = () => {
    if (!dateRange.from) return 0;
    const endDate = dateRange.to || dateRange.from;
    
    const allDays = eachDayOfInterval({ start: dateRange.from, end: endDate });
    const workingDays = allDays.filter(day => !isWeekend(day));
    
    return workingDays.length;
  };

  const totalDays = calculateWorkingDays();

  const getAvailableBalance = (type: LeaveType): number => {
    switch (type) {
      case "sick":
        return leaveBalance.sick_leave;
      case "casual":
        return leaveBalance.casual_leave;
      case "earned":
        return leaveBalance.earned_leave;
      default:
        return 0;
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!dateRange.from) {
      toast({
        title: "Error",
        description: "Please select a date or date range",
        variant: "destructive",
      });
      return;
    }

    if (!leaveType) {
      toast({
        title: "Error",
        description: "Please select a leave type",
        variant: "destructive",
      });
      return;
    }

    if (!reason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for leave",
        variant: "destructive",
      });
      return;
    }

    // Check leave balance
    const availableBalance = getAvailableBalance(leaveType);
    if (totalDays > availableBalance) {
      toast({
        title: "Insufficient Leave Balance",
        description: `You only have ${availableBalance} ${leaveType} leave days available`,
        variant: "destructive",
      });
      return;
    }

    // Check for past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dateRange.from < today) {
      toast({
        title: "Invalid Date",
        description: "Cannot apply leave for past dates",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const application: LeaveApplication = {
        id: `leave-${Date.now()}`,
        officer_id: officerId,
        officer_name: officerName,
        start_date: format(dateRange.from, "yyyy-MM-dd"),
        end_date: format(dateRange.to || dateRange.from, "yyyy-MM-dd"),
        leave_type: leaveType,
        reason: reason.trim(),
        total_days: totalDays,
        status: "pending",
        applied_at: new Date().toISOString(),
      };

      addLeaveApplication(application);

      toast({
        title: "Success",
        description: "Leave application submitted successfully!",
      });

      // Reset form
      setDateRange({ from: undefined, to: undefined });
      setLeaveType("");
      setReason("");
      onLeaveApplied();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit leave application",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5" />
            Apply for Leave
          </DialogTitle>
          <DialogDescription>
            Select dates and provide details for your leave application
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Leave Balance Summary */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{leaveBalance.sick_leave}</div>
              <div className="text-xs text-muted-foreground">Sick Leave</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{leaveBalance.casual_leave}</div>
              <div className="text-xs text-muted-foreground">Casual Leave</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{leaveBalance.earned_leave}</div>
              <div className="text-xs text-muted-foreground">Earned Leave</div>
            </div>
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <Label>Select Date Range</Label>
            <div className="border rounded-md p-3">
              <CalendarComponent
                mode="range"
                selected={dateRange.from && dateRange.to ? { from: dateRange.from, to: dateRange.to } : undefined}
                onSelect={(range) => setDateRange(range || { from: undefined, to: undefined })}
                numberOfMonths={2}
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return date < today;
                }}
                className={cn("pointer-events-auto")}
              />
            </div>
            {dateRange.from && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-3 rounded-md">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(dateRange.from, "MMM dd, yyyy")}
                  {dateRange.to && ` to ${format(dateRange.to, "MMM dd, yyyy")}`}
                  {totalDays > 0 && ` (${totalDays} working ${totalDays === 1 ? 'day' : 'days'})`}
                </span>
              </div>
            )}
          </div>

          {/* Leave Type */}
          <div className="space-y-2">
            <Label>Leave Type</Label>
            <Select value={leaveType} onValueChange={(value) => setLeaveType(value as LeaveType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sick">
                  Sick Leave ({leaveBalance.sick_leave} available)
                </SelectItem>
                <SelectItem value="casual">
                  Casual Leave ({leaveBalance.casual_leave} available)
                </SelectItem>
                <SelectItem value="earned">
                  Earned Leave ({leaveBalance.earned_leave} available)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label>Reason</Label>
            <Textarea
              placeholder="Please provide a reason for your leave application..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <div className="text-xs text-muted-foreground text-right">
              {reason.length}/500 characters
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
