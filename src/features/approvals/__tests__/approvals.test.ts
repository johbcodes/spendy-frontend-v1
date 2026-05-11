import { describe, it, expect } from 'vitest';
import {
  isBatchRequest,
  isBatchExpenseRequest,
  hasBatchDisbursement,
  hasAssignedSupplier,
  getRequestDisplayAmount,
  getBatchRecipientCount,
  getStatusVariant,
  isExpensePaid,
} from '../rules';
import { filterRequests } from '../api';
import { validateRejectionReason, validateWalletSelection } from '../schemas';
import { Request, Expense, Payment } from '../types';

describe('Approvals Rules', () => {
  describe('isBatchRequest', () => {
    it('should identify batch expense requests', () => {
      const request: Request = {
        id: '1',
        type: 'Event',
        name: 'Test Request',
        category: 'Marketing',
        amount: 1000,
        description: 'Test',
        requestedBy: 'John Doe',
        dateRequested: '2024-01-01',
        status: 'Pending',
        expenseRequestType: 'batch'
      };
      expect(isBatchRequest(request)).toBe(true);
    });

    it('should identify bulk payment requests', () => {
      const request: Request = {
        id: '1',
        type: 'Event',
        name: 'Test Request',
        category: 'Marketing',
        amount: 1000,
        description: 'Test',
        requestedBy: 'John Doe',
        dateRequested: '2024-01-01',
        status: 'Pending',
        paymentRequestType: 'bulk'
      };
      expect(isBatchRequest(request)).toBe(true);
    });

    it('should return false for single requests', () => {
      const request: Request = {
        id: '1',
        type: 'Event',
        name: 'Test Request',
        category: 'Marketing',
        amount: 1000,
        description: 'Test',
        requestedBy: 'John Doe',
        dateRequested: '2024-01-01',
        status: 'Pending'
      };
      expect(isBatchRequest(request)).toBe(false);
    });
  });

  describe('getRequestDisplayAmount', () => {
    it('should return totalAmount for batch requests', () => {
      const request: Request = {
        id: '1',
        type: 'Event',
        name: 'Test Request',
        category: 'Marketing',
        amount: 1000,
        totalAmount: 5000,
        description: 'Test',
        requestedBy: 'John Doe',
        dateRequested: '2024-01-01',
        status: 'Pending',
        expenseRequestType: 'batch'
      };
      expect(getRequestDisplayAmount(request)).toBe(5000);
    });

    it('should calculate sum from batchPaymentDetails', () => {
      const request: Request = {
        id: '1',
        type: 'Event',
        name: 'Test Request',
        category: 'Marketing',
        amount: 1000,
        description: 'Test',
        requestedBy: 'John Doe',
        dateRequested: '2024-01-01',
        status: 'Pending',
        batchPaymentDetails: [
          { name: 'Person 1', idNumber: '123', amount: 1000, reference: 'REF1', paymentMethod: 'mpesa' },
          { name: 'Person 2', idNumber: '456', amount: 2000, reference: 'REF2', paymentMethod: 'mpesa' }
        ]
      };
      expect(getRequestDisplayAmount(request)).toBe(3000);
    });

    it('should return amount for single requests', () => {
      const request: Request = {
        id: '1',
        type: 'Event',
        name: 'Test Request',
        category: 'Marketing',
        amount: 1000,
        description: 'Test',
        requestedBy: 'John Doe',
        dateRequested: '2024-01-01',
        status: 'Pending'
      };
      expect(getRequestDisplayAmount(request)).toBe(1000);
    });
  });

  describe('getStatusVariant', () => {
    it('should return success for Approved status', () => {
      expect(getStatusVariant('Approved')).toBe('success');
    });

    it('should return success for Completed status', () => {
      expect(getStatusVariant('Completed')).toBe('success');
    });

    it('should return warning for Pending status', () => {
      expect(getStatusVariant('Pending')).toBe('warning');
    });

    it('should return danger for Rejected status', () => {
      expect(getStatusVariant('Rejected')).toBe('danger');
    });

    it('should return default for unknown status', () => {
      expect(getStatusVariant('Unknown')).toBe('default');
    });
  });

  describe('isExpensePaid', () => {
    it('should return true if expense has payment', () => {
      const request: Request = {
        id: '1',
        type: 'Event',
        name: 'Test Request',
        category: 'Marketing',
        amount: 1000,
        description: 'Test',
        requestedBy: 'John Doe',
        dateRequested: '2024-01-01',
        status: 'Approved',
        expenseId: 'exp-1'
      };
      const payments: Payment[] = [
        {
          id: 'pay-1',
          eventId: 'evt-1',
          eventName: 'Test Event',
          expenseId: 'exp-1',
          initiatedBy: 'Admin',
          recipient: 'Supplier',
          amount: 1000,
          type: 'M-Pesa',
          status: 'Completed',
          dateTime: '2024-01-01',
          description: 'Payment'
        }
      ];
      expect(isExpensePaid(request, payments)).toBe(true);
    });

    it('should return false if expense has no payment', () => {
      const request: Request = {
        id: '1',
        type: 'Event',
        name: 'Test Request',
        category: 'Marketing',
        amount: 1000,
        description: 'Test',
        requestedBy: 'John Doe',
        dateRequested: '2024-01-01',
        status: 'Approved',
        expenseId: 'exp-1'
      };
      const payments: Payment[] = [];
      expect(isExpensePaid(request, payments)).toBe(false);
    });
  });
});

  describe('isBatchExpenseRequest', () => {
    it('returns true when expenseRequestType is batch', () => {
      const req: Request = { id: '1', type: 'Event', name: 'Batch', category: 'Marketing', amount: 0, description: '', requestedBy: 'A', dateRequested: '2024-01-01', status: 'Pending', expenseRequestType: 'batch' };
      expect(isBatchExpenseRequest(req)).toBe(true);
    });

    it('returns true when name contains (batch expense)', () => {
      const req: Request = { id: '1', type: 'Event', name: 'Event (Batch Expense)', category: 'Ops', amount: 0, description: '', requestedBy: 'A', dateRequested: '2024-01-01', status: 'Pending' };
      expect(isBatchExpenseRequest(req)).toBe(true);
    });

    it('returns false for single expense requests', () => {
      const req: Request = { id: '1', type: 'Event', name: 'Single', category: 'Ops', amount: 500, description: '', requestedBy: 'A', dateRequested: '2024-01-01', status: 'Pending' };
      expect(isBatchExpenseRequest(req)).toBe(false);
    });
  });

  describe('hasBatchDisbursement', () => {
    it('returns true when batchPaymentDetails has more than 1 entry and not a batch expense', () => {
      const req: Request = {
        id: '1', type: 'Event', name: 'Disbursement', category: 'Ops', amount: 0, description: '', requestedBy: 'A', dateRequested: '2024-01-01', status: 'Pending',
        batchPaymentDetails: [
          { name: 'P1', idNumber: '1', amount: 100, reference: 'R1', paymentMethod: 'mpesa' },
          { name: 'P2', idNumber: '2', amount: 200, reference: 'R2', paymentMethod: 'mpesa' },
        ],
      };
      expect(hasBatchDisbursement(req)).toBe(true);
    });

    it('returns false when only 1 payment detail entry', () => {
      const req: Request = {
        id: '1', type: 'Event', name: 'Single', category: 'Ops', amount: 0, description: '', requestedBy: 'A', dateRequested: '2024-01-01', status: 'Pending',
        batchPaymentDetails: [{ name: 'P1', idNumber: '1', amount: 100, reference: 'R1', paymentMethod: 'mpesa' }],
      };
      expect(hasBatchDisbursement(req)).toBe(false);
    });

    it('returns false when expenseRequestType is batch even with multiple entries', () => {
      const req: Request = {
        id: '1', type: 'Event', name: 'Batch', category: 'Ops', amount: 0, description: '', requestedBy: 'A', dateRequested: '2024-01-01', status: 'Pending',
        expenseRequestType: 'batch',
        batchPaymentDetails: [
          { name: 'P1', idNumber: '1', amount: 100, reference: 'R1', paymentMethod: 'mpesa' },
          { name: 'P2', idNumber: '2', amount: 200, reference: 'R2', paymentMethod: 'mpesa' },
        ],
      };
      expect(hasBatchDisbursement(req)).toBe(false);
    });
  });

  describe('hasAssignedSupplier', () => {
    it('returns true when linked expense has a supplier', () => {
      const req: Request = { id: '1', type: 'Event', name: 'R', category: 'Ops', amount: 0, description: '', requestedBy: 'A', dateRequested: '2024-01-01', status: 'Pending', expenseId: 'e-1' };
      const expenses: Expense[] = [{ id: 'e-1', supplier: 'Acme Corp' } as any];
      expect(hasAssignedSupplier(req, expenses)).toBe(true);
    });

    it('returns false when linked expense has no supplier', () => {
      const req: Request = { id: '1', type: 'Event', name: 'R', category: 'Ops', amount: 0, description: '', requestedBy: 'A', dateRequested: '2024-01-01', status: 'Pending', expenseId: 'e-1' };
      const expenses: Expense[] = [{ id: 'e-1' } as any];
      expect(hasAssignedSupplier(req, expenses)).toBe(false);
    });

    it('returns false when request has no expenseId', () => {
      const req: Request = { id: '1', type: 'Event', name: 'R', category: 'Ops', amount: 0, description: '', requestedBy: 'A', dateRequested: '2024-01-01', status: 'Pending' };
      expect(hasAssignedSupplier(req, [])).toBe(false);
    });
  });

  describe('getBatchRecipientCount', () => {
    it('counts from batchPaymentDetails on request', () => {
      const req: Request = {
        id: '1', type: 'Event', name: 'R', category: 'Ops', amount: 0, description: '', requestedBy: 'A', dateRequested: '2024-01-01', status: 'Pending',
        batchPaymentDetails: [
          { name: 'P1', idNumber: '1', amount: 100, reference: 'R1', paymentMethod: 'mpesa' },
          { name: 'P2', idNumber: '2', amount: 200, reference: 'R2', paymentMethod: 'mpesa' },
          { name: 'P3', idNumber: '3', amount: 300, reference: 'R3', paymentMethod: 'mpesa' },
        ],
      };
      expect(getBatchRecipientCount(req, [])).toBe(3);
    });

    it('returns 0 when no batch data present', () => {
      const req: Request = { id: '1', type: 'Event', name: 'R', category: 'Ops', amount: 500, description: '', requestedBy: 'A', dateRequested: '2024-01-01', status: 'Pending' };
      expect(getBatchRecipientCount(req, [])).toBe(0);
    });
  });

