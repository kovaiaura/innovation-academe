import { LeaveApplication } from "@/types/attendance";
import { Check, Clock, X, CircleDot } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface LeaveApprovalTimelineProps {
  application: LeaveApplication;
}

export function LeaveApprovalTimeline({ application }: LeaveApprovalTimelineProps) {
  const steps = [
    {
      label: "Application Submitted",
      timestamp: application.applied_at,
      status: "completed" as const,
      description: `By: ${application.officer_name}`,
    },
    {
      label: application.status === "pending" ? "Pending Review" : "Under Review",
      timestamp: application.status === "pending" ? null : application.reviewed_at,
      status: application.status === "pending" ? "current" : "completed" as const,
      description: application.status === "pending" 
        ? "Waiting for System Admin approval" 
        : `Reviewed by: ${application.reviewed_by}`,
    },
    {
      label: application.status === "approved" ? "Approved" : application.status === "rejected" ? "Rejected" : "Decision",
      timestamp: application.reviewed_at,
      status: application.status === "approved" 
        ? "approved" 
        : application.status === "rejected" 
        ? "rejected" 
        : "pending" as const,
      description: application.status === "approved" 
        ? application.admin_comments || "Leave approved" 
        : application.status === "rejected" 
        ? `Reason: ${application.rejection_reason}` 
        : "(Not yet reviewed)",
    },
  ];

  const getStepIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <Check className="h-5 w-5 text-green-500" />;
      case "current":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "approved":
        return <Check className="h-5 w-5 text-green-500" />;
      case "rejected":
        return <X className="h-5 w-5 text-red-500" />;
      default:
        return <CircleDot className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case "completed":
        return "border-green-500 bg-green-500/10";
      case "current":
        return "border-yellow-500 bg-yellow-500/10 animate-pulse";
      case "approved":
        return "border-green-500 bg-green-500/10";
      case "rejected":
        return "border-red-500 bg-red-500/10";
      default:
        return "border-gray-300 bg-gray-100";
    }
  };

  const getLineColor = (index: number) => {
    const step = steps[index];
    if (step.status === "completed" || step.status === "approved") return "bg-green-500";
    if (step.status === "rejected") return "bg-red-500";
    if (step.status === "current") return "bg-yellow-500";
    return "bg-gray-300";
  };

  return (
    <div className="space-y-6">
      {steps.map((step, index) => (
        <div key={index} className="relative flex gap-4">
          {/* Vertical line */}
          {index < steps.length - 1 && (
            <div 
              className={cn(
                "absolute left-[22px] top-12 h-[calc(100%+0.5rem)] w-0.5 transition-colors",
                getLineColor(index)
              )}
            />
          )}
          
          {/* Step indicator */}
          <div className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 transition-all",
            getStepColor(step.status)
          )}>
            {getStepIcon(step.status)}
          </div>
          
          {/* Step content */}
          <div className="flex-1 pt-1">
            <h4 className="font-semibold text-sm">{step.label}</h4>
            {step.timestamp && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {format(new Date(step.timestamp), "PPp")}
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
