import type { InventoryCondition, InventoryFilters, InventoryItem, InventorySummary } from './types';

export const INVENTORY_CONDITIONS: InventoryCondition[] = ['Excellent', 'Good', 'Fair', 'Damaged'];

export function getAvailableQuantity(item: Pick<InventoryItem, 'quantity' | 'checkedOut'>): number {
  return Math.max(0, (item.quantity || 0) - (item.checkedOut || 0));
}

export function canCheckoutInventory(item: Pick<InventoryItem, 'quantity' | 'checkedOut'>, quantity: number): boolean {
  return Number.isFinite(quantity) && quantity > 0 && quantity <= getAvailableQuantity(item);
}

export function canCheckinInventory(checkedOutQuantity: number, checkinQuantity: number): boolean {
  return Number.isFinite(checkinQuantity) && checkinQuantity > 0 && checkinQuantity <= Math.max(0, checkedOutQuantity);
}

export function getInventoryConditionVariant(condition: string): 'success' | 'info' | 'warning' | 'danger' | 'default' {
  if (condition === 'Excellent') return 'success';
  if (condition === 'Good') return 'info';
  if (condition === 'Fair') return 'warning';
  if (condition === 'Damaged') return 'danger';
  return 'default';
}

export function validateAllocationDates(startDate: string, endDate: string, now = new Date()): string | null {
  if (!startDate || !endDate) return 'Start and end dates are required';

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 'Enter valid allocation dates';
  if (start < now) return 'Start date cannot be in the past';
  if (end < now) return 'End date cannot be in the past';
  if (start > end) return 'End date must be after start date';

  return null;
}

export function filterInventory(items: InventoryItem[], filters: InventoryFilters): InventoryItem[] {
  const searchTerm = filters.searchTerm.trim().toLowerCase();

  return items.filter(item => {
    const matchesSearch =
      !searchTerm ||
      item.name.toLowerCase().includes(searchTerm) ||
      (item.description || '').toLowerCase().includes(searchTerm);

    if (!matchesSearch) return false;
    if (filters.category && item.category !== filters.category) return false;
    if (filters.status === 'all') return true;
    if (filters.status === 'current') return item.checkoutStatus === 'available' || !item.checkoutStatus;
    if (filters.status === 'checked-out') return item.checkoutStatus === 'checked-out' && item.checkedOut > 0;
    if (filters.status === 'checked-in') return item.checkoutStatus === 'checked-in' && item.checkedIn > 0;

    return true;
  });
}

export function summarizeInventory(items: InventoryItem[]): InventorySummary {
  return items.reduce<InventorySummary>(
    (summary, item) => {
      summary.totalItems += item.quantity || 0;
      summary.totalValue += item.totalCost || 0;
      summary.totalInventoryAdded += item.totalInventoryAdded || item.quantity || 0;

      if (item.checkoutStatus === 'checked-out') summary.checkedOutItems += 1;
      else if (item.checkoutStatus === 'checked-in') summary.checkedInItems += 1;
      else summary.currentItems += 1;

      for (const condition of INVENTORY_CONDITIONS) {
        summary.conditionCounts[condition] += item.conditionCounts?.[condition] || 0;
      }

      return summary;
    },
    {
      totalItems: 0,
      totalValue: 0,
      currentItems: 0,
      checkedOutItems: 0,
      checkedInItems: 0,
      totalInventoryAdded: 0,
      conditionCounts: { Excellent: 0, Good: 0, Fair: 0, Damaged: 0 },
    },
  );
}

export interface InventoryCheckoutData {
  itemId: string;
  quantity: number;
  checkoutDate?: string;
  event?: string;
  purpose?: string;
  eventId?: string;
  givenTo?: string;
  checkedOutTo?: string;
}

export interface InventoryCheckinData {
  itemId: string;
  quantity: number;
  checkinDate?: string;
  event?: string;
  notes?: string;
  eventId?: string;
  receivedFrom?: string;
  receivedBy?: string;
  condition?: InventoryCondition;
}

export interface InventoryMovementDraft {
  id: string;
  itemId: string;
  date: string;
  type: 'Check Out' | 'Check In';
  quantity: number;
  event: string;
  eventId?: string;
  givenBy?: string;
  receivedBy?: string;
  condition?: InventoryCondition;
  balance: number;
  cost: number;
}

