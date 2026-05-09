import { eventsApi } from '../../lib/api';
import type { EventDTO, EventPayload } from './types';

export const eventFeatureApi = {
  list: (params?: Record<string, unknown>) => eventsApi.list(params) as Promise<EventDTO[]>,

  get: (eventId: string) => eventsApi.get(eventId) as Promise<EventDTO>,

  create: (payload: EventPayload) => eventsApi.create(payload as any) as Promise<EventDTO>,

  update: (eventId: string, payload: Partial<EventPayload>) =>
    eventsApi.update(eventId, payload as any) as Promise<EventDTO>,

  delete: (eventId: string) => eventsApi.delete(eventId),
};
