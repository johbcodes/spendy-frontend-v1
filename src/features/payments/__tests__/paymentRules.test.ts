import { describe, expect, it } from 'vitest';
import { filterPayments, getPaymentStatusVariant, summarizePayments } from '../rules';
import type { Payment } from '../types';

const payments: Payment[] = [
  {
    id: 'p-1',
    eventId: 'e-1',
    eventName: 'Launch',
    expenseId: 'x-1',
    initiatedBy: 'Alice',
    recipient: 'Vendor A',
    amount: 10000,
    type: 'M-Pesa',
    status: 'Completed',
    dateTime: '2026-05-01T10:00:00.000Z',
  },
  {
    id: 'p-2',
    eventId: 'e-2',
    eventName: 'Activation',
    expenseId: 'x-2',
    initiatedBy: 'Bob',
    recipient: 'Vendor B',
    amount: 6000,
    type: 'Wallet Transfer',
    status: 'Pending',
    dateTime: '2026-05-02T10:00:00.000Z',
  },
  {
    id: 'p-3',
    eventId: 'e-3',
    eventName: 'Roadshow',
    expenseId: 'x-3',
    initiatedBy: 'Bob',
    recipient: 'Vendor C',
    amount: 3000,
    type: 'M-Pesa',
    status: 'Failed',
    dateTime: '2026-05-03T10:00:00.000Z',
  },
];

describe('payment rules', () => {
  it('maps statuses to badge variants', () => {
    expect(getPaymentStatusVariant('Completed')).toBe('success');
    expect(getPaymentStatusVariant('Pending')).toBe('warning');
    expect(getPaymentStatusVariant('Failed')).toBe('danger');
    expect(getPaymentStatusVariant('Unknown')).toBe('default');
  });

  it('filters payments by status and search term', () => {
    const filtered = filterPayments(payments, { searchTerm: 'vendor b', status: 'pending' });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('p-2');
  });

  it('summarizes totals by payment status', () => {
    expect(summarizePayments(payments)).toEqual({
      totalCount: 3,
      totalAmount: 19000,
      completedCount: 1,
      completedAmount: 10000,
      pendingCount: 1,
      pendingAmount: 6000,
      failedCount: 1,
      failedAmount: 3000,
    });
  });
});
