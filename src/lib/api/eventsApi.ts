import { apiHttp } from './http';
import type { EventDTO, ListParams } from './types';

export const eventsApi = {
  list: (params?: ListParams) => apiHttp.get<EventDTO[]>('/events', params),
  get: (eventId: string) => apiHttp.get<EventDTO>(`/events/${eventId}`),
  create: (payload: Omit<Partial<EventDTO>, 'id' | 'createdAt' | 'updatedAt'> & { name: string; type: string; startDate: string }) =>
    apiHttp.post<EventDTO>('/events', payload),
  update: (eventId: string, payload: Partial<EventDTO>) => apiHttp.patch<EventDTO>(`/events/${eventId}`, payload),
  delete: (eventId: string) => apiHttp.delete(`/events/${eventId}`),
};
