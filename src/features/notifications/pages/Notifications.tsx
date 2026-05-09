import { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { BellIcon, CheckIcon, TrashIcon, InfoIcon, AlertTriangleIcon, CheckCircleIcon, UsersIcon, SettingsIcon } from 'lucide-react';
import type { SystemNotification, User } from '../types';
import { formatNotificationTimeAgo, getNotificationPriority } from '../rules';

interface NotificationsProps {
  notifications?: SystemNotification[];
  currentUser?: User;
  onMarkAsRead?: (notificationId: string) => void;
  onDeleteNotification?: (notificationId: string) => void;
}

export function Notifications({
  notifications = [],
  currentUser,
  onMarkAsRead,
  onDeleteNotification
}: NotificationsProps) {
  const [localNotifications, setLocalNotifications] = useState(notifications);

  // Use provided notifications or fallback to local state
  const displayNotifications = notifications.length > 0 ? notifications : localNotifications;

  const markAsRead = (id: string) => {
    if (onMarkAsRead) {
      onMarkAsRead(id);
    } else {
      setLocalNotifications(displayNotifications.map(n => n.id === id ? {
        ...n,
        isRead: true
      } : n));
    }
  };

  const markAllAsRead = () => {
    if (onMarkAsRead) {
      displayNotifications.filter(n => !n.isRead).forEach(n => onMarkAsRead(n.id));
    } else {
      setLocalNotifications(displayNotifications.map(n => ({
        ...n,
        isRead: true
      })));
    }
  };

  const deleteNotification = (id: string) => {
    if (onDeleteNotification) {
      onDeleteNotification(id);
    } else {
      setLocalNotifications(displayNotifications.filter(n => n.id !== id));
    }
  };

  const getNotificationIcon = (type: SystemNotification['type']) => {
    switch (type) {
      case 'info':
        return <InfoIcon className="w-5 h-5 text-blue-600" />;
      case 'warning':
        return <AlertTriangleIcon className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <AlertTriangleIcon className="w-5 h-5 text-red-600" />;
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'admin_broadcast':
        return <UsersIcon className="w-5 h-5 text-purple-600" />;
      case 'role_change':
        return <SettingsIcon className="w-5 h-5 text-orange-600" />;
      case 'access_update':
        return <UsersIcon className="w-5 h-5 text-indigo-600" />;
      default:
        return <BellIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-gray">Notifications</h1>
          <p className="text-gray-600 mt-1">View all your notifications</p>
        </div>
        <Button variant="secondary" size="sm" onClick={markAllAsRead}>
          <CheckIcon className="w-4 h-4" />
          Mark all as read
        </Button>
      </div>
      <Card className="p-6">
        {displayNotifications.length > 0 ? (
          <div className="space-y-3">
            {displayNotifications.map((notif: SystemNotification) => {
              const priority = getNotificationPriority(notif.priority);
              return (
                <div key={notif.id} className={`flex items-start justify-between p-4 rounded-lg border ${!notif.isRead ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
                  <div className="flex items-start space-x-3 flex-1">
                    <div className={`p-2 rounded-lg ${!notif.isRead ? 'bg-azure' : 'bg-gray-200'}`}>
                      {getNotificationIcon(notif.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-dark-gray">{notif.title}</h4>
                        <Badge variant={priority.variant} className="text-xs">
                          {priority.label}
                        </Badge>
                        {notif.actionRequired && (
                          <Badge variant="warning" className="text-xs">
                            Action Required
                          </Badge>
                        )}
                      </div>
                      <p className="text-dark-gray text-sm">{notif.message}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <p className="text-xs text-gray-500">{formatNotificationTimeAgo(notif.timestamp)}</p>
                        <p className="text-xs text-gray-400">From: {notif.senderName}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {!notif.isRead && (
                      <Button variant="ghost" size="xs" onClick={() => markAsRead(notif.id)}>
                        <CheckIcon className="w-3 h-3" />
                      </Button>
                    )}
                    <Button variant="ghost" size="xs" onClick={() => deleteNotification(notif.id)}>
                      <TrashIcon className="w-3 h-3 text-red-600" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <BellIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No notifications yet</h3>
            <p className="text-gray-500">
              You'll see notifications here when there are updates or actions that require your attention.
            </p>
          </div>
        )}
      </Card>
    </div>;
}
