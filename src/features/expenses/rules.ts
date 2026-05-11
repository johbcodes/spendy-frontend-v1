import type { Expense, Event, User, Wallet } from './types';
import type { ExpenseFilters, ExpenseSummary } from './types';

export function getExpenseStatusVariant(
  status: string,
): 'success' | 'warning' | 'danger' | 'default' {
  if (status === 'Approved' || status === 'Completed') return 'success';
  if (status === 'Pending') return 'warning';
  if (status === 'Rejected') return 'danger';
  return 'default';
}

export function filterEventsForExpenseType(events: Event[], selectedType: string): Event[] {
  if (selectedType === 'event') return events.filter(event => event.type === 'Event');
  if (selectedType === 'activation') return events.filter(event => event.type === 'Activation');
  if (selectedType === 'operational') return events.filter(event => event.type === 'Operation');
  return events;
}

export function filterExpenses(expenses: Expense[], filters: ExpenseFilters): Expense[] {
  const searchTerm = filters.searchTerm.trim().toLowerCase();

  return expenses.filter(expense => {
    const matchesSearch =
      !searchTerm ||
      expense.title.toLowerCase().includes(searchTerm) ||
      expense.eventName.toLowerCase().includes(searchTerm) ||
      expense.category.toLowerCase().includes(searchTerm);

    const matchesEvent = filters.eventId === 'all' || expense.eventId === filters.eventId;
    const matchesCategory =
      filters.category === 'all' ||
      expense.category.toLowerCase() === filters.category.toLowerCase();
    const matchesStatus =
      filters.status === 'all' ||
      expense.status.toLowerCase() === filters.status.toLowerCase();
    const matchesType =
      filters.type === 'all' ||
      (filters.type === 'event' && expense.expenseType === 'Project Expenses') ||
      (filters.type === 'activation' && expense.expenseType === 'Activation Expense') ||
      (filters.type === 'operational' && expense.expenseType === 'Operational Expense');

    return matchesSearch && matchesEvent && matchesCategory && matchesStatus && matchesType;
  });
}

export function getStaffExpenses(expenses: Expense[], user: User): Expense[] {
  const userName = `${user.firstName} ${user.lastName}`;
  return expenses.filter(expense => expense.createdBy === userName);
}

export function summarizeExpenses(expenses: Expense[]): ExpenseSummary {
  const pendingExpenses = expenses.filter(expense => expense.status === 'Pending');
  const approvedExpenses = expenses.filter(expense => expense.status === 'Approved');
  const completedExpenses = expenses.filter(expense => expense.status === 'Completed');

  return {
    totalCount: expenses.length,
    totalAmount: expenses.reduce((sum, expense) => sum + expense.amount, 0),
    pendingCount: pendingExpenses.length,
    pendingAmount: pendingExpenses.reduce((sum, expense) => sum + expense.amount, 0),
    approvedCount: approvedExpenses.length,
    approvedAmount: approvedExpenses.reduce((sum, expense) => sum + expense.amount, 0),
    completedCount: completedExpenses.length,
    completedAmount: completedExpenses.reduce((sum, expense) => sum + expense.amount, 0),
  };
}

export function canEditExpense(expense: Expense, user?: User): boolean {
  if (!user || user.role !== 'Staff') return false;
  const userName = `${user.firstName} ${user.lastName}`;
  return (
    (expense.status === 'Pending' || expense.status === 'Rejected') &&
    expense.createdBy === userName
  );
}

export function markExpenseCompleted(expenses: Expense[], expenseId: string): Expense[] {
  return expenses.map(expense =>
    expense.id === expenseId
      ? { ...expense, status: 'Completed' as const, approvalStatus: 'completed' as const }
      : expense,
  );
}

export function updateExpenseInList(expenses: Expense[], expenseData: Partial<Expense>): Expense[] {
  if (!expenseData.id) return expenses;
  return expenses.map(expense =>
    expense.id === expenseData.id ? { ...expense, ...expenseData } : expense,
  );
}

export function selectExpenseWallet(expense: Expense, wallets: Wallet[]): Wallet | undefined {
  return expense.walletId ? wallets.find(wallet => wallet.id === expense.walletId) : undefined;
}
