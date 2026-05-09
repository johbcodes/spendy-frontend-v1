/**
 * API Service Layer
 *
 * This file provides a clean abstraction for all backend API calls.
 * Currently uses localStorage, but can be easily swapped to fetch() calls.
 *
 * BACKEND INTEGRATION GUIDE:
 * 1. Replace localStorage calls with fetch/axios
 * 2. Add error handling and retry logic
 * 3. Add authentication headers
 * 4. Implement proper error responses
 */

import {
  User, Event, Wallet, Expense, Payment, Request, Supplier,
  InventoryItem, SystemNotification, SystemData, Transaction,
  InventoryMovement, ActivityLog, Client, Category, CategoryType
} from '../types';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const USE_LOCAL_STORAGE = false; // Set to false when backend is ready

/**
 * Generic API request handler
 * Replace this with actual fetch/axios when backend is ready
 */
async function apiRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any
): Promise<T> {
  if (USE_LOCAL_STORAGE) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // For now, return data as-is for localStorage compatibility
    return data as T;
  }

  // Future backend implementation:
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: data ? JSON.stringify(data) : undefined
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  const result = await response.json();

  // Backend returns data in format: { success: true, data: ... }
  // Extract the actual data from the response
  return result.data !== undefined ? result.data : result;
}

// ============================================================================
// AUTHENTICATION API
// ============================================================================

export const authAPI = {
  /**
   * Sign in user
   * Backend endpoint: POST /api/auth/login
   */
  async signIn(email: string, password: string): Promise<{ user: User; token: string }> {
    if (USE_LOCAL_STORAGE) {
      const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(u => u.email === email && u.password === password);

      if (!user) {
        throw new Error('Invalid credentials');
      }

      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('isAuthenticated', 'true');

      return { user, token: 'local-storage-token' };
    }

    return apiRequest('/auth/login', 'POST', { email, password });
  },

  /**
   * Sign up new user
   * Backend endpoint: POST /api/auth/register
   */
  async signUp(userData: Partial<User>): Promise<{ user: User; token: string }> {
    if (USE_LOCAL_STORAGE) {
      const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
      const newUser: User = {
        ...userData,
        id: `user-${Date.now()}`,
        createdAt: new Date().toISOString()
      } as User;

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      localStorage.setItem('isAuthenticated', 'true');

      return { user: newUser, token: 'local-storage-token' };
    }

    return apiRequest('/auth/register', 'POST', userData);
  },

  /**
   * Sign out user
   * Backend endpoint: POST /api/auth/logout
   */
  async signOut(): Promise<void> {
    if (USE_LOCAL_STORAGE) {
      localStorage.removeItem('currentUser');
      localStorage.setItem('isAuthenticated', 'false');
      return;
    }

    return apiRequest('/auth/logout', 'POST');
  },

  /**
   * Get current user
   * Backend endpoint: GET /api/auth/me
   */
  async getCurrentUser(): Promise<User | null> {
    if (USE_LOCAL_STORAGE) {
      const userStr = localStorage.getItem('currentUser');
      return userStr ? JSON.parse(userStr) : null;
    }

    return apiRequest('/auth/me');
  }
};

// ============================================================================
// EVENTS API
// ============================================================================

