import React from 'react';
import { AlertCircleIcon, CheckCircleIcon, XIcon } from 'lucide-react';

export type NotificationType = 'pending-approval' | 'ready-for-payment';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  amount?: number;
  expenseName?: string;
  timestamp: string;
}

interface ActivityNotificationBannerProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

export const ActivityNotificationBanner: React.FC<ActivityNotificationBannerProps> = ({
  notifications,
  onDismiss
}) => {
  if (notifications.length === 0) return null;

  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`flex items-start gap-3 p-4 rounded-lg border-l-4 shadow-md ${
            notification.type === 'pending-approval'
              ? 'bg-amber-50 border-l-amber-500'
              : 'bg-green-50 border-l-green-500'
          }`}
        >
          <div className="flex-shrink-0 mt-0.5">
            {notification.type === 'pending-approval' ? (
              <AlertCircleIcon className="w-5 h-5 text-amber-600" />
            ) : (
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className={`font-semibold text-sm ${
                notification.type === 'pending-approval'
                  ? 'text-amber-900'
                  : 'text-green-900'
              }`}
            >
              {notification.title}
            </h3>
            <p
              className={`text-sm mt-1 ${
                notification.type === 'pending-approval'
                  ? 'text-amber-700'
                  : 'text-green-700'
              }`}
            >
              {notification.message}
              {notification.amount && notification.expenseName && (
                <span className="block mt-1 font-medium">
                  {notification.expenseName}: KES {notification.amount.toLocaleString()}
                </span>
              )}
            </p>
            <p
              className={`text-xs mt-2 ${
                notification.type === 'pending-approval'
                  ? 'text-amber-600'
                  : 'text-green-600'
              }`}
            >
              {new Date(notification.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <button
            onClick={() => onDismiss(notification.id)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Dismiss notification"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  );
};
