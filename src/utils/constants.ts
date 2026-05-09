export const EVENT_TYPES = ['Project', 'Activation', 'Operation'];
export const EVENT_STATUSES = ['Draft', 'Active', 'Completed', 'Cancelled'];
export const REQUEST_STATUSES = ['Pending', 'Approved', 'Rejected', 'Completed'];
export const PAYMENT_STATUSES = ['Pending', 'Completed', 'Failed', 'Reconciled'];
export const USER_ROLES = ['Admin', 'Approver', 'Staff', 'Store Manager', 'Finance', 'Viewer'];
export const EVENT_CATEGORIES = ['Corporate Event', 'Product Launch', 'Conference', 'Workshop', 'Trade Show', 'Brand Activation', 'Roadshow', 'Sampling', 'Other'];
export const EXPENSE_CATEGORIES = ['Venue', 'Catering', 'Equipment', 'Staff', 'Marketing', 'Transportation', 'Accommodation', 'Supplies', 'Other'];
export const WALLET_TYPES = ['Company Wallet', 'Event Wallet', 'Activation Wallet', 'Operation Wallet', 'Petty Cash'];
export const INVENTORY_CONDITIONS = ['Excellent', 'Good', 'Fair', 'Damaged'];
export const COUNTRIES = ['Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'South Africa', 'Nigeria', 'Ghana'];
export const MODULES = ['Dashboard', 'Events', 'Wallets', 'Expenses', 'Payments', 'Approvals', 'Inventory', 'Suppliers', 'Analytics', 'Users', 'System Setup'];
export const ALL_MODULES = ['All', ...MODULES];

// Payment Method Constants
export const PAYMENT_METHODS = [
  { value: 'sendMoney', label: 'Send Money' },
  { value: 'paybill', label: 'Paybill' },
  { value: 'buyGoods', label: 'Buy Goods & Services' }
];

// Expense Context Types
export const EXPENSE_CONTEXT_TYPES = ['Project', 'Activation', 'Operation'];
