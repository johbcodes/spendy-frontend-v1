import type { Expense, Event, User, Wallet, RequestStatus } from '../../types';

export type { Expense, Event, User, Wallet, RequestStatus };

export interface ExpenseDTO {
  id: string;
  title: string;
  amount: number;
  approvedAmount?: number;
  category?: string;
  eventId?: string;
  eventName?: string;
  client?: string;
  supplierId?: string;
  supplier?: string;
  supplierCategory?: string;
  description?: string;
  status: RequestStatus;
  createdById?: string;
  createdBy?: string;
  createdByRole?: User['role'];
  sourceWalletId?: string;
  walletId?: string;
  batchPaymentDetails?: unknown[];
  createdAt?: string;
  updatedAt?: string;
  startDate?: string;
  dueDate?: string;
}

export interface ExpensePayload {
  title: string;
  amount: number;
  category: string;
  eventId: string;
  description?: string;
  supplierId?: string;
  batchPaymentDetails?: unknown[];
}

export interface ExpenseFilters {
  searchTerm: string;
  eventId: string;
  category: string;
  status: string;
  type: string;
}

export interface ExpenseSummary {
  totalCount: number;
  totalAmount: number;
  pendingCount: number;
  pendingAmount: number;
  approvedCount: number;
  approvedAmount: number;
  completedCount: number;
  completedAmount: number;
}
