import { describe, expect, it } from 'vitest';
import { mergePendingWithCompletedPayments } from '../mappers';
import type { Payment } from '../types';

const completed: Payment[] = [
  {
    id: 'p-1',
    eventId: 'e-1',
    eventName: 'Launch',
    initiatedBy: 'Alice',
    recipient: 'Vendor A',
    amount: 10000,
    type: 'M-Pesa',
    status: 'Completed',
    dateTime: '2026-05-01T10:00:00.000Z',
  },
];

const pending: Payment[] = [
  {
    id: 'p-2',
    eventId: 'e-2',
    eventName: 'Activation',
    initiatedBy: 'Bob',
    recipient: 'Vendor B',
    amount: 6000,
    type: 'M-Pesa',
    status: 'Pending',
    dateTime: '2026-05-02T10:00:00.000Z',
  },
];

describe('paymentMappers', () => {
  it('merges completed and pending payments, completed first', () => {
    const merged = mergePendingWithCompletedPayments(completed, pending);
    expect(merged).toHaveLength(2);
    expect(merged[0].id).toBe('p-1');
    expect(merged[1].id).toBe('p-2');
  });

  it('returns completed-only when no pending payments', () => {
    expect(mergePendingWithCompletedPayments(completed, [])).toEqual(completed);
  });

  it('returns pending-only when no completed payments', () => {
    expect(mergePendingWithCompletedPayments([], pending)).toEqual(pending);
  });

  it('returns empty array when both inputs are empty', () => {
    expect(mergePendingWithCompletedPayments([], [])).toEqual([]);
  });
});
