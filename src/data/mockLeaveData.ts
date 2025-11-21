import type { LeaveApplication, LeaveBalance } from "@/types/attendance";

// Mock leave applications storage
let mockLeaveApplications: LeaveApplication[] = [
  // Mr. Atif Ansari - Modern School Vasant Vihar
  {
    id: "leave-msd-001",
    officer_id: "off-msd-001",
    officer_name: "Mr. Atif Ansari",
    start_date: "2025-01-20",
    end_date: "2025-01-22",
    leave_type: "casual",
    reason: "Family wedding ceremony",
    total_days: 3,
    status: "approved",
    applied_at: "2025-01-10T10:00:00Z",
    reviewed_by: "System Admin",
    reviewed_at: "2025-01-11T14:30:00Z",
  },
  {
    id: "leave-msd-002",
    officer_id: "off-msd-001",
    officer_name: "Mr. Atif Ansari",
    start_date: "2025-02-15",
    end_date: "2025-02-16",
    leave_type: "sick",
    reason: "Medical checkup",
    total_days: 2,
    status: "pending",
    applied_at: "2025-02-10T09:00:00Z",
  },
  // Mr. Saran T - Kikani Global Academy
  {
    id: "leave-kga-001",
    officer_id: "off-kga-001",
    officer_name: "Mr. Saran T",
    start_date: "2025-01-05",
    end_date: "2025-01-07",
    leave_type: "earned",
    reason: "Personal work",
    total_days: 3,
    status: "approved",
    applied_at: "2024-12-28T10:00:00Z",
    reviewed_by: "System Admin",
    reviewed_at: "2024-12-29T11:00:00Z",
  },
  {
    id: "leave-kga-002",
    officer_id: "off-kga-001",
    officer_name: "Mr. Saran T",
    start_date: "2025-02-20",
    end_date: "2025-02-21",
    leave_type: "casual",
    reason: "Family function",
    total_days: 2,
    status: "rejected",
    applied_at: "2025-02-12T10:00:00Z",
    reviewed_by: "System Admin",
    reviewed_at: "2025-02-13T15:00:00Z",
    rejection_reason: "Critical classes scheduled during this period. Please reschedule.",
  },
  {
    id: "leave-kga-003",
    officer_id: "off-kga-001",
    officer_name: "Mr. Saran T",
    start_date: "2025-03-10",
    end_date: "2025-03-12",
    leave_type: "sick",
    reason: "Medical treatment",
    total_days: 3,
    status: "approved",
    applied_at: "2025-03-05T08:00:00Z",
    reviewed_by: "System Admin",
    reviewed_at: "2025-03-05T16:00:00Z",
  },
  // Mr. Sreeram R - Kikani Global Academy
  {
    id: "leave-kga-004",
    officer_id: "off-kga-002",
    officer_name: "Mr. Sreeram R",
    start_date: "2025-01-25",
    end_date: "2025-01-27",
    leave_type: "earned",
    reason: "Personal travel",
    total_days: 3,
    status: "approved",
    applied_at: "2025-01-15T10:00:00Z",
    reviewed_by: "System Admin",
    reviewed_at: "2025-01-16T11:30:00Z",
  },
];

