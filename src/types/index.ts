// Role-based user types
export type UserRole = "Admin" | "Approver" | "Staff" | "Store Manager";

// Module definitions for role-based access
export type UserModule =
  | "Dashboard"
  | "Events"
  | "Activations"
  | "Operations"
  | "All"
  | "Wallets"
  | "Expenses"
  | "Payments"
  | "Approvals"
  | "Inventory"
  | "Suppliers"
  | "Invoices"
  | "Quotations"
  | "Products"
  | "Analytics"
  | "Users"
  | "System Setup";

// Event-scoped access control for Approvers
export type EventAccess = {
  eventId: string;
  eventName: string;
  accessLevel: "view" | "manage" | "approve"; // approve = can approve expenses within this event
};

export type EventStatus =
  | "Draft"
  | "Active"
  | "Completed"
  | "Cancelled"
  | "Archived";
export type EventType = "Event" | "Activation" | "Operation";
export type RequestStatus = "Pending" | "Approved" | "Rejected" | "Completed";
export type PaymentStatus = "Pending" | "Completed" | "Failed" | "Reconciled";
export type TransactionStatus = "Pending" | "Completed" | "Failed";

/**
 * User interface with comprehensive role and module-based access control
 *
 * Access Control Rules:
 * - Admin: Full access to all modules
 * - Staff: Only Expenses & Payments modules (auto-approval enforcement)
 * - Store Manager: Only Inventory & Expenses modules (auto-approval for expenses)
 * - Approver: Only Events module (event-scoped access control)
 *
 * Every user (except Admin) must have modulesAssigned defined
 * My Account is always accessible to all authenticated users
 */
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  role: UserRole;
  status: "Active" | "Inactive";

  // Module-based access control
  modulesAssigned: UserModule[]; // Modules assigned by Admin during user creation

  profileImage?: string;
  createdAt: string;
  lastLogin?: string;
  loginCount?: number;
  activityCount?: number;

  // Company KYC
  companyId?: string; // UUID of the company from backend
  companyName?: string;
  companyLogo?: string; // Base64 encoded image or URL
  companyRegistrationCert?: string;
  companyKraPin?: string;
  companyCountry?: string;
  companyAddress?: string;
  companyPhone?: string; // Company contact phone
  companyOfficialEmail?: string; // Company official email
  companyOfficeAddress?: string; // Company office address

  // Spendy Account Details (for inter-account payments)
  spendyPaybillNumber?: string; // Shared Spendy paybill number (e.g., "247247")
  spendyAccountNumber?: string; // Unique 6-digit account number for this company

  // Authentication
  password?: string;
  isAdmin?: boolean; // True only for Admin users

  // RBAC + Event-Scoped Access Control
  // Only used for Approver role - specifies which events they can manage
  eventAccess?: EventAccess[];

  // Deprecated (kept for backward compatibility)
  canApproveExpenses?: boolean;
  canManageInventory?: boolean;
  canMakePayments?: boolean;
}
export interface Event {
  id: string;
  name: string;
  type: EventType;
  category: string;
  client: string;
  brand?: string;
  brands?: string[];
  projectLeadId?: string;
  projectLead?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  status: EventStatus;
  location?: string;
  documents: string[];
  // Activation-only fields
  product?: string;
  campaignName?: string;
  activationChannel?: string;
}
export interface Wallet {
  id: string;
  name: string;
  type:
    | "Main Wallet"
    | "Operations Wallet"
    | "Events Wallet"
    | "Event Wallet"
    | "Company Wallet"
    | "USER"
    | "SYSTEM";
  walletType?: "Main Operations" | "Event" | "Project" | "Department" | "User";
  balance: number;
  linkedEvent?: string;
  status: "Active" | "Frozen";
  createdAt: string;
  isDefault?: boolean;
  ownerId?: string; // NULL for system wallets, user ID for user wallets
  currency?: string;
  companyId?: string; // Company isolation - wallets belong to specific companies
}

export interface WalletLedger {
  ledger_id: string;
  wallet_id: string;
  transaction_type: "CREDIT" | "DEBIT";
  amount: number;
  source_reference: string; // expense_id or other reference
  created_at: string;
  description?: string;
}

