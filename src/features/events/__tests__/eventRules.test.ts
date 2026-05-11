import { describe, expect, it } from 'vitest';
import {
  appendEventDocument,
  applyEventUpdate,
  buildEventCreatePayload,
  buildEventUpdatePayload,
  buildEventDocumentName,
  calculateBudgetStatus,
  canManageEventDetails,
  canModifyEvent,
  filterEvents,
  getEventDetailData,
  getStatusVariant,
  incrementEventSpent,
  summarizeEvents,
  updateApproverEventAccess,
} from '../rules';
import type { Event, Payment, User } from '../../../types';

const adminUser: User = {
  id: 'u-admin',
  firstName: 'Alice',
  lastName: 'Admin',
  email: 'alice@co.com',
  phone: '',
  country: 'Kenya',
  role: 'Admin',
  status: 'Active',
  modulesAssigned: ['Events'],
  companyId: 'co-1',
  createdAt: new Date().toISOString(),
};

const staffUser: User = {
  ...adminUser,
  id: 'u-staff',
  firstName: 'Bob',
  lastName: 'Staff',
  role: 'Staff',
  modulesAssigned: ['Expenses'],
};

const approverUser: User = {
  ...adminUser,
  id: 'u-approver',
  firstName: 'Pat',
  lastName: 'Approver',
  role: 'Approver',
  modulesAssigned: ['Events'],
  eventAccess: [],
};

const launchEvent: Event = {
  id: 'e-launch',
  name: 'Launch Night',
  type: 'Event',
  category: 'Launch',
  client: 'Acme',
  budget: 100000,
  spent: 25000,
  startDate: '2026-06-01T09:00',
  endDate: '2026-06-01T18:00',
  status: 'Active',
  location: 'Nairobi',
  documents: [],
};

const activationEvent: Event = {
  ...launchEvent,
  id: 'e-activation',
  name: 'Mall Activation',
  type: 'Activation',
  category: 'Retail',
  client: 'Beta',
  budget: 50000,
  spent: 10000,
  status: 'Completed',
};

const payments: Payment[] = [
  { id: 'p-1', recipient: 'Supplier', amount: 3000, type: 'Bank', status: 'Completed', dateTime: '2026-06-01T10:00', eventId: 'e-launch', eventName: 'Launch Night' },
  { id: 'p-2', recipient: 'Crew', amount: 2000, type: 'Cash', status: 'Completed', dateTime: '2026-06-01T11:00', eventId: 'e-activation', eventName: 'Mall Activation' },
] as Payment[];

describe('event access rules', () => {
  it('allows admin users assigned to Events to modify events', () => {
    expect(canModifyEvent(adminUser)).toBe(true);
  });

  it('blocks non-admin users from modifying events', () => {
    expect(canModifyEvent(staffUser)).toBe(false);
  });

  it('allows event detail management for users assigned to Events', () => {
    expect(canManageEventDetails(approverUser)).toBe(true);
    expect(canManageEventDetails(staffUser)).toBe(false);
  });
});

describe('event filtering and summaries', () => {
  const events = [launchEvent, activationEvent];

  it('filters by search, status, type, and client', () => {
    expect(filterEvents(events, { searchTerm: 'launch', status: 'all', type: 'all', client: 'all' })).toHaveLength(1);
    expect(filterEvents(events, { searchTerm: '', status: 'completed', type: 'activation', client: 'Beta' })).toEqual([activationEvent]);
  });

  it('summarizes event counts, budgets, and payment spend', () => {
    expect(summarizeEvents(events, payments)).toEqual({
      total: 2,
      active: 1,
      totalBudget: 150000,
      totalSpent: 5000,
    });
  });
});