export const eventsAPI = {
  /**
   * Get all events
   * Backend endpoint: GET /api/events
   */
  async getAll(): Promise<Event[]> {
    if (USE_LOCAL_STORAGE) {
      return JSON.parse(localStorage.getItem('spendy_events') || '[]');
    }
    return apiRequest('/events');
  },

  /**
   * Get event by ID
   * Backend endpoint: GET /api/events/:id
   */
  async getById(id: string): Promise<Event | null> {
    if (USE_LOCAL_STORAGE) {
      const events: Event[] = JSON.parse(localStorage.getItem('spendy_events') || '[]');
      return events.find(e => e.id === id) || null;
    }
    return apiRequest(`/events/${id}`);
  },

  /**
   * Create new event
   * Backend endpoint: POST /api/events
   */
  async create(eventData: Partial<Event>): Promise<Event> {
    if (USE_LOCAL_STORAGE) {
      const events: Event[] = JSON.parse(localStorage.getItem('spendy_events') || '[]');
      const newEvent: Event = {
        ...eventData,
        id: `event-${Date.now()}`,
        createdAt: new Date().toISOString()
      } as Event;

      events.push(newEvent);
      localStorage.setItem('spendy_events', JSON.stringify(events));
      return newEvent;
    }

    return apiRequest('/events', 'POST', eventData);
  },

  /**
   * Update event
   * Backend endpoint: PUT /api/events/:id
   */
  async update(id: string, eventData: Partial<Event>): Promise<Event> {
    if (USE_LOCAL_STORAGE) {
      const events: Event[] = JSON.parse(localStorage.getItem('spendy_events') || '[]');
      const index = events.findIndex(e => e.id === id);

      if (index === -1) {
        throw new Error('Event not found');
      }

      events[index] = { ...events[index], ...eventData };
      localStorage.setItem('spendy_events', JSON.stringify(events));
      return events[index];
    }

    return apiRequest(`/events/${id}`, 'PUT', eventData);
  },

  /**
   * Delete event
   * Backend endpoint: DELETE /api/events/:id
   */
  async delete(id: string): Promise<void> {
    if (USE_LOCAL_STORAGE) {
      const events: Event[] = JSON.parse(localStorage.getItem('spendy_events') || '[]');
      const filtered = events.filter(e => e.id !== id);
      localStorage.setItem('spendy_events', JSON.stringify(filtered));
      return;
    }

    return apiRequest(`/events/${id}`, 'DELETE');
  }
};

// ============================================================================
// WALLETS API
// ============================================================================

export const walletsAPI = {
  async getAll(): Promise<Wallet[]> {
    if (USE_LOCAL_STORAGE) {
      const currentUser = await authAPI.getCurrentUser();
      const allWallets: Wallet[] = JSON.parse(localStorage.getItem('spendy_wallets') || '[]');

      // Filter wallets by company - only show wallets from the current user's company
      if (currentUser && currentUser.companyName) {
        return allWallets.filter(wallet => {
          // If wallet has no companyId (legacy data), skip it for now
          if (!wallet.companyId) return false;
          return wallet.companyId === currentUser.companyName;
        });
      }

      return allWallets;
    }
    return apiRequest('/wallets');
  },

  async create(walletData: Partial<Wallet>): Promise<Wallet> {
    if (USE_LOCAL_STORAGE) {
      const currentUser = await authAPI.getCurrentUser();
      const wallets: Wallet[] = JSON.parse(localStorage.getItem('spendy_wallets') || '[]');

      // Use company name as the unique identifier
      const companyId = currentUser?.companyName || 'default';

      const newWallet: Wallet = {
        ...walletData,
        id: `wallet-${Date.now()}`,
        createdAt: new Date().toISOString(),
        companyId: companyId // Associate wallet with user's company
      } as Wallet;

      wallets.push(newWallet);
      localStorage.setItem('spendy_wallets', JSON.stringify(wallets));
      return newWallet;
    }

    return apiRequest('/wallets', 'POST', walletData);
  },

  async update(id: string, walletData: Partial<Wallet>): Promise<Wallet> {
    if (USE_LOCAL_STORAGE) {
      const wallets: Wallet[] = JSON.parse(localStorage.getItem('spendy_wallets') || '[]');
      const index = wallets.findIndex(w => w.id === id);

      if (index === -1) {
        throw new Error('Wallet not found');
      }

      wallets[index] = { ...wallets[index], ...walletData };
      localStorage.setItem('spendy_wallets', JSON.stringify(wallets));
      return wallets[index];
    }

    return apiRequest(`/wallets/${id}`, 'PUT', walletData);
  }
};

// ============================================================================
// EXPENSES API
// ============================================================================

