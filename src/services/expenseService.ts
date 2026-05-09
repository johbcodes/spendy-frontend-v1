/**
 * Expense Service
 * Handles all expense-related data operations using backend API
 */

import { Expense } from '../types';
import { expenseAPI, Expense as BackendExpense } from './backendAPI';

class ExpenseService {
  /**
   * Convert backend expense to app expense format
   */
  private convertToAppExpense(backendExpense: BackendExpense): Expense {
    // Extract creator name from createdBy object or use a fallback
    let createdByName = 'Unknown';
    if (backendExpense.createdBy) {
      if (typeof backendExpense.createdBy === 'string') {
        createdByName = backendExpense.createdBy;
      } else if (typeof backendExpense.createdBy === 'object' && backendExpense.createdBy !== null) {
        const creator = backendExpense.createdBy as any;
        createdByName = creator.firstName && creator.lastName
          ? `${creator.firstName} ${creator.lastName}`
          : creator.email || 'Unknown';
      }
    }

    // Determine expense type from event if available
    let expenseType = 'Project';
    if (backendExpense.event && typeof backendExpense.event === 'object') {
      const event = backendExpense.event as any;
      expenseType = event.type || 'Project';
    }

    return {
      id: backendExpense.id,
      title: backendExpense.title,
      eventId: backendExpense.eventId || '',
      eventName: backendExpense.eventName || '',
      walletId: backendExpense.walletId || '',
      category: backendExpense.category || '',
      client: backendExpense.client || '',
      amount: backendExpense.amount,
      budget: backendExpense.budget,
      supplier: backendExpense.supplier || '',
      supplierCategory: (backendExpense as any).supplierCategory || '',
      createdBy: createdByName,
      createdByUserId: backendExpense.createdById,
      createdByRole: (backendExpense.createdBy as any)?.role || 'Staff',
      startDate: backendExpense.startDate || '',
      dueDate: backendExpense.dueDate || '',
      status: backendExpense.status,
      needsApproval: backendExpense.needsApproval,
      approvalRequired: backendExpense.needsApproval,
      approvalStatus: backendExpense.status === 'Approved' ? 'approved' : backendExpense.status === 'Rejected' ? 'rejected' : 'pending',
      description: backendExpense.description || '',
      receipt: backendExpense.receipt || '',
      expenseType: expenseType,
      batchPaymentDetails: backendExpense.batchPaymentDetails,
      approvedBy: '',
      approvedAt: '',
      rejectionReason: '',
    };
  }

  /**
   * Get all expenses from backend
   */
  async getAllExpenses(): Promise<Expense[]> {
    try {
      const response = await expenseAPI.getAll();
      return response.data.map(e => this.convertToAppExpense(e));
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
      return [];
    }
  }

  /**
   * Get expense by ID
   */
  async getExpenseById(expenseId: string): Promise<Expense | undefined> {
    try {
      const response = await expenseAPI.getById(expenseId);
      return this.convertToAppExpense(response.data);
    } catch (error) {
      console.error('Failed to fetch expense:', error);
      return undefined;
    }
  }

  /**
   * Create a new expense
   */
  async createExpense(expense: Expense): Promise<Expense> {
    try {
      const response = await expenseAPI.create({
        title: expense.title,
        eventId: expense.eventId,
        eventName: expense.eventName,
        walletId: expense.walletId,
        category: expense.category,
        client: expense.client,
        amount: expense.amount,
        budget: expense.budget,
        supplier: expense.supplier,
        startDate: expense.startDate,
        dueDate: expense.dueDate,
        status: expense.status,
        needsApproval: expense.needsApproval,
        description: expense.description,
        receipt: expense.receipt,
        batchPaymentDetails: expense.batchPaymentDetails,
      });
      return this.convertToAppExpense(response.data);
    } catch (error) {
      console.error('Failed to create expense:', error);
      throw error;
    }
  }

