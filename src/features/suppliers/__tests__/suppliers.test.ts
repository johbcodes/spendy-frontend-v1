import { describe, it, expect } from 'vitest';
import {
  canDeleteSupplier,
  isSupplierActive,
  isSupplierBlacklisted,
  hasPaymentDetails,
  getPaymentMethodLabel,
  validateSupplierData,
  getSupplierStatusVariant
} from '../rules';
import { filterSuppliers, getSupplierCategories, getActiveSuppliers } from '../api';
import { Supplier } from '../types';

describe('Suppliers Rules', () => {
  describe('isSupplierActive', () => {
    it('should return true for active suppliers', () => {
      const supplier: Supplier = {
        id: '1',
        name: 'Test Supplier',
        category: 'Logistics',
        contactPerson: 'John Doe',
        phone: '1234567890',
        email: 'test@example.com',
        status: 'Active',
        documents: []
      };
      expect(isSupplierActive(supplier)).toBe(true);
    });

    it('should return false for inactive suppliers', () => {
      const supplier: Supplier = {
        id: '1',
        name: 'Test Supplier',
        category: 'Logistics',
        contactPerson: 'John Doe',
        phone: '1234567890',
        email: 'test@example.com',
        status: 'Inactive',
        documents: []
      };
      expect(isSupplierActive(supplier)).toBe(false);
    });
  });

  describe('hasPaymentDetails', () => {
    it('should return true if supplier has M-Pesa details', () => {
      const supplier: Supplier = {
        id: '1',
        name: 'Test Supplier',
        category: 'Logistics',
        contactPerson: 'John Doe',
        phone: '1234567890',
        email: 'test@example.com',
        status: 'Active',
        mpesaPhone: '0712345678',
        documents: []
      };
      expect(hasPaymentDetails(supplier)).toBe(true);
    });

    it('should return true if supplier has paybill details', () => {
      const supplier: Supplier = {
        id: '1',
        name: 'Test Supplier',
        category: 'Logistics',
        contactPerson: 'John Doe',
        phone: '1234567890',
        email: 'test@example.com',
        status: 'Active',
        paybillNumber: '123456',
        documents: []
      };
      expect(hasPaymentDetails(supplier)).toBe(true);
    });

    it('should return false if supplier has no payment details', () => {
      const supplier: Supplier = {
        id: '1',
        name: 'Test Supplier',
        category: 'Logistics',
        contactPerson: 'John Doe',
        phone: '1234567890',
        email: 'test@example.com',
        status: 'Active',
        documents: []
      };
      expect(hasPaymentDetails(supplier)).toBe(false);
    });
  });

  describe('getPaymentMethodLabel', () => {
    it('should return M-Pesa for suppliers with mpesaPhone', () => {
      const supplier: Supplier = {
        id: '1',
        name: 'Test Supplier',
        category: 'Logistics',
        contactPerson: 'John Doe',
        phone: '1234567890',
        email: 'test@example.com',
        status: 'Active',
        mpesaPhone: '0712345678',
        documents: []
      };
      expect(getPaymentMethodLabel(supplier)).toBe('M-Pesa');
    });

    it('should return Paybill for suppliers with paybillNumber', () => {
      const supplier: Supplier = {
        id: '1',
        name: 'Test Supplier',
        category: 'Logistics',
        contactPerson: 'John Doe',
        phone: '1234567890',
        email: 'test@example.com',
        status: 'Active',
        paybillNumber: '123456',
        documents: []
      };
      expect(getPaymentMethodLabel(supplier)).toBe('Paybill');
    });

    it('should return Not Set for suppliers without payment details', () => {
      const supplier: Supplier = {
        id: '1',
        name: 'Test Supplier',
        category: 'Logistics',
        contactPerson: 'John Doe',
        phone: '1234567890',
        email: 'test@example.com',
        status: 'Active',
        documents: []
      };
      expect(getPaymentMethodLabel(supplier)).toBe('Not Set');
    });
  });

  describe('validateSupplierData', () => {
    it('should validate correct supplier data', () => {
      const data = {
        name: 'Test Supplier',
        category: 'Logistics',
        contactPerson: 'John Doe',
        phone: '1234567890',
        email: 'test@example.com'
      };
      const result = validateSupplierData(data);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors for missing required fields', () => {
      const data = {
        name: '',
        category: '',
        contactPerson: '',
        phone: ''
      };
      const result = validateSupplierData(data);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should return error for invalid email', () => {
      const data = {
        name: 'Test Supplier',
        category: 'Logistics',
        contactPerson: 'John Doe',
        phone: '1234567890',
        email: 'invalid-email'
      };
      const result = validateSupplierData(data);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid email address');
    });
  });

  describe('getSupplierStatusVariant', () => {
    it('should return success for Active status', () => {
      expect(getSupplierStatusVariant('Active')).toBe('success');
    });

    it('should return warning for Inactive status', () => {
      expect(getSupplierStatusVariant('Inactive')).toBe('warning');
    });

    it('should return danger for Blacklisted status', () => {
      expect(getSupplierStatusVariant('Blacklisted')).toBe('danger');
    });
  });
});

describe('Suppliers API', () => {
  const suppliers: Supplier[] = [
    {
      id: '1',
      name: 'ABC Logistics',
      category: 'Logistics',
      contactPerson: 'John Doe',
      phone: '1234567890',
      email: 'john@abc.com',
      status: 'Active',
      documents: []
    },
    {
      id: '2',
      name: 'XYZ Marketing',
      category: 'Marketing',
      contactPerson: 'Jane Smith',
      phone: '0987654321',
      email: 'jane@xyz.com',
      status: 'Inactive',
      documents: []
    },
    {
      id: '3',
      name: 'DEF Catering',
      category: 'Catering',
      contactPerson: 'Bob Johnson',
      phone: '5555555555',
      email: 'bob@def.com',
      status: 'Active',
      documents: []
    }
  ];

  describe('filterSuppliers', () => {
    it('should filter by search term', () => {
      const result = filterSuppliers(suppliers, 'logistics', 'all');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('ABC Logistics');
    });

    it('should filter by status', () => {
      const result = filterSuppliers(suppliers, '', 'active');
      expect(result).toHaveLength(2);
      expect(result.every(s => s.status === 'Active')).toBe(true);
    });

    it('should filter by both search and status', () => {
      const result = filterSuppliers(suppliers, 'marketing', 'inactive');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('XYZ Marketing');
    });
  });

  describe('getSupplierCategories', () => {
    it('should return unique categories', () => {
      const categories = getSupplierCategories(suppliers);
      expect(categories).toHaveLength(3);
      expect(categories).toContain('Logistics');
      expect(categories).toContain('Marketing');
      expect(categories).toContain('Catering');
    });
  });

  describe('getActiveSuppliers', () => {
    it('should return only active suppliers', () => {
      const active = getActiveSuppliers(suppliers);
      expect(active).toHaveLength(2);
      expect(active.every(s => s.status === 'Active')).toBe(true);
    });
  });
});
