import type {
  Expense,
  Payment,
  Request as AppRequest,
  Supplier,
  User,
  Wallet,
} from '../../types';

export type Request = AppRequest & {
  assignedToSupplier?: boolean;
  event?: string;
  supplierId?: string;
};

export interface ApprovalFilters {
  searchTerm: string;
  statusFilter: 'all' | 'approved' | 'pending' | 'rejected';
  typeFilter?: 'Event' | 'Activation' | 'Operation' | 'all';
}

export interface ApprovalStats {
  total: number;
  completed: number;
  pending: number;
  rejected: number;
  totalAmount: number;
  completedAmount: number;
  pendingAmount: number;
  rejectedAmount: number;
}

export interface BatchApprovalDetails {
  recipientCount: number;
  totalAmount: number;
  isBatchExpense: boolean;
  isBatchDisbursement: boolean;
}

export type { Expense, Payment, Supplier, User, Wallet };
