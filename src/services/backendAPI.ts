/**
 * Backend API Integration Service
 *
 * This service provides typed methods to communicate with the Spendy backend API.
 * All endpoints match the backend API structure.
 */

import { api } from './apiClient';

// ============================================================================
// AUTHENTICATION API
// ============================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  country: string;
  companyName: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    companyId: string;
    phone?: string;
    country?: string;
    status?: string;
    modulesAssigned?: string;
    companyName?: string;
  };
  accessToken: string;
  token?: string;
  refreshToken: string;
}

export const authAPI = {
  /**
   * POST /auth/register
   * Register a new user and company
   */
  register: (data: RegisterRequest) =>
    api.post<AuthResponse>('/auth/register', data),

  /**
   * POST /auth/login
   * Login with email and password
   */
  login: (data: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', data),

  /**
   * POST /auth/logout
   * Logout current user
   */
  logout: () =>
    api.post('/auth/logout'),

  /**
   * GET /auth/me
   * Get current user info
   */
  me: () =>
    api.get('/auth/me'),
};

// ============================================================================
// WALLET API
// ============================================================================

export interface Wallet {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  status: string;
  companyId: string;
  ownerId?: string;
  createdAt: string;
  updatedAt: string;
}

export const walletAPI = {
  /**
   * GET /wallets
   * Get all wallets for the current company
   */
  getAll: () =>
    api.get<Wallet[]>('/wallets'),

  /**
   * GET /wallets/:id
   * Get single wallet by ID
   */
  getById: (id: string) =>
    api.get<Wallet>(`/wallets/${id}`),

  /**
   * POST /wallets/:id/fund
   * Add funds to a wallet
   */
  fund: (id: string, amount: number, description?: string) =>
    api.post(`/wallets/${id}/fund`, { amount, description }),

  /**
   * POST /wallets/transfer
   * Transfer funds between wallets
   */
  transfer: (fromWalletId: string, toWalletId: string, amount: number, description?: string) =>
    api.post('/wallets/transfer', { fromWalletId, toWalletId, amount, description }),
};

// ============================================================================
// USER API
// ============================================================================

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  country: string;
  role: string;
  status: string;
  modulesAssigned: string[];
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

export const userAPI = {
  /**
   * GET /users
   * Get all users in the company
   */
  getAll: () =>
    api.get<User[]>('/users'),

  /**
   * GET /users/:id
   * Get single user by ID
   */
  getById: (id: string) =>
    api.get<User>(`/users/${id}`),

  /**
   * POST /users
   * Create a new user
   */
  create: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    country: string;
    role: string;
    modulesAssigned?: string[];
  }) =>
    api.post<User>('/users', data),

  /**
   * PATCH /users/:id
   * Update user
   */
  update: (id: string, data: Partial<User>) =>
    api.patch<User>(`/users/${id}`, data),

  /**
   * DELETE /users/:id
   * Delete user
   */
  delete: (id: string) =>
    api.delete(`/users/${id}`),

  /**
   * PATCH /users/:id/status
   * Toggle user status (Active/Inactive)
   */
  toggleStatus: (id: string, status: 'Active' | 'Inactive') =>
    api.patch(`/users/${id}/status`, { status }),
};

// ============================================================================
// TRANSACTION API
// ============================================================================

export interface Transaction {
  id: string;
  type: string;
  amount: number;
  fromWalletId?: string;
  toWalletId?: string;
  description?: string;
  category?: string;
  reference?: string;
  status: string;
  invoiceId?: string;
  createdAt: string;
  updatedAt: string;
}

export const transactionAPI = {
  /**
   * GET /transactions
   * Get all transactions with optional filtering
   */
  getAll: (params?: {
    type?: string;
    walletId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }) =>
    api.get<Transaction[]>('/transactions', params),

  /**
   * GET /transactions/:id
   * Get single transaction by ID
   */
  getById: (id: string) =>
    api.get<Transaction>(`/transactions/${id}`),
};

// ============================================================================
// PRODUCT API
// ============================================================================

export interface Product {
  id: string;
  name: string;
  sku?: string;
  category?: string;
  price: number;
  cost?: number;
  stock: number;
  unit: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const productAPI = {
  /**
   * GET /products
   * Get all products
   */
  getAll: () =>
    api.get<Product[]>('/products'),

  /**
   * GET /products/:id
   * Get single product by ID
   */
  getById: (id: string) =>
    api.get<Product>(`/products/${id}`),

  /**
   * POST /products
   * Create a new product
   */
  create: (data: {
    name: string;
    sku?: string;
    category?: string;
    price: number;
    cost?: number;
    stock?: number;
    unit?: string;
  }) =>
    api.post<Product>('/products', data),

  /**
   * PATCH /products/:id
   * Update product
   */
  update: (id: string, data: Partial<Product>) =>
    api.patch<Product>(`/products/${id}`, data),

  /**
   * DELETE /products/:id
   * Delete product
   */
  delete: (id: string) =>
    api.delete(`/products/${id}`),
};

// ============================================================================
// SUPPLIER API
// ============================================================================

export interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  status: string;
  category?: string;
  contactPerson?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  servicesProvided?: string;
  amount?: number;
  event?: string;
  approvalRequired?: boolean;
  mpesaPhone?: string;
  paybillNumber?: string;
  paybillAccount?: string;
  tillNumber?: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  branchName?: string;
  swiftCode?: string;
  businessType?: string;
  kraPin?: string;
  documents?: any[];
  createdAt: string;
  updatedAt: string;
}

