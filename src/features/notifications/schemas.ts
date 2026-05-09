import type { NotificationDraft } from './types';

export function validateNotificationDraft(draft: Partial<NotificationDraft>): string[] {
  const errors: string[] = [];
  if (!draft.type) errors.push('Notification type is required');
  if (!draft.title?.trim()) errors.push('Notification title is required');
  if (!draft.message?.trim()) errors.push('Notification message is required');
  if (!draft.senderId?.trim()) errors.push('Sender ID is required');
  if (!draft.senderName?.trim()) errors.push('Sender name is required');
  return errors;
}
