import type { NotificationPriorityDisplay, SystemNotification, User } from './types';

export function getNotificationPriority(
  priority: SystemNotification['priority'] | undefined,
): NotificationPriorityDisplay {
  switch (priority) {
    case 'low':
      return { variant: 'default', label: 'Low' };
    case 'medium':
      return { variant: 'info', label: 'Medium' };
    case 'high':
      return { variant: 'warning', label: 'High' };
    case 'critical':
      return { variant: 'danger', label: 'Critical' };
    default:
      return { variant: 'default', label: 'Normal' };
  }
}

export function formatNotificationTimeAgo(timestamp: string, now = new Date()): string {
  const notificationTime = new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
}

export function getUserNotifications(
  notifications: SystemNotification[],
  user: User | null,
): SystemNotification[] {
  if (!user) return [];

  return notifications.filter(notification =>
    notification.recipientId === user.id ||
    notification.recipientRole === user.role ||
    (!notification.recipientId && !notification.recipientRole)
  );
}

export function getUnreadNotificationCount(
  notifications: SystemNotification[],
  user: User | null,
): number {
  return getUserNotifications(notifications, user).filter(notification => !notification.isRead).length;
}

export function markNotificationRead(notification: SystemNotification): SystemNotification {
  return { ...notification, isRead: true };
}
