import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

export interface DbNotification {
  id: string;
  recipient_id: string;
  recipient_role: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  metadata: Json;
  read: boolean;
  created_at: string;
  updated_at: string;
}

export const notificationService = {
  // Fetch notifications for a user
  getNotifications: async (userId: string): Promise<DbNotification[]> => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Failed to fetch notifications:', error);
      return [];
    }

    return (data || []) as DbNotification[];
  },

  // Get unread count
  getUnreadCount: async (userId: string): Promise<number> => {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .eq('read', false);

    if (error) {
      console.error('Failed to get unread count:', error);
      return 0;
    }

    return count || 0;
  },

  // Mark notification as read
  markAsRead: async (notificationId: string): Promise<void> => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Failed to mark notification as read:', error);
    }
  },

  // Mark all as read for a user
  markAllAsRead: async (userId: string): Promise<void> => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('recipient_id', userId)
      .eq('read', false);

    if (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  },

  // Create a notification
  createNotification: async (
    recipientId: string,
    recipientRole: string,
    type: string,
    title: string,
    message: string,
    link?: string,
    metadata?: Record<string, unknown>
  ): Promise<DbNotification | null> => {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        recipient_id: recipientId,
        recipient_role: recipientRole,
        type,
        title,
        message,
        link: link || null,
        metadata: (metadata || {}) as Json
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create notification:', error);
      return null;
    }

    return data as DbNotification;
  },

  // Create notifications for multiple recipients
  createBulkNotifications: async (
    recipientIds: string[],
    recipientRole: string,
    type: string,
    title: string,
    message: string,
    link?: string,
    metadata?: Record<string, unknown>
  ): Promise<void> => {
    const notifications = recipientIds.map(recipientId => ({
      recipient_id: recipientId,
      recipient_role: recipientRole,
      type,
      title,
      message,
      link: link || null,
      metadata: (metadata || {}) as Json
    }));

    const { error } = await supabase
      .from('notifications')
      .insert(notifications);

    if (error) {
      console.error('Failed to create bulk notifications:', error);
    }
  }
};
