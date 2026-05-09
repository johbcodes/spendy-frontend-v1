import type { Category, Client } from './types';

export function mapCategoryToSystemItem(category: Category): Category {
  return {
    ...category,
    status: category.status || 'Active',
    dateCreated: category.dateCreated || category.createdAt,
  };
}

export function mapClientToSystemItem(client: Client): Client {
  return {
    ...client,
    status: client.status || 'Active',
    dateCreated: client.dateCreated || client.createdAt,
  };
}

export function mapCategoriesToSystemItems(categories: Category[]): Category[] {
  return categories.map(mapCategoryToSystemItem);
}

export function mapClientsToSystemItems(clients: Client[]): Client[] {
  return clients.map(mapClientToSystemItem);
}
