import { useCallback, useEffect, useMemo, useState } from 'react';
import { approvalsFeatureApi, filterRequests, filterRequestsByType } from './api';
import { getRequestDisplayAmount } from './rules';
import type { ApprovalStats, Expense, Payment, Request, User } from './types';

export function useApprovalFilters(
  requests: Request[],
  searchTerm: string,
  statusFilter: string,
) {
  return useMemo(() => {
    const filtered = filterRequests(requests, searchTerm, statusFilter);
    return {
      allRequests: filtered,
      eventRequests: filterRequestsByType(filtered, 'Project'),
      activationRequests: filterRequestsByType(filtered, 'Activation'),
      operationRequests: filterRequestsByType(filtered, 'Operation'),
    };
  }, [requests, searchTerm, statusFilter]);
}

export function useApprovalStats(requests: Request[]): ApprovalStats {
  return useMemo(() => {
    const total = requests.length;
    const completed = requests.filter(r => r.status === 'Approved').length;
    const pending = requests.filter(r => r.status === 'Pending').length;
    const rejected = requests.filter(r => r.status === 'Rejected').length;

    const totalAmount = requests.reduce((sum, r) => sum + getRequestDisplayAmount(r), 0);
    const completedAmount = requests
      .filter(r => r.status === 'Approved')
      .reduce((sum, r) => sum + getRequestDisplayAmount(r), 0);
    const pendingAmount = requests
      .filter(r => r.status === 'Pending')
      .reduce((sum, r) => sum + getRequestDisplayAmount(r), 0);
    const rejectedAmount = requests
      .filter(r => r.status === 'Rejected')
      .reduce((sum, r) => sum + getRequestDisplayAmount(r), 0);

    return { total, completed, pending, rejected, totalAmount, completedAmount, pendingAmount, rejectedAmount };
  }, [requests]);
}

export function useBatchApprovalDetails(request: Request, expenses: Expense[]) {
  return useMemo(() => {
    const expense = expenses.find(e => e.id === request.expenseId);
    if (!expense) return null;

    let totalAmount = 0;
    let recipientCount = 0;

    if ((expense as any).allRecipients?.length) {
      totalAmount = (expense as any).allRecipients.reduce((sum: number, r: any) => sum + r.amount, 0);
      recipientCount = (expense as any).allRecipients.length;
    } else {
      (expense as any).batchCategories?.forEach((cat: any) => {
        cat.items.forEach((item: any) => { totalAmount += item.amount; recipientCount++; });
      });
      (expense as any).csvData?.forEach((item: any) => { totalAmount += item.amount; recipientCount++; });
      (expense as any).expenses?.forEach((exp: any) => { totalAmount += exp.amount; recipientCount++; });
    }

    return {
      totalAmount,
      recipientCount,
      isBatchExpense: (expense as any).expenseRequestType === 'batch',
      isBatchDisbursement: request.paymentRequestType === 'bulk',
    };
  }, [request, expenses]);
}

export function useApprovalsController(currentUser: User | null) {
  const [requests, setRequests] = useState<Request[]>([]);

  useEffect(() => {
    if (!currentUser) {
      setRequests([]);
      return;
    }
    approvalsFeatureApi.list().then(setRequests).catch(() => setRequests([]));
  }, [currentUser?.id]);

  // Keep localStorage in sync for legacy code
  useEffect(() => {
    localStorage.setItem('spendy_requests', JSON.stringify(requests));
  }, [requests]);

  const addRequest = useCallback((req: Request) => {
    setRequests(prev => [...prev, req]);
  }, []);

  const updateRequest = useCallback((id: string, patch: Partial<Request>) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));
  }, []);

  const refreshRequests = useCallback(async () => {
    const fresh = await approvalsFeatureApi.list();
    setRequests(fresh);
  }, []);

  const clearRequests = useCallback(() => setRequests([]), []);

  return { requests, setRequests, addRequest, updateRequest, refreshRequests, clearRequests };
}
