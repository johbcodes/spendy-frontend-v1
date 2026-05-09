import { Supplier } from './types';

export function filterSuppliers(
  suppliers: Supplier[],
  searchTerm: string,
  statusFilter: string
): Supplier[] {
  return suppliers.filter(supplier => {
    const matchesSearch = 
      supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      supplier.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });
}

export function getSuppliersByCategory(suppliers: Supplier[], category: string): Supplier[] {
  return suppliers.filter(s => s.category === category);
}

export function getActiveSuppliers(suppliers: Supplier[]): Supplier[] {
  return suppliers.filter(s => s.status === 'Active');
}

export function getSupplierCategories(suppliers: Supplier[]): string[] {
  return Array.from(new Set(suppliers.map(s => s.category).filter(Boolean))) as string[];
}

export function createSupplier(data: Partial<Supplier>): Supplier {
  return {
    id: crypto.randomUUID(),
    name: data.name || '',
    category: data.category || '',
    contactPerson: data.contactPerson || '',
    phone: data.phone || '',
    email: data.email || '',
    status: data.status || 'Active',
    documents: data.documents || [],
    ...data
  } as Supplier;
}

export function updateSupplier(supplier: Supplier, updates: Partial<Supplier>): Supplier {
  return {
    ...supplier,
    ...updates
  };
}