  /**
   * Update an expense
   */
  async updateExpense(expenseId: string, updates: Partial<Expense>): Promise<Expense | null> {
    try {
      const response = await expenseAPI.update(expenseId, {
        title: updates.title,
        eventId: updates.eventId,
        eventName: updates.eventName,
        walletId: updates.walletId,
        category: updates.category,
        client: updates.client,
        amount: updates.amount,
        budget: updates.budget,
        supplier: updates.supplier,
        startDate: updates.startDate,
        dueDate: updates.dueDate,
        status: updates.status,
        needsApproval: updates.needsApproval,
        description: updates.description,
        receipt: updates.receipt,
        batchPaymentDetails: updates.batchPaymentDetails,
      });
      return this.convertToAppExpense(response.data);
    } catch (error) {
      console.error('Failed to update expense:', error);
      return null;
    }
  }

  /**
   * Delete an expense
   */
  async deleteExpense(expenseId: string): Promise<boolean> {
    try {
      await expenseAPI.delete(expenseId);
      return true;
    } catch (error) {
      console.error('Failed to delete expense:', error);
      return false;
    }
  }

  /**
   * Get expenses by event
   */
  async getExpensesByEvent(eventId: string): Promise<Expense[]> {
    try {
      const response = await expenseAPI.getByEvent(eventId);
      return response.data.map(e => this.convertToAppExpense(e));
    } catch (error) {
      console.error('Failed to fetch expenses by event:', error);
      return [];
    }
  }

  /**
   * Get expenses by status
   */
  async getExpensesByStatus(status: string): Promise<Expense[]> {
    try {
      const response = await expenseAPI.getAll({ status });
      return response.data.map(e => this.convertToAppExpense(e));
    } catch (error) {
      console.error('Failed to fetch expenses by status:', error);
      return [];
    }
  }

  /**
   * Get expenses by category
   */
  async getExpensesByCategory(category: string): Promise<Expense[]> {
    try {
      const response = await expenseAPI.getAll({ category });
      return response.data.map(e => this.convertToAppExpense(e));
    } catch (error) {
      console.error('Failed to fetch expenses by category:', error);
      return [];
    }
  }

  /**
   * Get expenses by created user
   */
  async getExpensesByUser(userId: string): Promise<Expense[]> {
    try {
      const allExpenses = await this.getAllExpenses();
      return allExpenses.filter(expense => expense.createdByUserId === userId);
    } catch (error) {
      console.error('Failed to fetch expenses by user:', error);
      return [];
    }
  }

  /**
   * Approve expense
   */
  async approveExpense(expenseId: string, approvedBy: string): Promise<Expense | null> {
    try {
      const response = await expenseAPI.approve(expenseId, {
        status: 'Approved',
        notes: `Approved by ${approvedBy}`,
      });
      return this.convertToAppExpense(response.data);
    } catch (error) {
      console.error('Failed to approve expense:', error);
      return null;
    }
  }

  /**
   * Reject expense
   */
  async rejectExpense(expenseId: string, reason: string): Promise<Expense | null> {
    try {
      const response = await expenseAPI.approve(expenseId, {
        status: 'Rejected',
        notes: reason,
      });
      return this.convertToAppExpense(response.data);
    } catch (error) {
      console.error('Failed to reject expense:', error);
      return null;
    }
  }

  /**
   * Complete expense (pay it)
   */
  async completeExpense(expenseId: string, walletId: string): Promise<Expense | null> {
    try {
      const response = await expenseAPI.pay(expenseId, {
        walletId,
        notes: 'Expense completed and paid',
      });
      const result = response.data as any;
      return this.convertToAppExpense(result.expense);
    } catch (error) {
      console.error('Failed to complete expense:', error);
      return null;
    }
  }

  /**
   * Get expenses that need approval
   */
  async getExpensesNeedingApproval(): Promise<Expense[]> {
    try {
      const response = await expenseAPI.getAll({ needsApproval: 'true', status: 'Pending' });
      return response.data.map(e => this.convertToAppExpense(e));
    } catch (error) {
      console.error('Failed to fetch expenses needing approval:', error);
      return [];
    }
  }
}

export const expenseService = new ExpenseService();
