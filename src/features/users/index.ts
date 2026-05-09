// Pages
export { Users } from './pages/Users';
export { EditUser } from './pages/EditUser';

// Modals
export { CreateUserModal } from './modals/CreateUserModal';
export { UserActivityModal } from './modals/UserActivityModal';

// Hooks
export { useUserFilters, useUserStats, useUsersByRole } from './hooks';

// Rules
export {
  canDeleteUser,
  canEditUser,
  canToggleUserStatus,
  getRoleVariant,
  getModuleLabel,
  validateUserData,
  getDefaultModulesForRole,
  hasModuleAccess,
  isUserActive,
  getUserFullName
} from './rules';

// API
export {
  filterUsers,
  getUsersByRole,
  getActiveUsers,
  createUser,
  updateUser,
  toggleUserStatus
} from './api';

// Mappers
export {
  mapUserToExportData,
  mapUsersToExportData,
  mapUserToFormData,
  mapUserToCredentials
} from './mappers';

// Schemas
export {
  validateEmail,
  validatePhone,
  validatePassword,
  validateName
} from './schemas';

// Types
export type { UserFilters, UserStats, UserActivity } from './types';
