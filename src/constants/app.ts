/**
 * Application Constants
 * Centralized configuration and magic strings
 */

import { UserRole, EventType, EventStatus, RequestStatus, PaymentStatus, TransactionStatus, CategoryType } from '../types';

// Wallet Types
export const WALLET_TYPES = {
  MAIN: 'Main Wallet',
  OPERATIONS: 'Operations Wallet',
  EVENTS: 'Events Wallet',
  EVENT: 'Event Wallet',
  COMPANY: 'Company Wallet',
  USER: 'USER',
  SYSTEM: 'SYSTEM',
} as const;

// Default Company Wallets
export const DEFAULT_COMPANY_WALLETS = [
  { type: WALLET_TYPES.MAIN, name: 'Main Wallet', balance: 0 },
  { type: WALLET_TYPES.OPERATIONS, name: 'Operations Wallet', balance: 0 },
  { type: WALLET_TYPES.EVENTS, name: 'Events Wallet', balance: 0 },
] as const;

// Event Types
export const EVENT_TYPES: EventType[] = ['Event', 'Activation', 'Operation'];

// Event Statuses
export const EVENT_STATUSES: EventStatus[] = [
  'Draft',
  'Active',
  'Completed',
  'Cancelled',
  'Archived',
];

// Request/Approval Statuses
export const REQUEST_STATUSES: RequestStatus[] = [
  'Pending',
  'Approved',
  'Rejected',
  'Completed',
];

// Payment Statuses
export const PAYMENT_STATUSES: PaymentStatus[] = [
  'Pending',
  'Completed',
  'Failed',
  'Reconciled',
];

// Transaction Statuses
export const TRANSACTION_STATUSES: TransactionStatus[] = [
  'Pending',
  'Completed',
  'Failed',
];

// User Roles
export const USER_ROLES: UserRole[] = ['Admin', 'Approver', 'Staff', 'Store Manager'];

// Roles with Auto-Approval
export const AUTO_APPROVED_ROLES: UserRole[] = ['Staff', 'Store Manager'];

// Event Type to Wallet Mapping
export const EVENT_WALLET_MAPPING: Record<EventType, typeof WALLET_TYPES.OPERATIONS | typeof WALLET_TYPES.EVENTS> = {
  Operation: WALLET_TYPES.OPERATIONS,
  Event: WALLET_TYPES.EVENTS,
  Activation: WALLET_TYPES.EVENTS,
};

// Default Module Access by Role
export const ROLE_MODULE_ACCESS = {
  Admin: ['All'] as const,
  Staff: ['Expenses', 'Payments'] as const,
  'Store Manager': ['Inventory', 'Expenses'] as const,
  Approver: ['Events', 'Approvals'] as const,
} as const;

// Currency
export const DEFAULT_CURRENCY = 'KES';

// Spendy System
export const SPENDY_PAYBILL = '247247';

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  ISO: 'YYYY-MM-DD',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
} as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

// File Upload
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'] as const;
export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

// Validation
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MIN_AMOUNT: 0,
  MAX_AMOUNT: 10000000,
  ACCOUNT_NUMBER_LENGTH: 6,
} as const;

// Toast Duration
export const TOAST_DURATION = 3000; // milliseconds

// Debounce Delays
export const DEBOUNCE = {
  SEARCH: 300,
  INPUT: 500,
} as const;

// Invoice Settings
export const INVOICE_TYPES = ['Quote', 'Proforma', 'Invoice'] as const;
export const PAYMENT_TERMS = [
  'Due on Receipt',
  'Net 7',
  'Net 15',
  'Net 30',
  'Net 45',
  'Net 60',
  'Custom',
] as const;

// Inventory Conditions
export const INVENTORY_CONDITIONS = ['Excellent', 'Good', 'Fair', 'Damaged'] as const;

// Supplier Statuses
export const SUPPLIER_STATUSES = ['Active', 'Inactive', 'Blacklisted'] as const;

// Payment Methods
export const PAYMENT_METHODS = {
  MPESA: 'M-Pesa',
  BANK: 'Bank Transfer',
  CASH: 'Cash',
  CHEQUE: 'Cheque',
  WALLET: 'Wallet Transfer',
  PAYBILL: 'Paybill',
  TILL: 'Till',
} as const;

