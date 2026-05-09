import { describe, expect, it } from 'vitest';
import {
  canEditExpense,
  filterEventsForExpenseType,
  filterExpenses,
  getExpenseStatusVariant,
  getStaffExpenses,
  markExpenseCompleted,
  selectExpenseWallet,
  summarizeExpenses,
  updateExpenseInList,
} from '../rules';
import type { Event, Expense, User, Wallet } from '../types';

const staffUser: User = {
  id: 'u-staff',
  firstName: 'Bob',
  lastName: 'Staff',
  email: 'bob@co.com',
  phone: '',
  country: 'Kenya',
  role: 'Staff',
  status: 'Active',
  modulesAssigned: ['Expenses'],
  createdAt: new Date().toISOString(),
};

const adminUser: User = {
  ...staffUser,
  id: 'u-admin',
  firstName: 'Alice',
  lastName: 'Admin',
  role: 'Admin',
  modulesAssigned: ['All'],
};

const launchEvent: Event = {
  id: 'event-1',
  name: 'Launch',
  type: 'Project',
  category: 'Launch',
  client: 'Acme',
  budget: 100000,
  spent: 0,
  startDate: '2026-06-01T09:00',
  endDate: '2026-06-01T18:00',
  status: 'Active',
  documents: [],
};

const activationEvent: Event = {
  ...launchEvent,
  id: 'event-2',
  name: 'Activation',
  type: 'Activation',
};

function buildExpense(overrides: Partial<Expense>): Expense {
  return {
    id: 'expense-1',
    title: 'Venue',
    eventId: launchEvent.id,
    eventName: launchEvent.name,
    category: 'Venue',
    client: 'Acme',
    amount: 10000,
    budget: 10000,
    createdBy: 'Bob Staff',
    startDate: '2026-06-01T09:00',
    dueDate: '2026-06-02T09:00',
    status: 'Pending',
    expenseType: 'Project Expenses',
    createdByUserId: staffUser.id,
    createdByRole: 'Staff',
    approvalRequired: true,
    approvalStatus: 'pending',
    ...overrides,
  };
}

const expenses = [
  buildExpense({ id: 'expense-1', title: 'Venue', amount: 10000, status: 'Pending', expenseType: 'Project Expenses' }),
  buildExpense({ id: 'expense-2', title: 'Promoters', category: 'Staffing', amount: 15000, status: 'Approved', expenseType: 'Activation Expense', eventId: activationEvent.id, eventName: activationEvent.name }),
  buildExpense({ id: 'expense-3', title: 'Fuel', category: 'Transport', amount: 5000, status: 'Completed', expenseType: 'Operational Expense', createdBy: 'Alice Admin' }),
];

describe('expense filtering', () => {
  it('filters expenses by search, status, event, category, and type', () => {
    expect(filterExpenses(expenses, { searchTerm: 'venue', eventId: 'all', category: 'all', status: 'all', type: 'all' })).toHaveLength(1);
    expect(filterExpenses(expenses, { searchTerm: '', eventId: activationEvent.id, category: 'venue', status: 'approved', type: 'activation' })).toHaveLength(0);
    expect(filterExpenses(expenses, { searchTerm: '', eventId: activationEvent.id, category: 'Staffing', status: 'approved', type: 'activation' })).toHaveLength(1);
  });

  it('filters event dropdown options by expense type', () => {
    expect(filterEventsForExpenseType([launchEvent, activationEvent], 'event')).toEqual([launchEvent]);
    expect(filterEventsForExpenseType([launchEvent, activationEvent], 'activation')).toEqual([activationEvent]);
  });

  it('returns only staff-owned expenses', () => {
    expect(getStaffExpenses(expenses, staffUser).map(expense => expense.id)).toEqual(['expense-1', 'expense-2']);
  });
});

describe('expense summaries and display', () => {
  it('summarizes counts and amounts by status', () => {
    expect(summarizeExpenses(expenses)).toEqual({
      totalCount: 3,
      totalAmount: 30000,
      pendingCount: 1,
      pendingAmount: 10000,
      approvedCount: 1,
      approvedAmount: 15000,
      completedCount: 1,
      completedAmount: 5000,
    });
  });

  it('maps statuses to badge variants', () => {
    expect(getExpenseStatusVariant('Approved')).toBe('success');
    expect(getExpenseStatusVariant('Completed')).toBe('success');
    expect(getExpenseStatusVariant('Pending')).toBe('warning');
    expect(getExpenseStatusVariant('Rejected')).toBe('danger');
  });
});

describe('expense mutations', () => {
  it('allows staff to edit their pending or rejected expense only', () => {
    expect(canEditExpense(expenses[0], staffUser)).toBe(true);
    expect(canEditExpense({ ...expenses[0], status: 'Approved' }, staffUser)).toBe(false);
    expect(canEditExpense(expenses[0], adminUser)).toBe(false);
  });

  it('marks an expense completed', () => {
    const updated = markExpenseCompleted(expenses, 'expense-1');
    expect(updated[0].status).toBe('Completed');
    expect(updated[0].approvalStatus).toBe('completed');
  });

  it('updates expense data by id', () => {
    const updated = updateExpenseInList(expenses, { id: 'expense-1', title: 'Updated Venue' });
    expect(updated[0].title).toBe('Updated Venue');
  });

  it('selects the wallet linked to an expense', () => {
    const wallets: Wallet[] = [
      { id: 'wallet-1', name: 'Events Wallet', type: 'Events Wallet', balance: 1000, status: 'Active', createdAt: '', isDefault: false },
    ];
    expect(selectExpenseWallet({ ...expenses[0], walletId: 'wallet-1' }, wallets)?.name).toBe('Events Wallet');
  });
});
