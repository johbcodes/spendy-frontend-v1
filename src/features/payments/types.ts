import type { Expense, Payment, Request, User, Wallet } from '../../types';

export type { Payment, Expense, Request, User, Wallet };

export interface PaymentFilters {
  searchTerm: string;
  status: string;
}

export interface PaymentSummary {
  totalCount: number;
  totalAmount: number;
  completedCount: number;
  completedAmount: number;
  pendingCount: number;
  pendingAmount: number;
  failedCount: number;
  failedAmount: number;
}
