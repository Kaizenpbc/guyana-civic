import { Router } from 'express';

const router = Router();

// Mock notification data
const mockNotifications = [
  {
    id: 'notif-1',
    type: 'risk',
    priority: 'high',
    title: 'High Risk Identified',
    message: 'Concrete delivery delay risk has high probability and impact',
    projectId: 'proj-pm-4',
    projectName: 'Anna Regina Sports Complex',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    read: false,
    userId: 'user-6'
  },
  {
    id: 'notif-2',
    type: 'deadline',
    priority: 'medium',
    title: 'Action Due Soon',
    message: 'Risk mitigation plan for weather delays due in 2 days',
    projectId: 'proj-pm-1',
    projectName: 'Essequibo Coast School Renovation',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    read: false,
    userId: 'user-6'
  },
  {
    id: 'notif-3',
    type: 'issue',
    priority: 'critical',
    title: 'Critical Issue Escalated',
    message: 'Foundation inspection failed - immediate action required',
    projectId: 'proj-pm-4',
    projectName: 'Anna Regina Sports Complex',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    read: false,
    userId: 'user-6'
  },
  {
    id: 'notif-4',
    type: 'success',
    priority: 'low',
    title: 'Risk Mitigated',
    message: 'Weather contingency plan successfully implemented',
    projectId: 'proj-pm-1',
    projectName: 'Essequibo Coast School Renovation',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: true,
    userId: 'user-6'
  },
  {
    id: 'notif-5',
    type: 'status',
    priority: 'medium',
    title: 'Project Status Updated',
    message: 'Anna Regina Sports Complex moved to planning phase',
    projectId: 'proj-pm-4',
    projectName: 'Anna Regina Sports Complex',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    read: true,
    userId: 'user-6'
  }
];

// Authentication middleware (matching the main routes.ts pattern)
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.session?.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  req.user = req.session.user;
  next();
};

// GET /api/notifications - Get all notifications for a user
router.get('/api/notifications', requireAuth, (req: any, res: any) => {
  try {
    const userId = req.user?.id || 'user-6';
    const userNotifications = mockNotifications.filter(n => n.userId === userId);
    
    res.json({
      notifications: userNotifications,
      unreadCount: userNotifications.filter(n => !n.read).length
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/api/notifications/:id/read', requireAuth, (req: any, res: any) => {
  try {
    const notificationId = req.params.id;
    const notification = mockNotifications.find(n => n.id === notificationId);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    notification.read = true;
    
    res.json({ 
      success: true, 
      notification,
      unreadCount: mockNotifications.filter(n => !n.read && n.userId === req.user?.id).length
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// DELETE /api/notifications/:id - Dismiss notification
router.delete('/api/notifications/:id', requireAuth, (req: any, res: any) => {
  try {
    const notificationId = req.params.id;
    const notificationIndex = mockNotifications.findIndex(n => n.id === notificationId);
    
    if (notificationIndex === -1) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    mockNotifications.splice(notificationIndex, 1);
    
    res.json({ 
      success: true,
      unreadCount: mockNotifications.filter(n => !n.read && n.userId === req.user?.id).length
    });
  } catch (error) {
    console.error('Error dismissing notification:', error);
    res.status(500).json({ error: 'Failed to dismiss notification' });
  }
});

// PUT /api/notifications/read-all - Mark all notifications as read
router.put('/api/notifications/read-all', requireAuth, (req: any, res: any) => {
  try {
    const userId = req.user?.id || 'user-6';
    mockNotifications.forEach(notification => {
      if (notification.userId === userId) {
        notification.read = true;
      }
    });
    
    res.json({ 
      success: true,
      unreadCount: 0
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// POST /api/notifications - Create a new notification (for testing)
router.post('/api/notifications', requireAuth, (req: any, res: any) => {
  try {
    const { type, priority, title, message, projectId, projectName } = req.body;
    
    const newNotification = {
      id: `notif-${Date.now()}`,
      type,
      priority,
      title,
      message,
      projectId,
      projectName,
      timestamp: new Date().toISOString(),
      read: false,
      userId: req.user?.id || 'user-6'
    };
    
    mockNotifications.unshift(newNotification);
    
    res.status(201).json({
      success: true,
      notification: newNotification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

export default router;
