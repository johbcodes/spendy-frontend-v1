import { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { PhoneInput } from '../../../components/ui/PhoneInput';
import { Badge } from '../../../components/ui/Badge';
import { User, UserRole, UserModule, Wallet } from '../../../types';
import { MODULES } from '../../../utils/constants';
import { ChevronLeftIcon, WalletIcon } from 'lucide-react';
import { formatCurrency } from '../../../utils/currency';

interface EditUserProps {
  onNavigate: (page: string, id?: string) => void;
  onSaveUser: (user: User) => void;
  user: User | null;
  wallets?: Wallet[];
}

export function EditUser({
  onNavigate,
  onSaveUser,
  user,
  wallets
}: EditUserProps) {
  const [formData, setFormData] = useState<User>(user || {
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    role: 'Staff',
    status: 'Active',
    modulesAssigned: [],
    createdAt: new Date().toISOString()
  });

  const [selectedModules, setSelectedModules] = useState<UserModule[]>(
    (user?.role === 'Admin' ? (MODULES as UserModule[]) : (user?.modulesAssigned || []))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      return;
    }

    if (formData.role !== 'Admin' && selectedModules.length === 0) {
      return;
    }

    const updatedUser: User = {
      ...formData,
      modulesAssigned: formData.role === 'Admin' ? (['All'] as UserModule[]) : (selectedModules as UserModule[])
    };

    onSaveUser(updatedUser);
    onNavigate('users');
  };

  const handleModuleToggle = (module: UserModule) => {
    setSelectedModules(prev =>
      prev.includes(module)
        ? prev.filter(m => m !== module)
        : [...prev, module]
    );
  };

  const isAdminUser = formData.role === 'Admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate('users')}
          className="p-0"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-dark-gray">Edit User</h1>
          <p className="text-gray-600 mt-1">Update user information and permissions</p>
        </div>
      </div>

      {/* Main Form */}
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="font-semibold text-dark-gray mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
              <Input
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <PhoneInput
                label="Phone"
                value={formData.phone}
                onChange={(value) => setFormData({ ...formData, phone: value })}
                required
              />
              <Select
                label="Country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                options={[
                  { value: '', label: 'Select country' },
                  { value: 'Kenya', label: 'Kenya' },
                  { value: 'Uganda', label: 'Uganda' },
                  { value: 'Tanzania', label: 'Tanzania' },
                  { value: 'Rwanda', label: 'Rwanda' },
                  { value: 'Burundi', label: 'Burundi' },
                  { value: 'South Sudan', label: 'South Sudan' },
                  { value: 'Ethiopia', label: 'Ethiopia' },
                  { value: 'Somalia', label: 'Somalia' }
                ]}
                required
              />
              <Select
                label="Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })}
                options={[
                  { value: 'Active', label: 'Active' },
                  { value: 'Inactive', label: 'Inactive' }
                ]}
                required
              />
            </div>
          </div>

          {/* Activity Information */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-dark-gray mb-4">Activity Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Member Since</p>
                <p className="font-semibold text-dark-gray">
                  {formData.createdAt ? (() => {
                    const date = new Date(formData.createdAt);
                    // Convert to Nairobi timezone (UTC+3)
                    const nairobiTime = new Date(date.getTime() + (3 * 60 * 60 * 1000));
                    // Format date as dd/mm/year with short month name
                    const day = nairobiTime.getDate().toString().padStart(2, '0');
                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    const month = monthNames[nairobiTime.getMonth()];
                    const year = nairobiTime.getFullYear();
                    return `${day}/${month}/${year}`;
                  })() : 'N/A'}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Last Login</p>
                <p className="font-semibold text-dark-gray">
                  {formData.lastLogin ? (() => {
                    const date = new Date(formData.lastLogin);
                    // Convert to Nairobi timezone (UTC+3)
                    const nairobiTime = new Date(date.getTime() + (3 * 60 * 60 * 1000));
                    // Format date as dd/mm/year with short month name
                    const day = nairobiTime.getDate().toString().padStart(2, '0');
                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    const month = monthNames[nairobiTime.getMonth()];
                    const year = nairobiTime.getFullYear();
                    return `${day}/${month}/${year}`;
                  })() : 'Never'}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Total Logins</p>
                <p className="font-semibold text-dark-gray">
                  {formData.loginCount || 0}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Activity Count</p>
                <p className="font-semibold text-dark-gray">
                  {formData.activityCount || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Role & Permissions */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-dark-gray mb-4">Role & Permissions</h3>
            <Select
              label="User Role"
              value={formData.role}
              onChange={(e) => {
                const newRole = e.target.value as UserRole;
                setFormData({ ...formData, role: newRole });
                // Auto-set modules for Admin
                if (newRole === 'Admin') {
                  setSelectedModules(MODULES as UserModule[]);
                } else {
                  setSelectedModules([]);
                }
              }}
              options={[
                { value: 'Admin', label: 'Admin' },
                { value: 'Approver', label: 'Approver' },
                { value: 'Staff', label: 'Staff' }
              ]}
              required
            />

            {/* Assigned Modules Display */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-dark-gray mb-3">
                Assigned Modules
              </label>
              {isAdminUser ? (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900 mb-2">
                    <strong>Admin</strong> has access to all modules and features:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="danger">All Modules ({MODULES.length})</Badge>
                  </div>
                </div>
              ) : (
                <div>
                  {selectedModules.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedModules.map(module => (
                        <Badge key={module} variant="info">
                          {module}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-sm text-gray-600">No modules assigned yet</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Module Assignment */}
            {!isAdminUser && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-dark-gray mb-4">
                  Assign Modules
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {(MODULES as UserModule[]).map(module => (
                    <label
                      key={module}
                      className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-blue-50 cursor-pointer transition"
                    >
                      <input
                        type="checkbox"
                        checked={selectedModules.includes(module)}
                        onChange={() => handleModuleToggle(module)}
                        className="rounded"
                      />
                      <span className="ml-2 text-sm text-dark-gray">{module}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {isAdminUser && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Admin users</strong> have access to all modules and features in the system.
                </p>
              </div>
            )}

            {/* Selected Modules Summary */}
            {!isAdminUser && selectedModules.length > 0 && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-dark-gray mb-3">
                  Selected Modules ({selectedModules.length})

                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedModules.map(module => (
                    <Badge key={module} variant="info">
                      {module}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Wallet Information - Only show for non-admin users */}
          {!isAdminUser && (
            <div className="border-t pt-6">
              <h3 className="font-semibold text-dark-gray mb-4 flex items-center">
                <WalletIcon className="w-5 h-5 mr-2 text-primary" />
                Assigned Wallet
              </h3>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium text-green-900">
                      Personal Wallet Assigned
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      A dedicated wallet has been automatically created for this user and cannot be edited or removed.
                    </p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-full">
                    <WalletIcon className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="bg-white p-3 rounded border">
                    <p className="text-xs text-gray-600">Wallet Name</p>
                    <p className="font-semibold text-dark-gray">
                      {(() => {
                        switch (formData.role) {
                          case 'Staff':
                            return 'STAFF WALLET';
                          case 'Approver':
                            return 'APPROVER WALLET';
                          case 'Store Manager':
                            return 'STORE MANAGER WALLET';
                          default:
                            return `${formData.firstName} ${formData.lastName}'s Wallet`;
                        }
                      })()}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <p className="text-xs text-gray-600">Wallet Type</p>
                    <p className="font-semibold text-dark-gray">USER</p>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <p className="text-xs text-gray-600">Status</p>
                    <Badge variant="success" className="mt-1">Active</Badge>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-white rounded border">
                  <p className="text-xs text-gray-600 mb-1">Current Balance</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(wallets?.find(w => w.ownerId === formData.id && w.type === 'USER')?.balance || 0)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Available funds for expenses and payments
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="border-t pt-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onNavigate('users')}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
