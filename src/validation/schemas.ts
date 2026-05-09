/**
 * Validation Schemas
 *
 * Centralized validation using Zod for type safety and consistency
 */

import { z } from 'zod';

// ============================================================================
// AUTHENTICATION SCHEMAS
// ============================================================================

export const SignInSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional()
});

export const SignUpSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to terms')
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format')
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

// ============================================================================
// EVENT SCHEMAS
// ============================================================================

export const EventSchema = z.object({
  name: z.string().min(3, 'Event name must be at least 3 characters'),
  type: z.enum(['Project', 'Activation', 'Operation']),
  category: z.string().min(1, 'Category is required'),
  client: z.string().min(1, 'Client is required'),
  brand: z.string().optional(),
  startDate: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid start date'),
  endDate: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid end date'),
  location: z.string().min(1, 'Location is required'),
  description: z.string().optional(),
  budget: z.number().min(0, 'Budget must be positive'),
  assignedTo: z.array(z.string()).optional()
}).refine(data => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end >= start;
}, {
  message: 'End date must be after start date',
  path: ['endDate']
});

// ============================================================================
// EXPENSE SCHEMAS
// ============================================================================

export const ExpenseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  category: z.string().min(1, 'Category is required'),
  amount: z.number().positive('Amount must be positive'),
  eventId: z.string().optional(),
  date: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid date'),
  description: z.string().optional(),
  receiptUrl: z.string().url().optional().or(z.literal('')),
  paymentMethod: z.enum(['mpesa_b2c', 'paybill_b2b', 'till_b2b']).optional()
});

export const BatchExpenseSchema = z.object({
  eventId: z.string().optional(),
  categories: z.array(z.object({
    category: z.string(),
    items: z.array(z.object({
      recipientName: z.string().min(2, 'Recipient name required'),
      amount: z.number().positive('Amount must be positive'),
      reference: z.string().min(1, 'Reference required'),
      paymentMethod: z.enum(['sendMoney', 'paybill', 'buyGoods']),
      phoneNumber: z.string().optional(),
      paybillNumber: z.string().optional(),
      accountNumber: z.string().optional(),
      tillNumber: z.string().optional()
    }))
  })).min(1, 'At least one category is required')
});

// ============================================================================
// WALLET SCHEMAS
// ============================================================================

export const WalletSchema = z.object({
  name: z.string().min(3, 'Wallet name must be at least 3 characters'),
  type: z.string().min(1, 'Wallet type is required'),
  initialBalance: z.number().min(0, 'Initial balance must be positive'),
  description: z.string().optional()
});

export const WalletTransferSchema = z.object({
  fromWalletId: z.string().min(1, 'Source wallet is required'),
  toWalletId: z.string().min(1, 'Destination wallet is required'),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().optional()
}).refine(data => data.fromWalletId !== data.toWalletId, {
  message: 'Cannot transfer to the same wallet',
  path: ['toWalletId']
});

export const FundWalletSchema = z.object({
  walletId: z.string().min(1, 'Wallet is required'),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().optional()
});

// ============================================================================
// PAYMENT SCHEMAS
// ============================================================================

export const PaymentSchema = z.object({
  expenseId: z.string().optional(),
  requestId: z.string().optional(),
  amount: z.number().positive('Amount must be positive'),
  walletId: z.string().min(1, 'Wallet is required'),
  paymentMethod: z.enum(['mpesa_b2c', 'paybill_b2b', 'till_b2b']),
  recipientPhone: z.string().optional(),
  paybillNumber: z.string().optional(),
  accountNumber: z.string().optional(),
  tillNumber: z.string().optional(),
  reference: z.string().min(1, 'Reference is required')
});

// ============================================================================
// SUPPLIER SCHEMAS
// ============================================================================

export const SupplierSchema = z.object({
  name: z.string().min(2, 'Supplier name must be at least 2 characters'),
  category: z.string().min(1, 'Category is required'),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  contactPerson: z.string().optional(),
  address: z.string().optional(),
  paymentMethod: z.enum(['mpesa_b2c', 'paybill_b2b', 'till_b2b']).optional(),
  mpesaNumber: z.string().optional(),
  paybillNumber: z.string().optional(),
  accountNumber: z.string().optional(),
  tillNumber: z.string().optional()
});

// ============================================================================
// INVENTORY SCHEMAS
// ============================================================================

export const InventorySchema = z.object({
  name: z.string().min(2, 'Item name must be at least 2 characters'),
  category: z.string().min(1, 'Category is required'),
  quantity: z.number().int().min(0, 'Quantity must be positive'),
  condition: z.enum(['New', 'Good', 'Fair', 'Poor']),
  purchaseDate: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid date').optional(),
  purchasePrice: z.number().min(0, 'Price must be positive').optional(),
  supplier: z.string().optional(),
  description: z.string().optional()
});

export const CheckOutSchema = z.object({
  inventoryId: z.string().min(1, 'Inventory item is required'),
  eventId: z.string().min(1, 'Event is required'),
  quantity: z.number().int().positive('Quantity must be positive'),
  checkedOutBy: z.string().min(1, 'User is required'),
  checkOutDate: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid date'),
  expectedReturnDate: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid date'),
  notes: z.string().optional()
});

export const CheckInSchema = z.object({
  inventoryId: z.string().min(1, 'Inventory item is required'),
  quantity: z.number().int().positive('Quantity must be positive'),
  condition: z.enum(['New', 'Good', 'Fair', 'Poor', 'Damaged', 'Lost']),
  checkedInBy: z.string().min(1, 'User is required'),
  checkInDate: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid date'),
  notes: z.string().optional()
});

// ============================================================================
// USER SCHEMAS
// ============================================================================

export const UserSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  role: z.enum(['Admin', 'Staff', 'Approver', 'Store Manager']),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  modules: z.array(z.object({
    name: z.string(),
    canCreate: z.boolean(),
    canRead: z.boolean(),
    canUpdate: z.boolean(),
    canDelete: z.boolean()
  })).optional()
});

// ============================================================================
// TYPE INFERENCE HELPERS
// ============================================================================

export type SignInInput = z.infer<typeof SignInSchema>;
export type SignUpInput = z.infer<typeof SignUpSchema>;
export type EventInput = z.infer<typeof EventSchema>;
export type ExpenseInput = z.infer<typeof ExpenseSchema>;
export type WalletInput = z.infer<typeof WalletSchema>;
export type PaymentInput = z.infer<typeof PaymentSchema>;
export type SupplierInput = z.infer<typeof SupplierSchema>;
export type InventoryInput = z.infer<typeof InventorySchema>;
export type UserInput = z.infer<typeof UserSchema>;

// ============================================================================
// VALIDATION HELPER FUNCTIONS
// ============================================================================

/**
 * Validate data against a schema and return formatted errors
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Object with success flag, data, and errors
 */
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
} {
  const result = schema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data
    };
  }

  const errors: Record<string, string> = {};
  result.error.errors.forEach(err => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });

  return {
    success: false,
    errors
  };
}

/**
 * Get first error message from validation errors
 * @param errors - Record of validation errors
 * @returns First error message or null
 */
export function getFirstError(errors?: Record<string, string>): string | null {
  if (!errors) return null;

  const firstKey = Object.keys(errors)[0];
  return firstKey ? errors[firstKey] : null;
}
