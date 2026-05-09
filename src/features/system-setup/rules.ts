import type { CategoryType, Client, SystemItem } from './types';

export function mapModalTypeToCategoryType(modalType: string): CategoryType | null {
  if (modalType === 'event-category') return 'event';
  if (modalType === 'activation-category') return 'activation';
  if (modalType === 'expense-category') return 'expense';
  if (modalType === 'operation-category') return 'operation';
  if (modalType === 'supplier-category') return 'supplier';
  if (modalType === 'inventory-category') return 'inventory';
  return null;
}

export function filterSystemItems<T extends SystemItem | Client>(
  data: T[],
  searchTerm: string,
  type = 'default',
): T[] {
  const normalizedSearch = searchTerm.trim().toLowerCase();
  if (!normalizedSearch) return data;

  if (type === 'client') {
    return data.filter(item => {
      const client = item as Client;
      return (
        client.name.toLowerCase().includes(normalizedSearch) ||
        (client.contactPerson || '').toLowerCase().includes(normalizedSearch) ||
        (client.email || '').toLowerCase().includes(normalizedSearch) ||
        (client.brands || []).some(brand => brand.toLowerCase().includes(normalizedSearch))
      );
    });
  }

  return data.filter(item => item.name.toLowerCase().includes(normalizedSearch));
}

export function addBrand(brands: string[], brand: string): string[] {
  const trimmed = brand.trim();
  if (!trimmed || brands.includes(trimmed)) return brands;
  return [...brands, trimmed];
}

export function removeBrand(brands: string[], brand: string): string[] {
  return brands.filter(existingBrand => existingBrand !== brand);
}
