import { User, UserRole, UserModule, EventAccess } from '../../types';

export interface UserFilters {
  searchTerm: string;
  roleFilter?: UserRole | 'all';
  statusFilter?: 'Active' | 'Inactive' | 'all';
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  byRole: Record<UserRole, number>;
}

export interface UserActivity {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details?: string;
}

export { User, UserRole, UserModule, EventAccess };