describe('event mutation helpers', () => {
  it('maps create payloads into the backend shape', () => {
    const payload = buildEventCreatePayload({
      name: 'Roadshow',
      type: 'Activation',
      brands: ['Brand A'],
      budget: 12000,
      startDate: '2026-06-01T09:00',
      projectLead: 'u-approver' as any,
    });

    expect(payload).toMatchObject({
      name: 'Roadshow',
      type: 'Activation',
      brand: 'Brand A',
      projectLeadId: 'u-approver',
      spent: 0,
      status: 'Planning',
    });
  });

  it('maps projectLead to projectLeadId on update', () => {
    expect(buildEventUpdatePayload({ projectLead: 'u-approver' as any })).toEqual({
      projectLeadId: 'u-approver',
    });
  });

  it('replaces updated events by id', () => {
    const updated = { ...launchEvent, status: 'Archived' as const };
    expect(applyEventUpdate([launchEvent, activationEvent], updated)[0]).toBe(updated);
  });

  it('appends document names to an event', () => {
    const [updated] = appendEventDocument([launchEvent], launchEvent.id, 'brief.pdf');
    expect(updated.documents).toEqual(['brief.pdf']);
  });

  it('builds uploaded document labels consistently', () => {
    expect(buildEventDocumentName('Creative Brief', 'brief.pdf')).toBe('Creative Brief - brief.pdf');
  });

  it('increments event spent by id', () => {
    const [updated] = incrementEventSpent([launchEvent], launchEvent.id, 5000);
    expect(updated.spent).toBe(30000);
  });
});

describe('event display helpers', () => {
  it('returns status badge variants', () => {
    expect(getStatusVariant('Active')).toBe('success');
    expect(getStatusVariant('Completed')).toBe('info');
    expect(getStatusVariant('Cancelled')).toBe('danger');
  });

  it('calculates budget status and handles zero budgets', () => {
    expect(calculateBudgetStatus(launchEvent, 125000)).toEqual({
      percentage: 125,
      isOverBudget: true,
      remaining: -25000,
    });
    expect(calculateBudgetStatus({ ...launchEvent, budget: 0 }, 0).percentage).toBe(0);
  });

  it('builds event detail slices and totals', () => {
    const detail = getEventDetailData({
      event: launchEvent,
      expenses: [
        { id: 'exp-1', eventId: launchEvent.id, amount: 12000, title: 'Venue', category: 'Venue', status: 'Approved' },
        { id: 'exp-2', eventId: activationEvent.id, amount: 4000, title: 'Crew', category: 'Crew', status: 'Pending' },
      ] as any,
      requests: [
        { id: 'req-1', type: launchEvent.type, status: 'Pending', amount: 1000 },
        { id: 'req-2', type: 'Operation', status: 'Pending', amount: 2000 },
      ] as any,
      payments,
      wallets: [
        { id: 'w-1', linkedEvent: launchEvent.id, balance: 3000 },
        { id: 'w-2', linkedEvent: activationEvent.id, balance: 9000 },
      ] as any,
      inventory: [
        { id: 'i-1', category: launchEvent.category },
        { id: 'i-2', category: activationEvent.category },
      ] as any,
      activityLog: [
        { id: 'a-1', action: `Updated ${launchEvent.name}`, user: 'Alice', timestamp: '2026-06-01T10:00' },
        { id: 'a-2', action: 'Updated something else', user: 'Alice', timestamp: '2026-06-01T10:00' },
      ],
    });

    expect(detail.eventExpenses).toHaveLength(1);
    expect(detail.eventRequests).toHaveLength(1);
    expect(detail.eventWallets).toHaveLength(1);
    expect(detail.eventInventory).toHaveLength(1);
    expect(detail.eventActivityLog).toHaveLength(1);
    expect(detail.totalExpenses).toBe(12000);
    expect(detail.totalWalletBalance).toBe(3000);
    expect(detail.pendingRequests).toHaveLength(1);
  });
});

describe('approver event access', () => {
  it('adds approver access without duplicating existing access', () => {
    const users = updateApproverEventAccess([approverUser], 'Pat Approver', launchEvent.id, launchEvent.name, true);
    expect(users[0].eventAccess).toHaveLength(1);

    const deduped = updateApproverEventAccess(users, 'Pat Approver', launchEvent.id, launchEvent.name, true);
    expect(deduped[0].eventAccess).toHaveLength(1);
  });

  it('removes approver access', () => {
    const users = updateApproverEventAccess([approverUser], 'Pat Approver', launchEvent.id, launchEvent.name, true);
    const removed = updateApproverEventAccess(users, 'Pat Approver', launchEvent.id, launchEvent.name, false);
    expect(removed[0].eventAccess).toEqual([]);
  });
});