describe('Approvals Schemas', () => {
  describe('validateRejectionReason', () => {
    it('returns invalid when reason is empty', () => {
      expect(validateRejectionReason('')).toEqual({ valid: false, error: 'Rejection reason is required' });
    });

    it('returns invalid when reason is only whitespace', () => {
      expect(validateRejectionReason('   ')).toEqual({ valid: false, error: 'Rejection reason is required' });
    });

    it('returns invalid when reason is shorter than 10 characters', () => {
      expect(validateRejectionReason('Too short')).toEqual({ valid: false, error: 'Rejection reason must be at least 10 characters' });
    });

    it('returns valid for a reason of exactly 10 characters', () => {
      expect(validateRejectionReason('1234567890')).toEqual({ valid: true });
    });

    it('returns valid for a longer reason', () => {
      expect(validateRejectionReason('Budget exceeded for this quarter')).toEqual({ valid: true });
    });
  });

  describe('validateWalletSelection', () => {
    it('returns invalid when walletId is empty', () => {
      expect(validateWalletSelection('')).toEqual({ valid: false, error: 'Please select a wallet' });
    });

    it('returns invalid when walletId is only whitespace', () => {
      expect(validateWalletSelection('   ')).toEqual({ valid: false, error: 'Please select a wallet' });
    });

    it('returns valid for a non-empty walletId', () => {
      expect(validateWalletSelection('wallet-123')).toEqual({ valid: true });
    });
  });
});