export const expensesAPI = {
  async getAll(): Promise<Expense[]> {
    if (USE_LOCAL_STORAGE) {
      return JSON.parse(localStorage.getItem('spendy_expenses') || '[]');
    }
    return apiRequest('/expenses');
  },

  async create(expenseData: Partial<Expense>): Promise<Expense> {
    if (USE_LOCAL_STORAGE) {
      const expenses: Expense[] = JSON.parse(localStorage.getItem('spendy_expenses') || '[]');
      const newExpense: Expense = {
        ...expenseData,
        id: `expense-${Date.now()}`,
        createdAt: new Date().toISOString()
      } as Expense;

      expenses.push(newExpense);
      localStorage.setItem('spendy_expenses', JSON.stringify(expenses));
      return newExpense;
    }

    return apiRequest('/expenses', 'POST', expenseData);
  },

  async update(id: string, expenseData: Partial<Expense>): Promise<Expense> {
    if (USE_LOCAL_STORAGE) {
      const expenses: Expense[] = JSON.parse(localStorage.getItem('spendy_expenses') || '[]');
      const index = expenses.findIndex(e => e.id === id);

      if (index === -1) {
        throw new Error('Expense not found');
      }

      expenses[index] = { ...expenses[index], ...expenseData };
      localStorage.setItem('spendy_expenses', JSON.stringify(expenses));
      return expenses[index];
    }

    return apiRequest(`/expenses/${id}`, 'PUT', expenseData);
  }
};

// ============================================================================
// PAYMENTS API
// ============================================================================

export const paymentsAPI = {
  async getAll(): Promise<Payment[]> {
    if (USE_LOCAL_STORAGE) {
      return JSON.parse(localStorage.getItem('spendy_payments') || '[]');
    }
    return apiRequest('/payments');
  },

  async create(paymentData: Partial<Payment>): Promise<Payment> {
    if (USE_LOCAL_STORAGE) {
      const payments: Payment[] = JSON.parse(localStorage.getItem('spendy_payments') || '[]');
      const newPayment: Payment = {
        ...paymentData,
        id: `payment-${Date.now()}`,
        createdAt: new Date().toISOString()
      } as Payment;

      payments.push(newPayment);
      localStorage.setItem('spendy_payments', JSON.stringify(payments));
      return newPayment;
    }

    return apiRequest('/payments', 'POST', paymentData);
  }
};

// ============================================================================
// REQUESTS API (Approvals)
// ============================================================================

export const requestsAPI = {
  async getAll(): Promise<Request[]> {
    if (USE_LOCAL_STORAGE) {
      return JSON.parse(localStorage.getItem('spendy_requests') || '[]');
    }
    return apiRequest('/requests');
  },

  async create(requestData: Partial<Request>): Promise<Request> {
    if (USE_LOCAL_STORAGE) {
      const requests: Request[] = JSON.parse(localStorage.getItem('spendy_requests') || '[]');
      const newRequest: Request = {
        ...requestData,
        id: `request-${Date.now()}`,
        dateRequested: new Date().toISOString()
      } as Request;

      requests.push(newRequest);
      localStorage.setItem('spendy_requests', JSON.stringify(requests));
      return newRequest;
    }

    return apiRequest('/requests', 'POST', requestData);
  },

  async update(id: string, requestData: Partial<Request>): Promise<Request> {
    if (USE_LOCAL_STORAGE) {
      const requests: Request[] = JSON.parse(localStorage.getItem('spendy_requests') || '[]');
      const index = requests.findIndex(r => r.id === id);

      if (index === -1) {
        throw new Error('Request not found');
      }

      requests[index] = { ...requests[index], ...requestData };
      localStorage.setItem('spendy_requests', JSON.stringify(requests));
      return requests[index];
    }

    return apiRequest(`/requests/${id}`, 'PUT', requestData);
  }
};

// ============================================================================
// SUPPLIERS API
// ============================================================================

