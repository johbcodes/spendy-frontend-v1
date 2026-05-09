import { Request, Expense } from './types';

export function mapRequestToExportData(request: Request) {
  return {
    'Requested By': request.requestedBy,
    'Type': request.type,
    'Name': request.name,
    'Category': request.category,
    'Amount': request.amount,
    'Description': request.description,
    'Status': request.status,
    'Date Requested': request.dateRequested
  };
}

export function mapRequestsToExportData(requests: Request[]) {
  return requests.map(mapRequestToExportData);
}

export function getRequestDisplayName(request: Request, expenses: Expense[]): string {
  const expense = expenses.find(e => e.id === request.expenseId);
  const displayName = expense ? `${expense.eventName} - ${request.category}` : request.name;
  const isBatchExpense = request.expenseRequestType === 'batch' || 
    (expense && expense.expenseRequestType === 'batch');
  return isBatchExpense ? 
    (displayName.includes('(Batch Expense)') ? displayName : `${displayName} (Batch Expense)`) : 
    displayName;
}

export function getRequestCategory(request: Request, expenses: Expense[]): string {
  const expense = expenses.find(e => e.id === request.expenseId);
  return expense?.category || request.category || '-';
}

export function getRequestDescription(request: Request, expenses: Expense[]): string {
  const expense = expenses.find(e => e.id === request.expenseId);
  return expense?.description || request.description || '-';
}
