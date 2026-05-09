export const userSchemas = {
  createUser: {
    firstName: {
      required: true,
      minLength: 2,
      message: 'First name must be at least 2 characters'
    },
    lastName: {
      required: true,
      minLength: 2,
      message: 'Last name must be at least 2 characters'
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Valid email address is required'
    },
    phone: {
      required: true,
      pattern: /^[0-9+\-\s()]+$/,
      message: 'Valid phone number is required'
    },
    role: {
      required: true,
      message: 'Role is required'
    },
    modulesAssigned: {
      required: true,
      minLength: 1,
      message: 'At least one module must be assigned'
    }
  }
};

export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || email.trim().length === 0) {
    return { valid: false, error: 'Email is required' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { valid: false, error: 'Invalid email address' };
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

export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password || password.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters' };
  }
  return { valid: true };
}

export function validateName(name: string, fieldName: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: `${fieldName} is required` };
  }
  if (name.trim().length < 2) {
    return { valid: false, error: `${fieldName} must be at least 2 characters` };
  }
  return { valid: true };
}