export const suppliersAPI = {
  async getAll(): Promise<Supplier[]> {
    if (USE_LOCAL_STORAGE) {
      return JSON.parse(localStorage.getItem('spendy_suppliers') || '[]');
    }
    return apiRequest('/suppliers');
  },

  async create(supplierData: Partial<Supplier>): Promise<Supplier> {
    if (USE_LOCAL_STORAGE) {
      const suppliers: Supplier[] = JSON.parse(localStorage.getItem('spendy_suppliers') || '[]');
      const newSupplier: Supplier = {
        ...supplierData,
        id: `supplier-${Date.now()}`,
        createdAt: new Date().toISOString()
      } as Supplier;

      suppliers.push(newSupplier);
      localStorage.setItem('spendy_suppliers', JSON.stringify(suppliers));
      return newSupplier;
    }

    return apiRequest('/suppliers', 'POST', supplierData);
  },

  async delete(id: string): Promise<void> {
    if (USE_LOCAL_STORAGE) {
      const suppliers: Supplier[] = JSON.parse(localStorage.getItem('spendy_suppliers') || '[]');
      const filtered = suppliers.filter(s => s.id !== id);
      localStorage.setItem('spendy_suppliers', JSON.stringify(filtered));
      return;
    }

    return apiRequest(`/suppliers/${id}`, 'DELETE');
  }
};

// ============================================================================
// INVENTORY API
// ============================================================================

export const inventoryAPI = {
  async getAll(): Promise<InventoryItem[]> {
    if (USE_LOCAL_STORAGE) {
      return JSON.parse(localStorage.getItem('spendy_inventory') || '[]');
    }
    return apiRequest('/inventory');
  },

  async create(itemData: Partial<InventoryItem>): Promise<InventoryItem> {
    if (USE_LOCAL_STORAGE) {
      const inventory: InventoryItem[] = JSON.parse(localStorage.getItem('spendy_inventory') || '[]');
      const newItem: InventoryItem = {
        ...itemData,
        id: `inventory-${Date.now()}`,
        createdAt: new Date().toISOString()
      } as InventoryItem;

      inventory.push(newItem);
      localStorage.setItem('spendy_inventory', JSON.stringify(inventory));
      return newItem;
    }

    return apiRequest('/inventory', 'POST', itemData);
  },

  async update(id: string, itemData: Partial<InventoryItem>): Promise<InventoryItem> {
    if (USE_LOCAL_STORAGE) {
      const inventory: InventoryItem[] = JSON.parse(localStorage.getItem('spendy_inventory') || '[]');
      const index = inventory.findIndex(i => i.id === id);

      if (index === -1) {
        throw new Error('Inventory item not found');
      }

      inventory[index] = { ...inventory[index], ...itemData };
      localStorage.setItem('spendy_inventory', JSON.stringify(inventory));
      return inventory[index];
    }

    return apiRequest(`/inventory/${id}`, 'PUT', itemData);
  }
};

// ============================================================================
// NOTIFICATIONS API
// ============================================================================

export const notificationsAPI = {
  async getAll(): Promise<SystemNotification[]> {
    if (USE_LOCAL_STORAGE) {
      return JSON.parse(localStorage.getItem('spendy_notifications') || '[]');
    }
    return apiRequest('/notifications');
  },

  async create(notificationData: Partial<SystemNotification>): Promise<SystemNotification> {
    if (USE_LOCAL_STORAGE) {
      const notifications: SystemNotification[] = JSON.parse(localStorage.getItem('spendy_notifications') || '[]');
      const newNotification: SystemNotification = {
        ...notificationData,
        id: `notification-${Date.now()}`,
        timestamp: new Date().toISOString()
      } as SystemNotification;

      notifications.push(newNotification);
      localStorage.setItem('spendy_notifications', JSON.stringify(notifications));
      return newNotification;
    }

    return apiRequest('/notifications', 'POST', notificationData);
  },

  async markAsRead(id: string): Promise<void> {
    if (USE_LOCAL_STORAGE) {
      const notifications: SystemNotification[] = JSON.parse(localStorage.getItem('spendy_notifications') || '[]');
      const notification = notifications.find(n => n.id === id);

      if (notification) {
        notification.isRead = true;
        localStorage.setItem('spendy_notifications', JSON.stringify(notifications));
      }
      return;
    }

    return apiRequest(`/notifications/${id}/read`, 'PUT');
  }
};

// ============================================================================
// USERS API
// ============================================================================