export const supplierAPI = {
  /**
   * GET /suppliers
   * Get all suppliers
   */
  getAll: () =>
    api.get<Supplier[]>('/suppliers'),

  /**
   * GET /suppliers/:id
   * Get single supplier by ID
   */
  getById: (id: string) =>
    api.get<Supplier>(`/suppliers/${id}`),

  /**
   * POST /suppliers
   * Create a new supplier
   */
  create: (data: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  }) =>
    api.post<Supplier>('/suppliers', data),

  /**
   * PATCH /suppliers/:id
   * Update supplier
   */
  update: (id: string, data: Partial<Supplier>) =>
    api.patch<Supplier>(`/suppliers/${id}`, data),

  /**
   * DELETE /suppliers/:id
   * Delete supplier
   */
  delete: (id: string) =>
    api.delete(`/suppliers/${id}`),
};

// ============================================================================
// INVENTORY API
// ============================================================================

export interface Inventory {
  id: string;
  name: string;
  category?: string;
  quantity: number;
  unit: string;
  location?: string;
  checkedOut: number;
  checkedIn: number;
  checkoutStatus: string;
  conditionCounts?: any;
  price?: number;
  cost?: number;
  sku?: string;
  supplier?: string;
  lastRestocked?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  companyId: string;
}

export const inventoryAPI = {
  /**
   * GET /inventory
   * Get all inventory items
   */
  getAll: () =>
    api.get<Inventory[]>('/inventory'),

  /**
   * GET /inventory/:id
   * Get single inventory item by ID
   */
  getById: (id: string) =>
    api.get<Inventory>(`/inventory/${id}`),

  /**
   * POST /inventory
   * Create a new inventory item
   */
  create: (data: {
    name: string;
    category?: string;
    quantity?: number;
    unit?: string;
    location?: string;
    price?: number;
    cost?: number;
    sku?: string;
    supplier?: string;
  }) =>
    api.post<Inventory>('/inventory', data),

  /**
   * PATCH /inventory/:id
   * Update inventory item
   */
  update: (id: string, data: Partial<Inventory>) =>
    api.patch<Inventory>(`/inventory/${id}`, data),

  /**
   * DELETE /inventory/:id
   * Delete inventory item
   */
  delete: (id: string) =>
    api.delete(`/inventory/${id}`),
};

// ============================================================================
// INVOICE API
// ============================================================================

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName?: string;
  supplierName?: string;
  supplierId?: string;
  totalAmount: number;
  paidAmount: number;
  status: string;
  issueDate: string;
  dueDate?: string;
  items: InvoiceItem[];
  notes?: string;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
}

export const invoiceAPI = {
  /**
   * GET /invoices
   * Get all invoices with optional filtering
   */
  getAll: (params?: {
    status?: string;
    supplierId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }) =>
    api.get<Invoice[]>('/invoices', params),

  /**
   * GET /invoices/:id
   * Get single invoice by ID
   */
  getById: (id: string) =>
    api.get<Invoice>(`/invoices/${id}`),

  /**
   * POST /invoices
   * Create a new invoice (supports both simple and full invoice structure)
   */
  create: (data: any) =>
    api.post<Invoice>('/invoices', data),

  /**
   * PATCH /invoices/:id
   * Update invoice
   */
  update: (id: string, data: Partial<Invoice>) =>
    api.patch<Invoice>(`/invoices/${id}`, data),

  /**
   * DELETE /invoices/:id
   * Delete invoice
   */
  delete: (id: string) =>
    api.delete(`/invoices/${id}`),

  /**
   * POST /invoices/:id/payment
   * Record a payment for an invoice
   */
  recordPayment: (id: string, data: {
    amount: number;
    paymentMethod: string;
    walletId: string;
    notes?: string;
  }) =>
    api.post(`/invoices/${id}/payment`, data),
};

// ============================================================================
// ACTIVITY LOG API
// ============================================================================

export interface ActivityLog {
  id: string;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: string;
  createdAt: string;
}

export const activityLogAPI = {
  /**
   * GET /activity-logs
   * Get activity logs with pagination
   */
  getAll: (params?: {
    limit?: number;
    offset?: number;
  }) =>
    api.get<ActivityLog[]>('/activity-logs', params),
};

// ============================================================================
// EVENT API
// ============================================================================