describe('Approvals API', () => {
  describe('filterRequests', () => {
    const requests: Request[] = [
      {
        id: '1',
        type: 'Event',
        name: 'Marketing Campaign',
        category: 'Marketing',
        amount: 1000,
        description: 'Test',
        requestedBy: 'John Doe',
        dateRequested: '2024-01-01',
        status: 'Pending'
      },
      {
        id: '2',
        type: 'Operation',
        name: 'Office Supplies',
        category: 'Logistics',
        amount: 500,
        description: 'Test',
        requestedBy: 'Jane Smith',
        dateRequested: '2024-01-02',
        status: 'Approved'
      },
      {
        id: '3',
        type: 'Activation',
        name: 'Brand Activation',
        category: 'Marketing',
        amount: 2000,
        description: 'Test',
        requestedBy: 'Bob Johnson',
        dateRequested: '2024-01-03',
        status: 'Rejected'
      }
    ];

    it('should filter by search term', () => {
      const result = filterRequests(requests, 'marketing', 'all');
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Marketing Campaign');
      expect(result[1].name).toBe('Brand Activation');
    });

    it('should filter by status', () => {
      const result = filterRequests(requests, '', 'approved');
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('Approved');
    });

    it('should filter by both search and status', () => {
      const result = filterRequests(requests, 'marketing', 'pending');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Marketing Campaign');
    });

    it('should return all requests when no filters applied', () => {
      const result = filterRequests(requests, '', 'all');
      expect(result).toHaveLength(3);
    });
  });
});