// Mock leave balances
const mockLeaveBalances: LeaveBalance[] = [
  // Innovation Officers
  {
    officer_id: "off-msd-001",
    sick_leave: 8,
    casual_leave: 10,
    earned_leave: 15,
    year: "2025",
  },
  {
    officer_id: "off-kga-001",
    sick_leave: 10,
    casual_leave: 12,
    earned_leave: 18,
    year: "2025",
  },
  {
    officer_id: "off-kga-002",
    sick_leave: 10,
    casual_leave: 12,
    earned_leave: 18,
    year: "2025",
  },
  // Meta Staff
  {
    officer_id: "6", // CEO
    sick_leave: 11,
    casual_leave: 11,
    earned_leave: 12,
    year: "2025",
  },
  {
    officer_id: "7", // MD
    sick_leave: 11,
    casual_leave: 11,
    earned_leave: 12,
    year: "2025",
  },
  {
    officer_id: "9", // AGM
    sick_leave: 12,
    casual_leave: 12,
    earned_leave: 12,
    year: "2025",
  },
  {
    officer_id: "10", // GM
    sick_leave: 12,
    casual_leave: 12,
    earned_leave: 12,
    year: "2025",
  },
  {
    officer_id: "8", // Manager
    sick_leave: 12,
    casual_leave: 12,
    earned_leave: 12,
    year: "2025",
  },
  {
    officer_id: "11", // Admin Staff
    sick_leave: 12,
    casual_leave: 12,
    earned_leave: 12,
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

export const initializeLeaveBalance = (balance: LeaveBalance): void => {
  // Add to in-memory array
  const existingIndex = mockLeaveBalances.findIndex(
    (b) => b.officer_id === balance.officer_id && b.year === balance.year
  );
  
  if (existingIndex >= 0) {
    mockLeaveBalances[existingIndex] = balance;
  } else {
    mockLeaveBalances.push(balance);
  }
  
  // Store in localStorage for persistence
  localStorage.setItem(`leave_balance_${balance.officer_id}_${balance.year}`, JSON.stringify(balance));
};

export const getLeaveBalance = (officerId: string, year: string): LeaveBalance => {
  // Check localStorage first
  const stored = localStorage.getItem(`leave_balance_${officerId}_${year}`);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse leave balance from localStorage", e);
    }
  }
  
  // Then check in-memory
  const balance = mockLeaveBalances.find(
    (b) => b.officer_id === officerId && b.year === year
  );
  
  // Return found balance or defaults
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
  
  // Create notification for system admin
  const { createNotificationForSystemAdmin } = require('@/hooks/useNotifications');
  createNotificationForSystemAdmin(
    'leave_application_submitted',
    'New Leave Application',
    `${application.officer_name} has applied for ${application.leave_type} leave (${application.total_days} days)`,
    '/system-admin/leave-approvals',
    {
      leave_application_id: application.id,
      officer_id: application.officer_id,
      officer_name: application.officer_name,
      leave_type: application.leave_type,
      start_date: application.start_date,
      end_date: application.end_date,
      total_days: application.total_days,
    }
  );
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

// Global leave management functions for system admin
export const getAllLeaveApplications = (): LeaveApplication[] => {
  const stored = localStorage.getItem('all_leave_applications');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse all leave applications", e);
    }
  }
  return mockLeaveApplications;
};

export const getAllPendingLeaveApplications = (): LeaveApplication[] => {
  const allApps = getAllLeaveApplications();
  return allApps.filter((app) => app.status === "pending").sort((a, b) => 
    new Date(a.applied_at).getTime() - new Date(b.applied_at).getTime()
  );
};

export const getPendingLeaveCount = (): number => {
  return getAllPendingLeaveApplications().length;
};

export const getLeaveApplicationById = (id: string): LeaveApplication | null => {
  const allApps = getAllLeaveApplications();
  return allApps.find((app) => app.id === id) || null;
};

export const approveLeaveApplication = (
  id: string,
  reviewerName: string,
  comments?: string
): void => {
  const allApps = getAllLeaveApplications();
  const appIndex = allApps.findIndex((app) => app.id === id);
  
  if (appIndex !== -1) {
    allApps[appIndex].status = "approved";
    allApps[appIndex].reviewed_by = reviewerName;
    allApps[appIndex].reviewed_at = new Date().toISOString();
    allApps[appIndex].admin_comments = comments;
    
    // Save to global storage
    localStorage.setItem('all_leave_applications', JSON.stringify(allApps));
    
    // Update officer-specific storage
    const officerId = allApps[appIndex].officer_id;
    const officerApps = getLeaveApplicationsByOfficer(officerId);
    const officerAppIndex = officerApps.findIndex((app) => app.id === id);
    if (officerAppIndex !== -1) {
      officerApps[officerAppIndex] = allApps[appIndex];
      localStorage.setItem(`leave_applications_${officerId}`, JSON.stringify(officerApps));
    }
    
    // Notify the officer
    const { createNotification } = require('@/hooks/useNotifications');
    createNotification(
      allApps[appIndex].officer_id,
      'officer',
      'leave_application_approved',
      'Leave Application Approved',
      `Your ${allApps[appIndex].leave_type} leave application has been approved by ${reviewerName}`,
      '/officer/leave-management',
      {
        leave_application_id: id,
        leave_type: allApps[appIndex].leave_type,
        start_date: allApps[appIndex].start_date,
        end_date: allApps[appIndex].end_date,
      }
    );
  }
};

