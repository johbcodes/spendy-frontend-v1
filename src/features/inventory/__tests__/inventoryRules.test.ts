import { describe, expect, it } from 'vitest';
import {
  applyInventoryCheckin,
  applyInventoryCheckout,
  applyInventoryMovementEdit,
  canCheckinInventory,
  canCheckoutInventory,
  createCheckinMovement,
  createCheckoutMovement,
  filterInventory,
  getAvailableQuantity,
  summarizeInventory,
  validateAllocationDates,
} from '../rules';
import type { InventoryItem } from '../types';

const inventory: InventoryItem[] = [
  {
    id: 'projector',
    name: 'Projector',
    description: 'HD projector',
    category: 'Electronics',
    quantity: 5,
    checkedOut: 2,
    checkedIn: 0,
    location: 'Store A',
    condition: 'Good',
    conditionCounts: { Excellent: 1, Good: 4, Fair: 0, Damaged: 0 },
    costPerItem: 20000,
    totalCost: 100000,
    rentalPrice: 3000,
    checkoutStatus: 'checked-out',
    totalInventoryAdded: 5,
  },
];

describe('inventory rules', () => {
  it('calculates available quantity from stock and checkouts', () => {
    expect(getAvailableQuantity(inventory[0])).toBe(3);
    expect(canCheckoutInventory(inventory[0], 3)).toBe(true);
    expect(canCheckoutInventory(inventory[0], 4)).toBe(false);
  });

  it('validates check-in quantities against checked-out stock', () => {
    expect(canCheckinInventory(2, 2)).toBe(true);
    expect(canCheckinInventory(2, 3)).toBe(false);
  });

  it('filters inventory by search and checkout state', () => {
    expect(filterInventory(inventory, { searchTerm: 'project', status: 'all' })).toHaveLength(1);
    expect(filterInventory(inventory, { searchTerm: 'speaker', status: 'all' })).toHaveLength(0);
    expect(filterInventory(inventory, { searchTerm: '', status: 'checked-out' })).toHaveLength(1);
  });

  it('summarizes inventory totals', () => {
    expect(summarizeInventory(inventory)).toMatchObject({
      totalItems: 5,
      totalValue: 100000,
      checkedOutItems: 1,
      conditionCounts: { Excellent: 1, Good: 4, Fair: 0, Damaged: 0 },
    });
  });

  it('validates allocation date order and past dates', () => {
    const now = new Date('2026-05-08T10:00:00.000Z');
    expect(validateAllocationDates('2026-05-09T10:00', '2026-05-10T10:00', now)).toBeNull();
    expect(validateAllocationDates('2026-05-07T10:00', '2026-05-10T10:00', now)).toBe('Start date cannot be in the past');
    expect(validateAllocationDates('2026-05-11T10:00', '2026-05-10T10:00', now)).toBe('End date must be after start date');
  });

  it('applies checkout state changes and creates a movement record', () => {
    const updated = applyInventoryCheckout(inventory[0], 2);
    expect(updated.quantity).toBe(3);
    expect(updated.checkedOut).toBe(4);
    expect(updated.checkoutStatus).toBe('checked-out');

    expect(createCheckoutMovement('m1', inventory[0], {
      itemId: 'projector',
      quantity: 2,
      event: 'Annual Gala',
      givenTo: 'Jane',
    })).toMatchObject({
      id: 'm1',
      type: 'Check Out',
      quantity: 2,
      event: 'Annual Gala',
      givenBy: 'Jane',
      balance: 3,
      cost: 40000,
    });
  });

  it('applies checkin state changes and creates a movement record', () => {
    const updated = applyInventoryCheckin(inventory[0], {
      itemId: 'projector',
      quantity: 1,
      condition: 'Excellent',
    });

    expect(updated.quantity).toBe(6);
    expect(updated.checkedOut).toBe(1);
    expect(updated.checkedIn).toBe(1);
    expect(updated.conditionCounts.Excellent).toBe(2);

    expect(createCheckinMovement('m2', inventory[0], {
      itemId: 'projector',
      quantity: 1,
      event: 'Annual Gala',
      receivedFrom: 'Jane',
      condition: 'Excellent',
    })).toMatchObject({
      id: 'm2',
      type: 'Check In',
      quantity: 1,
      event: 'Annual Gala',
      receivedBy: 'Jane',
      balance: 6,
      cost: 20000,
    });
  });

  it('edits movement quantity and recomputes item quantity plus movement balances', () => {
    const movements = [
      createCheckoutMovement('m1', inventory[0], { itemId: 'projector', quantity: 1, event: 'Gala' }),
      createCheckinMovement('m2', inventory[0], { itemId: 'projector', quantity: 1, event: 'Gala' }),
    ];

    const result = applyInventoryMovementEdit(inventory, movements, 'm1', { quantity: 2 });

    expect(result.items[0].quantity).toBe(4);
    expect(result.items[0].totalCost).toBe(80000);
    expect(result.movements.find(movement => movement.id === 'm1')?.balance).toBe(-2);
    expect(result.movements.find(movement => movement.id === 'm2')?.balance).toBe(-1);
  });
});
