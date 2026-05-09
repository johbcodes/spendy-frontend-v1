import type { InventoryItem as LegacyInventoryItem, Movement } from '../../types';

export type InventoryCondition = 'Excellent' | 'Good' | 'Fair' | 'Damaged';
export type InventoryCheckoutStatus = 'available' | 'checked-out' | 'checked-in';

export interface InventoryItemDTO {
  id: string;
  name: string;
  category?: string;
  quantity: number;
  unit?: string;
  location?: string;
  checkedOut?: number;
  checkedIn?: number;
  checkoutStatus?: InventoryCheckoutStatus | string;
  conditionCounts?: Record<InventoryCondition, number>;
  price?: number;
  cost?: number;
  sku?: string;
  supplier?: string;
  status?: string;
  createdAt: string;
  updatedAt?: string;
  companyId?: string;
}

export interface InventoryItemPayload {
  name: string;
  category?: string;
  quantity?: number;
  unit?: string;
  location?: string;
  checkedOut?: number;
  checkedIn?: number;
  checkoutStatus?: InventoryCheckoutStatus | string;
  conditionCounts?: Record<InventoryCondition, number>;
  price?: number;
  cost?: number;
  sku?: string;
  supplier?: string;
  lastRestocked?: string;
  status?: string;
}

export interface InventoryCheckoutPayload {
  quantity: number;
  eventId: string;
  conditionOut: InventoryCondition | string;
  notes?: string;
}

export interface InventoryCheckinPayload {
  checkoutId: string;
  conditionIn: InventoryCondition | string;
  notes?: string;
}

export interface InventoryAllocationPayload {
  eventId: string;
  inventoryItemId: string;
  quantity: number;
  startDate: string;
  endDate: string;
  notes?: string;
}

export interface InventoryFilters {
  searchTerm: string;
  status: 'all' | 'current' | 'checked-out' | 'checked-in';
  category?: string;
}

export interface InventorySummary {
  totalItems: number;
  totalValue: number;
  currentItems: number;
  checkedOutItems: number;
  checkedInItems: number;
  totalInventoryAdded: number;
  conditionCounts: Record<InventoryCondition, number>;
}

export type InventoryItem = LegacyInventoryItem;
export type InventoryItemDraft = Partial<LegacyInventoryItem> & {
  unit?: string;
  price?: number;
  cost?: number;
  sku?: string;
  supplier?: string;
  lastRestocked?: string;
  status?: string;
};
export type InventoryMovement = Movement;
