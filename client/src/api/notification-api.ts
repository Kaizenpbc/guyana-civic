import { Notification } from '@/components/NotificationSystem';

const API_BASE = '/api';

// Get all notifications for a user
export const getNotifications = async (): Promise<{
  notifications: Notification[];
  unreadCount: number;
}> => {
  const response = await fetch(`${API_BASE}/notifications`, {
    credentials: 'include'
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch notifications');
  }
  
  return response.json();
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<{
  success: boolean;
  notification: Notification;
  unreadCount: number;
}> => {
  const response = await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
    method: 'PUT',
    credentials: 'include'
  });
  
  if (!response.ok) {
    throw new Error('Failed to mark notification as read');
  }
  
  return response.json();
};

// Dismiss notification
export const dismissNotification = async (notificationId: string): Promise<{
  success: boolean;
  unreadCount: number;
}> => {
  const response = await fetch(`${API_BASE}/notifications/${notificationId}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  
  if (!response.ok) {
    throw new Error('Failed to dismiss notification');
  }
  
  return response.json();
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (): Promise<{
  success: boolean;
  unreadCount: number;
}> => {
  const response = await fetch(`${API_BASE}/notifications/read-all`, {
    method: 'PUT',
    credentials: 'include'
  });
  
  if (!response.ok) {
    throw new Error('Failed to mark all notifications as read');
  }
  
  return response.json();
};

// Create a new notification (for testing)
export const createNotification = async (notificationData: {
  type: 'risk' | 'deadline' | 'status' | 'issue' | 'success';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  projectId?: string;
  projectName?: string;
}): Promise<{
  success: boolean;
  notification: Notification;
}> => {
  const response = await fetch(`${API_BASE}/notifications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(notificationData)
  });
  
  if (!response.ok) {
    throw new Error('Failed to create notification');
  }
  
  return response.json();
};
