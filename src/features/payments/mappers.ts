import type { Payment } from '../../types';

export function mergePendingWithCompletedPayments(
  completedPayments: Payment[],
  pendingPayments: Payment[],
): Payment[] {
  return [...completedPayments, ...pendingPayments];
}
