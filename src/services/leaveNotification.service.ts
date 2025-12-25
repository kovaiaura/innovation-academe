import { supabase } from '@/integrations/supabase/client';
import { createNotification } from '@/hooks/useNotifications';
import { LeaveApplication } from '@/types/leave';
import { format } from 'date-fns';

export const leaveNotificationService = {
  /**
   * Notify first approver when a new leave application is submitted
   */
  notifyApproverOnSubmission: async (application: LeaveApplication): Promise<void> => {
    if (!application.approval_chain || application.approval_chain.length === 0) {
      console.log('No approval chain defined, skipping notification');
      return;
    }

    const firstApprover = application.approval_chain.find(a => a.order === 1);
    if (!firstApprover?.position_id) return;

    // Find users with the approver position
    const { data: approvers } = await supabase
      .from('profiles')
      .select('id, name')
      .eq('position_id', firstApprover.position_id);

    if (!approvers || approvers.length === 0) {
      console.log('No approvers found for position:', firstApprover.position_name);
      return;
    }

    // Send notification to all users with the approver position
    for (const approver of approvers) {
      createNotification(
        approver.id,
        'officer',
        'leave_pending_approval',
        'New Leave Application',
        `${application.applicant_name} has submitted a ${application.leave_type} leave request from ${format(new Date(application.start_date), 'MMM dd')} to ${format(new Date(application.end_date), 'MMM dd, yyyy')} (${application.total_days} days)`,
        '/system-admin/leave-approvals',
        {
          leave_application_id: application.id,
          applicant_name: application.applicant_name,
          leave_type: application.leave_type,
          start_date: application.start_date,
          end_date: application.end_date,
          total_days: application.total_days,
          approver_position: firstApprover.position_name
        }
      );
    }
  },

  /**
   * Notify next approver in chain after current level approval
   */
  notifyNextApprover: async (application: LeaveApplication, currentLevel: number): Promise<void> => {
    if (!application.approval_chain) return;

    const nextApprover = application.approval_chain.find(a => a.order === currentLevel + 1);
    if (!nextApprover?.position_id) return;

    const { data: approvers } = await supabase
      .from('profiles')
      .select('id, name')
      .eq('position_id', nextApprover.position_id);

    if (!approvers || approvers.length === 0) return;

    for (const approver of approvers) {
      createNotification(
        approver.id,
        'officer',
        'leave_pending_approval',
        'Leave Application Pending Your Approval',
        `${application.applicant_name}'s ${application.leave_type} leave request requires your approval (${application.total_days} days: ${format(new Date(application.start_date), 'MMM dd')} - ${format(new Date(application.end_date), 'MMM dd')})`,
        '/system-admin/leave-approvals',
        {
          leave_application_id: application.id,
          applicant_name: application.applicant_name,
          leave_type: application.leave_type,
          start_date: application.start_date,
          end_date: application.end_date,
          total_days: application.total_days,
          approver_position: nextApprover.position_name
        }
      );
    }
  },

  /**
   * Notify applicant when their leave is approved at any level
   */
  notifyApplicantOnApproval: async (application: LeaveApplication, approverName: string, isFinal: boolean): Promise<void> => {
    const title = isFinal ? 'Leave Application Approved' : 'Leave Application Progress';
    const message = isFinal 
      ? `Your ${application.leave_type} leave from ${format(new Date(application.start_date), 'MMM dd')} to ${format(new Date(application.end_date), 'MMM dd, yyyy')} has been approved by ${approverName}`
      : `Your ${application.leave_type} leave request has been approved by ${approverName}. Waiting for next level approval.`;

    createNotification(
      application.applicant_id,
      'officer',
      isFinal ? 'leave_application_approved' : 'leave_pending_approval',
      title,
      message,
      '/officer/leave-status',
      {
        leave_application_id: application.id,
        leave_type: application.leave_type,
        start_date: application.start_date,
        end_date: application.end_date,
        total_days: application.total_days
      }
    );
  },

  /**
   * Notify applicant when their leave is rejected
   */
  notifyApplicantOnRejection: async (application: LeaveApplication, rejectorName: string, reason: string): Promise<void> => {
    createNotification(
      application.applicant_id,
      'officer',
      'leave_application_rejected',
      'Leave Application Rejected',
      `Your ${application.leave_type} leave request from ${format(new Date(application.start_date), 'MMM dd')} to ${format(new Date(application.end_date), 'MMM dd, yyyy')} was rejected by ${rejectorName}. Reason: ${reason}`,
      '/officer/leave-status',
      {
        leave_application_id: application.id,
        leave_type: application.leave_type,
        start_date: application.start_date,
        end_date: application.end_date,
        rejection_reason: reason
      }
    );
  },

  /**
   * Notify management/institution admin when an officer is on approved leave
   */
  notifyManagementOnOfficerLeave: async (application: LeaveApplication): Promise<void> => {
    if (!application.institution_id) return;

    // Get management users for the institution
    const { data: managementUsers } = await supabase
      .from('profiles')
      .select('id, name, position_id')
      .eq('institution_id', application.institution_id);

    // Get management positions
    const { data: managementPositions } = await supabase
      .from('positions')
      .select('id')
      .eq('is_ceo_position', true);

    const managementPositionIds = managementPositions?.map(p => p.id) || [];

    // Also notify system admins
    const { data: systemAdmins } = await supabase
      .from('user_roles')
      .select('user_id')
      .in('role', ['system_admin', 'super_admin', 'management']);

    const adminIds = new Set(systemAdmins?.map(a => a.user_id) || []);

    // Combine management users
    const notifyUsers = new Set<string>();
    
    managementUsers?.forEach(user => {
      if (user.position_id && managementPositionIds.includes(user.position_id)) {
        notifyUsers.add(user.id);
      }
    });

    adminIds.forEach(id => notifyUsers.add(id));

    // Don't notify the applicant themselves
    notifyUsers.delete(application.applicant_id);

    for (const userId of notifyUsers) {
      createNotification(
        userId,
        'management',
        'officer_on_leave',
        'Officer On Leave',
        `${application.applicant_name} will be on ${application.leave_type} leave from ${format(new Date(application.start_date), 'MMM dd')} to ${format(new Date(application.end_date), 'MMM dd, yyyy')} (${application.total_days} days)`,
        '/system-admin/leave-approvals',
        {
          leave_application_id: application.id,
          officer_name: application.applicant_name,
          officer_id: application.officer_id || undefined,
          leave_type: application.leave_type,
          start_date: application.start_date,
          end_date: application.end_date,
          total_days: application.total_days,
          institution_id: application.institution_id || undefined,
          institution_name: application.institution_name || undefined
        }
      );
    }
  }
};
