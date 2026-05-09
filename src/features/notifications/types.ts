export type { SystemNotification, User, NotificationType, UserRole } from '../../types';

export interface NotificationPriorityDisplay {
  variant: 'default' | 'info' | 'warning' | 'danger';
  label: string;
}

export interface NotificationDraft {
  type: import('../../types').NotificationType;
  title: string;
  message: string;
  senderId: string;
  senderName: string;
  recipientId?: string;
  recipientRole?: import('../../types').UserRole;
  priority?: import('../../types').SystemNotification['priority'];
  actionRequired?: boolean;
  relatedEntityId?: string;
  relatedEntityType?: import('../../types').SystemNotification['relatedEntityType'];
  metadata?: Record<string, unknown>;
}
