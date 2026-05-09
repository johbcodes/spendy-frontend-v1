export const invoiceSchemas = {
  createInvoice: {
    clientName: {
      required: true,
      minLength: 2,
      message: 'Client name must be at least 2 characters'
    },
    clientEmail: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Valid email address is required'
    },
    lineItems: {
      required: true,
      minLength: 1,
      message: 'At least one line item is required'
    }
  },
  lineItem: {
    itemName: {
      required: true,
      message: 'Item name is required'
    },
    quantity: {
      required: true,
      min: 1,
      message: 'Quantity must be at least 1'
    },
    unitPrice: {
      required: true,
      min: 0,
      message: 'Unit price cannot be negative'
    }
  }
};

export function validateClientEmail(email: string): { valid: boolean; error?: string } {
  if (!email || email.trim().length === 0) {
    return { valid: false, error: 'Email is required' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { valid: false, error: 'Invalid email address' };
  }
  return { valid: true };
}

export function validateLineItem(item: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!item.itemName || item.itemName.trim().length === 0) {
    errors.push('Item name is required');
  }

  if (!item.quantity || item.quantity <= 0) {
    errors.push('Quantity must be greater than 0');
  }

  if (item.unitPrice === undefined || item.unitPrice < 0) {
    errors.push('Unit price cannot be negative');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validatePaymentAmount(amount: number, balance: number): { valid: boolean; error?: string } {
  if (amount <= 0) {
    return { valid: false, error: 'Payment amount must be greater than 0' };
  }
  if (amount > balance) {
    return { valid: false, error: 'Payment amount cannot exceed balance' };
  }
  return { valid: true };
}
