import type { Payment, PaymentFilters, PaymentSummary } from './types';

export function getPaymentStatusVariant(
  status: string,
): 'success' | 'warning' | 'danger' | 'default' {
  if (status === 'Completed') return 'success';
  if (status === 'Pending') return 'warning';
  if (status === 'Failed') return 'danger';
  return 'default';
}

export function filterPayments(payments: Payment[], filters: PaymentFilters): Payment[] {
  const searchTerm = filters.searchTerm.trim().toLowerCase();

  return payments.filter(payment => {
    const matchesStatus =
      filters.status === 'all' ||
      payment.status.toLowerCase() === filters.status.toLowerCase();

    const matchesSearch =
      !searchTerm ||
      payment.eventName.toLowerCase().includes(searchTerm) ||
      payment.recipient.toLowerCase().includes(searchTerm) ||
      payment.initiatedBy.toLowerCase().includes(searchTerm);

    return matchesStatus && matchesSearch;
  });
}

export function summarizePayments(payments: Payment[]): PaymentSummary {
  const completed = payments.filter(payment => payment.status === 'Completed');
  const pending = payments.filter(payment => payment.status === 'Pending');
  const failed = payments.filter(payment => payment.status === 'Failed');

  return {
    totalCount: payments.length,
    totalAmount: payments.reduce((sum, payment) => sum + payment.amount, 0),
    completedCount: completed.length,
    completedAmount: completed.reduce((sum, payment) => sum + payment.amount, 0),
    pendingCount: pending.length,
    pendingAmount: pending.reduce((sum, payment) => sum + payment.amount, 0),
    failedCount: failed.length,
    failedAmount: failed.reduce((sum, payment) => sum + payment.amount, 0),
  };
}
