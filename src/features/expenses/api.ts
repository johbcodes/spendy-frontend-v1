import { expensesApi } from '../../lib/api';
import type { ApprovalPayload, CreateExpensePayload } from '../../lib/api/expensesApi';
import type { ExpenseDTO } from './types';

export const expenseFeatureApi = {
  list: (params?: Record<string, unknown>) => expensesApi.list(params as any) as Promise<ExpenseDTO[]>,
  get: (expenseId: string) => expensesApi.get(expenseId) as Promise<ExpenseDTO>,
  create: (payload: CreateExpensePayload) => expensesApi.create(payload) as Promise<ExpenseDTO>,
  update: (expenseId: string, payload: Partial<CreateExpensePayload>) =>
    expensesApi.update(expenseId, payload) as Promise<ExpenseDTO>,
  delete: (expenseId: string) => expensesApi.delete(expenseId),
  approve: (expenseId: string, payload: ApprovalPayload) =>
    expensesApi.approve(expenseId, payload) as Promise<ExpenseDTO>,
  pay: (expenseId: string, paymentMethod: string) =>
    expensesApi.pay(expenseId, { paymentMethod }),
  batchApprove: expensesApi.batchApprove,
  bulkPay: expensesApi.bulkPay,
};