export const usersAPI = {
  async getAll(): Promise<User[]> {
    if (USE_LOCAL_STORAGE) {
      return JSON.parse(localStorage.getItem('users') || '[]');
    }
    return apiRequest('/users');
  },

  async create(userData: Partial<User>): Promise<User> {
    if (USE_LOCAL_STORAGE) {
      const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
      const newUser: User = {
        ...userData,
        id: `user-${Date.now()}`,
        createdAt: new Date().toISOString()
      } as User;

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      return newUser;
    }

    return apiRequest('/users', 'POST', userData);
  },

  async update(id: string, userData: Partial<User>): Promise<User> {
    if (USE_LOCAL_STORAGE) {
      const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
      const index = users.findIndex(u => u.id === id);

      if (index === -1) {
        throw new Error('User not found');
      }

      users[index] = { ...users[index], ...userData };
      localStorage.setItem('users', JSON.stringify(users));
      return users[index];
    }

    return apiRequest(`/users/${id}`, 'PUT', userData);
  },

  async delete(id: string): Promise<void> {
    if (USE_LOCAL_STORAGE) {
      const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
      const filtered = users.filter(u => u.id !== id);
      localStorage.setItem('users', JSON.stringify(filtered));
      return;
    }

    return apiRequest(`/users/${id}`, 'DELETE');
  },

  /**
   * Lookup user by Spendy account number
   * Backend endpoint: GET /api/users/lookup/:accountNumber
   */
  async lookupByAccountNumber(accountNumber: string): Promise<User | null> {
    if (USE_LOCAL_STORAGE) {
      const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
      // Find admin user (company owner) with matching account number
      const user = users.find(u => u.isAdmin && u.spendyAccountNumber === accountNumber);
      return user || null;
    }

    return apiRequest(`/users/lookup/${accountNumber}`);
  }
};

// ============================================================================
// SYSTEM DATA API
// ============================================================================

export const systemDataAPI = {
  async get(): Promise<SystemData> {
    if (USE_LOCAL_STORAGE) {
      return JSON.parse(localStorage.getItem('spendy_systemdata') || '{}');
    }
    return apiRequest('/system-data');
  },

  async update(systemData: Partial<SystemData>): Promise<SystemData> {
    if (USE_LOCAL_STORAGE) {
      const current: SystemData = JSON.parse(localStorage.getItem('spendy_systemdata') || '{}');
      const updated = { ...current, ...systemData };
      localStorage.setItem('spendy_systemdata', JSON.stringify(updated));
      return updated;
    }

    return apiRequest('/system-data', 'PUT', systemData);
  }
};

// ============================================================================
// CLIENTS API
// ============================================================================

