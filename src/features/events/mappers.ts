import type { Event } from '../../types';
import type { EventDTO } from './types';

export function toEvent(dto: EventDTO): Event {
  return {
    id: dto.id,
    name: dto.name,
    type: dto.type as Event['type'],
    category: dto.category ?? '',
    client: dto.client ?? '',
    brand: dto.brand,
    brands: dto.brands,
    projectLeadId: dto.projectLeadId,
    projectLead: dto.projectLead,
    budget: dto.budget,
    spent: dto.spent,
    startDate: dto.startDate,
    endDate: dto.endDate ?? '',
    status: dto.status as Event['status'],
    location: dto.location,
    documents: (dto.documents ?? []) as string[],
  };
}
