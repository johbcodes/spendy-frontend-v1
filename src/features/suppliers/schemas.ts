export const supplierSchemas = {
  createSupplier: {
    name: {
      required: true,
      minLength: 2,
      message: 'Supplier name must be at least 2 characters'
    },
    category: {
      required: true,
      message: 'Category is required'
    },
    contactPerson: {
      required: true,
      message: 'Contact person is required'
    },
    phone: {
      required: true,
      pattern: /^[0-9+\-\s()]+$/,
      message: 'Valid phone number is required'
    },
    email: {
      required: false,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Invalid email address'
    }
  },
  updateSupplier: {
    name: {
      required: true,
      minLength: 2,
      message: 'Supplier name must be at least 2 characters'
    }
  }
};

export function validateSupplierName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Supplier name is required' };
  }
  if (name.trim().length < 2) {
    return { valid: false, error: 'Supplier name must be at least 2 characters' };
  }
  return { valid: true };
}

export function validatePhone(phone: string): { valid: boolean; error?: string } {
  if (!phone || phone.trim().length === 0) {
    return { valid: false, error: 'Phone number is required' };
  }
  if (!/^[0-9+\-\s()]+$/.test(phone)) {
    return { valid: false, error: 'Invalid phone number format' };
  }
  return { valid: true };
}

export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || email.trim().length === 0) {
    return { valid: true }; // Email is optional
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { valid: false, error: 'Invalid email address' };
  }
  return { valid: true };
}
