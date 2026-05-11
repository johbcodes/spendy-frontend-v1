import { describe, it, expect } from 'vitest';
import {
  calculateBusinessMetrics,
  calculateApprovalMetrics,
  calculateWalletMetrics,
  calculateEventProfitLoss,
  formatCurrency,
  getProfitLossColor
} from '../rules';
import {
  filterExpensesByDateRange,
  calculateMonthlyExpenseTrend,
  calculateCategoryBreakdown,
  getUniqueClients
} from '../api';
import { Event, Expense, Wallet, Request, Invoice, WalletMetrics } from '../types';

describe('Reports Rules', () => {
  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(1000)).toContain('1,000');
      expect(formatCurrency(1000000)).toContain('1,000,000');
    });
  });

  describe('getProfitLossColor', () => {
    it('should return success for positive amounts', () => {
      expect(getProfitLossColor(100)).toBe('success');
    });

    it('should return danger for negative amounts', () => {
      expect(getProfitLossColor(-100)).toBe('danger');
    });

    it('should return default for zero', () => {
      expect(getProfitLossColor(0)).toBe('default');
    });
  });

  describe('calculateApprovalMetrics', () => {
    it('should calculate approval metrics correctly', () => {
      const requests: Request[] = [
        {
          id: '1',
          type: 'Event',
          name: 'Test Request 1',
          category: 'Marketing',
          amount: 1000,
          description: 'Test',
          requestedBy: 'User 1',
          dateRequested: '2024-01-01',
          status: 'Pending'
        },
        {
          id: '2',
          type: 'Event',
          name: 'Test Request 2',
          category: 'Marketing',
          amount: 2000,
          description: 'Test',
          requestedBy: 'User 2',
          dateRequested: '2024-01-02',
          status: 'Approved'
        },
        {
          id: '3',
          type: 'Event',
          name: 'Test Request 3',
          category: 'Marketing',
          amount: 500,
          description: 'Test',
          requestedBy: 'User 3',
          dateRequested: '2024-01-03',
          status: 'Rejected'
        }
      ];

      const metrics = calculateApprovalMetrics(requests);
      expect(metrics.pending).toBe(1);
      expect(metrics.approved).toBe(1);
      expect(metrics.rejected).toBe(1);
      expect(metrics.pendingAmount).toBe(1000);
    });
  });

  describe('calculateWalletMetrics', () => {
    it('should calculate wallet metrics correctly', () => {
      const wallets: Wallet[] = [
        {
          id: '1',
          name: 'Main Wallet',
          type: 'Main Wallet',
          balance: 10000,
          status: 'Active',
          createdAt: '2024-01-01'
        },
        {
          id: '2',
          name: 'Events Wallet',
          type: 'Events Wallet',
          balance: 5000,
          status: 'Active',
          createdAt: '2024-01-01'
        }
      ];

      const expenses: Expense[] = [
        {
          id: '1',
          title: 'Test Expense',
          eventId: 'evt-1',
          eventName: 'Test Event',
          walletId: 'wallet-1',
          category: 'Marketing',
          client: 'Test Client',
          amount: 2000,
          budget: 5000,
          createdBy: 'User 1',
          startDate: '2024-01-01',
          dueDate: '2024-01-31',
          status: 'Approved',
          createdByUserId: 'user-1',
          createdByRole: 'Admin',
          approvalRequired: false,
          approvalStatus: 'approved'
        }
      ];

      const metrics = calculateWalletMetrics(wallets, expenses);
      expect(metrics.totalBalance).toBe(15000);
      expect(metrics.totalAllocated).toBe(2000);
      expect(metrics.available).toBe(13000);
    });
  });

  describe('calculateEventProfitLoss', () => {
    it('should calculate profit/loss correctly', () => {
      const invoices: Invoice[] = [
        {
          id: '1',
          invoiceNumber: 'INV-001',
          documentType: 'Invoice',
          clientId: 'client-1',
          clientName: 'Test Client',
          clientEmail: 'test@example.com',
          clientPhone: '1234567890',
          eventId: 'evt-1',
          eventName: 'Test Event',
          issueDate: '2024-01-01',
          dueDate: '2024-01-31',
          paymentTerms: 'Net 30',
          lineItems: [],
          subtotal: 10000,
          taxRate: 16,
          taxAmount: 1600,
          discount: 0,
          discountType: 'fixed',
          total: 11600,
          amountPaid: 11600,
          balance: 0,
          status: 'Paid',
          payments: [],
          currency: 'KES',
          createdBy: 'user-1',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01'
        }
      ];

      const expenses: Expense[] = [
        {
          id: '1',
          title: 'Test Expense',
          eventId: 'evt-1',
          eventName: 'Test Event',
          category: 'Marketing',
          client: 'Test Client',
          amount: 5000,
          budget: 10000,
          createdBy: 'User 1',
          startDate: '2024-01-01',
          dueDate: '2024-01-31',
          status: 'Approved',
          createdByUserId: 'user-1',
          createdByRole: 'Admin',
          approvalRequired: false,
          approvalStatus: 'approved'
        }
      ];

      const profitLoss = calculateEventProfitLoss('evt-1', 'Test Event', invoices, expenses);
      expect(profitLoss.totalRevenue).toBe(11600);
      expect(profitLoss.totalExpenses).toBe(5000);
      expect(profitLoss.grossProfit).toBe(6600);
      expect(profitLoss.isProfit).toBe(true);
    });
  });
});