export const rejectLeaveApplication = (
  id: string,
  reviewerName: string,
  rejectionReason: string
): void => {
  const allApps = getAllLeaveApplications();
  const appIndex = allApps.findIndex((app) => app.id === id);
  
  if (appIndex !== -1) {
    allApps[appIndex].status = "rejected";
    allApps[appIndex].reviewed_by = reviewerName;
    allApps[appIndex].reviewed_at = new Date().toISOString();
    allApps[appIndex].rejection_reason = rejectionReason;
    
    // Save to global storage
    localStorage.setItem('all_leave_applications', JSON.stringify(allApps));
    
    // Update officer-specific storage
    const officerId = allApps[appIndex].officer_id;
    const officerApps = getLeaveApplicationsByOfficer(officerId);
    const officerAppIndex = officerApps.findIndex((app) => app.id === id);
    if (officerAppIndex !== -1) {
      officerApps[officerAppIndex] = allApps[appIndex];
      localStorage.setItem(`leave_applications_${officerId}`, JSON.stringify(officerApps));
    }
    
    // Notify the officer
    const { createNotification } = require('@/hooks/useNotifications');
    createNotification(
      allApps[appIndex].officer_id,
      'officer',
      'leave_application_rejected',
      'Leave Application Rejected',
      `Your ${allApps[appIndex].leave_type} leave application has been rejected by ${reviewerName}`,
      '/officer/leave-management',
      {
        leave_application_id: id,
        leave_type: allApps[appIndex].leave_type,
        rejection_reason: rejectionReason,
      }
    );
  }
};

export const cancelLeaveApplication = (id: string, officerId: string): void => {
  // Remove from officer-specific storage
  const officerApps = getLeaveApplicationsByOfficer(officerId).filter((app) => app.id !== id);
  localStorage.setItem(`leave_applications_${officerId}`, JSON.stringify(officerApps));
  
  // Remove from global storage
  const allApps = getAllLeaveApplications().filter((app) => app.id !== id);
  localStorage.setItem('all_leave_applications', JSON.stringify(allApps));
};

/**
 * Update timetable slot status when leave is approved
 */
export const updateTimetableSlotStatus = (
  officerId: string,
  slotId: string,
  status: 'on_leave' | 'substitute',
  leaveApplicationId: string
): void => {
  const { mockOfficerTimetables } = require('@/data/mockOfficerTimetable');
  const timetable = mockOfficerTimetables.find((t: any) => t.officer_id === officerId);
  
  if (timetable) {
    const slot = timetable.slots.find((s: any) => s.id === slotId);
    if (slot) {
      slot.status = status;
      slot.leave_application_id = leaveApplicationId;
    }
  }
};

/**
 * Add substitute slot to officer's timetable
 */
export const addSubstituteSlot = (
  substituteOfficerId: string,
  assignment: any,
  leaveApplication: any
): void => {
  const { mockOfficerTimetables } = require('@/data/mockOfficerTimetable');
  const timetable = mockOfficerTimetables.find((t: any) => t.officer_id === substituteOfficerId);
  
  if (timetable) {
    const affectedSlot = leaveApplication.affected_slots?.find(
      (s: any) => s.slot_id === assignment.slot_id
    );
    
    if (affectedSlot) {
      // Create a new substitute slot
      const newSlot = {
        id: `substitute-${assignment.slot_id}-${Date.now()}`,
        officer_id: substituteOfficerId,
        day: affectedSlot.day,
        start_time: affectedSlot.start_time,
        end_time: affectedSlot.end_time,
        class: affectedSlot.class,
        subject: affectedSlot.subject,
        room: affectedSlot.room,
        type: 'substitute' as const,
        status: 'substitute' as const,
        original_officer_id: assignment.original_officer_id,
        original_officer_name: leaveApplication.officer_name,
        leave_application_id: leaveApplication.id,
      };
      
      timetable.slots.push(newSlot);
      timetable.total_hours += assignment.hours;
    }
  }
};