export interface UserWalletAssignment {
  user_id: string;
  wallet_id: string;
  access_level: "view" | "use" | "manage";
}
export interface Transaction {
  id: string;
  walletId: string;
  date: string;
  time: string;
  user: string;
  recipient: string;
  reference: string;
  amount: number;
  status: TransactionStatus;
  type: "Fund" | "Transfer" | "Withdrawal";
  sourceWallet?: string; // Name of the source wallet for Fund transactions
}
export interface Expense {
  id: string;
  title: string;
  eventId: string;
  eventName: string;
  walletId?: string;
  category: string;
  client: string;
  amount: number;
  budget: number;
  supplier?: string;
  supplierCategory?: string;
  createdBy: string;
  startDate: string;
  dueDate: string;
  status: RequestStatus;
  receipt?: string;
  description?: string;
  expenseType?: string;
  needsApproval?: boolean;
  paymentRequestType?: "single" | "bulk";
  batchPaymentDetails?: Array<{
    name: string;
    idNumber: string;
    phone?: string;
    paybillNumber?: string;
    accountNumber?: string;
    tillNumber?: string;
    amount: number;
    reference: string;
    paymentMethod: "mpesa" | "paybill" | "till";
  }>;
  createdByUserId: string; // Track who created the expense
  createdByRole: UserRole; // Track the role of the creator
  approvalRequired: boolean; // Whether this expense requires approval
  approvalStatus: "pending" | "approved" | "rejected" | "completed"; // Detailed approval status
  approvedBy?: string; // Who approved it
  approvedAt?: string; // When it was approved
  rejectionReason?: string; // Reason for rejection if applicable
  // Batch Expense Fields
  expenseRequestType?: "single" | "batch";
  expenseContextType?: "Event" | "Activation" | "Operation";
  totalAmount?: number;
  isCompleteBatchExpense?: boolean;
  batchCategories?: Array<{
    category: string;
    items: BatchRecipient[];
  }>;
  csvData?: Array<{
    category: string;
    recipientName: string;
    paymentMethod: string;
    phonePaybillTill: string;
    accountNumber: string;
    amount: number;
    reference: string;
    idNumber?: string;
  }>;
  // New expenses array for quick add functionality
  expenses?: Array<{
    category: string;
    amount: number;
    paymentMethod: "sendMoney" | "paybill" | "buyGoods";
    recipientName: string;
    phoneNumber?: string;
    paybillNumber?: string;
    accountNumber?: string;
    tillNumber?: string;
    merchantName?: string;
    businessName?: string;
    reference: string;
    description?: string;
    idNumber?: string;
  }>;
  // All recipients data for batch payments (new structure)
  allRecipients?: Array<{
    recipientName: string;
    amount: number;
    paymentMethod: "sendMoney" | "paybill" | "buyGoods";
    phoneNumber?: string;
    paybillNumber?: string;
    accountNumber?: string;
    tillNumber?: string;
    reference: string;
    category: string;
    idNumber?: string;
  }>;
}
export interface BatchRecipient {
  recipientName: string;
  amount: number;
  description?: string;
  paymentMethod: "sendMoney" | "paybill" | "buyGoods";
  phoneNumber?: string;
  paybillNumber?: string;
  accountNumber?: string;
  businessName?: string;
  tillNumber?: string;
  merchantName?: string;
  reference: string;
  idNumber?: string;
}

