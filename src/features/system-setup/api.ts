import API from '../../services/api';
import { DEFAULT_CATEGORIES } from '../../constants/app';
import type { Category, CategoryType, Client, SystemSetupData } from './types';
import { mapCategoriesToSystemItems, mapCategoryToSystemItem, mapClientToSystemItem, mapClientsToSystemItems } from './mappers';

export async function loadSystemSetupData(): Promise<SystemSetupData> {
  const [events, activations, expenses, operations, suppliers, inventory, clients] = await Promise.all([
    API.categories.getAll('event'),
    API.categories.getAll('activation'),
    API.categories.getAll('expense'),
    API.categories.getAll('operation'),
    API.categories.getAll('supplier'),
    API.categories.getAll('inventory'),
    API.clients.getAll(),
  ]);

  return {
    events: mapCategoriesToSystemItems(events as Category[]),
    activations: mapCategoriesToSystemItems(activations as Category[]),
    expenses: mapCategoriesToSystemItems(expenses as Category[]),
    operations: mapCategoriesToSystemItems(operations as Category[]),
    suppliers: mapCategoriesToSystemItems(suppliers as Category[]),
    inventory: mapCategoriesToSystemItems(inventory as Category[]),
    clients: mapClientsToSystemItems(clients as Client[]),
  };
}

export async function createCategory(type: CategoryType, data: Partial<Category>): Promise<Category> {
  return mapCategoryToSystemItem(await API.categories.create(type, data));
}

export async function updateCategory(type: CategoryType, id: string, data: Partial<Category>): Promise<Category> {
  return mapCategoryToSystemItem(await API.categories.update(type, id, data));
}

export function deleteCategory(type: CategoryType, id: string): Promise<void> {
  return API.categories.delete(type, id);
}

export async function createClient(data: Partial<Client>): Promise<Client> {
  return mapClientToSystemItem(await API.clients.create(data));
}

export async function updateClient(id: string, data: Partial<Client>): Promise<Client> {
  return mapClientToSystemItem(await API.clients.update(id, data));
}

export function deleteClient(id: string): Promise<void> {
  return API.clients.delete(id);
}

export async function seedDefaultCategories(): Promise<Record<CategoryType, Category[]>> {
  const types: CategoryType[] = ['event', 'activation', 'expense', 'operation', 'supplier', 'inventory'];

  const allRequests = types.flatMap(type =>
    DEFAULT_CATEGORIES[type].map(name =>
      API.categories.create(type, { name, status: 'Active' } as Partial<Category>)
    )
  );

  const settled = await Promise.allSettled(allRequests);

  const result: Record<CategoryType, Category[]> = {
    event: [], activation: [], expense: [], operation: [], supplier: [], inventory: [],
  };

  let idx = 0;
  for (const type of types) {
    for (let i = 0; i < DEFAULT_CATEGORIES[type].length; i++) {
      const outcome = settled[idx++];
      if (outcome.status === 'fulfilled') {
        result[type].push(mapCategoryToSystemItem(outcome.value));
      }
    }
  }

  return result;
}
