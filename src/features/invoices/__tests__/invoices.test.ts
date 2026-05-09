import { describe, it, expect } from 'vitest';
import {
  getInvoiceStatusVariant,
  isInvoiceOverdue,
  canEditInvoice,
  canDeleteInvoice,
  canConvertQuote,
  canRecordPayment,
  validateInvoiceData,
  calculateBalance
} from '../rules';
import {
  filterInvoices,
  separateInvoicesAndQuotes,
  calculateInvoiceTotal,
  generateInvoiceNumber
} from '../api';
import { Invoice, InvoiceLineItem } from '../types';

describe('Invoices Rules', () => {
  describe('getInvoiceStatusVariant', () => {
    it('should return success for Paid status', () => {
      expect(getInvoiceStatusVariant('Paid')).toBe('success');
    });

    it('should return warning for Sent status', () => {
      expect(getInvoiceStatusVariant('Sent')).toBe('warning');
    });

    it('should return danger for Overdue status', () => {
      expect(getInvoiceStatusVariant('Overdue')).toBe('danger');
    });

    it('should return default for Draft status', () => {
      expect(getInvoiceStatusVariant('Draft')).toBe('default');
    });
  });

  describe('canEditInvoice', () => {
    it('should allow editing draft invoices', () => {
      const invoice: Invoice = {
        id: '1',
        invoiceNumber: 'INV-0001',
        documentType: 'Invoice',
        clientId: 'client-1',
        clientName: 'Test Client',
        clientEmail: 'test@example.com',
        clientPhone: '1234567890',
        issueDate: '2024-01-01',
        dueDate: '2024-01-31',
        paymentTerms: 'Net 30',
        lineItems: [],
        subtotal: 1000,
        taxRate: 16,
        taxAmount: 160,
        discount: 0,
        discountType: 'fixed',
        total: 1160,
        amountPaid: 0,
        balance: 1160,
        status: 'Draft',
        payments: [],
        currency: 'KES',
        createdBy: 'user-1',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      };
      expect(canEditInvoice(invoice)).toBe(true);
    });

    it('should not allow editing paid invoices', () => {
      const invoice: Invoice = {
        id: '1',
        invoiceNumber: 'INV-0001',
        documentType: 'Invoice',
        clientId: 'client-1',
        clientName: 'Test Client',
        clientEmail: 'test@example.com',
        clientPhone: '1234567890',
        issueDate: '2024-01-01',
        dueDate: '2024-01-31',
        paymentTerms: 'Net 30',
        lineItems: [],
        subtotal: 1000,
        taxRate: 16,
        taxAmount: 160,
        discount: 0,
        discountType: 'fixed',
        total: 1160,
        amountPaid: 1160,
        balance: 0,
        status: 'Paid',
        payments: [],
        currency: 'KES',
        createdBy: 'user-1',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      };
      expect(canEditInvoice(invoice)).toBe(false);
    });
  });

  describe('canDeleteInvoice', () => {
    it('should only allow deleting draft invoices', () => {
      const draftInvoice: Invoice = {
        id: '1',
        invoiceNumber: 'INV-0001',
        documentType: 'Invoice',
        clientId: 'client-1',
        clientName: 'Test Client',
        clientEmail: 'test@example.com',
        clientPhone: '1234567890',
        issueDate: '2024-01-01',
        dueDate: '2024-01-31',
        paymentTerms: 'Net 30',
        lineItems: [],
        subtotal: 1000,
        taxRate: 16,
        taxAmount: 160,
        discount: 0,
        discountType: 'fixed',
        total: 1160,
        amountPaid: 0,
        balance: 1160,
        status: 'Draft',
        payments: [],
        currency: 'KES',
        createdBy: 'user-1',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      };
      expect(canDeleteInvoice(draftInvoice)).toBe(true);

      const sentInvoice = { ...draftInvoice, status: 'Sent' as const };
      expect(canDeleteInvoice(sentInvoice)).toBe(false);
    });
  });

  describe('calculateBalance', () => {
    it('should calculate remaining balance', () => {
      const invoice: Invoice = {
        id: '1',
        invoiceNumber: 'INV-0001',
        documentType: 'Invoice',
        clientId: 'client-1',
        clientName: 'Test Client',
        clientEmail: 'test@example.com',
        clientPhone: '1234567890',
        issueDate: '2024-01-01',
        dueDate: '2024-01-31',
        paymentTerms: 'Net 30',
        lineItems: [],
        subtotal: 1000,
        taxRate: 16,
        taxAmount: 160,
        discount: 0,
        discountType: 'fixed',
        total: 1160,
        amountPaid: 500,
        balance: 660,
        status: 'Partially Paid',
        payments: [],
        currency: 'KES',
        createdBy: 'user-1',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      };
      expect(calculateBalance(invoice)).toBe(660);
    });
  });

  describe('validateInvoiceData', () => {
    it('should validate correct invoice data', () => {
      const data = {
        clientName: 'Test Client',
        clientEmail: 'test@example.com',
        lineItems: [
          {
            id: '1',
            itemName: 'Service',
            description: 'Test service',
            quantity: 1,
            unitPrice: 1000,
            amount: 1000
          }
        ]
      };
      const result = validateInvoiceData(data);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors for missing required fields', () => {
      const data = {
        clientName: '',
        clientEmail: '',
        lineItems: []
      };
      const result = validateInvoiceData(data);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});

describe('Invoices API', () => {
  describe('calculateInvoiceTotal', () => {
    it('should calculate totals with percentage discount', () => {
      const lineItems: InvoiceLineItem[] = [
        {
          id: '1',
          itemName: 'Service',
          description: 'Test',
          quantity: 1,
          unitPrice: 1000,
          amount: 1000
        }
      ];
      const result = calculateInvoiceTotal(lineItems, 16, 10, 'percentage');
      
      expect(result.subtotal).toBe(1000);
      expect(result.discountAmount).toBe(100);
      expect(result.taxAmount).toBe(144); // (1000 - 100) * 0.16
      expect(result.total).toBe(1044);
    });

    it('should calculate totals with fixed discount', () => {
      const lineItems: InvoiceLineItem[] = [
        {
          id: '1',
          itemName: 'Service',
          description: 'Test',
          quantity: 1,
          unitPrice: 1000,
          amount: 1000
        }
      ];
      const result = calculateInvoiceTotal(lineItems, 16, 100, 'fixed');
      
      expect(result.subtotal).toBe(1000);
      expect(result.discountAmount).toBe(100);
      expect(result.taxAmount).toBe(144);
      expect(result.total).toBe(1044);
    });
  });

  describe('generateInvoiceNumber', () => {
    it('should generate invoice number with correct prefix', () => {
      expect(generateInvoiceNumber('Invoice', 0)).toBe('INV-0001');
      expect(generateInvoiceNumber('Quote', 5)).toBe('QT-0006');
      expect(generateInvoiceNumber('Proforma', 99)).toBe('PF-0100');
    });
  });

  describe('separateInvoicesAndQuotes', () => {
    it('should separate invoices and quotes', () => {
      const invoices: Invoice[] = [
        {
          id: '1',
          invoiceNumber: 'INV-0001',
          documentType: 'Invoice',
          clientId: 'client-1',
          clientName: 'Test Client',
          clientEmail: 'test@example.com',
          clientPhone: '1234567890',
          issueDate: '2024-01-01',
          dueDate: '2024-01-31',
          paymentTerms: 'Net 30',
          lineItems: [],
          subtotal: 1000,
          taxRate: 16,
          taxAmount: 160,
          discount: 0,
          discountType: 'fixed',
          total: 1160,
          amountPaid: 0,
          balance: 1160,
          status: 'Draft',
          payments: [],
          currency: 'KES',
          createdBy: 'user-1',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01'
        },
        {
          id: '2',
          invoiceNumber: 'QT-0001',
          documentType: 'Quote',
          clientId: 'client-1',
          clientName: 'Test Client',
          clientEmail: 'test@example.com',
          clientPhone: '1234567890',
          issueDate: '2024-01-01',
          dueDate: '2024-01-31',
          paymentTerms: 'Net 30',
          lineItems: [],
          subtotal: 500,
          taxRate: 16,
          taxAmount: 80,
          discount: 0,
          discountType: 'fixed',
          total: 580,
          amountPaid: 0,
          balance: 580,
          status: 'Draft',
          payments: [],
          currency: 'KES',
          createdBy: 'user-1',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01'
        }
      ];

      const result = separateInvoicesAndQuotes(invoices);
      expect(result.invoices).toHaveLength(1);
      expect(result.quotes).toHaveLength(1);
      expect(result.invoices[0].documentType).toBe('Invoice');
      expect(result.quotes[0].documentType).toBe('Quote');
    });
  });
});