export interface Event {
  id: string;
  name: string;
  type: string;
  category?: string;
  client?: string;
  brand?: string;
  projectLead?: string;
  budget: number;
  spent: number;
  startDate: string;
  endDate?: string;
  status: string;
  location?: string;
  documents?: Array<{
    name: string;
    url: string;
    type?: string;
  }>;
  companyId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export const eventAPI = {
  /**
   * GET /events
   * Get all events with optional filters
   */
  getAll: (params?: {
    status?: string;
    type?: string;
    client?: string;
  }) =>
    api.get<Event[]>('/events', params),

  /**
   * GET /events/:id
   * Get event by ID
   */
  getById: (id: string) =>
    api.get<Event>(`/events/${id}`),

  /**
   * POST /events
   * Create a new event
   */
  create: (data: {
    name: string;
    type: string;
    category?: string;
    client?: string;
    brand?: string;
    projectLead?: string;
    budget?: number;
    spent?: number;
    startDate: string;
    endDate?: string;
    status?: string;
    location?: string;
    documents?: Array<{ name: string; url: string; type?: string }>;
  }) =>
    api.post<Event>('/events', data),

  /**
   * PATCH /events/:id
   * Update an event
   */
  update: (id: string, data: Partial<Event>) =>
    api.patch<Event>(`/events/${id}`, data),

  /**
   * DELETE /events/:id
   * Delete an event
   */
  delete: (id: string) =>
    api.delete(`/events/${id}`),

  /**
   * GET /events/:id/stats
   * Get event statistics
   */
  getStats: (id: string) =>
    api.get(`/events/${id}/stats`),
};

// ============================================================================
// EXPENSE API
// ============================================================================

export interface Expense {
  id: string;
  title: string;
  eventId?: string;
  eventName?: string;
  walletId?: string;
  category?: string;
  client?: string;
  amount: number;
  budget?: number;
  supplier?: string;
  startDate?: string;
  dueDate?: string;
  status: string;
  needsApproval: boolean;
  description?: string;
  receipt?: string;
  batchPaymentDetails?: any;
  companyId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export const expenseAPI = {
  /**
   * GET /expenses
   * Get all expenses with optional filters
   */
  getAll: (params?: {
    status?: string;
    eventId?: string;
    category?: string;
    needsApproval?: string;
  }) =>
    api.get<Expense[]>('/expenses', params),

  /**
   * GET /expenses/:id
   * Get expense by ID
   */
  getById: (id: string) =>
    api.get<Expense>(`/expenses/${id}`),

  /**
   * GET /expenses/event/:eventId
   * Get expenses by event
   */
  getByEvent: (eventId: string) =>
    api.get<Expense[]>(`/expenses/event/${eventId}`),

  /**
   * POST /expenses
   * Create a new expense
   */
  create: (data: {
    title: string;
    eventId?: string;
    eventName?: string;
    walletId?: string;
    category?: string;
    client?: string;
    amount: number;
    budget?: number;
    supplier?: string;
    startDate?: string;
    dueDate?: string;
    status?: string;
    needsApproval?: boolean;
    description?: string;
    receipt?: string;
    batchPaymentDetails?: any;
  }) =>
    api.post<Expense>('/expenses', data),

  /**
   * PATCH /expenses/:id
   * Update an expense
   */
  update: (id: string, data: Partial<Expense>) =>
    api.patch<Expense>(`/expenses/${id}`, data),

  /**
   * DELETE /expenses/:id
   * Delete an expense
   */
  delete: (id: string) =>
    api.delete(`/expenses/${id}`),

  /**
   * POST /expenses/:id/approve
   * Approve or reject an expense
   */
  approve: (id: string, data: {
    status: 'Approved' | 'Rejected';
    notes?: string;
    walletId?: string;
  }) =>
    api.post<Expense>(`/expenses/${id}/approve`, data),

  /**
   * POST /expenses/:id/pay
   * Pay an expense
   */
  pay: (id: string, data: {
    walletId: string;
    paymentMethod?: string;
    notes?: string;
  }) =>
    api.post(`/expenses/${id}/pay`, data),
};

// ============================================================================
// CATEGORY API
// ============================================================================

export interface Category {
  id: string;
  name: string;
  description?: string;
  status: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export const categoryAPI = {
  /**
   * GET /categories/:type
   * Get all categories of a specific type
   */
  getAll: (type: string) =>
    api.get<Category[]>(`/categories/${type}`),

  /**
   * GET /categories/:type/:id
   * Get category by ID
   */
  getById: (type: string, id: string) =>
    api.get<Category>(`/categories/${type}/${id}`),

  /**
   * POST /categories/:type
   * Create a new category
   */
  create: (type: string, data: { name: string; description?: string }) =>
    api.post<Category>(`/categories/${type}`, data),

  /**
   * PATCH /categories/:type/:id
   * Update a category
   */
  update: (type: string, id: string, data: Partial<Category>) =>
    api.patch<Category>(`/categories/${type}/${id}`, data),

  /**
   * DELETE /categories/:type/:id
   * Delete a category
   */
  delete: (type: string, id: string) =>
    api.delete(`/categories/${type}/${id}`),
};

// Export all APIs
export default {
  auth: authAPI,
  wallet: walletAPI,
  user: userAPI,
  transaction: transactionAPI,
  product: productAPI,
  supplier: supplierAPI,
  invoice: invoiceAPI,
  activityLog: activityLogAPI,
  event: eventAPI,
  expense: expenseAPI,
  category: categoryAPI,
};
