import type { LeaveApplication, LeaveBalance } from "@/types/attendance";

// Mock leave applications storage
let mockLeaveApplications: LeaveApplication[] = [
  {
    id: "leave-001",
    officer_id: "off-001",
    officer_name: "Rajesh Kumar",
    start_date: "2025-11-15",
    end_date: "2025-11-17",
    leave_type: "casual",
    reason: "Family function",
    total_days: 3,
    status: "approved",
    applied_at: "2025-10-20T10:00:00Z",
    reviewed_by: "Principal",
    reviewed_at: "2025-10-21T14:30:00Z",
  },
  {
    id: "leave-002",
    officer_id: "off-001",
    officer_name: "Rajesh Kumar",
    start_date: "2025-12-24",
    end_date: "2025-12-26",
    leave_type: "earned",
    reason: "Year-end vacation",
    total_days: 3,
    status: "pending",
    applied_at: "2025-10-25T09:00:00Z",
  },
];

// Mock leave balances
const mockLeaveBalances: LeaveBalance[] = [
  {
    officer_id: "off-001",
    sick_leave: 8,
    casual_leave: 10,
    earned_leave: 15,
    year: "2025",
  },
  {
    officer_id: "off-002",
    sick_leave: 10,
    casual_leave: 12,
    earned_leave: 18,
    year: "2025",
  },
];

// Helper functions
export const getLeaveApplicationsByOfficer = (officerId: string): LeaveApplication[] => {
  // Check localStorage first
  const stored = localStorage.getItem(`leave_applications_${officerId}`);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse leave applications from localStorage", e);
    }
  }
  
  return mockLeaveApplications.filter((app) => app.officer_id === officerId);
};

export const getLeaveBalance = (officerId: string, year: string): LeaveBalance => {
  const balance = mockLeaveBalances.find(
    (b) => b.officer_id === officerId && b.year === year
  );
  
  return balance || {
    officer_id: officerId,
    sick_leave: 10,
    casual_leave: 12,
    earned_leave: 18,
    year,
  };
};

export const addLeaveApplication = (application: LeaveApplication): void => {
  mockLeaveApplications.push(application);
  
  // Save to localStorage
  const officerId = application.officer_id;
  const applications = getLeaveApplicationsByOfficer(officerId);
  applications.push(application);
  localStorage.setItem(`leave_applications_${officerId}`, JSON.stringify(applications));
};

export const isDateOnLeave = (officerId: string, date: string): boolean => {
  const applications = getLeaveApplicationsByOfficer(officerId);
  const approvedApps = applications.filter((app) => app.status === "approved");
  
  return approvedApps.some((app) => {
    return date >= app.start_date && date <= app.end_date;
  });
};

export const getApprovedLeaveDates = (officerId: string): string[] => {
  const applications = getLeaveApplicationsByOfficer(officerId);
  const approvedApps = applications.filter((app) => app.status === "approved");
  
  const dates: string[] = [];
  approvedApps.forEach((app) => {
    const startDate = new Date(app.start_date);
    const endDate = new Date(app.end_date);
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split("T")[0]);
    }
  });
  
  return dates;
};

export const getTodayLeaveDetails = (
  officerId: string,
  date: string
): LeaveApplication | null => {
  const applications = getLeaveApplicationsByOfficer(officerId);
  const approvedApps = applications.filter((app) => app.status === "approved");
  
  return (
    approvedApps.find((app) => date >= app.start_date && date <= app.end_date) || null
  );
};
