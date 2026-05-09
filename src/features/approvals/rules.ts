import { Request, Expense, Payment } from './types';

export function isBatchRequest(request: Request): boolean {
  return Boolean(
    request.expenseRequestType === 'batch' ||
    request.paymentRequestType === 'bulk' ||
    (request.batchPaymentDetails && Array.isArray(request.batchPaymentDetails) && request.batchPaymentDetails.length > 0) ||
    (request.name && request.name.toLowerCase().includes('(batch expense)'))
  );
}

export function isBatchExpenseRequest(request: Request): boolean {
  return Boolean(
    request.expenseRequestType === 'batch' ||
    (request.name && request.name.toLowerCase().includes('(batch expense)'))
  );
}

export function hasBatchExpenses(request: Request, expenses: Expense[]): boolean {
  if (request.expenseId) {
    const expense = expenses.find((e: any) => e.id === request.expenseId);
    if (expense && expense.expenseRequestType === 'batch') {
      let totalItems = 0;
      if (expense.batchCategories) {
        expense.batchCategories.forEach((category: any) => {
          totalItems += category.items.length;
        });
      }
      if (expense.expenses) {
        totalItems += expense.expenses.length;
      }
      if (expense.csvData) {
        totalItems += expense.csvData.length;
      }
      return totalItems > 1;
    }
  }
  return false;
}

export function hasBatchDisbursement(request: Request): boolean {
  return Boolean(
    request.batchPaymentDetails &&
    Array.isArray(request.batchPaymentDetails) &&
    request.batchPaymentDetails.length > 1 &&
    request.expenseRequestType !== 'batch'
  );
}

export function hasAssignedSupplier(request: Request, expenses: Expense[]): boolean {
  if (request.expenseId) {
    const expense = expenses.find((e: any) => e.id === request.expenseId);
    if (expense && expense.supplier) return true;
  }
  return false;
}

export function isExpensePaid(request: Request, payments: Payment[]): boolean {
  if (request.expenseId) {
    return payments.some((p: any) => p.expenseId === request.expenseId);
  }
  return false;
}

export function getRequestDisplayAmount(request: Request): number {
  if ((request.expenseRequestType === 'batch' || request.paymentRequestType === 'bulk') && typeof request.totalAmount === 'number' && request.totalAmount > 0) {
    return Math.abs(request.totalAmount);
  }
  if (request.batchPaymentDetails && Array.isArray(request.batchPaymentDetails) && request.batchPaymentDetails.length > 0) {
    const sum = request.batchPaymentDetails.reduce((s, x) => s + (x.amount || 0), 0);
    return Math.abs(sum);
  }
  return Math.abs(request.amount || 0);
}

export function getBatchRecipientCount(request: Request, expenses: Expense[]): number {
  if (request.batchPaymentDetails && Array.isArray(request.batchPaymentDetails)) {
    return request.batchPaymentDetails.length;
  }
  if (request.expenseId) {
    const expense = expenses.find((e: any) => e.id === request.expenseId);
    if (expense) {
      let count = 0;
      if (expense.batchCategories) {
        expense.batchCategories.forEach((category: any) => {
          count += category.items.length;
        });
      }
      if (expense.expenses) {
        count += expense.expenses.length;
      }
      if (expense.csvData) {
        count += expense.csvData.length;
      }
      if (expense.batchPaymentDetails) {
        count += expense.batchPaymentDetails.length;
      }
      return count;
    }
  }
  return 0;
}

export function getStatusVariant(status: string): 'success' | 'warning' | 'danger' | 'default' {
  switch (status) {
    case 'Approved':
    case 'Completed':
      return 'success';
    case 'Pending':
      return 'warning';
    case 'Rejected':
      return 'danger';
    default:
      return 'default';
  }
}
