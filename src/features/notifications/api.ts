import { notificationsAPI } from '../../services/api';
import type { NotificationDraft, SystemNotification } from './types';
import { createSystemNotification } from './mappers';
import { markNotificationRead } from './rules';

export const notificationsFeatureApi = {
  list: (): Promise<SystemNotification[]> => notificationsAPI.getAll(),
  create: (draft: NotificationDraft): Promise<SystemNotification> =>
    notificationsAPI.create(createSystemNotification(draft)),
  markAsRead: (id: string): Promise<void> => notificationsAPI.markAsRead(id),
};

export function markNotificationAsReadInList(
  notifications: SystemNotification[],
  id: string,
): SystemNotification[] {
  return notifications.map(notification =>
    notification.id === id ? markNotificationRead(notification) : notification
  );
}

export function deleteNotificationFromList(
  notifications: SystemNotification[],
  id: string,
): SystemNotification[] {
  return notifications.filter(notification => notification.id !== id);
}
