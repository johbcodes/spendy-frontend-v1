import { apiHttp } from './http';
import type { ExpenseDTO, ListParams } from './types';

export interface CreateExpensePayload {
  title: string;
  amount: number;
  category: string;
  eventId: string;
  description?: string;
  supplierId?: string;
  batchPaymentDetails?: unknown[];
}

export interface ApprovalPayload {
  status: 'Approved' | 'Rejected';
  approvedAmount?: number;
  walletId?: string;
  notes?: string;
}

export const expensesApi = {
  list: (params?: ListParams) => apiHttp.get<ExpenseDTO[]>('/expenses', params),
  get: (expenseId: string) => apiHttp.get<ExpenseDTO>(`/expenses/${expenseId}`),
  create: (payload: CreateExpensePayload) => apiHttp.post<ExpenseDTO>('/expenses', payload),
  update: (expenseId: string, payload: Partial<CreateExpensePayload>) =>
    apiHttp.patch<ExpenseDTO>(`/expenses/${expenseId}`, payload),
  delete: (expenseId: string) => apiHttp.delete(`/expenses/${expenseId}`),
  approve: (expenseId: string, payload: ApprovalPayload) =>
    apiHttp.post<ExpenseDTO>(`/expenses/${expenseId}/approve`, payload),
  pay: (expenseId: string, payload: { paymentMethod: 'M-Pesa' | 'Paybill' | 'Till' | 'Bank' | string }) =>
    apiHttp.post(`/expenses/${expenseId}/pay`, payload),
  approvals: (expenseId: string) => apiHttp.get(`/expenses/${expenseId}/approvals`),
  byEvent: (eventId: string) => apiHttp.get<ExpenseDTO[]>(`/expenses/event/${eventId}`),
  batchApprove: (payload: { expenseIds: string[]; action: 'Approved' | 'Rejected'; walletId?: string; notes?: string }) =>
    apiHttp.post('/expenses/batch-approve', payload),
  bulkPay: (payload: { expenseIds: string[] }) => apiHttp.post('/expenses/bulk-pay', payload),
};
