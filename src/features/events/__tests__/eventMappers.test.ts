import { describe, expect, it } from 'vitest';
import { toEvent } from '../mappers';
import type { EventDTO } from '../types';

describe('event mappers', () => {
  it('maps backend event DTOs to app event shape', () => {
    const dto: EventDTO = {
      id: 'e-1',
      name: 'Launch Night',
      type: 'Project',
      category: 'Launch',
      client: 'Acme',
      brand: 'Spendy',
      brands: ['Spendy'],
      projectLeadId: 'u-1',
      projectLead: {
        id: 'u-1',
        firstName: 'Pat',
        lastName: 'Lead',
        email: 'pat@acme.com',
      },
      budget: 100000,
      spent: 25000,
      startDate: '2026-06-01T09:00:00.000Z',
      endDate: '2026-06-02T18:00:00.000Z',
      status: 'Active',
      location: 'Nairobi',
      documents: ['brief.pdf'],
    };

    expect(toEvent(dto)).toEqual({
      id: 'e-1',
      name: 'Launch Night',
      type: 'Project',
      category: 'Launch',
      client: 'Acme',
      brand: 'Spendy',
      brands: ['Spendy'],
      projectLeadId: 'u-1',
      projectLead: {
        id: 'u-1',
        firstName: 'Pat',
        lastName: 'Lead',
        email: 'pat@acme.com',
      },
      budget: 100000,
      spent: 25000,
      startDate: '2026-06-01T09:00:00.000Z',
      endDate: '2026-06-02T18:00:00.000Z',
      status: 'Active',
      location: 'Nairobi',
      documents: ['brief.pdf'],
    });
  });

  it('applies optional-field fallbacks for missing values', () => {
    const dto: EventDTO = {
      id: 'e-2',
      name: 'Roadshow',
      type: 'Activation',
      budget: 50000,
      spent: 0,
      startDate: '2026-07-01T09:00:00.000Z',
      status: 'Planning',
    };

    const mapped = toEvent(dto);
    expect(mapped.category).toBe('');
    expect(mapped.client).toBe('');
    expect(mapped.endDate).toBe('');
    expect(mapped.documents).toEqual([]);
  });
});
