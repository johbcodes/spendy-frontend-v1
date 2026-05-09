import { Supplier } from './types';

export function canDeleteSupplier(supplier: Supplier): boolean {
  // Can't delete if supplier has pending payments or is referenced in expenses
  return supplier.status !== 'Active' || !supplier.paymentStatus || supplier.paymentStatus === 'Completed';
}

export function isSupplierActive(supplier: Supplier): boolean {
  return supplier.status === 'Active';
}

export function isSupplierBlacklisted(supplier: Supplier): boolean {
  return supplier.status === 'Blacklisted';
}

export function hasPaymentDetails(supplier: Supplier): boolean {
  return Boolean(
    supplier.mpesaPhone ||
    supplier.paybillNumber ||
    supplier.tillNumber ||
    supplier.bankName
  );
}

export function getPaymentMethodLabel(supplier: Supplier): string {
  if (supplier.mpesaPhone) return 'M-Pesa';
  if (supplier.paybillNumber) return 'Paybill';
  if (supplier.tillNumber) return 'Till';
  if (supplier.bankName) return 'Bank Transfer';
  return 'Not Set';
}

export function validateSupplierData(data: Partial<Supplier>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push('Supplier name is required');
  }

  if (!data.category || data.category.trim().length === 0) {
    errors.push('Category is required');
  }

  if (!data.contactPerson || data.contactPerson.trim().length === 0) {
    errors.push('Contact person is required');
  }

  if (!data.phone || data.phone.trim().length === 0) {
    errors.push('Phone number is required');
  }

  if (data.email && !isValidEmail(data.email)) {
    errors.push('Invalid email address');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function getSupplierStatusVariant(status: string): 'success' | 'warning' | 'danger' | 'default' {
  switch (status) {
    case 'Active':
      return 'success';
    case 'Inactive':
      return 'warning';
    case 'Blacklisted':
      return 'danger';
    default:
      return 'default';
  }
}
