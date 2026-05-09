import type { InventoryItem, InventoryItemDTO, InventoryItemDraft, InventoryItemPayload } from './types';

export function toInventoryItem(dto: InventoryItemDTO): InventoryItem {
  const quantity = dto.quantity || 0;
  const costPerItem = dto.cost || 0;

  return {
    id: dto.id,
    name: dto.name,
    description: '',
    image: undefined,
    category: dto.category || '',
    quantity,
    checkedOut: dto.checkedOut || 0,
    checkedIn: dto.checkedIn || 0,
    location: dto.location || '',
    condition: 'Good',
    conditionCounts: dto.conditionCounts || { Excellent: 0, Good: 0, Fair: 0, Damaged: 0 },
    costPerItem,
    totalCost: quantity * costPerItem,
    rentalPrice: dto.price || 0,
    checkoutStatus: (dto.checkoutStatus as InventoryItem['checkoutStatus']) || 'available',
    totalInventoryAdded: quantity,
  };
}

export function toInventoryPayload(inventory: InventoryItemDraft): InventoryItemPayload {
  return {
    name: inventory.name || '',
    category: inventory.category,
    quantity: inventory.quantity,
    unit: inventory.unit,
    location: inventory.location,
    checkedOut: inventory.checkedOut,
    checkedIn: inventory.checkedIn,
    checkoutStatus: inventory.checkoutStatus,
    conditionCounts: inventory.conditionCounts,
    price: inventory.price ?? inventory.rentalPrice,
    cost: inventory.cost ?? inventory.costPerItem,
    sku: inventory.sku,
    supplier: inventory.supplier,
    lastRestocked: inventory.lastRestocked,
    status: inventory.status,
  };
}
