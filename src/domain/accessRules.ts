import type { UserModule, UserRole } from '../types';

const ROLE_MODULES: Record<UserRole, UserModule[]> = {
  Admin: ['All'],
  Approver: ['Events', 'Approvals'],
  Staff: ['Expenses', 'Payments'],
  'Store Manager': ['Inventory', 'Expenses'],
};

export function getDefaultModulesForRole(role: UserRole): UserModule[] {
  return [...ROLE_MODULES[role]];
}

export function canAccessModule(role: UserRole, module: UserModule, assignedModules: UserModule[] = ROLE_MODULES[role]): boolean {
  return role === 'Admin' || assignedModules.includes('All') || assignedModules.includes(module);
}
