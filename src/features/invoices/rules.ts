import { Invoice, InvoiceStatus } from './types';

export function getInvoiceStatusVariant(status: InvoiceStatus): 'success' | 'warning' | 'danger' | 'default' {
  switch (status) {
    case 'Paid':
      return 'success';
    case 'Sent':
    case 'Partially Paid':
    case 'Pending Approval':
      return 'warning';
    case 'Overdue':
    case 'Cancelled':
      return 'danger';
    case 'Draft':
    default:
      return 'default';
  }
}

export function isInvoiceOverdue(invoice: Invoice): boolean {
  if (invoice.status === 'Paid' || invoice.status === 'Cancelled') {
    return false;
  }
  const dueDate = new Date(invoice.dueDate);
  const today = new Date();
  return dueDate < today;
}

export function canEditInvoice(invoice: Invoice): boolean {
  return invoice.status === 'Draft' || invoice.status === 'Pending Approval';
}

export function canDeleteInvoice(invoice: Invoice): boolean {
  return invoice.status === 'Draft';
}

export function canApproveInvoice(invoice: Invoice, userRole: string): boolean {
  return invoice.status === 'Pending Approval' && userRole === 'Admin';
}

export function canConvertQuote(invoice: Invoice): boolean {
  return invoice.documentType === 'Quote' && !invoice.convertedTo;
}

export function canRecordPayment(invoice: Invoice): boolean {
  return (
    invoice.status !== 'Draft' &&
    invoice.status !== 'Cancelled' &&
    invoice.balance > 0
  );
}

export function validateInvoiceData(data: Partial<Invoice>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.clientName || data.clientName.trim().length === 0) {
    errors.push('Client name is required');
  }

  if (!data.clientEmail || data.clientEmail.trim().length === 0) {
    errors.push('Client email is required');
  }

  if (!data.lineItems || data.lineItems.length === 0) {
    errors.push('At least one line item is required');
  }

  if (data.lineItems) {
    data.lineItems.forEach((item, index) => {
      if (!item.itemName || item.itemName.trim().length === 0) {
        errors.push(`Line item ${index + 1}: Item name is required`);
      }
      if (item.quantity <= 0) {
        errors.push(`Line item ${index + 1}: Quantity must be greater than 0`);
      }
      if (item.unitPrice < 0) {
        errors.push(`Line item ${index + 1}: Unit price cannot be negative`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function calculateBalance(invoice: Invoice): number {
  return invoice.total - invoice.amountPaid;
}

export function updateInvoiceStatus(invoice: Invoice): InvoiceStatus {
  if (invoice.amountPaid >= invoice.total) {
    return 'Paid';
  }
  if (invoice.amountPaid > 0) {
    return 'Partially Paid';
  }
  if (isInvoiceOverdue(invoice)) {
    return 'Overdue';
  }
  return invoice.status;
}
