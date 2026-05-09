import type { Expense } from '../../types';
import type { ExpenseDTO } from './types';

export function toExpense(dto: ExpenseDTO): Expense {
  return {
    id: dto.id,
    title: dto.title,
    eventId: dto.eventId || '',
    eventName: dto.eventName || '',
    walletId: dto.walletId || dto.sourceWalletId,
    category: dto.category || '',
    client: dto.client || '',
    amount: dto.amount,
    budget: dto.amount,
    supplier: dto.supplier,
    supplierCategory: dto.supplierCategory,
    createdBy: dto.createdBy || '',
    startDate: dto.startDate || dto.createdAt || new Date().toISOString(),
    dueDate: dto.dueDate || '',
    status: dto.status,
    description: dto.description,
    batchPaymentDetails: dto.batchPaymentDetails as Expense['batchPaymentDetails'],
    createdByUserId: dto.createdById || '',
    createdByRole: dto.createdByRole || 'Staff',
    approvalRequired: dto.status === 'Pending',
    approvalStatus:
      dto.status === 'Approved' ? 'approved' :
      dto.status === 'Rejected' ? 'rejected' :
      dto.status === 'Completed' ? 'completed' :
      'pending',
  };
}