export function applyInventoryCheckout(item: InventoryItem, quantityCheckedOut: number): InventoryItem {
  if (!canCheckoutInventory(item, quantityCheckedOut)) {
    throw new Error(`Cannot checkout more items than available. Available: ${getAvailableQuantity(item)}`);
  }

  return {
    ...item,
    quantity: item.quantity - quantityCheckedOut,
    checkedOut: (item.checkedOut || 0) + quantityCheckedOut,
    checkoutStatus: 'checked-out',
  };
}

export function createCheckoutMovement(
  id: string,
  item: InventoryItem,
  checkoutData: InventoryCheckoutData,
): InventoryMovementDraft {
  const quantityCheckedOut = Number(checkoutData.quantity) || 0;

  return {
    id,
    itemId: checkoutData.itemId,
    date: checkoutData.checkoutDate || new Date().toISOString(),
    type: 'Check Out',
    quantity: quantityCheckedOut,
    event: checkoutData.event || checkoutData.purpose || 'N/A',
    eventId: checkoutData.eventId || 'N/A',
    givenBy: checkoutData.givenTo || checkoutData.checkedOutTo || 'Unknown',
    receivedBy: '',
    condition: item.condition,
    balance: item.quantity - quantityCheckedOut,
    cost: (item.costPerItem || 0) * quantityCheckedOut,
  };
}

export function applyInventoryCheckin(item: InventoryItem, checkinData: InventoryCheckinData): InventoryItem {
  const quantityCheckedIn = Number(checkinData.quantity) || 0;
  const checkedOutQuantity = item.checkedOut || 0;
  const condition = checkinData.condition || item.condition;

  if (!canCheckinInventory(checkedOutQuantity, quantityCheckedIn)) {
    throw new Error(`Cannot check in more items than were checked out. Checked out: ${checkedOutQuantity}`);
  }

  return {
    ...item,
    quantity: item.quantity + quantityCheckedIn,
    checkedOut: checkedOutQuantity - quantityCheckedIn,
    checkedIn: (item.checkedIn || 0) + quantityCheckedIn,
    checkoutStatus: checkedOutQuantity - quantityCheckedIn > 0 ? 'checked-out' : 'available',
    condition,
    conditionCounts: {
      ...item.conditionCounts,
      [condition]: (item.conditionCounts?.[condition] || 0) + quantityCheckedIn,
    },
  };
}

export function createCheckinMovement(
  id: string,
  item: InventoryItem,
  checkinData: InventoryCheckinData,
): InventoryMovementDraft {
  const quantityCheckedIn = Number(checkinData.quantity) || 0;
  const condition = checkinData.condition || item.condition;

  return {
    id,
    itemId: checkinData.itemId,
    date: checkinData.checkinDate || new Date().toISOString(),
    type: 'Check In',
    quantity: quantityCheckedIn,
    event: checkinData.event || checkinData.notes || 'N/A',
    eventId: checkinData.eventId || 'N/A',
    receivedBy: checkinData.receivedFrom || checkinData.receivedBy || 'Unknown',
    condition,
    balance: item.quantity + quantityCheckedIn,
    cost: (item.costPerItem || 0) * quantityCheckedIn,
  };
}

export function applyInventoryMovementEdit(
  items: InventoryItem[],
  movements: InventoryMovementDraft[],
  movementId: string,
  updates: Partial<InventoryMovementDraft>,
): { items: InventoryItem[]; movements: InventoryMovementDraft[] } {
  const oldMovement = movements.find(movement => movement.id === movementId);
  if (!oldMovement) return { items, movements };

  const updatedMovement = { ...oldMovement, ...updates };
  const deltaQuantity = (Number(updatedMovement.quantity) || 0) - (Number(oldMovement.quantity) || 0);

  const updatedItems = items.map(item => {
    if (item.id !== updatedMovement.itemId) return item;

    const quantity = updatedMovement.type === 'Check In'
      ? item.quantity + deltaQuantity
      : item.quantity - deltaQuantity;

    return {
      ...item,
      quantity,
      totalCost: quantity * (item.costPerItem || 0),
    };
  });

  const updatedMovements = movements.map(movement =>
    movement.id === movementId ? updatedMovement : movement,
  );

  const itemMovements = updatedMovements
    .filter(movement => movement.itemId === updatedMovement.itemId)
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let runningBalance = 0;
  const recomputedMovements = itemMovements.map(movement => {
    runningBalance += movement.type === 'Check In' ? movement.quantity : -movement.quantity;
    return { ...movement, balance: runningBalance };
  });

  return {
    items: updatedItems,
    movements: updatedMovements.map(movement => {
      if (movement.itemId !== updatedMovement.itemId) return movement;
      return recomputedMovements.find(recomputed => recomputed.id === movement.id) || movement;
    }),
  };
}
