import { useCallback, useEffect, useMemo, useState } from 'react';
import { inventoryApi } from './api';
import { toInventoryItem } from './mappers';
import {
  applyInventoryCheckin,
  applyInventoryCheckout,
  applyInventoryMovementEdit,
  createCheckinMovement,
  createCheckoutMovement,
  filterInventory,
  summarizeInventory,
  type InventoryCheckinData,
  type InventoryCheckoutData,
  type InventoryMovementDraft,
} from './rules';
import type { InventoryFilters, InventoryItem, InventoryItemDraft, InventoryItemDTO } from './types';
import { generateUUID } from '../../utils/idGenerator';

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const inventory = await inventoryApi.list();
      setItems(inventory.map(toInventoryItem));
    } catch (caught) {
      setError(caught instanceof Error ? caught : new Error('Failed to load inventory'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { items, isLoading, error, refresh, setItems };
}

export function useInventoryView(items: InventoryItem[], filters: InventoryFilters) {
  const filteredItems = useMemo(() => filterInventory(items, filters), [items, filters]);
  const summary = useMemo(() => summarizeInventory(items), [items]);

  return { filteredItems, summary };
}

const defaultInventoryMovements: InventoryMovementDraft[] = [{
  id: '1',
  itemId: '1',
  date: '2025-02-10T10:00',
  type: 'Check Out',
  quantity: 2,
  event: 'Sample Event',
  givenBy: 'System',
  receivedBy: '',
  balance: -2,
  cost: 0,
}];

function buildConditionCounts(condition: InventoryItem['condition'], quantity: number) {
  return {
    Excellent: condition === 'Excellent' ? quantity : 0,
    Good: condition === 'Good' ? quantity : 0,
    Fair: condition === 'Fair' ? quantity : 0,
    Damaged: condition === 'Damaged' ? quantity : 0,
  };
}

export function useInventoryController(currentUser: { companyName?: string } | null) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [inventoryMovements, setInventoryMovements] = useState<InventoryMovementDraft[]>(() => {
    const saved = localStorage.getItem('spendy_inventoryMovements');
    if (!saved) return defaultInventoryMovements;

    try {
      return JSON.parse(saved);
    } catch {
      return defaultInventoryMovements;
    }
  });

  useEffect(() => {
    if (!currentUser) {
      setInventory([]);
      return;
    }

    const loadInventory = async () => {
      const companyInventory = await inventoryApi.list();
      setInventory(companyInventory.map(toInventoryItem));
    };

    loadInventory();
  }, [currentUser?.companyName]);

  useEffect(() => {
    localStorage.setItem('spendy_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('spendy_inventoryMovements', JSON.stringify(inventoryMovements));
  }, [inventoryMovements]);

  const clearInventory = useCallback(() => {
    setInventory([]);
  }, []);

  const addInventoryItem = useCallback(async (inventoryData: InventoryItemDraft) => {
    const quantity = Number(inventoryData.quantity) || 0;
    const condition = inventoryData.condition || 'Good';
    const costPerItem = Number(inventoryData.costPerItem) || 0;
    const rentalPrice = Number(inventoryData.rentalPrice) || 0;

    const savedItem = toInventoryItem(await inventoryApi.create({
      name: inventoryData.name || '',
      category: inventoryData.category || '',
      quantity,
      unit: inventoryData.unit || 'pcs',
      location: inventoryData.location || '',
      cost: costPerItem,
      price: rentalPrice,
    }));

    const enrichedItem: InventoryItem = {
      ...savedItem,
      description: inventoryData.description || '',
      image: inventoryData.image,
      condition,
      conditionCounts: buildConditionCounts(condition, quantity),
      costPerItem,
      totalCost: quantity * costPerItem,
      rentalPrice,
      totalInventoryAdded: quantity,
    };

    setInventory(previous => [...previous, enrichedItem]);
    return enrichedItem;
  }, []);

  const updateInventoryItem = useCallback(async (itemId: string, itemData: InventoryItemDraft) => {
    const savedItem = toInventoryItem(await inventoryApi.update(itemId, {
      name: itemData.name,
      category: itemData.category,
      quantity: itemData.quantity,
      unit: itemData.unit,
      location: itemData.location,
      checkedOut: itemData.checkedOut,
      checkedIn: itemData.checkedIn,
      checkoutStatus: itemData.checkoutStatus,
      conditionCounts: itemData.conditionCounts,
      price: itemData.rentalPrice ?? itemData.price,
      cost: itemData.costPerItem ?? itemData.cost,
      sku: itemData.sku,
      supplier: itemData.supplier,
      lastRestocked: itemData.lastRestocked,
      status: itemData.status,
    }));

    const updatedItem: InventoryItem = {
      ...savedItem,
      ...itemData,
      id: itemId,
      totalCost: Number(itemData.quantity ?? savedItem.quantity) * Number(itemData.costPerItem ?? savedItem.costPerItem ?? 0),
    };

    setInventory(previous => previous.map(item => item.id === itemId ? updatedItem : item));
    return updatedItem;
  }, []);

  const deleteInventoryItem = useCallback(async (itemId: string) => {
    await inventoryApi.delete(itemId);
    setInventory(previous => previous.filter(item => item.id !== itemId));
  }, []);

  const checkoutInventoryItem = useCallback((checkoutData: InventoryCheckoutData) => {
    const item = inventory.find(candidate => candidate.id === checkoutData.itemId);
    if (!item) return null;

    const updatedItem = applyInventoryCheckout(item, Number(checkoutData.quantity) || 0);
    const movement = createCheckoutMovement(generateUUID(), item, checkoutData);

    setInventory(previous => previous.map(candidate => candidate.id === checkoutData.itemId ? updatedItem : candidate));
    setInventoryMovements(previous => [movement, ...previous]);

    return { item, updatedItem, movement };
  }, [inventory]);

  const checkinInventoryItem = useCallback((checkinData: InventoryCheckinData) => {
    const item = inventory.find(candidate => candidate.id === checkinData.itemId);
    if (!item) return null;

    const updatedItem = applyInventoryCheckin(item, checkinData);
    const movement = createCheckinMovement(generateUUID(), item, checkinData);

    setInventory(previous => previous.map(candidate => candidate.id === checkinData.itemId ? updatedItem : candidate));
    setInventoryMovements(previous => [movement, ...previous]);

    return { item, updatedItem, movement };
  }, [inventory]);

  const editInventoryMovement = useCallback((movementId: string, data: Partial<InventoryMovementDraft>) => {
    const result = applyInventoryMovementEdit(inventory, inventoryMovements, movementId, data);
    setInventory(result.items);
    setInventoryMovements(result.movements);
    return result;
  }, [inventory, inventoryMovements]);

  return {
    inventory,
    inventoryMovements,
    setInventory,
    clearInventory,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    checkoutInventoryItem,
    checkinInventoryItem,
    editInventoryMovement,
  };
}