export const clientsAPI = {
  async getAll(): Promise<Client[]> {
    if (USE_LOCAL_STORAGE) {
      return JSON.parse(localStorage.getItem('spendy_clients') || '[]');
    }
    return apiRequest('/clients');
  },

  async getById(id: string): Promise<Client | null> {
    if (USE_LOCAL_STORAGE) {
      const clients: Client[] = JSON.parse(localStorage.getItem('spendy_clients') || '[]');
      return clients.find(c => c.id === id) || null;
    }
    return apiRequest(`/clients/${id}`);
  },

  async create(clientData: Partial<Client>): Promise<Client> {
    if (USE_LOCAL_STORAGE) {
      const clients: Client[] = JSON.parse(localStorage.getItem('spendy_clients') || '[]');
      const currentUser = await authAPI.getCurrentUser();
      const companyId = currentUser?.companyName || 'default';

      const newClient: Client = {
        ...clientData,
        id: `client-${Date.now()}`,
        companyId: companyId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: clientData.status || 'Active'
      } as Client;

      clients.push(newClient);
      localStorage.setItem('spendy_clients', JSON.stringify(clients));
      return newClient;
    }

    return apiRequest('/clients', 'POST', clientData);
  },

  async update(id: string, clientData: Partial<Client>): Promise<Client> {
    if (USE_LOCAL_STORAGE) {
      const clients: Client[] = JSON.parse(localStorage.getItem('spendy_clients') || '[]');
      const index = clients.findIndex(c => c.id === id);

      if (index === -1) {
        throw new Error('Client not found');
      }

      clients[index] = {
        ...clients[index],
        ...clientData,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('spendy_clients', JSON.stringify(clients));
      return clients[index];
    }

    return apiRequest(`/clients/${id}`, 'PUT', clientData);
  },

  async delete(id: string): Promise<void> {
    if (USE_LOCAL_STORAGE) {
      const clients: Client[] = JSON.parse(localStorage.getItem('spendy_clients') || '[]');
      const filtered = clients.filter(c => c.id !== id);
      localStorage.setItem('spendy_clients', JSON.stringify(filtered));
      return;
    }

    return apiRequest(`/clients/${id}`, 'DELETE');
  },

  async addBrand(id: string, brandName: string): Promise<Client> {
    if (USE_LOCAL_STORAGE) {
      const clients: Client[] = JSON.parse(localStorage.getItem('spendy_clients') || '[]');
      const index = clients.findIndex(c => c.id === id);

      if (index === -1) {
        throw new Error('Client not found');
      }

      const brands = clients[index].brands || [];
      if (!brands.includes(brandName)) {
        brands.push(brandName);
      }

      clients[index] = {
        ...clients[index],
        brands,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('spendy_clients', JSON.stringify(clients));
      return clients[index];
    }

    return apiRequest(`/clients/${id}/brands`, 'POST', { brandName });
  }
};

// ============================================================================
// CATEGORIES API
// ============================================================================

export const categoriesAPI = {
  async getAll(type: CategoryType): Promise<Category[]> {
    if (USE_LOCAL_STORAGE) {
      const key = `spendy_categories_${type}`;
      return JSON.parse(localStorage.getItem(key) || '[]');
    }
    return apiRequest(`/categories/${type}`);
  },

  async getById(type: CategoryType, id: string): Promise<Category | null> {
    if (USE_LOCAL_STORAGE) {
      const key = `spendy_categories_${type}`;
      const categories: Category[] = JSON.parse(localStorage.getItem(key) || '[]');
      return categories.find(c => c.id === id) || null;
    }
    return apiRequest(`/categories/${type}/${id}`);
  },

  async create(type: CategoryType, categoryData: Partial<Category>): Promise<Category> {
    if (USE_LOCAL_STORAGE) {
      const key = `spendy_categories_${type}`;
      const categories: Category[] = JSON.parse(localStorage.getItem(key) || '[]');
      const currentUser = await authAPI.getCurrentUser();
      const companyId = currentUser?.companyName || 'default';

      const newCategory: Category = {
        ...categoryData,
        id: `category-${type}-${Date.now()}`,
        companyId: companyId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as Category;

      categories.push(newCategory);
      localStorage.setItem(key, JSON.stringify(categories));
      return newCategory;
    }

    return apiRequest(`/categories/${type}`, 'POST', categoryData);
  },

  async update(type: CategoryType, id: string, categoryData: Partial<Category>): Promise<Category> {
    if (USE_LOCAL_STORAGE) {
      const key = `spendy_categories_${type}`;
      const categories: Category[] = JSON.parse(localStorage.getItem(key) || '[]');
      const index = categories.findIndex(c => c.id === id);

      if (index === -1) {
        throw new Error('Category not found');
      }

      categories[index] = {
        ...categories[index],
        ...categoryData,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(key, JSON.stringify(categories));
      return categories[index];
    }

    return apiRequest(`/categories/${type}/${id}`, 'PUT', categoryData);
  },

  async delete(type: CategoryType, id: string): Promise<void> {
    if (USE_LOCAL_STORAGE) {
      const key = `spendy_categories_${type}`;
      const categories: Category[] = JSON.parse(localStorage.getItem(key) || '[]');
      const filtered = categories.filter(c => c.id !== id);
      localStorage.setItem(key, JSON.stringify(filtered));
      return;
    }

    return apiRequest(`/categories/${type}/${id}`, 'DELETE');
  }
};

// ============================================================================
// Export all APIs
// ============================================================================

export const API = {
  auth: authAPI,
  events: eventsAPI,
  wallets: walletsAPI,
  expenses: expensesAPI,
  payments: paymentsAPI,
  requests: requestsAPI,
  suppliers: suppliersAPI,
  inventory: inventoryAPI,
  notifications: notificationsAPI,
  users: usersAPI,
  systemData: systemDataAPI,
  clients: clientsAPI,
  categories: categoriesAPI
};

export default API;
