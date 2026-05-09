import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Table, Column } from '../../../components/ui/Table';
import { Badge } from '../../../components/ui/Badge';
import { User } from '../../../types';
import { MODULES } from '../../../utils/constants';
import { PlusIcon, SearchIcon, KeyRoundIcon, EditIcon, TrashIcon, UsersIcon, UserCheckIcon, ActivityIcon } from 'lucide-react';
import { exportToCSV, exportToPDF, exportToExcel } from '../../../utils/exportUtils';
import { ExportButton } from '../../../components/ui/ExportButton';
import { UserActivityModal } from '../modals/UserActivityModal';

interface UsersProps {
  onOpenModal: (modal: string, data?: any) => void;
  onNavigate: (page: string, id?: string) => void;
  users: User[];
  onCopyCredentials: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  onToggleUserStatus: (userId: string) => void;
  currentUser: User;
  activityLog?: Array<{ id: string; action: string; user: string; timestamp: string; details?: string }>;
}

export function Users({
  onOpenModal,
  onNavigate,
  users,
  onCopyCredentials,
  onDeleteUser,
  onToggleUserStatus,
  currentUser,
  activityLog
}: UsersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showActivityModal, setShowActivityModal] = useState(false);

  const filteredUsers = users.filter(user => user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase()));
  const getModuleLabel = (user: User) => {
    const hasAll = user.modulesAssigned.includes('All') || user.role === 'Admin';
    const count = hasAll ? MODULES.length : user.modulesAssigned.length;
    return hasAll ? `${count} modules (All)` : `${count} modules`;
  };
  const getRoleVariant = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'danger';
      case 'Approver':
        return 'warning';
      case 'Staff':
        return 'info';
      case 'Store Manager':
        return 'success';
      default:
        return 'default';
    }
  };
  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
    const exportData = filteredUsers.map(u => ({
      Name: `${u.firstName} ${u.lastName}`,
      Email: u.email,
      Phone: u.phone,
      Country: u.country,
      Role: u.role,
      Status: u.status,
      'Modules Assigned': u.modulesAssigned.join(', ')
    }));
    switch (format) {
      case 'csv':
        exportToCSV(exportData, 'users');
        break;
      case 'pdf':
        exportToPDF(exportData, 'users', 'Users Report');
        break;
      case 'excel':
        exportToExcel(exportData, 'users');
        break;
    }
  };
  const columns: Column<User>[] = [{
    key: 'firstName',
    label: 'Full Name',
    render: user => `${user.firstName} ${user.lastName}`
  }, {
    key: 'email',
    label: 'Email',
    sortable: true
  }, {
    key: 'phone',
    label: 'Phone'
  }, {
    key: 'country',
    label: 'Country'
  }, {
    key: 'role',
    label: 'Role',
    render: user => <Badge variant={getRoleVariant(user.role)}>{user.role}</Badge>
  }, {
    key: 'status',
    label: 'Status',
    render: user => <Badge variant={user.status === 'Active' ? 'success' : 'default'}>
          {user.status}
        </Badge>
  }, {
    key: 'modulesAssigned',
    label: 'Modules',
    render: user => <span className="text-sm text-gray-600">{getModuleLabel(user)}</span>
  }, {
    key: 'actions',
    label: 'Actions',
    render: user => <div className="flex items-center gap-1">
          {currentUser.role === 'Admin' && (
            <>
              <Button 
                variant="ghost" 
                size="xs" 
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedUser(user);
                  setShowActivityModal(true);
                }} 
                title="View Activity"
              >
                <ActivityIcon className="w-3 h-3" />
              </Button>
              <Button 
                variant="secondary" 
                size="xs" 
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate('edit-user', user.id);
                }}
              >
                <EditIcon className="w-3 h-3" />
                Edit
              </Button>
              <Button 
                variant="ghost" 
                size="xs" 
                onClick={(e) => {
                  e.stopPropagation();
                  onCopyCredentials(user);
                }} 
                title="Copy Credentials"
              >
                <KeyRoundIcon className="w-3 h-3" />
              </Button>
              {user.role !== 'Admin' && (
                <>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleUserStatus(user.id);
                    }}
                    title={user.status === 'Active' ? 'Deactivate User' : 'Activate User'}
                  >
                    {user.status === 'Active' ? (
                      <span className="w-3 h-3 text-orange-600">🚫</span>
                    ) : (
                      <span className="w-3 h-3 text-green-600">✓</span>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}?`)) {
                        onDeleteUser(user.id);
                      }
                    }}
                    title="Delete User"
                  >
                    <TrashIcon className="w-3 h-3 text-red-600" />
                  </Button>
                </>
              )}
            </>
          )}
          {currentUser.role !== 'Admin' && (
            <span className="text-xs text-gray-500">Admin only</span>
          )}
        </div>
  }];
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-gray">Users</h1>
          <p className="text-gray-600 mt-1">
            Manage system users and permissions
          </p>
        </div>
        {currentUser.role === 'Admin' && (
          <Button variant="primary" onClick={() => onOpenModal('create-user')}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Create User
          </Button>
        )}
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search users..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-dark-gray">All Users</h3>
          <ExportButton onExport={handleExport} />
        </div>
        <Table
          columns={columns}
          data={filteredUsers}
          defaultSortKey="createdAt"
          onRowClick={(user) => {
            setSelectedUser(user);
            setShowActivityModal(true);
          }}
        />
      </Card>

      <UserActivityModal 
        isOpen={showActivityModal}
        onClose={() => {
          setShowActivityModal(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        activityLog={activityLog}
      />
    </div>;
}
