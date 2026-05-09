import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { PhoneInput } from '../components/ui/PhoneInput';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { User } from '../types';
import { UserIcon, MailIcon, PhoneIcon, MapPinIcon, UploadIcon, SaveIcon, KeyIcon, ShieldCheckIcon, AlertTriangle as ExclamationTriangleIcon, Building2, Lock as LockClosedIcon, CreditCard as CreditCardIcon } from 'lucide-react';

interface MyAccountProps {
  currentUser: User;
  onUpdateProfile: (data: Partial<User>) => void;
  countries: string[];
}

export function MyAccount({ currentUser, onUpdateProfile, countries }: MyAccountProps) {
  const isRestrictedUser = currentUser.role === 'Staff' || currentUser.role === 'Approver' || currentUser.role === 'Store Manager';

  // Move all hooks to the top level to comply with React Rules of Hooks
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showCloseAccountModal, setShowCloseAccountModal] = useState(false);

  const [formData, setFormData] = useState({
    firstName: currentUser.firstName,
    lastName: currentUser.lastName,
    email: currentUser.email,
    phone: currentUser.phone,
    country: currentUser.country,
    profileImage: currentUser.profileImage || '',
    // Company KYC
    companyName: currentUser.companyName || '',
    companyLogo: currentUser.companyLogo || '',
    companyRegistrationCert: currentUser.companyRegistrationCert || '',
    companyKraPin: currentUser.companyKraPin || '',
    companyCountry: currentUser.companyCountry || '',
    companyAddress: currentUser.companyAddress || '',
    companyPhone: currentUser.companyPhone || '',
    companyOfficialEmail: currentUser.companyOfficialEmail || '',
    companyOfficeAddress: currentUser.companyOfficeAddress || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }
    // In production, this would call an API
    console.log('Password changed');
    setShowChangePasswordModal(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    alert('Password changed successfully!');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profileImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onUpdateProfile(formData);
    setIsEditing(false);
  };

  const handleEnable2FA = () => {
    // In production, this would call an API
    console.log('2FA enabled');
    setShow2FAModal(false);
    alert('Two-factor authentication enabled!');
  };

  const handleCloseAccount = () => {
    // In production, this would call an API
    if (confirm('Are you sure you want to close your account? This action cannot be undone.')) {
      console.log('Account closed');
      setShowCloseAccountModal(false);
      alert('Account closure request submitted.');
    }
  };

  // For restricted users (Staff and Approver), only show basic user information without edit functionality
  if (isRestrictedUser) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
            <p className="text-gray-600 mt-1">View your profile information</p>
          </div>
          <Badge variant={currentUser.status === 'Active' ? 'success' : 'error'}>
            {currentUser.status}
          </Badge>
        </div>

        {/* Profile Overview */}
        <Card>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                {currentUser.profileImage ? (
                  <img
                    src={currentUser.profileImage}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserIcon className="w-10 h-10 text-primary" />
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {currentUser.firstName} {currentUser.lastName}
                </h2>
                <p className="text-gray-600">{currentUser.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="primary">{currentUser.role}</Badge>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Personal Information */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <UserIcon className="w-5 h-5 mr-2 text-primary" />
            Personal Information
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <UserIcon className="w-4 h-4 mr-2 text-gray-500" />
                First Name
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-gray-900">{currentUser.firstName}</p>
              </div>
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <UserIcon className="w-4 h-4 mr-2 text-gray-500" />
                Last Name
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-gray-900">{currentUser.lastName}</p>
              </div>
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <MailIcon className="w-4 h-4 mr-2 text-gray-500" />
                Email
              </label>
              <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg">
                <p className="text-gray-900">{currentUser.email}</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <PhoneIcon className="w-4 h-4 mr-2 text-gray-500" />
                Phone
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-gray-900">{currentUser.phone}</p>
              </div>
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <MapPinIcon className="w-4 h-4 mr-2 text-gray-500" />
                Country
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-gray-900">{currentUser.country}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Role
              </label>
              <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg">
                <p className="text-gray-900">{currentUser.role}</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">Assigned by admin</p>
            </div>
          </div>
        </Card>

        {/* Security Settings for Staff */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <ShieldCheckIcon className="w-5 h-5 mr-2 text-primary" />
            Security Settings
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center">
                <LockClosedIcon className="w-5 h-5 mr-3 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Change Password</p>
                  <p className="text-sm text-gray-600">Update your password regularly to keep your account secure</p>
                </div>
              </div>
              <Button variant="secondary" onClick={() => setShowChangePasswordModal(true)}>
                Change
              </Button>
            </div>
          </div>
        </Card>

        {/* Change Password Modal for Staff */}
        {showChangePasswordModal && (
          <Modal isOpen={showChangePasswordModal} onClose={() => setShowChangePasswordModal(false)} title="Change Password">
            <div className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="border-gray-300"
              />
              <Input
                label="New Password"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="border-gray-300"
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="border-gray-300"
              />
              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="secondary" onClick={() => setShowChangePasswordModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleChangePassword}>
                  Change Password
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
          <p className="text-gray-600 mt-1">Manage your profile and account settings</p>
        </div>
        <Badge variant={currentUser.status === 'Active' ? 'success' : 'error'}>
          {currentUser.status}
        </Badge>
      </div>

      {/* Profile Overview */}
      <Card>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              {formData.profileImage ? (
                <img
                  src={formData.profileImage}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserIcon className="w-10 h-10 text-primary" />
                </div>
              )}
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full cursor-pointer hover:bg-primary/90">
                  <UploadIcon className="w-3 h-3" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {currentUser.firstName} {currentUser.lastName}
              </h2>
              <p className="text-gray-600">{currentUser.email}</p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="primary">{currentUser.role}</Badge>
                {currentUser.isAdmin && <Badge variant="warning">Admin</Badge>}
              </div>
            </div>
          </div>
          <div>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                <SaveIcon className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button variant="secondary" onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    firstName: currentUser.firstName,
                    lastName: currentUser.lastName,
                    email: currentUser.email,
                    phone: currentUser.phone,
                    country: currentUser.country,
                    profileImage: currentUser.profileImage || '',
                    companyName: currentUser.companyName || '',
                    companyLogo: currentUser.companyLogo || '',
                    companyRegistrationCert: currentUser.companyRegistrationCert || '',
                    companyKraPin: currentUser.companyKraPin || '',
                    companyCountry: currentUser.companyCountry || '',
                    companyAddress: currentUser.companyAddress || '',
                    companyPhone: currentUser.companyPhone || '',
                    companyOfficialEmail: currentUser.companyOfficialEmail || '',
                    companyOfficeAddress: currentUser.companyOfficeAddress || ''
                  });
                }}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <SaveIcon className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Personal Information */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <UserIcon className="w-5 h-5 mr-2 text-primary" />
          Personal Information
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <UserIcon className="w-4 h-4 mr-2 text-gray-500" />
              First Name
            </label>
            {isEditing ? (
              <Input
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="border-gray-300"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-gray-900">{currentUser.firstName}</p>
              </div>
            )}
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <UserIcon className="w-4 h-4 mr-2 text-gray-500" />
              Last Name
            </label>
            {isEditing ? (
              <Input
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="border-gray-300"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-gray-900">{currentUser.lastName}</p>
              </div>
            )}
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <MailIcon className="w-4 h-4 mr-2 text-gray-500" />
              Email
            </label>
            <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg">
              <p className="text-gray-900">{currentUser.email}</p>
            </div>
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <PhoneIcon className="w-4 h-4 mr-2 text-gray-500" />
              Phone
            </label>
            {isEditing ? (
              <PhoneInput
                value={formData.phone}
                onChange={(value) => setFormData({ ...formData, phone: value })}
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-gray-900">{currentUser.phone}</p>
              </div>
            )}
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <MapPinIcon className="w-4 h-4 mr-2 text-gray-500" />
              Country
            </label>
            {isEditing ? (
              <Select
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                options={countries.map(c => ({ value: c, label: c }))}
                className="border-gray-300"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-gray-900">{currentUser.country}</p>
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Role
            </label>
            <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg">
              <p className="text-gray-900">{currentUser.role}</p>
            </div>
            <p className="text-xs text-gray-500 mt-1">Assigned by admin</p>
          </div>
        </div>
      </Card>

      {/* Company Information */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <Building2 className="w-5 h-5 mr-2 text-primary" />
          Company Information
          {!currentUser.isAdmin && (
            <span className="ml-auto text-xs text-gray-500 font-normal">Only admin can edit</span>
          )}
        </h3>

        {!currentUser.isAdmin && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              Only the account administrator can edit company information
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Company Name
            </label>
            {isEditing && currentUser.isAdmin ? (
              <Input
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="border-gray-300"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-gray-900">{currentUser.companyName || 'Not set'}</p>
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Company Logo
            </label>
            {isEditing && currentUser.isAdmin ? (
              <div className="space-y-2">
                {formData.companyLogo && (
                  <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                    <img src={formData.companyLogo} alt="Company Logo" className="h-12 w-auto object-contain" />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, companyLogo: '' })}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData({ ...formData, companyLogo: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="border-gray-300"
                />
                <p className="text-xs text-gray-500">Upload your company logo (PNG, JPG, or SVG)</p>
              </div>
            ) : (
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                {currentUser.companyLogo ? (
                  <img src={currentUser.companyLogo} alt="Company Logo" className="h-12 w-auto object-contain" />
                ) : (
                  <p className="text-gray-900">Not set</p>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              KRA PIN
            </label>
            {isEditing && currentUser.isAdmin ? (
              <Input
                value={formData.companyKraPin}
                onChange={(e) => setFormData({ ...formData, companyKraPin: e.target.value })}
                placeholder="A000000000Z"
                className="border-gray-300"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-gray-900">{currentUser.companyKraPin || 'Not set'}</p>
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Company Country
            </label>
            {isEditing && currentUser.isAdmin ? (
              <Select
                value={formData.companyCountry}
                onChange={(e) => setFormData({ ...formData, companyCountry: e.target.value })}
                options={countries.map(c => ({ value: c, label: c }))}
                className="border-gray-300"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-gray-900">{currentUser.companyCountry || 'Not set'}</p>
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Registration Certificate
            </label>
            {isEditing && currentUser.isAdmin ? (
              <Input
                value={formData.companyRegistrationCert}
                onChange={(e) => setFormData({ ...formData, companyRegistrationCert: e.target.value })}
                className="border-gray-300"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-gray-900">{currentUser.companyRegistrationCert || 'Not set'}</p>
              </div>
            )}
          </div>

          <div className="col-span-2">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Company Address
            </label>
            {isEditing && currentUser.isAdmin ? (
              <Input
                value={formData.companyAddress}
                onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                className="border-gray-300"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-gray-900">{currentUser.companyAddress || 'Not set'}</p>
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Company Contact Phone
            </label>
            {isEditing && currentUser.isAdmin ? (
              <Input
                type="tel"
                value={formData.companyPhone}
                onChange={(e) => setFormData({ ...formData, companyPhone: e.target.value })}
                placeholder="+254 700 000 000"
                className="border-gray-300"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-gray-900">{currentUser.companyPhone || 'Not set'}</p>
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Company Official Email
            </label>
            {isEditing && currentUser.isAdmin ? (
              <Input
                type="email"
                value={formData.companyOfficialEmail}
                onChange={(e) => setFormData({ ...formData, companyOfficialEmail: e.target.value })}
                placeholder="info@company.com"
                className="border-gray-300"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-gray-900">{currentUser.companyOfficialEmail || 'Not set'}</p>
              </div>
            )}
          </div>

          <div className="col-span-2">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Company Office Address
            </label>
            {isEditing && currentUser.isAdmin ? (
              <Input
                value={formData.companyOfficeAddress}
                onChange={(e) => setFormData({ ...formData, companyOfficeAddress: e.target.value })}
                placeholder="Enter company office address"
                className="border-gray-300"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-gray-900">{currentUser.companyOfficeAddress || 'Not set'}</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Spendy Account Details */}
      {currentUser.isAdmin && currentUser.spendyAccountNumber && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <CreditCardIcon className="w-5 h-5 mr-2 text-primary" />
            Spendy Account Details
          </h3>

          <div className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/20 rounded-xl">
            <p className="text-sm text-gray-600 mb-4">
              Share these details to receive payments from other Spendy accounts or via M-Pesa Paybill
            </p>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-2 block uppercase tracking-wide">
                  Paybill Number
                </label>
                <div className="px-4 py-3 bg-white border-2 border-primary/30 rounded-lg">
                  <p className="text-2xl font-bold text-primary tracking-wider">
                    {currentUser.spendyPaybillNumber || '247247'}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-2 block uppercase tracking-wide">
                  Account Number
                </label>
                <div className="px-4 py-3 bg-white border-2 border-secondary/30 rounded-lg">
                  <p className="text-2xl font-bold text-secondary tracking-wider">
                    {currentUser.spendyAccountNumber}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>How to receive payments:</strong>
              </p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1 ml-4 list-disc">
                <li>M-Pesa Paybill: Go to M-Pesa → Lipa na M-Pesa → Paybill → Enter {currentUser.spendyPaybillNumber || '247247'} → Account: {currentUser.spendyAccountNumber}</li>
                <li>Spendy Account: Other Spendy users can send money directly using your account number</li>
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Security Settings */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <ShieldCheckIcon className="w-5 h-5 mr-2 text-primary" />
          Security Settings
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center">
              <LockClosedIcon className="w-5 h-5 mr-3 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Change Password</p>
                <p className="text-sm text-gray-600">Update your password regularly to keep your account secure</p>
              </div>
            </div>
            <Button variant="secondary" onClick={() => setShowChangePasswordModal(true)}>
              Change
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center">
              <KeyIcon className="w-5 h-5 mr-3 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
              </div>
            </div>
            <Button variant="secondary" onClick={() => setShow2FAModal(true)}>
              Enable
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 mr-3 text-red-600" />
              <div>
                <p className="font-medium text-red-900">Close Account</p>
                <p className="text-sm text-red-700">Permanently delete your account and all associated data</p>
              </div>
            </div>
            <Button variant="danger" onClick={() => setShowCloseAccountModal(true)}>
              Close
            </Button>
          </div>
        </div>
      </Card>

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <Modal isOpen={showChangePasswordModal} onClose={() => setShowChangePasswordModal(false)} title="Change Password">
          <div className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              className="border-gray-300"
            />
            <Input
              label="New Password"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              helperText="Minimum 8 characters"
              className="border-gray-300"
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              className="border-gray-300"
            />
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="secondary" onClick={() => setShowChangePasswordModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleChangePassword}>
                Change Password
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Enable 2FA Modal */}
      {show2FAModal && (
        <Modal isOpen={show2FAModal} onClose={() => setShow2FAModal(false)} title="Enable Two-Factor Authentication">
          <div className="space-y-4">
            <p className="text-gray-600">
              Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </p>
            <div className="flex justify-center p-6 bg-gray-100 border border-gray-200 rounded-lg">
              <div className="w-48 h-48 bg-white flex items-center justify-center border-2 border-gray-300 rounded-lg">
                <p className="text-gray-400">QR Code Placeholder</p>
              </div>
            </div>
            <Input
              label="Enter Verification Code"
              placeholder="000000"
              className="border-gray-300"
            />
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="secondary" onClick={() => setShow2FAModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleEnable2FA}>
                Enable 2FA
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Close Account Modal */}
      {showCloseAccountModal && (
        <Modal isOpen={showCloseAccountModal} onClose={() => setShowCloseAccountModal(false)} title="Close Account">
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="font-medium text-red-800 mb-2">Warning: This action cannot be undone!</p>
              <p className="text-sm text-red-700">
                Closing your account will permanently delete all your data, including:
              </p>
              <ul className="list-disc list-inside text-sm text-red-700 mt-2 ml-2">
                <li>Profile information</li>
                <li>Events and activations</li>
                <li>Financial records</li>
                <li>All associated data</li>
              </ul>
            </div>
            <Input
              label='Type "DELETE" to confirm'
              placeholder="DELETE"
              className="border-gray-300"
            />
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="secondary" onClick={() => setShowCloseAccountModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleCloseAccount}>
                Close My Account
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
