import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, X, AlertTriangle, Clock, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { 
  getNotifications, 
  markNotificationAsRead, 
  dismissNotification, 
  markAllNotificationsAsRead 
} from '@/api/notification-api';

export interface Notification {
  id: string;
  type: 'risk' | 'deadline' | 'status' | 'issue' | 'success';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  projectId?: string;
  projectName?: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

interface NotificationSystemProps {
  userId: string;
  onNotificationClick?: (notification: Notification) => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ 
  userId, 
  onNotificationClick 
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications from API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getNotifications();
        setNotifications(data.notifications.map(n => ({
          ...n,
          timestamp: new Date(n.timestamp)
        })));
        setUnreadCount(data.unreadCount);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        // Fallback to empty state on error
        setNotifications([]);
        setUnreadCount(0);
      }
    };

    fetchNotifications();
  }, [userId]);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'risk':
        return <AlertTriangle className="h-4 w-4" />;
      case 'deadline':
        return <Clock className="h-4 w-4" />;
      case 'issue':
        return <AlertCircle className="h-4 w-4" />;
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      case 'status':
        return <Info className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-100 border-green-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'risk':
        return 'text-red-600';
      case 'deadline':
        return 'text-blue-600';
      case 'issue':
        return 'text-orange-600';
      case 'success':
        return 'text-green-600';
      case 'status':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const result = await markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true }
            : notif
        )
      );
      setUnreadCount(result.unreadCount);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDismissNotification = async (notificationId: string) => {
    try {
      const result = await dismissNotification(notificationId);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      setUnreadCount(result.unreadCount);
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const result = await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      setUnreadCount(result.unreadCount);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 top-10 w-96 z-50">
          <Card className="shadow-lg border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Notifications</CardTitle>
                <div className="flex space-x-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs"
                    >
                      Mark all read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNotifications(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No notifications</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`flex-shrink-0 ${getTypeColor(notification.type)}`}>
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className={`text-sm font-medium ${
                                !notification.read ? 'text-gray-900' : 'text-gray-700'
                              }`}>
                                {notification.title}
                              </p>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getPriorityColor(notification.priority)}`}
                              >
                                {notification.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            {notification.projectName && (
                              <p className="text-xs text-blue-600 mt-1">
                                Project: {notification.projectName}
                              </p>
                            )}
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-500">
                                {formatTimestamp(notification.timestamp)}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDismissNotification(notification.id);
                                }}
                                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default NotificationSystem;
