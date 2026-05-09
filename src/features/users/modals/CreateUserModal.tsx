import React, { useEffect, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { PhoneInput } from '../../../components/ui/PhoneInput';
import { COUNTRIES, MODULES } from '../../../utils/constants';
import { getDefaultModulesForRole } from '../../../utils/accessControl';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userData: any) => void;
  editUser?: any;
  wallets?: any[];
  currentUser?: any;
}
export function CreateUserModal({
  isOpen,
  onClose,
  onSuccess,
  editUser,
  wallets = [],
  currentUser
}: CreateUserModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: 'Kenya',
    password: '',
    role: 'Staff',
    status: 'Active',
    modulesAssigned: [] as string[]
  });
  useEffect(() => {
    if (isOpen) {
      if (editUser) {
        setFormData({
          firstName: editUser.firstName || '',
          lastName: editUser.lastName || '',
          email: editUser.email || '',
          phone: editUser.phone || '',
          country: editUser.country || 'Kenya',
          password: '',
          role: editUser.role || 'Staff',
          status: editUser.status || 'Active',
          modulesAssigned: editUser.role === 'Admin' ? MODULES : editUser.modulesAssigned || []
        });
      } else {
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          country: 'Kenya',
          password: '',
          role: 'Staff',
          status: 'Active',
          modulesAssigned: []
        });
      }
    }
  }, [editUser, isOpen]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const modulesAssigned = formData.role === 'Admin' ? ['All'] : formData.modulesAssigned;
    if (formData.role !== 'Admin' && modulesAssigned.length === 0) {
      return;
    }
    onSuccess({ ...formData, modulesAssigned });
  };

  const toggleModule = (module: string) => {
    setFormData(prev => ({
      ...prev,
      modulesAssigned: prev.modulesAssigned.includes(module) ? prev.modulesAssigned.filter(m => m !== module) : [...prev.modulesAssigned, module]
    }));
  };


  // Auto-select all modules when Admin role is selected
  const handleRoleChange = (role: string) => {
    setFormData(prev => ({
      ...prev,
      role: role,
      modulesAssigned: role === 'Admin' ? MODULES : prev.modulesAssigned
    }));
  };

  // Suggest default modules for the selected role
  const suggestDefaultModules = () => {
    const defaultModules = getDefaultModulesForRole(formData.role);
    setFormData(prev => ({
      ...prev,
      modulesAssigned: defaultModules
    }));
  };

  const USER_ROLES = ['Admin', 'Staff', 'Approver', 'Store Manager'];

  const handleClose = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      country: 'Kenya',
      password: '',
      role: 'Staff',
      status: 'Active',
      modulesAssigned: []
    });
    onClose();
  };
  
  return <Modal isOpen={isOpen} onClose={handleClose} title={editUser ? 'Edit User' : 'Create User'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="First Name" value={formData.firstName} onChange={e => setFormData({
          ...formData,
          firstName: e.target.value
        })} required />
          <Input label="Last Name" value={formData.lastName} onChange={e => setFormData({
          ...formData,
          lastName: e.target.value
        })} required />
        </div>

        <Input label="Email" type="email" value={formData.email} onChange={e => setFormData({
        ...formData,
        email: e.target.value
      })} required />

        <PhoneInput 
          label="Phone" 
          value={formData.phone} 
          onChange={value => setFormData({
            ...formData,
            phone: value
          })} 
          placeholder="7XXXXXXXX"
          required 
        />

        <Select label="Country" options={COUNTRIES.map(c => ({
        value: c,
        label: c
      }))} value={formData.country} onChange={e => setFormData({
        ...formData,
        country: e.target.value
      })} />

        {!editUser && <Input label="Password" type="password" value={formData.password} onChange={e => setFormData({
        ...formData,
        password: e.target.value
      })} helperText="Or auto-generate a secure password" required />}

        <Select label="Role" options={USER_ROLES.map(r => ({
        value: r,
        label: r
      }))} value={formData.role} onChange={e => handleRoleChange(e.target.value)} />

        <Select label="Status" options={[{
        value: 'Active',
        label: 'Active'
      }, {
        value: 'Inactive',
        label: 'Inactive'
      }]} value={formData.status} onChange={e => setFormData({
        ...formData,
        status: e.target.value
      })} />

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-dark-gray">
              Modules Assigned {formData.role === 'Admin' && <span className="text-xs text-gray-500">(All modules auto-selected for Admin)</span>}
            </label>
            {formData.role !== 'Admin' && (
              <Button type="button" variant="secondary" size="sm" onClick={suggestDefaultModules} className="text-xs">
                Suggest Default Modules
              </Button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {MODULES.map(module => <label key={module} className="flex items-center space-x-2">
                <input type="checkbox" checked={formData.modulesAssigned.includes(module)} onChange={() => toggleModule(module)} disabled={formData.role === 'Admin'} className="rounded disabled:opacity-50" />
                <span className="text-sm">{module}</span>
              </label>)}
          </div>
          {formData.role !== 'Admin' && formData.modulesAssigned.length === 0 && (
            <p className="text-xs text-red-600 mt-2">Please assign at least one module</p>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {editUser ? 'Update User' : 'Create & Send Credentials'}
          </Button>
        </div>
      </form>
    </Modal>;
}