// Notification Types
export const NOTIFICATION_TYPES = [
  'info',
  'warning',
  'error',
  'success',
  'admin_broadcast',
  'role_change',
  'access_update',
] as const;

// Notification Priorities
export const NOTIFICATION_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;

// Routes (Pages)
export const ROUTES = {
  DASHBOARD: 'dashboard',
  EVENTS: 'events',
  EVENT_DETAIL: 'event-detail',
  EDIT_EVENT: 'edit-event',
  ACTIVATIONS: 'activations',
  OPERATIONS: 'operations',
  WALLETS: 'wallets',
  WALLET_DETAIL: 'wallet-detail',
  EXPENSES: 'expenses',
  EXPENSE_DETAIL: 'expense-detail',
  PAYMENTS: 'payments',
  PAYMENT_DETAIL: 'payment-detail',
  APPROVALS: 'approvals',
  INVENTORY: 'inventory',
  INVENTORY_DETAIL: 'inventory-detail',
  SUPPLIERS: 'suppliers',
  SUPPLIER_DETAIL: 'supplier-detail',
  INVOICES: 'invoices',
  INVOICE_DETAIL: 'invoice-detail',
  PRODUCTS: 'products',
  QUOTATIONS: 'quotations',
  ANALYTICS: 'analytics',
  USERS: 'users',
  MY_ACCOUNT: 'my-account',
  SYSTEM_SETUP: 'system-setup',
  SIGN_IN: 'sign-in',
  SIGN_UP: 'sign-up',
} as const;

// Default categories auto-seeded on company registration
export const DEFAULT_CATEGORIES: Record<CategoryType, string[]> = {
  event: [
    'Corporate Event', 'Social Event', 'Conference', 'Exhibition',
    'Product Launch', 'Team Building', 'Workshop', 'Gala / Awards Dinner',
  ],
  activation: [
    'Brand Activation', 'Product Sampling', 'Roadshow', 'In-Store Activation',
    'Experiential Marketing', 'Digital Activation', 'Trade Fair',
  ],
  expense: [
    'Venue & Facilities', 'Catering & Beverages', 'Transport & Logistics',
    'Equipment & AV', 'Staffing & Labour', 'Marketing & Branding',
    'Accommodation', 'Communication', 'Printing & Stationery', 'Miscellaneous',
  ],
  operation: [
    'Office Supplies', 'Utilities', 'Maintenance & Repairs', 'Cleaning & Sanitation',
    'Security', 'IT & Technology', 'Administration', 'Travel & Accommodation',
  ],
  supplier: [
    'Venue', 'Catering', 'Transport', 'AV & Equipment', 'Printing & Branding',
    'Photography & Videography', 'Décor & Styling', 'Security',
    'Staffing Agency', 'Logistics',
  ],
  inventory: [
    'AV Equipment', 'Furniture', 'Tents & Structures', 'Décor & Props',
    'Branding Materials', 'Kitchen Equipment', 'Safety Equipment',
    'Tools & Hardware', 'Uniforms & Apparel',
  ],
};

// Transaction Fees (M-Pesa example - would come from API in production)
export const MPESA_FEES: Record<string, number> = {
  '0-100': 0,
  '101-500': 7,
  '501-1000': 13,
  '1001-1500': 23,
  '1501-2500': 33,
  '2501-3500': 53,
  '3501-5000': 58,
  '5001-7500': 78,
  '7501-10000': 90,
  '10001-15000': 100,
  '15001-20000': 105,
  '20001-250000': 105,
};

/**
 * Calculate M-Pesa transaction fee based on amount
 */
export function calculateMpesaFee(amount: number): number {
  if (amount <= 100) return 0;
  if (amount <= 500) return 7;
  if (amount <= 1000) return 13;
  if (amount <= 1500) return 23;
  if (amount <= 2500) return 33;
  if (amount <= 3500) return 53;
  if (amount <= 5000) return 58;
  if (amount <= 7500) return 78;
  if (amount <= 10000) return 90;
  if (amount <= 15000) return 100;
  if (amount <= 20000) return 105;
  return 105;
}
