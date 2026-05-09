import { User, UserRole, UserModule } from './types';

export function canDeleteUser(user: User, currentUser: User): boolean {
  // Can't delete yourself
  if (user.id === currentUser.id) return false;
  
  // Can't delete admin users
  if (user.role === 'Admin') return false;
  
  // Only admins can delete users
  return currentUser.role === 'Admin';
}

export function canEditUser(user: User, currentUser: User): boolean {
  // Admins can edit anyone except themselves (role change)
  if (currentUser.role === 'Admin') return true;
  
  // Users can only edit themselves
  return user.id === currentUser.id;
}

export function canToggleUserStatus(user: User, currentUser: User): boolean {
  // Can't toggle your own status
  if (user.id === currentUser.id) return false;
  
  // Can't toggle admin status
  if (user.role === 'Admin') return false;
  
  // Only admins can toggle status
  return currentUser.role === 'Admin';
}

export function getRoleVariant(role: UserRole): 'success' | 'warning' | 'danger' | 'info' | 'default' {
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
}

export function getModuleLabel(user: User, allModules: UserModule[]): string {
  const hasAll = user.modulesAssigned.includes('All') || user.role === 'Admin';
  const count = hasAll ? allModules.length : user.modulesAssigned.length;
  return hasAll ? `${count} modules (All)` : `${count} modules`;
}

export function validateUserData(data: Partial<User>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.firstName || data.firstName.trim().length === 0) {
    errors.push('First name is required');
  }

  if (!data.lastName || data.lastName.trim().length === 0) {
    errors.push('Last name is required');
  }

  if (!data.email || data.email.trim().length === 0) {
    errors.push('Email is required');
  } else if (!isValidEmail(data.email)) {
    errors.push('Invalid email address');
  }

  if (!data.phone || data.phone.trim().length === 0) {
    errors.push('Phone number is required');
  }

  if (!data.role) {
    errors.push('Role is required');
  }

  if (!data.modulesAssigned || data.modulesAssigned.length === 0) {
    errors.push('At least one module must be assigned');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function getDefaultModulesForRole(role: UserRole): UserModule[] {
  switch (role) {
    case 'Admin':
      return ['All'];
    case 'Staff':
      return ['Expenses', 'Payments'];
    case 'Store Manager':
      return ['Inventory', 'Expenses'];
    case 'Approver':
      return ['Events', 'Approvals'];
    default:
      return [];
  }
}

export function hasModuleAccess(user: User, module: UserModule): boolean {
  if (user.role === 'Admin') return true;
  if (user.modulesAssigned.includes('All')) return true;
  return user.modulesAssigned.includes(module);
}

export function isUserActive(user: User): boolean {
  return user.status === 'Active';
}

export function getUserFullName(user: User): string {
  return `${user.firstName} ${user.lastName}`;
}
