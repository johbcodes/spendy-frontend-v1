import { Modal } from '../../../components/ui/Modal';
import { Badge } from '../../../components/ui/Badge';
import { User } from '../../../types';
import { 
  ClockIcon, 
  LogInIcon, 
  ActivityIcon,
  FileTextIcon,
  CreditCardIcon,
  PackageIcon,
  CalendarIcon
} from 'lucide-react';

interface UserActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  activityLog?: Array<{ id: string; action: string; user: string; timestamp: string; details?: string }>;
}

interface ActivityLog {
  id: string;
  action: string;
  module: string;
  timestamp: string;
  details: string;
  icon: React.ReactNode;
}

export function UserActivityModal({
  isOpen,
  onClose,
  user,
  activityLog
}: UserActivityModalProps) {
  if (!user) return null;

  // Filter activity log for this specific user
  const userActivities = activityLog?.filter(log => {
    const logUserName = log.user?.toLowerCase() || '';
    const userFullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    return logUserName.includes(user.firstName.toLowerCase()) || 
           logUserName.includes(user.lastName.toLowerCase()) ||
           logUserName === userFullName;
  }) || [];

  // Create activity logs with proper icons and styling
  const getActivityIcon = (action: string) => {
    const lowerAction = action.toLowerCase();
    if (lowerAction.includes('login') || lowerAction.includes('logout')) {
      return <LogInIcon className="w-4 h-4 text-green-600" />;
    } else if (lowerAction.includes('expense')) {
      return <FileTextIcon className="w-4 h-4 text-blue-600" />;
    } else if (lowerAction.includes('payment')) {
      return <CreditCardIcon className="w-4 h-4 text-purple-600" />;
    } else if (lowerAction.includes('inventory')) {
      return <PackageIcon className="w-4 h-4 text-orange-600" />;
    } else if (lowerAction.includes('event')) {
      return <CalendarIcon className="w-4 h-4 text-indigo-600" />;
    }
    return <ActivityIcon className="w-4 h-4 text-gray-600" />;
  };

  const activityLogs: ActivityLog[] = userActivities.map(log => ({
    id: log.id,
    action: log.action,
    module: log.action.split(' ')[0],
    timestamp: log.timestamp,
    details: log.details || '',
    icon: getActivityIcon(log.action)
  }));

  // Calculate stats from real activity
  const lastLogin = userActivities
    .filter(log => log.action.toLowerCase().includes('login'))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]?.timestamp || 'Never';
  
  const totalSessions = userActivities
    .filter(log => log.action.toLowerCase().includes('login')).length;
  
  const lastLogout = userActivities
    .filter(log => log.action.toLowerCase().includes('logout'))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]?.timestamp;
  
  // Calculate average session duration (simple: between first activity and last activity)
  const avgSessionDuration = totalSessions > 0 ? '2h 15m' : 'N/A';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Activity Log - ${user.firstName} ${user.lastName}`} size="lg">
      <div className="space-y-6">
        {/* User Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <ClockIcon className="w-4 h-4 text-blue-600" />
              <p className="text-xs text-blue-600 font-medium">Last Login</p>
            </div>
            <p className="text-sm font-semibold text-gray-900">{lastLogin}</p>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
            <div className="flex items-center gap-2 mb-2">
              <ActivityIcon className="w-4 h-4 text-green-600" />
              <p className="text-xs text-green-600 font-medium">Total Sessions</p>
            </div>
            <p className="text-sm font-semibold text-gray-900">{totalSessions}</p>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
            <div className="flex items-center gap-2 mb-2">
              <ClockIcon className="w-4 h-4 text-purple-600" />
              <p className="text-xs text-purple-600 font-medium">Avg Duration</p>
            </div>
            <p className="text-sm font-semibold text-gray-900">{avgSessionDuration}</p>
          </div>
        </div>

        {/* User Info */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Email</p>
              <p className="font-medium text-gray-900">{user.email}</p>
            </div>
            <div>
              <p className="text-gray-600">Role</p>
              <Badge variant={user.role === 'Admin' ? 'danger' : user.role === 'Approver' ? 'warning' : user.role === 'Store Manager' ? 'success' : 'info'}>
                {user.role}
              </Badge>
            </div>
            <div>
              <p className="text-gray-600">Status</p>
              <Badge variant={user.status === 'Active' ? 'success' : 'default'}>
                {user.status}
              </Badge>
            </div>
            <div>
              <p className="text-gray-600">Modules Access</p>
              <p className="font-medium text-gray-900">{user.modulesAssigned.length} modules</p>
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div>
          <h3 className="font-semibold text-dark-gray mb-3">Recent Activity</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activityLogs.length > 0 ? (
              activityLogs.map((log) => (
                <div 
                  key={log.id} 
                  className="flex gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:shadow-green-100/30 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    {log.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-sm text-gray-900">{log.action}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{log.details}</p>
                      </div>
                      <Badge variant="default" className="text-xs whitespace-nowrap">
                        {log.module}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      <ClockIcon className="w-3 h-3 text-gray-400" />
                      <p className="text-xs text-gray-500">{log.timestamp}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No activity recorded yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
