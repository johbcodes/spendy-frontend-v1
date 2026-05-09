import type { NotificationDraft, SystemNotification } from './types';

export function createSystemNotification(draft: NotificationDraft): SystemNotification {
  return {
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    type: draft.type,
    title: draft.title,
    message: draft.message,
    recipientId: draft.recipientId,
    recipientRole: draft.recipientRole,
    senderId: draft.senderId,
    senderName: draft.senderName,
    timestamp: new Date().toISOString(),
    isRead: false,
    priority: draft.priority || 'medium',
    actionRequired: draft.actionRequired || false,
    relatedEntityId: draft.relatedEntityId,
    relatedEntityType: draft.relatedEntityType,
    metadata: draft.metadata,
  };
}

export function mapNotificationToExportData(notification: SystemNotification) {
  return {
    Type: notification.type,
    Title: notification.title,
    Message: notification.message,
    Priority: notification.priority,
    Read: notification.isRead ? 'Yes' : 'No',
    Sender: notification.senderName,
    Timestamp: notification.timestamp,
  };
}
