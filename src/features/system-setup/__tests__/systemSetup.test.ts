import { describe, expect, it } from 'vitest';
import {
  addBrand,
  filterSystemItems,
  mapCategoryToSystemItem,
  mapClientToSystemItem,
  mapModalTypeToCategoryType,
  removeBrand,
  validateCategoryName,
  validateClientForm,
} from '..';

describe('system setup feature', () => {
  it('maps modal ids to category types', () => {
    expect(mapModalTypeToCategoryType('event-category')).toBe('event');
    expect(mapModalTypeToCategoryType('inventory-category')).toBe('inventory');
    expect(mapModalTypeToCategoryType('client')).toBeNull();
  });

  it('filters categories and clients', () => {
    expect(filterSystemItems([{ id: '1', name: 'Logistics' }], 'log')).toHaveLength(1);
    expect(filterSystemItems([
      {
        id: 'client-1',
        itemNumber: 'C-1',
        name: 'Client',
        contactPerson: 'Jane Doe',
        email: 'jane@example.com',
        phone: '',
        brands: ['Brand A'],
        status: 'Active',
        companyId: 'company',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    ], 'brand a', 'client')).toHaveLength(1);
  });

  it('normalizes date fields for display', () => {
    expect(mapCategoryToSystemItem({
      id: 'cat-1',
      name: 'Event',
      companyId: 'company',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-02',
    }).dateCreated).toBe('2024-01-01');

    expect(mapClientToSystemItem({
      id: 'client-1',
      itemNumber: 'C-1',
      name: 'Client',
      status: 'Active',
      companyId: 'company',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-02',
    }).dateCreated).toBe('2024-01-01');
  });

  it('manages brand lists without duplicates', () => {
    expect(addBrand(['A'], 'A')).toEqual(['A']);
    expect(addBrand(['A'], 'B')).toEqual(['A', 'B']);
    expect(removeBrand(['A', 'B'], 'A')).toEqual(['B']);
  });

  it('validates forms', () => {
    expect(validateCategoryName('')).toBe('Name is required');
    expect(validateClientForm({ name: 'Client' })).toContain('Contact person is required');
  });
});