describe('Reports API', () => {
  describe('filterExpensesByDateRange', () => {
    const expenses: Expense[] = [
      {
        id: '1',
        title: 'Expense 1',
        eventId: 'evt-1',
        eventName: 'Event 1',
        category: 'Marketing',
        client: 'Client 1',
        amount: 1000,
        budget: 5000,
        createdBy: 'User 1',
        startDate: '2024-01-15',
        dueDate: '2024-01-31',
        status: 'Approved',
        createdByUserId: 'user-1',
        createdByRole: 'Admin',
        approvalRequired: false,
        approvalStatus: 'approved'
      },
      {
        id: '2',
        title: 'Expense 2',
        eventId: 'evt-2',
        eventName: 'Event 2',
        category: 'Logistics',
        client: 'Client 2',
        amount: 2000,
        budget: 5000,
        createdBy: 'User 2',
        startDate: '2024-02-15',
        dueDate: '2024-02-28',
        status: 'Approved',
        createdByUserId: 'user-2',
        createdByRole: 'Admin',
        approvalRequired: false,
        approvalStatus: 'approved'
      }
    ];

    it('should filter by start date', () => {
      const result = filterExpensesByDateRange(expenses, '2024-02-01', undefined);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('should filter by end date', () => {
      const result = filterExpensesByDateRange(expenses, undefined, '2024-01-31');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('should filter by date range', () => {
      const result = filterExpensesByDateRange(expenses, '2024-01-01', '2024-01-31');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });
  });

  describe('calculateCategoryBreakdown', () => {
    it('should calculate category breakdown correctly', () => {
      const expenses: Expense[] = [
        {
          id: '1',
          title: 'Expense 1',
          eventId: 'evt-1',
          eventName: 'Event 1',
          category: 'Transport',
          client: 'Client 1',
          amount: 1000,
          budget: 5000,
          createdBy: 'User 1',
          startDate: '2024-01-01',
          dueDate: '2024-01-31',
          status: 'Approved',
          createdByUserId: 'user-1',
          createdByRole: 'Admin',
          approvalRequired: false,
          approvalStatus: 'approved'
        },
        {
          id: '2',
          title: 'Expense 2',
          eventId: 'evt-2',
          eventName: 'Event 2',
          category: 'Transport',
          client: 'Client 2',
          amount: 2000,
          budget: 5000,
          createdBy: 'User 2',
          startDate: '2024-01-01',
          dueDate: '2024-01-31',
          status: 'Approved',
          createdByUserId: 'user-2',
          createdByRole: 'Admin',
          approvalRequired: false,
          approvalStatus: 'approved'
        }
      ];

      const breakdown = calculateCategoryBreakdown(expenses);
      const transportCategory = breakdown.find(c => c.name === 'Transport');
      expect(transportCategory?.value).toBe(3000);
    });
  });

  describe('getUniqueClients', () => {
    it('should return unique clients', () => {
      const events: Event[] = [
        {
          id: '1',
          name: 'Event 1',
          type: 'Event',
          category: 'Corporate',
          client: 'Client A',
          budget: 10000,
          spent: 5000,
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          status: 'Active',
          documents: []
        },
        {
          id: '2',
          name: 'Event 2',
          type: 'Event',
          category: 'Corporate',
          client: 'Client B',
          budget: 15000,
          spent: 7000,
          startDate: '2024-02-01',
          endDate: '2024-02-28',
          status: 'Active',
          documents: []
        },
        {
          id: '3',
          name: 'Event 3',
          type: 'Event',
          category: 'Corporate',
          client: 'Client A',
          budget: 12000,
          spent: 6000,
          startDate: '2024-03-01',
          endDate: '2024-03-31',
          status: 'Active',
          documents: []
        }
      ];

      const clients = getUniqueClients(events);
      expect(clients).toHaveLength(2);
      expect(clients).toContain('Client A');
      expect(clients).toContain('Client B');
    });
  });
});
