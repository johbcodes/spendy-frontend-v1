import { describe, expect, it } from 'vitest';
import {
  formatNotificationTimeAgo,
  getNotificationPriority,
  getUnreadNotificationCount,
  getUserNotifications,
  markNotificationAsReadInList,
} from '..';
import type { SystemNotification, User } from '../types';

const user: User = {
  id: 'user-1',
  firstName: 'A',
  lastName: 'User',
  email: 'a@example.com',
  phone: '',
  country: 'Kenya',
  role: 'Staff',
  status: 'Active',
  modulesAssigned: [],
  createdAt: '2024-01-01',
  isAdmin: false,
  password: '',
};

const notification = (patch: Partial<SystemNotification>): SystemNotification => ({
  id: 'n-1',
  type: 'info',
  title: 'Title',
  message: 'Message',
  senderId: 'admin',
  senderName: 'Admin',
  timestamp: '2024-01-01T00:00:00.000Z',
  isRead: false,
  priority: 'medium',
  ...patch,
});

describe('notifications feature', () => {
  it('maps priority to badge display', () => {
    expect(getNotificationPriority('critical')).toEqual({ variant: 'danger', label: 'Critical' });
    expect(getNotificationPriority(undefined)).toEqual({ variant: 'default', label: 'Normal' });
  });

  it('formats relative notification time', () => {
    const now = new Date('2024-01-02T02:00:00.000Z');
    expect(formatNotificationTimeAgo('2024-01-02T01:30:00.000Z', now)).toBe('30 min ago');
    expect(formatNotificationTimeAgo('2024-01-01T00:00:00.000Z', now)).toBe('1 day ago');
  });

  it('filters notifications visible to the current user', () => {
    const notifications = [
      notification({ id: 'direct', recipientId: 'user-1' }),
      notification({ id: 'role', recipientRole: 'Staff' }),
      notification({ id: 'broadcast' }),
      notification({ id: 'other', recipientId: 'user-2' }),
    ];

    expect(getUserNotifications(notifications, user).map(n => n.id)).toEqual([
      'direct',
      'role',
      'broadcast',
    ]);
    expect(getUnreadNotificationCount(notifications, user)).toBe(3);
  });

  it('marks one notification as read', () => {
    const result = markNotificationAsReadInList([notification({ id: 'n-1' })], 'n-1');
    expect(result[0].isRead).toBe(true);
  });
});
