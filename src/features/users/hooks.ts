import { useMemo } from 'react';
import { User, UserStats, UserRole } from './types';
import { filterUsers, getActiveUsers } from './api';

export function useUserFilters(
  users: User[],
  searchTerm: string,
  roleFilter?: string,
  statusFilter?: string
) {
  return useMemo(() => {
    return filterUsers(users, searchTerm, roleFilter, statusFilter);
  }, [users, searchTerm, roleFilter, statusFilter]);
}

export function useUserStats(users: User[]): UserStats {
  return useMemo(() => {
    const total = users.length;
    const active = users.filter(u => u.status === 'Active').length;
    const inactive = users.filter(u => u.status === 'Inactive').length;
    
    const byRole: Record<UserRole, number> = {
      'Admin': users.filter(u => u.role === 'Admin').length,
      'Approver': users.filter(u => u.role === 'Approver').length,
      'Staff': users.filter(u => u.role === 'Staff').length,
      'Store Manager': users.filter(u => u.role === 'Store Manager').length
    };

    return {
      total,
      active,
      inactive,
      byRole
    };
  }, [users]);
}

export function useUsersByRole(users: User[]) {
  return useMemo(() => {
    return {
      admins: users.filter(u => u.role === 'Admin'),
      approvers: users.filter(u => u.role === 'Approver'),
      staff: users.filter(u => u.role === 'Staff'),
      storeManagers: users.filter(u => u.role === 'Store Manager')
    };
  }, [users]);
}
