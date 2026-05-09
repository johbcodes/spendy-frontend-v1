import { apiHttp } from '../../lib/api';
import type {
  InventoryCheckinPayload,
  InventoryCheckoutPayload,
  InventoryItemDTO,
  InventoryItemPayload,
} from './types';

export const inventoryApi = {
  list: () => apiHttp.get<InventoryItemDTO[]>('/inventory'),
  get: (itemId: string) => apiHttp.get<InventoryItemDTO>(`/inventory/${itemId}`),
  create: (payload: InventoryItemPayload) => apiHttp.post<InventoryItemDTO>('/inventory', payload),
  update: (itemId: string, payload: Partial<InventoryItemPayload>) =>
    apiHttp.patch<InventoryItemDTO>(`/inventory/${itemId}`, payload),
  delete: (itemId: string) => apiHttp.delete(`/inventory/${itemId}`),
  checkout: (itemId: string, payload: InventoryCheckoutPayload) =>
    apiHttp.post(`/inventory/${itemId}/checkout`, payload),
  checkin: (itemId: string, payload: InventoryCheckinPayload) =>
    apiHttp.post(`/inventory/${itemId}/checkin`, payload),
  checkouts: (itemId: string) => apiHttp.get(`/inventory/${itemId}/checkouts`),
};
