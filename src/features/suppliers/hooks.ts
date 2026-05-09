import { useMemo } from 'react';
import { Supplier, SupplierStats } from './types';
import { filterSuppliers, getSupplierCategories, getActiveSuppliers } from './api';

export function useSupplierFilters(
  suppliers: Supplier[],
  searchTerm: string,
  statusFilter: string
) {
  return useMemo(() => {
    return filterSuppliers(suppliers, searchTerm, statusFilter);
  }, [suppliers, searchTerm, statusFilter]);
}

export function useSupplierStats(suppliers: Supplier[]): SupplierStats {
  return useMemo(() => {
    const total = suppliers.length;
    const active = suppliers.filter(s => s.status === 'Active').length;
    const inactive = suppliers.filter(s => s.status === 'Inactive').length;
    const blacklisted = suppliers.filter(s => s.status === 'Blacklisted').length;
    const categories = getSupplierCategories(suppliers);

    return {
      total,
      active,
      inactive,
      blacklisted,
      categories
    };
  }, [suppliers]);
}

export function useSuppliersByCategory(suppliers: Supplier[]) {
  return useMemo(() => {
    const categories = getSupplierCategories(suppliers);
    return categories.reduce((acc, category) => {
      acc[category] = suppliers.filter(s => s.category === category);
      return acc;
    }, {} as Record<string, Supplier[]>);
  }, [suppliers]);
}
