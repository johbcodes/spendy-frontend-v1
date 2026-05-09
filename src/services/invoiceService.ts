/**
 * Invoice Service
 * Handles all invoice-related data operations using backend API
 */

import { Invoice } from '../types';
import { invoiceAPI } from './backendAPI';

class InvoiceService {
  /**
   * Get all invoices from backend
   */
  async getAllInvoices(): Promise<Invoice[]> {
    try {
      const response = await invoiceAPI.getAll();
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
      return [];
    }
  }

  /**
   * Get invoice by ID
   */
  async getInvoiceById(invoiceId: string): Promise<Invoice | undefined> {
    try {
      const response = await invoiceAPI.getById(invoiceId);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch invoice:', error);
      return undefined;
    }
  }

  /**
   * Create a new invoice
   */
  async createInvoice(invoice: Partial<Invoice>): Promise<Invoice> {
    try {
      const response = await invoiceAPI.create(invoice);
      return response.data;
    } catch (error) {
      console.error('Failed to create invoice:', error);
      throw error;
    }
  }

  /**
   * Update an invoice
   */
  async updateInvoice(invoiceId: string, updates: Partial<Invoice>): Promise<Invoice | null> {
    try {
      const response = await invoiceAPI.update(invoiceId, updates);
      return response.data;
    } catch (error) {
      console.error('Failed to update invoice:', error);
      return null;
    }
  }

  /**
   * Delete an invoice
   */
  async deleteInvoice(invoiceId: string): Promise<boolean> {
    try {
      await invoiceAPI.delete(invoiceId);
      return true;
    } catch (error) {
      console.error('Failed to delete invoice:', error);
      return false;
    }
  }

  /**
   * Record payment for an invoice
   */
  async recordPayment(
    invoiceId: string,
    paymentData: {
      amount: number;
      paymentMethod: string;
      walletId: string;
      notes?: string;
    }
  ): Promise<any> {
    try {
      const response = await invoiceAPI.recordPayment(invoiceId, paymentData);
      return response.data;
    } catch (error) {
      console.error('Failed to record payment:', error);
      throw error;
    }
  }
}

export const invoiceService = new InvoiceService();