export interface Payment {
  id: string;
  eventId: string;
  eventName: string;
  expenseId?: string;
  initiatedBy: string;
  recipient: string;
  amount: number;
  mpesaCode?: string;
  type: "M-Pesa" | "Wallet Transfer";
  status: PaymentStatus;
  dateTime: string;
  description: string;
  isFromApproval?: boolean;
  isBatchPayment?: boolean;
  batchRecipientCount?: number;
  transactionFee?: number; // Fee charged for external payments (M-Pesa, etc.)
  totalAmount?: number; // Total amount including fee (amount + transactionFee)
  isExternal?: boolean; // Whether payment goes outside Spendy system
}
export interface Request {
  id: string;
  type: EventType;
  name: string;
  category: string;
  eventId?: string;
  amount: number;
  description: string;
  requestedBy: string;
  dateRequested: string;
  status: RequestStatus;
  processedBy?: string;
  dateProcessed?: string;
  rejectionReason?: string;
  location?: string;
  expenseId?: string;
  supplier?: string;
  supplierCategory?: string;
  paymentRequestType?: "single" | "bulk";
  expenseRequestType?: "single" | "batch";
  totalAmount?: number;
  batchPaymentDetails?: Array<{
    name: string;
    idNumber: string;
    phone?: string;
    paybillNumber?: string;
    accountNumber?: string;
    tillNumber?: string;
    amount: number;
    reference: string;
    paymentMethod: "mpesa" | "paybill" | "till";
  }>;
}
export interface Supplier {
  id: string;
  name: string;
  category: string;
  contactPerson: string;
  phone: string;
  email: string;
  status: "Active" | "Inactive" | "Blacklisted";
  paymentStatus?: "Pending" | "Completed";
  paymentMethod?: "Mpesa B2C" | "Paybill B2B" | "Till B2B" | "Bank";
  servicesProvided?: Array<{
    description: string;
    amount: number;
  }>;
  amount?: number;
  event?: string;
  businessType?: string;
  kraPin?: string;
  mpesaPhone?: string;
  paybillNumber?: string;
  paybillAccount?: string;
  tillNumber?: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  branchName?: string;
  swiftCode?: string;
  approvalRequired?: boolean;
  documents: Array<{
    name: string;
    url: string;
  }>;
}
export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  image?: string;
  quantity: number;
  checkedOut: number;
  checkedIn: number;
  location: string;
  condition: "Excellent" | "Good" | "Fair" | "Damaged";
  conditionCounts: {
    Excellent: number;
    Good: number;
    Fair: number;
    Damaged: number;
  };
  costPerItem: number;
  totalCost: number;
  rentalPrice: number;
  category: string;
  checkoutStatus?: "available" | "checked-out" | "checked-in";
  totalInventoryAdded: number; // Total inventory ever added (doesn't change)
}
export interface Client {
  id: string;
  itemNumber: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  brands?: string[];
  status: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export type CategoryType =
  | "event"
  | "activation"
  | "expense"
  | "operation"
  | "supplier"
  | "inventory";

export interface Category {
  id: string;
  name: string;
  description?: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Movement {
  id: string;
  itemId: string;
  date: string;
  type: "Check Out" | "Check In";
  quantity: number;
  event?: string;
  givenBy?: string;
  receivedBy?: string;
  balance: number;
  cost: number;
}

// Notification and Communication System
export type NotificationType =
  | "info"
  | "warning"
  | "error"
  | "success"
  | "admin_broadcast"
  | "role_change"
  | "access_update";

export interface SystemNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  recipientId?: string; // Specific user, or undefined for broadcast
  recipientRole?: UserRole; // Role-based broadcast
  senderId: string;
  senderName: string;
  timestamp: string;
  isRead: boolean;
  priority: "low" | "medium" | "high" | "critical";
  actionRequired?: boolean;
  relatedEntityId?: string; // expenseId, userId, eventId, etc.
  relatedEntityType?: "expense" | "user" | "event" | "payment" | "approval";
  metadata?: Record<string, any>; // Additional data for the notification
}

// Products & Services Module (Future)
export interface ProductService {
  id: string;
  name: string;
  description: string;
  category: string;
  type: "Product" | "Service";
  unitPrice: number;
  unit: string; // e.g., 'piece', 'hour', 'day', 'kg'
  taxRate: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Invoicing Module
export type InvoiceStatus =
  | "Draft"
  | "Pending Approval"
  | "Sent"
  | "Paid"
  | "Partially Paid"
  | "Overdue"
  | "Cancelled";
export type DocumentType = "Quote" | "Proforma" | "Invoice";
export type PaymentTerms =
  | "Due on Receipt"
  | "Net 7"
  | "Net 15"
  | "Net 30"
  | "Net 45"
  | "Net 60"
  | "Custom";

export interface InvoiceLineItem {
  id: string;
  itemName: string; // Product/Service name
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  taxRate?: number;
  taxAmount?: number;
}

// Product/Item for reuse in invoices
export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  unitPrice: number;
  taxRate: number;
  sku?: string;
  unit: string; // e.g., "piece", "hour", "kg", "liter"
  companyId: string; // Company isolation
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  stock?: number;
  price?: number;
  cost?: number;
  status?: string;
}

export interface InvoicePayment {
  id: string;
  date: string;
  amount: number;
  paymentMethod: "M-Pesa" | "Bank Transfer" | "Cash" | "Cheque" | "Other";
  reference?: string;
  notes?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  documentType: DocumentType;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress?: string;

  // Invoice Details
  issueDate: string;
  dueDate: string;
  paymentTerms: PaymentTerms;
  customPaymentTerms?: string;

  // Line Items
  lineItems: InvoiceLineItem[];

  // Financial Details
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  discountType: "percentage" | "fixed";
  total: number;
  amountPaid: number;
  balance: number;

  // Status
  status: InvoiceStatus;

  // Linked Entities
  eventId?: string;
  eventName?: string;
  expenseId?: string;

  // Payment Tracking
  payments: InvoicePayment[];

  // Additional Info
  notes?: string;
  terms?: string;
  footer?: string;

  // Metadata
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  paidAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  isDuplicate?: boolean;
  duplicatedFrom?: string;
  convertedFrom?: string; // Quote ID that was converted to Invoice/Proforma
  convertedTo?: string; // Invoice/Proforma ID if this Quote was converted
  companyId?: string; // Company isolation - invoices belong to specific companies

  // Currency
  currency: string;
}
