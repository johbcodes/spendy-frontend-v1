import { useCallback, useEffect, useMemo, useState } from 'react';
import { deleteNotificationFromList, markNotificationAsReadInList, notificationsFeatureApi } from './api';
import { getUnreadNotificationCount, getUserNotifications } from './rules';
import type { SystemNotification, User } from './types';

export function useNotificationsController(currentUser: User | null) {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('spendy_notifications');
    if (saved) {
      try {
        setNotifications(JSON.parse(saved));
      } catch {
        setNotifications([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('spendy_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const userNotifications = useMemo(
    () => getUserNotifications(notifications, currentUser),
    [notifications, currentUser],
  );

  const unreadCount = useMemo(
    () => getUnreadNotificationCount(notifications, currentUser),
    [notifications, currentUser],
  );

  const sendNotification = useCallback((notification: SystemNotification) => {
    setNotifications(prev => [notification, ...prev]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => markNotificationAsReadInList(prev, id));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => deleteNotificationFromList(prev, id));
  }, []);

  const refresh = useCallback(async () => {
    const fresh = await notificationsFeatureApi.list();
    setNotifications(fresh);
  }, []);

  return {
    notifications,
    setNotifications,
    userNotifications,
    unreadCount,
    sendNotification,
    markAsRead,
    deleteNotification,
    refresh,
  };
}
