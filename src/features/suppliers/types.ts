import { Supplier } from '../../types';

export interface SupplierFilters {
  searchTerm: string;
  statusFilter: 'all' | 'active' | 'inactive' | 'blacklisted';
  categoryFilter?: string;
}

export interface SupplierStats {
  total: number;
  active: number;
  inactive: number;
  blacklisted: number;
  categories: string[];
}

export { Supplier };
